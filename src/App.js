import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Typography from '@mui/material/Typography';
import { DataGrid } from '@mui/x-data-grid';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import DepositForm from './DepositForm';
import { fetchDeposits, deleteDeposit } from './slices/depositsSlice';
import Dialog from '@mui/material/Dialog';
import IconButton from '@mui/material/IconButton';
import EditIcon from '@mui/icons-material/Edit';
import Switch from '@mui/material/Switch';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import Slide from '@mui/material/Slide';
import Snackbar from '@mui/material/Snackbar';
import './index.css';

function App({ themeMode, setThemeMode }) {
    const dispatch = useDispatch();
    useEffect(() => {
        dispatch(fetchDeposits());
    }, [dispatch]);
    const { items, status, error } = useSelector(state => state.deposits);
    const [editDeposit, setEditDeposit] = useState(null);
    const [addOpen, setAddOpen] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    // Handler functions
    const handleEditOpen = (deposit) => setEditDeposit(deposit);
    const handleEditClose = () => setEditDeposit(null);
    const handleAddOpen = () => setAddOpen(true);
    const handleAddClose = () => setAddOpen(false);
    const handleRefresh = () => dispatch(fetchDeposits());
    const handleDelete = (row) => setDeleteTarget(row);
    const handleDeleteConfirm = () => {
        if (deleteTarget) {
            dispatch(deleteDeposit(deleteTarget._id));
            setDeleteTarget(null);
            setSnackbar({ open: true, message: 'Deposit deleted successfully!', severity: 'success' });
        }
    };
    const handleDeleteCancel = () => setDeleteTarget(null);

    // DataGrid columns
    const columns = [
        { field: 'srNo', headerName: 'Sr No', flex: 0.7, minWidth: 80, sortable: true, align: 'right', headerAlign: 'right', cellClassName: 'right-align' },
        { field: 'bank', headerName: 'Bank', flex: 1, minWidth: 100, sortable: true, filterable: true },
        { field: 'branch', headerName: 'Branch', flex: 1, minWidth: 100, sortable: true, filterable: true },
        { field: 'person', headerName: 'Person', flex: 1, minWidth: 100, sortable: true, filterable: true },
        { field: 'accountNo', headerName: 'Account No', flex: 1.2, minWidth: 120, sortable: true, filterable: true },
        { field: 'term', headerName: 'Term', flex: 0.7, minWidth: 80, sortable: true, align: 'center', headerAlign: 'center', renderCell: (params) => params.row.term || '' },
        { field: 'interest', headerName: 'Interest', flex: 0.7, minWidth: 80, type: 'number', align: 'right', headerAlign: 'right', cellClassName: 'right-align', renderCell: (params) => params.row.interest !== undefined ? `${(params.row.interest * 100).toFixed(2)}%` : '' },
        { field: 'principal', headerName: 'Principal', flex: 1, minWidth: 100, type: 'number', align: 'right', headerAlign: 'right', cellClassName: 'right-align' },
        { field: 'beforeTds', headerName: 'Before TDS', flex: 1, minWidth: 110, type: 'number', align: 'right', headerAlign: 'right', cellClassName: 'right-align' },
        { field: 'valueDate', headerName: 'Value Date', flex: 1, minWidth: 110, sortable: true, align: 'center', headerAlign: 'center', renderCell: (params) => params.row.valueDate ? new Date(params.row.valueDate).toLocaleDateString('en-US') : '' },
        { field: 'maturityDate', headerName: 'Maturity Date', flex: 1, minWidth: 110, sortable: true, align: 'center', headerAlign: 'center', renderCell: (params) => params.row.maturityDate ? new Date(params.row.maturityDate).toLocaleDateString('en-US') : '' },
        { field: 'status', headerName: 'Status', flex: 0.7, minWidth: 80, sortable: true },
        {
            field: 'actions',
            headerName: 'Actions',
            flex: 0.8,
            minWidth: 120,
            sortable: false,
            filterable: false,
            align: 'center',
            headerAlign: 'center',
            renderCell: (params) => (
                <Stack direction="row" spacing={1}>
                    <IconButton onClick={() => handleEditOpen(params.row)} size="small" color="primary">
                        <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(params.row)} size="small" color="error">
                        <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>&#128465;</span>
                    </IconButton>
                </Stack>
            ),
        },
    ];

    // DataGrid rows
    const rows = items.map((deposit) => ({
        ...deposit,
        id: deposit._id,
    }));

    return (
        <div style={{ minHeight: '100vh', background: themeMode === 'dark' ? '#18181b' : '#f6fafd' }}>
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, mb: 2, mt: 2, px: { xs: 1, sm: 2 } }}>
                <Typography variant="h5" fontWeight={700} sx={{ color: '#635bff', fontSize: { xs: '1.3rem', sm: '2rem' } }}>Deposit Tracker</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: { xs: 2, sm: 0 } }}>
                    <Switch
                        checked={themeMode === 'dark'}
                        onChange={e => setThemeMode(e.target.checked ? 'dark' : 'light')}
                        inputProps={{ 'aria-label': 'toggle dark mode' }}
                        sx={{ mr: 1 }}
                    />
                    <span style={{ color: '#635bff', fontWeight: 500, fontSize: '1rem' }}>Dark Mode</span>
                    <button onClick={handleAddOpen} style={{ padding: '8px 16px', background: '#635bff', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 600, fontSize: '1rem', cursor: 'pointer', boxShadow: '0 2px 8px #635bff22', marginLeft: 8 }}>
                        + Add
                    </button>
                </Box>
            </Box>
            <Box sx={{ height: { xs: 420, sm: 600 }, width: '100vw', maxWidth: '100%', mx: 'auto', px: { xs: 0, sm: 2 }, background: '#fff', borderRadius: { xs: 0, sm: 2 }, boxShadow: { xs: 0, sm: 2 }, mt: 1, overflow: 'auto' }}>
                <DataGrid
                    rows={rows}
                    columns={columns}
                    pageSize={10}
                    rowsPerPageOptions={[10, 25, 50]}
                    disableSelectionOnClick
                    autoHeight={false}
                    sx={{
                        fontSize: { xs: '0.85rem', sm: '0.90rem' },
                        '& .MuiDataGrid-row': {
                            cursor: 'pointer',
                            minHeight: { xs: '24px', sm: '28px' },
                            maxHeight: { xs: '24px', sm: '28px' },
                            transition: 'background 0.3s, box-shadow 0.3s',
                        },
                        '& .MuiDataGrid-cell': {
                            padding: { xs: '2px 2px', sm: '2px 6px' },
                            fontSize: { xs: '0.85rem', sm: '0.90rem' },
                            transition: 'color 0.3s',
                        },
                        '& .MuiDataGrid-columnHeaders': {
                            background: '#f6fafd',
                            fontWeight: 700,
                            minHeight: { xs: '28px', sm: '32px' },
                            maxHeight: { xs: '28px', sm: '32px' },
                        },
                        '& .MuiDataGrid-row:hover': {
                            background: '#e3e8ff',
                            boxShadow: '0 2px 8px #635bff22',
                        },
                        '& .editing-row': {
                            background: '#ffe3e3 !important',
                            boxShadow: '0 0 0 2px #ff6b6b',
                        },
                        '& .MuiDataGrid-cell[data-field="srNo"]': {
                            textAlign: 'right',
                        },
                        '& .MuiDataGrid-cell[data-field="principal"]': {
                            textAlign: 'right',
                        },
                        '& .MuiDataGrid-cell[data-field="interest"]': {
                            textAlign: 'right',
                        },
                        '& .MuiDataGrid-cell[data-field="beforeTds"]': {
                            textAlign: 'right',
                        },
                    }}
                    onRowDoubleClick={(params) => handleEditOpen(params.row)}
                    getRowClassName={(params) => editDeposit && params.row._id === editDeposit._id ? 'editing-row' : ''}
                />
            </Box>

            {/* Edit Deposit Dialog */}
            <Dialog
                open={!!editDeposit}
                onClose={handleEditClose}
                maxWidth="md"
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: 4,
                        boxShadow: '0 12px 48px rgba(99,91,255,0.18)',
                        background: '#fff',
                        border: '1px solid #e3e8ff',
                        maxWidth: 540,
                        margin: '0 auto',
                        overflow: 'hidden',
                        zIndex: 1400
                    }
                }}
            >
                <Box className="edit-dialog-content" sx={{ p: 5, display: 'flex', flexDirection: 'column', alignItems: 'stretch', minWidth: 380, maxHeight: '80vh', overflowY: 'auto', position: 'relative', zIndex: 100 }}>
                    <Box className="edit-dialog-header" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3, background: 'rgba(99,91,255,0.07)', borderRadius: 2, px: 2, py: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <img src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png" alt="Edit" style={{ width: 32, height: 32, borderRadius: '50%', boxShadow: '0 2px 8px rgba(99,91,255,0.12)' }} />
                            <Typography variant="h5" fontWeight={700} sx={{ color: '#635bff', textShadow: '0 1px 4px #e3e8ff' }}>Edit Deposit</Typography>
                        </Box>
                        <IconButton onClick={handleEditClose} className="edit-dialog-close" size="large" sx={{ fontSize: '2.2rem', color: '#635bff', ml: 1, background: '#e3e8ff', borderRadius: 2, boxShadow: '0 1px 4px #635bff22' }}>
                            &times;
                        </IconButton>
                    </Box>
                    <Box className="edit-dialog-form" sx={{ display: 'flex', flexDirection: 'column', gap: 3, background: 'rgba(0,191,174,0.04)', borderRadius: 2, p: 2, boxShadow: '0 1px 8px #00bfae11' }}>
                        {editDeposit && <DepositForm deposit={editDeposit} onSuccess={() => { handleEditClose(); handleRefresh(); }} />}
                    </Box>
                </Box>
            </Dialog>

            {/* Add Deposit Dialog */}
            <Dialog
                open={addOpen}
                onClose={handleAddClose}
                maxWidth="md"
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: 4,
                        boxShadow: '0 12px 48px rgba(99,91,255,0.18)',
                        background: '#fff',
                        border: '1px solid #e3e8ff',
                        maxWidth: 540,
                        margin: '0 auto',
                        overflow: 'hidden',
                        zIndex: 1400
                    }
                }}
            >
                <Box className="add-dialog-content" sx={{ p: 5, display: 'flex', flexDirection: 'column', alignItems: 'stretch', minWidth: 380, maxHeight: '80vh', overflowY: 'auto', position: 'relative', zIndex: 100 }}>
                    <Box className="add-dialog-header" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3, background: 'rgba(99,91,255,0.07)', borderRadius: 2, px: 2, py: 1 }}>
                        <Typography variant="h5" fontWeight={700} sx={{ color: '#635bff', textShadow: '0 1px 4px #e3e8ff' }}>Add Deposit</Typography>
                        <IconButton onClick={handleAddClose} className="add-dialog-close" size="large" sx={{ fontSize: '2.2rem', color: '#635bff', ml: 1, background: '#e3e8ff', borderRadius: 2, boxShadow: '0 1px 4px #635bff22' }}>
                            &times;
                        </IconButton>
                    </Box>
                    <Box className="add-dialog-form" sx={{ display: 'flex', flexDirection: 'column', gap: 3, background: 'rgba(0,191,174,0.04)', borderRadius: 2, p: 2, boxShadow: '0 1px 8px #00bfae11' }}>
                        <DepositForm onSuccess={() => { handleAddClose(); handleRefresh(); }} />
                    </Box>
                </Box>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={!!deleteTarget} onClose={handleDeleteCancel} TransitionComponent={Slide} TransitionProps={{ direction: 'up' }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 3, minWidth: 340 }}>
                    <WarningAmberIcon color="warning" sx={{ fontSize: 48, mb: 1 }} />
                    <DialogTitle sx={{ textAlign: 'center', fontWeight: 700, color: '#d97706', mb: 1 }}>Delete Deposit?</DialogTitle>
                    <Typography sx={{ mb: 2, color: '#555', textAlign: 'center' }}>
                        Are you sure you want to delete this deposit? This action cannot be undone.
                    </Typography>
                    <DialogActions sx={{ justifyContent: 'center', gap: 2 }}>
                        <Button onClick={handleDeleteCancel} color="primary" variant="outlined">Cancel</Button>
                        <Button onClick={handleDeleteConfirm} color="error" variant="contained">Delete</Button>
                    </DialogActions>
                </Box>
            </Dialog>
            <Snackbar
                open={snackbar.open}
                autoHideDuration={2500}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                TransitionComponent={Slide}
                message={snackbar.message}
                ContentProps={{ sx: { fontWeight: 600, color: snackbar.severity === 'success' ? '#388e3c' : '#d32f2f', background: '#fff', border: '1px solid #e3e8ff', boxShadow: 2 } }}
            />

            {/* Simple Footer */}
            <footer style={{ textAlign: 'center', margin: '48px 0 16px 0', color: '#888', fontSize: '1rem' }}>
                &copy; {new Date().getFullYear()} Deposit Tracker. Inspired by Stripe.
            </footer>
        </div>
    );
}

export default App;
