import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';

const source=readFileSync(new URL('../services-river.js',import.meta.url),'utf8');
function fixture(reduce=false,webgl=true,loaded=true){
 const events=()=>({handlers:{},addEventListener(name,fn){this.handlers[name]=fn;}});
 const uniforms={},classes=new Set(),frames=new Map();let next=0,now=0,intersection;
 const gl=new Proxy({getShaderParameter:()=>true,getProgramParameter:()=>true,getUniformLocation:(_,name)=>name,uniform1f:(name,value)=>uniforms[name]=value},{get:(obj,key)=>obj[key]||(()=>({}))});
 const canvas={...events(),getContext:()=>webgl?gl:null};
 const image={...events(),complete:loaded,naturalWidth:loaded?800:0};
 const control={...events(),hidden:true,setAttribute(name,value){this[name]=value;}};
 const scene={querySelector:name=>name==='img'?image:canvas,getBoundingClientRect:()=>({width:550,height:950}),classList:{add:name=>classes.add(name),remove:name=>classes.delete(name)}};
 const root={querySelector:name=>name==='.services-stream'?scene:control};
 const document={...events(),querySelector:()=>root,documentElement:{lang:'pl'},hidden:false};
 const window=events(),preference={...events(),matches:reduce};
 class Observer{observe(){}}
 runInNewContext(source,{document,window,matchMedia:()=>preference,devicePixelRatio:2,Float32Array,
  IntersectionObserver:class{constructor(fn){intersection=fn;}observe(){}},ResizeObserver:Observer,MutationObserver:Observer,
  requestAnimationFrame:fn=>{frames.set(++next,fn);return next;},cancelAnimationFrame:id=>frames.delete(id)});
 return {control,image,canvas,document,window,preference,uniforms,classes,
  visible(on=true){intersection([{isIntersecting:on}]);},
  step(){now+=40;const jobs=[...frames.values()];frames.clear();jobs.forEach(fn=>fn(now));},
  get pending(){return frames.size;}
 };
}
test('service water starts without interaction and reduced-motion is slower and smaller',()=>{
 const normal=fixture(),reduced=fixture(true);
 for(const view of [normal,reduced]){view.visible();view.step();view.step();view.step();assert.ok(view.classes.has('is-ready'));assert.equal(view.control.hidden,false);assert.equal(view.control['aria-pressed'],'false');assert.ok(view.uniforms.time>0);}
 assert.ok(reduced.uniforms.time<normal.uniforms.time);assert.ok(reduced.uniforms.motion<normal.uniforms.motion);
});
test('pause is stable across preference changes and explicit play resumes',()=>{
 const view=fixture();view.visible();view.step();view.step();view.control.handlers.click();const pausedAt=view.uniforms.time;
 view.preference.matches=true;view.preference.handlers.change();view.step();assert.equal(view.uniforms.time,pausedAt);assert.equal(view.pending,0);assert.equal(view.control['aria-pressed'],'true');
 view.control.handlers.click();view.step();view.step();assert.ok(view.uniforms.time>pausedAt);
});
test('offscreen and hidden-page rendering stops, then starts when visible again',()=>{
 const view=fixture();view.visible();view.step();view.visible(false);assert.equal(view.pending,0);
 view.visible();assert.ok(view.pending);view.document.hidden=true;view.document.handlers.visibilitychange();assert.equal(view.pending,0);
 view.document.hidden=false;view.window.handlers.pageshow();assert.ok(view.pending);
});
test('late image loading, context recovery and static WebGL fallback retain the scene',()=>{
 const view=fixture(false,true,false);view.visible();assert.equal(view.pending,0);
 view.image.complete=true;view.image.naturalWidth=800;view.image.handlers.load();assert.ok(view.classes.has('is-ready'));
 view.canvas.handlers.webglcontextlost({preventDefault(){}});assert.equal(view.pending,0);assert.equal(view.classes.has('is-ready'),false);
 view.canvas.handlers.webglcontextrestored();view.step();view.step();assert.ok(view.classes.has('is-ready'));assert.ok(view.uniforms.time>0);
 const fallback=fixture(false,false);fallback.visible();assert.equal(fallback.classes.has('is-ready'),false);assert.equal(fallback.control.hidden,true);assert.equal(fallback.pending,0);
});
