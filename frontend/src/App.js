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

import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import ExtensionDashboard from './pages/ExtensionDashboard';
import Settings from './pages/Settings';
import Notifications from './pages/Notifications';
import Profile from './pages/Profile';
import Connections from './components/connections/Connections';
import AdminReports from './pages/AdminReports';

import Login from './components/auth/Login';
import Register from './components/auth/Register';
import ForgotPassword from "./components/auth/ForgotPassword";
import ResetPassword from "./components/auth/ResetPassword";
import VerifyEmail from "./components/auth/VerifyEmail";

import Marketplace from './components/marketplace/Marketplace';
import PriceIndex from './components/priceIndex/PriceIndex';
import Community from './components/community/Community';
import FarmProject from './components/farmProjects/FarmProject';
import FinancialDashboard from './components/financial/FinancialDashboard';

import PageLayout from './components/layout/PageLayout';

import ThemeSwitcher from './components/ThemeSwitcher';
import LanguageSwitcher from './components/LanguageSwitcher';

const getDashboardPath = (role) => {
    switch (role) {
        case 'admin':
            return '/admin/dashboard';
        case 'extension_officer':
            return '/extension/dashboard';
        case 'farmer':
        case 'buyer':
        default:
            return '/dashboard';
    }
};

const ProtectedRoute = ({ children }) => {
    const { isAuthenticated } = useSelector(
        (state) => state.auth
    );

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return children;
};

const RoleRoute = ({ children, roles }) => {
    const {
        isAuthenticated,
        user,
    } = useSelector((state) => state.auth);

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (!roles.includes(user?.role)) {
        return (
            <Navigate
                to={getDashboardPath(user?.role)}
                replace
            />
        );
    }

    return children;
};

const UserDashboardRoute = () => {
    const {
        isAuthenticated,
        user,
    } = useSelector((state) => state.auth);

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (
        user?.role === 'admin' ||
        user?.role === 'extension_officer'
    ) {
        return (
            <Navigate
                to={getDashboardPath(user.role)}
                replace
            />
        );
    }

    return (
        <PageLayout>
            <Dashboard />
        </PageLayout>
    );
};

const AppContent = () => {
    const location = useLocation();
    const [darkMode, setDarkMode] = useState(false);

    useEffect(() => {
        const savedTheme =
            localStorage.getItem('darkMode');

        setDarkMode(savedTheme === 'true');
    }, []);

    useEffect(() => {
        localStorage.setItem(
            'darkMode',
            darkMode
        );
    }, [darkMode]);

    const theme = createTheme({
        palette: {
            mode: darkMode ? 'dark' : 'light',
            primary: {
                main: '#00BF63',
            },
            background: {
                default: darkMode
                    ? '#121212'
                    : '#F8F9FA',
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

    const showSwitchers =
        authPages.includes(location.pathname);

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
                <Route
                    path="/"
                    element={<Home />}
                />

                <Route
                    path="/login"
                    element={<Login />}
                />

                <Route
                    path="/register"
                    element={<Register />}
                />

                <Route
                    path="/forgot-password" 
                    element={<ForgotPassword />}
                />

                <Route
                    path="/reset-password"
                    element={<ResetPassword />}
                />
                
                <Route
                    path="/verify-email"
                    element={<VerifyEmail />}
                />

                <Route
                    path="/dashboard"
                    element={<UserDashboardRoute />}
                />

                <Route
                    path="/admin/dashboard"
                    element={
                        <RoleRoute roles={['admin']}>
                            <PageLayout>
                                <AdminDashboard />
                            </PageLayout>
                        </RoleRoute>
                    }
                />

                <Route
                    path="/admin/reports"
                    element={
                        <RoleRoute roles={['admin']}>
                            <PageLayout>
                                <AdminReports />
                            </PageLayout>
                        </RoleRoute>
                    }
                />

                <Route
                    path="/extension/dashboard"
                    element={
                        <RoleRoute
                            roles={['extension_officer']}>
                            <PageLayout>
                                <ExtensionDashboard />
                            </PageLayout>
                        </RoleRoute>
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
                    path="/financial"
                    element={
                        <ProtectedRoute>
                            <PageLayout>
                                <FinancialDashboard />
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

                <Route
                    path="/notifications"
                    element={
                        <ProtectedRoute>
                            <PageLayout>
                                <Notifications />
                            </PageLayout>
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/profile"
                    element={
                        <ProtectedRoute>
                            <PageLayout>
                                <Profile />
                            </PageLayout>
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/connections"
                    element={
                        <ProtectedRoute>
                            <PageLayout>
                                <Connections />
                            </PageLayout>
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/auth/google/callback"
                    element={
                        <Navigate
                            to="/dashboard"
                            replace
                        />
                    }
                />

                <Route
                    path="*"
                    element={
                        <Navigate
                            to="/"
                            replace
                        />
                    }
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