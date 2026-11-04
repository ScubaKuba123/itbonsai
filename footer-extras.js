(() => {

  function init(){
    const footer=document.querySelector('footer');if(!footer)return;
    if(!footer.querySelector('.footer-temple')){
      const temple=document.createElement('a');temple.className='footer-temple';temple.href='https://itbonsai.website/';temple.target='_blank';temple.rel='noopener noreferrer';temple.setAttribute('aria-label','Bonsai Temple ↗');temple.innerHTML='<img class="temple-logo" src="assets/bonsai-temple-red.webp" alt="BonsAi Temple" width="1000" height="195" loading="lazy" decoding="async">';footer.append(temple);
    }

  }
  if(document.readyState!=='complete')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
