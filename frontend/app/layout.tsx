import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'AgenticWIT - Enterprise Work Tracking',
  description: 'Accessible, modern work item tracking system',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
