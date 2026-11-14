/* First-party choice only. Optional analytics is blocked until explicit opt-in. */
(() => {
  'use strict';
  if (window.BonsaiPrivacy) return;
  const KEY='bonsai-privacy-v1', AGE=180*86400000;
  let state=null, dialog, previousFocus;
  try {const s=JSON.parse(localStorage.getItem(KEY));if(s?.version===1 && typeof s.analytics==='boolean' && s.savedAt<=Date.now() && Date.now()-s.savedAt<AGE)state=s;}catch{}
  const copy={
    pl:{title:'Twoja prywatność',intro:'Niezbędne funkcje działają bez zgody na analitykę. Opcjonalne Google Analytics 4 pomaga analizować korzystanie ze strony i zapisuje identyfikatory cookies. Dane otrzymuje Google. Odmowa nie blokuje kontaktu ani Kami.',option:'Zezwalam na Google Analytics 4',reject:'Odrzuć analitykę',accept:'Zezwól na analitykę',save:'Zapisz wybór',settings:'Ustawienia prywatności',policy:'Polityka prywatności',note:'Wybór zapamiętujemy na 180 dni. Zgodę możesz wycofać w stopce.'},
    en:{title:'Your privacy',intro:'Essential features work without analytics consent. Optional Google Analytics 4 analyses site usage and stores cookie identifiers. Google receives this data. Declining does not block contact or Kami.',option:'Allow Google Analytics 4',reject:'Reject analytics',accept:'Allow analytics',save:'Save choice',settings:'Privacy settings',policy:'Privacy policy',note:'We remember your choice for 180 days. Withdraw consent in the footer.'},
    ja:{title:'プライバシー設定',intro:'必須機能はアクセス解析への同意なしで利用できます。任意のGoogle Analytics 4は利用状況を分析し、Cookie識別子を保存します。データはGoogleに送信されます。拒否してもお問い合わせやKamiを利用できます。',option:'Google Analytics 4を許可する',reject:'解析を拒否',accept:'解析を許可',save:'選択を保存',settings:'プライバシー設定',policy:'プライバシーポリシー',note:'選択は180日間保存します。フッターから同意を撤回できます。'}
  };
  const t=()=>copy[document.documentElement.lang.split('-')[0]]||copy.en;
  function clearCookies(){
    for(const item of document.cookie.split(';')){
      const name=item.split('=')[0].trim();if(!/^_ga(?:_|$)|^_gid$|^_gat(?:_|$)/.test(name))continue;
      const labels=location.hostname.split('.'), domains=['',...labels.map((_,i)=>'.'+labels.slice(i).join('.'))];
      const parts=location.pathname.split('/').filter(Boolean), paths=['/',...parts.map((_,i)=>'/'+parts.slice(0,i+1).join('/'))];
      for(const domain of domains)for(const path of paths)document.cookie=name+'=; Max-Age=0; path='+path+(domain?'; domain='+domain:'')+'; SameSite=Lax';
    }
  }
  function choose(analytics){
    const revoke=state?.analytics===true&&!analytics;
    state={version:1,analytics,savedAt:Date.now()};try{localStorage.setItem(KEY,JSON.stringify(state));}catch{}
    window['ga-disable-G-SPBZV7WDPN']=!analytics;if(!analytics)clearCookies();
    dialog.close();previousFocus?.focus();window.dispatchEvent(new Event('bonsai:privacy-change'));
    if(revoke)location.reload(); // Unload an already loaded tracker after withdrawal.
  }
  function open(){previousFocus=document.activeElement;dialog.querySelector('input').checked=state?.analytics===true;if(!dialog.open)dialog.showModal();}
  window.BonsaiPrivacy={analyticsAllowed:()=>state?.analytics===true,open};
  window['ga-disable-G-SPBZV7WDPN']=!state?.analytics;if(!state?.analytics)clearCookies();
  function init(){
    dialog=document.createElement('dialog');dialog.id='privacy-dialog';dialog.setAttribute('aria-labelledby','privacy-title');
    dialog.innerHTML='<h2 id="privacy-title" data-privacy="title"></h2><p data-privacy="intro"></p><label><input type="checkbox"><span data-privacy="option"></span></label><p><a href="/polityka-prywatnosci#cookies" data-privacy="policy"></a></p><div class="privacy-actions"><button type="button" data-choice="reject" data-privacy="reject"></button><button type="button" data-choice="accept" data-privacy="accept"></button><button type="button" data-choice="save" data-privacy="save"></button></div><small data-privacy="note"></small>';
    document.body.appendChild(dialog);dialog.addEventListener('click',e=>{const c=e.target.dataset.choice;if(c)choose(c==='accept'||c==='save'&&dialog.querySelector('input').checked);});
    function footerButton(){const footer=document.querySelector('footer .footer-legal')||document.querySelector('footer');if(!footer||footer.querySelector('[data-privacy="settings"]'))return;const b=document.createElement('button');b.type='button';b.className='privacy-settings';b.dataset.privacy='settings';b.textContent=t().settings;b.addEventListener('click',open);footer.appendChild(b);}
    function translate(){document.querySelectorAll('[data-privacy]').forEach(el=>el.textContent=t()[el.dataset.privacy]);}
    translate();footerButton();
    new MutationObserver(footerButton).observe(document.body,{childList:true,subtree:true});
    new MutationObserver(translate).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
    if(!state && document.querySelector('script[src*="analytics.js"]'))open(); // Escape dismisses without saving or granting consent.
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
  window.addEventListener('storage',e=>{if(e.key===KEY)location.reload();});
})();
