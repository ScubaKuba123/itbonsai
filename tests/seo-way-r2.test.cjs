'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.join(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const canonicalHost='https://itbonsai.pl';
const sitemap=read('sitemap-pages.xml');
const urls=[...sitemap.matchAll(/<loc>(https:\/\/itbonsai\.pl[^<]+)<\/loc>/g)].map(m=>m[1]);
const fileFor=url=>url===canonicalHost+'/'?'index.html':url.slice(canonicalHost.length+1)+'.html';
const targets={
 'strony-internetowe-dla-firm.html':250,
 'seo-techniczne.html':220,
 'automatyzacje-ai-dla-firm.html':220,
 'cafe-app.html':125,
 'strony-internetowe-trojmiasto.html':300
};
const dict=JSON.parse(read('locale-updates.json'));
const contentOf=html=>(html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i)||[])[1]||'';
const textOf=html=>html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,' ').replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').trim();
const pathOf=url=>new URL(url).pathname;

test('Canonical pages in sitemap have unique indexable HTML',()=>{
  assert.ok(urls.length>=16,'Unexpected sitemap shrink');
  assert.equal(urls.length,new Set(urls).size,'Duplicate sitemap URLs');
  for (const url of urls) {
    const file=fileFor(url), html=read(file);
    assert.match(html,/<html\b[^>]*lang=["']pl["']/i,file);
    assert.match(html,/<meta\b[^>]*name=["']robots["'][^>]*content=["']index,follow/i,file);
    assert.match(html,/<h1\b/i,file);
    const canon=[...html.matchAll(/<link\b[^>]*rel=["']canonical["'][^>]*>/gi)];
    assert.equal(canon.length,1,file+' has missing/duplicate canonical');
    assert.ok(canon[0][0].includes('href="'+url+'"'),file+' canonical mismatch');
  }
  assert.ok(!urls.includes(canonicalHost+'/dla-biznesu'),'Legacy redirect in sitemap');
});

test('Every canonical page is reachable using ordinary internal HTML links',()=>{
  const paths=new Set(urls.map(pathOf));
  const graph=new Map();
  for(const url of urls){
    const p=pathOf(url),html=read(fileFor(url));
    const links=[...html.matchAll(/<a\b[^>]*href=["'](\/[^"'#?]*)(?:[?#][^"']*)?["']/gi)]
      .map(m=>m[1]).filter(p=>paths.has(p));
    graph.set(p,links);
  }
  const seen=new Set(['/']),queue=['/'];
  while(queue.length){for(const next of graph.get(queue.shift())||[]){if(!seen.has(next)){seen.add(next);queue.push(next)}}}
  assert.deepEqual([...paths].filter(p=>!seen.has(p)),[],'Unreachable canonical pages');
  const reg=graph.get('/strony-internetowe-trojmiasto')||[];
  assert.ok(reg.includes('/strony-internetowe-gdansk')&&reg.includes('/strony-internetowe-gdynia'),'Regional hub lacks city links');
});

test('R2 expansion is visible HTML with distinct service intent',()=>{
  for(const [file,minWords] of Object.entries(targets)){
    const html=read(file);
    const plain=textOf(contentOf(html));
    assert.ok(plain.split(/\s+/).length>=minWords,file+' lacks useful depth');
    assert.ok(html.includes('i18n.js?v=seo-way-r2-20261117'),file+' uses stale locale JS');
    const section=(html.match(/<section class="seo-r2-details"[\s\S]*?<\/section>/)||html.match(/<section class="seo-longform"[\s\S]*?<\/section>/)||[])[0];
    assert.ok(section,file+' has no R2 content section');
    assert.doesNotMatch(section,/\b(reviews?\s*\d+|gwarantujemy\s+pozycj|100%\s+skuteczno)/i,'No fabricated outcomes');
  }
  assert.match(read('cafe-app.html'),/Koncepcja projektu, nie gotowa usługa/);
});

test('All new text in R2 sections has EN and JA dictionary equivalents',()=>{
  for(const file of Object.keys(targets)){
    const html=read(file),block=(html.match(/<section class="seo-r2-details"[\s\S]*?<\/section>/)||html.match(/<section class="seo-longform"[\s\S]*?<\/section>/)||[])[0];
    const missing=[];
    for(const m of block.matchAll(/>([^<>]+)</g)){
      const value=m[1].trim();
      if(value.length<2||value==='·')continue;
      if(!dict.en[value]||!dict.ja[value])missing.push(value.slice(0,100));
    }
    assert.deepEqual(missing,[],file+' has untranslated R2 text');
  }
  for(const label of ['Praktyczne informacje o usłudze','Zakres koncepcji Cafe App']){
    assert.ok(dict.en[label]&&dict.ja[label],label+' missing aria translation');
  }
});

test('Sitemap lastmod reflects meaningful updates only on R2 URLs',()=>{
  for(const file of Object.keys(targets)){
    const slug=file.replace(/\.html$/,'');
    assert.ok(sitemap.includes('<loc>https://itbonsai.pl/'+slug+'</loc><lastmod>2026-11-17</lastmod>'),slug);
  }
  assert.match(read('sitemap.xml'),/sitemap-pages\.xml<\/loc><lastmod>2026-11-17<\/lastmod>/);
  assert.match(read('robots.txt'),/Sitemap:\s*https:\/\/itbonsai\.pl\/sitemap\.xml/);
  assert.match(read('_redirects'),/^\/dla-biznesu \/uslugi 301$/m);
});
