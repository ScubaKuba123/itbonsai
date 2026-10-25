function fitPortfolioPreview(panel) {
  if (!document.body.classList.contains('editorial-portfolio')) return;
  const fit = () => {
    const frame = panel.querySelector('iframe');
    const width = panel.clientWidth;
    if (!frame || !width) return;
    const mobile = window.matchMedia('(max-width:600px)').matches;
    const viewportWidth = mobile ? 390 : 1440;
    const viewportHeight = mobile ? 780 : 900;
    const scale = width / viewportWidth;
    frame.style.width = viewportWidth + 'px';
    frame.style.height = viewportHeight + 'px';
    frame.style.transform = 'scale(' + scale + ')';
    panel.style.height = viewportHeight * scale + 'px';
  };
  const observer = new ResizeObserver(fit);
  observer.observe(panel);
  fit();
  return () => observer.disconnect();
}
document.querySelectorAll('.garden-preview-viewport').forEach(fitPortfolioPreview);

/* Navigation stays in semantic anchors. Preview activation never replaces the screenshot or CTA. */
document.querySelectorAll('[data-preview-toggle]').forEach(button => {
  let stopObserving;
  button.addEventListener('click', () => {
    const panel = document.getElementById(button.getAttribute('aria-controls'));
    const open = button.getAttribute('aria-expanded') !== 'true';
    button.setAttribute('aria-expanded', String(open));
    panel.hidden = !open;
    if (open && !panel.firstElementChild) {
      const frame = document.createElement('iframe');
      frame.title = button.dataset.previewTitle;
      frame.src = button.dataset.previewSource;
      frame.sandbox = 'allow-scripts allow-same-origin';
      frame.referrerPolicy = 'no-referrer';
      frame.loading = 'lazy';
      panel.append(frame);
      stopObserving = fitPortfolioPreview(panel);
    }
    if (!open) {
      stopObserving?.();
      panel.replaceChildren();
    }
  });
});
