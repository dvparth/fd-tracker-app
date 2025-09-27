import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Typography from '@mui/material/Typography';
import { Routes, Route, Link } from 'react-router-dom';
import { DataGrid } from '@mui/x-data-grid';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import DepositForm from './DepositForm';
import { fetchDeposits, deleteDeposit } from './slices/depositsSlice';
import CustomDialog from './components/CustomDialog';
import FeedbackSnackbar from './components/FeedbackSnackbar';
import IconButton from '@mui/material/IconButton';
import EditIcon from '@mui/icons-material/Edit';
import Switch from '@mui/material/Switch';
import Button from '@mui/material/Button';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import './index.css';
import MFHoldings from './components/MFHoldings';

/**
 * Main App component.
 * @returns {JSX.Element}
 */
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
    /**
     * Opens the edit dialog for a specific deposit.
     * @param {Object} deposit - The deposit data to edit.
     */
    const handleEditOpen = (deposit) => setEditDeposit(deposit);

    /**
     * Closes the edit dialog.
     */
    const handleEditClose = () => setEditDeposit(null);

    /**
     * Opens the add dialog.
     */
    const handleAddOpen = () => setAddOpen(true);

    /**
     * Closes the add dialog.
     */
    const handleAddClose = () => setAddOpen(false);

    /**
     * Refreshes the deposit list.
     */
    const handleRefresh = () => dispatch(fetchDeposits());

    /**
     * Sets the target deposit for deletion.
     * @param {Object} row - The deposit data to delete.
     */
    const handleDelete = (row) => setDeleteTarget(row);

    /**
     * Confirms the deletion of a deposit.
     */
    const handleDeleteConfirm = () => {
        if (deleteTarget) {
            dispatch(deleteDeposit(deleteTarget._id));
            setDeleteTarget(null);
            setSnackbar({ open: true, message: 'Deposit deleted successfully!', severity: 'success' });
        }
    };

    /**
     * Cancels the deletion of a deposit.
     */
    const handleDeleteCancel = () => setDeleteTarget(null);

    /**
     * Submits the edited deposit data.
     * @param {Object} values - The edited deposit data.
     */
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
            <Box sx={{ px: 2, py: 1 }}>
                <Link to="/mf-holdings" style={{ marginRight: 12, color: '#635bff', fontWeight: 600 }}>MF Holdings</Link>
            </Box>
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
            <Routes>
                <Route path="/" element={(
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
                                    border: '1px solid #e0e0e0',
                                    borderColor: darkMode ? '#444' : '#e0e0e0',
                                },
                                '& .MuiDataGrid-columnHeaders, & .MuiDataGrid-columnHeader, & .MuiDataGrid-columnHeaderTitle': {
                                    background: darkMode ? '#18181b !important' : '#f9f9ff !important',
                                    color: darkMode ? '#f3f6fb !important' : '#23234a !important',
                                    fontWeight: 800,
                                    fontSize: { xs: '1rem', sm: '1.1rem' },
                                    letterSpacing: 0.2,
                                    textShadow: 'none',
                                    minHeight: { xs: '28px', sm: '32px' },
                                    maxHeight: { xs: '28px', sm: '32px' },
                                    borderBottom: '1px solid #635bff',
                                },
                                '& .MuiDataGrid-columnHeaderTitle': {
                                    color: darkMode ? '#f3f6fb' : '#23234a',
                                    fontWeight: 800,
                                    fontSize: { xs: '1rem', sm: '1.1rem' },
                                    letterSpacing: 0.2,
                                    textShadow: 'none',
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
                )} />
                <Route path="/mf-holdings" element={<MFHoldings />} />
            </Routes>

            {/* Add Dialog */}
            <CustomDialog
                open={addOpen}
                onClose={handleAddClose}
                title="Add Deposit"
                darkMode={darkMode}
            >
                <DepositForm
                    srNo={rows.length + 1}
                    onSuccess={handleAddClose}
                    darkMode={darkMode}
                    autoFocus
                />
            </CustomDialog>
            {/* Edit Dialog */}
            <CustomDialog
                open={!!editDeposit}
                onClose={handleEditClose}
                title="Edit Deposit"
                darkMode={darkMode}
            >
                <DepositForm
                    deposit={editDeposit}
                    onSubmit={handleEditSubmit}
                    onSuccess={handleEditClose}
                    isEdit={true}
                    darkMode={darkMode}
                    autoFocus
                />
            </CustomDialog>
            {/* Delete Confirmation Dialog */}
            <CustomDialog
                open={!!deleteTarget}
                onClose={handleDeleteCancel}
                title="Confirm Delete"
                darkMode={darkMode}
            >
                <WarningAmberIcon sx={{ fontSize: 48, color: darkMode ? '#ff6b6b' : '#b71c1c', mb: 2 }} />
                <Typography variant="body1" sx={{ mb: 2 }}>
                    Are you sure you want to delete this deposit?
                </Typography>
                <Stack direction="row" spacing={2} justifyContent="center">
                    <Button onClick={handleDeleteCancel} variant="outlined" color="inherit" sx={{ minWidth: 100, borderColor: darkMode ? '#aab4ff' : undefined, color: darkMode ? '#aab4ff' : undefined }}>Cancel</Button>
                    <Button onClick={handleDeleteConfirm} variant="contained" color="error" sx={{ minWidth: 100 }}>Delete</Button>
                </Stack>
            </CustomDialog>

            {/* Delete Confirmation Snackbar */}
            <FeedbackSnackbar
                open={snackbar.open}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                message={snackbar.message}
                severity={snackbar.severity}
            />
        </div>
    );
}

export default App;
