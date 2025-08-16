import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/components/providers/AuthProvider'
import { SWRProvider } from '@/components/providers/SWRProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
      title: 'PanTree - Smart Pantry Management',
  description: 'Manage your pantry inventory with ease. Track items, set thresholds, and never run out of essentials.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <SWRProvider>
            {children}
          </SWRProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
