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
        // Unregister Service Workers to clear cache issues
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.getRegistrations().then(function (registrations) {
                for (let registration of registrations) {
                    registration.unregister();
                }
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

        if (deferredPrompt) {
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;

            if (outcome === 'accepted') {
                setDeferredPrompt(null);
                setIsVisible(false);
            }
        } else {
            // Enhanced platform-aware fallback messaging
            const isMac = /Mac/.test(navigator.platform);
            const menuIcon = isMac ? 'Safari "Share" button' : 'browser menu (⋮ or ⋯)';

            alert(
                'To add "GPA Saver" to your Desktop / Home Screen:\n\n' +
                `1. Open your ${menuIcon}.\n` +
                '2. Select "Add to Home Screen" or "Install App".'
            );
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
