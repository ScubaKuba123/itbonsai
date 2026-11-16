import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

const source = readFileSync(new URL('../echo-river.js', import.meta.url), 'utf8');
function fixture(reduce, available = true) {
  const events = () => ({ handlers: {}, addEventListener(name, fn) { this.handlers[name] = fn; } });
  const classes = new Set();
  const uniforms = {};
  let y = 100, now = 0, next = 0;
  const frames = new Map();
  const gl = new Proxy({
    getShaderParameter: () => true, getProgramParameter: () => true,
    isContextLost: () => false, getUniformLocation: (_, name) => name,
    uniform1f: (name, value) => { uniforms[name] = value; }
  }, { get: (target, key) => target[key] || (() => ({})) });
  const canvas = { ...events(), getContext: () => available ? gl : null, getBoundingClientRect: () => ({ width: 1000, height: 660 }) };
  const button = { ...events(), setAttribute(name, value) { this[name] = value; } };
  const scene = {
    classList: { add: name => classes.add(name), remove: name => classes.delete(name), toggle: (name, on) => on ? classes.add(name) : classes.delete(name) },
    getBoundingClientRect: () => ({ top: y, bottom: y + 660 }),
    querySelector: name => name === 'canvas' ? canvas : name === '.river-motion' ? button : { src: '/river.jpg' }
  };
  const media = { ...events(), matches: reduce };
  const document = { ...events(), hidden: false, documentElement: { lang: 'pl' }, querySelector: () => scene, querySelectorAll: () => [] };
  const window = events();
  class Observer { observe() {} }
  runInNewContext(source, {
    document, window, matchMedia: () => media, innerHeight: 1000, innerWidth: 1440, devicePixelRatio: 1,
    MutationObserver: Observer, IntersectionObserver: Observer, ResizeObserver: Observer,
    Image: class { set src(_) { this.onload(); } },
    requestAnimationFrame: fn => { frames.set(++next, fn); return next; },
    cancelAnimationFrame: id => frames.delete(id)
  });
  return { classes, uniforms, button, media, document, canvas,
    step() { now += 40; const jobs = [...frames.values()]; frames.clear(); jobs.forEach(fn => fn(now)); },
    scroll(top) { y = top; window.handlers.scroll(); },
    get frames() { return frames.size; }
  };
}

test('river starts without a click, with slower and smaller motion for reduced-motion', () => {
  const normal = fixture(false), gentle = fixture(true);
  for (const view of [normal, gentle]) {
    view.step(); view.step(); view.step();
    assert.ok(view.classes.has('is-rendered'));
    assert.equal(view.button['aria-pressed'], 'false');
    assert.ok(view.uniforms.time > 0);
  }
  assert.ok(gentle.uniforms.time < normal.uniforms.time);
  assert.ok(gentle.uniforms.motion < normal.uniforms.motion);
});

test('pause is preserved across motion preference changes; resume restarts the clock', () => {
  const view = fixture(true);
  view.step(); view.step(); view.button.handlers.click();
  const stopped = view.uniforms.time;
  view.media.matches = false; view.media.handlers.change(); view.step();
  assert.equal(view.button['aria-pressed'], 'true');
  assert.equal(view.uniforms.time, stopped);
  assert.equal(view.frames, 0);
  view.button.handlers.click(); view.step(); view.step();
  assert.ok(view.uniforms.time > stopped);
});

test('offscreen and hidden scenes stop work and resume when visible', () => {
  const view = fixture(false);
  view.scroll(1100); view.step();
  assert.equal(view.frames, 0);
  view.scroll(100); view.step(); view.step();
  assert.ok(view.frames > 0);
  view.document.hidden = true; view.document.handlers.visibilitychange();
  assert.equal(view.frames, 0);
  view.document.hidden = false; view.document.handlers.visibilitychange();
  assert.ok(view.frames > 0);
});

test('context restoration rebuilds the scene; no WebGL retains the still image', () => {
  const view = fixture(false);
  view.canvas.handlers.webglcontextlost({ preventDefault() {} });
  assert.equal(view.frames, 0);
  assert.equal(view.classes.has('is-rendered'), false);
  view.canvas.handlers.webglcontextrestored(); view.step(); view.step();
  assert.ok(view.classes.has('is-rendered'));
  assert.ok(view.uniforms.time > 0);
  const fallback = fixture(false, false);
  assert.equal(fallback.classes.has('is-rendered'), false);
  assert.equal(fallback.frames, 0);
});
