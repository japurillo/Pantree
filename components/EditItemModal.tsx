'use client'

import { useState, useEffect } from 'react'
import { X, Save, Package, ChevronLeft, ChevronRight } from 'lucide-react'
import useSWR, { mutate } from 'swr'

interface Category {
  id: string
  name: string
}

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

interface EditItemModalProps {
  isOpen: boolean
  onClose: () => void
  item: Item | null
}

export default function EditItemModal({ isOpen, onClose, item }: EditItemModalProps) {
  const [formData, setFormData] = useState({
    quantity: 0,
    threshold: 1
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const { data: categories = [] } = useSWR<Category[]>('/api/categories')

  useEffect(() => {
    if (item) {
      setFormData({
        quantity: item.quantity,
        threshold: item.threshold
      })
    }
  }, [item])

  const handleQuantityDecrease = () => {
    if (formData.quantity > 0) {
      setFormData(prev => ({ ...prev, quantity: prev.quantity - 1 }))
    }
  }

  const handleQuantityIncrease = () => {
    setFormData(prev => ({ ...prev, quantity: prev.quantity + 1 }))
  }

  const handleThresholdDecrease = () => {
    if (formData.threshold > 1) {
      setFormData(prev => ({ ...prev, threshold: prev.threshold - 1 }))
    }
  }

  const handleThresholdIncrease = () => {
    setFormData(prev => ({ ...prev, threshold: prev.threshold + 1 }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!item) return

    setIsLoading(true)
    setError('')

    try {
      const response = await fetch(`/api/items/${item.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          quantity: parseInt(formData.quantity.toString()),
          threshold: parseInt(formData.threshold.toString())
        }),
      })

      if (response.ok) {
        // Refresh the items data
        mutate('/api/items')
        onClose()
      } else {
        const data = await response.json()
        setError(data.error || 'Failed to update item')
      }
    } catch (error) {
      setError('An error occurred while updating the item')
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen || !item) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div 
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Edit Item: {item.name}
              </h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Item Info */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                {item.imageUrl ? (
                  <img 
                    src={item.imageUrl} 
                    alt={item.name}
                    className="w-12 h-12 object-cover rounded-lg"
                  />
                ) : (
                  <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                    <Package className="h-6 w-6 text-gray-400" />
                  </div>
                )}
                <div>
                  <p className="font-medium text-gray-900">{item.name}</p>
                  <p className="text-sm text-gray-500">{item.category.name}</p>
                </div>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Quantity Stepper */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Current Quantity
                </label>
                
                <div className="flex items-center justify-center space-x-4">
                  <button
                    type="button"
                    onClick={handleQuantityDecrease}
                    disabled={formData.quantity <= 0}
                    className={`p-2 rounded-full transition-colors ${
                      formData.quantity <= 0
                        ? 'text-gray-300 cursor-not-allowed'
                        : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                    }`}
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </button>
                  
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary-600 min-w-[3rem]">
                      {formData.quantity}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      items in stock
                    </div>
                  </div>
                  
                  <button
                    type="button"
                    onClick={handleQuantityIncrease}
                    className="p-2 rounded-full transition-colors text-gray-600 hover:text-gray-800 hover:bg-gray-100"
                  >
                    <ChevronRight className="h-6 w-6" />
                  </button>
                </div>
              </div>

              {/* Threshold Stepper */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Low Stock Threshold
                </label>
                
                <div className="flex items-center justify-center space-x-4">
                  <button
                    type="button"
                    onClick={handleThresholdDecrease}
                    disabled={formData.threshold <= 1}
                    className={`p-2 rounded-full transition-colors ${
                      formData.threshold <= 1
                        ? 'text-gray-300 cursor-not-allowed'
                        : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                    }`}
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </button>
                  
                  <div className="text-center">
                    <div className="text-3xl font-bold text-orange-600 min-w-[3rem]">
                      {formData.threshold}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      minimum stock level
                    </div>
                  </div>
                  
                  <button
                    type="button"
                    onClick={handleThresholdIncrease}
                    className="p-2 rounded-full transition-colors text-gray-600 hover:text-gray-800 hover:bg-gray-100"
                  >
                    <ChevronRight className="h-6 w-6" />
                  </button>
                </div>
                
                <p className="text-xs text-gray-500 mt-3 text-center">
                  Item will be marked as "low stock" when quantity falls below this number
                </p>
              </div>

              {error && (
                <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md">
                  {error}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
