(() => {
  const shapes = {
    leaf: '<path d="M20 4C10 2 3 8 5 15s13 6 15-11Z"/><path d="M4 21 15 10"/>',
    web: '<rect x="3" y="4" width="18" height="15" rx="2"/><path d="M3 9h18M7 6.5h.01M10 6.5h.01M8 22h8"/>',
    app: '<rect x="4" y="3" width="16" height="18" rx="3"/><path d="M8 8h8M8 12h3M14 12h2M8 16h8"/>',
    flow: '<rect x="3" y="3" width="6" height="6" rx="1"/><rect x="15" y="15" width="6" height="6" rx="1"/><path d="M9 6h8v9M6 9v9h9"/>'
  };
  const icon = /aplikacje|cafe/.test(location.pathname) ? 'app' : /automatyzacje/.test(location.pathname) ? 'flow' : /strony|seo/.test(location.pathname) ? 'web' : 'leaf';
  document.querySelectorAll('.page-card, .offer-card').forEach(card => {
    if (card.querySelector('svg, .forest-card-icon')) return;
    const mark = document.createElement('span');
    mark.className = 'forest-card-icon';
    mark.setAttribute('aria-hidden', 'true');
    mark.innerHTML = '<svg class="forest-icon" viewBox="0 0 24 24">' + shapes[icon] + '</svg>';
    card.prepend(mark);
  });
  const header = document.querySelector('.header');
  document.addEventListener('keydown', event => {
    if (event.key !== 'Escape' || !header?.classList.contains('open')) return;
    const menu = header.querySelector('.menu');
    header.classList.remove('open');
    menu?.setAttribute('aria-expanded', 'false');
    menu?.focus();
  });
})();
