import React, { useState, useEffect } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
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
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import FixedBottomNavigation from './components/layout/FixedBottomNavigation';
import TopAppBar from './components/layout/TopAppBar';

const App = () => {
  const [darkMode, setDarkMode] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const savedTheme = localStorage.getItem('darkMode') === 'true';
    setDarkMode(savedTheme);
  }, []);

  useEffect(() => {
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  const theme = createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
      primary: {
        main: '#00BF63',
      },
      background: {
        default: darkMode ? '#121212' : '#fff',
      },
    },
  });

  const showSwitchers = location.pathname === '/' || location.pathname === '/login';
  const showTopAppBar = ['/dashboard', '/community', '/marketplace', '/price-index', '/farm-projects', '/settings'].includes(location.pathname);

  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />

        {/* Conditionally render Theme and Language Switchers */}
        {showSwitchers && (
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 10px' }}>
            <ThemeSwitcher darkMode={darkMode} setDarkMode={setDarkMode} />
            <LanguageSwitcher />
          </div>
        )}

        {/* Conditionally render the Top App Bar on specific pages */}
        {showTopAppBar && <TopAppBar />}

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/settings" element={<Settings darkMode={darkMode} setDarkMode={setDarkMode} />} />
          <Route path="/marketplace" element={<Marketplace />} />
          <Route path="/price-index" element={<PriceIndex />} />
          <Route path="/community" element={<Community />} />
          <Route path="/farm-projects" element={<FarmProject />} />
        </Routes>

        {/* Fixed bottom navigation for specific routes */}
        <Routes>
          <Route path="/dashboard" element={<FixedBottomNavigation />} />
          <Route path="/community" element={<FixedBottomNavigation />} />
          <Route path="/marketplace" element={<FixedBottomNavigation />} />
          <Route path="/price-index" element={<FixedBottomNavigation />} />
          <Route path="/farm-projects" element={<FixedBottomNavigation />} />
          <Route path="/settings" element={<FixedBottomNavigation />} />
        </Routes>
      </ThemeProvider>
    </Provider>
  );
};

export default App;