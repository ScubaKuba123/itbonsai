import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {onRequestPost} from '../functions/api/kami.js';
const read=f=>fs.readFileSync(new URL('../'+f,import.meta.url),'utf8');
test('all advertised gross amounts preserve their net bases and 23% VAT',()=>{
 const html=read('cennik.html');
 const pairs=[...html.matchAll(/class="season-price"><small>od<\/small> <strong>([\d ]+)<\/strong> <span>zł brutto<\/span><\/p><p class="price-net"><span>od<\/span> ([\d ]+) <span>zł netto/g)];
 assert.equal(pairs.length,9);
 for(const [,gross,net]of pairs)assert.equal(Number(gross.replaceAll(' ','')),Math.round(Number(net.replaceAll(' ',''))*1.23));
 assert.deepEqual(pairs.map(x=>Number(x[2].replaceAll(' ',''))),[1500,6000,1500,3000,12000,3500,6000,25000,7000]);
});
test('obsolete care and hosting promises are absent from website and translations',()=>{
 const files=fs.readdirSync(new URL('../',import.meta.url)).filter(f=>/\.(html|js|json)$/.test(f));
 files.push('functions/_lib/kami-knowledge.js');
 for(const f of files)assert.doesNotMatch(read(f),/3 miesiące opieki|3 months of support|three months of (?:free )?(?:care|support)|Pierwszy rok podstawowego hostingu i domeny w pakiecie strony|hosting na 1 rok w cenie\*/i,f);
});
test('Kami receives updated offer knowledge and returns a reply via its existing endpoint',async()=>{
 let system='';const env={AI:{async run(model,input){system=input.messages[0].content;return {response:'Test: odrębnie uzgodniona opieka.'};}}};
 const request=new Request('https://itbonsai.pl/api/kami',{method:'POST',headers:{Origin:'https://itbonsai.pl',Referer:'https://itbonsai.pl/cennik','CF-Connecting-IP':'192.0.2.90','Content-Type':'application/json'},body:JSON.stringify({message:'Cennik opieka hosting Useme',lang:'pl'})});
 const res=await onRequestPost({request,env});assert.equal(res.status,200);assert.match((await res.json()).reply,/opieka/);
 assert.match(system,/freelancer covers the Useme service fee/);assert.match(system,/Opieka techniczna/);assert.doesNotMatch(system,/3 miesiące opieki|Pierwszy rok podstawowego hostingu/);
});
test('Useme links use the verified profile and safe new-tab attributes',()=>{
 for(const f of ['cennik.html','kontakt.html'])assert.match(read(f),/class="useme-link" href="https:\/\/useme.com\/pl\/roles\/contractor\/bonsai-studio,603182\/" target="_blank" rel="noopener noreferrer"/);
});
test('all pricing locales have removed the old support keys',()=>{
 const ctx={window:{}};vm.runInNewContext(read('pricing-translations.js'),ctx);
 for(const copy of Object.values(ctx.window.bonsaiPortfolioCopy)){assert.equal(copy['3 miesiące opieki'],undefined);assert.ok(copy['Opieka techniczna i rozwój strony']);}
});
