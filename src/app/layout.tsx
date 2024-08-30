// app/layout.tsx

import type { Metadata } from 'next';
import { ThemeProvider } from '@/components/theme-provider';
import { Inter } from 'next/font/google';
import './globals.css';
import QueryProvider from '@/components/QueryProvider'; // Importe o QueryProvider

const inter = Inter({ subsets: ['latin'] });

export async function generateMetadata() {
  return {
    title: 'Sportfy',
  };
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <QueryProvider> {/* Use o QueryProvider aqui */}
            {children}
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
