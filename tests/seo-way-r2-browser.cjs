'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const http=require('node:http');
const {chromium}=require('playwright');
const root=path.resolve(__dirname,'..');
const output=path.join(root,'artifacts','seo-r2-browser');
fs.mkdirSync(output,{recursive:true});
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml','.avif':'image/avif'};
const server=http.createServer((req,res)=>{
  let uri;
  try{uri=decodeURIComponent(new URL(req.url,'http://localhost').pathname)}catch{res.writeHead(400);res.end();return;}
  let file=path.resolve(root,'.'+uri);
  if(!file.startsWith(root+path.sep)&&file!==root){res.writeHead(403);res.end();return;}
  if(file===root)file=path.join(root,'index.html');
  if(!path.extname(file)&&fs.existsSync(file+'.html'))file+='.html';
  let status=200;
  if(!fs.existsSync(file)||!fs.statSync(file).isFile()){file=path.join(root,'404.html');status=404;}
  res.writeHead(status,{'Content-Type':mime[path.extname(file)]||'application/octet-stream'});
  fs.createReadStream(file).pipe(res);
});
const routes=['/strony-internetowe-dla-firm','/seo-techniczne','/automatyzacje-ai-dla-firm','/cafe-app','/strony-internetowe-trojmiasto'];
const translated={
 '/strony-internetowe-dla-firm':{en:'How to choose the right website scope?',ja:'新しいウェブサイトの範囲はどう決めますか？'},
 '/seo-techniczne':{en:'What does ‘discovered, currently not indexed’ mean?',ja:'「検出済み・インデックス未登録」とは？'},
 '/automatyzacje-ai-dla-firm':{en:'Example: from an enquiry form to a prepared reply',ja:'例：問い合わせフォームから返信案まで'},
 '/cafe-app':{en:'Design concept, not a launched service',ja:'公開済みサービスではなくデザインコンセプト'},
 '/strony-internetowe-trojmiasto':{en:'One coherent website for businesses across the Tri-City',ja:'トリシティ全域で活動する企業のための一貫したサイト'}
};
const selectorFor=url=>url==='/strony-internetowe-trojmiasto'?'.seo-longform-intro h2':url==='/cafe-app'?'.seo-r2-details h3':'.seo-r2-details h2';
async function go(){
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const base='http://127.0.0.1:'+server.address().port;
  const browser=await chromium.launch({channel:'chrome',headless:true,args:['--no-sandbox']});
  const results=[];
  try{
    for(const url of routes){
      for(const [width,height] of [[390,844],[1440,900]]){
        const context=await browser.newContext({viewport:{width,height},locale:'en-US'});
        await context.addCookies([{name:'bonsai-country',value:'US',url:base}]);
        const page=await context.newPage(),errors=[];
        page.on('pageerror',e=>errors.push(String(e)));
        await page.route('**/fonts.googleapis.com/**',r=>r.abort());
        await page.route('**/fonts.gstatic.com/**',r=>r.abort());
        const response=await page.goto(base+url,{waitUntil:'domcontentloaded',timeout:30000});
        await page.waitForFunction(()=>document.documentElement.lang==='pl',{timeout:12000});
        const state=await page.evaluate(selector=>({
          lang:document.documentElement.lang,
          heading:document.querySelector(selector)?.textContent?.trim(),
          overflow:Math.max(0,document.documentElement.scrollWidth-window.innerWidth),
          canonical:document.querySelector('link[rel="canonical"]')?.href,
          ctaTitleColor:(()=>{const t=document.querySelector('.content-cta h2');return t?getComputedStyle(t).color:null})(),
          detailGridColumn:(()=>{const d=document.querySelector('.content-body > .seo-r2-details');return d?getComputedStyle(d).gridColumn:null})()
        }),selectorFor(url));
        assert.equal(response.status(),200,url);
        assert.equal(state.lang,'pl',url);
        assert.ok(state.heading,url+' missing expanded content');
        assert.equal(state.canonical,'https://itbonsai.pl'+url,url);
        if(state.ctaTitleColor)assert.equal(state.ctaTitleColor,'rgb(27, 71, 58)',url+' CTA heading contrast');
        if(state.detailGridColumn)assert.equal(state.detailGridColumn,'1 / -1',url+' R2 detail must span both grid columns');
        assert.ok(state.overflow<=2,url+' horizontal overflow at '+width+'px: '+state.overflow);
        assert.equal(errors.length,0,url+' runtime errors: '+errors.join('; '));
        const dismiss=page.getByRole('button',{name:/Odrzuć analitykę|Reject analytics|分析を拒否/i});
        if(await dismiss.count())await dismiss.first().click({timeout:7000});
        await page.screenshot({path:path.join(output,url.slice(1)+'-'+width+'.png'),animations:'disabled',fullPage:true});
        results.push({url,width,status:200,...state,errors:0});
        await context.close();
      }
      for(const lang of ['en','ja']){
        const context=await browser.newContext({viewport:{width:390,height:844},locale:'en-US'});
        await context.addCookies([{name:'bonsai-country',value:'US',url:base}]);
        await context.addInitScript(value=>localStorage.setItem('bonsai-language',value),lang);
        const page=await context.newPage(),errors=[];
        page.on('pageerror',e=>errors.push(String(e)));
        await page.route('**/fonts.googleapis.com/**',r=>r.abort());
        await page.route('**/fonts.gstatic.com/**',r=>r.abort());
        const response=await page.goto(base+url,{waitUntil:'domcontentloaded',timeout:30000});
        const expected=translated[url][lang],selector=selectorFor(url);
        await page.waitForFunction(({selector,expected,lang})=>
          document.documentElement.lang===lang &&
          document.querySelector(selector)?.textContent?.trim()===expected,
          {selector,expected,lang},{timeout:15000});
        assert.equal(response.status(),200);
        assert.equal(errors.length,0,url+' '+lang+' runtime errors: '+errors.join('; '));
        const overflow=await page.evaluate(()=>Math.max(0,document.documentElement.scrollWidth-window.innerWidth));
        assert.ok(overflow<=2,url+' '+lang+' overflow: '+overflow);
        results.push({url,lang,status:200,translated:expected,overflow,errors:0});
        await context.close();
      }
    }
    fs.writeFileSync(path.join(output,'report.json'),JSON.stringify(results,null,2));
    console.log('SEO R2 browser QA PASS:',results.length,'cases');
    console.log(JSON.stringify(results.map(({url,width,lang,overflow,errors})=>({url,width,lang,overflow,errors})),null,2));
  }finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
}
go().catch(e=>{console.error(e);process.exitCode=1;});
