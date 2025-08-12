import React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';

/**
 * CustomDialog - A reusable, ADA-compliant dialog with dark mode support.
 * @param {object} props
 */
export default function CustomDialog({ open, onClose, title, children, darkMode, ...props }) {
    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="xs"
            fullWidth
            aria-modal="true"
            aria-labelledby="custom-dialog-title"
            aria-describedby="custom-dialog-desc"
            PaperProps={{
                sx: {
                    borderRadius: 3,
                    background: darkMode
                        ? 'linear-gradient(135deg, #18181b 60%, #23234a 100%)'
                        : '#fff',
                    color: darkMode ? '#f3f6fb' : '#222',
                    boxShadow: darkMode ? '0 8px 32px #000b' : '0 2px 8px #635bff22',
                    border: darkMode ? '2px solid #635bff' : '1px solid #e0e0e0',
                    p: { xs: 1, sm: 2 },
                },
                role: 'dialog',
                'aria-label': title,
            }}
            {...props}
        >
            <DialogTitle
                id="custom-dialog-title"
                sx={{
                    background: darkMode
                        ? 'linear-gradient(90deg, #23232b 60%, #635bff 100%)'
                        : '#f6fafd',
                    color: darkMode ? '#aab4ff' : '#222',
                    fontWeight: 700,
                    fontSize: { xs: '1.1rem', sm: '1.3rem' },
                    borderBottom: darkMode
                        ? '1px solid #635bff'
                        : '1px solid #e0e0e0',
                    letterSpacing: 0.5,
                    borderTopLeftRadius: 12,
                    borderTopRightRadius: 12,
                }}
            >
                {title}
            </DialogTitle>
            <DialogContent
                id="custom-dialog-desc"
                sx={{
                    background: 'transparent',
                    color: darkMode ? '#f3f6fb' : '#222',
                    pb: 2,
                }}
            >
                {children}
            </DialogContent>
        </Dialog>
    );
}
