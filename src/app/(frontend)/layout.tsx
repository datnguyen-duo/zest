import type { Metadata } from 'next'
import React from 'react'

import localFont from 'next/font/local'
import { Footer } from '@/Footer/Component'
import { Header } from '@/Header/Component'
import { Providers } from '@/providers'
import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'
import { draftMode } from 'next/headers'
import { Toast } from '@/components/ui/toast'
import { getServerSideURL } from '@/utilities/getURL'
import { cn } from '@/utilities/cn'
import './globals.css'

const switzer = localFont({
  src: '../fonts/Switzer-Variable.woff2',
  variable: '--font-switzer',
})

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { isEnabled } = await draftMode()

  return (
    <html lang="en" className={cn(switzer.variable)}>
      <head>
        <link href="/favicon.ico" rel="icon" sizes="32x32" />
        <link href="/favicon.svg" rel="icon" type="image/svg+xml" />
      </head>
      <body>
        <Providers>
          <Header />
          <main className="min-h-screen">{children}</main>
          <Footer />
        </Providers>
        <Toast />
      </body>
    </html>
  )
}

export const metadata: Metadata = {
  metadataBase: new URL(getServerSideURL()),
  openGraph: mergeOpenGraph(),
  twitter: {
    card: 'summary_large_image',
    creator: '@duo-studio',
  },
}
