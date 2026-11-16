'use strict';
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const assert = require('node:assert/strict');
const { chromium } = require('playwright');

const root = path.resolve(__dirname, '..');
const out = path.join(root, 'artifacts', 'seo-browser');
fs.mkdirSync(out, { recursive: true });
const mime = {'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml','.avif':'image/avif','.woff2':'font/woff2'};
const server = http.createServer((req,res) => {
  let uri;
  try {uri = decodeURIComponent(new URL(req.url, 'http://localhost').pathname)} catch {res.writeHead(400);res.end();return}
  let file = path.resolve(root, '.' + uri);
  if (!file.startsWith(root+path.sep) && file!==root) {res.writeHead(403);res.end();return}
  if (file===root) file=path.join(root,'index.html');
  if (!path.extname(file) && fs.existsSync(file+'.html')) file += '.html';
  let code=200;
  if (!fs.existsSync(file) || !fs.statSync(file).isFile()) {file=path.join(root,'404.html');code=404}
  res.writeHead(code, {'Content-Type':mime[path.extname(file)]||'application/octet-stream'});
  fs.createReadStream(file).pipe(res);
});

async function main() {
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const base='http://127.0.0.1:'+server.address().port;
  const browser=await chromium.launch({channel:'chrome',headless:true,args:['--no-sandbox']});
  const results=[];
  try {
    const cases=[
      ['/',390,844],['/',1440,900],
      ['/strony-internetowe-gdansk',390,844],['/strony-internetowe-gdansk',768,1024],['/strony-internetowe-gdansk',1440,900],
      ['/uslugi',390,844],['/uslugi',1440,900],['/realizacje',390,844],['/realizacje',1440,900]
    ];
    for (const [url,width,height] of cases) {
      const context=await browser.newContext({viewport:{width,height},locale:'en-US'});
      await context.addCookies([{name:'bonsai-country',value:'US',url:base}]);
      const page=await context.newPage(),errors=[];
      page.on('pageerror',error=>errors.push(String(error.stack||error)));
      await page.route('**/fonts.googleapis.com/**',r=>r.abort());
      await page.route('**/fonts.gstatic.com/**',r=>r.abort());
      const response=await page.goto(base+url,{waitUntil:'domcontentloaded',timeout:25000});
      await page.waitForFunction(()=>document.documentElement.lang==='pl',{timeout:10000});
      const data=await page.evaluate(()=>({
        lang:document.documentElement.lang,
        title:document.title,
        heading:document.querySelector('h1')?.textContent?.trim()||'',
        canonical:document.querySelector('link[rel="canonical"]')?.href,
        horizontalOverflow:Math.max(0, document.documentElement.scrollWidth-window.innerWidth)
      }));
      assert.equal(response.status(),200,url);
      assert.equal(data.lang,'pl',url);
      assert.ok(data.heading,url+' H1 empty');
      assert.equal(data.canonical,'https://itbonsai.pl'+(url==='/'?'/':url),url+' canonical');
      const localeErrors=errors.filter(e=>/\/(?:i18n|language-preference|services-studio)\.js/i.test(e));
      assert.equal(localeErrors.length,0,url+' locale JavaScript errors: '+localeErrors.join(' | '));
      const name=(url==='/'?'home':url.slice(1))+'-'+width+'.png';
      await page.screenshot({path:path.join(out,name),animations:'disabled'});
      results.push({url,width,status:response.status(),...data,pageErrors:errors.slice(0,3)});
      await context.close();
    }
    for (const lang of ['pl','en','ja']) {
      const context=await browser.newContext({locale:'en-US'});
      await context.addCookies([{name:'bonsai-country',value:'US',url:base}]);
      await context.addInitScript(value=>localStorage.setItem('bonsai-language',value),lang);
      const page=await context.newPage();
      await page.route('**/fonts.googleapis.com/**',r=>r.abort());
      await page.route('**/fonts.gstatic.com/**',r=>r.abort());
      const r=await page.goto(base+'/strony-internetowe-gdansk',{waitUntil:'domcontentloaded',timeout:25000});
      await page.waitForFunction(expected=>document.documentElement.lang===expected,lang,{timeout:10000});
      assert.equal(r.status(),200);
      assert.equal(await page.evaluate(()=>localStorage.getItem('bonsai-language')),lang);
      results.push({url:'/strony-internetowe-gdansk',savedPreference:lang,lang:await page.evaluate(()=>document.documentElement.lang)});
      await context.close();
    }
    fs.writeFileSync(path.join(out,'report.json'), JSON.stringify(results,null,2));
    console.log('Browser QA PASS:',results.length,'cases, screenshots saved in artifacts/seo-browser');
    console.log(JSON.stringify(results.map(({url,width,savedPreference,lang,horizontalOverflow,pageErrors})=>({url,width,savedPreference,lang,horizontalOverflow,pageErrors})),null,2));
  } finally {await browser.close();await new Promise(r=>server.close(r))}
}
main().catch(e=>{console.error(e);process.exitCode=1;});
