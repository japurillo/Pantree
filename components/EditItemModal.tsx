'use client'

import { useState, useEffect } from 'react'
import { X, Save, Package, ChevronLeft, ChevronRight, Camera, Edit3 } from 'lucide-react'
import useSWR, { mutate } from 'swr'
import ImageUpload from './ui/ImageUpload'

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
  const [isEditingImage, setIsEditingImage] = useState(false)
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const [isImageOptimizing, setIsImageOptimizing] = useState(false)
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null)
  const [imageRemoved, setImageRemoved] = useState(false)

  const { data: categories = [] } = useSWR<Category[]>('/api/categories')

  useEffect(() => {
    if (item) {
      setFormData({
        quantity: item.quantity,
        threshold: item.threshold
      })
      setCurrentImageUrl(item.imageUrl || null)
      setImageRemoved(false)
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

  const handleImageSelect = (file: File) => {
    setSelectedImage(file)
  }

  const handleImageRemove = () => {
    setSelectedImage(null)
    setCurrentImageUrl(null)
    setImageRemoved(true)
  }

  const extractPublicIdFromUrl = (url: string): string | null => {
    if (!url || !url.includes('cloudinary.com')) {
      return null
    }
    
    try {
      const urlParts = url.split('/')
      const uploadIndex = urlParts.findIndex(part => part === 'upload')
      if (uploadIndex === -1 || uploadIndex + 2 >= urlParts.length) {
        return null
      }
      
      const publicIdParts = urlParts.slice(uploadIndex + 2)
      const publicId = publicIdParts.join('/').split('.')[0] // Remove file extension
      
      return publicId
    } catch (error) {
      console.error('Error extracting public ID:', error)
      return null
    }
  }

  const deleteImageFromCloudinary = async (imageUrl: string) => {
    try {
      // Extract public ID from Cloudinary URL using the same logic as the API
      const publicId = extractPublicIdFromUrl(imageUrl)
      
      if (!publicId) {
        throw new Error('Invalid Cloudinary URL - could not extract public ID')
      }
      
      const response = await fetch('/api/items/delete-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ publicId })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(`Failed to delete image from Cloudinary: ${errorData.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Error deleting image from Cloudinary:', error)
      throw error
    }
  }

  const handleImageEdit = () => {
    setIsEditingImage(true)
  }

  const handleImageEditCancel = () => {
    setIsEditingImage(false)
    setSelectedImage(null)
    setImageRemoved(false)
    // Reset to original image
    setCurrentImageUrl(item?.imageUrl || null)
  }

  const uploadImage = async (file: File): Promise<string> => {
    console.log('EditItemModal: Starting image upload for file:', file.name, 'Size:', file.size, 'bytes')
    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      })

      if (response.ok) {
        const data = await response.json()
        console.log('EditItemModal: Image upload successful:', data.url)
        return data.url
      } else {
        const errorData = await response.json()
        console.error('EditItemModal: Upload failed:', errorData)
        throw new Error(errorData.error || 'Upload failed')
      }
    } catch (error) {
      console.error('EditItemModal: Error uploading image:', error)
      throw error
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!item) return

    setIsLoading(true)
    setError('')

    try {
      let imageUrl: string | null = item.imageUrl || null

      // Handle image changes
      if (selectedImage) {
        // Upload new image
        setIsUploadingImage(true)
        try {
          imageUrl = await uploadImage(selectedImage)
        } catch (error) {
          setError(error instanceof Error ? error.message : 'Failed to upload image')
          setIsLoading(false)
          setIsUploadingImage(false)
          return
        }
        setIsUploadingImage(false)
      } else if (imageRemoved && item.imageUrl) {
        // Image was removed - delete from Cloudinary and set to null
        try {
          await deleteImageFromCloudinary(item.imageUrl)
          imageUrl = null
        } catch (error) {
          console.error('Failed to delete image from Cloudinary:', error)
          // Continue with the update even if Cloudinary deletion fails
          imageUrl = null
        }
      }

      const response = await fetch(`/api/items/${item.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          quantity: parseInt(formData.quantity.toString()),
          threshold: parseInt(formData.threshold.toString()),
          imageUrl: imageUrl
        }),
      })

      if (response.ok) {
        // Update the local image URL to show the new image immediately
        if (selectedImage && imageUrl) {
          setCurrentImageUrl(imageUrl)
        } else if (imageRemoved) {
          setCurrentImageUrl(null)
        }
        
        // Reset states
        setImageRemoved(false)
        setSelectedImage(null)
        
        // Refresh the items data
        mutate('/api/items')
        onClose()
      } else {
        const data = await response.json()
        setError(data.error || 'Failed to update item')
      }
    } catch (error) {
      console.error('Error updating item:', error)
      setError(error instanceof Error ? error.message : 'An error occurred while updating the item')
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
                <div className="relative group">
                  {currentImageUrl ? (
                    <img 
                      src={currentImageUrl} 
                      alt={item.name}
                      className="w-12 h-12 object-cover rounded-lg"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                      <Package className="h-6 w-6 text-gray-400" />
                    </div>
                  )}
                  {/* Edit Image Overlay */}
                  <button
                    onClick={handleImageEdit}
                    className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                    title="Edit image"
                  >
                    <Edit3 className="h-4 w-4 text-white" />
                  </button>
                </div>
                <div>
                  <p className="font-medium text-gray-900">{item.name}</p>
                  <p className="text-sm text-gray-500">{item.category.name}</p>
                </div>
              </div>
            </div>

            {/* Image Editing Section */}
            {isEditingImage && (
              <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-medium text-blue-900 flex items-center">
                    <Camera className="h-4 w-4 mr-2" />
                    Edit Item Image
                  </h4>
                  <button
                    type="button"
                    onClick={handleImageEditCancel}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    Cancel
                  </button>
                </div>
                <ImageUpload
                  onImageSelect={handleImageSelect}
                  onImageRemove={handleImageRemove}
                  selectedImage={selectedImage ? URL.createObjectURL(selectedImage) : currentImageUrl}
                  className="max-w-sm"
                  autoOptimize={true}
                  onOptimizationStart={() => setIsImageOptimizing(true)}
                  onOptimizationComplete={() => setIsImageOptimizing(false)}
                />
              </div>
            )}

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
                  disabled={isLoading || isUploadingImage || isImageOptimizing}
                  className="px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {isLoading || isUploadingImage || isImageOptimizing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>
                        {isImageOptimizing ? 'Optimizing image...' : 
                         isUploadingImage ? 'Uploading image...' : 'Saving...'}
                      </span>
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
