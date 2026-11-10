# Continuity

## Status

Production implementation is complete: configuration, three topics, mixed distribution, typing and MCQ modes, one reducer/timer engine, answer feedback, in-memory analytics, topic breakdown, detailed mode-aware review, restart/exit behavior, responsive UI, static export, tests, and documentation.

## Verification

Latest verification: 13/13 Vitest tests passed, 2/2 Playwright flows passed (desktop and Pixel 7), TypeScript passed, and the Next.js static production build passed.

```bash
npm run typecheck
npm test
npm run build
```

## Known limitations

- Sessions intentionally do not survive refreshes or tab closure.
- `beforeunload` warnings depend on browser policy.
- Very small configured pools repeat questions after bounded uniqueness attempts.
- No negative marking is implemented.

## Next step

Run Playwright on installed Chromium at desktop and mobile sizes, then deploy the generated `out/` directory.
