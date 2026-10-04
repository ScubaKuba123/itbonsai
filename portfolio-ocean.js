(() => {
  const menu=document.querySelector('.o-menu');
  const nav=document.getElementById('o-navigation');
  menu.addEventListener('click',()=>{const open=nav.classList.toggle('is-open');menu.setAttribute('aria-expanded',String(open));menu.setAttribute('aria-label',open?'Zamknij menu':'Otwórz menu');});
  nav.addEventListener('keydown',e=>{if(e.key==='Escape'){nav.classList.remove('is-open');menu.setAttribute('aria-expanded','false');menu.focus();}});
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const video = document.getElementById('ocean-film');
  const motion = document.querySelector('.o-motion');
  const syncMotion = () => { motion.disabled = reduced.matches; motion.textContent = reduced.matches ? 'Ocean bez ruchu' : video.paused ? 'Odtwórz ocean' : 'Wstrzymaj ocean'; motion.setAttribute('aria-label', motion.textContent); };
  if(reduced.matches) video.pause();
  video.addEventListener('pause',syncMotion); video.addEventListener('play',syncMotion); syncMotion();
  motion.addEventListener('click', () => { if(video.paused) video.play().catch(syncMotion); else video.pause(); });
  reduced.addEventListener('change', () => { if(reduced.matches) video.pause(); syncMotion(); });
  const cards=[...document.querySelectorAll('.o-case')];
  const buttons=[...document.querySelectorAll('[data-filter]')];
  buttons.forEach((button,i)=>{
    button.style.setProperty('--i',i);
    button.addEventListener('click',()=>{
      const filter=button.dataset.filter;
      buttons.forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
      cards.forEach(card=>card.hidden=filter!=='all'&&!card.dataset.category.split(' ').includes(filter));
      document.getElementById('project-count').textContent=`${String(cards.filter(c=>!c.hidden).length).padStart(2,'0')} projektów`;
    });
  });
  const categories=document.querySelector('.o-categories');
  if(!reduced.matches && 'IntersectionObserver' in window){
    const observer=new IntersectionObserver(entries=>{if(entries[0].isIntersecting){categories.classList.add('has-motion');observer.disconnect();}},{threshold:.15});observer.observe(categories);
  }
})();
