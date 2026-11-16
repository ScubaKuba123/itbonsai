import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

const source = readFileSync(new URL('../echo-blueprint.js', import.meta.url), 'utf8');
function fixture(reduce) {
  const events = () => ({ handlers: {}, addEventListener(name, fn) { this.handlers[name] = fn; } });
  const frames = new Map();
  let id = 0, now = 0;
  const button = { ...events(), setAttribute(name, value) { this[name] = value; } };
  const cards = ['water', 'solid', 'terrain'].map(type => {
    const trace = [];
    const ctx = new Proxy({
      clearRect() { trace.length = 0; },
      createRadialGradient: () => ({ addColorStop() {} }),
      moveTo: (...args) => trace.push(args), lineTo: (...args) => trace.push(args),
      arc: (...args) => trace.push(args)
    }, { get: (target, key) => target[key] || (() => {}) });
    const action = { ...events(), querySelector: () => ({}), setAttribute(name, value) { this[name] = value; } };
    const canvas = { getContext: () => ctx };
    return { dataset: { blueprint: type }, classList: { add() {} }, top: 100, trace, action,
      getBoundingClientRect() { return { top: this.top, bottom: this.top + 300, width: 400, height: 300 }; },
      querySelector: selector => selector === 'canvas' ? canvas : action
    };
  });
  const media = { ...events(), matches: reduce };
  const document = { ...events(), hidden: false, documentElement: { lang: 'pl' },
    querySelectorAll: selector => selector === '[data-blueprint]' ? cards : [], querySelector: () => button
  };
  const window = events();
  class Observer { observe() {} }
  runInNewContext(source, { document, window, matchMedia: () => media, innerHeight: 1000, devicePixelRatio: 1,
    ResizeObserver: Observer, IntersectionObserver: Observer, MutationObserver: Observer,
    requestAnimationFrame: fn => { frames.set(++id, fn); return id; }, cancelAnimationFrame: key => frames.delete(key)
  });
  return { cards, button, media, document, window,
    snapshot: () => cards.map(c => JSON.stringify(c.trace)),
    advance(count = 30) { for (let i = 0; i < count; i++) { now += 40; const work = [...frames.values()]; frames.clear(); work.forEach(fn => fn(now)); } },
    get pending() { return frames.size; }
  };
}

for (const reduced of [false, true]) {
  test(`all three studies animate without interaction (reduced motion: ${reduced})`, () => {
    const view = fixture(reduced), before = view.snapshot();
    view.advance();
    view.snapshot().forEach((after, i) => assert.notEqual(after, before[i], `${view.cards[i].dataset.blueprint} must move`));
    assert.equal(view.button['aria-pressed'], 'false');
  });
}

test('pause freezes all studies, survives preference changes and resume moves every study', () => {
  const view = fixture(true); view.advance(); view.button.handlers.click();
  const before = view.snapshot(); view.media.matches = false; view.media.handlers.change(); view.advance();
  assert.deepEqual(view.snapshot(), before); assert.equal(view.pending, 0);
  view.button.handlers.click(); view.advance();
  view.snapshot().forEach((after, i) => assert.notEqual(after, before[i]));
});

test('returning to a visible card or a restored page automatically restarts drawing', () => {
  const view = fixture(false); view.cards.forEach(c => { c.top = 1200; });
  view.window.handlers.scroll(); view.advance(); assert.equal(view.pending, 0);
  const before = view.snapshot(); view.cards[2].top = 100;
  view.window.handlers.pageshow(); view.advance();
  assert.equal(view.snapshot()[0], before[0]); assert.equal(view.snapshot()[1], before[1]);
  assert.notEqual(view.snapshot()[2], before[2]);
  view.document.hidden = true; view.document.handlers.visibilitychange(); assert.equal(view.pending, 0);
  view.document.hidden = false; view.document.handlers.visibilitychange(); assert.ok(view.pending > 0);
});

test('explode/assemble and perspective controls still update geometry', () => {
  const view = fixture(false); view.button.handlers.click();
  let before = view.snapshot(); view.cards[1].action.handlers.click();
  assert.equal(view.cards[1].action['aria-pressed'], 'true'); assert.notEqual(view.snapshot()[1], before[1]);
  view.cards[1].action.handlers.click(); assert.equal(view.cards[1].action['aria-pressed'], 'false');
  before = view.snapshot(); view.cards[2].action.handlers.click(); assert.notEqual(view.snapshot()[2], before[2]);
  view.cards[0].action.handlers.click(); assert.equal(view.button['aria-pressed'], 'false');
});
