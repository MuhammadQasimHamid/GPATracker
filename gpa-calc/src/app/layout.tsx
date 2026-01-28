import { Inter } from 'next/font/google';
import './globals.css';
import { GPAProvider } from '@/context/GPAContext';
import Script from 'next/script';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Premium GPA Calculator',
  description: 'Calculate your GPA and CGPA with ease and elegance. Data saved locally.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* Google AdSense Global Script */}
        {/* Replace 'YOUR_PUBLISHER_ID' with your actual AdSense ID (e.g., ca-pub-1234567890) */}
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1558322492471148"
          crossOrigin="anonymous"
          strategy="lazyOnload"
        />
        <meta name="google-adsense-account" content="ca-pub-1558322492471148"></meta>
      </head>
      <body className={inter.className}>
        <GPAProvider>
          {children}
        </GPAProvider>
      </body>
    </html>
  );
}
