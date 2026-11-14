(() => {

  function init(){
    const footer=document.querySelector('footer');if(!footer)return;
    // Verified GA4 active-user snapshot, filtered to itbonsai.pl; not realtime.
    if(!document.querySelector('.visitor-paper')){
      const visitors=document.createElement('details');
      visitors.className='visitor-paper';
      visitors.innerHTML='<summary aria-label="114 aktywnych użytkowników według GA4, do 8 listopada 2026. Pokaż szczegóły"><span class="visitor-paper-number" aria-hidden="true">114</span></summary><div class="visitor-paper-info"><strong>114 aktywnych użytkowników</strong><p>GA4 · itbonsai.pl<br>01.01.2020–08.11.2026</p><p>Historyczny odczyt, aktualizowany ręcznie. To użytkownicy zarejestrowani przez GA4, nie liczba odsłon ani licznik na żywo.</p></div>';
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

(()=>{
function refine(){
 const f=document.querySelector('footer');if(!f||f.dataset.refinedOptions)return;f.dataset.refinedOptions='true';
 const core=f.querySelector('.footer-core');const coreUrl=core?.href||'/kontakt';
 f.querySelectorAll('.footer-destinations,.footer-temple,.footer-core-tile,.footer-temple-tile,.footer-kodama').forEach(x=>x.remove());
 const links=document.createElement('div');links.className='footer-options';
 links.innerHTML=`<a class="footer-option temple-option" href="https://itbonsai.website/" target="_blank" rel="noopener noreferrer"><svg class="temple-torii" viewBox="0 0 80 72" aria-hidden="true"><path d="M5 9Q40 20 75 9L73 16Q40 25 7 16Z" fill="#292522"/><path d="M9 18Q40 25 71 18L70 24Q40 30 10 24ZM13 33H67V39H13Z" fill="currentColor"/><path d="M22 23H29L25 66H17ZM51 23H58L63 66H55ZM37 25H43V35H37Z" fill="currentColor"/><path d="M15 65H28V69H15ZM53 65H66V69H53Z" fill="#292522"/></svg><span class="growth-step">01 · Tworzenie</span><strong>BonsAI Temple</strong><span class="option-purpose">Zamów stronę lub aplikację</span><span class="option-detail">Formularz zamówienia · około 20 min</span></a><a class="kodama-middle" href="https://bonsai-kodama-preview.seamonk6616.workers.dev/" target="_blank" rel="noopener noreferrer" aria-label="Kodama — przejście właściciela" title="Kodama"><img src="/assets/kodama-spirit.png" width="52" height="52" alt="Kodama"></a><a class="footer-option core-option" href="${coreUrl}" target="_blank" rel="noopener noreferrer"><img class="core-growth-mark core-c21-logo" src="/assets/bonsai-core-c21-blue.webp" width="1536" height="1024" alt="" aria-hidden="true" decoding="async"><span class="growth-step">02 · Rozwój</span><strong>BonsAI Core</strong><span class="option-purpose">Opieka techniczna, pozycjonowanie i SEO</span><span class="option-detail">Utrzymanie · Widoczność · Rozwój strony</span></a>`;
 const legal=f.querySelector('.footer-legal');f.insertBefore(links,legal||null);
 document.querySelectorAll('.kodama-corner').forEach(x=>x.remove());

}
if(document.readyState==='complete')refine();else window.addEventListener('load',refine,{once:true});
})();
