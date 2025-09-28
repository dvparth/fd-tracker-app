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
import axios from 'axios';
import schemes from '../config/schemes.json';

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

function toTitleCase(str) {
    if (!str) return '';
    return String(str).toLowerCase().split(/\s+/).map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');
}

export default function MFTracker() {
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [lastUpdated, setLastUpdated] = useState(null);

    const load = async () => {
        setLoading(true);
        setError(null);
        try {
            const promises = schemes.map(s => axios.get(`https://api.mfapi.in/mf/${s.scheme_code}`));
            const settled = await Promise.allSettled(promises);
            const results = settled.map((res, idx) => {
                const s = schemes[idx];
                if (res.status === 'fulfilled') {
                    const payload = res.value.data;
                    const entries = payload && payload.data ? payload.data : [];
                    const nav0 = entries[0] && entries[0].nav ? parseFloat(entries[0].nav) : null;
                    const nav1 = entries[1] && entries[1].nav ? parseFloat(entries[1].nav) : null;
                    const nav2 = entries[2] && entries[2].nav ? parseFloat(entries[2].nav) : null;
                    const mv0 = nav0 !== null ? nav0 * s.unit : null;
                    const mv1 = nav1 !== null ? nav1 * s.unit : null;
                    const mv2 = nav2 !== null ? nav2 * s.unit : null;
                    // profit = market value - invested principal
                    const profit = mv0 !== null ? (mv0 - s.principal) : null;
                    // previous NAV delta (mv0 - mv1)
                    const prevDelta = (mv0 !== null && mv1 !== null) ? (mv0 - mv1) : null;
                    const latestDate = entries[0] && entries[0].date ? entries[0].date : null;
                    return {
                        scheme_code: s.scheme_code,
                        scheme_name: payload && payload.meta && payload.meta.scheme_name ? payload.meta.scheme_name : `Code ${s.scheme_code}`,
                        principal: s.principal,
                        unit: s.unit,
                        nav: nav0,
                        marketValue: mv0,
                        profit,
                        prevDelta,
                        hist: [{ date: entries[1] && entries[1].date ? entries[1].date : null, nav: nav1, marketValue: mv1 }, { date: entries[2] && entries[2].date ? entries[2].date : null, nav: nav2, marketValue: mv2 }],
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

    // totals (profit and previous NAV delta)
    const totals = rows.reduce((acc, r) => {
        acc.principal += Number(r.principal || 0);
        acc.marketValue += Number(r.marketValue || 0);
        acc.profit += Number(r.profit || 0);
        acc.prevDelta += Number(r.prevDelta || 0);
        acc.prev1 += Number((r.hist[0] && r.hist[0].marketValue) || 0);
        acc.prev2 += Number((r.hist[1] && r.hist[1].marketValue) || 0);
        return acc;
    }, { principal: 0, marketValue: 0, profit: 0, prevDelta: 0, prev1: 0, prev2: 0 });

    const totalsProfitPct = totals.principal ? (totals.profit / totals.principal) * 100 : null;
    const totalsPrevDeltaPct = totals.prev1 ? (totals.prevDelta / totals.prev1) * 100 : null;

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
            <Card elevation={4} sx={{ mb: 1.5, borderRadius: 2, background: 'linear-gradient(135deg,#ffffff,#eef6ff)', boxShadow: '0 8px 24px rgba(31,42,68,0.06)' }}>
                <CardContent>
                    <Grid container spacing={1} alignItems="center">
                        {/* Row 1: 3 columns for perfect alignment */}
                        <Grid item xs={4} sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: 80 }}>
                            <Typography sx={{ fontSize: '0.75rem', color: '#556475' }}>Current Value</Typography>
                            <Typography sx={{ fontWeight: 900, fontSize: '1.18rem', color: '#0f1724' }}>₹ {fmtRoundUp(totals.marketValue)}</Typography>
                            <Typography sx={{ fontSize: '0.68rem', color: '#7a8696', mt: 0.5 }}>{latestDate ? dateShort(latestDate) : ''}</Typography>
                        </Grid>
                        <Grid item xs={4} sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: 80, alignItems: 'center' }}>
                            <Typography sx={{ fontSize: '0.75rem', color: '#556475' }}>Invested</Typography>
                            <Typography sx={{ fontWeight: 900, fontSize: '1.18rem', color: '#0f1724' }}>₹ {fmtRoundUp(totals.principal)}</Typography>
                            <Typography sx={{ fontSize: '0.68rem', color: '#7a8696', mt: 0.5 }}>{rows.length} schemes</Typography>
                        </Grid>
                        <Grid item xs={4} sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: 80, alignItems: 'flex-end' }}>
                            <Typography sx={{ fontSize: '0.75rem', color: '#556475' }}>Profit / Loss</Typography>
                            <Typography sx={{ fontWeight: 900, fontSize: '1.18rem', color: profitColor(totals.profit) }}>₹ {fmtRoundUp(totals.profit)}</Typography>
                            <Typography sx={{ fontSize: '0.68rem', color: '#7a8696', mt: 0.5 }}>{totalsProfitPct !== null ? `(${totalsProfitPct.toFixed(2)}%)` : ''}</Typography>
                        </Grid>

                        {/* Row 2: centered previous-NAV delta */}
                        <Grid item xs={12}>
                            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 1 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 2, bgcolor: '#ffffff', borderRadius: 2, boxShadow: '0 4px 12px rgba(15,23,36,0.04)' }}>
                                    {totals.prevDelta > 0 ? <ArrowUpwardIcon sx={{ color: accentColor(totals.prevDelta), fontSize: '1.05rem' }} /> : totals.prevDelta < 0 ? <ArrowDownwardIcon sx={{ color: accentColor(totals.prevDelta), fontSize: '1.05rem' }} /> : null}
                                    <Box sx={{ textAlign: 'left' }}>
                                        <Typography sx={{ fontWeight: 800, color: profitColor(totals.prevDelta), fontSize: '0.98rem' }}>Change vs Prev NAV: ₹ {fmtRoundUp(totals.prevDelta)}</Typography>
                                        <Typography sx={{ fontSize: '0.72rem', color: '#556475' }}>{totalsPrevDeltaPct !== null ? `(${totalsPrevDeltaPct.toFixed(2)}%)` : ''}</Typography>
                                    </Box>
                                </Box>
                            </Box>
                        </Grid>

                        {/* Row 3: Prev and Prev 2 aligned under columns */}
                        <Grid item xs={4}>
                            <Typography sx={{ fontSize: '0.72rem', color: '#666', mt: 1 }}>Prev</Typography>
                            <Typography sx={{ fontWeight: 800 }}>₹ {fmtRoundUp(totals.prev1)}</Typography>
                        </Grid>
                        <Grid item xs={4} sx={{ textAlign: 'center' }}>
                            <Typography sx={{ fontSize: '0.72rem', color: '#666', mt: 1 }}>Prev 2</Typography>
                            <Typography sx={{ fontWeight: 800 }}>₹ {fmtRoundUp(totals.prev2)}</Typography>
                        </Grid>
                        <Grid item xs={4} />
                    </Grid>
                </CardContent>
            </Card>

            {/* List of schemes - mobile first cards with accordion */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {rows.map((r) => {
                    const pct = (r.hist[0] && r.hist[0].marketValue) ? ((r.prevDelta / r.hist[0].marketValue) * 100) : null;
                    return (
                        <Accordion key={r.scheme_code} sx={{ borderRadius: 2, borderLeft: '4px solid', borderLeftColor: accentColor(r.prevDelta), background: '#fff', boxShadow: '0 6px 18px rgba(15,23,36,0.03)' }} disableGutters>
                            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                <Box sx={{ display: 'flex', width: '100%', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', maxWidth: '62%' }}>
                                        <Typography sx={{ fontSize: '0.98rem', fontWeight: 800, color: '#0f1724' }}>{toTitleCase(r.scheme_name)}</Typography>
                                        <Typography sx={{ fontSize: '0.72rem', color: '#6b7280' }}>{r.unit ? `${fmtUnit(r.unit)} units • Invested ₹ ${fmtRoundUp(r.principal)}` : `Invested ₹ ${fmtRoundUp(r.principal)}`}</Typography>
                                    </Box>
                                    <Box sx={{ textAlign: 'right', minWidth: 120 }}>
                                        <Typography sx={{ fontWeight: 800, color: '#0f1724' }}>₹ {r.marketValue !== null ? fmtRoundUp(r.marketValue) : '-'}</Typography>
                                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 0.5 }}>
                                            {r.profit > 0 ? <ArrowUpwardIcon sx={{ color: accentColor(r.profit), fontSize: '1rem' }} /> : r.profit < 0 ? <ArrowDownwardIcon sx={{ color: accentColor(r.profit), fontSize: '1rem' }} /> : null}
                                            <Typography sx={{ fontWeight: 700, color: profitColor(r.profit) }}>{r.profit !== null ? `₹ ${fmtRoundUp(r.profit)}` : '-'}</Typography>
                                        </Box>
                                        {/* secondary: previous NAV delta */}
                                        <Typography sx={{ fontSize: '0.72rem', color: accentColor(r.prevDelta), fontWeight: 700 }}>{r.prevDelta !== null ? `${r.prevDelta > 0 ? '+' : ''}₹ ${fmtRoundUp(r.prevDelta)} ${pct !== null ? `(${pct.toFixed(2)}%)` : ''}` : ''}</Typography>
                                        <Typography sx={{ fontSize: '0.68rem', color: '#9aa4b2' }}>{r.latestDate ? dateShort(r.latestDate) : ''}</Typography>
                                    </Box>
                                </Box>
                            </AccordionSummary>
                            <AccordionDetails>
                                <Grid container spacing={1}>
                                    <Grid item xs={6}>
                                        <Typography sx={{ fontSize: '0.72rem', color: '#666' }}>Prev</Typography>
                                        <Typography sx={{ fontWeight: 700 }}>₹ {r.hist[0] && r.hist[0].marketValue !== null ? fmtRoundUp(r.hist[0].marketValue) : '-'}</Typography>
                                        <Typography sx={{ fontSize: '0.68rem', color: '#777' }}>{r.hist[0] && r.hist[0].date ? dateShort(r.hist[0].date) : ''}</Typography>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Typography sx={{ fontSize: '0.72rem', color: '#666' }}>Prev 2</Typography>
                                        <Typography sx={{ fontWeight: 700 }}>₹ {r.hist[1] && r.hist[1].marketValue !== null ? fmtRoundUp(r.hist[1].marketValue) : '-'}</Typography>
                                        <Typography sx={{ fontSize: '0.68rem', color: '#777' }}>{r.hist[1] && r.hist[1].date ? dateShort(r.hist[1].date) : ''}</Typography>
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Divider sx={{ my: 1 }} />
                                    </Grid>
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
