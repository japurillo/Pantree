import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'

export default async function AnalyticsPage() {
  const session = await getServerSession()

  if (!session) {
    redirect('/auth/signin')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Analytics</h1>
          <p className="text-gray-600">Consumption patterns and insights coming soon...</p>
        </div>
      </div>
    </div>
  )
}
