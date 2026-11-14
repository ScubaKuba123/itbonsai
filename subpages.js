(() => {
const header = document.querySelector('.header');

if (header) {
  let nav = header.querySelector('.nav');
  if (!nav) {
    nav = document.createElement('nav');
    nav.className = 'nav';
    nav.setAttribute('aria-label', 'Główna nawigacja');
    nav.innerHTML = '<a href="/">Start</a><a href="/uslugi">Usługi</a><a href="/cennik">Cennik</a><a href="/realizacje">Portfolio</a><a href="/o-nas">O nas</a><a class="nav-cta" href="/kontakt">Kontakt</a>';
    header.appendChild(nav);
  }
  if (!nav.querySelector('a')) nav.innerHTML = '<a href="/">Start</a><a href="/uslugi">Usługi</a><a href="/cennik">Cennik</a><a href="/realizacje">Portfolio</a><a href="/o-nas">O nas</a><a class="nav-cta" href="/kontakt">Kontakt</a>';

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
footer.className = 'site-footer footer-refined';
footer.innerHTML = "<div class=\"footer-brand-block\"><a class=\"brand\" href=\"/\" translate=\"no\"><img class=\"brand-logo\" src=\"/assets/bonsai-studio-mark-20261026.webp\" alt=\"\" width=\"52\" height=\"52\" loading=\"lazy\" decoding=\"async\"><strong>BonsAI Studio</strong></a><p data-copy=\"footerTagline\">Cyfrowe rozwiązania dla firm, które chcą rosnąć spokojniej i mądrzej.</p></div><div class=\"footer-contact\"><strong data-copy=\"s7\">Kontakt</strong><a href=\"tel:+48501476124\">+48 501 476 124</a><a href=\"mailto:studio@itbonsai.pl\">studio@itbonsai.pl</a><a href=\"https://wa.me/48501476124\" target=\"_blank\" rel=\"noopener noreferrer\">WhatsApp ↗</a></div><a class=\"footer-temple\" href=\"https://itbonsai.website/\" target=\"_blank\" rel=\"noopener noreferrer\" aria-label=\"BonsAI Temple\"><img src=\"/assets/bonsai-temple-red.webp\" alt=\"BonsAI Temple\" width=\"1000\" height=\"195\" loading=\"lazy\" decoding=\"async\"></a><div class=\"footer-legal\"><span translate=\"no\">© 2026 BonsAI Studio</span><a href=\"/polityka-prywatnosci\" data-copy=\"footerPrivacy\">Polityka prywatności</a></div>";
const temple = footer.querySelector('.footer-temple');
const destinations = document.createElement('div');
destinations.className = 'footer-destinations';
temple.before(destinations);destinations.append(temple);
const core = document.createElement('a');
core.className='footer-core';core.href='https://itbonsai.site/';core.target='_blank';core.rel='noopener noreferrer';core.translate=false;
core.innerHTML='<img src="/assets/bonsai-core-mark.webp" width="320" height="293" alt="" loading="lazy" decoding="async"><span>BonsAi Core <span aria-hidden="true">↗</span></span>';
destinations.append(core);
const templeTile=document.createElement('div');templeTile.className='footer-temple-tile';
temple.before(templeTile);templeTile.append(temple);
const templeInfo=document.createElement('p');templeInfo.className='footer-product-info';templeInfo.textContent='Zamów stronę lub aplikację';templeTile.append(templeInfo);
const coreTile=document.createElement('div');coreTile.className='footer-core-tile';
core.before(coreTile);coreTile.append(core);
const coreInfo=document.createElement('p');coreInfo.className='footer-product-info';coreInfo.textContent='Opieka techniczna';coreTile.append(coreInfo);


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
