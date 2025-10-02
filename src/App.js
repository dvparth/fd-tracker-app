import { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Box from '@mui/material/Box';
import './index.css';
import MFTracker from './components/MFTracker';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

/**
 * Main App component.
 * @returns {JSX.Element}
 */
function App() {
    const [darkMode, setDarkMode] = useState(true);

    const theme = createTheme({
        palette: (() => {
            if (darkMode) return {
                mode: 'dark',
                primary: { main: '#635bff' },
                background: { default: '#0b0b12', paper: '#0f1220' },
                text: { primary: '#e6eef6', secondary: '#9aa4b2' },
                divider: 'rgba(255,255,255,0.06)'
            };
            return {
                mode: 'light',
                primary: { main: '#635bff' },
                background: { default: '#f6fafd', paper: '#ffffff' },
                text: { primary: '#0f1724', secondary: '#556475' },
                divider: 'rgba(15,23,36,0.08)'
            };
        })(),
        typography: { fontFamily: 'Inter, Roboto, Arial' }
    });

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <div style={{ minHeight: '100vh', background: theme.palette?.background?.default }}>
                <Box sx={{ px: 0, py: 0 }} />
                <Routes>
                    <Route path="/" element={<MFTracker darkMode={darkMode} setDarkMode={setDarkMode} />} />
                </Routes>
            </div>
        </ThemeProvider>
    );
}

export default App;
