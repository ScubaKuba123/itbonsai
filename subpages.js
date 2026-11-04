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
footer.className = 'site-footer footer-compact';
footer.innerHTML = `
  <div class="footer-brand-block">
    <a class="brand" href="/"><img class="brand-logo" src="assets/bonsai-studio-mark-20261026.webp" alt="" width="48" height="48" loading="lazy" decoding="async"><strong>BonsAI Studio</strong></a>
    <p data-copy="footerTagline">Cyfrowe rozwiązania dla firm, które chcą rosnąć spokojniej i mądrzej.</p>
  </div>
  <div class="footer-contact">
    <strong data-copy="s7">Kontakt</strong>
    <a href="mailto:studio@itbonsai.pl">studio@itbonsai.pl</a>
    <a href="tel:+48501476124">+48 501 476 124</a>
    <a href="https://wa.me/48501476124" target="_blank" rel="noopener noreferrer">WhatsApp ↗</a>
  </div>
  <nav class="footer-nav" aria-label="Na skróty">
    <strong data-copy="footerQuick">Na skróty</strong>
    <a href="/uslugi" data-copy="s3">Usługi</a><a href="/realizacje" data-copy="s4">Portfolio</a>
    <a href="/cennik" data-copy="navPricing">Cennik</a><a href="/o-nas" data-copy="s6">O nas</a>
    <a href="/kontakt" data-copy="s7">Kontakt</a>
  </nav>
  <div class="footer-meta">
    <p class="footer-legal">© 2026 BonsAI Studio</p>
    <a class="footer-temple" href="https://itbonsai.website/" target="_blank" rel="noopener noreferrer" aria-label="Bonsai Temple ↗"><img class="temple-logo" src="assets/bonsai-temple-red.webp" alt="BonsAi Temple" width="1000" height="195" loading="lazy" decoding="async"></a>
    <a class="footer-privacy" href="/polityka-prywatnosci" data-copy="footerPrivacy">Polityka prywatności</a>
    <details class="visits-paper">
      <summary aria-label="302 sesje GA4 — dane historyczne do 3 listopada 2026"><span lang="ja" aria-hidden="true">訪問数</span><strong lang="ja" aria-hidden="true">三百二</strong></summary>
      <p>GA4 · 302 sesje · itbonsai.pl<br>01.01.2020–03.11.2026<br>Odczyt: 04.11.2026. Zapis historyczny, bez automatycznego odświeżania.</p>
    </details>
  </div>`;

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
