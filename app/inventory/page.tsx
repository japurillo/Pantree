import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import Inventory from '@/components/Inventory'

export default async function InventoryPage() {
  const session = await getServerSession()

  if (!session) {
    redirect('/auth/signin')
  }

  return <Inventory />
}
