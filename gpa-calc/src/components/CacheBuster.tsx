'use client';

import { useEffect } from 'react';

const APP_VERSION = '1.3.0-force-refresh-v2';

export default function CacheBuster() {
    useEffect(() => {
        // 1. Check if we need to bust cache
        const storedVersion = localStorage.getItem('app_version');

        if (storedVersion !== APP_VERSION) {
            console.log(`New version detected: ${APP_VERSION}. refreshing...`);

            // 2. Clear all service workers (Belt and suspenders)
            if ('serviceWorker' in navigator) {
                navigator.serviceWorker.getRegistrations().then(function (registrations) {
                    for (let registration of registrations) {
                        registration.unregister();
                    }
                });
            }

            // 3. Clear Cache Storage API
            if ('caches' in window) {
                caches.keys().then((names) => {
                    names.forEach((name) => {
                        caches.delete(name);
                    });
                });
            }

            // 4. Update version and force reload
            localStorage.setItem('app_version', APP_VERSION);
            // Use a short timeout to allow cleanup to finish
            setTimeout(() => {
                window.location.reload();
            }, 100);
        }
    }, []);

    return null;
}
