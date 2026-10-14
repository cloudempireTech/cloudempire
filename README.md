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

The dashboard edits blog posts, services, portfolio items, and process steps in `src/content.json`. New blog cover images upload to private Hostinger storage and are served through `api/media.php`; existing images in `public/blog/` still work. Homepage and layout files are linked from **Other content** to the GitHub editor. A save commits to `main`. GitHub Actions rebuilds the Hostinger root files, commits them, and deploys the separate GitHub Pages preview. Hostinger's Git auto-deployment must be enabled to publish the new root commit to the live domain.

In **Database & storage**, enter the password for the existing Hostinger MySQL user `u769677815_cloudempiredb`. The server tests the connection, creates its own `ce_views`, `ce_inquiries`, and `ce_media` tables, and imports previously collected file records once. It writes the password to `.cloudempire-data/database.php` beside `public_html`, outside the public site and Git repository. Do not commit or share the password. If you reset this user's password, update any other application using it. Until MySQL is connected, inquiries and privacy-friendly page views continue collecting in private files. PHP needs PDO MySQL, cURL, Fileinfo, and write access to the private directory. GitHub Pages preview does not run PHP and uses the live Hostinger media URL for newly uploaded images.

## Notes

- Navigation, service details, portfolio content, and every article stay within this site.
- The contact form opens WhatsApp with a prefilled inquiry to CloudEmpire's published +91 94756 39634 number. The visitor presses Send in WhatsApp to deliver it; automatic server-side sending would require a WhatsApp Business integration.
- The four showcase visuals are implemented in HTML and CSS, so no video or image sequence is needed for the scroll animation. The logo and circular favicon were derived from the supplied brand files.
- Motion is reduced for visitors who enable the operating system's reduced-motion setting.
