(() => {
 'use strict';
 document.querySelector('a[href="#szczegoly-procesu"]')?.addEventListener('click',()=>{document.querySelector('#szczegoly-procesu').open=true;});
 const nodes=[...document.querySelectorAll('[data-copy]')];
 const pl=Object.fromEntries(nodes.map(n=>[n.dataset.copy,n.innerHTML]));
 const description=document.querySelector('meta[name=description]');
 const originalDescription=description?.content;
 const social=[...document.querySelectorAll('meta[property^="og:"],meta[name^="twitter:"]')].map(e=>[e,e.content]);
 let requestId=0;
 let english;
 async function language(lang){
  const current=++requestId;
  try {
   if(lang==='en'&&!english){const response=await fetch('services-copy.json?v=20260926');if(!response.ok)throw Error('translation');english=await response.json();}
   if(current!==requestId)return;
   const dict=lang==='en'?english:pl;
   nodes.forEach(node=>{node.innerHTML=dict[node.dataset.copy]||pl[node.dataset.copy];});
   document.documentElement.lang=lang;
   if(description)description.content=lang==='en'?'Websites, e-commerce, apps, AI automation, branding and ongoing support. Practical digital solutions for your business from BonsAI Studio.':originalDescription;
   document.querySelectorAll('[data-lang]').forEach(button=>{const active=button.dataset.lang===lang;button.setAttribute('aria-pressed',String(active));button.classList.toggle('active',active);});
   document.title=lang==='en'?'Websites, apps & automation | BonsAI Studio':'Strony WWW, SEO i automatyzacje | BonsAI Studio';
   social.forEach(([e,source])=>{const key=e.getAttribute('property')||e.name;e.content=lang!=='en'?source:key.endsWith(':title')?document.title:key.endsWith(':description')?description.content:key.endsWith(':image:alt')?'BonsAI Studio – websites, SEO and AI automation':source;});
   try{localStorage.setItem('bonsai-language',lang);}catch{}
  } catch { document.documentElement.lang='pl'; }
 }
 document.querySelectorAll('[data-lang]').forEach(button=>button.addEventListener('click',()=>language(button.dataset.lang)));
 let saved;try{saved=localStorage.getItem('bonsai-language');}catch{}
 if(saved==='en')language('en');
})();
