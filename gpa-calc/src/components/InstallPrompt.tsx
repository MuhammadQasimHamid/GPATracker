'use client';

import { useState, useEffect } from 'react';

export default function InstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [isIos, setIsIos] = useState(false);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Register Service Worker
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js').catch((err) => {
                console.error('Service Worker registration failed:', err);
            });
        }

        // Check if iOS
        const isIosDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
        setIsIos(isIosDevice);

        // Detect if app is already installed/standalone
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;

        if (isStandalone) {
            return;
        }

        const handleBeforeInstallPrompt = (e: any) => {
            e.preventDefault();
            setDeferredPrompt(e);
            setIsVisible(true);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

        // For iOS, show the prompt manually if not standalone
        if (isIosDevice && !isStandalone) {
            setIsVisible(true);
        }

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        };
    }, []);

    const handleInstallClick = async () => {
        if (!deferredPrompt) return;

        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;

        if (outcome === 'accepted') {
            setDeferredPrompt(null);
            setIsVisible(false);
        }
    };

    if (!isVisible) return null;

    return (
        <div className="glass-card install-prompt">
            <div className="install-header">
                <span className="install-title">Install GPA Saver</span>
                <button className="btn-icon-danger" onClick={() => setIsVisible(false)}>✕</button>
            </div>
            <p className="install-desc">
                Add this app to your home screen for quick access and a better experience.
            </p>

            {isIos ? (
                <div className="ios-instructions">
                    <p>
                        Tap the share button <span>󰀣</span> and then <strong>"Add to Home Screen"</strong> <span>󰐖</span>
                    </p>
                </div>
            ) : (
                <div className="install-actions">
                    <button className="btn btn-primary btn-sm" onClick={handleInstallClick}>
                        Install Now
                    </button>
                    <button className="btn-danger-text" onClick={() => setIsVisible(false)}>
                        Maybe Later
                    </button>
                </div>
            )}
        </div>
    );
}
