'use client'

import { useState } from 'react'
import useSWR from 'swr'
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline'

interface Category {
  id: string
  name: string
  description?: string
  createdAt: string
  updatedAt: string
}

interface AddCategoryModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  editingCategory?: Category | null
}

function AddCategoryModal({ isOpen, onClose, onSuccess, editingCategory }: AddCategoryModalProps) {
  const [formData, setFormData] = useState({
    name: editingCategory?.name || '',
    description: editingCategory?.description || ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const isEditing = !!editingCategory

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim()) return

    setIsLoading(true)
    setError('')

    try {
      const url = isEditing ? `/api/categories/${editingCategory.id}` : '/api/categories'
      const method = isEditing ? 'PATCH' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to save category')
      }

      onSuccess()
      onClose()
      setFormData({ name: '', description: '' })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    setFormData({ name: '', description: '' })
    setError('')
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-md">
        <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">
          {isEditing ? 'Edit Category' : 'Add New Category'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Category Name *
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
              placeholder="e.g., Pantry, Refrigerator"
              required
            />
          </div>
          
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description (Optional)
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
              placeholder="Brief description of this category"
              rows={2}
            />
          </div>

          {error && (
            <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md">
              {error}
            </div>
          )}

          <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 pt-3 sm:pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="w-full sm:w-auto px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors text-sm sm:text-base"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !formData.name.trim()}
              className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm sm:text-base"
            >
              {isLoading ? 'Saving...' : (isEditing ? 'Update' : 'Create')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function CategoryManagement() {
  const { data: categories = [], error, mutate } = useSWR<Category[]>('/api/categories')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleEdit = (category: Category) => {
    setEditingCategory(category)
    setIsAddModalOpen(true)
  }

  const handleDelete = async (categoryId: string) => {
    if (!confirm('Are you sure you want to delete this category? Items in this category will need to be reassigned.')) {
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch(`/api/categories/${categoryId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Failed to delete category')
      }

      mutate()
    } catch (error) {
      console.error('Error deleting category:', error)
      alert('Failed to delete category')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSuccess = () => {
    mutate()
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Failed to load categories</p>
        <button 
          onClick={() => mutate()} 
          className="mt-2 text-blue-600 hover:underline"
        >
          Try again
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Category Management</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">
            Organize your pantry items with custom categories
          </p>
        </div>
        <button
          onClick={() => {
            setEditingCategory(null)
            setIsAddModalOpen(true)
          }}
          className="inline-flex items-center px-3 py-2 sm:px-4 sm:py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm sm:text-base"
        >
          <PlusIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
          Add Category
        </button>
      </div>

      {/* Categories Grid */}
      {categories.length === 0 ? (
        <div className="text-center py-8 sm:py-12 bg-white rounded-lg border-2 border-dashed border-gray-300">
          <div className="text-gray-400 mb-3 sm:mb-4">
            <svg className="mx-auto h-8 w-8 sm:h-12 sm:w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">No categories yet</h3>
          <p className="text-sm sm:text-base text-gray-500 mb-3 sm:mb-4 px-4">
            Get started by creating your first category to organize your pantry items.
          </p>
          <button
            onClick={() => {
              setEditingCategory(null)
              setIsAddModalOpen(true)
            }}
            className="inline-flex items-center px-3 py-2 sm:px-4 sm:py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm sm:text-base"
          >
            <PlusIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
            Create Category
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
          {categories.map((category) => (
            <div
              key={category.id}
              className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4 md:p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-2 sm:mb-3 md:mb-4">
                <h3 className="text-sm sm:text-base md:text-lg font-semibold text-gray-900 truncate pr-2">{category.name}</h3>
                <div className="flex space-x-1 sm:space-x-2 flex-shrink-0">
                  <button
                    onClick={() => handleEdit(category)}
                    className="text-gray-400 hover:text-blue-600 transition-colors p-1"
                    title="Edit category"
                  >
                    <PencilIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(category.id)}
                    disabled={isLoading}
                    className="text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50 p-1"
                    title="Delete category"
                  >
                    <TrashIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                  </button>
                </div>
              </div>
              
              {category.description && (
                <p className="text-xs sm:text-sm text-gray-600 mb-2 sm:mb-3 md:mb-4 overflow-hidden text-ellipsis whitespace-nowrap">{category.description}</p>
              )}
              
              <div className="text-xs text-gray-400">
                Created {new Date(category.createdAt).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      <AddCategoryModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false)
          setEditingCategory(null)
        }}
        onSuccess={handleSuccess}
        editingCategory={editingCategory}
      />
    </div>
  )
}
