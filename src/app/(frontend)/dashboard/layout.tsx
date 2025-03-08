import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Dashboard | Zest',
  description: 'Dashboard',
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
