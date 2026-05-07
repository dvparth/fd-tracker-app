# MF Tracker App

Personal mutual fund snapshot app with a React frontend and an Express/Mongoose backend.

The app lets authenticated users manage mutual fund holdings by scheme code, fetches NAV history from external mutual fund data providers, computes portfolio totals, and generates a short AI portfolio insight.

## Project Structure

- `fd-tracker-app/` - React frontend built with Create React App and MUI
- `fdtracker/` - Express API backed by MongoDB

The folder names are kept as-is to avoid breaking local paths, but the runtime app and package metadata now use MF Tracker naming.

## Frontend

```powershell
cd C:\Study\MFSnapshot\fd-tracker-app
$env:REACT_APP_BACKEND_URL = "http://localhost:5000"
npm install
npm start
```

Useful scripts:

```powershell
npm run build
npm run test:ci
```

Key files:

- `src/App.js` - app shell, routes, auth-gated pages
- `src/auth/useAuth.js` - current-user lookup through `/auth/me`
- `src/components/MFTracker.js` - portfolio snapshot, NAV loading, AI summary
- `src/components/HoldingsPage.js` - holdings management
- `src/adapters/mfAdapters.js` - frontend API adapter for MF NAV data

## Backend

```powershell
cd C:\Study\MFSnapshot\fdtracker
npm install
npm run dev
```

Required backend environment:

- `MONGO_URI`
- `JWT_SECRET`
- `FRONTEND_URL`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`

Optional backend environment:

- `GOOGLE_CALLBACK`
- `RAPIDAPI_KEY`
- `RAPIDAPI_HOST`
- `GITHUB_TOKEN`
- `OPENAI_API_KEY`
- `HUGGINGFACE_API_KEY`

Main API routes:

- `/auth` - Google OAuth, logout, current user
- `/user/holdings` - authenticated holdings CRUD
- `/schemes` - DB-backed scheme metadata
- `/api/mf` - mutual fund NAV lookup
- `/api/portfolioInsight` - AI portfolio summary
- `/api/llm` - direct LLM chat endpoint

## Notes

- The legacy fixed-deposit API/model/import script has been removed because the current product is a mutual fund tracker.
- Auth uses an HttpOnly `mf_auth` cookie.
- The runtime app no longer reads `src/config/schemes.json` directly; `/schemes` is DB-backed.
