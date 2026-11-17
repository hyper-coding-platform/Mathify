# SSC Calculation Trainer

A mobile-first, anonymous mental-calculation trainer for SSC preparation. Version 1.1 supports tables, squares, cubes, addition, subtraction, structured chaining, and balanced mixed sessions in typing or four-choice mode.

Recommended speed benchmarks are configurable product estimates, not official SSC timings. Question records remain in memory. The only persisted value is the acknowledged release-note version.

The main configuration screen is intentionally compact. Advanced ranges, arithmetic filters, chaining controls, and benchmark settings are available through **Customize** and remain drafts until applied. Session review shows correctness separately from each question’s own benchmark status.

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

Playwright requires its browsers once: `npx playwright install chromium webkit`.

## Deployment

`npm run build` creates the static site in `out/`. On Vercel, import the repository, select Next.js, and deploy with the default build command. No environment variables or services are required. Any static host can also publish the `out/` directory.

Serve the production site over HTTPS. To add it to an iPhone Home Screen, open the deployed URL in Safari, tap **Share**, choose **Add to Home Screen**, and confirm **Add**. It opens in a standalone app window. An internet connection is still required because this project does not install an offline service worker.

Results and unfinished sessions intentionally disappear on refresh.
