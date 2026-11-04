(() => {

  function init(){
    const footer=document.querySelector('footer');if(!footer)return;
    if(!footer.querySelector('.footer-temple')){
      const temple=document.createElement('a');temple.className='footer-temple';temple.href='https://itbonsai.website/';temple.target='_blank';temple.rel='noopener noreferrer';temple.innerHTML='<span class="temple-ink" aria-hidden="true">寺</span><span class="temple-copy"><img class="temple-calligraphy" src="assets/bonsai-temple-calligraphy.webp" alt="Bonsai Temple" width="900" height="229" loading="lazy"><small>BonsAI Studio ↗</small></span>';footer.append(temple);
    }

  }
  if(document.readyState!=='complete')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
