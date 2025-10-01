import React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { fmtRoundUp, dateShort } from '../utils/formatters';

export default function SummaryCard({ totals, latestDate, month1Label, month2Label, month3Label }) {
    const changeVal = totals.prevDelta;
    const changeText = changeVal > 0 ? 'success.main' : changeVal < 0 ? 'error.main' : 'text.primary';
    const totalsPrevDeltaPct = totals.month1 ? (totals.prevDelta / totals.month1) * 100 : null;

    return (
        <Card elevation={4} sx={{ mb: 1.25, borderRadius: 2, background: 'linear-gradient(135deg,#ffffff,#eef6ff)', boxShadow: '0 6px 18px rgba(31,42,68,0.05)' }}>
            <CardContent sx={{ py: 1, px: { xs: 1.25, sm: 2 } }}>
                <Grid container spacing={2} alignItems="center" sx={{ columnGap: 4, justifyContent: 'space-between' }}>
                    <Grid item xs={12} sm={7} sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', minHeight: 64, pr: { sm: 2 } }}>
                        <Typography sx={{ fontSize: { xs: '0.85rem', sm: '0.95rem' }, color: '#556475' }}>Current Value</Typography>
                        <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
                            <Typography noWrap sx={{ fontWeight: 900, fontSize: { xs: '1.3rem', sm: '1.6rem' }, color: '#0f1724', lineHeight: 1 }}>{`₹${fmtRoundUp(totals.marketValue)}`}</Typography>
                        </Box>
                        <Box sx={{ mt: 0.5 }}>
                            <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1 }}>
                                <Typography sx={{ fontSize: '0.64rem', color: '#556475', fontWeight: 700 }}>Invested</Typography>
                                <Typography sx={{ fontSize: '0.72rem', color: '#0f1724', fontWeight: 800 }}>₹{fmtRoundUp(totals.principal)}</Typography>
                            </Box>
                            <Box sx={{ mt: 0.25, display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Typography sx={{ fontSize: '0.64rem', color: changeText, fontWeight: 700 }}>{totals.prevDelta !== null ? `₹${fmtRoundUp(totals.prevDelta)}` : '-'}</Typography>
                                <Typography sx={{ fontSize: '0.62rem', color: changeText }}>{totalsPrevDeltaPct !== null ? `(${totalsPrevDeltaPct.toFixed(2)}%)` : ''}</Typography>
                                <Typography sx={{ fontSize: '0.62rem', color: '#7a8696' }}>{latestDate ? dateShort(latestDate) : ''}</Typography>
                            </Box>
                        </Box>
                    </Grid>
                    <Grid item xs={12} sm={4} sx={{ display: 'flex', justifyContent: 'flex-end', flexDirection: 'column', alignItems: 'flex-end', minHeight: 64, pl: { sm: 2 } }}>
                        <Typography sx={{ fontSize: '0.72rem', color: '#556475' }}>Profit / Loss</Typography>
                        <Typography noWrap sx={{ fontWeight: 900, fontSize: { xs: '0.95rem', sm: '1.1rem' }, color: totals.profit > 0 ? 'success.main' : 'error.main' }}>₹{fmtRoundUp(totals.profit)}</Typography>
                        <Typography sx={{ fontSize: '0.62rem', color: '#7a8696', mt: 0.35 }}>{totals.principal ? `(${((totals.profit / totals.principal) * 100).toFixed(2)}%)` : ''}</Typography>
                    </Grid>
                    <Grid item xs={12} sx={{ mt: 0.25 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', gap: 2 }}>
                            <Box sx={{ textAlign: 'left', flex: 1 }}>
                                <Typography sx={{ fontSize: '0.72rem', color: '#666' }}>{month1Label}</Typography>
                                <Typography sx={{ fontWeight: 800, fontSize: '0.95rem' }}>₹{fmtRoundUp(totals.month1)}</Typography>
                            </Box>
                            <Box sx={{ textAlign: 'center', flex: 1 }}>
                                <Typography sx={{ fontSize: '0.72rem', color: '#666' }}>{month2Label}</Typography>
                                <Typography sx={{ fontWeight: 800, fontSize: '0.95rem' }}>₹{fmtRoundUp(totals.month2)}</Typography>
                            </Box>
                            <Box sx={{ textAlign: 'right', flex: 1 }}>
                                <Typography sx={{ fontSize: '0.72rem', color: '#666' }}>{month3Label}</Typography>
                                <Typography sx={{ fontWeight: 800, fontSize: '0.95rem' }}>₹{fmtRoundUp(totals.month3)}</Typography>
                            </Box>
                        </Box>
                    </Grid>
                </Grid>
            </CardContent>
        </Card>
    );
}
