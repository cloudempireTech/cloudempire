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

Open `https://cloudempire.tech/admin/` after Hostinger deploys this repository to `public_html`. Create an admin account with an email and password of at least 12 characters if one does not already exist. Existing admin logins continue to work. The password is stored as a hash in MySQL; the login uses an HTTP-only, secure session cookie with CSRF protection and login throttling. No GitHub token is required for content editing.

The dashboard edits blog posts, services, portfolio items, process steps, and site copy directly in MySQL. `src/content.json` seeds the content table only on first use. New blog cover images upload to private Hostinger storage and are served through `api/media.php`; existing images in `public/blog/` still work. Saves appear on the live Hostinger site immediately. The public PHP router serves current metadata and content for blog and service URLs, and `sitemap.php` reflects new entries. GitHub Actions builds the code and a separate static GitHub Pages preview; content saved in MySQL is live only on Hostinger.

The **Dashboard** shows recent visits, inquiries, and content counts. **UTM campaigns** records anonymous landing visits tagged with `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, or `utm_term` and shows 30-day breakdowns and a tagged-link builder. Existing traffic before this update has no UTM attribution. **Database & media** shows MySQL and upload totals, recent images, and a connection setting for planned password rotation. The old GitHub publishing-token form is obsolete. The account owner can create seven-day, one-time invitation links under **Admin users**; invitees set their own passwords. Invitation links must be shared privately because anyone holding a valid link can accept it. Only the owner can invite or remove admins and change database settings.

The connected Hostinger MySQL database `u769677815_cloudempiredb` stores admin credentials, site content, inquiries, analytics, and image metadata. Media files and the database password are stored in `.cloudempire-data` beside `public_html`, outside the public site and Git repository. If you reset the MySQL user's password, update the private database setting and any other application using that account. PHP needs PDO MySQL, Fileinfo, and write access to the private directory. GitHub Pages preview does not run PHP and uses the bundled seed content.

## Notes

- Navigation, service details, portfolio content, and every article stay within this site.
- The contact form opens WhatsApp with a prefilled inquiry to CloudEmpire's published +91 94756 39634 number. The visitor presses Send in WhatsApp to deliver it; automatic server-side sending would require a WhatsApp Business integration.
- The four showcase visuals are implemented in HTML and CSS, so no video or image sequence is needed for the scroll animation. The logo and circular favicon were derived from the supplied brand files.
- Motion is reduced for visitors who enable the operating system's reduced-motion setting.
