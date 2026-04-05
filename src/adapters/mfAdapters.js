import axios from 'axios';

// Cache for backend requests to dedupe concurrent calls
const backendRequestCache = new Map();

/**
 * Fetch scheme data from backend API.
 * Uses single endpoint with query parameter for hybrid mode.
 * @param {Object} scheme - scheme object with scheme_code
 * @returns {Promise<Object>} - normalized data from backend
 */
export async function fetchSchemeDataUsingAdapter(scheme) {
    const code = String(scheme.scheme_code);
    const adapter = process.env.REACT_APP_DATA_ADAPTER || 'mfapi'; // default to mfapi
    const cacheKey = `${adapter}-${code}`;

    if (backendRequestCache.has(cacheKey)) {
        return backendRequestCache.get(cacheKey);
    }

    const backendURL = process.env.REACT_APP_BACKEND_URL;
    const baseUrl = `${backendURL}/api/mf/${code}`;
    const url = adapter === 'hybrid' ? `${baseUrl}?hybrid=true` : baseUrl;

    const p = axios.get(url).then(res => res.data);

    backendRequestCache.set(cacheKey, p);
    try {
        const data = await p;
        return data;
    } catch (err) {
        backendRequestCache.delete(cacheKey);
        throw err;
    }
}

export const availableAdapters = ['mfapi', 'hybrid'];
