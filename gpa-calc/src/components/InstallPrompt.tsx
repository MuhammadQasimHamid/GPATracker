'use client';

import { useState, useEffect, createContext, useContext } from 'react';

interface InstallContextType {
    deferredPrompt: any;
    isIos: boolean;
    isVisible: boolean;
    setIsVisible: (visible: boolean) => void;
    handleInstallClick: () => Promise<void>;
}

const InstallContext = createContext<InstallContextType | undefined>(undefined);

export function InstallProvider({ children }: { children: React.ReactNode }) {
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

        const isIosDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
        setIsIos(isIosDevice);

        const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;

        if (isStandalone) return;

        const handleBeforeInstallPrompt = (e: any) => {
            e.preventDefault();
            setDeferredPrompt(e);
            // Default popup logic can stay here or be triggered elsewhere
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        };
    }, []);

    const handleInstallClick = async () => {
        if (isIos) {
            setIsVisible(true);
            return;
        }

        if (!deferredPrompt) {
            alert('To install: Use your browser menu (e.g., "Install App" or "Add to Home Screen").');
            return;
        }

        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;

        if (outcome === 'accepted') {
            setDeferredPrompt(null);
            setIsVisible(false);
        }
    };

    return (
        <InstallContext.Provider value={{ deferredPrompt, isIos, isVisible, setIsVisible, handleInstallClick }}>
            {children}
        </InstallContext.Provider>
    );
}

export function useInstall() {
    const context = useContext(InstallContext);
    if (!context) throw new Error('useInstall must be used within an InstallProvider');
    return context;
}

export default function InstallPrompt() {
    const { isVisible, setIsVisible, isIos, handleInstallClick, deferredPrompt } = useInstall();

    // Auto-show bottom prompt only if prompt is available (PC/Android) or it's iOS
    useEffect(() => {
        if (deferredPrompt || isIos) {
            // Optional: Auto-show after some delay
            const timer = setTimeout(() => setIsVisible(true), 3000);
            return () => clearTimeout(timer);
        }
    }, [deferredPrompt, isIos, setIsVisible]);

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
