import { Inter } from 'next/font/google'

import './globals.css'
import { Toaster } from 'sonner'

import QueryProvider from '@/components/QueryProvider'
import { ThemeProvider } from '@/components/theme-provider'

import type { Metadata } from 'next'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    template: '%s | Sportfy',
    default: 'Sportfy',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={
          process.env.HIDE_NEXT_ERROR_OVERLAY === 'true'
            ? 'hide-nextjs-portal'
            : undefined
        }
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          <QueryProvider>
            <Toaster theme="dark" />
            {children}
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
