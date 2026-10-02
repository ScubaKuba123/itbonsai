(() => {
  'use strict';
  const root = document.querySelector('.editorial-main');
  if (!root) return;
  const buttons = [...root.querySelectorAll('[data-filter]')];
  const entries = [...root.querySelectorAll('[data-category]')];
  const count = document.getElementById('project-count');
  const updateCount = () => { count.firstChild.nodeValue = String(entries.filter(entry => !entry.hidden).length).padStart(2, '0'); };
  buttons.forEach(button => button.addEventListener('click', () => {
    buttons.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    let visible = 0;
    entries.forEach(entry => {
      entry.hidden = button.dataset.filter !== 'all' && entry.dataset.category !== button.dataset.filter;
      if (!entry.hidden) visible++;
    });
    // Change only the number; preserve the translated label and the language system's text nodes.
    count.firstChild.nodeValue = String(visible).padStart(2, '0');
  }));
  new MutationObserver(updateCount).observe(document.documentElement, {attributes:true, attributeFilter:['lang']});
  const menu = document.querySelector('.header .menu');
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && document.querySelector('.header.open')) {
      document.querySelector('.header').classList.remove('open');
      menu.setAttribute('aria-expanded', 'false');
      menu.focus();
    }
  });
})();
