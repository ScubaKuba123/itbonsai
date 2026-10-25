(() => {
  'use strict';
  const cover = document.querySelector('[data-motion-cover]');
  if (!cover || !('IntersectionObserver' in window)) return;
  const frameHost = cover.querySelector('[data-motion-frame]');
  const control = cover.querySelector('[data-motion-control]');
  const interactive = document.querySelector('#bangingo [data-preview-toggle]');
  const source = new URL(cover.dataset.motionCover);
  const labels = {
    pl: ['Uruchom wodę', 'Zatrzymaj wodę'], en: ['Play water', 'Pause water'],
    de: ['Wasser starten', 'Wasser pausieren'], fr: ['Animer l’eau', 'Mettre en pause'],
    es: ['Animar el agua', 'Pausar el agua'], ja: ['水の流れを再生', '水の流れを停止'],
    zh: ['播放流水', '暂停流水'], uk: ['Увімкнути воду', 'Зупинити воду']
  };
  // This cover deliberately starts its gentle water loop; the visible pause control
  // does not change the full website's saved motion or accessibility preferences.
  let frame, visible = false, enabled = true, ready = false;
  control.hidden = false;
  function label() {
    const copy = labels[document.documentElement.lang.split('-')[0]] || labels.en;
    control.querySelector('[data-motion-label]').textContent = copy[enabled ? 1 : 0];
    control.setAttribute('aria-pressed', String(enabled));
    control.querySelector('[data-motion-icon]').textContent = enabled ? 'Ⅱ' : '▷';
  }
  function resize() {
    frameHost.style.setProperty('--cover-scale', String(frameHost.clientWidth / 1440));
  }
  function sync() {
    const playing = enabled && visible && !document.hidden && interactive?.getAttribute('aria-expanded') !== 'true';
    if (playing && !frame) {
      frame = document.createElement('iframe');
      frame.title = 'Bangingo Sunrise Rose';
      frame.tabIndex = -1;
      frame.setAttribute('aria-hidden', 'true');
      frame.setAttribute('inert', '');
      frame.sandbox = 'allow-scripts allow-same-origin';
      frame.referrerPolicy = 'origin';
      frame.src = source.href;
      frame.addEventListener('load', sync);
      frameHost.append(frame);
      resize();
    }
    if (frame && ready) {
      // A frame can briefly return to same-origin about:blank during navigation.
      let remoteDocument = false;
      try { void frame.contentWindow.location.href; }
      catch { remoteDocument = true; }
      if (remoteDocument) frame.contentWindow.postMessage({type:'bangingo:preview-motion', playing}, source.origin);
    }
    cover.dataset.motion = playing ? (ready ? 'playing' : 'loading') : 'paused';
    label();
  }
  addEventListener('message', event => {
    if (!frame || event.source !== frame.contentWindow || event.origin !== source.origin) return;
    if (event.data?.type === 'bangingo:preview-ready') {
      ready = true; cover.classList.add('motion-ready'); sync();
    }
    if (event.data?.type === 'bangingo:preview-state') {
      cover.dataset.motionConfirmed = event.data.playing ? 'playing' : 'paused';
      cover.dataset.motionPhase = String(event.data.phase);
    }
  });
  control.addEventListener('click', () => { enabled = !enabled; sync(); });
  new IntersectionObserver(entries => { visible = entries[0].isIntersecting; sync(); }, {threshold:0}).observe(frameHost);
  new ResizeObserver(resize).observe(frameHost);
  new MutationObserver(label).observe(document.documentElement, {attributes:true, attributeFilter:['lang']});
  if (interactive) new MutationObserver(sync).observe(interactive, {attributes:true, attributeFilter:['aria-expanded']});
  document.addEventListener('visibilitychange', sync);
  label(); resize();
})();
