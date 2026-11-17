/* BonsAI SEO WAY R3 — consent-aware lead measurement.
 * No personal data, phone numbers, e-mails or form fields enter GA4 events.
 * Analytics is disabled on previews and without explicit opt-in. */
(() => {
  'use strict';
  const canMeasure = () =>
    location.hostname === 'itbonsai.pl' &&
    window.BonsaiPrivacy?.analyticsAllowed() === true &&
    typeof window.gtag === 'function';

  function measure(name, parameters) {
    if (!canMeasure()) return;
    window.gtag('event', name, parameters);
  }

  document.addEventListener('click', event => {
    const anchor = event.target?.closest?.('a[href]');
    if (!anchor) return;
    const href = anchor.getAttribute('href') || '';
    let method;
    if (/^tel:/i.test(href)) method = 'phone';
    else if (/^mailto:/i.test(href)) method = 'email';
    else {
      try {
        const url = new URL(href, location.href);
        if (['wa.me', 'api.whatsapp.com', 'web.whatsapp.com'].includes(url.hostname.toLowerCase())) {
          method = 'whatsapp';
        }
      } catch (_) { /* Ignore invalid third-party or relative URLs. */ }
    }
    if (method) measure('contact_intent', {contact_method: method});
  });

  // Dispatched only after /api/kami confirms status 200 and success:true.
  window.addEventListener('bonsai:contact-success', () =>
    measure('generate_lead', {lead_source: 'contact_form'})
  );
})();
