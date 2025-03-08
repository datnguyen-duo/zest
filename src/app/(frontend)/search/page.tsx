import type { Metadata } from 'next/types'
import PageClient from './page.client'

export default async function Page() {
  return <PageClient />
}

export function generateMetadata(): Metadata {
  return {
    title: `Search | Zest`,
  }
}
