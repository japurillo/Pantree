import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import Dashboard from '@/components/Dashboard'

export default async function HomePage() {
  const session = await getServerSession()

  if (!session) {
    redirect('/auth/signin')
  }

  return <Dashboard />
}
