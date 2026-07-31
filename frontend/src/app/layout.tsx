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
  metadataBase: new URL('https://whyev.in'),
  title: 'WhyEV — The One-Stop Platform for EV Buyers in India',
  description:
    'Discover the right electric vehicle, calculate exact government subsidies under Delhi EV Policy 2026, compare total ownership costs, and connect with verified dealers.',
  keywords: ['EV Subsidy Delhi 2026', 'Electric Vehicle Calculator India', 'Ather 450X', 'Tata Nexon EV Delhi', 'EV Battery Health Report'],
  openGraph: {
    title: 'WhyEV — The One-Stop Platform for EV Buyers in India',
    description:
      'Discover the right electric vehicle, calculate exact government subsidies under Delhi EV Policy 2026, compare total ownership costs, and connect with verified dealers.',
    url: 'https://whyev.in',
    siteName: 'WhyEV',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'WhyEV Logo',
      },
    ],
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'WhyEV — The One-Stop Platform for EV Buyers in India',
    description:
      'Discover the right electric vehicle, calculate exact government subsidies under Delhi EV Policy 2026.',
    images: ['/og-image.jpg'],
  },
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icon.png', sizes: '192x192', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  manifest: '/site.webmanifest',
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
