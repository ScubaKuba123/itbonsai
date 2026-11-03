(() => {
 'use strict';
 const header=document.getElementById('bonsai-header');
 if(!header) return;
 // Reuse the approved homepage CTA and scroll treatment on every public page.
 if(!header.querySelector('.home-header-cta')) {
  const cta=document.createElement('a');
  cta.className='home-header-cta';cta.href='/kontakt';
  cta.innerHTML='Bezpłatna analiza <span aria-hidden="true">→</span>';
  header.insertBefore(cta,header.querySelector('.bonsai-menu'));
 }
 if(!document.body.classList.contains('bonsai-shared-home')) {
  let scheduled=false;
  const update=()=>{header.classList.toggle('is-scrolled',scrollY>32);scheduled=false;};
  window.addEventListener('scroll',()=>{if(!scheduled){scheduled=true;requestAnimationFrame(update);}},{passive:true});
  window.addEventListener('pageshow',update);update();
 }

 const socials=document.createElement('div');
 socials.className='header-socials';
 socials.innerHTML='<a href="https://www.facebook.com/itbonsai" target="_blank" rel="noopener noreferrer" aria-label="Facebook"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 21v-8h3l.5-4H14V7c0-1 .3-2 2-2h2V1.5A25 25 0 0 0 15 1c-3 0-5 2-5 5v3H7v4h3v8z"/></svg></a><a href="https://www.linkedin.com/in/bonsai-studio-237749201/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 3a2 2 0 1 0 0 4 2 2 0 0 0 0-4M2 9h4v13H2zm7 0h4v2c1-2 3-2 4-2 4 0 5 2 5 6v7h-4v-7c0-2-1-3-2-3-2 0-3 1-3 3v7H9z"/></svg></a>';
 header.insertBefore(socials,header.querySelector('.home-header-cta'));
 const whatsapp=header.querySelector('.home-header-cta');
 whatsapp.href='https://wa.me/48501476124';whatsapp.target='_blank';whatsapp.rel='noopener noreferrer';whatsapp.setAttribute('aria-label','WhatsApp');
 const menu=header.querySelector('.bonsai-menu');
 const nav=header.querySelector('.bonsai-navigation');
 const close=()=>{header.classList.remove('menu-open');menu.setAttribute('aria-expanded','false');document.documentElement.classList.remove('bonsai-menu-open');};
 menu.addEventListener('click',()=>{const open=header.classList.toggle('menu-open');menu.setAttribute('aria-expanded',String(open));document.documentElement.classList.toggle('bonsai-menu-open',open);});
 nav.addEventListener('click',event=>{if(event.target.closest('a'))close();});
 document.addEventListener('click',event=>{if(!header.contains(event.target))close();});
 document.addEventListener('keydown',event=>{if(event.key==='Escape'&&header.classList.contains('menu-open')){close();menu.focus();}});
 const desktop=matchMedia('(min-width:1101px)');
 desktop.addEventListener('change',()=>{if(desktop.matches)close();});
 // Files opened directly from disk still navigate between sibling documents.
 if(location.protocol==='file:') header.querySelectorAll('a[href^="/"]').forEach(link=>{
   const route=link.getAttribute('href');link.href=route==='/'?'index.html':route.slice(1)+'.html';
 });
 // Services retains its existing Polish/English content translations, with the
 // same language dropdown and header layout as the rest of the site.
 if(document.body.classList.contains('services-studio')){
  const slot=header.querySelector('.language-switcher');
  slot.className='site-language-switcher language-picker';
  slot.innerHTML='<button class="language-picker-trigger" type="button" aria-expanded="false" aria-controls="language-picker-menu" aria-label="Wybór języka"><span class="language-picker-current-flag language-flag flag-pl" aria-hidden="true"></span><strong class="language-picker-current-code">PL</strong></button><div class="language-picker-menu" id="language-picker-menu" role="group" aria-label="Wybór języka"><button type="button" data-lang="pl"><span class="language-flag flag-pl" aria-hidden="true"></span><span>Polski</span><small>PL</small></button><button type="button" data-lang="en"><span class="language-flag flag-gb" aria-hidden="true"></span><span>English</span><small>EN</small></button></div>';
  const trigger=slot.querySelector('.language-picker-trigger');
  const closePicker=()=>{slot.classList.remove('open');trigger.setAttribute('aria-expanded','false');};
  trigger.addEventListener('click',()=>{const open=slot.classList.toggle('open');trigger.setAttribute('aria-expanded',String(open));});
  slot.querySelectorAll('[data-lang]').forEach(button=>button.addEventListener('click',closePicker));
  document.addEventListener('click',event=>{if(!slot.contains(event.target))closePicker();});
  document.addEventListener('keydown',event=>{if(event.key==='Escape')closePicker();});
 }
 // One header dictionary serves desktop, sticky and compact navigation.
 const headerCopy={
  pl:{nav:['Start','Usługi','Cennik','Dla biznesu','Portfolio','O nas','Kontakt'],analysis:'Bezpłatna analiza',consultation:'Bezpłatna konsultacja',home:'BonsAI Studio — strona główna',navigation:'Główna nawigacja',open:'Otwórz menu',close:'Zamknij menu',language:'Wybór języka',openLanguage:'Otwórz wybór języka',closeLanguage:'Zamknij wybór języka',polish:'Polski',logo:'Logo BonsAI Studio'},
  en:{nav:['Home','Services','Pricing','For Business','Portfolio','About','Contact'],analysis:'Free Website Analysis',consultation:'Free Consultation',home:'BonsAI Studio — home',navigation:'Main navigation',open:'Open menu',close:'Close menu',language:'Language selection',openLanguage:'Open language selection',closeLanguage:'Close language selection',polish:'Polish',logo:'BonsAI Studio logo'}
 };
 const routes=['/','/uslugi','/cennik','/dla-biznesu','/realizacje','/o-nas','/kontakt'];
 const setAttribute=(e,key,value)=>{if(e&&e.getAttribute(key)!==value)e.setAttribute(key,value);};
 const setText=(e,value)=>{
  if(!e)return;
  const node=[...e.childNodes].find(n=>n.nodeType===Node.TEXT_NODE&&n.textContent.trim());
  if(node&&node.textContent.trim()!==value)node.textContent=value+(e.children.length?' ':'');
 };
 function localizeHeader(){
  const locale=document.documentElement.lang;
  const waLabels={pl:'Napisz na WhatsApp',en:'Message on WhatsApp',ja:'WhatsAppで相談',de:'WhatsApp schreiben',es:'Escribir por WhatsApp',uk:'Написати у WhatsApp',fr:'Écrire sur WhatsApp',zh:'WhatsApp 联系'};
  setText(whatsapp,waLabels[locale]||waLabels.en);
  const copy=headerCopy[locale];if(!copy)return;
  header.querySelectorAll('.bonsai-navigation a,.bonsai-pricing-shortcut').forEach(a=>{
   let route=new URL(a.href,location.href).pathname.replace(/\.html$/,'').replace(/\/$/,'')||'/';
   if(location.protocol==='file:')route='/'+route.split('/').pop();
   if(route==='/index')route='/';
   const index=routes.indexOf(route);if(index>=0)setText(a,copy.nav[index]);
  });
  setText(header.querySelector('.home-header-cta'),locale==='pl'?'Napisz na WhatsApp':'Message on WhatsApp');
  setAttribute(header.querySelector('.bonsai-brand'),'aria-label',copy.home);
  const logo=header.querySelector('.bonsai-brand img');
  if(logo?.getAttribute('alt'))setAttribute(logo,'alt',copy.logo);
  setAttribute(nav,'aria-label',copy.navigation);
  setAttribute(menu,'aria-label',menu.getAttribute('aria-expanded')==='true'?copy.close:copy.open);
  setAttribute(header.querySelector('.language-picker-menu'),'aria-label',copy.language);
  const trigger=header.querySelector('.language-picker-trigger');
  setAttribute(trigger,'aria-label',trigger?.getAttribute('aria-expanded')==='true'?copy.closeLanguage:copy.openLanguage);
  setText(header.querySelector('.language-picker-current-code'),locale.toUpperCase());
  const polish=header.querySelector('[data-lang="pl"]');
  setAttribute(polish,'aria-label',copy.polish);
  setText(polish?.querySelector('span:not(.language-flag)'),copy.polish);
 }
 new MutationObserver(localizeHeader).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
 new MutationObserver(localizeHeader).observe(header,{childList:true,subtree:true,attributes:true,attributeFilter:['aria-expanded']});
 localizeHeader();
})();
