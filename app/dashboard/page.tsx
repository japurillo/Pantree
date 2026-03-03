import { redirect } from 'next/navigation'
import { auth } from '@clerk/nextjs/server'
import Dashboard from '@/components/Dashboard'

export default async function DashboardPage() {
  const { userId } = await auth()

  if (!userId) {
    redirect('/sign-in')
  }

  return <Dashboard />
}
