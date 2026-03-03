import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ClerkProvider } from '@clerk/nextjs'
import { ConvexProvider } from '@/components/providers/ConvexProvider'

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
    <ClerkProvider>
      <html lang="en">
        <body className={inter.className}>
          <ConvexProvider>
            {children}
          </ConvexProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}
