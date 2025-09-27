import React, { useMemo, useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import store from './store';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';

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
