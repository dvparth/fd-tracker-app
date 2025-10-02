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

Maintainer: Parth Dave
