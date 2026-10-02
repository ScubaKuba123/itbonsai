/* Navigation stays in semantic anchors. Preview activation never replaces the screenshot or CTA. */
document.querySelectorAll('[data-preview-toggle]').forEach(button => {
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
    }
    if (!open) panel.replaceChildren();
  });
});
