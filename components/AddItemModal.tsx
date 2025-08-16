'use client'

import { useState } from 'react'
import { X, Upload, Plus } from 'lucide-react'
import useSWR, { mutate } from 'swr'

interface Category {
  id: string
  name: string
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
  const [isLoading, setIsLoading] = useState(false)

  const { data: categories = [] } = useSWR<Category[]>('/api/categories')

  if (!isOpen) return null

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'quantity' || name === 'threshold' ? parseInt(value) || 0 : value
    }))
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const uploadImage = async (): Promise<string | null> => {
    if (!imageFile) return null

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
        return data.url
      } else {
        const errorData = await response.json()
        console.error('Upload failed:', errorData)
        throw new Error(errorData.error || 'Upload failed')
      }
    } catch (error) {
      console.error('Error uploading image:', error)
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
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Item Name *
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                  className="input mt-1"
                  placeholder="Enter item name"
                />
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
                <div>
                  <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">
                    Initial Quantity
                  </label>
                  <input
                    id="quantity"
                    name="quantity"
                    type="number"
                    min="0"
                    value={formData.quantity}
                    onChange={handleInputChange}
                    className="input mt-1"
                  />
                </div>

                <div>
                  <label htmlFor="threshold" className="block text-sm font-medium text-gray-700">
                    Low Stock Threshold
                  </label>
                  <input
                    id="threshold"
                    name="threshold"
                    type="number"
                    min="1"
                    value={formData.threshold}
                    onChange={handleInputChange}
                    className="input mt-1"
                  />
                </div>
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
                <label htmlFor="image" className="block text-sm font-medium text-gray-700">
                  Item Image
                </label>
                <div className="mt-1">
                  <input
                    id="image"
                    name="image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  <label
                    htmlFor="image"
                    className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Image
                  </label>
                </div>
                {imagePreview && (
                  <div className="mt-2">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="h-20 w-20 object-cover rounded-lg"
                    />
                  </div>
                )}
              </div>
            </form>
          </div>

          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="submit"
              onClick={handleSubmit}
              disabled={isLoading || !formData.name || !formData.categoryId}
              className="btn-primary w-full sm:w-auto sm:ml-3"
            >
              {isLoading ? (
                'Creating...'
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
