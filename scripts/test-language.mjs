import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {onRequest} from '../functions/_middleware.js';
const source=fs.readFileSync(new URL('../language-preference.js',import.meta.url),'utf8');
function visit(country,saved,blocked=false){
 const context={window:{},document:{cookie:country?`session=keep; bonsai-country=${country}`:'',documentElement:{}},localStorage:{getItem(){if(blocked)throw Error('blocked');return saved;}}};
 vm.runInNewContext(source,context);
 return context.document.documentElement.lang;
}
test('first visit uses country, not browser language: PL, JP and other countries',()=>{
 for(const [country,language]of [['PL','pl'],['JP','ja'],['US','en'],['GB','en'],['DE','en'],['FR','en'],['UA','en'],['CN','en'],[undefined,'en']])assert.equal(visit(country),language);
});
test('explicit supported choice persists across country changes',()=>{
 for(const lang of ['pl','en','ja'])for(const country of ['PL','JP','US'])assert.equal(visit(country,lang),lang);
});
test('retired choices and unavailable storage fall back to geolocation',()=>{
 for(const lang of ['de','fr','es','uk','zh'])assert.equal(visit('JP',lang),'ja');
 assert.equal(visit('PL','en',true),'pl');assert.equal(visit(undefined,'en',true),'en');
});
test('Cloudflare first response supplies country before HTML bootstrap and preserves response',async()=>{
 for(const country of ['PL','JP','US']){
  const request=new Request('https://itbonsai.pl/');request.cf={country};
  const response=await onRequest({request,next:async()=>new Response('<html>ok</html>',{headers:{'X-Existing':'keep'}})});
  assert.match(response.headers.get('Set-Cookie'),new RegExp(`^bonsai-country=${country};`));
  assert.match(response.headers.get('Set-Cookie'),/SameSite=Lax; Secure/);
  assert.equal(response.headers.get('X-Existing'),'keep');assert.equal(await response.text(),'<html>ok</html>');
 }
});
test('stale country cookie updates on travel; current cookie and absent CF country do not change response',async()=>{
 const response=new Response('ok');const request=new Request('https://itbonsai.pl/',{headers:{Cookie:'bonsai-country=PL'}});request.cf={country:'JP'};
 const changed=await onRequest({request,next:async()=>response.clone()});assert.match(changed.headers.get('Set-Cookie'),/^bonsai-country=JP;/);
 request.cf={country:'PL'};assert.equal(await onRequest({request,next:async()=>response}),response);
 request.cf={};assert.equal(await onRequest({request,next:async()=>response}),response);
});
