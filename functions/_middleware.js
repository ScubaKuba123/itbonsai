export async function onRequest(context) {
  const url = new URL(context.request.url);
  if (url.pathname === "/cennik" || url.pathname === "/cennik.html") {
    return Response.redirect(`${url.origin}/#contact`, 301);
  }

  const response = await context.next();
  const cookie = context.request.headers.get("Cookie") || "";

  if (/(?:^|;\s*)bonsai-country=/.test(cookie)) return response;

  const country = context.request.cf?.country;
  if (!country || !/^[A-Z]{2}$/.test(country)) return response;

  const headers = new Headers(response.headers);
  headers.append(
    "Set-Cookie",
    `bonsai-country=${encodeURIComponent(country)}; Path=/; Max-Age=2592000; SameSite=Lax; Secure`,
  );

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}
