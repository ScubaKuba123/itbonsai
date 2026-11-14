export async function onRequest(context) {
  const response = await context.next();
  const cookie = context.request.headers.get("Cookie") || "";



  const country = context.request.cf?.country;
  if (!country || !/^[A-Z]{2}$/.test(country)) return response;

  if (cookie.match(/(?:^|;\s*)bonsai-country=([^;]+)/)?.[1] === country) return response;
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
