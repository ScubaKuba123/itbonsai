import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import fs from 'node:fs';
const privacy=fs.readFileSync(new URL('../privacy-controls.js',import.meta.url),'utf8');
const analytics=fs.readFileSync(new URL('../analytics.js',import.meta.url),'utf8');
function setup(saved,host='itbonsai.pl',blocked=false){
 const listeners={},scripts=[],cookieWrites=[],store=new Map(saved===undefined?[]:[['bonsai-privacy-v1',JSON.stringify(saved)]]);
 const checkbox={checked:false},dialog={open:false,setAttribute(){},querySelector:()=>checkbox,addEventListener:(n,f)=>listeners['dialog:'+n]=f,showModal(){this.open=true;},close(){this.open=false;}};
 const doc={readyState:'loading',documentElement:{lang:'pl'},activeElement:{focus(){}},body:{appendChild(){}},querySelector:s=>s.includes('analytics.js')?{}:null,querySelectorAll:()=>[],addEventListener:(n,f)=>listeners[n]=f,createElement:t=>t==='dialog'?dialog:{},head:{appendChild:s=>scripts.push(s)}};
 Object.defineProperty(doc,'cookie',{get:()=> '_ga=old; _ga_SPBZV7WDPN=old; session=keep',set:v=>cookieWrites.push(v)});
 let reloads=0;
 const win={addEventListener:(n,f)=>listeners[n]=f,dispatchEvent:e=>listeners[e.type]?.()};
 const ctx=vm.createContext({document:doc,window:win,location:{hostname:host,pathname:'/uslugi',reload(){reloads++;}},localStorage:{getItem:k=>{if(blocked)throw Error('blocked');return store.get(k)||null;},setItem:(k,v)=>{if(blocked)throw Error('blocked');store.set(k,v);}},Date,Event,MutationObserver:class{observe(){}}});
 vm.runInContext(privacy,ctx);vm.runInContext(analytics,ctx);
 return {win,scripts,cookieWrites,store,dialog,checkbox,init:()=>listeners.DOMContentLoaded(),click:choice=>listeners['dialog:click']({target:{dataset:{choice}}}),reloads:()=>reloads};
}
test('first visit blocks GA, unchecked choice, no deletion of essential cookies',()=>{const x=setup();x.init();assert.equal(x.scripts.length,0);assert.equal(x.checkbox.checked,false);assert.equal(x.dialog.open,true);assert(x.cookieWrites.every(x=>!x.startsWith('session=')));});
test('reject persists false and never loads Google',()=>{const x=setup();x.init();x.click('reject');assert.equal(x.scripts.length,0);assert.equal(JSON.parse(x.store.get('bonsai-privacy-v1')).analytics,false);});
test('accept loads exactly once; advertising stays denied',()=>{const x=setup();x.init();x.click('accept');x.click('accept');assert.equal(x.scripts.length,1);assert.match(x.scripts[0].src,/G-SPBZV7WDPN/);assert.equal(x.win.dataLayer[0][2].ad_storage,'denied');});
test('withdrawal disables GA, clears GA cookies, reloads to unload tracker',()=>{const x=setup({version:1,analytics:true,savedAt:Date.now()});x.init();x.click('reject');assert.equal(x.win['ga-disable-G-SPBZV7WDPN'],true);assert.equal(x.reloads(),1);assert(x.cookieWrites.some(x=>x.startsWith('_ga=')));});
test('expired, malformed and unknown-version preferences never authorize tracking',()=>{for(const saved of [{version:1,analytics:true,savedAt:0},{version:2,analytics:true,savedAt:Date.now()},{version:1,analytics:'yes',savedAt:Date.now()}])assert.equal(setup(saved).scripts.length,0);});
test('local preview does not report to GA even after opt-in',()=>{const x=setup(undefined,'127.0.0.1');x.init();x.click('accept');assert.equal(x.scripts.length,0);assert.equal(x.win.BonsaiPrivacy.analyticsAllowed(),true);});
test('blocked storage fails closed and does not crash UI',()=>{const x=setup(undefined,'itbonsai.pl',true);x.init();x.click('reject');assert.equal(x.scripts.length,0);});
