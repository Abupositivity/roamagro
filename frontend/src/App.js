import React, { useState, useEffect } from 'react';
import { Route, Routes, useLocation, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Settings from './pages/Settings';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Marketplace from './components/marketplace/Marketplace';
import PriceIndex from './components/priceIndex/PriceIndex';
import Community from './components/community/Community';
import FarmProject from './components/farmProjects/FarmProject';
import { Provider, useSelector } from 'react-redux';
import store from './redux/store';
import './styles/theme';
import LanguageSwitcher from './components/LanguageSwitcher';
import ThemeSwitcher from './components/ThemeSwitcher';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import FixedBottomNavigation from './components/layout/FixedBottomNavigation';
import TopAppBar from './components/layout/TopAppBar';

const ProtectedRoute = ({ element: Element, ...rest }) => {
  const auth = useSelector((state) => state.auth);
  return auth.isAuthenticated ? <Element {...rest} /> : <Navigate to="/login" />;
};

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

  const showSwitchers = location.pathname === '/' || location.pathname === '/login' || location.pathname === '/register';
  const showTopAppBar = ['/dashboard', '/community', '/marketplace', '/price-index', '/farm-projects', '/settings'].includes(location.pathname);
  const showBottomNav = ['/dashboard', '/community', '/marketplace', '/price-index', '/farm-projects', '/settings'].includes(location.pathname);

  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />

        {showSwitchers && (
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 10px' }}>
            <ThemeSwitcher darkMode={darkMode} setDarkMode={setDarkMode} />
            <LanguageSwitcher />
          </div>
        )}

        {showTopAppBar && <TopAppBar />}

        <div style={{ paddingBottom: showBottomNav ? '56px' : '0' }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected Routes */}
            <Route path="/dashboard" element={<ProtectedRoute element={Dashboard} />} />
            <Route path="/settings" element={<ProtectedRoute element={Settings} darkMode={darkMode} setDarkMode={setDarkMode} />} />
            <Route path="/marketplace" element={<ProtectedRoute element={Marketplace} />} />
            <Route path="/price-index" element={<ProtectedRoute element={PriceIndex} />} />
            <Route path="/community" element={<ProtectedRoute element={Community} />} />
            <Route path="/farm-projects" element={<ProtectedRoute element={FarmProject} />} />

            <Route path="/auth/google/callback" element={<Navigate to="/dashboard" />} />
          </Routes>
        </div>

        {showBottomNav && <FixedBottomNavigation />}
      </ThemeProvider>
    </Provider>
  );
};

export default App;