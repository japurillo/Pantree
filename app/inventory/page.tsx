import { redirect } from 'next/navigation'
import { auth } from '@clerk/nextjs/server'
import Inventory from '@/components/Inventory'

export default async function InventoryPage() {
  const { userId } = await auth()

  if (!userId) {
    redirect('/sign-in')
  }

  return <Inventory />
}
