import type { Metadata } from 'next';
import './globals.css';
import { AppContextProvider } from '@/context/AppContext';
import { AppShell } from '@/components/AppShell';

export const metadata: Metadata = {
  title: 'Clothify — Custom Tailoring & Fitting Studio',
  description: 'Your personalized fitting room and fashion assistant. Browse exquisite bespoke wear from elite merchants. Powered by Phasion Sense.',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no',
  themeColor: '#0A0A0A',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full bg-[#0A0A0A] antialiased">
      <body className="min-h-full flex flex-col selection:bg-[#D4A853]/30 selection:text-[#FAF0E6]">
        <AppContextProvider>
          <AppShell>
            {children}
          </AppShell>
        </AppContextProvider>
      </body>
    </html>
  );
}
