'use strict';
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const base='https://itbonsai.pl';
const out=path.resolve('artifacts/r2-production-browser');
fs.mkdirSync(out,{recursive:true});

const routes=[
 {path:'/strony-internetowe-dla-firm',selector:'.seo-r2-details h2',pl:'Jak wybrać zakres nowej strony?',en:'How to choose the right website scope?',ja:'新しいウェブサイトの範囲はどう決めますか？'},
 {path:'/seo-techniczne',selector:'.seo-r2-details h2',pl:'Co oznacza „odkryta, ale niezaindeksowana”?',en:'What does ‘discovered, currently not indexed’ mean?',ja:'「検出済み・インデックス未登録」とは？'},
 {path:'/automatyzacje-ai-dla-firm',selector:'.seo-r2-details h2',pl:'Przykład: od formularza do przygotowanej odpowiedzi',en:'Example: from an enquiry form to a prepared reply',ja:'例：問い合わせフォームから返信案まで'},
 {path:'/cafe-app',selector:'.seo-r2-details h3',pl:'Koncepcja projektu, nie gotowa usługa',en:'Design concept, not a launched service',ja:'公開済みサービスではなくデザインコンセプト'},
 {path:'/strony-internetowe-trojmiasto',selector:'.seo-longform-intro h2',pl:'Jedna spójna strona dla firm działających w całym Trójmieście',en:'One coherent website for businesses across the Tri-City',ja:'トリシティ全域で活動する企業のための一貫したサイト'}
];
const results=[];
(async()=>{
  const browser=await chromium.launch({channel:'chrome',headless:true,args:['--no-sandbox']});
  try {
    for(const r of routes){
      for(const width of [390,1440]){
        const context=await browser.newContext({viewport:{width,height:width===390?844:900},locale:'en-US'});
        await context.addCookies([{url:base,name:'bonsai-country',value:'US'}]);
        const page=await context.newPage();
        const pageErrors=[];
        page.on('pageerror',err=>pageErrors.push(String(err.message||err)));
        const response=await page.goto(base+r.path,{waitUntil:'domcontentloaded',timeout:30000});
        assert.equal(response.status(),200,r.path);
        await page.waitForFunction(({selector,expected})=>document.documentElement.lang==='pl'&&document.querySelector(selector)?.textContent?.trim()===expected,
          {selector:r.selector,expected:r.pl},{timeout:18000});
        const dismiss=page.getByRole('button',{name:/Odrzuć analitykę|Reject analytics|分析を拒否/i});
        if(await dismiss.count())await dismiss.first().click({timeout:5000}).catch(()=>{});
        const state=await page.evaluate(selector=>({
          lang:document.documentElement.lang,
          title:document.title,
          canonical:document.querySelector('link[rel="canonical"]')?.href,
          overflow:Math.max(0,document.documentElement.scrollWidth-window.innerWidth),
          sectionVisible:!!document.querySelector(selector)&&getComputedStyle(document.querySelector(selector)).display!=='none',
          ctaTitleColor:(()=>{const e=document.querySelector('.content-cta h2');return e?getComputedStyle(e).color:null})(),
          cssLoaded:[...document.styleSheets].some(s=>s.href?.includes('seo-way-r2.css'))
        }),r.selector);
        assert.equal(state.canonical,base+r.path,r.path+' canonical');
        assert.equal(state.lang,'pl',r.path+' geo default language');
        assert.equal(state.sectionVisible,true,r.path+' content visibility');
        assert.equal(state.cssLoaded,true,r.path+' R2 CSS not loaded');
        assert.ok(state.overflow<=2,r.path+' overflow='+state.overflow+' at '+width);
        if(state.ctaTitleColor)assert.equal(state.ctaTitleColor,'rgb(27, 71, 58)',r.path+' CTA heading contrast');
        assert.deepEqual(pageErrors,[],r.path+' pageerrors');
        await page.screenshot({path:path.join(out,r.path.slice(1)+'-'+width+'.png'),animations:'disabled',fullPage:true});
        results.push({route:r.path,width,http:200,...state,pageErrors:pageErrors.length});
        await context.close();
      }
      for(const lang of ['en','ja']){
        const context=await browser.newContext({viewport:{width:390,height:844},locale:'en-US'});
        await context.addCookies([{url:base,name:'bonsai-country',value:'US'}]);
        await context.addInitScript(lang=>localStorage.setItem('bonsai-language',lang),lang);
        const page=await context.newPage();
        const pageErrors=[];
        page.on('pageerror',e=>pageErrors.push(String(e.message||e)));
        const response=await page.goto(base+r.path,{waitUntil:'domcontentloaded',timeout:30000});
        assert.equal(response.status(),200,r.path+'/'+lang);
        await page.waitForFunction(({selector,expected,lang})=>document.documentElement.lang===lang&&document.querySelector(selector)?.textContent?.trim()===expected,
          {selector:r.selector,expected:r[lang],lang},{timeout:18000});
        const state=await page.evaluate(()=>({
          lang:document.documentElement.lang,
          canonical:document.querySelector('link[rel="canonical"]')?.href,
          overflow:Math.max(0,document.documentElement.scrollWidth-window.innerWidth)
        }));
        assert.equal(state.lang,lang,r.path);
        assert.equal(state.canonical,base+r.path,r.path+' canonical changed after locale switch');
        assert.ok(state.overflow<=2,r.path+'/'+lang+' overflow');
        assert.deepEqual(pageErrors,[],r.path+'/'+lang+' pageerrors');
        results.push({route:r.path,preference:lang,http:200,...state,pageErrors:pageErrors.length});
        await context.close();
      }
    }
    fs.writeFileSync(path.join(out,'results.json'),JSON.stringify(results,null,2));
    console.log('R2 LIVE CHROME QA PASS: '+results.length+'/20');
    console.log(JSON.stringify(results.map(({route,width,preference,lang,http,overflow,cssLoaded})=>({route,width,preference,lang,http,overflow,cssLoaded})),null,2));
  }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
