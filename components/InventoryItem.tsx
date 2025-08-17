'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Package, AlertTriangle, Edit } from 'lucide-react'

interface Item {
  id: string
  name: string
  quantity: number
  threshold: number
  imageUrl?: string
  notes?: string
  category: {
    id: string
    name: string
  }
}

interface InventoryItemProps {
  item: Item
  onEdit: (item: Item) => void
}

export default function InventoryItem({ item, onEdit }: InventoryItemProps) {
  const isLowStock = item.quantity <= item.threshold
  const isOutOfStock = item.quantity === 0

  const handleCardClick = () => {
    onEdit(item)
  }

  return (
    <button
      onClick={handleCardClick}
      className="group relative bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4 hover:shadow-md transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer"
    >
      {/* Image */}
      <div className="relative w-full h-24 sm:h-28 md:h-32 mb-2 sm:mb-3 rounded-lg overflow-hidden bg-gray-100">
        {item.imageUrl ? (
          <Image
            src={item.imageUrl}
            alt={item.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-200"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 text-gray-400" />
          </div>
        )}
        
        {/* Quantity Badge */}
        <div className="absolute top-1 sm:top-2 right-1 sm:right-2">
          <span className={`inline-flex items-center px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-xs font-medium ${
            isOutOfStock
              ? 'bg-red-100 text-red-800'
              : isLowStock
              ? 'bg-orange-100 text-orange-800'
              : 'bg-green-100 text-green-800'
          }`}>
            {isOutOfStock ? 'Out of Stock' : `${item.quantity} left`}
          </span>
        </div>

        {/* Low Stock Warning */}
        {isLowStock && !isOutOfStock && (
          <div className="absolute top-1 sm:top-2 left-1 sm:left-2">
            <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-orange-500" />
          </div>
        )}

        {/* Edit Icon */}
        <div className="absolute bottom-1 sm:bottom-2 right-1 sm:right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="bg-white bg-opacity-90 p-1 rounded-full">
            <Edit className="h-4 w-4 text-primary-600" />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="text-left">
        <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-primary-600 transition-colors text-sm sm:text-base">
          {item.name}
        </h3>
        
        <div className="flex items-center justify-between mb-1 sm:mb-2">
          <span className="text-xs sm:text-sm text-gray-500 bg-gray-100 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full">
            {item.category.name}
          </span>
          
          {isLowStock && !isOutOfStock && (
            <span className="text-xs text-orange-600">
              Threshold: {item.threshold}
            </span>
          )}
        </div>

        {item.notes && (
          <p className="text-xs sm:text-sm text-gray-600 line-clamp-2">
            {item.notes}
          </p>
        )}


      </div>
    </button>
  )
}
