'use client'

import { useState, useMemo } from 'react'
import { Search, Filter } from 'lucide-react'
import useSWR from 'swr'
import InventoryItem from './InventoryItem'

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

interface Category {
  id: string
  name: string
}

interface InventoryListProps {
  onEditItem: (item: Item) => void
}

export default function InventoryList({ onEditItem }: InventoryListProps) {
  const { data: items = [], error } = useSWR<Item[]>('/api/items')
  const { data: categories = [] } = useSWR<Category[]>('/api/categories')
  
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  // Sort items by stock level (lowest first) - Option B: relative to threshold
  const sortedAndFilteredItems = useMemo(() => {
    return items
      .filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (item.notes && item.notes.toLowerCase().includes(searchTerm.toLowerCase()))
        const matchesCategory = selectedCategory === 'all' || item.category.id === selectedCategory
        
        return matchesSearch && matchesCategory
      })
      .sort((a, b) => {
        // Calculate stock level relative to threshold (lower = more urgent)
        const aStockLevel = a.quantity / a.threshold
        const bStockLevel = b.quantity / b.threshold
        
        // Sort by stock level (lowest first)
        if (aStockLevel !== bStockLevel) {
          return aStockLevel - bStockLevel
        }
        
        // If same stock level, sort by absolute quantity (lowest first)
        return a.quantity - b.quantity
      })
  }, [items, searchTerm, selectedCategory])

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
    <div className="space-y-6">
      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
        
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none bg-white"
          >
            <option value="all">All Categories</option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Results Count and Sort Info */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <div className="text-sm text-gray-600">
          {sortedAndFilteredItems.length} of {items.length} items
        </div>
        <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
          Sorted by stock level (lowest first)
        </div>
      </div>

      {/* Items Grid */}
      {sortedAndFilteredItems.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Search className="h-12 w-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No items found</h3>
          <p className="text-gray-500">
            {searchTerm || selectedCategory !== 'all' 
              ? 'Try adjusting your search or filter criteria'
              : 'Add some items to get started'
            }
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
          {sortedAndFilteredItems.map(item => (
            <InventoryItem 
              key={item.id} 
              item={item} 
              onEdit={onEditItem}
            />
          ))}
        </div>
      )}
    </div>
  )
}
