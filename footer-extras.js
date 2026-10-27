(() => {
  const copy={
    pl:['Statystyki','Odwiedziny (sesje)','Odsłony','Dane historyczne GA4','Dane chwilowo niedostępne.','Okres','Aktualizacja'],
    en:['Statistics','Visits (sessions)','Page views','Historical GA4 data','Data temporarily unavailable.','Period','Updated'],
    ja:['統計','訪問（セッション）','ページビュー','GA4の過去データ','現在データを取得できません。','期間','更新'],
    de:['Statistik','Besuche (Sitzungen)','Seitenaufrufe','Historische GA4-Daten','Daten vorübergehend nicht verfügbar.','Zeitraum','Aktualisiert'],
    fr:['Statistiques','Visites (sessions)','Pages vues','Données historiques GA4','Données temporairement indisponibles.','Période','Mise à jour'],
    es:['Estadísticas','Visitas (sesiones)','Páginas vistas','Datos históricos de GA4','Datos temporalmente no disponibles.','Período','Actualizado'],
    uk:['Статистика','Відвідування (сеанси)','Перегляди','Історичні дані GA4','Дані тимчасово недоступні.','Період','Оновлено'],
    zh:['统计','访问（会话）','浏览量','GA4历史数据','数据暂时不可用。','期间','更新']
  };
  function init(){
    const footer=document.querySelector('footer');if(!footer)return;
    if(!footer.querySelector('.footer-temple')){
      const temple=document.createElement('a');temple.className='footer-temple';temple.href='https://itbonsai.website/';temple.target='_blank';temple.rel='noopener noreferrer';temple.innerHTML='<span class="temple-ink" aria-hidden="true">寺</span><span class="temple-copy"><strong translate="no">BonsAI Temple</strong><small>BonsAI Studio ↗</small></span>';footer.append(temple);
    }
    const panel=document.createElement('details');panel.className='site-statistics';panel.setAttribute('translate','no');panel.innerHTML='<summary></summary><div class="statistics-body"></div>';footer.append(panel);
    let stats=null,requested=false;
    function render(){const lang=document.documentElement.lang.split('-')[0],t=copy[lang]||copy.en;panel.querySelector('summary').textContent=t[0];const body=panel.querySelector('.statistics-body');body.replaceChildren();const source=document.createElement('p');source.textContent=t[3];body.append(source);
      if(stats){const dl=document.createElement('dl');for(const [name,value] of [[t[1],stats.sessions],[t[2],stats.pageViews]]){const dt=document.createElement('dt'),dd=document.createElement('dd');dt.textContent=name;dd.textContent=new Intl.NumberFormat(lang).format(value);dl.append(dt,dd)}body.append(dl);for(const text of [t[5]+': '+stats.startDate+' – '+stats.endDate,t[6]+': '+stats.updatedAt]){const p=document.createElement('p');p.textContent=text;body.append(p)}}else{const p=document.createElement('p');p.textContent=t[4];body.append(p)}
    }
    panel.addEventListener('toggle',async()=>{if(!panel.open||requested)return;requested=true;try{const r=await fetch('/public-stats.json');if(!r.ok)return;const data=await r.json();if(data.source==='GA4'&&data.hostname==='itbonsai.pl'&&['sessions','pageViews'].every(k=>Number.isSafeInteger(data[k])&&data[k]>=0)&&['startDate','endDate','updatedAt'].every(k=>/^\d{4}-\d{2}-\d{2}$/.test(data[k])))stats=data;}catch{}render()});
    document.addEventListener('keydown',e=>{if(e.key==='Escape'&&panel.open){panel.open=false;panel.querySelector('summary').focus()}});
    new MutationObserver(render).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});render();
  }
  if(document.readyState!=='complete')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
