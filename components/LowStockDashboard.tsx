'use client'

import { useMemo } from 'react'
import { AlertTriangle, Package } from 'lucide-react'
import { useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { Id } from '@/convex/_generated/dataModel'
import { useSession } from 'next-auth/react'

export default function LowStockDashboard() {
  const { data: session } = useSession()
  const userId = session?.user?.id as Id<"users"> | undefined
  const items = useQuery(api.items.listItems, userId ? { userId } : "skip") ?? []

  const lowStockItems = useMemo(() => {
    return items.filter(item => item.quantity <= item.threshold)
  }, [items])

  if (items === undefined) {
    return (
      <div className="card">
        <div className="text-center text-gray-500">
          Loading items...
        </div>
      </div>
    )
  }

  if (lowStockItems.length === 0) {
    return (
      <div className="card">
        <div className="text-center text-gray-500">
          <Package className="h-12 w-12 mx-auto text-gray-300 mb-4" />
          <p className="text-lg font-medium">All items are well stocked!</p>
          <p className="text-sm">No items are below their threshold.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="card">
      <div className="flex items-center mb-4">
        <AlertTriangle className="h-5 w-5 text-warning-500 mr-2" />
        <h3 className="text-lg font-semibold text-gray-900">
          Low Stock Alert ({lowStockItems.length})
        </h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {lowStockItems.map((item) => (
          <div
            key={item.id}
            className="bg-warning-50 border border-warning-200 rounded-lg p-4"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="font-medium text-warning-900">{item.name}</h4>
                <p className="text-sm text-warning-700">{item.category.name}</p>
                <div className="mt-2 flex items-center space-x-2">
                  <span className="text-sm text-warning-600">
                    Current: {item.quantity}
                  </span>
                  <span className="text-sm text-warning-600">
                    Threshold: {item.threshold}
                  </span>
                </div>
              </div>
              <div className="ml-4">
                {item.quantity === 0 ? (
                  <span className="badge-danger">Out of Stock</span>
                ) : (
                  <span className="badge-warning">Low Stock</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
