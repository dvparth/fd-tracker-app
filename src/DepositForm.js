import React, { useState } from 'react';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import { useDispatch, useSelector } from 'react-redux';
import { addDeposit, updateDeposit } from './slices/depositsSlice';
import { Stack, Paper, Button } from '@mui/material';
import LabeledTextField from './components/LabeledTextField';
import LabeledAutocomplete from './components/LabeledAutocomplete';

const initialState = {
    bank: '',
    person: '',
    branch: '',
    principal: '',
    interest: '',
    beforeTds: '',
    valueDate: '',
    maturityDate: '',
    accountNo: '',
    srNo: '',
    term: '',
};

/**
* DepositForm component for adding or editing a deposit.
* @param {Object} props - Component props
* @param {Object} [props.deposit] - Deposit data for editing
* @param {string} props.srNo - Serial number for the deposit
* @param {Function} [props.onSuccess] - Callback function to execute on successful add/edit
*/
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
        term: deposit.term || '',
    } : { ...initialState, srNo: srNo || '' });
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const dispatch = useDispatch();
    const isEdit = !!deposit;

    /**
     * Handles form field changes.
     * @param {Object} e - Event object
     */
    const handleChange = e => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    /**
     * Handles autocomplete value changes.
     * @param {string} name - Field name
     * @param {string} value - New value
     */
    const handleAutoChange = (name, value) => {
        setForm({ ...form, [name]: value });
    };

    /**
     * Handles form submission.
     * @param {Object} e - Event object
     */
    const handleSubmit = e => {
        e.preventDefault();
        // Basic validation
        if (!form.bank || !form.person || !form.principal || !form.interest || !form.beforeTds || !form.accountNo || !form.srNo || !form.term) {
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
            <Paper elevation={isEdit ? 2 : 4} sx={{
                p: { xs: 1.5, sm: 2 }, mb: 2,
                background: '#fff',
                color: '#222',
                border: '1px solid #e0e0e0',
                boxShadow: '0 2px 8px #635bff22',
                borderRadius: 2,
            }}>
                <form onSubmit={handleSubmit}>
                    <Stack direction="column" spacing={2} alignItems="stretch">
                        <LabeledAutocomplete
                            label="Branch"
                            options={branchOptions}
                            value={form.branch}
                            onInputChange={(e, v) => handleAutoChange('branch', v)}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    background: '#fff',
                                    borderRadius: 1,
                                    border: '1px solid #bdbdbd',
                                },
                                '& .MuiOutlinedInput-notchedOutline': {
                                    borderColor: '#bdbdbd',
                                },
                            }}
                            required
                        />
                        <LabeledAutocomplete
                            label="Person"
                            options={personOptions}
                            value={form.person}
                            onInputChange={(e, v) => handleAutoChange('person', v)}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    background: '#fff',
                                    borderRadius: 1,
                                    border: '1px solid #bdbdbd',
                                },
                                '& .MuiOutlinedInput-notchedOutline': {
                                    borderColor: '#bdbdbd',
                                },
                            }}
                            required
                        />
                        <LabeledAutocomplete
                            label="Bank"
                            options={bankOptions}
                            value={form.bank}
                            onInputChange={(e, v) => handleAutoChange('bank', v)}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    background: '#fff',
                                    borderRadius: 1,
                                    border: '1px solid #bdbdbd',
                                },
                                '& .MuiOutlinedInput-notchedOutline': {
                                    borderColor: '#bdbdbd',
                                },
                            }}
                            required
                        />
                        <LabeledTextField
                            name="principal"
                            label="Principal"
                            value={form.principal}
                            onChange={handleChange}
                            type="number"
                            required
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    background: '#fff',
                                    borderRadius: 1,
                                    border: '1px solid #bdbdbd',
                                },
                                '& .MuiOutlinedInput-notchedOutline': {
                                    borderColor: '#bdbdbd',
                                },
                            }}
                        />
                        <LabeledTextField
                            name="interest"
                            label="Interest"
                            value={form.interest}
                            onChange={handleChange}
                            type="number"
                            required
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    background: '#fff',
                                    borderRadius: 1,
                                    border: '1px solid #bdbdbd',
                                },
                                '& .MuiOutlinedInput-notchedOutline': {
                                    borderColor: '#bdbdbd',
                                },
                            }}
                        />
                        <LabeledTextField
                            name="beforeTds"
                            label="Before TDS"
                            value={form.beforeTds}
                            onChange={handleChange}
                            type="number"
                            required
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    background: '#fff',
                                    borderRadius: 1,
                                    border: '1px solid #bdbdbd',
                                },
                                '& .MuiOutlinedInput-notchedOutline': {
                                    borderColor: '#bdbdbd',
                                },
                            }}
                        />
                        <LabeledTextField
                            name="valueDate"
                            label="Value Date"
                            value={form.valueDate}
                            onChange={handleChange}
                            type="date"
                            InputLabelProps={{ shrink: true }}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    background: '#fff',
                                    borderRadius: 1,
                                    border: '1px solid #bdbdbd',
                                },
                                '& .MuiOutlinedInput-notchedOutline': {
                                    borderColor: '#bdbdbd',
                                },
                            }}
                        />
                        <LabeledTextField
                            name="maturityDate"
                            label="Maturity Date"
                            value={form.maturityDate}
                            onChange={handleChange}
                            type="date"
                            InputLabelProps={{ shrink: true }}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    background: '#fff',
                                    borderRadius: 1,
                                    border: '1px solid #bdbdbd',
                                },
                                '& .MuiOutlinedInput-notchedOutline': {
                                    borderColor: '#bdbdbd',
                                },
                            }}
                        />
                        <LabeledTextField
                            name="accountNo"
                            label="Account No"
                            value={form.accountNo}
                            onChange={handleChange}
                            required
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    background: '#fff',
                                    borderRadius: 1,
                                    border: '1px solid #bdbdbd',
                                },
                                '& .MuiOutlinedInput-notchedOutline': {
                                    borderColor: '#bdbdbd',
                                },
                            }}
                        />
                        <LabeledTextField
                            name="srNo"
                            label="Sr No"
                            value={form.srNo}
                            InputProps={{ readOnly: true }}
                            required
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    background: '#fff',
                                    borderRadius: 1,
                                    border: '1px solid #bdbdbd',
                                },
                                '& .MuiOutlinedInput-notchedOutline': {
                                    borderColor: '#bdbdbd',
                                },
                            }}
                        />
                        <LabeledTextField
                            name="term"
                            label="Term"
                            value={form.term}
                            onChange={handleChange}
                            required
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    background: '#fff',
                                    borderRadius: 1,
                                    border: '1px solid #bdbdbd',
                                },
                                '& .MuiOutlinedInput-notchedOutline': {
                                    borderColor: '#bdbdbd',
                                },
                            }}
                        />
                        <Button type="submit" variant={isEdit ? 'outlined' : 'contained'} color={isEdit ? 'primary' : 'success'} size="large" sx={{ minWidth: 120, alignSelf: 'center', mt: 2, background: '#635bff', color: '#fff', fontWeight: 700, letterSpacing: 0.5 }}>{isEdit ? 'Update' : 'Add'}</Button>
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
