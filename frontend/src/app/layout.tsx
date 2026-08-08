import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/layout/Providers';
import { AppLayoutWrapper } from '@/components/layout/AppLayoutWrapper';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#ffffff',
};

export const metadata: Metadata = {
  title: 'WhyEV — The One-Stop Platform for EV Buyers in India',
  description:
    'Discover the right electric vehicle, calculate exact government subsidies under Delhi EV Policy 2026, compare total ownership costs, and connect with verified dealers.',
  keywords: ['EV Subsidy Delhi 2026', 'Electric Vehicle Calculator India', 'Ather 450X', 'Tata Nexon EV Delhi', 'EV Battery Health Report'],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className={`${inter.className} min-h-screen antialiased bg-white text-slate-900 selection:bg-emerald-600 selection:text-white`}>
        <Providers>
          <AppLayoutWrapper>{children}</AppLayoutWrapper>
        </Providers>
      </body>
    </html>
  );
}
