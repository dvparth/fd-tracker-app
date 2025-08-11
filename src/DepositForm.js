import React, { useState } from 'react';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import { useDispatch, useSelector } from 'react-redux';
import { addDeposit, updateDeposit } from './slices/depositsSlice';
import { TextField, Button, Stack, Paper, Autocomplete } from '@mui/material';

const initialState = {
    bank: '',
    person: '',
    principal: '',
    interest: '',
    beforeTds: '',
    valueDate: '',
    maturityDate: '',
    accountNo: '',
    srNo: '',
};

function DepositForm({ deposit, srNo, onSuccess }) {
    const { items } = useSelector(state => state.deposits);
    // Extract unique values for dropdowns
    const bankOptions = Array.from(new Set(items.map(d => d.bank).filter(Boolean)));
    const personOptions = Array.from(new Set(items.map(d => d.person).filter(Boolean)));
    const branchOptions = Array.from(new Set(items.map(d => d.branch).filter(Boolean)));

    const [form, setForm] = useState(deposit ? {
        bank: deposit.bank || '',
        person: deposit.person || '',
        branch: deposit.branch || '',
        principal: deposit.principal || '',
        interest: deposit.interest || '',
        beforeTds: deposit.beforeTds || '',
        valueDate: deposit.valueDate ? deposit.valueDate.slice(0, 10) : '',
        maturityDate: deposit.maturityDate ? deposit.maturityDate.slice(0, 10) : '',
        accountNo: deposit.accountNo || '',
        srNo: deposit.srNo || srNo || '',
    } : { ...initialState, srNo: srNo || '' });
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const dispatch = useDispatch();
    const isEdit = !!deposit;

    const handleChange = e => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleAutoChange = (name, value) => {
        setForm({ ...form, [name]: value });
    };

    const handleSubmit = e => {
        e.preventDefault();
        // Basic validation
        if (!form.bank || !form.person || !form.principal || !form.interest || !form.beforeTds || !form.accountNo || !form.srNo) {
            setSnackbar({ open: true, message: 'Please fill all required fields', severity: 'error' });
            return;
        }
        if (isEdit) {
            dispatch(updateDeposit({ id: deposit._id, deposit: form }));
            setSnackbar({ open: true, message: 'Deposit updated successfully!', severity: 'success' });
            if (onSuccess) setTimeout(() => onSuccess(), 600); // allow snackbar to show
        } else {
            dispatch(addDeposit(form));
            setSnackbar({ open: true, message: 'Deposit added successfully!', severity: 'success' });
            setForm({ ...initialState, srNo: srNo || '' });
            if (onSuccess) setTimeout(() => onSuccess(), 600);
        }
    };

    return (
        <>
            <Paper elevation={isEdit ? 1 : 3} sx={{ p: 2, mb: 2 }}>
                <form onSubmit={handleSubmit}>
                    <Stack direction="column" spacing={2} alignItems="stretch">
                        <Autocomplete
                            freeSolo
                            options={branchOptions}
                            value={form.branch}
                            onInputChange={(e, v) => handleAutoChange('branch', v)}
                            renderInput={(params) => (
                                <TextField {...params} name="branch" label="Branch" required size="small" fullWidth />
                            )}
                        />
                        <Autocomplete
                            freeSolo
                            options={personOptions}
                            value={form.person}
                            onInputChange={(e, v) => handleAutoChange('person', v)}
                            renderInput={(params) => (
                                <TextField {...params} name="person" label="Person" required size="small" fullWidth />
                            )}
                        />
                        <Autocomplete
                            freeSolo
                            options={bankOptions}
                            value={form.bank}
                            onInputChange={(e, v) => handleAutoChange('bank', v)}
                            renderInput={(params) => (
                                <TextField {...params} name="bank" label="Bank" required size="small" fullWidth />
                            )}
                        />
                        <TextField name="principal" label="Principal" value={form.principal} onChange={handleChange} required type="number" size="small" fullWidth />
                        <TextField name="interest" label="Interest" value={form.interest} onChange={handleChange} required type="number" size="small" fullWidth />
                        <TextField name="beforeTds" label="Before TDS" value={form.beforeTds} onChange={handleChange} required type="number" size="small" fullWidth />
                        <TextField name="valueDate" label="Value Date" value={form.valueDate} onChange={handleChange} type="date" size="small" InputLabelProps={{ shrink: true }} fullWidth />
                        <TextField name="maturityDate" label="Maturity Date" value={form.maturityDate} onChange={handleChange} type="date" size="small" InputLabelProps={{ shrink: true }} fullWidth />
                        <TextField name="accountNo" label="Account No" value={form.accountNo} onChange={handleChange} required size="small" fullWidth />
                        <TextField name="srNo" label="Sr No" value={form.srNo} required size="small" fullWidth InputProps={{ readOnly: true }} />
                        <Button type="submit" variant={isEdit ? 'outlined' : 'contained'} color={isEdit ? 'primary' : 'success'} size="large" sx={{ minWidth: 120, alignSelf: 'center', mt: 2 }}>{isEdit ? 'Update' : 'Add'}</Button>
                    </Stack>
                </form>
            </Paper>
            <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar({ ...snackbar, open: false })} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
                <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </>
    );
}

export default DepositForm;
