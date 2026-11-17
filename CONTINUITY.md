# Continuity

## Status

Version 1.1 implements six topics, mixed distribution, difficulty presets, typing/MCQ modes, expression and sequential chaining, per-question benchmarks, focus mode, expanded analytics, retries, and release notes.

## Verification

Latest verification: 19/19 Vitest tests passed, strict TypeScript passed, and the static production build passed. Playwright could not launch because local Chromium/WebKit binaries are not installed.

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
- Sequential review shows the complete expression; reveal and answer-entry timing are not yet split in analytics.
- Visit summaries, weak-area retry, and break suggestions remain future work.

## Next step

Run Playwright on installed Chromium at desktop and mobile sizes, then deploy the generated `out/` directory.
