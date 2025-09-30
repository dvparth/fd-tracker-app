
import axios from 'axios';

/**
 * Canonical data shape used by the UI:
 *
 * @typedef {Object} CanonicalEntry
 * @property {string} date - date in 'DD-MM-YYYY'
 * @property {string|number} nav - NAV value as string or number
 *
 * @typedef {Object} CanonicalMeta
 * @property {string} scheme_name
 *
 * @typedef {Object} CanonicalPayload
 * @property {CanonicalEntry[]} entries
 * @property {CanonicalMeta} meta
 */

// Internal helper to ensure the adapter returns the canonical shape.
function ensureCanonical(payload) {
    const safe = payload || {};
    const entriesRaw = Array.isArray(safe.entries) ? safe.entries : (Array.isArray(safe.data) ? safe.data : []);
    // helper: normalize various date formats into DD-MM-YYYY
    const normalizeDate = (d) => {
        if (!d) return null;
        const s = String(d).trim();
        // already DD-MM-YYYY
        if (/^\d{2}-\d{2}-\d{4}$/.test(s)) return s;
        // DD-MMM-YYYY (e.g. 26-Sep-2025)
        const mmmMatch = s.match(/^(\d{1,2})-([A-Za-z]{3})-(\d{4})$/);
        if (mmmMatch) {
            const dd = mmmMatch[1].padStart(2, '0');
            const mon = mmmMatch[2].toLowerCase();
            const map = { jan: '01', feb: '02', mar: '03', apr: '04', may: '05', jun: '06', jul: '07', aug: '08', sep: '09', oct: '10', nov: '11', dec: '12' };
            const mm = map[mon] || mmmMatch[2];
            return `${dd}-${mm}-${mmmMatch[3]}`;
        }
        // ISO YYYY-MM-DD or YYYY-MM-DDTHH:MM:SS
        const isoMatch = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
        if (isoMatch) {
            const dd = isoMatch[3];
            const mm = isoMatch[2];
            const yyyy = isoMatch[1];
            return `${dd}-${mm}-${yyyy}`;
        }
        // '26 Sep 2025' or '26 September 2025'
        const spaceMatch = s.match(/^(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})$/);
        if (spaceMatch) {
            const dd = String(spaceMatch[1]).padStart(2, '0');
            const monStr = spaceMatch[2].slice(0, 3).toLowerCase();
            const map = { jan: '01', feb: '02', mar: '03', apr: '04', may: '05', jun: '06', jul: '07', aug: '08', sep: '09', oct: '10', nov: '11', dec: '12' };
            const mm = map[monStr] || '01';
            return `${dd}-${mm}-${spaceMatch[3]}`;
        }
        // fallback: try Date constructor
        try {
            const dt = new Date(s);
            if (!Number.isNaN(dt.getTime())) {
                const dd = String(dt.getDate()).padStart(2, '0');
                const mm = String(dt.getMonth() + 1).padStart(2, '0');
                const yyyy = String(dt.getFullYear());
                return `${dd}-${mm}-${yyyy}`;
            }
        } catch (e) {
            // ignore
        }
        return null;
    };

    // helper: sanitize NAV-like strings (remove currency symbols, commas)
    const sanitizeNav = (n) => {
        if (n === undefined || n === null) return null;
        const s = String(n).trim();
        if (s === '') return null;
        // remove anything except digits, dot, minus
        const cleaned = s.replace(/[^0-9.\-]/g, '');
        return cleaned === '' ? null : cleaned;
    };

    const entries = entriesRaw.map(e => ({
        date: e && (e.date || e.Date) ? normalizeDate(e.date || e.Date) : null,
        nav: (() => {
            // some apis use different keys like 'nav', 'Net_Asset_Value', 'close'
            const raw = e && (e.nav !== undefined ? e.nav : (e.Net_Asset_Value !== undefined ? e.Net_Asset_Value : (e.close !== undefined ? e.close : (e.Nav !== undefined ? e.Nav : null))));
            return sanitizeNav(raw);
        })(),
    }));
    const metaRaw = safe.meta || {};
    const meta = { scheme_name: metaRaw.scheme_name || metaRaw.name || '' };
    return { entries, meta };
}

const adapters = {
    // adapter for https://api.mfapi.in/mf/<scheme_code>
    mfapi: async (scheme) => {
        const res = await axios.get(`https://api.mfapi.in/mf/${scheme.scheme_code}`);
        const payload = res && res.data ? res.data : {};
        // mfapi returns { meta, data }
        return ensureCanonical({ entries: payload.data, meta: payload.meta });
    },

    // Example adapter for a hypothetical other API - shows the expected transform
    otherApi: async (scheme) => {
        // This is a template showing how to transform arbitrary shapes into canonical shape
        const res = await axios.get(`https://other.api/schemes/${scheme.scheme_code}`);
        const body = res && res.data ? res.data : {};
        const entries = (body.history || []).map(h => ({ date: h.dateString, nav: h.navValue }));
        const meta = { scheme_name: body.name };
        return ensureCanonical({ entries, meta });
    }
    ,
    // hybrid adapter: use RapidAPI latest endpoint for the newest NAV and mfapi for historical entries
    hybrid: async (scheme) => {
        // mfapi fetch (historical) - we reuse the mfapi adapter
        const mfapiPromise = adapters.mfapi(scheme).catch(() => ({ entries: [], meta: {} }));

        // RapidAPI latest endpoint (may require API key in env)
        // RapidAPI key: check several possible runtime sources to make testing easier
        const getRapidKeyAndSource = () => {
            try {
                // 1) Build-time env injected by CRA (available in the bundle as process.env)
                if (typeof process !== 'undefined' && process.env && process.env.REACT_APP_RAPIDAPI_KEY) {
                    return { key: String(process.env.REACT_APP_RAPIDAPI_KEY).trim(), source: 'process.env.REACT_APP_RAPIDAPI_KEY' };
                }
                // 2) Explicit global on window (useful for injection in index.html)
                if (typeof window !== 'undefined' && window.__RAPIDAPI_KEY__) {
                    return { key: String(window.__RAPIDAPI_KEY__).trim(), source: 'window.__RAPIDAPI_KEY__' };
                }
                if (typeof window !== 'undefined' && window.RAPIDAPI_KEY) {
                    return { key: String(window.RAPIDAPI_KEY).trim(), source: 'window.RAPIDAPI_KEY' };
                }
                // 3) URL query param for quick local testing: ?rapidapi_key=...
                if (typeof window !== 'undefined') {
                    const qp = new URLSearchParams(window.location.search).get('rapidapi_key');
                    if (qp) return { key: String(qp).trim(), source: 'URL ?rapidapi_key' };
                }
                // 4) localStorage (convenient for browser testing)
                if (typeof window !== 'undefined' && window.localStorage) {
                    const ls = window.localStorage.getItem('rapidapi_key');
                    if (ls) return { key: String(ls).trim(), source: 'localStorage rapidapi_key' };
                }
                // 5) meta tag in index.html: <meta name="rapidapi-key" content="...">
                if (typeof document !== 'undefined') {
                    const el = document.querySelector('meta[name="rapidapi-key"]');
                    if (el && el.content) return { key: String(el.content).trim(), source: 'meta[name=rapidapi-key]' };
                }
            } catch (e) {
                // ignore access errors in SSR or restricted environments
            }
            return { key: '', source: null };
        };

        const { key: rapidKey, source: rapidKeySource } = getRapidKeyAndSource();
        const rapidHost = (typeof process !== 'undefined' && process.env && process.env.REACT_APP_RAPIDAPI_HOST) || (typeof window !== 'undefined' && window.__RAPIDAPI_HOST__) || 'latest-mutual-fund-nav.p.rapidapi.com';
        let rapidPromise;
        if (!rapidKey) {
            // skip rapid if no key provided and give actionable guidance
            console.info('[hybrid adapter] RapidAPI key not found; skipping RapidAPI for', scheme.scheme_code, '\n  Provide a key via one of:\n    - REACT_APP_RAPIDAPI_KEY at build time\n    - Add ?rapidapi_key=YOUR_KEY to the URL for quick testing\n    - Set window.__RAPIDAPI_KEY__ or window.RAPIDAPI_KEY in the page\n    - localStorage.setItem("rapidapi_key", "YOUR_KEY")\n    - Add <meta name="rapidapi-key" content="YOUR_KEY"> to index.html');
            rapidPromise = Promise.resolve(null);
        } else {
            // mask key for logging (show last 4 chars)
            const masked = rapidKey.length > 6 ? `****${rapidKey.slice(-4)}` : '****';
            console.info('[hybrid adapter] RapidAPI key found (%s) from %s — attempting RapidAPI latest for scheme %s', masked, rapidKeySource || 'unknown', scheme.scheme_code);
            const options = {
                method: 'GET',
                url: `https://${rapidHost}/latest`,
                params: {
                    Scheme_Type: 'Open',
                    Scheme_Code: String(scheme.scheme_code)
                },
                headers: {
                    'x-rapidapi-key': rapidKey,
                    'x-rapidapi-host': rapidHost
                }
            };
            rapidPromise = axios.request(options).then(r => Array.isArray(r && r.data) ? r.data : null).catch((err) => {
                console.warn('[hybrid adapter] RapidAPI request failed for', scheme.scheme_code, err && err.message ? err.message : err);
                return null;
            });
        }

        const [mfapiResp, rapidResp] = await Promise.all([mfapiPromise, rapidPromise]);

        const mfPayload = ensureCanonical(mfapiResp || {});

        let entries = Array.isArray(mfPayload.entries) ? mfPayload.entries.slice() : [];
        let meta = mfPayload.meta || { scheme_name: '' };

        if (rapidResp && Array.isArray(rapidResp) && rapidResp.length > 0) {
            // find the matching scheme code entry
            const codeNum = Number(scheme.scheme_code);
            const found = rapidResp.find(item => Number(item.Scheme_Code) === codeNum) || rapidResp[0];
            if (found) {
                const latestEntry = { date: found.Date, nav: String(found.Net_Asset_Value) };
                // prepend latestEntry if its date is different from current first entry
                if (!entries.length || entries[0].date !== latestEntry.date) {
                    entries.unshift(latestEntry);
                } else {
                    // replace existing first entry with latest value to ensure consistency
                    entries[0] = latestEntry;
                }
                // prefer meta from mfapi, else use rapid's name
                if (!meta || !meta.scheme_name) meta = { scheme_name: found.Scheme_Name || '' };
            }
        }

        return ensureCanonical({ entries, meta });
    }
};

/**
 * Fetch scheme data using a named adapter and always return the canonical payload shape.
 * @param {string} adapterKey
 * @param {Object} scheme
 * @returns {Promise<CanonicalPayload>}
 */
export async function fetchSchemeDataUsingAdapter(adapterKey, scheme) {
    const adapter = adapters[adapterKey];
    if (!adapter) throw new Error(`Unknown data adapter: ${adapterKey}`);
    const raw = await adapter(scheme);
    return ensureCanonical(raw);
}

export const availableAdapters = Object.keys(adapters);

export default adapters;
