/**
 * Register the RoamAgro service worker.
 *
 * Registration is intentionally disabled during
 * normal development to prevent stale asset issues.
 */
export function register() {
    if (
        process.env.NODE_ENV !== 'production' ||
        typeof window === 'undefined' ||
        !('serviceWorker' in navigator) ||
        !window.isSecureContext
    ) {
        return;
    }

    const publicUrl = new URL(
        process.env.PUBLIC_URL || '/',
        window.location.href
    );

    if (publicUrl.origin !== window.location.origin) {
        return;
    }

    const serviceWorkerUrl = new URL(
        '/service-worker.js',
        window.location.origin
    ).href;

    const registerServiceWorker = async () => {
        try {
            const registration =
                await navigator.serviceWorker.register(
                    serviceWorkerUrl,
                    {
                        scope: '/',
                        updateViaCache: 'none',
                    }
                );

            return registration;
        } catch (error) {
            console.warn(
                'RoamAgro service worker registration failed:',
                error
            );

            return null;
        }
    };

    if (document.readyState === 'complete') {
        registerServiceWorker();
    } else {
        window.addEventListener(
            'load',
            registerServiceWorker,
            { once: true }
        );
    }
}

/**
 * Unregister the RoamAgro service worker
 * and remove its caches if necessary.
 *
 * Reserved for maintenance and troubleshooting.
 */
export async function unregister() {
    if (
        typeof window === 'undefined' ||
        !('serviceWorker' in navigator)
    ) {
        return;
    }

    try {
        const registrations =
            await navigator.serviceWorker.getRegistrations();

        const serviceWorkerUrl = new URL(
            '/service-worker.js',
            window.location.origin
        ).href;

        await Promise.all(
            registrations
                .filter((registration) =>
                    [
                        registration.active,
                        registration.waiting,
                        registration.installing,
                    ].some(
                        (worker) =>
                            worker &&
                            worker.scriptURL === serviceWorkerUrl
                    )
                )
                .map((registration) =>
                    registration.unregister()
                )
        );

        if ('caches' in window) {
            const cacheNames = await window.caches.keys();

            await Promise.all(
                cacheNames
                    .filter((name) =>
                        name.startsWith('roamagro-')
                    )
                    .map((name) =>
                        window.caches.delete(name)
                    )
            );
        }
    } catch (error) {
        console.warn(
            'RoamAgro service worker cleanup failed:',
            error
        );
    }
}