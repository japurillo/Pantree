'use client'

import { useState } from 'react'
import { X, Minus, ChevronLeft, ChevronRight } from 'lucide-react'
import useSWR, { mutate } from 'swr'

interface Item {
  id: string
  name: string
  quantity: number
  threshold: number
  category: {
    name: string
  }
}

interface ConsumeModalProps {
  isOpen: boolean
  item: Item | null
  onClose: () => void
}

export default function ConsumeModal({ isOpen, item, onClose }: ConsumeModalProps) {
  const [amount, setAmount] = useState(1)
  const [isLoading, setIsLoading] = useState(false)

  if (!isOpen || !item) return null

  const handleDecrease = () => {
    if (amount > 1) {
      setAmount(amount - 1)
    }
  }

  const handleIncrease = () => {
    if (amount < item.quantity) {
      setAmount(amount + 1)
    }
  }

  const handleConsume = async () => {
    if (amount <= 0 || amount > item.quantity) return

    setIsLoading(true)
    try {
      const response = await fetch(`/api/items/${item.id}/consume`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount }),
      })

      if (response.ok) {
        // Refresh the items list
        mutate('/api/items')
        onClose()
        setAmount(1)
      } else {
        const data = await response.json()
        alert(data.error || 'Failed to consume item')
      }
    } catch (error) {
      alert('An error occurred while consuming the item')
    } finally {
      setIsLoading(false)
    }
  }

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
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Consume Item
              </h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900">{item.name}</h4>
                <p className="text-sm text-gray-500">{item.category.name}</p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">
                    Current Quantity:
                  </span>
                  <span className="text-lg font-semibold text-gray-900">
                    {item.quantity}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Amount to consume:
                </label>
                
                {/* Number Stepper */}
                <div className="flex items-center justify-center space-x-4">
                  <button
                    type="button"
                    onClick={handleDecrease}
                    disabled={amount <= 1}
                    className={`p-2 rounded-full transition-colors ${
                      amount <= 1
                        ? 'text-gray-300 cursor-not-allowed'
                        : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                    }`}
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </button>
                  
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary-600 min-w-[3rem]">
                      {amount}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      of {item.quantity} available
                    </div>
                  </div>
                  
                  <button
                    type="button"
                    onClick={handleIncrease}
                    disabled={amount >= item.quantity}
                    className={`p-2 rounded-full transition-colors ${
                      amount >= item.quantity
                        ? 'text-gray-300 cursor-not-allowed'
                        : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                    }`}
                  >
                    <ChevronRight className="h-6 w-6" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              onClick={handleConsume}
              disabled={isLoading || amount <= 0 || amount > item.quantity}
              className="btn-success w-full sm:w-auto sm:ml-3"
            >
              {isLoading ? (
                'Consuming...'
              ) : (
                <>
                  <Minus className="h-4 w-4 mr-2" />
                  Consume {amount}
                </>
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary w-full sm:w-auto mt-3 sm:mt-0"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
