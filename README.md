# SSC Calculation Trainer

A mobile-first, anonymous mental-calculation trainer for SSC CGL preparation. It supports tables, squares, cubes, balanced mixed sessions, speed typing, and four-choice SSC exam mode. Everything runs in memory in the browser; there is no backend, account, tracking, or browser storage.

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Quality checks

```bash
npm run typecheck
npm test
npm run test:e2e
npm run build
```

Playwright requires its browser once: `npx playwright install chromium`.

## Deployment

`npm run build` creates the static site in `out/`. On Vercel, import the repository, select Next.js, and deploy with the default build command. No environment variables or services are required. Any static host can also publish the `out/` directory.

Serve the production site over HTTPS. To add it to an iPhone Home Screen, open the deployed URL in Safari, tap **Share**, choose **Add to Home Screen**, and confirm **Add**. It opens in a standalone app window. An internet connection is still required because this project does not install an offline service worker.

Results and unfinished sessions intentionally disappear on refresh.
