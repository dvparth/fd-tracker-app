import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Typography from '@mui/material/Typography';
import { Routes, Route, Link } from 'react-router-dom';
import { DataGrid } from '@mui/x-data-grid';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import { fetchDeposits, deleteDeposit } from './slices/depositsSlice';
import IconButton from '@mui/material/IconButton';
import EditIcon from '@mui/icons-material/Edit';
import Switch from '@mui/material/Switch';
import Button from '@mui/material/Button';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import './index.css';
import MFTracker from './components/MFTracker';

/**
 * Main App component.
 * @returns {JSX.Element}
 */
function App() {
    const dispatch = useDispatch();
    const [darkMode, setDarkMode] = useState(false);
    // NOTE: fetchDeposits previously ran on mount and caused automatic calls to the backend.
    // This app focuses on MFTracker which uses adapters for NAV data. We no longer auto-fetch deposits on mount.
    useEffect(() => {
        // Intentionally left blank — fetchDeposits can be triggered manually via handleRefresh if needed.
    }, [dispatch]);
    const { items, status, error } = useSelector(state => state.deposits);
    const [editDeposit, setEditDeposit] = useState(null);
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
    // add dialog removed - this app uses MFTracker only

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
            <Box sx={{ px: 0, py: 0 }} />
            <Routes>
                <Route path="/" element={<MFTracker />} />
            </Routes>

            {/* snackbars removed (MFTracker handles its own feedback/UI) */}
        </div>
    );
}

export default App;
