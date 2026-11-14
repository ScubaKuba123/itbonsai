(function () {
  const ID = 'G-SPBZV7WDPN';
  let started = false;
  function start() {
    // No Google request before opt-in. Never send preview visits to production GA4.
    if (started || location.hostname !== 'itbonsai.pl' || !window.BonsaiPrivacy?.analyticsAllowed()) return;
    started = true;
    window['ga-disable-' + ID] = false;
    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
    window.gtag('consent','default',{analytics_storage:'granted',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'});
    window.gtag('js', new Date());
    window.gtag('config', ID, {allow_google_signals:false,allow_ad_personalization_signals:false,cookie_expires:15552000});
    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=' + ID;
    document.head.appendChild(script);
  }
  window.addEventListener('bonsai:privacy-change',start);
  start();
})();
