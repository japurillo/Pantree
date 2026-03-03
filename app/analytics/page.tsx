import { redirect } from 'next/navigation'
import { auth } from '@clerk/nextjs/server'
import Analytics from '@/components/Analytics'

export default async function AnalyticsPage() {
  const { userId } = await auth()

  if (!userId) {
    redirect('/sign-in')
  }

  return <Analytics />
}
