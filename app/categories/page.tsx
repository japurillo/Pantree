import { redirect } from 'next/navigation'
import { auth } from '@clerk/nextjs/server'
import CategoriesPageClient from '@/components/CategoriesPageClient'

export default async function CategoriesPage() {
  const { userId } = await auth()

  if (!userId) {
    redirect('/sign-in')
  }

  return <CategoriesPageClient />
}
