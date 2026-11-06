(() => {
  'use strict';
  const form = document.querySelector('.contact-form');
  if (!form) return;
  const button = form.querySelector('button[type="submit"]');
  const status = document.getElementById('contact-status');
  const copy = {
    pl: {send:'Wyślij zapytanie →',sending:'Wysyłanie…',success:'Dziękujemy! Twoje zapytanie zostało wysłane do BonsAI Studio.',error:'Wysyłka jest chwilowo niedostępna. Treść została zachowana. Spróbuj ponownie lub napisz na studio@itbonsai.pl.',unknown:'Nie udało się jeszcze potwierdzić wysyłki. Sprawdź status tym samym przyciskiem — nie wysyłaj ponownie inną drogą.',rate:'Zbyt wiele prób. Odczekaj 10 minut i spróbuj ponownie.'},
    en: {send:'Send enquiry →',sending:'Sending…',success:'Thank you! Your enquiry has been sent to BonsAI Studio.',error:'Sending is temporarily unavailable. Your message is preserved. Try again or email studio@itbonsai.pl.',unknown:'Sending is not confirmed yet. Check again with the same button; do not resend through another channel.',rate:'Too many attempts. Please wait 10 minutes and try again.'},
    ja: {send:'お問い合わせを送信 →',sending:'送信中…',success:'お問い合わせをBonsAI Studioに送信しました。ありがとうございます。',error:'現在送信できません。内容は保持されています。再試行するかstudio@itbonsai.plにご連絡ください。',unknown:'送信をまだ確認できません。同じボタンで再確認してください。別の方法で再送しないでください。',rate:'試行回数が多すぎます。10分ほど待ってから再試行してください。'}
  };
  const t = () => copy[document.documentElement.lang.split('-')[0]] || copy.pl;
  let busy = false, sent = false, submissionId = null, signature = '', statusKey = '';
  function render() {button.textContent = busy ? t().sending : t().send; status.textContent = statusKey ? t()[statusKey] : '';}
  const value = name => form.elements.namedItem(name).value.trim();
  form.addEventListener('input', () => {if (busy) return; sent = false; statusKey = ''; button.disabled = false; render();});
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (busy || sent || !form.reportValidity()) return;
    const payload = {mode:'email',source:'contact',name:value('name'),email:value('email'),subject:value('service'),message:value('message'),website:value('website'),approved:true};
    const current = JSON.stringify(payload);
    if (signature !== current || !submissionId) {submissionId = crypto.randomUUID(); signature = current;}
    payload.submissionId = submissionId;
    busy = true; statusKey = 'sending';
    form.querySelectorAll('input,select,textarea,button').forEach(el => el.disabled = true);
    render();
    try {
      const response = await fetch('/api/kami',{method:'POST',headers:{'Content-Type':'application/json',Accept:'application/json'},body:JSON.stringify(payload),signal:AbortSignal.timeout(35000)});
      const data = await response.json().catch(() => ({}));
      if (data.retryable) submissionId = null;
      if (response.status === 429) statusKey = 'rate';
      else if (response.status === 200 && data.success === true) {sent = true; statusKey = 'success';}
      else statusKey = data.retryable ? 'error' : 'unknown';
    } catch {statusKey = 'unknown';}
    finally {
      busy = false;
      form.querySelectorAll('input,select,textarea,button').forEach(el => el.disabled = false);
      button.disabled = sent;
      render();
    }
  });
  new MutationObserver(render).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
  button.disabled = false;
  render();
})();
