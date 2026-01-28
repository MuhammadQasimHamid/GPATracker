'use client';

import { useEffect } from 'react';

interface AdUnitProps {
    slot: string;
    format?: 'auto' | 'fluid' | 'rectangle';
    responsive?: 'true' | 'false';
    style?: React.CSSProperties;
}

/**
 * Reusable Google AdSense Ad Unit Component
 * 
 * Usage:
 * <AdUnit slot="1234567890" format="auto" />
 */
export default function AdUnit({ slot, format = 'auto', responsive = 'true', style }: AdUnitProps) {
    useEffect(() => {
        try {
            // @ts-ignore
            (window.adsbygoogle = window.adsbygoogle || []).push({});
        } catch (e) {
            console.error('AdSense error:', e);
        }
    }, []);

    return (
        <div className="ad-container" style={{ textAlign: 'center', margin: '1rem 0', ...style }}>
            <ins
                className="adsbygoogle"
                style={{ display: 'block', ...style }}
                data-ad-client="ca-pub-1558322492471148"
                data-ad-slot={slot}
                data-ad-format={format}
                data-full-width-responsive={responsive}
            />
        </div>
    );
}
