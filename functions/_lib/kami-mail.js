const MAILBOX = 'studio@itbonsai.pl';
const headers = {'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'};
const json = (body, status = 200) => Response.json(body, {status, headers});
const hash = async value => [...new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value)))].map(b=>b.toString(16).padStart(2,'0')).join('');

// This endpoint has no recipient/from/HTML parameters: it can only notify the owner.
// Store hashes and delivery state, never the visitor's message or email address.
export async function sendKamiMail(input, request, env, fetcher = fetch) {
  const clean = (value, max) => typeof value === 'string' && value.trim().length <= max ? value.trim() : '';
  const name = clean(input.name, 100), email = clean(input.email, 254);
  const subject = clean(input.subject, 150), message = clean(input.message, 4000);
  const id = clean(input.submissionId, 36);
  if (input.approved !== true || input.website || input.to || input.from || !name || !subject || !message ||
      /[\r\n]/.test(name + email + subject) || !/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(email) ||
      !/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i.test(id)) return json({error:'Invalid enquiry'},400);
  const db = env.KAMI_MAIL_DB;
  if (!db || !['ZOHO_CLIENT_ID','ZOHO_CLIENT_SECRET','ZOHO_REFRESH_TOKEN','ZOHO_ACCOUNT_ID'].every(k=>env[k])) return json({error:'Email unavailable',retryable:true},503);
  const now = Date.now();
  const fingerprint = await hash(JSON.stringify([name,email,subject,message]));
  const ipHash = await hash(env.ZOHO_CLIENT_SECRET + '\0' + (request.headers.get('CF-Connecting-IP') || 'unknown'));
  try {
    await db.prepare('DELETE FROM kami_mail WHERE created_at < ?').bind(now - 7*86400000).run();
    // One atomic statement enforces both durable quotas and a unique submission claim.
    const claimed = await db.prepare(`INSERT OR IGNORE INTO kami_mail (id,fingerprint,ip_hash,created_at,status)
      SELECT ?,?,?,?,'pending' WHERE
      (SELECT COUNT(*) FROM kami_mail WHERE ip_hash=? AND created_at>?) < 3 AND
      (SELECT COUNT(*) FROM kami_mail WHERE ip_hash=? AND created_at>?) < 10 AND
      (SELECT COUNT(*) FROM kami_mail WHERE created_at>?) < 100`)
      .bind(id,fingerprint,ipHash,now,ipHash,now-600000,ipHash,now-86400000,now-86400000).run();
    if (!claimed.meta.changes) {
      const prior = await db.prepare('SELECT fingerprint,status FROM kami_mail WHERE id=?').bind(id).first();
      if (!prior) return json({error:'Please try later'},429);
      if (prior.fingerprint !== fingerprint) return json({error:'Submission changed'},409);
      if (prior.status === 'sent') return json({success:true,reference:id});
      if (prior.status === 'failed') return json({error:'Email unavailable',retryable:true},503);
      return json({error:'Delivery not confirmed; do not resend automatically',reference:id},202);
    }
    let token;
    try {
      const auth = await fetcher('https://accounts.zoho.eu/oauth/v2/token', {method:'POST',
        body:new URLSearchParams({grant_type:'refresh_token',client_id:env.ZOHO_CLIENT_ID,client_secret:env.ZOHO_CLIENT_SECRET,refresh_token:env.ZOHO_REFRESH_TOKEN}),signal:AbortSignal.timeout(10000)});
      const data = await auth.json();
      if (!auth.ok || !data.access_token) throw Error('Authorization unavailable');
      token = data.access_token;
    } catch {
      await db.prepare("UPDATE kami_mail SET status='failed' WHERE id=?").bind(id).run();
      return json({error:'Email unavailable',retryable:true},503);
    }
    try {
      const result = await fetcher('https://mail.zoho.eu/api/accounts/'+encodeURIComponent(env.ZOHO_ACCOUNT_ID)+'/messages', {
        method:'POST',headers:{Authorization:'Zoho-oauthtoken '+token,'Content-Type':'application/json'},signal:AbortSignal.timeout(15000),
        body:JSON.stringify({fromAddress:MAILBOX,toAddress:MAILBOX,subject:'[Kami Chat] '+subject+' [K:'+id+']',
          content:'Zapytanie z Kami Chat\nImię: '+name+'\nOdpowiedz na: '+email+'\n\n'+message+'\n\nIdentyfikator: '+id,
          mailFormat:'plaintext',encoding:'UTF-8'})
      });
      // Zoho identifiers exceed JS safe integer range; never parse them as numbers.
      const data = JSON.parse((await result.text()).replace(/("messageId"\s*:\s*)(\d{16,})(?=\s*[,}])/g,'$1"$2"'));
      if (!result.ok || data.status?.code !== 200 || !data.data?.messageId) throw Error('Delivery unconfirmed');
      await db.prepare("UPDATE kami_mail SET status='sent',provider_id=? WHERE id=?").bind(String(data.data.messageId),id).run();
      return json({success:true,reference:id});
    } catch {
      await db.prepare("UPDATE kami_mail SET status='unknown' WHERE id=?").bind(id).run();
      return json({error:'Delivery not confirmed; do not resend automatically',reference:id},202);
    }
  } catch {
    // A durable claim can survive an interrupted request; a retry only reads its state.
    return json({error:'Delivery not confirmed',reference:id},503);
  }
}
