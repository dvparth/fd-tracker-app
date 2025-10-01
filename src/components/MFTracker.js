import React, { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import RefreshIcon from '@mui/icons-material/Refresh';
import Typography from '@mui/material/Typography';
import schemes from '../config/schemes.json';
import { fetchSchemeDataUsingAdapter, availableAdapters } from '../adapters/mfAdapters';
import SummaryCard from './SummaryCard';
import SchemeAccordion from './SchemeAccordion';
import { parseDMY, formatDMY, findNearestEntry, fmtRoundUp, profitColor, dateShort, monthLabelShort } from '../utils/formatters';

export default function MFTracker() {
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [lastUpdated, setLastUpdated] = useState(null);
    

    // Allow overriding the adapter via env var for testing. Prefer 'hybrid' when available so
    // the RapidAPI latest endpoint is used to augment mfapi historical data.
    const envAdapter = typeof process !== 'undefined' && process.env && process.env.REACT_APP_DATA_ADAPTER;
    const dataAdapterKey = envAdapter || (availableAdapters.includes('hybrid') ? 'hybrid' : (availableAdapters.includes('mfapi') ? 'mfapi' : availableAdapters[0]));
    // debug: report which adapter is selected
    // Adapter selection determined by env/build-time or available adapters

    const load = async () => {
        setLoading(true);
        setError(null);
        try {
            // fetch through adapter(s) to keep MFTracker decoupled from API shape
            const settled = await Promise.allSettled(schemes.map(s => fetchSchemeDataUsingAdapter(dataAdapterKey, s)));
            const results = settled.map((res, idx) => {
                const s = schemes[idx];
                if (res.status === 'fulfilled') {
                    // adapter guarantees canonical shape: { entries: [{date, nav}], meta: { scheme_name } }
                    const payload = res.value || { entries: [], meta: { scheme_name: '' } };
                    const entries = Array.isArray(payload.entries) ? payload.entries : [];
                    // robustly parse NAVs and convert non-finite values to null to avoid NaN propagation
                    let nav0 = entries[0] && entries[0].nav ? Number.parseFloat(entries[0].nav) : null;
                    let nav1 = entries[1] && entries[1].nav ? Number.parseFloat(entries[1].nav) : null;
                    let nav2 = entries[2] && entries[2].nav ? Number.parseFloat(entries[2].nav) : null;
                    if (!Number.isFinite(nav0)) nav0 = null;
                    if (!Number.isFinite(nav1)) nav1 = null;
                    if (!Number.isFinite(nav2)) nav2 = null;
                    const mv0 = (nav0 !== null) ? nav0 * s.unit : null;
                    const mv1 = (nav1 !== null) ? nav1 * s.unit : null;
                    const mv2 = (nav2 !== null) ? nav2 * s.unit : null;
                    const profit = (mv0 !== null && Number.isFinite(mv0)) ? (mv0 - s.principal) : null;
                    const prevDelta = (mv0 !== null && mv1 !== null && Number.isFinite(mv0) && Number.isFinite(mv1)) ? (mv0 - mv1) : null;
                    const latestDate = entries[0] && entries[0].date ? entries[0].date : null;
                    const schemeName = (payload.meta && payload.meta.scheme_name) ? payload.meta.scheme_name : `Code ${s.scheme_code}`;
                    return {
                        scheme_code: s.scheme_code,
                        scheme_name: schemeName,
                        principal: s.principal,
                        unit: s.unit,
                        // ensure numeric fields are either finite numbers or null
                        nav: nav0 !== null && Number.isFinite(nav0) ? nav0 : null,
                        marketValue: mv0 !== null && Number.isFinite(mv0) ? mv0 : null,
                        profit: profit !== null && Number.isFinite(profit) ? profit : null,
                        prevDelta: prevDelta !== null && Number.isFinite(prevDelta) ? prevDelta : null,
                        hist: [{ date: entries[1] && entries[1].date ? entries[1].date : null, nav: nav1, marketValue: mv1 }, { date: entries[2] && entries[2].date ? entries[2].date : null, nav: nav2, marketValue: mv2 }],
                        entries,
                        latestDate,
                    };
                }
                return {
                    scheme_code: s.scheme_code,
                    scheme_name: `Code ${s.scheme_code}`,
                    principal: s.principal,
                    unit: s.unit,
                    nav: null,
                    marketValue: null,
                    profit: null,
                    prevDelta: null,
                    hist: [{ date: null, nav: null, marketValue: null }, { date: null, nav: null, marketValue: null }],
                    entries: [],
                    latestDate: null,
                };
            });
            setRows(results);
            setLastUpdated(new Date());
        } catch (err) {
            setError(err.message || 'Failed to load');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, []);

    // We'll compute totals after we derive per-row month values (rowsWithMonths)

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ p: 2 }}>
                <Typography color="error">Error: {error}</Typography>
                <Button startIcon={<RefreshIcon />} onClick={() => load()} sx={{ mt: 2 }}>Retry</Button>
            </Box>
        );
    }

    const latestDate = rows.reduce((acc, r) => r.latestDate && (!acc || r.latestDate > acc) ? r.latestDate : acc, null);

    // compute target dates relative to latestDate: 1,2,3 months back
    let monthTargets = [null, null, null];
    if (latestDate) {
        const base = parseDMY(latestDate);
        if (base) {
            monthTargets = [1, 2, 3].map(i => {
                const d = new Date(base.getTime());
                d.setMonth(d.getMonth() - i);
                return d;
            });
        }
    }

    const month1Label = monthTargets[0] ? monthLabelShort(formatDMY(monthTargets[0])) : '';
    const month2Label = monthTargets[1] ? monthLabelShort(formatDMY(monthTargets[1])) : '';
    const month3Label = monthTargets[2] ? monthLabelShort(formatDMY(monthTargets[2])) : '';

    // Derive per-row month values (nearest NAV to each month target)
    const rowsWithMonths = rows.map(r => {
        const entries = r.entries || [];
        const months = monthTargets.map(t => {
            if (!t) return { date: null, marketValue: null };
            const found = findNearestEntry(entries, t);
            if (!found || (found.nav === undefined || found.nav === null)) return { date: null, marketValue: null };
            const nav = parseFloat(found.nav);
            const mv = (Number.isFinite(nav) && r.unit) ? (nav * r.unit) : null;
            return { date: found.date, marketValue: mv };
        });
        return { ...r, months };
    });

    // totals computed from rowsWithMonths
    const totals = rowsWithMonths.reduce((acc, r) => {
        acc.principal += Number(r.principal || 0);
        acc.marketValue += Number(r.marketValue || 0);
        acc.profit += Number(r.profit || 0);
        acc.prevDelta += Number(r.prevDelta || 0);
        acc.month1 += Number((r.months && r.months[0] && r.months[0].marketValue) || 0);
        acc.month2 += Number((r.months && r.months[1] && r.months[1].marketValue) || 0);
        acc.month3 += Number((r.months && r.months[2] && r.months[2].marketValue) || 0);
        return acc;
    }, { principal: 0, marketValue: 0, profit: 0, prevDelta: 0, month1: 0, month2: 0, month3: 0 });

    const totalsProfitPct = totals.principal ? (totals.profit / totals.principal) * 100 : null;
    const totalsPrevDeltaPct = totals.month1 ? (totals.prevDelta / totals.month1) * 100 : null;

    // color tokens for the 1 Day change chip
    const changeVal = totals.prevDelta;
    const changeBg = changeVal > 0 ? 'rgba(0,184,148,0.08)' : changeVal < 0 ? 'rgba(255,107,107,0.08)' : '#ffffff';
    const changeBorder = changeVal > 0 ? '#00b894' : changeVal < 0 ? '#ff6b6b' : '#e6eef6';
    const changeText = profitColor(changeVal);

    // sort rows by marketValue descending for display (null/invalid marketValues go last)
    const sortedRows = rowsWithMonths.slice().sort((a, b) => {
        const av = Number.isFinite(a.marketValue) ? a.marketValue : -Infinity;
        const bv = Number.isFinite(b.marketValue) ? b.marketValue : -Infinity;
        return bv - av;
    });



    return (
        <Box sx={{ p: { xs: 1.5, sm: 2 }, maxWidth: '980px', mx: 'auto' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <div>
                    <strong style={{ color: '#635bff', fontWeight: 900 }}>Parth Dave</strong>
                    <span style={{ marginLeft: 10, color: '#374151', fontWeight: 700 }}>— Personal MF Snapshot</span>
                </div>
                <Box>
                    <Tooltip title="Refresh">
                        <Button onClick={() => load()} startIcon={<RefreshIcon />} size="small">Refresh</Button>
                    </Tooltip>
                </Box>
            </Box>



            <SummaryCard totals={totals} latestDate={latestDate} month1Label={month1Label} month2Label={month2Label} month3Label={month3Label} />

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {sortedRows.map(r => (
                    <SchemeAccordion key={r.scheme_code} r={r} month1Label={month1Label} month2Label={month2Label} month3Label={month3Label} />
                ))}
            </Box>
        </Box>
    );
}
