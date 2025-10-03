import React, { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import TextField from '@mui/material/TextField';
import HoldingForm from './HoldingForm';
import LoadingButton from './LoadingButton';
import FeedbackSnackbar from './FeedbackSnackbar';
import { useNavigate } from 'react-router-dom';
import { fetchSchemeDataUsingAdapter, availableAdapters } from '../adapters/mfAdapters';
import { toTitleCase } from '../utils/formatters';

export default function HoldingsPage() {
    const [holdings, setHoldings] = useState([]);
    const [editing, setEditing] = useState(null);
    const [schemesMap, setSchemesMap] = useState({});
    const navigate = useNavigate();

    // Runtime-safe fallbacks: if LoadingButton or FeedbackSnackbar failed to import
    // (which can cause React to throw "Element type is invalid"), provide simple
    // stand-ins and log a warning. This keeps the page renderable while we debug.
    const SafeLoadingButton = (typeof LoadingButton === 'undefined' || LoadingButton === null) ?
        (({ children, ...p }) => <Button {...p}>{children}</Button>) : LoadingButton;
    const SafeFeedbackSnackbar = (typeof FeedbackSnackbar === 'undefined' || FeedbackSnackbar === null) ?
        (({ open, message }) => open ? <div style={{ position: 'fixed', bottom: 8, left: '50%', transform: 'translateX(-50%)', background: '#333', color: '#fff', padding: '8px 12px', borderRadius: 6 }}>{message}</div> : null) : FeedbackSnackbar;

    const load = async () => {
        try {
            const res = await fetch((process.env.REACT_APP_BACKEND_URL || '') + '/user/holdings', { credentials: 'include' });
            if (res.ok) {
                const json = await res.json();
                setHoldings(json.holdings || []);
            }
        } catch (e) {
            // ignore
        }
    };

    const [loading, setLoading] = useState(false);
    const [snack, setSnack] = useState(null);

    // Load scheme metadata to show scheme names. Prefer adapter (hybrid/mfapi) to fetch canonical meta (which may use RapidAPI)
    const loadSchemes = async (codes) => {
        try {
            const backend = process.env.REACT_APP_BACKEND_URL || '';
            // first try adapter-based fetch for each unique code
            const adapterKey = (availableAdapters.includes('hybrid') ? 'hybrid' : (availableAdapters.includes('mfapi') ? 'mfapi' : availableAdapters[0]));
            const uniqueCodes = Array.from(new Set(codes.map(c => Number(c)))).filter(Number.isFinite);
            const map = {};
            // Try fetching via adapter for each code (parallel)
            const promises = uniqueCodes.map(async (code) => {
                try {
                    const payload = await fetchSchemeDataUsingAdapter(adapterKey, { scheme_code: code });
                    const name = payload && payload.meta && payload.meta.scheme_name ? payload.meta.scheme_name : null;
                    if (name) map[code] = name;
                } catch (e) {
                    // ignore per-code failures
                }
            });
            await Promise.all(promises);

            // For any codes missing a name, we intentionally do not call the backend /schemes endpoint.
            // Instead, the UI will fall back to a simple label `Code <scheme_code>` when adapter metadata is not available.
            setSchemesMap(map);
        } catch (e) {
            // ignore
        }
    };

    useEffect(() => { load(); }, []);
    useEffect(() => { if (holdings && holdings.length) loadSchemes(holdings.map(h => h.scheme_code)); }, [holdings]);

    const onSaved = (newList) => { setHoldings(newList || []); };

    const remove = async (code) => {
        setLoading(true);
        try {
            const res = await fetch((process.env.REACT_APP_BACKEND_URL || '') + '/user/holdings/' + code, { method: 'DELETE', credentials: 'include' });
            if (res.ok) {
                const json = await res.json();
                setHoldings(json.holdings || []);
                setSnack({ severity: 'success', message: 'Holding removed' });
            } else {
                setSnack({ severity: 'error', message: 'Failed to remove holding' });
            }
        } catch (e) {
            setSnack({ severity: 'error', message: `Failed to remove: ${e.message}` });
        } finally {
            setLoading(false);
        }
    };

    const startEdit = (h) => {
        // Initialize editable fields as strings so TextField (controlled) shows values
        setEditing({ ...h, principal: h.principal !== undefined && h.principal !== null ? String(h.principal) : '', unit: h.unit !== undefined && h.unit !== null ? String(h.unit) : '' });
    };

    const saveEdit = async () => {
        if (!editing) return;
        setLoading(true);
        try {
            // parse numeric values from editing strings
            const principalNum = editing.principal === '' ? 0 : Number.parseFloat(String(editing.principal).replace(/[,₹\s]/g, '')) || 0;
            const unitNum = editing.unit === '' ? 0 : Number.parseFloat(String(editing.unit).replace(/[,\s]/g, '')) || 0;
            const res = await fetch((process.env.REACT_APP_BACKEND_URL || '') + '/user/holdings/' + editing.scheme_code, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ principal: principalNum, unit: unitNum }) });
            if (res.ok) {
                const json = await res.json();
                setHoldings(json.holdings || []);
                setEditing(null);
                setSnack({ severity: 'success', message: 'Holding updated' });
            } else {
                setSnack({ severity: 'error', message: 'Update failed' });
            }
        } catch (e) {
            setSnack({ severity: 'error', message: `Update failed: ${e.message}` });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ p: 2 }}>
            <Button size="small" onClick={() => navigate('/')} sx={{ mb: 1 }}>Back</Button>
            <HoldingForm onSaved={onSaved} editing={editing} onCancel={() => setEditing(null)} />
            <List>
                {holdings.map((h, idx) => (
                    <React.Fragment key={h.scheme_code}>
                        <ListItem alignItems="flex-start" secondaryAction={
                            <Box>
                                <IconButton edge="end" aria-label="edit" onClick={() => startEdit(h)}><EditIcon /></IconButton>
                                <IconButton edge="end" aria-label="delete" onClick={() => remove(h.scheme_code)} disabled={loading}><DeleteIcon /></IconButton>
                            </Box>
                        }>
                            {/* avatar removed for compact listing */}
                            <ListItemText
                                primary={<strong>{toTitleCase(schemesMap[h.scheme_code] || `Code ${h.scheme_code}`)}</strong>}
                                secondary={<Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mt: 0.5 }}>
                                    <Box sx={{ display: 'block' }}>
                                        <Box component="span" sx={{ typography: 'caption', color: 'text.secondary' }}>Code {h.scheme_code}</Box>
                                    </Box>
                                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                                        <Box>Units: <strong>{Number(h.unit).toLocaleString(undefined, { maximumFractionDigits: 3 })}</strong></Box>
                                        <Box>Principal: <strong>₹{Number(h.principal).toLocaleString()}</strong></Box>
                                    </Box>
                                </Box>}
                            />
                        </ListItem>
                        {idx < holdings.length - 1 && <Divider component="li" />}
                    </React.Fragment>
                ))}
            </List>

            {/* Editing is handled by the top form; we no longer render duplicated edit inputs here */}
            <SafeFeedbackSnackbar open={!!snack} severity={String((snack && snack.severity) || 'info')} message={snack && snack.message} onClose={() => setSnack(null)} />
        </Box>
    );
}
