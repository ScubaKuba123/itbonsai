(() => {
  'use strict';
  const panel = document.getElementById('kami-panel');
  if (!panel) return;
  const texts = {
    pl: {unknown:'Wysyłka nie została jeszcze potwierdzona. Sprawdź status tym samym przyciskiem; nie wysyłaj ponownie inną drogą.',rate:'Zbyt wiele prób. Odczekaj 10 minut i spróbuj ponownie.',fallback:'Otwórz w poczcie',open:'Napisz e-mail',title:'Wiadomość do BonsAI',name:'Imię',email:'Twój e-mail',subject:'Temat',body:'Treść do sprawdzenia',draft:'Ułóż szkic z Kami',send:'Zatwierdź i wyślij e-mail',back:'Wróć do rozmowy',consent:'Zatwierdzam treść i wysyłkę do studio@itbonsai.pl.',privacy:'Polityka prywatności',ready:'Sprawdź szkic, uzupełnij dane i zatwierdź wysyłkę.',working:'Przygotowuję szkic…',sending:'Wysyłanie…',success:'Wiadomość została wysłana do BonsAI Studio. Dziękujemy!',error:'Nie udało się potwierdzić wysłania. Treść została zachowana. Możesz napisać na studio@itbonsai.pl.',draftError:'Kami jest chwilowo niedostępny. Możesz samodzielnie edytować i wysłać szkic.',subjectDefault:'Zapytanie z Kami Chat',intro:'Dzień dobry,\n\nChcę porozmawiać o projekcie:\n',outro:'\n\nProszę o kontakt w sprawie zakresu i wyceny.'},
    en: {unknown:'Sending is not confirmed yet. Check again with the same button; do not resend through another channel.',rate:'Too many attempts. Please wait 10 minutes and try again.',fallback:'Open in email app',open:'Write an email',title:'Message BonsAI',name:'Name',email:'Your email',subject:'Subject',body:'Review your message',draft:'Draft with Kami',send:'Approve and send email',back:'Back to chat',consent:'I approve this message and sending it to studio@itbonsai.pl.',privacy:'Privacy policy',ready:'Review the draft, fill in your details and approve sending.',working:'Preparing draft…',sending:'Sending…',success:'Your message has been sent to BonsAI Studio. Thank you!',error:'Sending could not be confirmed. Your draft is preserved. You can email studio@itbonsai.pl.',draftError:'Kami is temporarily unavailable. You can edit and send the draft yourself.',subjectDefault:'Enquiry from Kami Chat',intro:'Hello,\n\nI would like to discuss a project:\n',outro:'\n\nPlease contact me about the scope and a quote.'},
    ja: {unknown:'送信をまだ確認できません。同じボタンで再確認してください。別の方法で再送しないでください。',rate:'試行回数が多すぎます。10分ほど待ってから再試行してください。',fallback:'メールアプリで開く',open:'メールを書く',title:'BonsAIへのお問い合わせ',name:'お名前',email:'メールアドレス',subject:'件名',body:'内容をご確認ください',draft:'Kamiで下書きを作成',send:'内容を承認して送信',back:'チャットに戻る',consent:'内容を確認し、studio@itbonsai.plへ送信することを承認します。',privacy:'プライバシーポリシー',ready:'下書きを確認し、お名前とメールアドレスを入力して送信を承認してください。',working:'下書きを作成中…',sending:'送信中…',success:'BonsAI Studioへのメッセージを送信しました。ありがとうございます。',error:'送信を確認できませんでした。下書きは保存されています。studio@itbonsai.plに直接ご連絡いただけます。',draftError:'現在Kamiをご利用いただけません。下書きを編集して送信できます。',subjectDefault:'Kami Chatからのお問い合わせ',intro:'こんにちは。\n\n以下のプロジェクトについて相談したいです。\n',outro:'\n\n範囲とお見積もりについてご連絡をお願いいたします。'}
  };
  const picker = document.getElementById('kami-language');
  const t = () => texts[picker.value] || texts.pl;
  const launch = document.createElement('button');
  launch.id = 'kami-email-open'; launch.type = 'button';
  document.getElementById('kami-footer').before(launch);
  const composer = document.createElement('form');
  composer.id = 'kami-email'; composer.hidden = true;
  composer.innerHTML = '<label class="kami-trap" aria-hidden="true">Website<input name="website" tabindex="-1" autocomplete="off"></label><h3></h3><p class="kami-recipient">studio@itbonsai.pl</p><label><span data-label="name"></span><input name="name" autocomplete="name" maxlength="100" required></label><label><span data-label="email"></span><input name="email" type="email" autocomplete="email" maxlength="254" required></label><label><span data-label="subject"></span><input name="subject" maxlength="150" required></label><label><span data-label="body"></span><textarea name="message" rows="5" maxlength="4000" required></textarea></label><button type="button" data-action="draft"></button><label class="kami-consent"><input type="checkbox" name="approved" required><span data-label="consent"></span></label><a href="/polityka-prywatnosci" target="_blank" rel="noopener" data-label="privacy"></a><p role="status" id="kami-email-status"></p><a id="kami-email-fallback" hidden></a><button type="submit" data-action="send"></button><button type="button" data-action="back"></button>';
  document.getElementById('kami-header').after(composer);
  const field = name => composer.elements.namedItem(name);
  const status = document.getElementById('kami-email-status');
  let working = false, sent = false, submissionId = null, lastPayload = "";
  function setStatus(key) { status.dataset.key = key; status.textContent = t()[key]; }
  function render() {
    launch.textContent = t().open;
    if (status.dataset.key) status.textContent = t()[status.dataset.key];
    if (Object.values(texts).some(copy => field('subject').value === copy.subjectDefault)) field('subject').value = t().subjectDefault;
    if (Object.values(texts).some(copy => field('message').value === copy.intro + copy.outro)) field('message').value = t().intro + t().outro;
    document.getElementById('kami-email-fallback').textContent = t().fallback;
    composer.querySelector('h3').textContent = t().title;
    composer.querySelectorAll('[data-label]').forEach(el => el.textContent = t()[el.dataset.label]);
    composer.querySelectorAll('[data-action]').forEach(el => el.textContent = t()[el.dataset.action]);
  }
  function show(open) {
    composer.hidden = !open;
    ['kami-messages','kami-actions','kami-form','kami-email-open','kami-footer'].forEach(id => document.getElementById(id).hidden = open);
    (open ? field('name') : document.getElementById('kami-input')).focus();
  }
  launch.addEventListener('click', () => {
    if (!field('message').value) {
      const userMessages = [...document.querySelectorAll('#kami-messages .user')].map(el => el.textContent);
      field('subject').value = t().subjectDefault;
      field('message').value = (t().intro + userMessages.join('\n') + t().outro).slice(0,4000);
      setStatus('ready');
    }
    show(true);
  });
  composer.querySelector('[data-action="back"]').addEventListener('click', () => show(false));
  function lock(value) {
    working = value;
    composer.querySelectorAll('input,textarea,button').forEach(el => el.disabled = value);
    picker.disabled = value;
  }
  composer.addEventListener('input', () => { sent = false; composer.querySelector('[data-action="send"]').disabled = false; if (document.activeElement !== field('approved')) field('approved').checked = false; });
  composer.querySelector('[data-action="draft"]').addEventListener('click', async () => {
    if (working) return;
    lock(true); setStatus('working');
    try {
      const response = await fetch('/api/kami', {method:'POST',headers:{'Content-Type':'application/json'},signal:AbortSignal.timeout(20000),body:JSON.stringify({mode:'draft',lang:picker.value,message:field('message').value})});
      const data = await response.json();
      if (!response.ok || typeof data.reply !== 'string') throw Error('Draft unavailable');
      field('message').value = data.reply; field('approved').checked = false; sent = false;
      setStatus('ready');
    } catch { setStatus('draftError'); }
    finally { lock(false); }
  });
  composer.addEventListener('submit', async event => {
    event.preventDefault();
    if (working || sent || !composer.reportValidity()) return;
    const payload = {mode:'email',name:field('name').value.trim(),email:field('email').value.trim(),message:field('message').value.trim(),subject:field('subject').value.trim(),approved:field('approved').checked,website:field('website').value};
    const signature = JSON.stringify(payload);
    if (signature !== lastPayload || !submissionId) { submissionId = crypto.randomUUID(); lastPayload = signature; }
    payload.submissionId = submissionId;
    lock(true); setStatus('sending'); document.getElementById('kami-email-fallback').hidden = true;
    try {
      const response = await fetch('/api/kami', {method:'POST',headers:{'Content-Type':'application/json',Accept:'application/json'},body:JSON.stringify(payload),signal:AbortSignal.timeout(35000)});
      const data = await response.json().catch(() => ({}));
      if (data.retryable) submissionId = null;
      if (response.status === 429) throw Object.assign(Error('Rate limited'), {kind:'rate'});
      if (response.status !== 200 || data.success !== true) throw Object.assign(Error('Sending unconfirmed'), {kind:data.retryable ? 'error' : 'unknown'});
      sent = true; setStatus('success');
    } catch (error) { setStatus(error.kind || 'unknown'); const fallback = document.getElementById('kami-email-fallback'); fallback.textContent = t().fallback; fallback.href = 'mailto:studio@itbonsai.pl?subject=' + encodeURIComponent(payload.subject) + '&body=' + encodeURIComponent(payload.message + '\n\n' + payload.name + '\n' + payload.email); fallback.hidden = error.kind !== 'error'; }
    finally { lock(false); composer.querySelector('[data-action="send"]').disabled = sent; }
  });
  picker.addEventListener('change', render); render();
})();
