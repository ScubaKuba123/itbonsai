'use strict';
// QA-only script. NO REAL LEADS AND NO GA4 HITS: all writes are intercepted.
const {chromium}=require('playwright');
const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const base='https://itbonsai.pl';
const dir=path.join(process.cwd(),'qa-r3-evidence');
fs.mkdirSync(dir,{recursive:true});
const report=[];
async function runScenario({consent,apiStatus,width}){
  const browser=await chromium.launch({channel:'chrome',headless:true,args:['--no-sandbox']});
  try{
    const ctx=await browser.newContext({viewport:{width,height:width===390?844:900},locale:'pl-PL'});
    const blockedGA=[],mockedAPI=[],errors=[];
    // Route handlers are installed BEFORE visiting the live domain.
    await ctx.route(/(?:googletagmanager\.com|google-analytics\.com|analytics\.google\.com|doubleclick\.net)/i,route=>{
      blockedGA.push(route.request().url().split('?')[0]);
      const isJS=route.request().url().includes('/gtag/js');
      return route.fulfill({status:200,contentType:isJS?'application/javascript':'text/plain',body:''});
    });
    await ctx.route('**/api/kami',route=>{
      mockedAPI.push({method:route.request().method(),url:'/api/kami'});
      return route.fulfill({status:apiStatus,contentType:'application/json',body:JSON.stringify(apiStatus===200?{success:true}:{retryable:true})});
    });
    await ctx.addInitScript(()=>{
      window.__qaGtag=[];
      window.gtag=(...args)=>window.__qaGtag.push(args);
    });
    const page=await ctx.newPage();
    page.on('pageerror',e=>errors.push(String(e.message||e)));
    const res=await page.goto(base+'/kontakt',{waitUntil:'domcontentloaded',timeout:30000});
    assert.equal(res.status(),200,'production contact HTTP status');
    await page.locator('#privacy-dialog').waitFor({timeout:15000});
    assert.equal(await page.evaluate(()=>window.BonsaiPrivacy?.analyticsAllowed()),false,'fresh visitor must be unconsented');
    assert.equal(blockedGA.length,0,'No Google network request before consent');
    const choice=consent?'accept':'reject';
    await page.locator('#privacy-dialog [data-choice="'+choice+'"]').click();
    assert.equal(await page.evaluate(()=>window.BonsaiPrivacy?.analyticsAllowed()),consent,'consent choice must persist');
    if(consent)await page.waitForFunction(()=>window.__qaGtag.some(x=>x[0]==='config'),null,{timeout:12000});
    const contacts=[['tel:','phone'],['mailto:','email'],['https://wa.me/','whatsapp']];
    for(const [prefix] of contacts){
      await page.evaluate(prefix=>{
        const anchor=document.querySelector('.contact-details > a[href^="'+prefix+'"]');
        if(!anchor)throw Error('No link for '+prefix);
        anchor.addEventListener('click',e=>e.preventDefault(),{once:true});
        anchor.dispatchEvent(new MouseEvent('click',{bubbles:true,cancelable:true}));
      },prefix);
    }
    await page.locator('form.contact-form input[name="name"]').fill('R3 QA simulation');
    await page.locator('form.contact-form input[name="email"]').fill('qa@example.invalid');
    await page.locator('form.contact-form textarea[name="message"]').fill('Simulated only; intercepted by Playwright.');
    await page.locator('form.contact-form button[type="submit"]').click();
    const success=apiStatus===200;
    await page.waitForFunction(text=>document.querySelector('#contact-status')?.textContent?.includes(text),
      success?'Dziękujemy!':'Zbyt wiele prób.',{timeout:15000});
    assert.equal(mockedAPI.length,1,'Exactly one intercepted POST to /api/kami');
    assert.equal(mockedAPI[0].method,'POST');
    const state=await page.evaluate(()=>{
      const a=document.querySelector('.contact-details > a[href^="tel:"]').getBoundingClientRect();
      const b=document.querySelector('.contact-details > a[href^="mailto:"]').getBoundingClientRect();
      return {
        events:window.__qaGtag.filter(x=>x[0]==='event').map(x=>({name:x[1],params:x[2]})),
        analyticsAllowed:window.BonsaiPrivacy.analyticsAllowed(),
        contactGeometry:{phoneBottom:a.bottom,emailTop:b.top},
        overflow:Math.max(0,document.documentElement.scrollWidth-window.innerWidth),
        hasLeadScript:!!document.querySelector('script[src*="lead-events.js"]'),
        hasAnalyticsScript:!!document.querySelector('script[src*="analytics.js"]')
      };
    });
    assert.ok(state.hasLeadScript&&state.hasAnalyticsScript,'R3 scripts not deployed');
    assert.ok(state.contactGeometry.emailTop >= state.contactGeometry.phoneBottom-1,'Contact links overlap');
    assert.ok(state.overflow<=2,'Horizontal overflow on '+width);
    const intents=state.events.filter(x=>x.name==='contact_intent');
    const leads=state.events.filter(x=>x.name==='generate_lead');
    assert.equal(intents.length,consent?3:0,'Contact intent only with consent');
    if(consent)assert.deepEqual(intents.map(x=>x.params.contact_method),['phone','email','whatsapp']);
    assert.equal(leads.length,consent&&success?1:0,'Lead only after API confirmation and consent');
    for(const e of state.events){
      const json=JSON.stringify(e);
      for(const pii of ['qa@example.invalid','R3 QA simulation','48501476124','studio@itbonsai.pl'])assert.ok(!json.includes(pii),'PII entered analytics payload');
    }
    if(!consent)assert.equal(blockedGA.length,0,'No attempted Google request without consent');
    assert.deepEqual(errors,[],'Uncaught JavaScript errors');
    await page.screenshot({path:path.join(dir,'kontakt-'+width+'-'+choice+'-'+apiStatus+'.png'),fullPage:true,animations:'disabled'});
    const item={width,choice,apiStatus,http:res.status(),mockedAPI:mockedAPI.length,events:state.events,googleRequestsIntercepted:blockedGA.length,overflow:state.overflow,errors:errors.length,liveGoogleHits:0,realAPICalls:0};
    report.push(item);
    console.log('R3 CHROME CASE PASS',JSON.stringify(item));
    await ctx.close();
  }finally{await browser.close();}
}
(async()=>{
  for(const x of [
    {consent:false,apiStatus:200,width:390},
    {consent:false,apiStatus:200,width:1440},
    {consent:true,apiStatus:200,width:390},
    {consent:true,apiStatus:429,width:1440}
  ])await runScenario(x);
  fs.writeFileSync(path.join(dir,'chrome-report.json'),JSON.stringify(report,null,2));
  console.log('R3 LIVE CHROME QA PASS: 4/4, zero real form submissions or GA4 hits');
})().catch(e=>{console.error(e);process.exitCode=1});
