(() => {
  const labels = {
    pl: ['Odtwórz podgląd', 'Zatrzymaj podgląd'], en: ['Play preview', 'Pause preview'],
    ja: ['プレビューを再生', 'プレビューを一時停止'], de: ['Vorschau abspielen', 'Vorschau pausieren'],
    es: ['Reproducir vista previa', 'Pausar vista previa'], fr: ['Lire l’aperçu', 'Mettre en pause'],
    uk: ['Відтворити перегляд', 'Призупинити перегляд'], zh: ['播放预览', '暂停预览']
  };
  document.querySelectorAll('[data-video-preview]').forEach(cover => {
    const video = cover.querySelector('video');
    const button = cover.querySelector('button');
    let visible = false;
    // These explicitly animated previews start muted and retain a visible pause control.
    // This only controls the two portfolio clips, not motion preferences on client sites.
    let enabled = true;
    let pending = false;
    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;
    button.hidden = false;
    function label() {
      const text = labels[document.documentElement.lang.split('-')[0]] || labels.en;
      button.textContent = text[video.paused ? 0 : 1];
      button.setAttribute('aria-pressed', String(!video.paused));
    }
    async function sync() {
      if (!visible || !enabled || document.hidden) { video.pause(); return; }
      if (!video.getAttribute('src')) video.src = video.dataset.src;
      video.muted = true;
      if (pending || !video.paused) return;
      pending = true;
      try {
        await video.play();
        if (!visible || !enabled || document.hidden) video.pause();
      } catch { /* Autoplay restrictions leave a working manual play control. */ }
      finally { pending = false; label(); }
    }
    button.addEventListener('click', () => { enabled = video.paused; sync(); });
    video.addEventListener('play', label);
    video.addEventListener('pause', label);
    new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; sync(); }, {threshold:0, rootMargin:'160px 0px'}).observe(cover);
    document.addEventListener('visibilitychange', sync);
    new MutationObserver(label).observe(document.documentElement, {attributes:true, attributeFilter:['lang']});
    label();
  });
})();
