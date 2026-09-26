# ITBonsai Google Search Console baseline — 2026-09-26

Property: `sc-domain:itbonsai.pl`
Search Console data settled through: **2026-09-24**

## Current 28-day performance

- Clicks: **1**
- Impressions: **12**
- CTR: **8.33%**
- Average position: **2.67** at site-summary level
- Search Analytics currently exposes only the homepage as a page with impressions.

This dataset is still very small and should not be used for strong ranking/CTR conclusions.

## Discovery / indexing status

URL Inspection was run against all 18 URLs currently found in the published sitemap.

### Indexed

- `https://itbonsai.pl/`
  - Verdict: PASS
  - Coverage: Submitted and indexed
  - Robots: allowed
  - Fetch: successful
  - Last crawl: 2026-09-25
  - Crawled as: mobile

### Unknown to Google

The following sitemap URLs currently return **URL is unknown to Google** in URL Inspection:

- /uslugi
- /strony-internetowe-gdansk
- /strony-internetowe-gdynia
- /strony-internetowe-trojmiasto
- /strony-internetowe-dla-firm
- /seo-gdansk
- /seo-techniczne
- /automatyzacje-ai-dla-firm
- /aplikacje-dla-firm
- /dla-biznesu
- /realizacje
- /seamonk
- /cafe-app
- /koszt-strony-internetowej
- /cennik
- /o-nas
- /kontakt

Old `.html` forms checked for /uslugi, /realizacje, /strony-internetowe-dla-firm and /koszt-strony-internetowej are also unknown to Google.

### WWW host

`https://www.itbonsai.pl/` is known as **Page with redirect**, while the canonical non-www homepage is indexed. This is expected and confirms the preferred host direction is working.

## Sitemap status

Search Console currently has:

`https://itbonsai.pl/sitemap.xml`

- pending: no
- warnings: 0
- errors: 0
- last submitted: 2026-08-27
- last downloaded: 2026-09-08

Current sitemap extraction returns **18 URLs**.

Search Console's sitemap metadata still reports an older submitted count of **17** and indexed count **0**, while URL Inspection confirms the homepage is indexed. Treat the sitemap indexed counter as stale/incomplete, but the fact that 17 non-home URLs are unknown to Google is the real issue.

## Cannibalization

No query cannibalization was detected in the last 28-day window.

This is not evidence that the current architecture is perfect. There is not yet enough search exposure for the local/service pages to compete in Search Console.

## Query data

Visible query examples:

- `bonsai studio`: 2 impressions, avg position 1, 0 clicks
- `bonsi studios`: 1 impression, avg position 60, 0 clicks

The query dataset is too small for content decisions.

## Geographic / device notes

Country data:
- Poland: 9 impressions, 1 click
- USA: 3 impressions, 0 clicks

Device data:
- Mobile: 5 impressions, 1 click
- Desktop: 7 impressions, 0 clicks

Again, sample size is too small for optimization decisions.

## Priority diagnosis

**P0 is discovery/indexing, not more SEO copy.**

The live pages are crawlable in normal web checks and the homepage links to the local/service architecture, but Search Console does not yet know 17 of the 18 sitemap URLs.

The sitemap was last downloaded by Google on 2026-09-08, before the current SEO/local-page update set.

## Required next action

Re-submit the existing sitemap to Search Console so Google queues a fresh fetch.

Attempted through the connected GSC integration on 2026-09-26, but Google's write action was denied because the connected OAuth account currently has only:

`webmasters.readonly`

Required scope:

`webmasters`

Once full Search Console access is enabled, re-submit:

`https://itbonsai.pl/sitemap.xml`

Then re-check priority URL inspections after Google re-fetches the sitemap.

## Do not do yet

- Do not create more city pages.
- Do not publish all six planned articles.
- Do not rewrite titles based on CTR data yet.
- Do not merge pages based on cannibalization yet.

The data is not mature enough.

## Success condition for the next checkpoint

1. Sitemap successfully re-submitted.
2. Google fetches the new sitemap.
3. Priority URLs are no longer "unknown to Google".
4. Local/service pages begin generating impressions.
5. Only then use query, CTR and cannibalization data for the next optimization cycle.
