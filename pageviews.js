(() => {
  let sent = false, timer, data;
  const copy = {
    pl: {title:'Odsłony od', note:'Zarejestrowane odsłony od uruchomienia licznika. Ponowne otwarcie podstrony też jest odsłoną. To nie liczba unikalnych osób; znane roboty są pomijane.'},
    en: {title:'Page views since', note:'Recorded page views since this counter started. Reloading a page counts again. This is not a unique visitor count; known bots are excluded.'},
    ja: {title:'集計開始日', note:'カウンター開始後に記録されたページ閲覧数です。再読み込みも含まれます。訪問者の実人数ではありません。既知のボットは除外します。'}
  };
  function render() {
    const el = document.querySelector('.visitor-paper'); if (!el || !data) return;
    const lang = document.documentElement.lang.split('-')[0], t = copy[lang] || copy.en;
    el.hidden = false;
    el.querySelector('.visitor-paper-number').textContent = new Intl.NumberFormat(lang).format(data.total);
    const label = `${t.title} ${new Intl.DateTimeFormat(lang).format(new Date(data.since))}`;
    el.querySelector('summary').setAttribute('aria-label', `${data.total} · ${label}`);
    el.querySelector('.visitor-paper-info strong').textContent = label;
    el.querySelector('.visitor-paper-info p').textContent = t.note;
  }
  async function load(method) {
    try {
      const r = await fetch('/api/pageviews', {method, credentials:'omit', cache:'no-store', headers:method === 'POST' ? {'X-Bonsai-View':'1'} : {}});
      if (!r.ok) return;
      const next = await r.json();
      if (!Number.isSafeInteger(next.total) || next.total < 0 || !Number.isFinite(Date.parse(next.since))) return;
      if (!data || next.total >= data.total) data = next;
      render();
    } catch { /* Keep unavailable data hidden instead of inventing a value. */ }
  }
  function schedule() {
    clearTimeout(timer);
    if (document.visibilityState !== 'visible' || sent) return;
    timer = setTimeout(() => { sent = true; load('POST'); }, 2000);
  }
  function init() {
    if (location.hostname !== 'itbonsai.pl' || document.querySelector('meta[name="robots"]')?.content.includes('noindex')) return;
    load('GET'); schedule();
    document.addEventListener('visibilitychange',schedule);
    new MutationObserver(render).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded',init,{once:true}); else init();
})();
