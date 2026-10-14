# CloudEmpire

A responsive multipage website for CloudEmpire. The home page has full-screen scroll scenes for AI, web, Android, and iOS. Separate pages cover the company, all 13 services and their detail pages, selected work, process, 10 original articles, and contact information.

## Run locally

```bash
npm install
npm run dev
```

Vite opens `app.html`, the editable source entry. Before pushing changes, run `npm run publish:pages`. It builds the site and generates a static HTML entry for every route, then copies the pages and assets to the repository root for Hostinger at `https://cloudempire.tech/`. The GitHub Actions workflow also builds a separate `/cloudempire/` preview for GitHub Pages.

The root page directories, root `index.html`, root `assets/`, `sitemap.xml`, and `robots.txt` are generated files. Edit `app.html`, `src/`, and `public/`, then run `npm run publish:pages` again. The generator adds unique page titles, descriptions, canonical links, structured data, and readable article content to the HTML before React loads.

## Admin dashboard

Open `https://cloudempire.tech/admin/` after Hostinger deploys this repository to `public_html`. Sign in with a GitHub fine-grained personal access token limited to the `cloudempireTech/cloudempire` repository, with **Contents: read and write**. The token stays in the browser tab; the dashboard sends it to GitHub for content edits and to the site's PHP endpoint to check access to private reports. It is not stored on the server or in browser storage. Closing or locking the dashboard clears it from the page.

The dashboard edits blog posts, services, portfolio items, and process steps in `src/content.json`. It can upload blog cover images to `public/blog/`. Homepage and layout files are linked from **Other content** to the GitHub editor. A save commits to `main`. GitHub Actions rebuilds the Hostinger root files, commits them, and deploys the separate GitHub Pages preview. Hostinger's Git auto-deployment must be enabled to publish the new root commit to the live domain.

Inquiries and privacy-friendly page views are collected by the PHP files in `api/` on Hostinger. PHP must be enabled with the cURL extension and allowed to write to a private `.cloudempire-data` directory beside `public_html`. The directory is created on the first collection request and is never inside the public website directory. If PHP or private storage is unavailable, the dashboard reports that the live data is unavailable; the contact form still opens WhatsApp. GitHub Pages preview does not run PHP and therefore has no inbox or analytics.

## Notes

- Navigation, service details, portfolio content, and every article stay within this site.
- The contact form opens WhatsApp with a prefilled inquiry to CloudEmpire's published +91 94756 39634 number. The visitor presses Send in WhatsApp to deliver it; automatic server-side sending would require a WhatsApp Business integration.
- The four showcase visuals are implemented in HTML and CSS, so no video or image sequence is needed for the scroll animation. The logo and circular favicon were derived from the supplied brand files.
- Motion is reduced for visitors who enable the operating system's reduced-motion setting.
