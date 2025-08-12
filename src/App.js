import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Typography from '@mui/material/Typography';
import { DataGrid } from '@mui/x-data-grid';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import DepositForm from './DepositForm';
import { fetchDeposits, deleteDeposit } from './slices/depositsSlice';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import IconButton from '@mui/material/IconButton';
import EditIcon from '@mui/icons-material/Edit';
import Switch from '@mui/material/Switch';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import Slide from '@mui/material/Slide';
import Snackbar from '@mui/material/Snackbar';
import './index.css';

function App() {
    const dispatch = useDispatch();
    const [darkMode, setDarkMode] = useState(false);
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
    const handleEditSubmit = (values) => {
        // dispatch updateDeposit here if needed
        setEditDeposit(null);
        setSnackbar({ open: true, message: 'Deposit updated', severity: 'success' });
    };

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
        <div style={{ minHeight: '100vh', background: darkMode ? '#18181b' : '#f6fafd' }}>
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, mb: 2, mt: 2, px: { xs: 1, sm: 2 } }}>
                <Typography variant="h5" fontWeight={700} sx={{ color: '#635bff', fontSize: { xs: '1.3rem', sm: '2rem' } }}>Deposit Tracker</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: { xs: 2, sm: 0 } }}>
                    <Switch
                        checked={darkMode}
                        onChange={e => setDarkMode(e.target.checked)}
                        inputProps={{ 'aria-label': 'toggle dark mode' }}
                        sx={{ mr: 1 }}
                    />
                    <span style={{ color: '#635bff', fontWeight: 500, fontSize: '1rem' }}>Dark Mode</span>
                    <button onClick={handleAddOpen} style={{ padding: '8px 16px', background: '#635bff', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 600, fontSize: '1rem', cursor: 'pointer', boxShadow: '0 2px 8px #635bff22', marginLeft: 8 }}>
                        + Add
                    </button>
                </Box>
            </Box>
            <Box sx={{ height: { xs: 420, sm: 600 }, width: '100vw', maxWidth: '100%', mx: 'auto', px: { xs: 0, sm: 2 }, background: darkMode ? '#23232b' : '#fff', borderRadius: { xs: 0, sm: 2 }, boxShadow: { xs: 0, sm: 2 }, mt: 1, overflow: 'auto' }}>
                <DataGrid
                    rows={rows}
                    columns={columns}
                    pageSize={10}
                    rowsPerPageOptions={[10, 25, 50]}
                    disableSelectionOnClick
                    autoHeight={false}
                    sx={{
                        fontSize: { xs: '0.85rem', sm: '0.90rem' },
                        background: darkMode ? '#23232b' : '#fff',
                        color: darkMode ? '#f3f6fb' : '#222',
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
                            background: darkMode ? '#18181b' : '#f6fafd',
                            fontWeight: 700,
                            minHeight: { xs: '28px', sm: '32px' },
                            maxHeight: { xs: '28px', sm: '32px' },
                        },
                        '& .MuiDataGrid-row:hover': {
                            background: darkMode ? '#282a36' : '#e3e8ff',
                            boxShadow: darkMode ? '0 2px 8px #282a3622' : '0 2px 8px #635bff22',
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

            {/* Add Dialog */}
            <Dialog
                open={addOpen}
                onClose={handleAddClose}
                maxWidth="xs"
                fullWidth
                aria-modal="true"
                aria-labelledby="add-deposit-title"
                aria-describedby="add-deposit-desc"
                PaperProps={{
                    sx: {
                        borderRadius: 3,
                        background: darkMode ? 'linear-gradient(135deg, #18181b 60%, #23234a 100%)' : '#fff',
                        color: darkMode ? '#f3f6fb' : '#222',
                        boxShadow: darkMode ? '0 8px 32px #000b' : '0 2px 8px #635bff22',
                        border: darkMode ? '2px solid #635bff' : '1px solid #e0e0e0',
                        p: { xs: 1, sm: 2 },
                    },
                    role: 'dialog',
                    'aria-label': 'Add Deposit Dialog',
                }}
            >
                <DialogTitle
                    id="add-deposit-title"
                    sx={{
                        background: darkMode ? 'linear-gradient(90deg, #23232b 60%, #635bff 100%)' : '#f6fafd',
                        color: darkMode ? '#aab4ff' : '#222',
                        fontWeight: 700,
                        fontSize: { xs: '1.1rem', sm: '1.3rem' },
                        borderBottom: darkMode ? '1px solid #635bff' : '1px solid #e0e0e0',
                        letterSpacing: 0.5,
                        borderTopLeftRadius: 12,
                        borderTopRightRadius: 12,
                    }}
                >
                    Add Deposit
                </DialogTitle>
                <DialogContent
                    id="add-deposit-desc"
                    sx={{
                        background: 'transparent',
                        color: darkMode ? '#f3f6fb' : '#222',
                        pb: 2,
                    }}
                >
                    <DepositForm
                        srNo={rows.length + 1}
                        onSuccess={handleAddClose}
                        darkMode={darkMode}
                        autoFocus
                    />
                </DialogContent>
            </Dialog>
            {/* Edit Dialog */}
            <Dialog
                open={!!editDeposit}
                onClose={handleEditClose}
                maxWidth="xs"
                fullWidth
                aria-modal="true"
                aria-labelledby="edit-deposit-title"
                aria-describedby="edit-deposit-desc"
                PaperProps={{
                    sx: {
                        borderRadius: 3,
                        background: darkMode ? 'linear-gradient(135deg, #18181b 60%, #23234a 100%)' : '#fff',
                        color: darkMode ? '#f3f6fb' : '#222',
                        boxShadow: darkMode ? '0 8px 32px #000b' : '0 2px 8px #635bff22',
                        border: darkMode ? '2px solid #635bff' : '1px solid #e0e0e0',
                        p: { xs: 1, sm: 2 },
                    },
                    role: 'dialog',
                    'aria-label': 'Edit Deposit Dialog',
                }}
            >
                <DialogTitle
                    id="edit-deposit-title"
                    sx={{
                        background: darkMode ? 'linear-gradient(90deg, #23232b 60%, #635bff 100%)' : '#f6fafd',
                        color: darkMode ? '#aab4ff' : '#222',
                        fontWeight: 700,
                        fontSize: { xs: '1.1rem', sm: '1.3rem' },
                        borderBottom: darkMode ? '1px solid #635bff' : '1px solid #e0e0e0',
                        letterSpacing: 0.5,
                        borderTopLeftRadius: 12,
                        borderTopRightRadius: 12,
                    }}
                >
                    Edit Deposit
                </DialogTitle>
                <DialogContent
                    id="edit-deposit-desc"
                    sx={{
                        background: 'transparent',
                        color: darkMode ? '#f3f6fb' : '#222',
                        pb: 2,
                    }}
                >
                    <DepositForm
                        deposit={editDeposit}
                        onSubmit={handleEditSubmit}
                        onSuccess={handleEditClose}
                        isEdit={true}
                        darkMode={darkMode}
                        autoFocus
                    />
                </DialogContent>
            </Dialog>
            {/* Delete Confirmation Dialog */}
            <Dialog
                open={!!deleteTarget}
                onClose={handleDeleteCancel}
                maxWidth="xs"
                fullWidth
                aria-modal="true"
                aria-labelledby="delete-confirm-title"
                aria-describedby="delete-confirm-desc"
                PaperProps={{
                    sx: {
                        borderRadius: 3,
                        background: darkMode ? 'linear-gradient(135deg, #18181b 60%, #23234a 100%)' : '#fff',
                        color: darkMode ? '#f3f6fb' : '#222',
                        boxShadow: darkMode ? '0 8px 32px #000b' : '0 2px 8px #635bff22',
                        border: darkMode ? '2px solid #ff6b6b' : '1px solid #e0e0e0',
                        p: { xs: 1, sm: 2 },
                    },
                    role: 'dialog',
                    'aria-label': 'Delete Confirmation Dialog',
                }}
            >
                <DialogTitle
                    id="delete-confirm-title"
                    sx={{
                        background: darkMode ? 'linear-gradient(90deg, #23232b 60%, #ff6b6b 100%)' : '#f6fafd',
                        color: darkMode ? '#ffb4b4' : '#b71c1c',
                        fontWeight: 700,
                        fontSize: { xs: '1.1rem', sm: '1.3rem' },
                        borderBottom: darkMode ? '1px solid #ff6b6b' : '1px solid #e0e0e0',
                        letterSpacing: 0.5,
                        borderTopLeftRadius: 12,
                        borderTopRightRadius: 12,
                    }}
                >
                    Confirm Delete
                </DialogTitle>
                <DialogContent
                    id="delete-confirm-desc"
                    sx={{
                        background: 'transparent',
                        color: darkMode ? '#f3f6fb' : '#222',
                        pb: 2,
                        textAlign: 'center',
                    }}
                >
                    <WarningAmberIcon sx={{ fontSize: 48, color: darkMode ? '#ff6b6b' : '#b71c1c', mb: 2 }} />
                    <Typography variant="body1" sx={{ mb: 2 }}>
                        Are you sure you want to delete this deposit?
                    </Typography>
                    <Stack direction="row" spacing={2} justifyContent="center">
                        <Button onClick={handleDeleteCancel} variant="outlined" color="inherit" sx={{ minWidth: 100, borderColor: darkMode ? '#aab4ff' : undefined, color: darkMode ? '#aab4ff' : undefined }}>Cancel</Button>
                        <Button onClick={handleDeleteConfirm} variant="contained" color="error" sx={{ minWidth: 100 }}>Delete</Button>
                    </Stack>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Snackbar */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                message={snackbar.message}
                action={
                    <Button color="inherit" onClick={() => setSnackbar({ ...snackbar, open: false })}>
                        Close
                    </Button>
                }
                sx={{
                    '& .MuiSnackbarContent-root': {
                        backgroundColor: snackbar.severity === 'success' ? '#4caf50' : '#f44336',
                        color: '#fff',
                        borderRadius: 2,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                        fontSize: { xs: '0.9rem', sm: '1rem' },
                        py: 1.5,
                        px: 2,
                    }
                }}
            />
        </div>
    );
}

export default App;
