// Static HTML is generated from this single project source. No navigation depends on JavaScript.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.dirname(fileURLToPath(import.meta.url));
const read=n=>fs.readFileSync(path.join(root,n),'utf8');
const write=(n,s)=>fs.writeFileSync(path.join(root,n),s);
const projects=JSON.parse(read('projects.json'));
const esc=s=>s.replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;');
for(const p of projects){
  if(!p.externalUrl?.startsWith('https://')&&!p.internalRoute)throw Error('Missing verified project destination: '+p.slug);
  if(!fs.existsSync(path.join(root,p.previewSource)))throw Error('Missing genuine screenshot: '+p.slug);
  if(!Number.isInteger(p.previewWidth)||!Number.isInteger(p.previewHeight))throw Error('Missing screenshot dimensions: '+p.slug);
}
function project(p,i,prefix='work'){
  const url=p.internalRoute||p.externalUrl, attrs=!p.internalRoute&&p.externalUrl?' target="_blank" rel="noopener noreferrer"':'';
  const label=p.slug==='seamonk'?'Poznaj projekt SeaMonk →':'Otwórz projekt ↗';
  return `<article class="garden-project" id="${p.slug}" data-category="${p.category}">
  <div class="garden-project-copy"><p class="garden-kicker">${String(i+1).padStart(2,'0')} / ${esc(p.type)}</p><h2>${esc(p.title)}</h2><p>${esc(p.description)}</p><a class="garden-project-link" data-project="${p.slug}" href="${esc(url)}"${attrs}>${label}</a></div>
  <div class="garden-project-media"><figure class="garden-window"><div class="garden-window-bar"><span aria-hidden="true">● ● ●</span><span>${esc(p.status)}</span></div><a data-project="${p.slug}" href="${esc(url)}"${attrs} aria-label="${esc(p.internalRoute?'Poznaj projekt '+p.title:'Otwórz stronę '+p.title+' w nowej karcie')}"><img src="${p.previewSource}" width="${p.previewWidth}" height="${p.previewHeight}" alt="${esc(p.title)} — rzeczywisty widok strony" loading="lazy" decoding="async"></a></figure>
  ${p.interactive?`<button class="garden-preview-toggle" type="button" data-preview-toggle data-preview-source="${esc(url)}" data-preview-title="${esc(p.title)} — podgląd" aria-label="${esc('Podgląd interaktywny — '+p.title)}" aria-expanded="false" aria-controls="${prefix}-${p.slug}-preview">Podgląd interaktywny <span aria-hidden="true">＋</span></button><div class="garden-live" id="${prefix}-${p.slug}-preview" hidden></div><p class="garden-preview-note">Przeglądaj tutaj lub otwórz stronę w nowej karcie.</p>`:''}</div>
  </article>`;
}
function block(html,start,end,content){
  const re=new RegExp(`<!-- ${start} -->[\\s\\S]*?<!-- ${end} -->`);
  if(!re.test(html))throw Error('Missing generation marker: '+start);
  return html.replace(re,`<!-- ${start} -->\n${content}\n<!-- ${end} -->`);
}
let portfolio=read('realizacje.html');
if(!portfolio.includes('<!-- PROJECTS:START -->')){
 const start=portfolio.indexOf('<div class="editorial-entries">'), end=portfolio.indexOf('<section class="editorial-ending',start);
 if(start<0||end<0)throw Error('Portfolio boundary missing');
 portfolio=portfolio.slice(0,start)+'<!-- PROJECTS:START --><!-- PROJECTS:END -->\n'+portfolio.slice(end);
}
portfolio=block(portfolio,'PROJECTS:START','PROJECTS:END','<div class="garden-projects">'+projects.map((p,i)=>project(p,i)).join('\n')+'</div>');
portfolio=portfolio.replace(/<span aria-hidden="true">\/<\/span><button type="button" data-filter="app"[^>]*>Aplikacje<\/button>/,'');
write('realizacje.html',portfolio);
let home=read('index.html');
if(!home.includes('<!-- FEATURED:START -->'))home=home.replace(/<section class="portfolio section"[\s\S]*?<\/section>/,'<!-- FEATURED:START --><!-- FEATURED:END -->');
home=block(home,'FEATURED:START','FEATURED:END',`<section class="garden-featured" id="portfolio" aria-label="Nasze realizacje"><p class="garden-kicker">Nasze realizacje</p>${project(projects.find(p=>p.slug==='seamonk'),1,'home')}<a class="garden-project-link" href="/realizacje">Zobacz wszystkie realizacje →</a></section>`);
write('index.html',home);
// Normalize every external navigation anchor and generate all SeaMonk destinations from the canonical project record.
const sea=projects.find(p=>p.slug==='seamonk');
for(const file of fs.readdirSync(root).filter(n=>n.endsWith('.html'))){
 let html=read(file);
 html=html.replace(/<a\b[^>]*>/gi,tag=>{
   const href=tag.match(/\bhref="([^"]*)"/i)?.[1];
   if(!href)return tag;
   if(/^\/?seamonk(?:\.html)?(?:\/|#.*)?$/.test(href)||/^https:\/\/(?:www\.)?seamonk\.jp(?:\/.*)?$/.test(href))tag=tag.replace(/\sdata-project="[^"]*"/g,'').replace(/href="[^"]*"/,`href="${file==='seamonk.html'?sea.externalUrl:(sea.internalRoute||sea.externalUrl)}" data-project="seamonk"`);
   if(tag.includes('data-project="seamonk"')&&!/href="https?:/.test(tag))tag=tag.replace(/\s(?:target|rel)="[^"]*"/g,'');
   if(/href="https?:\/\//.test(tag)){
     tag=tag.replace(/\s(?:target|rel)="[^"]*"/g,'').replace(/>$/,' target="_blank" rel="noopener noreferrer">');
   }
   return tag;
 });
 if(['index.html','realizacje.html','o-nas.html'].includes(file)&&!html.includes('editorial-garden.css'))html=html.replace('</head>','<link rel="stylesheet" href="editorial-garden.css?v=20260926">\n<script src="editorial-garden.js?v=20260926" defer></script>\n</head>');
 write(file,html);
}
console.log('PASS: generated seven verified project records and normalized site navigation anchors.');
