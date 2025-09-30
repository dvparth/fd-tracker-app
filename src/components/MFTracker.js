import React, { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import RefreshIcon from '@mui/icons-material/Refresh';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import schemes from '../config/schemes.json';
import { fetchSchemeDataUsingAdapter, availableAdapters } from '../adapters/mfAdapters';

function fmtAmount(v) {
    if (v === null || v === undefined || Number.isNaN(v)) return '-';
    return Number(v).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function fmtRoundUp(v) {
    // Round up and show no decimals
    if (v === null || v === undefined || Number.isNaN(v)) return '-';
    return Math.ceil(Number(v)).toLocaleString();
}

function fmtUnit(v) {
    if (v === null || v === undefined || Number.isNaN(v)) return '-';
    return Number(v).toLocaleString(undefined, { maximumFractionDigits: 3 });
}

function profitColor(n) {
    if (n === null || n === undefined || Number.isNaN(n)) return 'text.primary';
    if (n > 0) return 'success.main';
    if (n < 0) return 'error.main';
    return 'text.primary';
}

function accentColor(n) {
    if (n === null || n === undefined || Number.isNaN(n)) return '#cfd8dc';
    if (n > 0) return '#00b894'; // teal green
    if (n < 0) return '#ff6b6b'; // soft red
    return '#90a4ae';
}

function dateShort(d) {
    if (!d) return '-';
    // input DD-MM-YYYY -> '26-Sep-2025'
    const parts = d.split('-');
    if (parts.length !== 3) return d;
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const m = months[Number(parts[1]) - 1] || parts[1];
    return `${parts[0]} ${m}`;
}

function monthLabelShort(d) {
    // d expected 'DD-MM-YYYY' -> return '26-Sep'
    if (!d) return '-';
    const parts = d.split('-');
    if (parts.length !== 3) return d;
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const m = months[Number(parts[1]) - 1] || parts[1];
    const dd = parts[0];
    return `${dd}-${m}`;
}

function toTitleCase(str) {
    if (!str) return '';
    return String(str).toLowerCase().split(/\s+/).map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');
}
// parse DD-MM-YYYY -> Date
function parseDMY(d) {
    if (!d) return null;
    const parts = d.split('-');
    if (parts.length !== 3) return null;
    const dd = Number(parts[0]);
    const mm = Number(parts[1]) - 1;
    const yyyy = Number(parts[2]);
    return new Date(yyyy, mm, dd);
}

// format Date -> DD-MM-YYYY
function formatDMY(date) {
    if (!date) return '';
    const dd = String(date.getDate()).padStart(2, '0');
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const yyyy = String(date.getFullYear());
    return `${dd}-${mm}-${yyyy}`;
}

function findNearestEntry(entries, targetDate) {
    if (!entries || entries.length === 0 || !targetDate) return null;
    const targetTime = targetDate.getTime();
    let best = null;
    let bestDiff = Infinity;
    for (const e of entries) {
        if (!e || !e.date || !e.nav) continue;
        const ed = parseDMY(e.date);
        if (!ed) continue;
        const diff = Math.abs(ed.getTime() - targetTime);
        if (diff < bestDiff) {
            bestDiff = diff;
            best = e;
        }
    }
    return best;
}

export default function MFTracker() {
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [lastUpdated, setLastUpdated] = useState(null);

    // Allow overriding the adapter via env var for testing. Prefer 'hybrid' when available so
    // the RapidAPI latest endpoint is used to augment mfapi historical data.
    const envAdapter = typeof process !== 'undefined' && process.env && process.env.REACT_APP_DATA_ADAPTER;
    const dataAdapterKey = envAdapter || (availableAdapters.includes('hybrid') ? 'hybrid' : (availableAdapters.includes('mfapi') ? 'mfapi' : availableAdapters[0]));

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
            if (!found || !found.nav) return { date: null, marketValue: null };
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
                <Typography variant="h6" sx={{ color: '#23234a', fontWeight: 800, fontSize: { xs: '1.05rem', sm: '1.25rem' } }}>
                    <span style={{ color: '#635bff', fontWeight: 900 }}>Parth Dave</span>
                    <span style={{ marginLeft: 10, color: '#374151', fontWeight: 700 }}>— Personal MF Snapshot</span>
                </Typography>
                <Box>
                    <Tooltip title="Refresh">
                        <IconButton onClick={() => load()} size="small"><RefreshIcon /></IconButton>
                    </Tooltip>
                </Box>
            </Box>

            {/* Top summary card - strict 3-column alignment */}
            <Card elevation={4} sx={{ mb: 1.25, borderRadius: 2, background: 'linear-gradient(135deg,#ffffff,#eef6ff)', boxShadow: '0 6px 18px rgba(31,42,68,0.05)' }}>
                <CardContent sx={{ py: 1, px: { xs: 1.25, sm: 2 } }}>
                    <Grid container spacing={2} alignItems="center" sx={{ columnGap: 2 }}>
                        {/* Row 1: 3 columns for perfect alignment */}
                        <Grid item xs={4} sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: 56 }}>
                            <Typography sx={{ fontSize: '0.72rem', color: '#556475' }}>Current Value</Typography>
                            <Typography noWrap sx={{ fontWeight: 800, fontSize: '0.95rem', color: '#0f1724' }}>₹{fmtRoundUp(totals.marketValue)}</Typography>
                            <Typography sx={{ fontSize: '0.60rem', color: '#7a8696', mt: 0.35 }}>{latestDate ? dateShort(latestDate) : ''}</Typography>
                        </Grid>
                        <Grid item xs={4} sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: 56, alignItems: 'center' }}>
                            <Typography sx={{ fontSize: '0.72rem', color: '#556475' }}>Invested</Typography>
                            <Typography noWrap sx={{ fontWeight: 800, fontSize: '0.95rem', color: '#0f1724' }}>₹{fmtRoundUp(totals.principal)}</Typography>
                            <Typography sx={{ fontSize: '0.60rem', color: '#7a8696', mt: 0.35 }}>{rows.length} schemes</Typography>
                        </Grid>
                        <Grid item xs={4} sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: 56, alignItems: 'flex-end' }}>
                            <Typography sx={{ fontSize: '0.72rem', color: '#556475' }}>Profit / Loss</Typography>
                            <Typography noWrap sx={{ fontWeight: 800, fontSize: '0.95rem', color: profitColor(totals.profit) }}>₹{fmtRoundUp(totals.profit)}</Typography>
                            <Typography sx={{ fontSize: '0.60rem', color: '#7a8696', mt: 0.35 }}>{totalsProfitPct !== null ? `(${totalsProfitPct.toFixed(2)}%)` : ''}</Typography>
                        </Grid>

                        {/* Row 2: 1 Day change (left aligned) - own dedicated row */}
                        <Grid item xs={12}>
                            <Box sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', py: 0.4 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 1.25, bgcolor: changeBg, borderRadius: 1.5, boxShadow: '0 3px 10px rgba(15,23,36,0.03)', border: `1px solid ${changeBorder}` }}>
                                    {totals.prevDelta > 0 ? <ArrowUpwardIcon sx={{ color: changeBorder, fontSize: '0.95rem' }} /> : totals.prevDelta < 0 ? <ArrowDownwardIcon sx={{ color: changeBorder, fontSize: '0.95rem' }} /> : null}
                                    <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 0.75 }}>
                                        <Typography noWrap sx={{ fontWeight: 800, color: changeText, fontSize: '0.9rem' }}>1 Day change: ₹{fmtRoundUp(totals.prevDelta)}</Typography>
                                        <Typography noWrap sx={{ fontSize: '0.64rem', color: changeText }}>{totalsPrevDeltaPct !== null ? `(${totalsPrevDeltaPct.toFixed(2)}%)` : ''}</Typography>
                                    </Box>
                                </Box>
                            </Box>
                        </Grid>

                        {/* Row 3: Month values (month1 = latest, month2 = prev, month3 = prev2) */}
                        <Grid item xs={12} sx={{ mt: 0.25 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', gap: 2 }}>
                                <Box sx={{ textAlign: 'left', flex: 1 }}>
                                    <Typography sx={{ fontSize: '0.72rem', color: '#666' }}>{month1Label}</Typography>
                                    <Typography sx={{ fontWeight: 800, fontSize: '0.95rem', color: (Number(totals.month1) > Number(totals.marketValue) ? '#00b894' : '#0f1724') }}>₹{fmtRoundUp(totals.month1)}</Typography>
                                </Box>
                                <Box sx={{ textAlign: 'center', flex: 1 }}>
                                    <Typography sx={{ fontSize: '0.72rem', color: '#666' }}>{month2Label}</Typography>
                                    <Typography sx={{ fontWeight: 800, fontSize: '0.95rem', color: (Number(totals.month2) > Number(totals.marketValue) ? '#00b894' : '#0f1724') }}>₹{fmtRoundUp(totals.month2)}</Typography>
                                </Box>
                                <Box sx={{ textAlign: 'right', flex: 1 }}>
                                    <Typography sx={{ fontSize: '0.72rem', color: '#666' }}>{month3Label}</Typography>
                                    <Typography sx={{ fontWeight: 800, fontSize: '0.95rem', color: (Number(totals.month3) > Number(totals.marketValue) ? '#00b894' : '#0f1724') }}>₹{fmtRoundUp(totals.month3)}</Typography>
                                </Box>
                            </Box>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>

            {/* List of schemes - mobile first cards with accordion */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {sortedRows.map((r) => {
                    const pct = (r.hist[0] && r.hist[0].marketValue) ? ((r.prevDelta / r.hist[0].marketValue) * 100) : null;
                    const profitPct = (r.principal && r.profit !== null) ? ((r.profit / r.principal) * 100) : null;
                    return (
                        <Accordion
                            key={r.scheme_code}
                            disableGutters
                            sx={{
                                borderRadius: 2,
                                borderLeft: '4px solid',
                                borderLeftColor: accentColor(r.prevDelta),
                                background: '#fff',
                                boxShadow: '0 6px 18px rgba(15,23,36,0.03)',
                                transition: 'transform .18s ease, box-shadow .18s ease',
                                '&:hover': {
                                    transform: 'translateY(-2px)',
                                    boxShadow: '0 10px 28px rgba(15,23,36,0.08)'
                                },
                                // allow nested hover styles to change invested color
                                '&:hover .invested-amt': { color: '#0f1724', transform: 'translateY(-1px)' }
                            }}
                        >
                            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                <Box sx={{ display: 'flex', width: '100%', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', maxWidth: '62%' }}>
                                        <Typography sx={{ fontSize: '0.98rem', fontWeight: 800, color: '#0f1724' }}>{toTitleCase(r.scheme_name)}</Typography>
                                        <Typography sx={{ fontSize: '0.72rem', color: '#6b7280' }}>{r.unit ? `${fmtUnit(r.unit)} units` : ''}</Typography>
                                    </Box>
                                    <Box sx={{ textAlign: 'right', minWidth: 120 }}>
                                        <Typography sx={{ fontWeight: 800 }} style={{ color: '#0f1724' }}>₹{r.marketValue !== null ? fmtRoundUp(r.marketValue) : '-'}</Typography>
                                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 0.5 }}>
                                            <Typography sx={{ fontWeight: 700, fontSize: '0.95rem' }} style={{ color: accentColor(r.profit) }}>{r.profit !== null ? `₹${fmtRoundUp(r.profit)}` : '-'}</Typography>
                                            <Typography sx={{ fontSize: '0.72rem', ml: 0.5 }} style={{ color: accentColor(r.profit) }}>{profitPct !== null ? `${profitPct > 0 ? '+' : ''}${profitPct.toFixed(2)}%` : ''}</Typography>
                                        </Box>
                                        {/* secondary: previous NAV delta */}
                                        <Typography sx={{ fontSize: '0.72rem', color: accentColor(r.prevDelta), fontWeight: 700 }}>{r.prevDelta !== null ? `${r.prevDelta > 0 ? '+' : ''}₹${fmtRoundUp(r.prevDelta)} ${pct !== null ? `(${pct.toFixed(2)}%)` : ''}` : ''}</Typography>
                                        <Typography sx={{ fontSize: '0.68rem', color: '#9aa4b2' }}>{r.latestDate ? dateShort(r.latestDate) : ''}</Typography>
                                    </Box>
                                </Box>
                            </AccordionSummary>
                            <AccordionDetails>
                                <Grid container spacing={1} alignItems="center">
                                    <Grid item xs={3} sx={{ flex: 1 }}>
                                        <Typography sx={{ fontSize: '0.72rem', color: '#6b7280' }}>Invested</Typography>
                                        <Typography noWrap sx={{ fontWeight: 700, fontSize: '0.9rem', color: '#0f1724' }}>₹{fmtRoundUp(r.principal)}</Typography>
                                    </Grid>
                                    <Grid item xs={3} sx={{ flex: 1, textAlign: 'center' }}>
                                        <Typography sx={{ fontSize: '0.72rem', color: '#666' }}>{r.months && r.months[0] && r.months[0].date ? monthLabelShort(r.months[0].date) : month1Label}</Typography>
                                        <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', color: (r.months && r.months[0] && Number(r.months[0].marketValue) > Number(r.marketValue) ? '#00b894' : '#0f1724') }}>₹{r.months && r.months[0] && r.months[0].marketValue !== null ? fmtRoundUp(r.months[0].marketValue) : '-'}</Typography>
                                    </Grid>
                                    <Grid item xs={3} sx={{ flex: 1, textAlign: 'center' }}>
                                        <Typography sx={{ fontSize: '0.72rem', color: '#666' }}>{r.months && r.months[1] && r.months[1].date ? monthLabelShort(r.months[1].date) : month2Label}</Typography>
                                        <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', color: (r.months && r.months[1] && Number(r.months[1].marketValue) > Number(r.marketValue) ? '#00b894' : '#0f1724') }}>₹{r.months && r.months[1] && r.months[1].marketValue !== null ? fmtRoundUp(r.months[1].marketValue) : '-'}</Typography>
                                    </Grid>
                                    <Grid item xs={3} sx={{ flex: 1, textAlign: 'right' }}>
                                        <Typography sx={{ fontSize: '0.72rem', color: '#666' }}>{r.months && r.months[2] && r.months[2].date ? monthLabelShort(r.months[2].date) : month3Label}</Typography>
                                        <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', color: (r.months && r.months[2] && Number(r.months[2].marketValue) > Number(r.marketValue) ? '#00b894' : '#0f1724') }}>₹{r.months && r.months[2] && r.months[2].marketValue !== null ? fmtRoundUp(r.months[2].marketValue) : '-'}</Typography>
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Divider sx={{ my: 1 }} />
                                    </Grid>
                                    {/* sparkline removed per design */}
                                    {/* removed action buttons per request */}
                                </Grid>
                            </AccordionDetails>
                        </Accordion>
                    );
                })}
            </Box>
        </Box>
    );
}
