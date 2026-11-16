/* Stable Polish canonical content for search engines and first-time visitors.
   Preserve explicit PL/EN/JA preferences saved in localStorage.
   Do not pick a language from IP, country cookies or user-agent. */
(() => {
  const supported = new Set(['pl','en','ja']);
  function initial() {
    try {
      const saved = localStorage.getItem('bonsai-language');
      if (supported.has(saved)) return saved;
    } catch (_) {
      // Storage can be unavailable to bots or privacy-conscious browsers.
    }
    return 'pl';
  }
  window.BonsaiLocale={initial};
  document.documentElement.lang=initial();
})();
