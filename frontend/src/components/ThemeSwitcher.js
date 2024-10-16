import React, { useState } from 'react';
import { createMuiTheme, ThemeProvider } from '@material-ui/core/styles';
import { Cssbaseline, Switch } from '@material-ui/core';

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
            <Cssbaseline />
            <Switch checked={darkMode} onChange={toggleDarkMode} />
            {children}
        </ThemeProvider>
    );
};

export default ThemeSwitcher;