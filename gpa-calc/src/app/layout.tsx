import { Inter } from 'next/font/google';
import './globals.css';
import { GPAProvider } from '@/context/GPAContext';
import { Analytics } from '@vercel/analytics/next';

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
      <head />
      <body className={inter.className}>
        <GPAProvider>
          {children}
          <Analytics />
        </GPAProvider>
      </body>
    </html>
  );
}
