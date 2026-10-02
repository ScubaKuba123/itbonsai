(() => {
 'use strict';
 const header = document.querySelector('.bonsai-shared-home #bonsai-header');
 if (!header) return;
 let scheduled = false;
 const update = () => { header.classList.toggle('is-scrolled', window.scrollY > 32); scheduled = false; };
 window.addEventListener('scroll', () => {
  if (!scheduled) { scheduled = true; requestAnimationFrame(update); }
 }, { passive: true });
 window.addEventListener('pageshow', update);
 update();
})();
