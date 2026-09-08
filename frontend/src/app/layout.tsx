import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import QueryProvider from '@/providers/QueryProvider';
import { AuthProvider } from '@/providers/AuthProvider';
import { ThemeProvider } from '@/providers/ThemeProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: {
    default: 'FinancialRecord - AI-Powered Personal Finance & Smart Budgeting',
    template: '%s | FinancialRecord',
  },
  description: 'Enterprise-Grade AI-Powered Personal Finance & Smart Income/Expense Breakdown Platform',
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
  openGraph: {
    title: 'FinancialRecord - AI-Powered Personal Finance',
    description: 'Enterprise-Grade AI-Powered Personal Finance & Smart Income/Expense Breakdown Platform',
    url: 'https://financialrecord.app',
    siteName: 'FinancialRecord',
    images: [
      {
        url: '/og-banner.svg',
        width: 1200,
        height: 630,
        alt: 'FinancialRecord AI Platform Preview',
      },
    ],
    locale: 'id_ID',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FinancialRecord - AI-Powered Personal Finance',
    description: 'Enterprise-Grade AI-Powered Personal Finance & Smart Income/Expense Breakdown Platform',
    images: ['/og-banner.svg'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <QueryProvider>
            <AuthProvider>{children}</AuthProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
