import React, {
    useState,
    useEffect,
    lazy,
    Suspense,
} from 'react';

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

// Essential components loaded immediately.
import Home from './pages/Home';

import PageLayout from './components/layout/PageLayout';
import ConnectivityNotice from './components/layout/ConnectivityNotice';
import PageLoader from './components/layout/PageLoader';
import RouteErrorBoundary from './components/layout/RouteErrorBoundary';

import ThemeSwitcher from './components/ThemeSwitcher';
import LanguageSwitcher from './components/LanguageSwitcher';

import {
    PWAInstallDialogHost,
} from './components/pwa/InstallAppDialog';

// Authentication pages.
const Login = lazy(
    () => import('./components/auth/Login')
);

const Register = lazy(
    () => import('./components/auth/Register')
);

const ForgotPassword = lazy(
    () => import('./components/auth/ForgotPassword')
);

const ResetPassword = lazy(
    () => import('./components/auth/ResetPassword')
);

const VerifyEmail = lazy(
    () => import('./components/auth/VerifyEmail')
);

// Dashboard pages.
const Dashboard = lazy(
    () => import('./pages/Dashboard')
);

const AdminDashboard = lazy(
    () => import('./pages/AdminDashboard')
);

const ExtensionDashboard = lazy(
    () => import('./pages/ExtensionDashboard')
);

// User management pages.
const Settings = lazy(
    () => import('./pages/Settings')
);

const Notifications = lazy(
    () => import('./pages/Notifications')
);

const Profile = lazy(
    () => import('./pages/Profile')
);

const Connections = lazy(
    () => import('./components/connections/Connections')
);

// Core application features.
const Marketplace = lazy(
    () => import('./components/marketplace/Marketplace')
);

const PriceIndex = lazy(
    () => import('./components/priceIndex/PriceIndex')
);

const Community = lazy(
    () => import('./components/community/Community')
);

const FarmProject = lazy(
    () => import('./components/farmProjects/FarmProject')
);

const FinancialDashboard = lazy(
    () => import('./components/financial/FinancialDashboard')
);

// Subscription and payment pages.
const Subscription = lazy(
    () => import('./pages/Subscription')
);

const PaymentResult = lazy(
    () => import('./pages/PaymentResult')
);

// Administration and advertising pages.
const AdminReports = lazy(
    () => import('./pages/AdminReports')
);

const AdminAdvertisements = lazy(
    () => import('./pages/AdminAdvertisements')
);

const AdvertiserReport = lazy(
    () => import('./pages/AdvertiserReport')
);

const AdminAdvertisingGuide = lazy(
    () => import('./pages/AdminAdvertisingGuide')
);

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

    return <Dashboard />;
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

            <ConnectivityNotice />

            <PWAInstallDialogHost />

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

            <RouteErrorBoundary key={location.pathname}>
                <Suspense fallback={<PageLoader />}>
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
                                    <AdminDashboard />
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
                            path="/admin/advertisements"
                            element={
                                <RoleRoute roles={['admin']}>
                                    <PageLayout>
                                        <AdminAdvertisements />
                                    </PageLayout>
                                </RoleRoute>
                            }
                        />

                        <Route
                            path="/admin/advertising-guide"
                            element={
                                <RoleRoute roles={['admin']}>
                                    <PageLayout>
                                        <AdminAdvertisingGuide />
                                    </PageLayout>
                                </RoleRoute>
                            }
                        />

                        <Route
                            path="/extension/dashboard"
                            element={
                                <RoleRoute
                                    roles={['extension_officer']}
                                >
                                    <ExtensionDashboard />
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
                                    <Settings
                                        darkMode={darkMode}
                                        setDarkMode={setDarkMode}
                                    />
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
                            path="/subscription"
                            element={
                                <ProtectedRoute>
                                    <PageLayout>
                                        <Subscription />
                                    </PageLayout>
                                </ProtectedRoute>
                            }
                        />

                        <Route
                            path="/payment-result"
                            element={
                                <ProtectedRoute>
                                    <PageLayout>
                                        <PaymentResult />
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
                            path="/ads/report/:token"
                            element={<AdvertiserReport />}
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
                </Suspense>
            </RouteErrorBoundary>
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