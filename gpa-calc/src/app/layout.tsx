import { Inter } from 'next/font/google';
import './globals.css';
import { GPAProvider } from '@/context/GPAContext';
import { Analytics } from '@vercel/analytics/next';
import InstallPrompt, { InstallProvider } from '@/components/InstallPrompt';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'GPA Saver',
  description: 'Calculate your GPA and CGPA with ease and elegance. Data saved locally.',
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
  },
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className={inter.className}>
        <GPAProvider>
          <InstallProvider>
            {children}
            <Analytics />
            <InstallPrompt />
          </InstallProvider>
        </GPAProvider>
      </body>
    </html>
  );
}
