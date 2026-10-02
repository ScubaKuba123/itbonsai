const header=document.querySelector('.site-header');
const toggle=document.querySelector('.menu-toggle');
toggle?.addEventListener('click',()=>{const open=header.classList.toggle('open');toggle.setAttribute('aria-expanded',String(open))});
document.querySelectorAll('nav a').forEach(a=>a.addEventListener('click',()=>{header?.classList.remove('open');toggle?.setAttribute('aria-expanded','false')}));

