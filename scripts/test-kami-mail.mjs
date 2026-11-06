import test from 'node:test';
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import fs from 'node:fs';
import {sendKamiMail} from '../functions/_lib/kami-mail.js';
import {onRequestPost} from '../functions/api/kami.js';

function setup() {
  const sql = new DatabaseSync(':memory:');
  sql.exec(fs.readFileSync(new URL('./kami-mail-schema.sql',import.meta.url),'utf8'));
  const env = {ZOHO_CLIENT_ID:'test',ZOHO_CLIENT_SECRET:'test',ZOHO_REFRESH_TOKEN:'test',ZOHO_ACCOUNT_ID:'test',KAMI_MAIL_DB:{
    prepare(query) {return {bind(...args) {return {async run() {return {meta:{changes:Number(sql.prepare(query).run(...args).changes)}};},async first() {return sql.prepare(query).get(...args)||null;}};}};}
  }};
  const payload = {name:'QA',email:'qa@example.com',subject:'Test',message:'A real project question',approved:true,submissionId:crypto.randomUUID()};
  const request = new Request('https://itbonsai.pl/api/kami',{headers:{'CF-Connecting-IP':'192.0.2.1'}});
  const calls=[];
  const provider=async(url,options)=>{
    if(url.includes('/oauth/'))return Response.json({access_token:'synthetic'});
    calls.push(JSON.parse(options.body));
    return new Response('{"status":{"code":200},"data":{"messageId":1793969616231014200}}');
  };
  return {sql,env,payload,request,provider,calls};
}
test('fixed recipient, plaintext content, precise provider ID, duplicate and changed request', async()=>{
  const x=setup();
  assert.equal((await sendKamiMail(x.payload,x.request,x.env,x.provider)).status,200);
  assert.equal((await sendKamiMail(x.payload,x.request,x.env,x.provider)).status,200);
  assert.equal(x.calls.length,1);
  assert.equal(x.calls[0].toAddress,'studio@itbonsai.pl');
  assert.equal(x.calls[0].fromAddress,'studio@itbonsai.pl');
  assert.equal(x.calls[0].mailFormat,'plaintext');
  assert.match(x.calls[0].content,/qa@example.com/);
  assert.equal(x.sql.prepare('SELECT provider_id FROM kami_mail').get().provider_id,'1793969616231014200');
  assert.equal((await sendKamiMail({...x.payload,message:'Changed'},x.request,x.env,x.provider)).status,409);
  assert.equal(x.calls.length,1);
});
test('reject missing approval, spam trap, recipient override and header injection before provider',async()=>{
  const x=setup();
  for(const patch of [{approved:false},{website:'spam'},{to:'victim@example.com'},{subject:'hello\r\nbcc: victim@example.com'},{message:'x'.repeat(4001)}]){
    assert.equal((await sendKamiMail({...x.payload,...patch},x.request,x.env,x.provider)).status,400);
  }
  assert.equal(x.calls.length,0);
});
test('durable 3 per 10 minute quota; retries do not consume quota or resend',async()=>{
  const x=setup();
  for(let i=0;i<3;i++) assert.equal((await sendKamiMail({...x.payload,submissionId:crypto.randomUUID()},x.request,x.env,x.provider)).status,200);
  assert.equal((await sendKamiMail(x.payload,x.request,x.env,x.provider)).status,429);
  assert.equal(x.calls.length,3);
});
test('ambiguous provider timeout never automatically resends',async()=>{
  const x=setup();let attempts=0;
  const timeout=async(url,options)=>{if(url.includes('/oauth/'))return x.provider(url,options);attempts++;throw Error('Timeout');};
  assert.equal((await sendKamiMail(x.payload,x.request,x.env,timeout)).status,202);
  assert.equal((await sendKamiMail(x.payload,x.request,x.env,timeout)).status,202);
  assert.equal(attempts,1);
  assert.equal(x.sql.prepare('SELECT status FROM kami_mail').get().status,'unknown');
});
test('authorization failure is retryable and sends nothing',async()=>{
  const x=setup();
  const response=await sendKamiMail(x.payload,x.request,x.env,async()=>Response.json({error:'invalid_grant'}));
  assert.equal(response.status,503);
  assert.equal((await response.json()).retryable,true);
  assert.equal(x.sql.prepare('SELECT status FROM kami_mail').get().status,'failed');
});
test('Contact service is preserved in subject, labelled separately and deduplicated',async()=>{
  const x=setup();
  const payload={...x.payload,source:'contact',subject:'SEO i widoczność'};
  assert.equal((await sendKamiMail(payload,x.request,x.env,x.provider)).status,200);
  assert.equal((await sendKamiMail(payload,x.request,x.env,x.provider)).status,200);
  assert.match(x.calls[0].subject,/^\[Kontakt\] SEO i widoczność/);
  assert.equal(x.calls.length,1);
  assert.equal((await sendKamiMail({...payload,source:undefined},x.request,x.env,x.provider)).status,409);
});
test('global daily cap bounds distributed abuse',async()=>{
  const x=setup();
  for(let i=0;i<100;i++)x.sql.prepare('INSERT INTO kami_mail VALUES (?,?,?,?,?,NULL)').run(String(i),'test','other-ip',Date.now(),'sent');
  assert.equal((await sendKamiMail(x.payload,x.request,x.env,x.provider)).status,429);
  assert.equal(x.calls.length,0);
});
test('HTTP entry point rejects foreign origin and oversized body without Content-Length',async()=>{
  const req = (origin,body) => new Request('https://itbonsai.pl/api/kami',{method:'POST',headers:{Origin:origin,Referer:origin+'/'},body});
  assert.equal((await onRequestPost({request:req('https://other.example','{}'),env:{}})).status,403);
  assert.equal((await onRequestPost({request:req('https://itbonsai.pl',' '.repeat(20001)),env:{}})).status,413);
});
