# CloudEmpire

A responsive, scroll-driven website for CloudEmpire. The page foregrounds AI, web, Android, and iOS work, then covers the company's broader services, portfolio, process, published metrics, insights, FAQ, and contact information.

## Run locally

```bash
npm install
npm run dev
```

Vite opens `app.html`, the editable source entry. Before pushing changes, run `npm run publish:pages`. It builds the site and copies the compiled page and assets to the repository root. The existing GitHub Actions workflow uploads that root directory to Pages; the same files also work with a `main` / `/ (root)` Pages source. The published URL is `https://cloudempiretech.github.io/cloudempire/`.

The root `index.html`, root `assets/`, and root copies of the favicon and logo are generated files. Edit `app.html`, `src/`, and `public/`, then run `npm run publish:pages` again.

## Notes

- The navigation and calls to action lead to sections on this page. Service detail, portfolio, and article links point to the existing pages at [cloudempire.tech](https://cloudempire.tech/).
- The contact form opens a prepared message in the visitor's email application. Connect it to a backend or form service if server-side submission is needed.
- The four showcase visuals are implemented in HTML and CSS, so no video or image sequence is needed for the scroll animation. The logo and circular favicon were derived from the supplied brand files.
- Motion is reduced for visitors who enable the operating system's reduced-motion setting.
