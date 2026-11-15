/* Small original 3D studies. No video, libraries, network calls or scroll capture. */
(() => {
  const cards = [...document.querySelectorAll('[data-blueprint]')];
  if (!cards.length) return;
  const button = document.querySelector('.bp-motion');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let choice = null, frame = 0, clock = 0, last = 0;
  const paused = () => choice === null ? reduced.matches : choice;
  const copy = {
    pl:{water:'Woda, która płynie',waterSub:'Nurt, odbicia i przestrzenna tafla.',solid:'Forma, która odkrywa wnętrze',solidSub:'Obrót bryły i rozdzielenie jej warstw.',terrain:'Krajobraz, który reaguje',terrainSub:'Rzeźba terenu oglądana z różnych stron.',wave:'Wywołaj falę',explode:'Rozłóż bryłę',assemble:'Złóż bryłę',view:'Zmień perspektywę',note:'Trzy działające szkice. Własny charakter dla każdej marki.',play:'Włącz ruch',pause:'Wstrzymaj ruch'},
    en:{water:'Water in motion',waterSub:'Flow, reflections and a dimensional surface.',solid:'A form that reveals its structure',solidSub:'Rotation and an exploded view of its layers.',terrain:'A landscape that responds',terrainSub:'Explore the contours from different angles.',wave:'Create a ripple',explode:'Explode the form',assemble:'Assemble the form',view:'Change perspective',note:'Three live studies. A distinct character for every brand.',play:'Enable motion',pause:'Pause motion'},
    ja:{water:'流れを感じる水面',waterSub:'水の流れ、反射、奥行きのある表現。',solid:'構造を見せる立体',solidSub:'回転と分解で、内側まで伝える。',terrain:'視点に応える風景',terrainSub:'角度を変えて、地形の起伏を楽しむ。',wave:'波紋をつくる',explode:'立体を分解',assemble:'立体を組み立てる',view:'視点を変える',note:'実際に動く3つの表現。ブランドごとの個性を。',play:'動きを再開',pause:'動きを止める'}
  };
  function language(){const c=copy[document.documentElement.lang]||copy.pl;document.querySelectorAll('[data-bp-copy]').forEach(e=>e.textContent=c[e.dataset.bpCopy]||'');button.textContent=paused()?c.play:c.pause;button.setAttribute('aria-pressed',String(paused()));states.forEach(s=>{const key=s.type==='water'?'wave':s.type==='solid'?(s.open?'assemble':'explode'):'view';s.action.querySelector('span').textContent=c[key];});}
  const states=cards.map((el,i)=>{const canvas=el.querySelector('canvas'),ctx=canvas.getContext('2d',{alpha:true});return{el,canvas,ctx,type:el.dataset.blueprint,index:i,action:el.querySelector('button'),visible:false,open:false,split:0,angle:0,target:0,ripple:-20,width:400,height:300};});
  function resize(s){const box=s.el.getBoundingClientRect(),dpr=Math.min(devicePixelRatio||1,1.5);s.width=box.width;s.height=box.height;s.canvas.width=Math.round(box.width*dpr);s.canvas.height=Math.round(box.height*dpr);s.ctx?.setTransform(dpr,0,0,dpr,0,0);paint(s);}
  function project(x,y,z,turn=0){const xx=x*Math.cos(turn)+z*Math.sin(turn),zz=-x*Math.sin(turn)+z*Math.cos(turn);const yy=y*.84-zz*.54,depth=y*.54+zz*.84,k=3.8/(3.8+depth);return[xx*k,yy*k,depth];}
  function paint(s){if(!s.ctx)return;const c=s.ctx,w=s.width,h=s.height;c.clearRect(0,0,w,h);c.save();const scale=Math.min(w/480,(h-100)/250)/(s.type==='solid'?1+s.split*.25:1);c.translate(w/2,h*.46);c.scale(scale,scale);
    const ambient=c.createRadialGradient(0,-15,4,0,0,200);ambient.addColorStop(0,'#1a485568');ambient.addColorStop(1,'#081b2900');c.fillStyle=ambient;c.fillRect(-200,-150,400,300);
    const pos=(x,y,z,turn=0)=>{const p=project(x,y,z,turn);return[p[0]*126,p[1]*126,p[2]];};
    function line(points,color='#65c5c47a',width=.7,close=false,fill=null){c.beginPath();points.forEach((p,i)=>i?c.lineTo(p[0],p[1]):c.moveTo(p[0],p[1]));if(close)c.closePath();if(fill){c.fillStyle=fill;c.fill();}c.strokeStyle=color;c.lineWidth=width;c.stroke();}
    function dot(p,r=2){c.beginPath();c.arc(p[0],p[1],r,0,Math.PI*2);c.fillStyle='#b8f6e5';c.fill();}
    // Fine drafting axes outside the object.
    c.setLineDash([2,5]);line([[-170,87],[156,87]],'#93bcc438');line([[-153,-85],[-153,96]],'#93bcc438');c.setLineDash([]);c.fillStyle='#90b5bd';c.font='8px monospace';c.fillText('X',162,90);c.fillText('Y',-156,-93);c.fillText('0',-162,103);
    if(s.type==='water'||s.type==='terrain'){
      const N=32,terrain=s.type==='terrain',turn=terrain?s.angle:.24;
      const height=(x,z)=>{if(terrain)return -.08-.48*Math.exp(-((x+.28)**2*4+(z-.15)**2*6))-.35*Math.exp(-((x-.46)**2*9+(z+.4)**2*7))+.025*Math.sin(x*14+z*9);
        const dist=Math.hypot(x-.2,z+.1),age=clock-s.ripple;
        const impulse=age>=0&&age<5?.11*Math.sin(dist*16-age*5)*Math.exp(-((dist-age*.35)**2)*12)*Math.exp(-age*.35):0;
        return -.08+.045*Math.sin(z*8-clock*1.7+x*2)+.023*Math.sin(x*13+z*5-clock*.9)+impulse;};
      const rows=[];for(let zi=0;zi<=N;zi++){const z=-.88+zi/N*1.76;const row=[];for(let xi=0;xi<=N;xi++){const x=-1.08+xi/N*2.16;row.push(pos(x,height(x,z),z,turn));}rows.push(row);}
      // Translucent surface and connected mesh retain true perspective.
      for(let z=0;z<N;z++){const light=terrain?18+z*.4:22+10*Math.sin(z*.6-clock*.9);for(let x=0;x<N;x++)line([rows[z][x],rows[z][x+1],rows[z+1][x+1],rows[z+1][x]],'transparent',0,true,`hsla(181,53%,${light}%,.18)`);}
      for(let z=0;z<=N;z++)line(rows[z],z%4===0?'#93edda9c':'#5cbbbf60',z%4===0?.85:.5);
      for(let x=0;x<=N;x+=2)line(rows.map(row=>row[x]),'#4e9ea659',.5);
      const corners=[rows[0][0],rows[0][N],rows[N][N],rows[N][0]];line(corners,'#a4e7d3a0',1,true);corners.forEach(p=>dot(p,1.6));
      if(!terrain){for(let i=0;i<5;i++){const z=((clock*.18+i*.32)%1.7)-.85;const x=Math.sin(i*4)*.65;dot(pos(x,height(x,z)-.008,z,turn),1.25);}c.fillStyle='#8abac2';c.fillText('FLOW →',92,-78);}else{c.fillStyle='#8abac2';c.fillText('TOPO / 3D',83,-78);}
    }else{
      const phi=(1+Math.sqrt(5))/2;
      const vertices=[[-1,phi,0],[1,phi,0],[-1,-phi,0],[1,-phi,0],[0,-1,phi],[0,1,phi],[0,-1,-phi],[0,1,-phi],[phi,0,-1],[phi,0,1],[-phi,0,-1],[-phi,0,1]].map(v=>v.map(n=>n*.43));
      const triangles=[[0,11,5],[0,5,1],[0,1,7],[0,7,10],[0,10,11],[1,5,9],[5,11,4],[11,10,2],[10,7,6],[7,1,8],[3,9,4],[3,4,2],[3,2,6],[3,6,8],[3,8,9],[4,9,5],[2,4,11],[6,2,10],[8,6,7],[9,8,1]];
      const turn=clock*.14+.25;const faces=triangles.map(face=>{const mid=[0,1,2].map(k=>face.reduce((a,i)=>a+vertices[i][k],0)/3);const p=face.map(i=>pos(...vertices[i].map((n,k)=>n+mid[k]*s.split*.65),turn));return{p,depth:p.reduce((a,v)=>a+v[2],0)/3};}).sort((a,b)=>b.depth-a.depth);
      for(const f of faces){const front=f.depth<0;line(f.p,front?'#9df1d8d9':'#3a8d9b70',front?1.1:.7,true,front?'#164656bf':'#0c273980');}
      const center=pos(0,0,0,turn);dot(center,3);faces.filter(f=>f.depth<0).forEach(f=>f.p.forEach(p=>dot(p,1.5)));
      c.save();c.translate(0,8);c.scale(1,.35);c.beginPath();c.ellipse(0,0,144,100,-.12,0,Math.PI*2);c.strokeStyle='#6caeba50';c.lineWidth=.8;c.setLineDash([3,4]);c.stroke();c.restore();c.fillStyle='#8abac2';c.fillText('MESH / 20',83,-92);
    }
    c.restore();s.el.classList.add('is-ready');
  }
  function tick(now){frame=0;if(paused()||document.hidden||!states.some(s=>s.visible)){last=0;return;}if(!last)last=now;if(now-last>=32){const dt=Math.min(.08,(now-last)/1000);clock+=dt;last=now;for(const s of states){if(!s.visible)continue;s.split+=(Number(s.open)-s.split)*.08;s.angle+=(s.target-s.angle)*.06;paint(s);}}frame=requestAnimationFrame(tick);}
  function sync(){language();if(paused()||document.hidden||!states.some(s=>s.visible)){cancelAnimationFrame(frame);frame=0;last=0;}else if(!frame)frame=requestAnimationFrame(tick);}
  let visibilityFrame=0;
  function checkVisibility(){let changed=false;for(const s of states){const r=s.el.getBoundingClientRect(),next=r.bottom>0&&r.top<innerHeight;if(next!==s.visible){s.visible=next;changed=true;}}if(changed)sync();}
  function scheduleVisibility(){if(visibilityFrame)return;visibilityFrame=requestAnimationFrame(()=>{visibilityFrame=0;checkVisibility();});}
  window.addEventListener('scroll',scheduleVisibility,{passive:true});window.addEventListener('resize',scheduleVisibility,{passive:true});
  states.forEach(s=>{if(!s.ctx)return;resize(s);new ResizeObserver(()=>resize(s)).observe(s.el);new IntersectionObserver(scheduleVisibility,{threshold:.08}).observe(s.el);s.action.addEventListener('click',()=>{if(s.type==='water')s.ripple=clock;else if(s.type==='solid'){s.open=!s.open;s.action.setAttribute('aria-pressed',String(s.open));}else s.target+=Math.PI/3;if(paused()){if(s.type==='water'){choice=false;sync();}else{s.split=Number(s.open);s.angle=s.target;paint(s);}}language();});});
  button.addEventListener('click',()=>{choice=!paused();sync();});
  reduced.addEventListener('change',()=>{choice=null;sync();});document.addEventListener('visibilitychange',sync);new MutationObserver(language).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});language();checkVisibility();
})();
