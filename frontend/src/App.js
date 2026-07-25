import React, { useState, useEffect } from 'react';
import {
  Routes,
  Route,
  Navigate,
  useLocation,
} from 'react-router-dom';

import { Provider, useSelector } from 'react-redux';

import {
  ThemeProvider,
  CssBaseline,
  createTheme,
  Box,
} from '@mui/material';

import store from './redux/store';
import './styles/theme';
// Pages
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Settings from './pages/Settings';
import Notifications from './pages/Notifications';
import Profile from './pages/Profile';
// Auth
import Login from './components/auth/Login';
import Register from './components/auth/Register';
// Features
import Marketplace from './components/marketplace/Marketplace';
import PriceIndex from './components/priceIndex/PriceIndex';
import Community from './components/community/Community';
import FarmProject from './components/farmProjects/FarmProject';
// Layout
import PageLayout from './components/layout/PageLayout';
// Shared Components
import ThemeSwitcher from './components/ThemeSwitcher';
import LanguageSwitcher from './components/LanguageSwitcher';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useSelector((state) => state.auth);
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

const AppContent = () => {
  const location = useLocation();
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('darkMode');
    setDarkMode(savedTheme === 'true');
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
    typography: {
      fontFamily: 'Roboto, sans-serif',
    },
  });

  const authPages = [
    '/',
    '/login',
    '/register',
  ];

  const showSwitchers = authPages.includes(location.pathname);
  return (
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
      <Routes>
        {/* Public */}
        <Route path="/" element={<Home />} />
        <Route
          path="/login"
          element={<Login />}
        />
        <Route
          path="/register"
          element={<Register />}
        />
        {/* Protected */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <PageLayout>
                <Dashboard />
              </PageLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/farm-projects"
          element={
            <ProtectedRoute>
              <PageLayout>
                <FarmProject />
              </PageLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/marketplace"
          element={
            <ProtectedRoute>
              <PageLayout>
                <Marketplace />
              </PageLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/price-index"
          element={
            <ProtectedRoute>
              <PageLayout>
                <PriceIndex />
              </PageLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/community"
          element={
            <ProtectedRoute>
              <PageLayout>
                <Community />
              </PageLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <PageLayout>
                <Settings
                  darkMode={darkMode}
                  setDarkMode={setDarkMode}
                />
              </PageLayout>
            </ProtectedRoute>
          }
        />
        {/* Google OAuth */}
        <Route
          path="/auth/google/callback"
          element={<Navigate to="/dashboard" replace />}
        />
        <Route
          path="/notifications"
          element={<ProtectedRoute element={Notifications} />}
        />
        <Route
          path="/profile"
          element={<ProtectedRoute element={Profile} />}
        />
        {/* Fallback */}
        <Route
          path="*"
          element={<Navigate to="/" replace />}
        />
      </Routes>
    </ThemeProvider>
  );
};

const App = () => {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
};

export default App;