(() => {

  function init(){
    const footer=document.querySelector('footer');if(!footer)return;
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
