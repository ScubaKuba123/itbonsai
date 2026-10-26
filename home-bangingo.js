(() => {
  const project = document.querySelector('#home-bangingo');
  if (!project) return;
  const host = project.querySelector('.bangingo-live-frame');
  const button = project.querySelector('.bangingo-water-toggle');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let enabled = !reduced.matches, visible = false, frame;
  const words = {
    pl:['Włącz wodę','Zatrzymaj wodę','Polska · Wyjazdy · Doświadczenia','Wyjazdy i prywatne doświadczenia w Trójmieście. Interaktywna strona z animowaną wodą.'],
    en:['Play water','Pause water','Poland · Trips · Experiences','Trips and private experiences in the Tri-City area. An interactive website with animated water.'],
    ja:['水の動きを再生','水の動きを停止','ポーランド · 旅行 · 体験','ポーランドの三都市圏での旅行とプライベート体験。水が動くインタラクティブなウェブサイト。'],
    de:['Wasser starten','Wasser pausieren','Polen · Reisen · Erlebnisse','Reisen und private Erlebnisse in der Dreistadt. Eine interaktive Website mit animiertem Wasser.'],
    fr:['Animer l’eau','Mettre l’eau en pause','Pologne · Voyages · Expériences','Voyages et expériences privées dans la Tricité. Un site interactif avec une animation de l’eau.'],
    es:['Animar el agua','Pausar el agua','Polonia · Viajes · Experiencias','Viajes y experiencias privadas en la Triciudad. Un sitio interactivo con agua animada.'],
    uk:['Увімкнути воду','Зупинити воду','Польща · Подорожі · Враження','Подорожі та приватні враження у Тримісті. Інтерактивний сайт з анімованою водою.'],
    zh:['播放流水','暂停流水','波兰 · 旅行 · 体验','三联市的旅行与私人体验。带有流水动画的交互式网站。']
  };
  window.bonsaiPortfolioCopy ||= {};
  for(const [locale,values] of Object.entries(words)) {
    const copy = window.bonsaiPortfolioCopy[locale] ||= {};
    words.pl.forEach((key,i)=>{copy[key]=values[i];});
    copy['Bangingo.com']='Bangingo.com';
  }
  function label() {
    const copy=words[document.documentElement.lang.split('-')[0]]||words.en;
    button.textContent=(enabled?'Ⅱ ':'▷ ')+copy[enabled?1:0];
    button.setAttribute('aria-pressed',String(enabled));
  }
  function sync() {
    const playing=enabled&&visible&&!document.hidden;
    if(playing&&!frame) {
      frame=document.createElement('iframe');
      frame.src='https://bangingo.com/'; frame.title='Bangingo.com';
      frame.tabIndex=-1; frame.setAttribute('aria-hidden','true');frame.setAttribute('inert','');
      frame.sandbox='allow-scripts allow-same-origin';frame.referrerPolicy='strict-origin-when-cross-origin';
      const current=frame;
      frame.addEventListener('load',()=>{if(frame===current)project.dataset.previewReady='';});
      host.append(frame);
    } else if(!playing&&frame) {
      // The external site has no pause-message API. Unmount it to stop WebGL work.
      frame.remove(); frame=null; delete project.dataset.previewReady;
    }
    project.dataset.water=playing?'playing':'paused'; label();
  }
  button.hidden=false;
  button.addEventListener('click',()=>{enabled=!enabled;sync();});
  reduced.addEventListener('change',()=>{enabled=!reduced.matches;sync();});
  new ResizeObserver(()=>host.style.setProperty('--bangingo-scale',host.clientWidth/1440)).observe(host);
  new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;sync();},{threshold:0}).observe(host);
  new MutationObserver(label).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
  document.addEventListener('visibilitychange',sync);label();
})();
