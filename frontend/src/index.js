import React from 'react';
import ReactDOM from 'react-dom/client';

import './index.css';
import './styles/theme';

import App from './App';
import './i18n';

import { BrowserRouter } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';

import {
    PWAInstallProvider,
    initializePWAInstall,
} from './context/PWAInstallContext';

import * as serviceWorkerRegistration from
    './serviceWorkerRegistration';

// Capture installation events before React renders.
initializePWAInstall();

const root = ReactDOM.createRoot(
    document.getElementById('root')
);

root.render(
    <GoogleOAuthProvider
        clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}
    >
        <BrowserRouter>
            <PWAInstallProvider>
                <App />
            </PWAInstallProvider>
        </BrowserRouter>
    </GoogleOAuthProvider>
);

serviceWorkerRegistration.register();