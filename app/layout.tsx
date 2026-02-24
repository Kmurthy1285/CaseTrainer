import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'AI Clinical Reasoning Trainer',
  description: 'Improve your diagnostic thinking with AI-powered feedback',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  )
}
