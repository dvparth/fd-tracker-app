import React, { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import TableSortLabel from '@mui/material/TableSortLabel';
import CircularProgress from '@mui/material/CircularProgress';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import RefreshIcon from '@mui/icons-material/Refresh';
import Tooltip from '@mui/material/Tooltip';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import Switch from '@mui/material/Switch';
import schemes from '../config/schemes.json';
import axios from 'axios';

function formatNumber(v) {
    if (v === null || v === undefined || Number.isNaN(v)) return '-';
    return Number(v).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatUnit(v) {
    if (v === null || v === undefined || Number.isNaN(v)) return '-';
    // Show up to 3 decimals for unit, but trim trailing zeros
    return Number(v).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 3 });
}

function formatProfitWhole(v) {
    if (v === null || v === undefined || Number.isNaN(v)) return '-';
    // Round up as requested (Math.ceil). For negative values, Math.ceil moves toward zero.
    return Math.ceil(Number(v)).toString();
}

function formatDateLabel(dateStr) {
    // input expected DD-MM-YYYY
    if (!dateStr) return '-';
    const parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr;
    const day = parts[0];
    const month = parseInt(parts[1], 10);
    const year = parts[2];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];
    const m = months[(month - 1) % 12] || parts[1];
    return `${day}-${m}-${year}`;
}

function profitColor(v) {
    if (v === null || v === undefined || Number.isNaN(v)) return 'text.primary';
    const n = Number(v);
    if (n > 0) return 'success.main';
    if (n < 0) return 'error.main';
    return 'text.primary';
}

function formatPercent(n) {
    if (n === null || n === undefined || Number.isNaN(n)) return '-';
    return `${Number(n).toFixed(2)}%`;
}

export default function MFHoldings() {
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [orderBy, setOrderBy] = useState('scheme_name');
    const [order, setOrder] = useState('asc');

    const [lastUpdated, setLastUpdated] = useState(null);
    const [showPercent, setShowPercent] = useState(false);

    const loadData = async () => {
        setLoading(true);
        setError(null);
        try {
            const promises = schemes.map((s) => axios.get(`https://api.mfapi.in/mf/${s.scheme_code}`));
            const settled = await Promise.allSettled(promises);
            const results = settled.map((res, idx) => {
                const s = schemes[idx];
                if (res.status === 'fulfilled') {
                    const data = res.value.data;
                    const entries = data && data.data ? data.data : [];
                    const parseNav = (x) => {
                        const v = x === undefined || x === null ? null : String(x).replace(/[^0-9.\-]/g, '').trim();
                        const n = v ? Number.parseFloat(v) : null;
                        return Number.isFinite(n) ? n : null;
                    };
                    const nav0 = entries[0] && (entries[0].nav || entries[0].Net_Asset_Value) ? parseNav(entries[0].nav || entries[0].Net_Asset_Value) : null;
                    const nav1 = entries[1] && (entries[1].nav || entries[1].Net_Asset_Value) ? parseNav(entries[1].nav || entries[1].Net_Asset_Value) : null;
                    const nav2 = entries[2] && (entries[2].nav || entries[2].Net_Asset_Value) ? parseNav(entries[2].nav || entries[2].Net_Asset_Value) : null;
                    const nav3 = entries[3] && (entries[3].nav || entries[3].Net_Asset_Value) ? parseNav(entries[3].nav || entries[3].Net_Asset_Value) : null;
                    const marketValue = nav0 !== null ? nav0 * s.unit : null;
                    const profit = marketValue !== null ? marketValue - s.principal : null;
                    const marketValue1 = nav1 !== null ? nav1 * s.unit : null;
                    const profit1 = marketValue1 !== null ? marketValue1 - s.principal : null;
                    const changeToday = (marketValue !== null && marketValue1 !== null) ? (marketValue - marketValue1) : null;
                    const marketValue2 = nav2 !== null ? nav2 * s.unit : null;
                    const profit2 = marketValue2 !== null ? marketValue2 - s.principal : null;
                    const marketValue3 = nav3 !== null ? nav3 * s.unit : null;
                    const profit3 = marketValue3 !== null ? marketValue3 - s.principal : null;
                    const latestDate = entries[0] && entries[0].date ? entries[0].date : null;
                    const date1 = entries[1] && entries[1].date ? entries[1].date : null;
                    const date2 = entries[2] && entries[2].date ? entries[2].date : null;
                    const date3 = entries[3] && entries[3].date ? entries[3].date : null;
                    return {
                        scheme_code: s.scheme_code,
                        scheme_name: data && data.meta && data.meta.fund_house ? data.meta.fund_house : (data && data.meta && data.meta.scheme_name) || `Code ${s.scheme_code}`,
                        principal: s.principal,
                        unit: s.unit,
                        nav: nav0,
                        marketValue,
                        profit,
                        change: changeToday,
                        hist: [
                            { date: date1, nav: nav1, marketValue: marketValue1, profit: profit1 },
                            { date: date2, nav: nav2, marketValue: marketValue2, profit: profit2 },
                            { date: date3, nav: nav3, marketValue: marketValue3, profit: profit3 },
                        ],
                        latestDate,
                        error: null,
                    };
                }
                // failed fetch for this scheme
                return {
                    scheme_code: s.scheme_code,
                    scheme_name: `Code ${s.scheme_code}`,
                    principal: s.principal,
                    unit: s.unit,
                    nav: null,
                    marketValue: null,
                    profit: null,
                    change: null,
                    hist: [{ date: null, nav: null, marketValue: null, profit: null }, { date: null, nav: null, marketValue: null, profit: null }, { date: null, nav: null, marketValue: null, profit: null }],
                    latestDate: null,
                    error: res.reason ? (res.reason.message || String(res.reason)) : 'Fetch failed',
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

    useEffect(() => {
        loadData();
    }, []);

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ p: 4 }}>
                <div>Error: {error}</div>
            </Box>
        );
    }

    // Sorting helper
    const handleSort = (property) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
    };

    const comparator = (a, b) => {
        const av = a[orderBy];
        const bv = b[orderBy];
        // nulls last
        if (av === null || av === undefined) return 1;
        if (bv === null || bv === undefined) return -1;
        if (typeof av === 'number' && typeof bv === 'number') {
            return av - bv;
        }
        return String(av).localeCompare(String(bv));
    };

    const sortedRows = [...rows].sort((a, b) => (order === 'asc' ? comparator(a, b) : -comparator(a, b)));

    // Totals
    const totals = sortedRows.reduce((acc, r) => {
        acc.principal += Number(r.principal || 0);
        acc.marketValue += Number(r.marketValue || 0);
        acc.profit += Number(r.profit || 0);
        acc.change += Number(r.change || 0);
        acc.prevMarket += Number((r.hist[0] && r.hist[0].marketValue) || 0);
        // historical
        acc.hist0 += Number((r.hist[0] && r.hist[0].profit) || 0);
        acc.hist1 += Number((r.hist[1] && r.hist[1].profit) || 0);
        acc.hist2 += Number((r.hist[2] && r.hist[2].profit) || 0);
        return acc;
    }, { principal: 0, marketValue: 0, profit: 0, change: 0, prevMarket: 0, hist0: 0, hist1: 0, hist2: 0 });

    return (
        <Box sx={{ p: { xs: 1, sm: 2 } }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="h6" sx={{ fontSize: { xs: '0.9rem', sm: '1.1rem' }, color: '#635bff' }}>MF Holdings</Typography>
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    <Typography sx={{ fontSize: '0.75rem', color: '#666' }}>{lastUpdated ? `Last updated: ${lastUpdated.toLocaleString()}` : ''}</Typography>
                    <Typography sx={{ fontSize: '0.75rem', color: '#666' }}>Show %</Typography>
                    <Switch size="small" checked={showPercent} onChange={(e) => setShowPercent(e.target.checked)} />
                    <Button size="small" startIcon={<RefreshIcon />} onClick={() => loadData()} sx={{ fontSize: '0.75rem' }}>Refresh</Button>
                </Box>
            </Box>
            <TableContainer component={Paper} sx={{ width: '98vw', maxWidth: '1800px', mx: 'auto', px: { xs: 0.5, sm: 1 }, borderRadius: 2, boxShadow: '0 6px 18px rgba(99,91,255,0.12)' }}>
                <Table sx={{ fontSize: '0.75rem', tableLayout: 'fixed', width: '100%' }}>
                    <TableHead>
                        <TableRow>
                            <TableCell rowSpan={2} sx={{ background: 'linear-gradient(90deg,#635bff,#23234a)', color: '#fff', fontWeight: 800, fontSize: '0.75rem', borderBottom: 'none', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: { xs: 120, sm: 320 } }}>
                                <TableSortLabel sx={{ color: 'royalblue', '& .MuiTableSortLabel-icon': { color: 'royalblue !important' } }} active={orderBy === 'scheme_name'} direction={orderBy === 'scheme_name' ? order : 'asc'} onClick={() => handleSort('scheme_name')}>
                                    Scheme Name
                                </TableSortLabel>
                            </TableCell>
                            <TableCell rowSpan={2} align="right" sx={{ whiteSpace: 'nowrap', background: '#f6f7ff', fontWeight: 700, fontSize: '0.72rem', width: { xs: 90, sm: 120 } }}>
                                <TableSortLabel active={orderBy === 'principal'} direction={orderBy === 'principal' ? order : 'asc'} onClick={() => handleSort('principal')}>Principal</TableSortLabel>
                            </TableCell>
                            <TableCell rowSpan={2} align="right" sx={{ whiteSpace: 'nowrap', background: '#f6f7ff', fontWeight: 700, fontSize: '0.72rem', width: { xs: 70, sm: 100 } }}>
                                <TableSortLabel active={orderBy === 'unit'} direction={orderBy === 'unit' ? order : 'asc'} onClick={() => handleSort('unit')}>Unit</TableSortLabel>
                            </TableCell>
                            <TableCell rowSpan={2} align="right" sx={{ whiteSpace: 'nowrap', background: '#f6f7ff', fontWeight: 700, fontSize: '0.72rem', width: { xs: 90, sm: 130 } }}>
                                <TableSortLabel active={orderBy === 'marketValue'} direction={orderBy === 'marketValue' ? order : 'asc'} onClick={() => handleSort('marketValue')}>Market Value</TableSortLabel>
                            </TableCell>
                            <TableCell rowSpan={2} align="right" sx={{ whiteSpace: 'nowrap', background: '#f6f7ff', fontWeight: 700, fontSize: '0.72rem', width: { xs: 70, sm: 100 } }}>
                                <TableSortLabel active={orderBy === 'profit'} direction={orderBy === 'profit' ? order : 'asc'} onClick={() => handleSort('profit')}>
                                    {sortedRows.length > 0 && sortedRows[0].latestDate ? `Profit(${formatDateLabel(sortedRows[0].latestDate)})` : 'Profit'}
                                </TableSortLabel>
                            </TableCell>
                            <TableCell rowSpan={2} align="right" sx={{ whiteSpace: 'nowrap', background: '#f6f7ff', fontWeight: 700, fontSize: '0.72rem', width: { xs: 70, sm: 100 } }}>
                                <TableSortLabel active={orderBy === 'change'} direction={orderBy === 'change' ? order : 'asc'} onClick={() => handleSort('change')}>Change</TableSortLabel>
                            </TableCell>
                            <TableCell colSpan={3} align="center" sx={{ background: 'linear-gradient(90deg,#e9e7ff,#f7f7ff)', fontWeight: 800 }}>Historical Profit</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell align="right" sx={{ whiteSpace: 'nowrap', fontSize: '0.68rem', color: '#444' }}>{sortedRows.length > 0 && sortedRows[0].hist[0] && sortedRows[0].hist[0].date ? formatDateLabel(sortedRows[0].hist[0].date) : '-'}</TableCell>
                            <TableCell align="right" sx={{ whiteSpace: 'nowrap', fontSize: '0.68rem', color: '#444' }}>{sortedRows.length > 0 && sortedRows[0].hist[1] && sortedRows[0].hist[1].date ? formatDateLabel(sortedRows[0].hist[1].date) : '-'}</TableCell>
                            <TableCell align="right" sx={{ whiteSpace: 'nowrap', fontSize: '0.68rem', color: '#444' }}>{sortedRows.length > 0 && sortedRows[0].hist[2] && sortedRows[0].hist[2].date ? formatDateLabel(sortedRows[0].hist[2].date) : '-'}</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {sortedRows.map((r, idx) => (
                            <TableRow key={r.scheme_code} hover sx={{ background: idx % 2 === 0 ? '#fbfbff' : 'transparent', transition: 'background 0.18s', '&:hover': { background: '#eef2ff' } }}>
                                <TableCell sx={{ py: 0.5 }}>{r.scheme_name}</TableCell>
                                <TableCell align="right" sx={{ whiteSpace: 'nowrap', py: 0.5 }}>{formatNumber(r.principal)}</TableCell>
                                <TableCell align="right" sx={{ whiteSpace: 'nowrap', py: 0.5 }}>{formatUnit(r.unit)}</TableCell>
                                <TableCell align="right" sx={{ whiteSpace: 'nowrap', py: 0.5 }}>{r.marketValue !== null ? formatNumber(r.marketValue) : '-'}</TableCell>
                                <TableCell align="right" sx={{ whiteSpace: 'nowrap', py: 0.5, color: profitColor(r.profit) }}>{r.profit !== null ? formatProfitWhole(r.profit) : '-'}</TableCell>
                                <TableCell align="right" sx={{ whiteSpace: 'nowrap', py: 0.5, color: profitColor(r.change) }}>
                                    {r.change !== null ? (
                                        <Tooltip title={r.change !== null ? `Change (raw): ${Number(r.change).toFixed(2)}` : ''}>
                                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                                                {r.change > 0 ? <ArrowUpwardIcon fontSize="small" sx={{ color: 'success.main' }} /> : r.change < 0 ? <ArrowDownwardIcon fontSize="small" sx={{ color: 'error.main' }} /> : null}
                                                <span>{showPercent && r.hist[0] && r.hist[0].marketValue ? formatPercent((r.change / r.hist[0].marketValue) * 100) : formatProfitWhole(r.change)}</span>
                                            </span>
                                        </Tooltip>
                                    ) : '-'}
                                </TableCell>
                                <TableCell align="right" sx={{ whiteSpace: 'nowrap', py: 0.5, color: profitColor(r.hist[0] && r.hist[0].profit) }}>{r.hist[0] && r.hist[0].profit !== null ? formatProfitWhole(r.hist[0].profit) : '-'}</TableCell>
                                <TableCell align="right" sx={{ whiteSpace: 'nowrap', py: 0.5, color: profitColor(r.hist[1] && r.hist[1].profit) }}>{r.hist[1] && r.hist[1].profit !== null ? formatProfitWhole(r.hist[1].profit) : '-'}</TableCell>
                                <TableCell align="right" sx={{ whiteSpace: 'nowrap', py: 0.5, color: profitColor(r.hist[2] && r.hist[2].profit) }}>{r.hist[2] && r.hist[2].profit !== null ? formatProfitWhole(r.hist[2].profit) : '-'}</TableCell>
                            </TableRow>
                        ))}
                        {/* Totals row */}
                        <TableRow sx={{ fontWeight: 'bold', background: 'linear-gradient(90deg,#f4f7ff,#eef3ff)', borderTop: '2px solid #e1e7ff' }}>
                            <TableCell><strong>Total</strong></TableCell>
                            <TableCell align="right"><strong>{formatNumber(totals.principal)}</strong></TableCell>
                            <TableCell align="right">-</TableCell>
                            <TableCell align="right"><strong>{formatNumber(totals.marketValue)}</strong></TableCell>
                            <TableCell align="right" sx={{ color: profitColor(totals.profit) }}><strong>{formatProfitWhole(totals.profit)}</strong></TableCell>
                            <TableCell align="right" sx={{ color: profitColor(totals.change) }}>
                                <strong>
                                    {showPercent && totals.prevMarket ? formatPercent((totals.change / totals.prevMarket) * 100) : formatProfitWhole(totals.change)}
                                </strong>
                            </TableCell>
                            <TableCell align="right" sx={{ color: profitColor(totals.hist0) }}><strong>{formatProfitWhole(totals.hist0)}</strong></TableCell>
                            <TableCell align="right" sx={{ color: profitColor(totals.hist1) }}><strong>{formatProfitWhole(totals.hist1)}</strong></TableCell>
                            <TableCell align="right" sx={{ color: profitColor(totals.hist2) }}><strong>{formatProfitWhole(totals.hist2)}</strong></TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
}
