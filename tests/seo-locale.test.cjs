'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.join(__dirname,'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const preference=read('language-preference.js');

function detect({cookie='',saved=null,blocked=false}={}){
  const document={cookie,documentElement:{lang:'unset'}};
  const window={};
  const localStorage={getItem(key){
    assert.equal(key,'bonsai-language');
    if(blocked)throw Error('Storage unavailable');
    return saved;
  }};
  vm.runInNewContext(preference,{window,document,localStorage},{timeout:1000});
  return {lang:document.documentElement.lang,initial:window.BonsaiLocale.initial()};
}
test('Polish remains canonical for new users across geographic locations',()=>{
  for(const country of ['PL','US','JP','DE']){
    assert.deepEqual(detect({cookie:'bonsai-country='+country}),{lang:'pl',initial:'pl'});
  }
});
test('Explicit visitor language preference persists',()=>{
  for(const lang of ['pl','en','ja']){
    assert.deepEqual(detect({cookie:'bonsai-country=US',saved:lang}),{lang,initial:lang});
  }
});
test('Invalid language or blocked storage falls back to Polish',()=>{
  assert.equal(detect({saved:'xx'}).lang,'pl');
  assert.equal(detect({blocked:true,cookie:'bonsai-country=US'}).lang,'pl');
});
test('All locale implementations avoid geographic English fallback',()=>{
  const i18n=read('i18n.js');
  const services=read('services-studio.js');
  assert.match(i18n,/setLanguage\(window\.BonsaiLocale\?\.initial\(\)\s*\|\|\s*['"]pl['"],\s*\{\s*persist:\s*false\s*\}\)/);
  assert.doesNotMatch(i18n,/countryToLanguage/);
  assert.match(services,/language\(window\.BonsaiLocale\?\.initial\(\)\|\|'pl',\{persist:false\}\)/);
});
test('HTML references freshly versioned locale assets',()=>{
  const pages=fs.readdirSync(root).filter(name=>name.endsWith('.html'));
  for(const page of pages){
    const html=read(page);
    if(html.includes('language-preference.js'))assert.match(html,/language-preference\.js\?v=seo-way-20261116/,page);
    if(html.includes('i18n.js')){
      const r2=new Set(['strony-internetowe-dla-firm.html','seo-techniczne.html','automatyzacje-ai-dla-firm.html','cafe-app.html','strony-internetowe-trojmiasto.html']);
      const expected=page==='index.html'?'services-river-20261117':r2.has(page)?'seo-way-r2-20261117':'seo-way-20261116';
      assert.ok(html.includes('i18n.js?v='+expected),page+' locale version mismatch');
    }
  }
  assert.match(read('uslugi.html'),/services-studio\.js\?v=seo-way-20261116/);
  assert.match(read('realizacje.html'),/language-preference\.js\?v=seo-way-20261116/);
});
test('Sitemap pages retain Polish self-canonical and indexable HTML',()=>{
  const urls=[...read('sitemap-pages.xml').matchAll(/<loc>(https:\/\/itbonsai\.pl[^<]+)<\/loc>/g)].map(m=>m[1]);
  assert.equal(urls.length,16);
  assert.equal(new Set(urls).size,16);
  for(const url of urls){
    const pathname=new URL(url).pathname;
    const file=pathname==='/'?'index.html':pathname.slice(1)+'.html';
    const html=read(file);
    assert.match(html,/<html\s+lang=["']pl["']/i,file);
    const tags=[...html.matchAll(/<link\b[^>]*rel=["']canonical["'][^>]*>/gi)];
    assert.equal(tags.length,1,file+' must have one canonical');
    assert.ok(tags[0][0].includes('href="'+url+'"'),file+' has wrong canonical');
    assert.match(html,/<title>[^<]+<\/title>/i,file);
    assert.match(html,/<meta\s+name=["']description["']/i,file);
    assert.match(html,/<meta\s+name=["']robots["']\s+content=["']index,follow/i,file);
    assert.match(html,/<h1\b/i,file);
  }
});
test('Main page links directly to high-priority SEO URLs',()=>{
  const html=read('index.html');
  for(const p of ['uslugi','cennik','realizacje','strony-internetowe-gdansk',
    'strony-internetowe-gdynia','strony-internetowe-trojmiasto',
    'strony-internetowe-dla-firm','seo-gdansk','automatyzacje-ai-dla-firm']){
    assert.ok(html.includes('href="/'+p+'"'),'Missing direct link: '+p);
  }
});
test('Robots allowances and permanent legacy redirect stay intact',()=>{
  const robots=read('robots.txt'), redirects=read('_redirects');
  assert.match(robots,/User-agent:\s*OAI-SearchBot\s+Allow:\s*\//i);
  assert.match(robots,/User-agent:\s*GPTBot\s+Disallow:\s*\//i);
  assert.match(robots,/User-agent:\s*\*\s+Allow:\s*\//i);
  assert.match(robots,/Sitemap:\s*https:\/\/itbonsai\.pl\/sitemap\.xml/);
  assert.match(redirects,/^\/dla-biznesu \/uslugi 301$/m);
});
