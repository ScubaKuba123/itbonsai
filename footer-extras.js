(() => {

  function init(){
    const footer=document.querySelector('footer');if(!footer)return;
    // Verified GA4 active-user snapshot, filtered to itbonsai.pl; not realtime.
    if(!document.querySelector('.visitor-paper')){
      const visitors=document.createElement('details');
      visitors.className='visitor-paper';
      visitors.innerHTML='<summary aria-label="114 aktywnych użytkowników według GA4, do 8 listopada 2026. Pokaż szczegóły"><span class="visitor-paper-label" lang="ja">来訪者</span><span class="visitor-paper-number" lang="ja" aria-hidden="true">百十四</span><span class="visitor-paper-date">GA4 · 08.11.2026</span></summary><div class="visitor-paper-info"><strong>114 aktywnych użytkowników</strong><p>GA4 · itbonsai.pl<br>01.01.2020–08.11.2026</p><p>Historyczny odczyt, aktualizowany ręcznie. To użytkownicy zarejestrowani przez GA4, nie liczba odsłon ani licznik na żywo.</p></div>';
      const brand=footer.querySelector('.footer-brand-block .brand');
      if(brand)brand.after(visitors);else footer.append(visitors);
    }
    if(!footer.querySelector('.footer-kodama')){
      const kodama=document.createElement('a');
      kodama.className='footer-kodama';
      kodama.href='https://bonsai-kodama-preview.seamonk6616.workers.dev/';
      kodama.target='_blank';kodama.rel='noopener noreferrer';
      kodama.setAttribute('aria-label','KODAMA — panel prywatny');
      kodama.title='KODAMA — panel prywatny';
      kodama.innerHTML='<img src="/assets/kodama-spirit.png" alt="KODAMA" width="56" height="56" loading="lazy" decoding="async">';
      const destinations=footer.querySelector('.footer-destinations')||footer;
      destinations.insertBefore(kodama,destinations.querySelector('.footer-core-tile'));
    }
    if(!footer.querySelector('.footer-temple')){
      const temple=document.createElement('a');temple.className='footer-temple';temple.href='https://itbonsai.website/';temple.target='_blank';temple.rel='noopener noreferrer';temple.setAttribute('aria-label','BonsAI Temple');temple.innerHTML="<img src=\"/assets/bonsai-temple-red.webp\" alt=\"BonsAI Temple\" width=\"1000\" height=\"195\" loading=\"lazy\" decoding=\"async\">";footer.append(temple);
    }

  }
  if(document.readyState!=='complete')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
