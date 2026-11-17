import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {DatabaseSync} from 'node:sqlite';
import {runInNewContext} from 'node:vm';
const source=readFileSync(new URL('../functions/api/pageviews.js',import.meta.url),'utf8');
const {onRequest}=await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));
function fixture(){
 const db=new DatabaseSync(':memory:');db.exec(readFileSync(new URL('../scripts/pageviews-schema.sql',import.meta.url),'utf8'));
 const env={KAMI_MAIL_DB:{prepare:sql=>({first:async()=>db.prepare(sql).get()})}};
 const call=(method='GET',headers={},url='https://itbonsai.pl/api/pageviews')=>onRequest({env,request:new Request(url,{method,headers})});
 return {db,call};
}
const headers={Origin:'https://itbonsai.pl','Sec-Fetch-Site':'same-origin','X-Bonsai-View':'1','User-Agent':'Mozilla/5.0'};
test('zero baseline, exact increments, reads do not count, schema rerun never resets history',async()=>{
 const {db,call}=fixture();assert.equal((await (await call()).json()).total,0);
 for(let i=1;i<=5;i++)assert.equal((await (await call('POST',headers)).json()).total,i);
 db.exec(readFileSync(new URL('../scripts/pageviews-schema.sql',import.meta.url),'utf8'));
 assert.equal((await (await call()).json()).total,5);db.close();
});
test('foreign requests, previews, known robots and unsupported methods cannot increment',async()=>{
 const {db,call}=fixture();
 for(const r of [await call('POST'),await call('POST',{...headers,Origin:'https://other.example'}),await call('POST',{...headers,'User-Agent':'Googlebot'}),await call('POST',headers,'https://preview.itbonsai.pages.dev/api/pageviews')])assert.equal(r.status,403);
 assert.equal((await call('PUT')).status,405);assert.equal((await (await call()).json()).total,0);db.close();
});
test('database outage gives no invented number',async()=>{const r=await onRequest({request:new Request('https://itbonsai.pl/api/pageviews'),env:{}});assert.equal(r.status,503);assert.equal((await r.json()).total,undefined);});
test('frontend never counts preview and counts visible production document at most once',async()=>{
 const js=readFileSync(new URL('../pageviews.js',import.meta.url),'utf8');
 for(const hostname of ['localhost','preview.itbonsai.pages.dev','itbonsai.pl']){
  const calls=[],events={},timers=new Map();let i=0;
  const doc={readyState:'complete',visibilityState:'visible',documentElement:{lang:'pl'},querySelector:()=>null,addEventListener:(k,f)=>events[k]=f};
  runInNewContext(js,{document:doc,location:{hostname},fetch:async(_,opts)=>{calls.push(opts.method);return {ok:false}},setTimeout:f=>{timers.set(++i,f);return i},clearTimeout:id=>timers.delete(id),MutationObserver:class{observe(){}},Intl,Date,Number});
  if(hostname!=='itbonsai.pl'){assert.equal(calls.length,0);continue;}
  assert.deepEqual(calls,['GET']);doc.visibilityState='hidden';events.visibilitychange();assert.equal(timers.size,0);
  doc.visibilityState='visible';events.visibilitychange();for(const f of timers.values())f();events.visibilitychange();assert.deepEqual(calls,['GET','POST']);
 }
});
