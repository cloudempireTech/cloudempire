# CloudEmpire

A responsive multipage website for CloudEmpire. The home page has full-screen scroll scenes for AI, web, Android, and iOS. Separate pages cover the company, all 13 services and their detail pages, selected work, process, 10 original articles, and contact information.

## Run locally

```bash
npm install
npm run dev
```

Next.js opens the site at `http://localhost:3000/`. The public site and admin shell use the Next.js Pages Router with a static export so the existing Hostinger PHP/MySQL APIs and hosting can continue to run. Local development does not execute PHP endpoints, so admin sign-in and database editing must be checked on Hostinger.

Before pushing changes, run `npm run publish:pages` and `npm run check:export`. The first command builds Next.js and copies its exported pages and `_next/` assets to the repository root for Hostinger at `https://cloudempire.tech/`. The GitHub Actions workflow repeats that build and also publishes a separate `/cloudempire/` preview to GitHub Pages. Edit `pages/`, `src/`, and `public/`; the root page directories, root `index.html`, root `_next/`, `sitemap.xml`, and `robots.txt` are generated files.

The exported HTML contains the page content, unique metadata, canonical links, and structured data before JavaScript loads. On Hostinger, `site.php` injects current MySQL content and metadata into these pages. The homepage delays offscreen showcase visuals and skips offscreen painting to reduce initial work, while its native scroll snapping and reduced-motion behavior remain available.

## Admin dashboard

Open `https://cloudempire.tech/admin/` after Hostinger deploys this repository to `public_html`. Create an admin account with an email and password of at least 12 characters if one does not already exist. Existing admin logins continue to work. The password is stored as a hash in MySQL; the login uses an HTTP-only, secure session cookie with CSRF protection and login throttling. No GitHub token is required for content editing.

The dashboard edits blog posts, services, portfolio items, process steps, and site copy directly in MySQL. `src/content.json` seeds the content table only on first use. New blog cover images upload to private Hostinger storage and are served through `api/media.php`; existing images in `public/blog/` still work. Saves appear on the live Hostinger site immediately. The public PHP router serves current metadata and content for blog and service URLs, and `sitemap.php` reflects new entries. GitHub Actions builds the code and a separate static GitHub Pages preview; content saved in MySQL is live only on Hostinger.

### Admin-managed SEO pages

The **SEO pages** tab creates draft or published solution pages at `/solutions/{slug}/`. Enter a unique slug, page heading, search title and description, introduction, original content sections, optional FAQs, related service and blog slugs, and an optional image. Save a draft to keep it private; choose **Published** to make it public. Publishing takes effect immediately on Hostinger without another Git build. Published pages appear on `/solutions/` and in the dynamic `/sitemap.xml`; drafts and unknown slugs return 404. The admin form offers a link to view each published page.

SEO pages use a dedicated `ce_seo_pages` MySQL table, created automatically on first use. This keeps daily pages out of the site-wide content JSON. `api/seo-pages.php` requires an authenticated admin session and CSRF token for writes, validates slugs and content, and uses revision checks to prevent overwriting another editor's changes. Removing a public page is done by changing its status to **Draft**. The public `solutions.php` route renders the full page, metadata, and structured data on the server; `.htaccess` routes `/solutions/` and `/solutions/{slug}/` there. The static GitHub Pages preview shows a solutions introduction, while the live Hostinger site reads its page list from MySQL.

For a daily article and companion SEO page, publish the SEO page first, set the article's **Related SEO page slug**, and set the SEO page's **Related blog slug**. Newly created blog articles that have no static export are server-rendered by `dynamic-article.php`, including their article content, metadata, and structured data. Verify both public URLs, their canonical tags, their mutual links, and their sitemap entries before sharing either link on social media. Sitemap inclusion means a page is discoverable; it does not prove a search engine has indexed it.

The **Dashboard** shows recent visits, inquiries, and content counts. **UTM campaigns** records anonymous landing visits tagged with `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, or `utm_term` and shows 30-day breakdowns and a tagged-link builder. Existing traffic before this update has no UTM attribution. **Database & media** shows MySQL and upload totals, recent images, and a connection setting for planned password rotation. The old GitHub publishing-token form is obsolete. The account owner can create seven-day, one-time invitation links under **Admin users**; invitees set their own passwords. Invitation links must be shared privately because anyone holding a valid link can accept it. Only the owner can invite or remove admins and change database settings.

The connected Hostinger MySQL database `u769677815_cloudempiredb` stores admin credentials, site content, inquiries, analytics, and image metadata. Media files and the database password are stored in `.cloudempire-data` beside `public_html`, outside the public site and Git repository. If you reset the MySQL user's password, update the private database setting and any other application using that account. PHP needs PDO MySQL, Fileinfo, and write access to the private directory. GitHub Pages preview does not run PHP and uses the bundled seed content.

## Notes

- Navigation, service details, portfolio content, and every article stay within this site.
- The contact form opens WhatsApp with a prefilled inquiry to CloudEmpire's published +91 94756 39634 number. The visitor presses Send in WhatsApp to deliver it; automatic server-side sending would require a WhatsApp Business integration.
- The four showcase visuals are implemented in HTML and CSS, so no video or image sequence is needed for the scroll animation. The logo and circular favicon were derived from the supplied brand files.
- Motion is reduced for visitors who enable the operating system's reduced-motion setting.
