# Kami V1 — Cloudflare Workers AI website chat

Status: implementation branch / NOT DEPLOYED. Does not change the live site until PR is merged and deployed.

## Architecture
- `kami.js`, `kami.css`: lightweight Polish/English home page chat, no frontend framework
- `functions/api/kami.js`: Cloudflare Pages Function serving POST `/api/kami`
- AI model `@cf/meta/llama-3.1-8b-instruct-fp8`; binding name `AI` required
- No visitor conversation storage, email sending or CRM integration
- No credentials in browser

## Required Cloudflare configuration
1. In Cloudflare Dashboard > Workers & Pages > site Pages project > Settings > Bindings, add **Workers AI** binding named **AI**, for Preview and Production separately.
2. Deploy the branch to a Pages preview. If using Cloudflare Pages Git integration, check build settings and that top-level `functions/` is included in deployment. Run the Pages preview with an AI binding.
3. Check `POST /api/kami` using the actual preview domain. The function currently only accepts **https://itbonsai.pl** Referer/Origin for production; for preview QA add a tightly scoped preview origin allowlist before running remote tests. Never use wildcard CORS.
4. Test 10 questions about services, unsupported claims, pricing, PL/EN, injection attempts, no-binder failures, keyboard and mobile viewport.
5. Configure Cloudflare WAF rate limiting for `/api/kami`; JavaScript in-memory throttling is only best-effort per isolate and is not abuse protection.
6. Confirm Workers AI free allowance/usage and ensure model billing settings are suitable.
7. Only after preview PASS: merge, deploy and verify production. For multi-page coverage, add the assets to the shared site template or each target page, not only index.html.

## Limitations
- Tidio script is replaced only on the homepage in this branch; audit other pages before launch.
- No Turnstile or distributed rate limiting yet. Do not launch to high traffic without Cloudflare WAF rule.
- Model answers use verified static BonsAI services, not live website crawling. No promises, quotations or sending data to the studio.
- `/api/kami` is unavailable until the AI binding exists. Do not report live AI as PASS until a real exchange succeeds.
