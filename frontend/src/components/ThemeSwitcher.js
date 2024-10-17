import React, { useState } from 'react';
import { createMuiTheme, ThemeProvider } from '@mui/material/styles';
import { CssBaseline, Switch } from '@mui/material';

const ThemeSwitcher = ({ children }) => {
    const [darkMode, setDarkMode] = useState(false);

    const theme = createMuiTheme({
        palettte: {
            type: darkMode ? 'dark' : 'light',
            primary: { main: '#00BF63' },
        },
    });

    const toggleDarkMode = () => {
        setDarkMode(!darkMode);
    };

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Switch checked={darkMode} onChange={toggleDarkMode} />
            {children}
        </ThemeProvider>
    );
};

export default ThemeSwitcher;