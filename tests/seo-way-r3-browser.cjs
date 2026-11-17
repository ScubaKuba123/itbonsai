'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const http=require('node:http');
const {chromium}=require('playwright');
const root=path.resolve(__dirname,'..');
const out=path.join(root,'artifacts','seo-r3-browser');
fs.mkdirSync(out,{recursive:true});
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml'};
const server=http.createServer((req,res)=>{
 let uri;try{uri=decodeURIComponent(new URL(req.url,'http://localhost').pathname)}catch{res.writeHead(400);res.end();return}
 let file=path.resolve(root,'.'+uri);
 if(!file.startsWith(root+path.sep)&&file!==root){res.writeHead(403);res.end();return;}
 if(file===root)file=path.join(root,'index.html');
 if(!path.extname(file)&&fs.existsSync(file+'.html'))file+='.html';
 let status=200;
 if(!fs.existsSync(file)||!fs.statSync(file).isFile()){file=path.join(root,'404.html');status=404}
 res.writeHead(status,{'Content-Type':mime[path.extname(file)]||'application/octet-stream'});
 fs.createReadStream(file).pipe(res);
});
async function completeForm(page) {
 await page.locator('form.contact-form input[name="name"]').fill('R3 QA test');
 await page.locator('form.contact-form input[name="email"]').fill('qa@example.invalid');
 await page.locator('form.contact-form select[name="service"]').selectOption({label:'SEO i widoczność'});
 await page.locator('form.contact-form textarea[name="message"]').fill('Mock request; must not send an actual email.');
 await page.locator('form.contact-form button[type="submit"]').click();
}
async function go(){
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const base='http://127.0.0.1:'+server.address().port;
 const browser=await chromium.launch({channel:'chrome',headless:true,args:['--no-sandbox']});
 const results=[];
 try{
   for(const width of [390,1440]){
     const context=await browser.newContext({viewport:{width,height:900},locale:'pl-PL'});
     const page=await context.newPage();
     const pageErrors=[],gaRequests=[];
     page.on('pageerror',e=>pageErrors.push(String(e.message||e)));
     page.on('request',r=>{if(/googletagmanager\.com\/gtag\/js|google-analytics\.com\/g\/collect/.test(r.url()))gaRequests.push(r.url())});
     await page.route('**/fonts.googleapis.com/**',r=>r.abort());
     await page.route('**/fonts.gstatic.com/**',r=>r.abort());
     let calls=0;
     await page.addInitScript(()=>{window.__confirmedSubmissions=0;window.addEventListener('bonsai:contact-success',()=>window.__confirmedSubmissions++)});
     await page.route('**/api/kami',async route=>{
       calls++;
       await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({success:true})});
     });
     const response=await page.goto(base+'/kontakt',{waitUntil:'domcontentloaded',timeout:25000});
     assert.equal(response.status(),200);
     const consent=page.getByRole('button',{name:'Odrzuć analitykę'});
     await consent.waitFor({timeout:10000});
     await consent.click();
     assert.equal(await page.evaluate(()=>window.BonsaiPrivacy?.analyticsAllowed()),false);
     await completeForm(page);
     await page.waitForFunction(()=>document.querySelector('#contact-status')?.textContent?.includes('Dziękujemy!'),null,{timeout:15000});
     const submissions=await page.evaluate(()=>window.__confirmedSubmissions);
     assert.equal(submissions,1,'Success event should fire exactly once');
     assert.equal(calls,1,'Only one mock POST is sent');
     assert.equal(await page.locator('form.contact-form button[type="submit"]').isDisabled(),true);
     assert.deepEqual(gaRequests,[],'Local QA must never contact production GA4');
     const contactGeometry=await page.evaluate(()=>{
       const phone=document.querySelector('.contact-details > a[href^="tel:"]')?.getBoundingClientRect();
       const email=document.querySelector('.contact-details > a[href^="mailto:"]')?.getBoundingClientRect();
       return {phone:phone?{top:phone.top,bottom:phone.bottom}:null,email:email?{top:email.top,bottom:email.bottom}:null};
     });
     assert.ok(contactGeometry.phone&&contactGeometry.email,'Contact links must be present');
     assert.ok(contactGeometry.email.top>=contactGeometry.phone.bottom-1,'Phone and e-mail overlap on '+width+'px');
     const overflow=await page.evaluate(()=>Math.max(0,document.documentElement.scrollWidth-innerWidth));
     assert.ok(overflow<=2,'Contact form overflow '+width);
     assert.deepEqual(pageErrors,[],'Contact page errors '+width);
     await page.screenshot({path:path.join(out,'contact-success-'+width+'.png'),fullPage:true,animations:'disabled'});
     results.push({page:'contact',width,sendMode:'mock 200 success',successEventCount:submissions,networkRequestsToProductionGA:gaRequests.length,overflow,errors:pageErrors.length});
     await context.close();
   }
   const context=await browser.newContext({viewport:{width:390,height:844},locale:'pl-PL'});
   const page=await context.newPage();
   await page.addInitScript(()=>{window.__confirmedSubmissions=0;window.addEventListener('bonsai:contact-success',()=>window.__confirmedSubmissions++)});
   await page.route('**/api/kami',r=>r.fulfill({status:429,contentType:'application/json',body:JSON.stringify({retryable:true})}));
   await page.goto(base+'/kontakt',{waitUntil:'domcontentloaded'});
   await page.getByRole('button',{name:'Odrzuć analitykę'}).click();
   await completeForm(page);
   await page.waitForFunction(()=>document.querySelector('#contact-status')?.textContent?.includes('Zbyt wiele prób.'),null,{timeout:10000});
   assert.equal(await page.evaluate(()=>window.__confirmedSubmissions),0,'Error responses may never count as leads');
   results.push({page:'contact',sendMode:'mock 429',successEventCount:0});
   await context.close();

   fs.writeFileSync(path.join(out,'results.json'),JSON.stringify(results,null,2));
   console.log('SEO WAY R3 BROWSER QA PASS:',results.length,'scenarios');
   console.log(JSON.stringify(results));
 }finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
}
go().catch(e=>{console.error(e);process.exitCode=1});
