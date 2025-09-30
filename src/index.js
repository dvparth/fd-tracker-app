import React, { useMemo, useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import store from './store';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';

// Expose selected build-time env vars to window for adapters/quick-testing at runtime.
// This helps the hybrid adapter detect RapidAPI settings without depending solely on process.env in bundled code.
if (typeof window !== 'undefined') {
    try {
        // Note: CRA exposes REACT_APP_* vars on process.env at build/dev time.
        window.__RAPIDAPI_KEY__ = window.__RAPIDAPI_KEY__ || process.env.REACT_APP_RAPIDAPI_KEY || '';
        window.__RAPIDAPI_HOST__ = window.__RAPIDAPI_HOST__ || process.env.REACT_APP_RAPIDAPI_HOST || '';
    } catch (e) {
        // ignore in non-browser or restricted environments
    }
}

function ThemeWrapper() {
    const [mode, setMode] = useState(() => localStorage.getItem('muiThemeMode') || 'light');
    useEffect(() => {
        localStorage.setItem('muiThemeMode', mode);
    }, [mode]);
    const theme = useMemo(() => createTheme({ palette: { mode } }), [mode]);
    return (
        <ThemeProvider theme={theme}>
            <App themeMode={mode} setThemeMode={setMode} />
        </ThemeProvider>
    );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <Provider store={store}>
        <BrowserRouter>
            <ThemeWrapper />
        </BrowserRouter>
    </Provider>
);
