# CloudEmpire

A responsive, scroll-driven website for CloudEmpire. The page foregrounds AI, web, Android, and iOS work, then covers the company's broader services, portfolio, process, published metrics, insights, FAQ, and contact information.

## Run locally

```bash
npm install
npm run dev
```

Open the local URL shown by Vite. For a production bundle, run `npm run build`; deploy the generated `dist/` directory to a static host.

## Notes

- The navigation and calls to action lead to sections on this page. Service detail, portfolio, and article links point to the existing pages at [cloudempire.tech](https://cloudempire.tech/).
- The contact form opens a prepared message in the visitor's email application. Connect it to a backend or form service if server-side submission is needed.
- The four showcase visuals are implemented in HTML and CSS, so no video or image sequence is needed for the scroll animation. The logo and circular favicon were derived from the supplied brand files.
- Motion is reduced for visitors who enable the operating system's reduced-motion setting.
