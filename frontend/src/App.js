import React, { useState, useEffect } from 'react';
import { Route, Routes, useLocation, Navigate } from 'react-router-dom';
import { Provider, useSelector } from 'react-redux';

import {
  CssBaseline,
  ThemeProvider,
  createTheme,
  Box,
} from '@mui/material';

import store from './redux/store';

import './styles/theme';

import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Settings from './pages/Settings';

import Login from './components/auth/Login';
import Register from './components/auth/Register';

import Marketplace from './components/marketplace/Marketplace';
import PriceIndex from './components/priceIndex/PriceIndex';
import Community from './components/community/Community';
import FarmProject from './components/farmProjects/FarmProject';

import ThemeSwitcher from './components/ThemeSwitcher';
import LanguageSwitcher from './components/LanguageSwitcher';

import TopAppBar from './components/layout/TopAppBar';
import FixedBottomNavigation from './components/layout/FixedBottomNavigation';

const ProtectedRoute = ({ element: Element, ...rest }) => {
  const { isAuthenticated } = useSelector((state) => state.auth);

  return isAuthenticated
    ? <Element {...rest} />
    : <Navigate to="/login" replace />;
};

const App = () => {

  const [darkMode, setDarkMode] = useState(false);

  const location = useLocation();

  useEffect(() => {

    setDarkMode(localStorage.getItem('darkMode') === 'true');

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

        default: darkMode ? '#121212' : '#F8F9FA',

      },

    },

    shape: {

      borderRadius: 12,

    },

  });

  const authPages = ['/', '/login', '/register'];

  const appPages = [
    '/dashboard',
    '/community',
    '/marketplace',
    '/price-index',
    '/farm-projects',
    '/settings',
  ];

  const showSwitchers = authPages.includes(location.pathname);

  const showTopAppBar = appPages.includes(location.pathname);

  const showBottomNav = appPages.includes(location.pathname);

  return (

    <Provider store={store}>

      <ThemeProvider theme={theme}>

        <CssBaseline />

        {showSwitchers && (

          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              px: 2,
              py: 1,
            }}
          >
            <ThemeSwitcher
              darkMode={darkMode}
              setDarkMode={setDarkMode}
            />

            <LanguageSwitcher />

          </Box>

        )}

        {showTopAppBar && <TopAppBar />}

        <Box
          component="main"
          sx={{
            minHeight: '100vh',
            pb: showBottomNav ? '80px' : 0,
            overflowX: 'hidden',
          }}
        >

          <Routes>

            <Route path="/" element={<Home />} />

            <Route path="/login" element={<Login />} />

            <Route path="/register" element={<Register />} />

            <Route
              path="/dashboard"
              element={<ProtectedRoute element={Dashboard} />}
            />

            <Route
              path="/settings"
              element={
                <ProtectedRoute
                  element={Settings}
                  darkMode={darkMode}
                  setDarkMode={setDarkMode}
                />
              }
            />

            <Route
              path="/marketplace"
              element={<ProtectedRoute element={Marketplace} />}
            />

            <Route
              path="/price-index"
              element={<ProtectedRoute element={PriceIndex} />}
            />

            <Route
              path="/community"
              element={<ProtectedRoute element={Community} />}
            />

            <Route
              path="/farm-projects"
              element={<ProtectedRoute element={FarmProject} />}
            />

            <Route
              path="/auth/google/callback"
              element={<Navigate to="/dashboard" replace />}
            />

          </Routes>

        </Box>

        {showBottomNav && <FixedBottomNavigation />}

      </ThemeProvider>

    </Provider>

  );

};

export default App;