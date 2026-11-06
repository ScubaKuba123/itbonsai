(() => {
  'use strict';
  const panel = document.getElementById('kami-panel');
  if (!panel) return;
  const texts = {
    pl: {fallback:'Otwórz w poczcie',open:'Napisz e-mail',title:'Wiadomość do BonsAI',name:'Imię',email:'Twój e-mail',subject:'Temat',body:'Treść do sprawdzenia',draft:'Ułóż szkic z Kami',send:'Zatwierdź i wyślij e-mail',back:'Wróć do rozmowy',consent:'Zatwierdzam treść i wysyłkę do studio@itbonsai.pl przez FormSubmit.',privacy:'Polityka prywatności',ready:'Sprawdź szkic, uzupełnij dane i zatwierdź wysyłkę.',working:'Przygotowuję szkic…',sending:'Wysyłanie…',success:'FormSubmit przyjął wiadomość do wysyłki. Dziękujemy! To nie jest potwierdzenie doręczenia.',error:'Nie udało się potwierdzić wysłania. Treść została zachowana. Możesz napisać na studio@itbonsai.pl.',draftError:'Kami jest chwilowo niedostępny. Możesz samodzielnie edytować i wysłać szkic.',subjectDefault:'Zapytanie z Kami Chat',intro:'Dzień dobry,\n\nChcę porozmawiać o projekcie:\n',outro:'\n\nProszę o kontakt w sprawie zakresu i wyceny.'},
    en: {fallback:'Open in email app',open:'Write an email',title:'Message BonsAI',name:'Name',email:'Your email',subject:'Subject',body:'Review your message',draft:'Draft with Kami',send:'Approve and send email',back:'Back to chat',consent:'I approve this message and sending it to studio@itbonsai.pl via FormSubmit.',privacy:'Privacy policy',ready:'Review the draft, fill in your details and approve sending.',working:'Preparing draft…',sending:'Sending…',success:'FormSubmit accepted the message for sending. Thank you! This is not delivery confirmation.',error:'Sending could not be confirmed. Your draft is preserved. You can email studio@itbonsai.pl.',draftError:'Kami is temporarily unavailable. You can edit and send the draft yourself.',subjectDefault:'Enquiry from Kami Chat',intro:'Hello,\n\nI would like to discuss a project:\n',outro:'\n\nPlease contact me about the scope and a quote.'},
    ja: {fallback:'メールアプリで開く',open:'メールを書く',title:'BonsAIへのお問い合わせ',name:'お名前',email:'メールアドレス',subject:'件名',body:'内容をご確認ください',draft:'Kamiで下書きを作成',send:'内容を承認して送信',back:'チャットに戻る',consent:'内容を確認し、FormSubmit経由でstudio@itbonsai.plへ送信することを承認します。',privacy:'プライバシーポリシー',ready:'下書きを確認し、お名前とメールアドレスを入力して送信を承認してください。',working:'下書きを作成中…',sending:'送信中…',success:'FormSubmitが送信リクエストを受け付けました。これは配達完了の確認ではありません。',error:'送信を確認できませんでした。下書きは保存されています。studio@itbonsai.plに直接ご連絡いただけます。',draftError:'現在Kamiをご利用いただけません。下書きを編集して送信できます。',subjectDefault:'Kami Chatからのお問い合わせ',intro:'こんにちは。\n\n以下のプロジェクトについて相談したいです。\n',outro:'\n\n範囲とお見積もりについてご連絡をお願いいたします。'}
  };
  const picker = document.getElementById('kami-language');
  const t = () => texts[picker.value] || texts.pl;
  const launch = document.createElement('button');
  launch.id = 'kami-email-open'; launch.type = 'button';
  document.getElementById('kami-footer').before(launch);
  const composer = document.createElement('form');
  composer.id = 'kami-email'; composer.hidden = true;
  composer.innerHTML = '<h3></h3><p class="kami-recipient">studio@itbonsai.pl</p><label><span data-label="name"></span><input name="name" autocomplete="name" maxlength="100" required></label><label><span data-label="email"></span><input name="email" type="email" autocomplete="email" maxlength="254" required></label><label><span data-label="subject"></span><input name="subject" maxlength="150" required></label><label><span data-label="body"></span><textarea name="message" rows="5" maxlength="4000" required></textarea></label><button type="button" data-action="draft"></button><label class="kami-consent"><input type="checkbox" name="approved" required><span data-label="consent"></span></label><a href="/polityka-prywatnosci" target="_blank" rel="noopener" data-label="privacy"></a><p role="status" id="kami-email-status"></p><a id="kami-email-fallback" hidden></a><button type="submit" data-action="send"></button><button type="button" data-action="back"></button>';
  document.getElementById('kami-header').after(composer);
  const field = name => composer.elements.namedItem(name);
  const status = document.getElementById('kami-email-status');
  let working = false, sent = false;
  function render() {
    launch.textContent = t().open;
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
      status.textContent = t().ready;
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
    lock(true); status.textContent = t().working;
    try {
      const response = await fetch('/api/kami', {method:'POST',headers:{'Content-Type':'application/json'},signal:AbortSignal.timeout(20000),body:JSON.stringify({mode:'draft',lang:picker.value,message:field('message').value})});
      const data = await response.json();
      if (!response.ok || typeof data.reply !== 'string') throw Error('Draft unavailable');
      field('message').value = data.reply; field('approved').checked = false; sent = false;
      status.textContent = t().ready;
    } catch { status.textContent = t().draftError; }
    finally { lock(false); }
  });
  composer.addEventListener('submit', async event => {
    event.preventDefault();
    if (working || sent || !composer.reportValidity()) return;
    const payload = {name:field('name').value.trim(),email:field('email').value.trim(),message:field('message').value.trim(),_subject:field('subject').value.trim(),_template:'table',_url:'https://itbonsai.pl/',_captcha:'false'};
    lock(true); status.textContent = t().sending; document.getElementById('kami-email-fallback').hidden = true;
    try {
      const response = await fetch('https://formsubmit.co/ajax/studio@itbonsai.pl', {method:'POST',headers:{'Content-Type':'application/json',Accept:'application/json'},body:JSON.stringify(payload),signal:AbortSignal.timeout(25000)});
      const data = await response.json();
      if (!response.ok || !(data.success === true || data.success === 'true') || /activat/i.test(data.message || '')) throw Error('Sending unconfirmed');
      sent = true; status.textContent = t().success;
    } catch { status.textContent = t().error; const fallback = document.getElementById('kami-email-fallback'); fallback.textContent = t().fallback; fallback.href = 'mailto:studio@itbonsai.pl?subject=' + encodeURIComponent(payload._subject) + '&body=' + encodeURIComponent(payload.message + '\n\n' + payload.name + '\n' + payload.email); fallback.hidden = false; }
    finally { lock(false); composer.querySelector('[data-action="send"]').disabled = sent; }
  });
  picker.addEventListener('change', render); render();
})();
