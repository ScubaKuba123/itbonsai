(() => {
 'use strict';
 document.querySelector('a[href="#szczegoly-procesu"]')?.addEventListener('click',()=>{document.querySelector('#szczegoly-procesu').open=true;});
 const nodes=[...document.querySelectorAll('[data-copy]')];
 const pl=Object.fromEntries(nodes.map(n=>[n.dataset.copy,n.innerHTML]));
 const description=document.querySelector('meta[name=description]');
 const originalDescription=description?.content;
 const social=[...document.querySelectorAll('meta[property^="og:"],meta[name^="twitter:"]')].map(e=>[e,e.content]);
 let requestId=0;
 const dictionaries={pl};
 async function language(lang,{persist=true}={}){
  const current=++requestId;
  try {
   if(!['pl','en','ja'].includes(lang))lang='en';
   if(!dictionaries[lang]){const response=await fetch((lang==='ja'?'services-copy-ja.json':'services-copy.json')+'?v=20261114');if(!response.ok)throw Error('translation');dictionaries[lang]=await response.json();}
   if(current!==requestId)return;
   const dict=dictionaries[lang];
   nodes.forEach(node=>{node.innerHTML=dict[node.dataset.copy]||pl[node.dataset.copy];});
   document.documentElement.lang=lang;
   if(description)description.content=lang==='en'?'Websites, e-commerce, apps, AI automation, branding and ongoing support. Practical digital solutions for your business from BonsAI Studio.':lang==='ja'?'ウェブサイト、EC、アプリ、AI自動化、ブランドデザイン、保守。BonsAI Studioが事業のデジタル化を支援します。':originalDescription;
   document.querySelectorAll('[data-lang]').forEach(button=>{const active=button.dataset.lang===lang;button.setAttribute('aria-pressed',String(active));button.classList.toggle('active',active);});
   document.title=lang==='en'?'Websites, apps & automation | BonsAI Studio':lang==='ja'?'ウェブ制作・アプリ・業務自動化 | BonsAI Studio':'Strony WWW, SEO i automatyzacje | BonsAI Studio';
   social.forEach(([e,source])=>{const key=e.getAttribute('property')||e.name;e.content=lang==='pl'?source:key.endsWith(':title')?document.title:key.endsWith(':description')?description.content:key.endsWith(':image:alt')?'BonsAI Studio – websites, SEO and AI automation':source;});
   if(persist)try{localStorage.setItem('bonsai-language',lang);}catch{}
  } catch { document.documentElement.lang='pl'; }
 }
 document.querySelectorAll('[data-lang]').forEach(button=>button.addEventListener('click',()=>language(button.dataset.lang)));
 let saved;try{saved=localStorage.getItem('bonsai-language');}catch{}
 language(window.BonsaiLocale?.initial()||'en',{persist:false});
})();
