// Aggregate only: no IP addresses, cookies, user IDs, paths or referrers are stored.
const origin = 'https://itbonsai.pl';
const reply = (value, status = 200) => Response.json(value, {status, headers: {'Cache-Control':'no-store', 'X-Content-Type-Options':'nosniff'}});
export async function onRequest({request, env}) {
  if (new URL(request.url).origin !== origin) return reply({error:'Production only'},403);
  if (!['GET','POST'].includes(request.method)) return reply({error:'Method not allowed'},405);
  if (request.method === 'POST') {
    if (request.headers.get('Origin') !== origin || request.headers.get('Sec-Fetch-Site') !== 'same-origin' || request.headers.get('X-Bonsai-View') !== '1') return reply({error:'Invalid origin'},403);
    if (/bot|crawler|spider|headless|preview|lighthouse|curl|wget/i.test(request.headers.get('User-Agent') || '') || request.cf?.botManagement?.verifiedBot) return reply({error:'Automated traffic'},403);
  }
  if (!env.KAMI_MAIL_DB) return reply({error:'Counter unavailable'},503);
  try {
    const sql = request.method === 'POST'
      ? 'UPDATE studio_pageviews SET total = total + 1 WHERE id = 1 RETURNING total, started_at'
      : 'SELECT total, started_at FROM studio_pageviews WHERE id = 1';
    const row = await env.KAMI_MAIL_DB.prepare(sql).first();
    if (!row) return reply({error:'Counter unavailable'},503);
    return reply({total:row.total, since:row.started_at, metric:'pageviews'});
  } catch { return reply({error:'Counter unavailable'},503); }
}
