# CloudEmpire

A responsive multipage website for CloudEmpire. The home page has full-screen scroll scenes for AI, web, Android, and iOS. Separate pages cover the company, all 13 services and their detail pages, selected work, process, 10 original articles, and contact information.

## Run locally

```bash
npm install
npm run dev
```

Vite opens `app.html`, the editable source entry. Before pushing changes, run `npm run publish:pages`. It builds the site and generates a static HTML entry for every route, then copies the pages and assets to the repository root. The existing GitHub Actions workflow uploads that root directory to Pages; the same files also work with a `main` / `/ (root)` Pages source. The published URL is `https://cloudempiretech.github.io/cloudempire/`.

The root page directories, root `index.html`, root `assets/`, `sitemap.xml`, and `robots.txt` are generated files. Edit `app.html`, `src/`, and `public/`, then run `npm run publish:pages` again. The generator adds unique page titles, descriptions, canonical links, structured data, and readable article content to the HTML before React loads.

## Notes

- Navigation, service details, portfolio content, and every article stay within this site.
- The contact form opens a prepared message in the visitor's email application. Connect it to a backend or form service if server-side submission is needed.
- The four showcase visuals are implemented in HTML and CSS, so no video or image sequence is needed for the scroll animation. The logo and circular favicon were derived from the supplied brand files.
- Motion is reduced for visitors who enable the operating system's reduced-motion setting.
