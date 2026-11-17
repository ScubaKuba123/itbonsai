'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.join(__dirname,'..');
const read=(file)=>fs.readFileSync(path.join(root,file),'utf8');
const pages=[...read('sitemap-pages.xml').matchAll(/<loc>(https:\/\/itbonsai\.pl[^<]+)<\/loc>/g)]
 .map(m=>m[1]==='https://itbonsai.pl/'?'index.html':m[1].replace('https://itbonsai.pl/','')+'.html');

test('All canonical pages use exactly one consent-aware analytics loader',()=>{
 assert.equal(pages.length,16);
 for(const page of pages){
   const html=read(page);
   const analytics=[...html.matchAll(/<script\b[^>]*\bsrc=["'][^"']*\/?analytics\.js(?:\?[^"']*)?["'][^>]*>/gi)];
   const lead=[...html.matchAll(/<script\b[^>]*\bsrc=["'][^"']*\/lead-events\.js\?v=seo-way-r3-20261117["'][^>]*>/gi)];
   assert.equal(analytics.length,1,page+' GA4 must load once');
   assert.equal(lead.length,1,page+' lead tracking must load once');
   assert.ok(html.indexOf('privacy-controls.js')<analytics[0].index,page+' privacy controls must load first');
   assert.ok(!html.includes('googletagmanager.com/gtag/js'),page+' avoid direct GA4 loading');
   assert.ok(!/on(click|submit)=/.test(lead[0][0]),page+' avoid tracking from inline HTML');
 }
 assert.ok(read('kontakt.html').includes('contact-form.js?v=seo-way-r3-20261117'));
 assert.ok(read('kontakt.html').includes('seo-way-r3.css?v=20261117'),'Mobile contact needs scoped readability CSS');
});

function fixture({hostname='itbonsai.pl',consent=false,gtag=true}={}){
 const callbacks={},calls=[];
 const win={BonsaiPrivacy:{analyticsAllowed:()=>consent}};
 if(gtag)win.gtag=(...args)=>calls.push(args);
 win.addEventListener=(type,handler)=>{callbacks['window:'+type]=handler};
 const doc={addEventListener:(type,handler)=>{callbacks['document:'+type]=handler}};
 const loc={hostname,href:'https://itbonsai.pl/'};
 vm.runInNewContext(read('lead-events.js'),{window:win,document:doc,location:loc,URL},{timeout:1000});
 const click=href=>{
   const anchor=href===null?null:{getAttribute:key=>key==='href'?href:null};
   callbacks['document:click']({target:{closest:()=>anchor}});
 };
 const success=()=>callbacks['window:bonsai:contact-success']();
 return {calls,click,success};
}
test('No GA4 events before consent, in previews, or without GA4',()=>{
 for(const options of [
   {consent:false,hostname:'itbonsai.pl'},
   {consent:true,hostname:'preview.itbonsai.pages.dev'},
   {consent:true,hostname:'localhost'},
   {consent:true,hostname:'itbonsai.pl',gtag:false}
 ]){
   const x=fixture(options);
   x.click('tel:+48501476124');
   x.click('mailto:studio@itbonsai.pl');
   x.click('https://wa.me/48501476124');
   x.success();
   assert.deepEqual(x.calls,[],JSON.stringify(options));
 }
});

test('Consent sends contact intent without PII; leads need explicit confirmed success',()=>{
 const x=fixture({consent:true});
 x.click('tel:+48501476124');
 x.click('mailto:studio@itbonsai.pl');
 x.click('https://wa.me/48501476124?text=Hello');
 x.click('https://api.whatsapp.com/send?phone=48501476124');
 x.click('https://www.facebook.com/itbonsai');
 x.click('/kontakt');
 x.click(null);
 assert.equal(x.calls.length,4);
 assert.deepEqual(x.calls.map(c=>c[0]+':'+c[1]),[
   'event:contact_intent','event:contact_intent','event:contact_intent','event:contact_intent'
 ]);
 assert.deepEqual(x.calls.map(c=>c[2].contact_method),['phone','email','whatsapp','whatsapp']);
 for(const args of x.calls){
   const str=JSON.stringify(args);
   assert.ok(!str.includes('48501476124'));
   assert.ok(!str.includes('studio@itbonsai.pl'));
   assert.ok(!str.includes('Hello'));
 }
 x.success();
 assert.equal(x.calls.length,5);
 assert.equal(x.calls[4][1],'generate_lead');
 assert.equal(x.calls[4][2].lead_source,'contact_form');
});

test('Contact form announces lead only after a true 200/success response',()=>{
 const s=read('contact-form.js');
 const success=/else if\s*\(response\.status === 200 && data\.success === true\)\s*\{([^}]*)\}/.exec(s);
 assert.ok(success,'Missing server-confirmed success branch');
 assert.ok(success[1].includes("bonsai:contact-success"),'Success needs explicit tracking event');
 assert.ok(!/generate_lead|gtag\(/.test(s),'Form logic must not call analytics directly');
 assert.ok(!/bonsai:contact-success/.test(s.slice(0,s.indexOf(success[0]))),'Premature success dispatch');
 const analytics=read('analytics.js');
 assert.ok(analytics.includes("location.hostname !== 'itbonsai.pl'"),'Block nonproduction analytics');
 assert.ok(analytics.includes('window.BonsaiPrivacy?.analyticsAllowed()'),'Analytics must require consent');
});
