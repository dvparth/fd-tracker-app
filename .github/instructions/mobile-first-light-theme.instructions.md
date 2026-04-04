---
name: mobile-first-light-theme
description: "Workspace instruction for fd-tracker-app: prefer mobile-first responsive styling and default light theme. Use when editing frontend components, CSS, or layout behavior."
applyTo:
  - "src/**/*.{js,jsx,ts,tsx,css}"
---

# Mobile-First Light Theme Guidelines

- Prefer mobile-first CSS: base styles should target small viewports first, then use `min-width` media queries for larger screens.
- Use responsive `sx` values and flexible layout patterns in MUI components (`display`, `flexDirection`, `gap`, `px`, `py`, etc.).
- Keep the default theme light by default in `App.js` and theme configuration.
- Avoid hardcoded personal values such as user names; use auth-provided data like `user?.name`.
- Keep the tracker header minimal and focused on user data, not additional market tickers unless explicitly requested.
- Use the configured backend URL environment variables (`REACT_APP_BACKEND_URL` or `REACT_APP_API_URL`) for API requests.
- Preserve the existing MFTracker and SchemeAccordion layout conventions when adding or updating UI, rather than introducing unrelated layout changes.
