(() => {
  'use strict';
  const hero = document.querySelector('.hero-living');
  if (!hero) return;
  const stage = hero.querySelector('.living-stage');
  const canvas = hero.querySelector('.living-motes');
  const ctx = canvas.getContext('2d');
  // CSS rings also work if the browser cannot provide a canvas context.

  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
  let visible = false, frame = 0, previous = 0, elapsed = 0;
  let width = 1, height = 1, dpr = 1, rx = 0, ry = 0, targetX = 0, targetY = 0;
  const paths = [...hero.querySelectorAll('.living-veins path')].map(path => {
    const length = path.getTotalLength();
    // Cache the SVG geometry once; do not measure layout in the animation loop.
    return Array.from({length: 161}, (_, i) => path.getPointAtLength(length * i / 160));
  });
  const motes = Array.from({length: 22}, (_, i) => ({
    x: (i * .61803398875) % 1, y: (i * .38196601125 + .13) % 1,
    speed: .009 + (i % 4) * .002, size: .8 + (i % 3) * .45, phase: i * 1.7
  }));


  function draw() {
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, width, height);
    const count = width < 450 ? 12 : motes.length;
    for (let i = 0; i < count; i++) {
      const m = motes[i], y = 1 - ((m.y + elapsed * m.speed) % 1);
      const x = m.x + Math.sin(elapsed * .2 + m.phase) * .018;
      const alpha = Math.sin(y * Math.PI) * (.2 + .18 * (1 + Math.sin(elapsed * .7 + m.phase)) / 2);
      ctx.beginPath(); ctx.arc(x * width, y * height, m.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(20,124,115,${alpha})`; ctx.fill();
    }
    paths.forEach((points, i) => {
      const position = ((elapsed / (9 + i * 2) + i * .29) % 1) * 160;
      const a = points[Math.floor(position)], b = points[Math.min(160, Math.floor(position) + 1)];
      const fraction = position % 1;
      const x = (a.x + (b.x - a.x) * fraction) * width / 1000;
      const y = (a.y + (b.y - a.y) * fraction) * height / 1000;
      const radius = Math.max(8, width * .022), fade = Math.sin(position / 160 * Math.PI);
      const glow = ctx.createRadialGradient(x, y, 0, x, y, radius);
      glow.addColorStop(0, `rgba(239,255,239,${fade})`);
      glow.addColorStop(.15, `rgba(129,247,224,${fade * .8})`);
      glow.addColorStop(.45, `rgba(41,194,177,${fade * .3})`);
      glow.addColorStop(1, 'rgba(41,194,177,0)');
      ctx.fillStyle = glow; ctx.beginPath(); ctx.arc(x, y, radius, 0, Math.PI * 2); ctx.fill();
    });
  }
  function tick(now) {
    const delta = previous ? Math.min((now - previous) / 1000, .05) : 0;
    previous = now; elapsed += delta;
    const ease = 1 - Math.exp(-delta * 5);
    rx += (targetX - rx) * ease; ry += (targetY - ry) * ease;
    stage.style.setProperty('--living-rx', `${rx.toFixed(3)}deg`);
    stage.style.setProperty('--living-ry', `${ry.toFixed(3)}deg`);
    // Cap decorative canvas painting at 30 fps; CSS rings stay compositor-driven.
    if (now - (tick.lastPaint || 0) >= 33) { draw(); tick.lastPaint = now; }
    frame = requestAnimationFrame(tick);
  }
  function sync() {
    cancelAnimationFrame(frame); frame = 0; previous = 0;
    const running = visible && !document.hidden;
    hero.dataset.motion = running ? 'running' : 'idle';
    if (running) frame = requestAnimationFrame(tick);
    else {
      rx = ry = targetX = targetY = 0;
      stage.style.setProperty('--living-rx', '0deg');
      stage.style.setProperty('--living-ry', '0deg');
    }
  }
  function resize() {
    const rect = stage.getBoundingClientRect();
    width = stage.clientWidth; height = stage.clientHeight;
    if (!rect.width || !width || !height) return;
    dpr = Math.min(devicePixelRatio || 1, 1.5);
    canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr);
    draw();
  }
  finePointer.addEventListener('change', () => { targetX = targetY = 0; });
  stage.addEventListener('pointermove', event => {
    if (reduced.matches || !finePointer.matches || event.pointerType === 'touch') return;
    const rect = stage.getBoundingClientRect();
    targetX = -((event.clientY - rect.top) / rect.height - .5) * 3;
    targetY = ((event.clientX - rect.left) / rect.width - .5) * 4;
  }, {passive: true});
  stage.addEventListener('pointerleave', () => { targetX = targetY = 0; });
  document.addEventListener('visibilitychange', sync);
  window.addEventListener('pageshow', sync);
  new ResizeObserver(resize).observe(stage);
  new IntersectionObserver(entries => {
    visible = entries[0].isIntersecting; sync();
  }, {threshold: 0}).observe(stage);
  hero.dataset.livingReady = '';
  resize(); sync();
})();
