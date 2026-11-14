# itbonsai.pl — Safe redesign workflow
Date: 2026-11-14
Status: construction workflow established; redesign not started.
Technology: existing static HTML/CSS/JavaScript; Cloudflare backend for Kami/email.
Recommended tools: Codex for source changes and browser QA; Sites for private review.
Repository: https://github.com/ScubaKuba123/itbonsai
Construction branch: redesign/sites-2026-11-14
Verified starting commit: 3efd49e63ec50f53d9878451db2e35e8bf29e0d0
Sites project: appgprj_6af86abb6ecc8191b0cc473eeeb3fbcd
Preview: https://itbonsai-studio-new.scubakuba698.chatgpt.site/

## Ownership and isolation
GitHub remains the source of truth. Work only on the public Studio website.
Keep HQ, Garden, Office and Forest runtimes outside this project.
Commit redesign changes only to the construction branch. Never force-push main.
No merge, production deployment or DNS change without the owner's explicit approval of the exact release.
This is a documented process, not verified GitHub branch protection.
Provider automatic deployment settings have not been verified; inspect them before any production release.
Only one active editor owns a file at a time. Fetch and compare before every synchronization.

## Known preview differences
Sites is a separate repository, not an automatic GitHub sync.
The current preview replaces contact-form.js and kami.js with links to the original site.
These substitutions MUST NOT be copied into a production release.
Kami and email depend on Cloudflare AI, D1, origin checks and mail credentials.
Do not copy credentials, .env files or provider state. Do not weaken origin checks.
Preserve functions/, wrangler.toml, contact-form.js, kami.js and kami-contact.js from GitHub unless a separately reviewed functional change is authorized.

## Construction loop
1. Record the current GitHub commit and clean working-tree status.
2. Agree the visual scope in this conversation; retain the existing content and working behavior unless requested otherwise.
3. Implement one coherent design increment in the construction branch.
4. Transfer only the reviewed frontend changes to Sites. Keep preview-specific adaptations separate.
5. Inspect desktop (1440 and 1024), tablet (768), and mobile (390 and 375).
6. Test navigation, clean URLs, language switching, animation controls, keyboard/focus, reduced motion, local assets and console/network failures.
7. Show the actual rendered preview and record remaining issues. Do not treat build success as visual approval.

## Transfer back to GitHub
Never replace the repository wholesale with the Sites dist directory.
Fetch main and compare it with the recorded baseline before export.
If main changed, review its changes and merge/rebase intentionally; preserve newer user edits.
Use a per-file allowlist for approved HTML, CSS, JS and media changes.
Exclude .openai/, generated archives, screenshots used only for QA, secrets, caches and temporary adapters.
Keep original backend files and original contact/Kami clients.
Inspect git diff --stat and the complete diff before committing.
Create a draft pull request describing visible changes, test evidence, preview limitations and rollback.
Do not enable auto-merge.

## Release gates
- Owner approves the exact candidate commit and visual preview.
- No accidental preview-domain URLs, temporary redirects or missing assets.
- Canonical URLs, titles, descriptions, sitemap and robots remain correct for itbonsai.pl.
- Contact and Kami tested in a production-compatible environment; no real email sent without explicit test-send authorization.
- Actual production branch and hosting deploy trigger verified.
- Current deployed commit/release recorded as rollback target.
- Required checks pass; unresolved blockers are explicit.
Only then merge and deploy as authorized.

## After release
Verify homepage, services, pricing, portfolio, contact and important SEO URLs on itbonsai.pl.
Verify assets, responsive layout, language switching, Kami and email as authorized.
If a critical regression occurs, use the hosting provider's previous known-good release or an approved revert commit; never destructive history rewriting.
Record the deployed commit and keep GitHub/Sites differences explicit.

## Remaining work
Redesign scope and implementation; responsive and functional QA; backend-compatible staging; owner release approval; deployment configuration verification; release and post-release checks.
