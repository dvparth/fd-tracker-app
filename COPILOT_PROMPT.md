FD Tracker App — Copilot prompt (concise)

Use this short, self-contained prompt when you need to recreate this entire application, implement features, or ask a coding assistant for comprehensive edits. Keep it synced with the project when data shapes, routes, or deployment targets change.

Project summary

- Full-stack single-repo app: React frontend (CRA) and Express backend (Node.js + Mongoose).
- Purpose: Allow authenticated users (Google OAuth) to track mutual fund holdings (schemes identified by numeric scheme_code). Each user stores their own holdings in MongoDB.
- Auth: Server-side Google OAuth; server signs a JWT and sets an HttpOnly cookie `fd_auth`. Frontend uses fetch with credentials: 'include' to call protected endpoints.
- Adapters: NAV/scheme metadata lookups are isolated in `frontend/src/adapters/mfAdapters.js`. Adapters must return canonical shape: `{ entries: [{ date, nav }], meta: { scheme_name, scheme_code? } }`.

Key files and contracts

- backend/server.js — express bootstrap, CORS configuration, route registration
- backend/routes/auth.js — OAuth callbacks and `/auth/me`
- backend/routes/userHoldings.js — authenticated CRUD for holdings
- backend/models/User.js — User schema includes `holdings: [{ scheme_code, principal, unit, addedAt }]`
- frontend/src/App.js — routes, header, navigation
- frontend/src/components/HoldingsPage.js — fetches `/user/holdings`, and supports add/edit/delete
- frontend/src/components/HoldingForm.js — freeSolo Autocomplete; accepts numeric scheme codes or search; posts to `/user/holdings`
- frontend/src/adapters/mfAdapters.js — adapters for external NAV APIs; prefer batching and safe fallbacks
- frontend/src/utils/formatters.js — shared display functions (e.g., `toTitleCase`)

Runtime env / deploy notes

- Backend needs: MONGO_URI, JWT_SECRET, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET
- Frontend needs: REACT_APP_BACKEND_URL set to backend origin
- Deploy targets: frontend (Netlify), backend (Render or similar). Backend must set `trust proxy` when behind a proxy so cookies are set with correct sameSite/secure flags.
- CORS: backend allows frontend origin(s) and Netlify deploy wildcard suffixes. Cookies use SameSite=None and Secure in production.

Developer tasks (common)

- To add adapter for a new NAV API:

  - Add a function in `frontend/src/adapters/mfAdapters.js` that returns the canonical payload shape.
  - Update any UI code that displays fields from meta.
  - Add unit tests mocking network calls.

- To debug auth:

  - Check `fd_auth` cookie is present in browser (HttpOnly) and `/auth/me` returns 200.
  - Ensure JWT_SECRET matches server config used to sign cookie.

- To migrate scheme metadata from JSON to DB:
  - Use the migration helper at `backend/migrations/importSchemesFromJson.js` to import any local `frontend/src/config/schemes.json` fixture into the DB. The runtime app no longer reads `schemes.json` directly; `/schemes` is DB-backed.

Edge cases & assumptions

- Adapters may return partial data. UI should handle missing `nav` values or missing `scheme_name` gracefully.
- The app allows free-form numeric scheme codes via `HoldingForm` — not all codes will have lookup metadata; the app stores the code and allows the user to view holdings regardless.

If you need the full repository context to regenerate the project, include these files and the `frontend/COPILOT_PROMPT.md` to provide the assistant with the current architecture and contracts.
