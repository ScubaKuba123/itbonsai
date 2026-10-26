// Run with Node.js: node scripts/check-seo.mjs [--live]
// Checks the static source by default; --live checks the actual production responses.
// No dependencies, credentials, writes or form submissions are required.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const origin = 'https://itbonsai.pl';
const live = process.argv.includes('--live');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const decode = text => text.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>');
const attrs = tag => Object.fromEntries([...tag.matchAll(/([\w:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g)].map(m => [m[1].toLowerCase(), decode(m[2] ?? m[3])]));
const tags = (html, name) => [...html.matchAll(new RegExp('<'+name+'\\b[^>]*>', 'gi'))].map(m => attrs(m[0]));
const meta = (html, name) => tags(html, 'meta').find(t => t.name === name || t.property === name)?.content;
const fileFor = pathname => pathname === '/' ? 'index.html' : pathname.slice(1) + (path.extname(pathname) ? '' : '.html');
const redirects = new Map(read('_redirects').split(/\r?\n/).filter(l => l && !l.startsWith('#')).map(l => l.trim().split(/\s+/)).map(([from,to]) => [from,to]));
const response = async pathname => {
  const res = await fetch(origin + pathname, { redirect: 'manual', signal: AbortSignal.timeout(20000) });
  assert.equal(res.status, 200, `${pathname}: expected direct HTTP 200, got ${res.status}`);
  assert(!/noindex/i.test(res.headers.get('x-robots-tag') || ''), `${pathname}: X-Robots-Tag noindex`);
  return res.text();
};

async function run() {
  const sitemap = live ? await response('/sitemap.xml') : read('sitemap.xml');
  assert(/<urlset\b[^>]*xmlns="http:\/\/www.sitemaps.org\/schemas\/sitemap\/0.9"/.test(sitemap), 'Sitemap namespace missing');
  const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => decode(m[1]));
  assert(urls.length > 0, 'Empty sitemap');
  assert.equal(new Set(urls).size, urls.length, 'Duplicate sitemap URLs');
  const titles = new Set(), pages = [], errors = [], warnings = [];
  for (const canonical of urls) {
    try {
      const url = new URL(canonical);
      assert.equal(url.origin, origin, 'Foreign origin in sitemap');
      assert(!url.search && !url.hash, 'Noncanonical query/hash in sitemap');
      assert(!redirects.has(url.pathname), 'Sitemap contains a redirect');
      const html = live ? await response(url.pathname) : read(fileFor(url.pathname));
      const canonicalTags = tags(html, 'link').filter(t => t.rel === 'canonical');
      assert.equal(canonicalTags.length, 1, 'Expected one canonical');
      assert.equal(canonicalTags[0].href, canonical, 'Canonical mismatch');
      assert.equal((html.match(/<h1\b/gi) || []).length, 1, 'Expected one H1');
      assert(!/noindex/i.test(meta(html, 'robots') || ''), 'Indexed page has noindex');
      const title = decode(html.match(/<title>([\s\S]*?)<\/title>/i)?.[1] || '').trim();
      const description = meta(html, 'description');
      assert(title && description, 'Missing title/description');
      assert(!titles.has(title), 'Duplicate title');
      titles.add(title);
      const schemas = [...html.matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)].flatMap(m => {const j = JSON.parse(m[1]); return j['@graph'] || [j];});
      const page = schemas.find(s => ['WebPage','CollectionPage','AboutPage','ContactPage'].includes(s['@type']));
      assert(page, 'Missing page structured data');
      assert.equal(page.url, canonical, 'Schema URL mismatch');
      assert.equal(page.name, title, 'Schema page name differs from title');
      assert.equal(page.description, description, 'Schema page description differs from meta description');
      for (const s of schemas.filter(s => s['@type'] === 'BreadcrumbList')) {
        assert(s.itemListElement.length >= 2, 'Single-item breadcrumb');
        s.itemListElement.forEach((item, i) => {assert.equal(item.position, i + 1); assert(item.name && item.item);});
      }
      for (const key of ['og:title','og:description','og:image','twitter:card','twitter:title','twitter:description','twitter:image']) assert(meta(html,key), `Missing ${key}`);
      assert.equal(meta(html,'og:url'), canonical, 'Open Graph URL mismatch');
      const assets = new Set([meta(html,'og:image'),meta(html,'twitter:image'),...JSON.stringify(schemas).matchAll(/https:\/\/itbonsai\.pl\/(assets\/[^"\\]+)/g)].map(x => typeof x === 'string' ? x : origin+'/'+x[1]));
      for (const asset of assets) {const u = new URL(asset, canonical); if(u.origin === origin) assert(fs.existsSync(path.join(root,decodeURIComponent(u.pathname))), `Missing metadata image ${u.pathname}`);}
      for (const a of tags(html, 'a')) {
        if (!a.href || /^(mailto:|tel:|javascript:)/i.test(a.href)) continue;
        const u = new URL(a.href, canonical);
        if (u.origin !== origin) continue;
        if (redirects.has(u.pathname)) {warnings.push(`${url.pathname}: redirect link ${u.pathname}`);continue;}
        const target = fileFor(u.pathname);
        assert(fs.existsSync(path.join(root,target)), `Broken internal link ${a.href}`);
        if (u.hash) {const targetHtml = read(target);const ids = new Set([...tags(targetHtml,'[a-z][a-z0-9]*')].map(t=>t.id).filter(Boolean));assert(ids.has(decodeURIComponent(u.hash.slice(1))), `Missing fragment ${a.href}`);}
      }
      for (const image of tags(html, 'img')) assert(Object.hasOwn(image,'alt'), 'Image without alt');
      pages.push({path:url.pathname,title,canonical,status:live?200:'source-checked'});
    } catch (error) {errors.push(`${canonical}: ${error.message}`);}
  }
  const robots = live ? await response('/robots.txt') : read('robots.txt');
  assert(robots.includes('Sitemap: '+origin+'/sitemap.xml'), 'robots.txt sitemap missing');
  assert(!/^Disallow:\s*\/\s*$/m.test(robots), 'robots.txt blocks entire site');
  if (live) {
    const alias=await fetch(origin+'/koszt-strony-internetowej',{redirect:'manual'});
    assert.equal(alias.status,301); assert.equal(new URL(alias.headers.get('location'),origin).pathname,'/cennik');
    const missing=await fetch(origin+'/seo-audit-not-found/check',{redirect:'manual'});
    assert.equal(missing.status,404);assert(/noindex/.test(meta(await missing.text(),'robots')));
  }
  console.log(JSON.stringify({mode:live?'production':'source',pages:pages.length,sitemapUrls:urls.length,errors,warnings:[...new Set(warnings)],details:pages},null,2));
  if(errors.length) process.exitCode=1;
}
run().catch(error=>{console.error(error.message);process.exitCode=1});
