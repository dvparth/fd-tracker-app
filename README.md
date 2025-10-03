# FD Tracker App

Lightweight React + Node app to track Mutual Fund and FD holdings. This repository contains a frontend (CRA) and a backend (Express + Mongoose).

Structure

- backend/: Express API and Mongoose models
- frontend/: React app (Create React App style)

Quick start (frontend)

Prerequisites: Node.js >= 16, npm

Install and run (frontend):

```powershell
cd frontend
npm install
npm start
```

Run frontend tests

```powershell
cd frontend
npm test -- --watchAll=false
```

Rebuild production bundle

```powershell
cd frontend
npm run build
```

Cleaning up Redux (already removed from source)

If you previously used redux and want to clean installed packages and lockfile:

```powershell
cd frontend
npm uninstall react-redux @reduxjs/toolkit
Remove-Item -Force package-lock.json
Remove-Item -Recurse -Force node_modules
npm install
```

Notes on deposit feature removal

- The frontend source has been stripped of deposit UI. If you want to remove backend endpoints for deposits, delete:
  - `backend/routes/deposits.js`
  - `backend/models/Deposit.js`
  - `backend/importData.js`
    and remove corresponding `require`/`app.use` lines from `backend/server.js`.

Contact

````markdown
# FD Tracker App (frontend)

This folder contains the Create-React-App frontend for the FD Tracker application.

Quick start

```powershell
cd frontend
npm install
# in PowerShell you can set the backend url env and start
$env:REACT_APP_BACKEND_URL = "http://localhost:5000"; npm start
```

Testing

```powershell
npm test -- --watchAll=false
```

Build (production)

```powershell
npm run build
```

Regeneration / Copilot helper

- This frontend contains a concise regeneration prompt at `frontend/COPILOT_PROMPT.md`. Use it when you need to recreate the app or provide a full-context prompt to an LLM-based assistant. Keep the file up to date when you change routes, API contracts, or adapter shapes.

Where to look

- `src/adapters/mfAdapters.js` — adapters and network logic
- `src/components/HoldingsPage.js` — holdings management UI
- `src/components/HoldingForm.js` — holding add/edit form

Maintainer: Parth Dave
````
