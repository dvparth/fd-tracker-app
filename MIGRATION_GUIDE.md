# Migration: MF API to Backend

## Summary

The application's direct calls to the external MF API (`https://api.mfapi.in/mf/{:SchemeCode}`) have been migrated to a Node.js/Express backend service. This provides:

- **Centralized API Management**: All external API calls are now handled by the backend
- **Improved Caching**: Backend-level caching reduces redundant external API calls
- **Better Security**: API keys and sensitive data can be stored securely on the backend
- **Scalability**: Backend can be deployed independently and scaled as needed
- **Simplified Frontend**: Frontend no longer needs to handle external API logic

## Architecture Changes

### Before Migration
```
Frontend (React)
    ↓ (direct calls)
    ↓
External APIs:
  - https://api.mfapi.in/mf/{schemeCode}
  - RapidAPI latest endpoint (optional)
```

### After Migration
```
Frontend (React)
    ↓ (HTTP requests)
    ↓
Backend (Node.js/Express) - Port 3001
    ↓ (external API calls + caching)
    ↓
External APIs:
  - https://api.mfapi.in/mf/{schemeCode}
  - RapidAPI latest endpoint (optional)
```

## Files Changed

### New Backend Files
- `backend/package.json` - Backend dependencies and scripts
- `backend/src/server.js` - Express server entry point
- `backend/src/adapters/mfAdapter.js` - Contains migrated MF API logic with caching
- `backend/src/routes/mf.js` - REST API endpoints
- `backend/.env.example` - Backend environment configuration template

### Updated Frontend Files
- `src/adapters/mfAdapters.js` - Now calls backend `/api/mf/*` endpoints instead of external APIs
- `src/config/backendConfig.js` - New file for backend URL configuration
- `.env.example` - Updated with `REACT_APP_BACKEND_URL` setting

### Test Files
- `src/components/__tests__/MFTracker.test.js` - No changes needed (still mocks the adapter interface)

## Backend API Endpoints

### GET `/api/mf/:schemeCode`
Fetches scheme data using the mfapi adapter (direct API call with caching)

**Response:**
```json
{
  "entries": [
    { "date": "01-10-2025", "nav": "12.34" },
    { "date": "30-09-2025", "nav": "12.00" }
  ],
  "meta": { "scheme_name": "Scheme Name" }
}
```

### GET `/api/mf/hybrid/:schemeCode`
Fetches scheme data using hybrid adapter (combines mfapi historical data with RapidAPI latest NAV)

**Response:** (same format as above, but with latest NAV from RapidAPI if available)

### GET `/health`
Health check endpoint

**Response:**
```json
{ "status": "ok", "timestamp": "2026-04-05T00:00:00.000Z" }
```

## Running the Application

### Development Setup

1. **Install Frontend Dependencies** (from root directory)
   ```bash
   npm install
   ```

2. **Install Backend Dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Configure Backend** (optional, for RapidAPI support)
   ```bash
   cp .env.example .env
   # Edit .env and add your RAPIDAPI_KEY if you want hybrid adapter support
   ```

4. **Start Backend Server** (from backend directory)
   ```bash
   npm run dev
   # or for production:
   npm start
   ```
   Backend runs on `http://localhost:3001`

5. **Start Frontend Development Server** (from root directory, in another terminal)
   ```bash
   npm start
   ```
   Frontend runs on `http://localhost:3000`

### Verify Migration

- Open browser to `http://localhost:3000`
- Add a mutual fund holding using a valid scheme code
- Check browser DevTools Network tab - you should see:
  - Frontend request to `http://localhost:3001/api/mf/...` (NOT to api.mfapi.in)
  - Backend handling the actual external API calls

## Configuration

### Frontend (`REACT_APP_BACKEND_URL`)
- **Development**: `http://localhost:3001` (default)
- **Production**: Can be set to production backend URL

Set in `.env` file:
```
REACT_APP_BACKEND_URL=https://api.your-domain.com
```

### Backend Environment Variables
- `PORT` - Server port (default: 3001)
- `RAPIDAPI_KEY` - RapidAPI key for hybrid adapter (optional)
- `RAPIDAPI_HOST` - RapidAPI host (default: latest-mutual-fund-nav.p.rapidapi.com)
- `NODE_ENV` - Environment (development/production)

Set in `backend/.env`:
```
PORT=3001
RAPIDAPI_KEY=your_key_here
RAPIDAPI_HOST=latest-mutual-fund-nav.p.rapidapi.com
```

## Performance Improvements

1. **Backend Caching**: Requests for the same scheme code within the same backend process are cached using a Promise-based cache
2. **Reduced Frontend Bundle**: External API logic removed from frontend code
3. **Batched RapidAPI Calls**: Multiple scheme codes are batched into single RapidAPI request (hybrid adapter)

## Troubleshooting

### Frontend can't connect to backend
- Ensure backend is running: `npm run dev` in backend directory
- Check that `REACT_APP_BACKEND_URL` in frontend `.env` matches backend address
- Check CORS settings if backend is on different origin
- Backend logs should show which port it's listening on

### Backend failing to call external APIs
- Check network connectivity
- Verify scheme codes are valid
- For hybrid adapter: ensure RAPIDAPI_KEY environment variable is set in `backend/.env`
- Check backend logs for error messages

### Data format issues
- Backend normalizes dates to `DD-MM-YYYY` format
- NAV values are sanitized (currency symbols and commas removed)
- If you see unexpected data, check the adapter logic in `backend/src/adapters/mfAdapter.js`

## Future Enhancements

1. **Persistent Caching**: Consider adding Redis for cross-process caching
2. **Rate Limiting**: Add rate limiting to protect against external API rate limits
3. **Data Validation**: Implement schema validation for API responses
4. **Monitoring**: Add logging and monitoring for API calls and errors
5. **Authentication**: Add authentication for backend endpoints if needed

## Rollback Instructions

If you need to revert to direct frontend API calls:
1. Keep the `backend/` directory for reference
2. Revert `src/adapters/mfAdapters.js` to use direct `axios.get('https://api.mfapi.in/mf/...')` calls
3. Remove `src/config/backendConfig.js` import
4. Run `npm install` if needed to restore original dependencies
