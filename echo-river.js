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
  let manualPaused = null, visible = false, gl, program, texture, frame = 0;
  let started = false, failed = false, last = 0, elapsed = 0;
  const paused = () => manualPaused === null ? reduced.matches : manualPaused;
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
    uniform sampler2D image;uniform float time;uniform vec2 crop;uniform vec2 offset;varying vec2 uv;
    void main(){
      vec2 p=offset+uv*crop;
      float down=1.-p.y;
      float water=smoothstep(.57,.69,down)*smoothstep(.39,.55,p.x);
      float ripple=sin(p.y*145.+sin(p.x*23.+time*.3)*1.8-time*1.15);
      float detail=sin(p.y*310.+p.x*45.-time*1.8);
      vec2 bend=vec2(ripple*.0018,detail*.00065)*water;
      vec3 col=texture2D(image,p+bend).rgb;
      col+=vec3(.018,.021,.012)*ripple*water;
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
    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }
  function tick(now) {
    frame = 0;
    if (!visible || paused() || document.hidden || failed) {last = 0; return;}
    if (!last) last = now;
    if (now-last>=32) {elapsed += Math.min((now-last)/1000,.08); last=now; draw();}
    frame=requestAnimationFrame(tick);
  }
  function sync() {
    scene.classList.toggle('is-paused', paused());
    scene.classList.toggle('motion-opt-in', manualPaused === false);
    scene.classList.toggle('is-offscreen', !visible || document.hidden);
    renderCopy();
    if (visible && !paused() && !document.hidden && texture && !frame && !failed) frame=requestAnimationFrame(tick);
    if ((!visible || paused() || document.hidden) && frame) {cancelAnimationFrame(frame);frame=0;last=0;}
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
  reduced.addEventListener('change',()=>{manualPaused=null;if(visible&&!paused())start();sync();});
  new MutationObserver(renderCopy).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
  new IntersectionObserver(([e])=>{visible=e.isIntersecting;if(visible&&!reduced.matches)start();sync();},{threshold:.05}).observe(scene);
  new ResizeObserver(resize).observe(scene.querySelector('.river-landscape'));
  document.addEventListener('visibilitychange',sync);
  canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();failed=true;scene.classList.remove('is-rendered');sync();});
  renderCopy();sync();
})();
