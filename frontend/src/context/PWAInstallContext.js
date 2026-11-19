import React, {
    createContext,
    useContext,
    useCallback,
    useState,
    useSyncExternalStore,
} from 'react';

const PWAInstallContext = createContext(null);

const subscribers = new Set();

let deferredPrompt = null;
let initialized = false;
let installationInProgress = false;
let installedDuringSession = false;

let snapshot = {
    isInstalled: false,
    canInstall: false,
    isInstalling: false,
};

const isStandalone = () => {
    if (typeof window === 'undefined') {
        return false;
    }

    return (
        window.matchMedia('(display-mode: standalone)').matches ||
        window.matchMedia('(display-mode: fullscreen)').matches ||
        window.navigator.standalone === true
    );
};

const detectPlatform = () => {
    if (typeof navigator === 'undefined') {
        return 'other';
    }

    const userAgent = navigator.userAgent || '';

    const isIOS =
        /iPhone|iPad|iPod/i.test(userAgent) ||
        (
            /Macintosh/i.test(userAgent) &&
            navigator.maxTouchPoints > 1
        );

    if (isIOS) {
        return 'ios';
    }

    if (/Android/i.test(userAgent)) {
        return 'android';
    }

    if (/Windows|Macintosh|Linux|CrOS/i.test(userAgent)) {
        return 'desktop';
    }

    return 'other';
};

const updateSnapshot = () => {
    const nextSnapshot = {
        isInstalled:
            installedDuringSession || isStandalone(),
        canInstall: Boolean(deferredPrompt),
        isInstalling: installationInProgress,
    };

    if (
        snapshot.isInstalled === nextSnapshot.isInstalled &&
        snapshot.canInstall === nextSnapshot.canInstall &&
        snapshot.isInstalling === nextSnapshot.isInstalling
    ) {
        return;
    }

    snapshot = nextSnapshot;

    subscribers.forEach((subscriber) => {
        subscriber();
    });
};

const subscribe = (subscriber) => {
    subscribers.add(subscriber);

    return () => {
        subscribers.delete(subscriber);
    };
};

const getSnapshot = () => snapshot;

const handleBeforeInstallPrompt = (event) => {
    event.preventDefault();

    deferredPrompt = event;
    installedDuringSession = false;

    updateSnapshot();
};

const handleAppInstalled = () => {
    installedDuringSession = true;
    deferredPrompt = null;

    updateSnapshot();
};

export const initializePWAInstall = () => {
    if (
        initialized ||
        typeof window === 'undefined'
    ) {
        return;
    }

    initialized = true;

    window.addEventListener(
        'beforeinstallprompt',
        handleBeforeInstallPrompt
    );

    window.addEventListener(
        'appinstalled',
        handleAppInstalled
    );

    const displayModes = [
        '(display-mode: standalone)',
        '(display-mode: fullscreen)',
    ];

    displayModes.forEach((mode) => {
        const mediaQuery = window.matchMedia(mode);

        if (typeof mediaQuery.addEventListener === 'function') {
            mediaQuery.addEventListener(
                'change',
                updateSnapshot
            );
        } else if (typeof mediaQuery.addListener === 'function') {
            mediaQuery.addListener(updateSnapshot);
        }
    });

    updateSnapshot();
};

export const PWAInstallProvider = ({ children }) => {
    const installState = useSyncExternalStore(
        subscribe,
        getSnapshot,
        getSnapshot
    );

    const [dialogOpen, setDialogOpen] = useState(false);
    const [installationError, setInstallationError] =
        useState(false);

    const platform = detectPlatform();

    const closeInstallDialog = useCallback(() => {
        setDialogOpen(false);
        setInstallationError(false);
    }, []);

    const requestInstall = useCallback(async () => {
        if (
            installedDuringSession ||
            isStandalone() ||
            installationInProgress
        ) {
            return;
        }

        setInstallationError(false);

        if (!deferredPrompt) {
            setDialogOpen(true);
            return;
        }

        const promptEvent = deferredPrompt;

        // A browser installation event can only be used once.
        deferredPrompt = null;
        installationInProgress = true;

        updateSnapshot();

        try {
            await promptEvent.prompt();

            const choice = await promptEvent.userChoice;

            if (choice?.outcome === 'accepted') {
                // Installation is confirmed separately by
                // the appinstalled event or standalone mode.
                setDialogOpen(false);
            }

            // If dismissed, respect the user's decision.
        } catch {
            if (!installedDuringSession && !isStandalone()) {
                setInstallationError(true);
                setDialogOpen(true);
            }
        } finally {
            installationInProgress = false;
            updateSnapshot();
        }
    }, []);

    const showInstallOption =
        !installState.isInstalled &&
        (
            installState.canInstall ||
            platform !== 'other'
        );

        const value = {
        ...installState,
        platform,
        showInstallOption,
        requestInstall,
        dialogOpen,
        installationError,
        closeInstallDialog,
    };

    return (
        <PWAInstallContext.Provider value={value}>
            {children}
        </PWAInstallContext.Provider>
    );
};

export const usePWAInstall = () => {
    const context = useContext(PWAInstallContext);

    if (!context) {
        throw new Error(
            'usePWAInstall must be used within PWAInstallProvider.'
        );
    }

    return context;
};