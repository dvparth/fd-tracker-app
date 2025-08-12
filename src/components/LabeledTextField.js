import React from 'react';
import TextField from '@mui/material/TextField';

/**
 * LabeledTextField - A reusable TextField with consistent style and accessibility.
 * @param {object} props
 */
export default function LabeledTextField({ label, inputProps, ...props }) {
    return (
        <TextField
            label={label}
            size="small"
            fullWidth
            InputLabelProps={{
                style: {
                    color: '#222',
                    fontWeight: 500,
                    letterSpacing: 0.2,
                },
            }}
            inputProps={{
                style: {
                    color: '#222',
                    background: '#fff',
                    borderRadius: 4,
                },
                ...inputProps,
            }}
            {...props}
        />
    );
}
