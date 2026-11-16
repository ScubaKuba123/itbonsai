/* Echo: a small, progressive WebGL water layer; ordinary HTML remains usable. */
(() => {
  const scene = document.querySelector('[data-echo-river]');
  if (!scene) return;
  const canvas = scene.querySelector('canvas');
  const toggle = scene.querySelector('.river-motion');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const copy = {
    pl: {label:'ECHO / 01 — ŻYWY KRAJOBRAZ',title:'Nie tylko oglądasz.<br><em>Czujesz.</em>',intro:'Rzeka płynie. Światło zostaje na wodzie. Kilka świetlików prowadzi wzrok. A Twoja marka zyskuje własny świat.',invite:'Wyobraź sobie ten klimat w świecie Twojej marki.',cta:'Porozmawiajmy o Twoim pomyśle',caption:'Światło. Ruch. Atmosfera.',pause:'Wstrzymaj ruch',play:'Włącz ruch',more:'Więcej możliwości Echo'},
    en: {label:'ECHO / 01 — A LIVING LANDSCAPE',title:'More than a view.<br><em>A feeling.</em>',intro:'The river flows. Light lingers on the water. A few fireflies guide your eye. Your brand becomes a world of its own.',invite:'Imagine this atmosphere in the world of your brand.',cta:'Let’s talk about your idea',caption:'Light. Motion. Atmosphere.',pause:'Pause motion',play:'Enable motion',more:'Explore more Echo possibilities'},
    ja: {label:'ECHO / 01 — 息づく風景',title:'見るだけではなく。<br><em>感じる。</em>',intro:'川が流れ、水面に光が揺れる。数匹の蛍が視線を導く。あなたのブランドに、ひとつの世界が生まれます。',invite:'この空気感を、あなたのブランドの世界へ。',cta:'アイデアをお聞かせください',caption:'光。動き。空気感。',pause:'動きを止める',play:'動きを再開',more:'Echoの表現をもっと見る'}
  };
  let manualPaused = false, visible = false, gl, program, texture, frame = 0;
  let started = false, failed = false, last = 0, elapsed = 0;
  // Autoplay in view; reduced-motion uses a gentler scene instead of a click gate.
  const paused = () => manualPaused;
  function renderCopy() {
    const c = copy[document.documentElement.lang] || copy.pl;
    document.querySelectorAll('[data-river-copy]').forEach(el => {
      const key = el.dataset.riverCopy;
      if (key === 'title') el.innerHTML = c.title;
      else el.textContent = c[key] || '';
    });
    toggle.textContent = paused() ? c.play : c.pause;
    toggle.setAttribute('aria-pressed', String(paused()));
  }
  const vertex = 'attribute vec2 a;varying vec2 uv;void main(){uv=a*.5+.5;gl_Position=vec4(a,0.,1.);}';
  const fragment = `precision mediump float;
    uniform sampler2D image;uniform float time;uniform float motion;uniform vec2 crop;uniform vec2 offset;varying vec2 uv;
    void main(){
      vec2 p=offset+uv*crop;
      float down=1.-p.y;
      float depth=clamp((down-.51)/.49,0.,1.);
      float leftBank=mix(.63,.40,pow(depth,.65))+.18*smoothstep(.83,1.,depth);
      float rightBank=mix(.79,1.09,pow(depth,.65));
      float water=smoothstep(.51,.58,down)*smoothstep(leftBank,leftBank+.05,p.x)*(1.-smoothstep(rightBank-.03,rightBank,p.x));
      // Perspective makes near waves wider and faster than distant ripples.
      float perspective=1./(.24+depth*1.4);
      float stream=perspective*8.+time*.9;
      float cross=(p.x-.69)*perspective*15.;
      float ripple=sin(stream*5.+sin(cross*1.6+time*.25))*0.62+sin(stream*9.-cross*.8-time*.7)*.38;
      float detail=sin(stream*19.+cross*4.+time*1.3);
      float amplitude=mix(.0007,.008,depth*depth)*water*motion;
      vec2 bend=vec2(ripple*amplitude,(ripple*.22+detail*.12)*amplitude);
      // Two cross-faded current samples avoid a visible loop or a moving shoreline.
      float phase=fract(time*.075),phase2=fract(time*.075+.5);
      float blend=abs(phase-.5)*2.;
      vec2 drift=vec2(.003,.024)*depth*water*motion;
      vec3 a=texture2D(image,p+bend+drift*(phase-.5)).rgb;
      vec3 b=texture2D(image,p+bend+drift*(phase2-.5)).rgb;
      vec3 col=mix(a,b,blend);
      float reflection=max(0.,ripple*.65+detail*.35);
      col+=vec3(.025,.043,.030)*reflection*water;
      col-=vec3(.008,.015,.011)*max(0.,-ripple)*water;

      // A sun outside the frame: canopy openings drift slowly across the mist.
      // Use image coordinates so the light stays attached to the landscape when cropped.
      float sunX=.78+.025*sin(time*.10);
      float opening=(.085*sin(time*.22)+.018*sin(time*.13))*mix(.65,1.,motion);
      float angle=(p.x-sunX)/(down+.22);
      float rays=exp(-pow((angle+.54-opening)*14.,2.))*.62
        +exp(-pow((angle+.28-opening*.65)*23.,2.))
        +exp(-pow((angle+.07+opening*.4)*18.,2.))*.46;
      float clearing=smoothstep(.43,.61,p.x)*(1.-smoothstep(.87,1.,p.x));
      float mist=(1.-smoothstep(.51,.94,down))*(.75+.25*sin(down*8.+p.x*5.));
      float luminance=dot(col,vec3(.2126,.7152,.0722));
      // Bright foliage stays textured; no white veil over the trees or reading area.
      float headroom=1.-smoothstep(.45,.88,luminance);
      // Broad canopy transmission makes the slow sunlight pass perceptible at small sizes.
      float sunExposure=.5+.5*sin(time*.26-.6);
      float sunHalo=exp(-pow((angle+.18-opening)*4.,2.))*clearing*mist*headroom;
      col+=(vec3(.94,.82,.53)-col)*sunHalo*(.035+.20*sunExposure);
      col+=(vec3(.94,.82,.53)-col)*rays*mist*clearing*headroom*.34;

      // Small, soft leaf shadows on the banks; the shoreline itself never moves.
      vec2 leaf=vec2(p.x+.004*sin(time*.17),down+.003*cos(time*.13));
      float canopy=sin(leaf.x*63.+sin(leaf.y*39.))*sin(leaf.y*47.-sin(leaf.x*29.));
      float shade=smoothstep(.08,.72,canopy)*(1.-water)*clearing
        *smoothstep(.38,.58,down)*(1.-smoothstep(.84,1.,down));
      col*=1.-shade*.075;

      // A broken reflection of the same sun follows the existing perspective ripples.
      float lightPath=.69+(sunX-.78)*1.5+.045*depth;
      float reflectionWidth=.025+.10*depth;
      float sunReflection=exp(-pow((p.x-lightPath)/reflectionWidth,2.));
      float glint=smoothstep(.25,.94,ripple*.72+detail*.28);
      col+=(vec3(1.,.86,.54)-col)*sunReflection*glint*water*(.16+.16*sunExposure)*mix(.6,1.,motion);
      gl_FragColor=vec4(col,1.);
    }`;
  function compile(type, source) {
    const s = gl.createShader(type); gl.shaderSource(s, source); gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {gl.deleteShader(s); throw new Error('shader');}
    return s;
  }
  function resize() {
    if (!gl || !program) return;
    const r = canvas.getBoundingClientRect();
    if (!r.width || !r.height) return;
    const scale = Math.min(devicePixelRatio || 1, 1.25, 1440 / r.width);
    canvas.width = Math.round(r.width * scale); canvas.height = Math.round(r.height * scale);
    gl.viewport(0, 0, canvas.width, canvas.height);
    const aspect = r.width / r.height, imgAspect = 1.5;
    const x = Math.min(1, aspect / imgAspect), y = Math.min(1, imgAspect / aspect);
    gl.uniform2f(gl.getUniformLocation(program, 'crop'), x, y);
    gl.uniform2f(gl.getUniformLocation(program, 'offset'), (1-x)*(innerWidth<=600?.66:.5), (1-y)*.5);
    draw();
  }
  function draw() {
    if (!gl || !texture || gl.isContextLost()) return;
    gl.uniform1f(gl.getUniformLocation(program, 'time'), elapsed);
    gl.uniform1f(gl.getUniformLocation(program, 'motion'), reduced.matches ? .3 : 1);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }
  function tick(now) {
    frame = 0;
    if (!visible || paused() || document.hidden || failed) {last = 0; return;}
    if (!last) last = now;
    if (now-last>=32) {elapsed += Math.min((now-last)/1000,.08)*(reduced.matches?.6:1); last=now; draw();}
    frame=requestAnimationFrame(tick);
  }
  function sync() {
    scene.classList.toggle('is-paused', paused());
    scene.classList.add('motion-opt-in');
    scene.classList.toggle('motion-reduced', reduced.matches);
    scene.classList.toggle('is-offscreen', !visible || document.hidden);
    renderCopy();
    if (visible && !paused() && !document.hidden && texture && !frame && !failed) frame=requestAnimationFrame(tick);
    if ((!visible || paused() || document.hidden || failed) && frame) {cancelAnimationFrame(frame);frame=0;last=0;}
  }
  function start() {
    if (started) return; started = true;
    gl = canvas.getContext('webgl', {alpha:false, antialias:false, depth:false, stencil:false, powerPreference:'low-power'});
    if (!gl) {failed=true;return;}
    try {
      program = gl.createProgram();
      const vs=compile(gl.VERTEX_SHADER,vertex), fs=compile(gl.FRAGMENT_SHADER,fragment);
      gl.attachShader(program,vs);gl.attachShader(program,fs);gl.linkProgram(program);
      gl.deleteShader(vs);gl.deleteShader(fs);
      if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw new Error('link');
      gl.useProgram(program);
      const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);
      gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);
      const pos=gl.getAttribLocation(program,'a');gl.enableVertexAttribArray(pos);gl.vertexAttribPointer(pos,2,gl.FLOAT,false,0,0);
      const img=new Image();
      img.onload=()=>{if(failed)return;texture=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,texture);gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,true);
        gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
        gl.texImage2D(gl.TEXTURE_2D,0,gl.RGB,gl.RGB,gl.UNSIGNED_BYTE,img);resize();scene.classList.add('is-rendered');sync();};
      img.onerror=()=>{failed=true;};img.src=scene.querySelector('.river-still').src;
    } catch {failed=true;scene.classList.remove('is-rendered');}
  }
  toggle.addEventListener('click',()=>{manualPaused=!paused();if(!paused())start();sync();});
  reduced.addEventListener('change',()=>{draw();sync();});
  new MutationObserver(renderCopy).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
  // Use the rendered viewport as authority; embedded/resized browsers can report
  // stale IntersectionObserver state after an anchor jump or viewport change.
  function checkVisibility() {
    const rect=scene.getBoundingClientRect();
    const next=rect.bottom>0 && rect.top<innerHeight;
    if (next===visible) return;
    visible=next;
    if (visible&&!paused()) start();
    sync();
  }
  let visibilityFrame=0;
  function scheduleVisibility() {
    if (visibilityFrame) return;
    visibilityFrame=requestAnimationFrame(()=>{visibilityFrame=0;checkVisibility();});
  }
  new IntersectionObserver(scheduleVisibility,{threshold:.05}).observe(scene);
  new ResizeObserver(()=>{resize();scheduleVisibility();}).observe(scene.querySelector('.river-landscape'));
  window.addEventListener('scroll',scheduleVisibility,{passive:true});
  window.addEventListener('resize',scheduleVisibility,{passive:true});
  document.addEventListener('visibilitychange',sync);
  canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();failed=true;scene.classList.remove('is-rendered');sync();});
  canvas.addEventListener('webglcontextrestored',()=>{started=false;failed=false;texture=null;program=null;if(visible&&!paused())start();sync();});
  renderCopy();sync();checkVisibility();
})();
