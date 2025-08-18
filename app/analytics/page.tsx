import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import Analytics from '@/components/Analytics'

export default async function AnalyticsPage() {
  const session = await getServerSession()

  if (!session) {
    redirect('/auth/signin')
  }

  return <Analytics />
}
