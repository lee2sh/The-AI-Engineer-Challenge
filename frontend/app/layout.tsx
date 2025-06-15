import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Dracula Theme App',
  description: 'A beautiful Dracula-themed Next.js application',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-dracula-background text-dracula-foreground min-h-screen`}>
        {children}
      </body>
    </html>
  )
} 