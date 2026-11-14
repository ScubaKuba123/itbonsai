# Kami control clearance — 2026-11-14

Scope: shared launcher only; no contact/chat requests submitted.

Baseline live scan: 19 routes at 375x812 and 1440x900. Collisions included portfolio filters/preview links, contact select, Useme links and service links.

Fix: reserve footer area, move launcher above visible interactive elements, protect complete forms and dialogs, temporarily hide when no safe position exists or mobile menu/chat is open. Restore keyboard focus on chat close. Passive scroll plus one requestAnimationFrame; no timer or dependency.

Preview verification: 19 routes at 375x812, 768x900, 1440x900; 595 sampled scroll positions, zero control collisions. After adding full-form protection, contact form focus rechecked: launcher hidden, form unobstructed. Menu open hides launcher; chat opens/closes and restores focus. No errors/warnings in final contact console. JavaScript syntax and diff whitespace checks PASS. Static site has no package/build script; publishing compiles the existing Cloudflare worker.

Routes: /, /uslugi, /strony-internetowe-gdansk, /strony-internetowe-gdynia, /strony-internetowe-trojmiasto, /strony-internetowe-dla-firm, /seo-gdansk, /seo-techniczne, /automatyzacje-ai-dla-firm, /aplikacje-dla-firm, /realizacje, /seamonk, /cafe-app, /cennik, /o-nas, /kontakt, /polityka-prywatnosci, /dziekujemy, /404.

Limits: sampled scroll positions, browser viewport emulation rather than physical devices; intentionally opened chat is an overlay closed with X/Escape. External project iframe contents were not audited. No form/message submissions.
