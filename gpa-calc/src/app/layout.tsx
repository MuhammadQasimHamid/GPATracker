import { Inter } from 'next/font/google';
import './globals.css';
import { GPAProvider } from '@/context/GPAContext';
import { Analytics } from '@vercel/analytics/next';
import InstallPrompt from '@/components/InstallPrompt';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Premium GPA Calculator',
  description: 'Calculate your GPA and CGPA with ease and elegance. Data saved locally.',
  manifest: '/manifest.json',
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head />
      <body className={inter.className}>
        <GPAProvider>
          {children}
          <Analytics />
          <InstallPrompt />
        </GPAProvider>
      </body>
    </html>
  );
}
