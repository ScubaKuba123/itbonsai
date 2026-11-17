/* Animate only the water pixels of the independent decorative stream asset.
   Text, service links and illustrations remain ordinary accessible HTML. */
(() => {
  const root = document.querySelector('.services-river');
  if (!root) return;
  const scene = root.querySelector('.services-stream');
  const image = scene.querySelector('img');
  const canvas = scene.querySelector('canvas');
  const control = root.querySelector('.services-river-motion');
  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  let gl, program, timeUniform, motionUniform, frame = 0, last = 0, clock = 0;
  let visible = false, initialized = false, paused = false;
  const vertex = 'attribute vec2 position; varying vec2 uv; void main(){uv=position*.5+.5;gl_Position=vec4(position,0.,1.);}';
  const fragment = `precision mediump float;
    varying vec2 uv; uniform sampler2D artwork; uniform float time; uniform float motion;
    void main(){
      vec4 original=texture2D(artwork,uv);
      float water=smoothstep(.035,.15,original.g-original.r)*smoothstep(.67,.92,original.b/max(original.g,.01));
      water*=smoothstep(.8,1.,original.a);
      vec2 drift=vec2(sin(uv.y*52.-time*1.3)+sin(uv.x*37.+uv.y*18.-time*.7),cos(uv.x*40.+uv.y*27.-time*1.5));
      vec4 moving=texture2D(artwork,uv+drift*vec2(.004,.0028)*water*motion);
      float glint=sin(uv.y*190.+uv.x*24.-time*3.)*.015*water*motion;
      gl_FragColor=vec4(mix(original.rgb,moving.rgb,water)+glint,original.a);
    }`;
  function label() {
    const lang=document.documentElement.lang;
    const labels={pl:['Wstrzymaj ruch','Uruchom ruch'],en:['Pause motion','Play motion'],ja:['動きを止める','動きを再生']};
    control.textContent=(labels[lang]||labels.pl)[Number(paused)];
    control.setAttribute('aria-pressed',String(paused));
  }
  function resize() {
    if (!gl) return;
    const box=scene.getBoundingClientRect();
    const ratio=Math.min(devicePixelRatio||1,1.5,1200/Math.max(box.width,box.height));
    canvas.width=Math.max(1,Math.round(box.width*ratio));
    canvas.height=Math.max(1,Math.round(box.height*ratio));
    gl.viewport(0,0,canvas.width,canvas.height);
    draw();
  }
  function draw(){if(gl&&program){gl.uniform1f(timeUniform,clock);gl.uniform1f(motionUniform,preference.matches?.35:1);gl.drawArrays(gl.TRIANGLE_STRIP,0,4);}}
  function tick(now){
    frame=0;
    if(paused||!visible||document.hidden||!program){last=0;return;}
    if(!last)last=now;
    if(now-last>=33){clock=(clock+Math.min((now-last)/1000,.1)*(preference.matches?.5:1))%600;last=now;draw();}
    frame=requestAnimationFrame(tick);
  }
  function sync(){
    label();
    if(paused||!visible||document.hidden||!program){cancelAnimationFrame(frame);frame=0;last=0;}
    else if(!frame)frame=requestAnimationFrame(tick);
  }
  function initialize(){
    if(initialized||!image.complete||!image.naturalWidth)return;
    initialized=true;
    try{
      gl=canvas.getContext('webgl',{alpha:true,antialias:false,depth:false,preserveDrawingBuffer:false,premultipliedAlpha:false});
      if(!gl)return;
      const compile=(type,source)=>{const shader=gl.createShader(type);gl.shaderSource(shader,source);gl.compileShader(shader);if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS)){gl.deleteShader(shader);throw Error('Shader unavailable');}return shader;};
      const vs=compile(gl.VERTEX_SHADER,vertex),fs=compile(gl.FRAGMENT_SHADER,fragment);
      program=gl.createProgram();gl.attachShader(program,vs);gl.attachShader(program,fs);gl.linkProgram(program);
      gl.deleteShader(vs);gl.deleteShader(fs);
      if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error('Program unavailable');
      gl.useProgram(program);
      const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),gl.STATIC_DRAW);
      const position=gl.getAttribLocation(program,'position');gl.enableVertexAttribArray(position);gl.vertexAttribPointer(position,2,gl.FLOAT,false,0,0);
      const texture=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,texture);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,true);
      gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
      gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,image);
      timeUniform=gl.getUniformLocation(program,'time');motionUniform=gl.getUniformLocation(program,'motion');
      resize();scene.classList.add('is-ready');control.hidden=false;sync();
    }catch{program=null;scene.classList.remove('is-ready');control.hidden=true;}
  }
  new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible)initialize();sync();},{rootMargin:'120px'}).observe(scene);
  new ResizeObserver(resize).observe(scene);
  image.addEventListener('load',()=>{if(visible)initialize();});
  control.addEventListener('click',()=>{paused=!paused;sync();});
  preference.addEventListener('change',()=>{draw();sync();});
  document.addEventListener('visibilitychange',sync);
  window.addEventListener('pageshow',sync);
  canvas.addEventListener('webglcontextlost',event=>{event.preventDefault();cancelAnimationFrame(frame);frame=0;program=null;scene.classList.remove('is-ready');control.hidden=true;});
  canvas.addEventListener('webglcontextrestored',()=>{initialized=false;initialize();});
  new MutationObserver(label).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
  label();
})();
