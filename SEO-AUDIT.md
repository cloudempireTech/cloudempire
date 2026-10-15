# CloudEmpire SEO audit — 15 October 2026

## Scope and baseline

This audit checked the live public HTML, robots.txt, sitemap, repository templates, and sample search results. It did not use private Google Search Console data, so it cannot measure impressions, indexing coverage, or rankings by query.

## Findings and changes

| Finding | Impact | Change |
| --- | --- | --- |
| Google results still surfaced old `index.php`, `service.php`, `service-details.php`, `about-us.php`, `portfolio.php`, and `contact-us.php` URLs. Those URLs returned 404 when checked. | Existing discovery and links led to dead pages. | Added permanent redirects to corresponding current URLs. |
| Both `www.cloudempire.tech` and the apex domain served the same content with a canonical tag. | Duplicate crawl paths. | Added a permanent `www` to apex redirect and trailing slash normalization. |
| Android and iOS shared one broad mobile app page; there was no dedicated custom software page. | Search intent for these services had no focused landing page. | Added Android, iOS, and custom software pages with distinct descriptions, deliverables, process details, and common questions. |
| Priority service pages had little explanatory content beyond a summary and four deliverables. | Limited help for buyers comparing approaches. | Expanded the AI, website, mobile, Android, iOS, and custom software pages with concrete scope, workflow, and decision guidance. |
| Service titles and descriptions were generic or centered on a temporary offer. | Search snippets did not clearly describe the services. | Added specific titles and descriptions, including the verified Kolkata location, while keeping the website offer visible on the page. |
| Search metadata and schema had separate static and PHP implementations. | Live pages could drift from generated pages after admin edits. | Aligned title, description, canonical, Organization, WebSite, WebPage, BreadcrumbList, Service, and BlogPosting data across both paths. |
| The GitHub Pages preview duplicated the production site. | Potential index duplication. | Added `noindex, follow` to preview HTML. Production pages remain indexable. |

## Validation

- Production build publishes 33 canonical pages and a sitemap.
- All 33 generated pages have unique titles, descriptions, one canonical URL, a heading, and parseable JSON-LD.
- PHP files passed a PHP 8.2 syntax parser check. On the live site, the new service pages return 200 with their detailed content and Service schema; legacy PHP URLs and `www` return 301 to canonical pages.

## Next actions in Google Search Console

1. Verify the `cloudempire.tech` domain property if it is not already verified.
2. Submit `https://cloudempire.tech/sitemap.xml`.
3. Use URL Inspection on the homepage and the new software, website, Android, iOS, and AI pages. Request indexing where appropriate.
4. Check Pages > Not indexed for old PHP URLs. After Google recrawls their redirects, they should transition away from 404s.
5. Review queries and landing pages after several weeks. Improve pages with real project examples, client-approved outcomes, screenshots, and specific answers to questions buyers ask.
6. Keep business name, address, phone, website, and social profiles consistent in the Google Business Profile and reputable listings.

Search placement cannot be guaranteed. Google decides when to crawl and rank pages, and broad terms such as “software developer” are highly competitive. AI search features also rely on index eligibility and useful, reliable content; there is no special markup that guarantees inclusion.

References: [Google SEO Starter Guide](https://developers.google.com/search/docs/fundamentals/seo-starter-guide), [Sitemaps](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap), [AI features and your website](https://developers.google.com/search/docs/appearance/ai-features).
