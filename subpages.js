(() => {
const header = document.querySelector('.header');

if (header) {
  let nav = header.querySelector('.nav');
  if (!nav) {
    nav = document.createElement('nav');
    nav.className = 'nav';
    nav.setAttribute('aria-label', 'Główna nawigacja');
    nav.innerHTML = '<a href="/">Start</a><a href="/uslugi">Usługi</a><a href="/cennik">Cennik</a><a href="/dla-biznesu">Dla biznesu</a><a href="/realizacje">Portfolio</a><a href="/o-nas">O nas</a><a class="nav-cta" href="/kontakt">Kontakt</a>';
    header.appendChild(nav);
  }
  if (!nav.querySelector('a')) nav.innerHTML = '<a href="/">Start</a><a href="/uslugi">Usługi</a><a href="/cennik">Cennik</a><a href="/dla-biznesu">Dla biznesu</a><a href="/realizacje">Portfolio</a><a href="/o-nas">O nas</a><a class="nav-cta" href="/kontakt">Kontakt</a>';

  if (!header.querySelector('.language-switcher')) {
    const languageSlot = document.createElement('div');
    languageSlot.className = 'language-switcher';
    header.appendChild(languageSlot);
  }

  let menu = header.querySelector('.menu');
  if (!menu) {
    menu = document.createElement('button');
    menu.className = 'menu';
    menu.type = 'button';
    menu.setAttribute('aria-label', 'Otwórz menu');
    menu.setAttribute('aria-expanded', 'false');
    menu.innerHTML = '<span></span><span></span>';
    header.appendChild(menu);
  }

  menu.addEventListener('click', () => {
    const open = header.classList.toggle('open');
    menu.setAttribute('aria-expanded', String(open));
  });
  nav.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
    header.classList.remove('open');
    menu.setAttribute('aria-expanded', 'false');
  }));
}

let footer = document.querySelector('footer');
if (!footer) {
  footer = document.createElement('footer');
  document.body.appendChild(footer);
}
footer.className = 'site-footer';
footer.innerHTML = '<div class="footer-brand-block"><a class="brand" href="/"><img class="brand-logo" src="assets/bonsai-studio-mark-20261026.webp" alt="Logo BonsAI Studio" width="144" height="144" loading="lazy" decoding="async"></a><p>Cyfrowe rozwiązania dla firm, które chcą rosnąć spokojniej i mądrzej.</p></div><div class="footer-contact"><strong>Porozmawiajmy o Twojej firmie</strong><a href="tel:+48501476124">+48 501 476 124</a><a href="mailto:studio@itbonsai.pl">studio@itbonsai.pl</a><a href="https://wa.me/48501476124" target="_blank" rel="noopener noreferrer">WhatsApp ↗</a></div><div class="footer-nav"><strong>Na skróty</strong><a href="/uslugi">Usługi</a><a href="/cennik">Cennik</a><a href="/realizacje">Portfolio</a><a href="/o-nas">O nas</a><a href="/kontakt">Kontakt</a><a href="/polityka-prywatnosci">Polityka prywatności</a></div><a class="footer-temple" href="https://itbonsai.website/" target="_blank" rel="noopener noreferrer"><span class="temple-ink" aria-hidden="true">寺</span><span class="temple-copy"><strong translate="no">BonsAI Temple</strong><small>Zamów stronę lub aplikację tutaj ↗</small></span></a><p class="footer-legal">© 2026 BonsAI Studio</p>';

document.querySelectorAll('video[data-lazy-video]').forEach((video) => {
  const loadVideo = () => {
    const source = video.querySelector('source[data-src]');
    if (source && !source.src) {
      source.src = source.dataset.src;
      video.load();
    }
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      video.controls = true;
      return;
    }
    video.play().catch(() => { video.controls = true; });
  };
  if (!('IntersectionObserver' in window)) {
    loadVideo();
    return;
  }
  const observer = new IntersectionObserver((entries) => {
    if (!entries.some((entry) => entry.isIntersecting)) return;
    loadVideo();
    observer.disconnect();
  }, { rootMargin: '250px 0px' });
  observer.observe(video);
});
})();
