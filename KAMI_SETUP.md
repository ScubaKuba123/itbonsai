# Kami V1 | Deployment checklist

Status: prepared on branch `feature/kami-cloudflare-ai-v1` (draft PR #23). **Not production deployed.**

## What is implemented
- Kami chat on all **17 sitemap routes**, replacing the Tidio embed in their HTML files.
- Three interface and response languages: Polish, English, Japanese (日本語).
- Cloudflare Pages Function `POST /api/kami` with Workers AI.
- Model: `@cf/google/gemma-4-26b-a4b-it` (Workers Free eligible on 2026-11-06; usage is subject to free neuron limits).
- Knowledge source: content extracted from all 17 repository sitemap pages and concise general professional knowledge of web design, redesign, SEO, accessibility, apps and ecommerce.
- Dynamic lexical retrieval selects relevant source pages and prioritizes pricing and portfolio when asked. The knowledge is a **snapshot** and must be refreshed when site copy changes.
- No collection or storage of visitors' chat data, no leads submitted and no outbound email. The conversation history is held in the tab only.
- The answer is not guaranteed correct; invite people to contact the studio for confirmation.
- Best-effort per-isolate rate limiting only, so a Cloudflare WAF rate-limit rule is required for launch.

## Cloudflare setup (required before merge)
1. In Cloudflare Dashboard > Workers & Pages > the actual **itbonsai.pl Pages project** > Settings > **Preview** environment > Bindings > Add > **Workers AI**, variable name `AI`.
2. Set Preview plain text variable `KAMI_PREVIEW_ORIGIN` to the actual **https://branch-name.project.pages.dev** preview hostname. Only HTTPS hostnames ending in `.pages.dev` are allowed, no wildcards.
3. Redeploy preview. Check app logs and run a real model response in PL/EN/JA.
4. On Cloudflare add a WAF rate limiting rule for `/api/kami` and confirm free neuron allowance/cost controls. Validate login/contact form and no script conflicts.
5. Perform visual and keyboard QA at 1440×900, 768×1024 and 375×812 on home, pricing, portfolio, contact and service pages. Test a 503 fallback, chat hide/show and Japanese language selector.
6. Only after PASS configure the same `AI` binding on **Production**, merge PR #23 and verify production POST requests and Tidio absence.

## Content update
Source: sitemap.xml and 17 HTML pages in this repo at snapshot date 2026-11-06.
To refresh the knowledge after changes, re-extract published text into `functions/_lib/kami-knowledge.js`, keeping accurate source URLs.
A future crawler could automate content refreshing, but do not let arbitrary external text overwrite the system prompt.

## Scope and limitations
- Zero live Cloudflare credentials are in this repo. This PR does NOT configure Cloudflare bindings or deploy directly.
- This is an AI chat, not a CRM and not the KODAMA sales agent.
- No synthetic success claims. Do not launch the widget before live provider verification.
