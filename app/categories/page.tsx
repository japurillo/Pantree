import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import CategoriesPageClient from '@/components/CategoriesPageClient'

export default async function CategoriesPage() {
  const session = await getServerSession()

  if (!session) {
    redirect('/auth/signin')
  }

  return <CategoriesPageClient />
}
