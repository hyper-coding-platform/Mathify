# Project conventions

- Keep math and answer validation pure, integer-only, and independent of React.
- Use strict TypeScript and explicit domain types. Never regenerate questions or choices during render.
- Preserve the four reducer phases and derive analytics from immutable results.
- Keep touch targets near 44px, visible focus, semantic labels, live feedback, and reduced-motion support.
- Use CSS variables in `globals.css` for visual tokens; avoid component libraries and animation packages.
- New topics must provide a canonical identity, bounded safe ranges, a registry factory, plausible MCQ candidates, and unit tests.
- Do not add localStorage, sessionStorage, IndexedDB, cookies, network calls, authentication, or server-only routes.
- Run typecheck, unit/component tests, and a static production build before release. Add Playwright coverage for critical user flows.
