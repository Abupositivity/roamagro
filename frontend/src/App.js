import React from 'react';
import { Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Settings from './pages/Settings';
import Login from './components/auth/Login';
import Marketplace from './components/marketplace/Marketplace';
import PriceIndex from './components/priceIndex/PriceIndex';
import Community from './components/community/Community';
import FarmProject from './components/farmProjects/FarmProject';
import { Provider } from 'react-redux';
import store from './redux/store';
import './styles/theme';
import LanguageSwitcher from './components/LanguageSwitcher';
import ThemeSwitcher from './components/ThemeSwitcher';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#00BF63', // RoamAgro green color
    },
    background: {
      default: '#fff',
    },
  },
});

const App = () => {
  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 10px' }}>
          <ThemeSwitcher />
          <LanguageSwitcher />
        </div>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/marketplace" element={<Marketplace />} />
          <Route path="/price-index" element={<PriceIndex />} />
          <Route path="/community" element={<Community />} />
          <Route path="/farm-projects" element={<FarmProject />} />
        </Routes>
      </ThemeProvider>
    </Provider>
  );
};

export default App;