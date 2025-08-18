import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import Dashboard from '@/components/Dashboard'
import LandingPage from '@/components/LandingPage'

export default async function HomePage() {
  const session = await getServerSession()

  if (session) {
    redirect('/inventory')
  }

  return <LandingPage />
}
