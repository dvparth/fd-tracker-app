# API Usage Analysis - Before & After Migration

## API Endpoint Being Migrated
- **URL**: `https://api.mfapi.in/mf/{:SchemeCode}`
- **Purpose**: Fetch historical NAV data and scheme metadata for mutual funds
- **Response Format**: 
  ```json
  {
    "meta": { "scheme_name": "Scheme Name" },
    "data": [
      { "date": "26-Sep-2025", "nav": "12.34" },
      { "date": "25-Sep-2025", "nav": "12.30" }
    ]
  }
  ```

## All Application Parts Using This API

### 1. **Core Adapter Logic**
**Location**: `src/adapters/mfAdapters.js`

**Before Migration**:
```javascript
mfapi: async (scheme) => {
    const code = String(scheme.scheme_code);
    const res = await axios.get(`https://api.mfapi.in/mf/${code}`); // Direct call
    const payload = res && res.data ? res.data : {};
    return ensureCanonical({ entries: payload.data, meta: payload.meta });
}
```

**After Migration**:
```javascript
mfapi: async (scheme) => {
    const code = String(scheme.scheme_code);
    const backendURL = getBackendURL();
    const res = await axios.get(`${backendURL}/api/mf/${code}`); // Backend call
    const payload = res && res.data ? res.data : {};
    return ensureCanonical(payload);
}
```

**Also Used By**:
- `hybrid` adapter - Combines this with RapidAPI for latest NAV
- `fetchSchemeDataUsingAdapter()` - Public function exported to components

---

### 2. **MFTracker Component**
**Location**: `src/components/MFTracker.js` (lines 14-76)

**What It Does**:
- Main portfolio tracking component
- Fetches NAV data for each holding
- Uses the mfapi adapter to get historical data
- Displays portfolio summary with profit/loss calculations

**Code Flow**:
```javascript
// Line 29: Adapter selection
const dataAdapterKey = envAdapter || 
    (availableAdapters.includes('hybrid') ? 'hybrid' : 'mfapi');

// Line ~70: Calls adapter for each holding
const data = await fetchSchemeDataUsingAdapter(dataAdapterKey, scheme);
```

**API Calls Made**: 1 call per holding scheme code
**Example**: If user has 2 holdings, makes 2 API calls

---

### 3. **HoldingsPage Component**
**Location**: `src/components/HoldingsPage.js` (lines 17-67)

**What It Does**:
- Displays list of all holdings
- Shows scheme name and NAV data
- Uses adapter to fetch scheme metadata

**API Calls Made**: 1 call per holding (to get scheme_name from meta)

---

### 4. **HoldingForm Component**
**Location**: `src/components/HoldingForm.js` (lines 45-56)

**What It Does**:
- Form for adding new mutual fund holdings
- Validates scheme codes by attempting API call
- Confirms scheme exists and gets its name

**API Calls Made**: 1 call per form submission (validation)

---

### 5. **Testing/Test Mocks**
**Location**: `src/components/__tests__/MFTracker.test.js`

**What It Tests**:
```javascript
jest.mock('../../adapters/mfAdapters', () => ({
    fetchSchemeDataUsingAdapter: jest.fn((key, scheme) => {
        return Promise.resolve({
            entries: [
                { date: '01-10-2025', nav: '12.34' },
                { date: '30-09-2025', nav: '12.00' }
            ],
            meta: { scheme_name: `Mock ${scheme.scheme_code}` }
        });
    })
}));
```

**Status**: ✅ No changes needed - mock interface remains the same

---

## API Call Flow Diagram

### Before Migration
```
┌─────────────────┐
│ MFTracker       │
│ HoldingsPage    │
│ HoldingForm     │ ──┐
└─────────────────┘   │
                      ├──▶ mfapi adapter
┌─────────────────┐   │    ├─ ensureCanonical()
│ Test Mocks      │ ──┘    ├─ Direct axios.get()
└─────────────────┘        └─ Cache (frontend)
                                 │
                                 ▼
                           https://api.mfapi.in/mf/{code}
                           
                           (Also calls RapidAPI for latest NAV
                            if hybrid adapter is used)
```

### After Migration
```
┌─────────────────┐
│ MFTracker       │
│ HoldingsPage    │
│ HoldingForm     │ ──┐
└─────────────────┘   │
                      ├──▶ mfapi adapter (frontend)
┌─────────────────┐   │    ├─ axios.get()
│ Test Mocks      │ ──┘    ├─ Cache (frontend)
└─────────────────┘        └─ Calls backend endpoint
                                 │
                                 ▼
                        ┌──────────────────────┐
                        │ Backend Server       │
                        │ (port 3001)          │
                        │                      │
                        │ /api/mf/:code   ────┼──▶ mfapi adapter (backend)
                        │ /api/mf/hybrid  │    │  ├─ ensureCanonical()
                        │ /health         │    │  ├─ axios.get()
                        │                 │    │  └─ Cache (backend)
                        └─────────────────┼────┘
                                          │
                      ┌───────────────────┴──────────────────┐
                      ▼                                      ▼
                https://api.mfapi.in      RapidAPI (optional)
```

---

## Data Flow Examples

### Example 1: User Adds a Holding

**Before**:
1. User enters scheme code in HoldingForm
2. Form calls `fetchSchemeDataUsingAdapter('mfapi', {scheme_code: 147946})`
3. Frontend adapter makes `axios.get('https://api.mfapi.in/mf/147946')`
4. Response normalized to canonical format
5. Form submits holding to backend

**After**:
1. User enters scheme code in HoldingForm
2. Form calls `fetchSchemeDataUsingAdapter('mfapi', {scheme_code: 147946})`
3. Frontend adapter makes `axios.get('http://localhost:3001/api/mf/147946')`
4. Backend receives request, calls external API
5. Backend normalizes and caches response
6. Response sent to frontend
7. Frontend caches in promise cache
8. Form submits holding to backend

---

### Example 2: Loading Portfolio Dashboard

**Before** (2 holdings):
1. MFTracker component mounts
2. Fetches holdings from backend
3. For each holding (2 total):
   - Calls `fetchSchemeDataUsingAdapter` with scheme code
   - Frontend makes direct axios call to api.mfapi.in
   - Response normalized
4. All data loaded, component renders with charts/tables

**After** (2 holdings):
1. MFTracker component mounts
2. Fetches holdings from backend
3. For each holding (2 total):
   - Calls `fetchSchemeDataUsingAdapter` with scheme code
   - Frontend makes axios call to backend (port 3001)
   - Backend caches and calls external API (if not cached)
   - Backend normalizes and returns
   - Frontend caches response
4. All data loaded, component renders with charts/tables

**Performance**: Same from user perspective, but backend can cache across sessions

---

## API Implementation Isolation

### Isolated Implementation Code

**Files**: 
- **Before**: Spread across `src/adapters/mfAdapters.js` (~300 lines)
- **After**: Concentrated in `backend/src/adapters/mfAdapter.js` (~250 lines)

**Functions Isolated**:
1. `ensureCanonical()` - Data normalization
2. `normalizeDate()` - Date format conversion
3. `sanitizeNav()` - NAV value sanitization
4. mfapi adapter logic - API calls + caching
5. hybrid adapter logic - Multi-API coordination
6. RapidAPI batching logic - Efficient batch requests

**Benefits**:
- Single source of truth for API logic
- Changes only need to be made in backend
- Frontend just calls REST endpoints
- Easy to add logging, monitoring, rate limiting
- Can be versioned independently

---

## Migration Checklist

- ✅ Identified all usage locations (5 areas)
- ✅ Isolated API logic to backend
- ✅ Created backend REST API
- ✅ Updated frontend adapters
- ✅ Verified component interfaces unchanged
- ✅ Tests pass
- ✅ Caching preserved
- ✅ Data normalization preserved

---

## Summary

The migration isolated all MF API calling logic into a dedicated backend service while maintaining:

1. **No breaking changes** - All components work unchanged
2. **Same functionality** - All features work identically
3. **Same performance** - Caching and data normalization preserved
4. **Improved architecture** - Centralized API management
5. **Better security** - API credentials on backend only

The API was being used in **5 different places**:
- 1 core adapter implementation
- 3 React components (MFTracker, HoldingsPage, HoldingForm)
- 1 test mock

All now funnel through a single **REST API endpoint** on the backend.
