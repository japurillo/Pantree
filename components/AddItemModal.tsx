'use client'

import { useState, useEffect, useRef } from 'react'
import { X, Plus, Search, Package } from 'lucide-react'
import useSWR, { mutate } from 'swr'
import ImageUpload from './ui/ImageUpload'
import NumberStepper from './ui/NumberStepper'

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
  description?: string
  notes?: string
  category: {
    id: string
    name: string
  }
}

interface AddItemModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function AddItemModal({ isOpen, onClose }: AddItemModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    quantity: 0,
    threshold: 1,
    notes: '',
    categoryId: ''
  })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>('')
  const [isImageOptimizing, setIsImageOptimizing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [filteredSuggestions, setFilteredSuggestions] = useState<Item[]>([])
  const nameInputRef = useRef<HTMLInputElement>(null)

  const { data: categories = [] } = useSWR<Category[]>('/api/categories')
  const { data: existingItems = [] } = useSWR<Item[]>('/api/items')

  if (!isOpen) return null

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'quantity' || name === 'threshold' ? parseInt(value) || 0 : value
    }))

    // Handle name search suggestions
    if (name === 'name') {
      if (value.trim().length > 0) {
        const filtered = existingItems.filter(item => 
          item.name.toLowerCase().includes(value.toLowerCase())
        )
        setFilteredSuggestions(filtered)
        setShowSuggestions(filtered.length > 0)
      } else {
        setShowSuggestions(false)
        setFilteredSuggestions([])
      }
    }
  }

  const handleSuggestionClick = (item: Item) => {
    setFormData(prev => ({
      ...prev,
      name: item.name,
      categoryId: item.category.id,
      description: item.description || '',
      notes: item.notes || ''
    }))
    setShowSuggestions(false)
    setFilteredSuggestions([])
  }

  const handleNameInputFocus = () => {
    if (formData.name.trim().length > 0 && filteredSuggestions.length > 0) {
      setShowSuggestions(true)
    }
  }

  const handleNameInputBlur = () => {
    // Delay hiding suggestions to allow clicking on them
    setTimeout(() => {
      setShowSuggestions(false)
    }, 200)
  }



  const uploadImage = async (): Promise<string | null> => {
    if (!imageFile) return null

    console.log('AddItemModal: Starting image upload for file:', imageFile.name, 'Size:', imageFile.size, 'bytes')
    const formData = new FormData()
    formData.append('file', imageFile)

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      })

      if (response.ok) {
        const data = await response.json()
        console.log('AddItemModal: Image upload successful:', data.url)
        return data.url
      } else {
        const errorData = await response.json()
        console.error('AddItemModal: Upload failed:', errorData)
        throw new Error(errorData.error || 'Upload failed')
      }
    } catch (error) {
      console.error('AddItemModal: Error uploading image:', error)
      throw error
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.categoryId) return

    setIsLoading(true)
    try {
      let imageUrl = null
      if (imageFile) {
        imageUrl = await uploadImage()
      }

      const response = await fetch('/api/items', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          imageUrl,
        }),
      })

      if (response.ok) {
        mutate('/api/items')
        onClose()
        resetForm()
      } else {
        const data = await response.json()
        alert(data.error || 'Failed to create item')
      }
    } catch (error) {
      console.error('Error creating item:', error)
      alert(error instanceof Error ? error.message : 'An error occurred while creating the item')
    } finally {
      setIsLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      quantity: 0,
      threshold: 1,
      notes: '',
      categoryId: ''
    })
    setImageFile(null)
    setImagePreview('')
    setShowSuggestions(false)
    setFilteredSuggestions([])
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
                Add New Item
              </h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Item Name *
                </label>
                <input
                  ref={nameInputRef}
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                  onFocus={handleNameInputFocus}
                  onBlur={handleNameInputBlur}
                  className="input mt-1"
                  placeholder="Enter item name"
                />
                
                {/* Search Suggestions Dropdown */}
                {showSuggestions && filteredSuggestions.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
                    <div className="p-2 border-b border-gray-100">
                      <div className="text-xs text-gray-500 font-medium">
                        Existing items ({filteredSuggestions.length})
                      </div>
                    </div>
                    {filteredSuggestions.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleSuggestionClick(item)}
                        className="w-full text-left p-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="flex-shrink-0">
                            {item.imageUrl ? (
                              <img
                                src={item.imageUrl}
                                alt={item.name}
                                className="w-8 h-8 rounded object-cover"
                              />
                            ) : (
                              <div className="w-8 h-8 rounded bg-gray-100 flex items-center justify-center">
                                <Package className="h-4 w-4 text-gray-400" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-gray-900 truncate">
                              {item.name}
                            </div>
                            <div className="text-xs text-gray-500">
                              {item.category.name} • {item.quantity} in stock
                            </div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700">
                  Category *
                </label>
                <select
                  id="categoryId"
                  name="categoryId"
                  required
                  value={formData.categoryId}
                  onChange={handleInputChange}
                  className="input mt-1"
                >
                  <option value="">Select a category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={3}
                  value={formData.description}
                  onChange={handleInputChange}
                  className="input mt-1"
                  placeholder="Enter item description"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <NumberStepper
                  label="Initial Quantity"
                  value={formData.quantity}
                  onChange={(value) => setFormData(prev => ({ ...prev, quantity: value }))}
                  min={0}
                  max={999}
                  step={1}
                />

                <NumberStepper
                  label="Low Stock Threshold"
                  value={formData.threshold}
                  onChange={(value) => setFormData(prev => ({ ...prev, threshold: value }))}
                  min={1}
                  max={999}
                  step={1}
                />
              </div>

              <div>
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                  Notes
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  rows={2}
                  value={formData.notes}
                  onChange={handleInputChange}
                  className="input mt-1"
                  placeholder="Any additional notes"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Item Image
                </label>
                <ImageUpload
                  onImageSelect={(file) => {
                    console.log('AddItemModal: Image selected:', file.name, 'Size:', file.size, 'bytes')
                    setImageFile(file)
                    const reader = new FileReader()
                    reader.onloadend = () => {
                      setImagePreview(reader.result as string)
                    }
                    reader.readAsDataURL(file)
                  }}
                  onImageRemove={() => {
                    setImageFile(null)
                    setImagePreview('')
                  }}
                  selectedImage={imagePreview}
                  autoOptimize={true}
                  onOptimizationStart={() => setIsImageOptimizing(true)}
                  onOptimizationComplete={() => setIsImageOptimizing(false)}
                />
              </div>
            </form>
          </div>

          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="submit"
              onClick={handleSubmit}
              disabled={isLoading || !formData.name || !formData.categoryId || isImageOptimizing}
              className="btn-primary w-full sm:w-auto sm:ml-3"
            >
              {isLoading ? (
                'Creating...'
              ) : isImageOptimizing ? (
                'Optimizing Image...'
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Item
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
