'use client'

import { useMemo } from 'react'
import { AlertTriangle, Package } from 'lucide-react'
import useSWR from 'swr'

interface Item {
  id: string
  name: string
  quantity: number
  threshold: number
  category: {
    name: string
  }
}

export default function LowStockOverview() {
  const { data: items = [], error } = useSWR<Item[]>('/api/items')

  const lowStockItems = useMemo(() => {
    return items.filter(item => item.quantity <= item.threshold)
  }, [items])

  const outOfStockItems = useMemo(() => {
    return items.filter(item => item.quantity === 0)
  }, [items])

  if (error) {
    return (
      <div className="card">
        <div className="text-center text-gray-500">
          Error loading inventory data
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-3 gap-3 sm:gap-4 md:gap-6">
      {/* Total Items */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4 md:p-6">
        <div className="flex items-center">
          <div className="p-2 sm:p-3 rounded-lg bg-blue-500">
            <Package className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-white" />
          </div>
          <div className="ml-2 sm:ml-3 md:ml-4">
            <p className="text-xs sm:text-sm font-medium text-gray-600">Total Items</p>
            <p className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-900">{items.length}</p>
          </div>
        </div>
      </div>

      {/* Low Stock Items */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4 md:p-6">
        <div className="flex items-center">
          <div className="p-2 sm:p-3 rounded-lg bg-orange-500">
            <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-white" />
          </div>
          <div className="ml-2 sm:ml-3 md:ml-4">
            <p className="text-xs sm:text-sm font-medium text-gray-600">Low Stock</p>
            <p className="text-lg sm:text-xl md:text-2xl font-semibold text-orange-600">{lowStockItems.length}</p>
          </div>
        </div>
        {lowStockItems.length > 0 && (
          <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-gray-500">
            {outOfStockItems.length} out of stock
          </p>
        )}
      </div>

      {/* Status */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4 md:p-6">
        <div className="flex items-center">
          <div className={`p-2 sm:p-3 rounded-lg ${
            lowStockItems.length === 0 ? 'bg-green-500' : 'bg-red-500'
          }`}>
            <div className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-white flex items-center justify-center text-xs sm:text-sm md:text-base">
              {lowStockItems.length === 0 ? '✓' : '!'}
            </div>
          </div>
          <div className="ml-2 sm:ml-3 md:ml-4">
            <p className="text-xs sm:text-sm font-medium text-gray-600">Status</p>
            <p className={`text-sm sm:text-base md:text-lg font-semibold ${
              lowStockItems.length === 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {lowStockItems.length === 0 ? 'All Good' : 'Action Needed'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
