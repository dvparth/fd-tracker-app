import React from 'react';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';

/**
 * LabeledAutocomplete - A reusable Autocomplete with consistent style and accessibility.
 * @param {object} props
 */
export default function LabeledAutocomplete({ label, options, value, onInputChange, ...props }) {
    return (
        <Autocomplete
            freeSolo
            options={options}
            value={value}
            onInputChange={onInputChange}
            renderInput={(params) => (
                <TextField
                    {...params}
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
                        ...params.inputProps,
                        style: {
                            color: '#222',
                            background: '#fff',
                            borderRadius: 4,
                        },
                    }}
                />
            )}
            {...props}
        />
    );
}
