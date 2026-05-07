MF Tracker App - Copilot prompt (concise)

Use this short, self-contained prompt when you need to recreate this application, implement features, or ask a coding assistant for comprehensive edits. Keep it synced with the project when data shapes, routes, or deployment targets change.

Project summary

- Full-stack app with a React frontend (CRA) and Express backend (Node.js + Mongoose).
- Purpose: Allow authenticated users (Google OAuth) to track mutual fund holdings by numeric `scheme_code`. Each user stores their own holdings in MongoDB.
- Auth: Server-side Google OAuth; server signs a JWT and sets an HttpOnly cookie `mf_auth`. Frontend uses `fetch` with `credentials: 'include'` to call protected endpoints.
- Adapters: NAV/scheme metadata lookups are isolated in `src/adapters/mfAdapters.js` on the frontend and `adapters/mfAdapter.js` on the backend. Adapters return canonical shape: `{ entries: [{ date, nav }], meta: { scheme_name } }`.

Key files and contracts

- `fdtracker/server.js` - Express bootstrap, CORS configuration, route registration
- `fdtracker/routes/auth.js` - OAuth callbacks and `/auth/me`
- `fdtracker/routes/userHoldings.js` - authenticated CRUD for holdings
- `fdtracker/models/User.js` - User schema includes `holdings: [{ scheme_code, principal, unit, addedAt }]`
- `fd-tracker-app/src/App.js` - routes, header, navigation
- `fd-tracker-app/src/components/MFTracker.js` - portfolio snapshot, NAV loading, AI summary
- `fd-tracker-app/src/components/HoldingsPage.js` - fetches `/user/holdings` and supports add/edit/delete
- `fd-tracker-app/src/components/HoldingForm.js` - accepts numeric scheme codes and posts to `/user/holdings`
- `fd-tracker-app/src/adapters/mfAdapters.js` - frontend adapter for backend NAV APIs
- `fd-tracker-app/src/utils/formatters.js` - shared display functions

Runtime env / deploy notes

- Backend needs: `MONGO_URI`, `JWT_SECRET`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `FRONTEND_URL`
- Frontend needs: `REACT_APP_BACKEND_URL` set to backend origin
- Optional AI/data providers: `RAPIDAPI_KEY`, `RAPIDAPI_HOST`, `GITHUB_TOKEN`, `OPENAI_API_KEY`, `HUGGINGFACE_API_KEY`
- Deploy targets: frontend on Netlify, backend on Render or similar. Backend sets `trust proxy` in production so secure cookies work behind a proxy.
- CORS: backend allows configured frontend origin(s) and Netlify deploy wildcard suffixes. Cookies use SameSite=None and Secure in production.

Common tasks

- To add a NAV adapter, add or update logic in the backend adapter and make sure the frontend receives canonical `{ entries, meta }` payloads.
- To debug auth, check `mf_auth` cookie is present in the browser and `/auth/me` returns 200.
- To migrate scheme metadata from JSON to DB, use `fdtracker/migrations/importSchemesFromJson.js`.

Edge cases and assumptions

- Adapters may return partial data. UI should handle missing `nav` values or missing `scheme_name` gracefully.
- The app allows free-form numeric scheme codes via `HoldingForm`; not all codes will have lookup metadata.
