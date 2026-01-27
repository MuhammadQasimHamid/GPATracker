import { Inter } from 'next/font/google';
import './globals.css';
import { GPAProvider } from '@/context/GPAContext';

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
      <body className={inter.className}>
        <GPAProvider>
          {children}
        </GPAProvider>
      </body>
    </html>
  );
}
