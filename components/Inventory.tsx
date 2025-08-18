'use client'

import { useState } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { Plus, Package, Users, LogOut, Menu, X, ArrowLeft, BarChart3, Settings, FolderOpen, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { mutate } from 'swr'

import InventoryList from './InventoryList'
import EditItemModal from './EditItemModal'
import AddItemModal from './AddItemModal'

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

export default function Inventory() {
  const { data: session } = useSession()
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedItem, setSelectedItem] = useState<Item | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const router = useRouter()

  const isAdmin = session?.user?.role === 'ADMIN'

  const handleSignOut = () => {
    signOut({ callbackUrl: '/auth/signin' })
  }

  const handleEditItem = (item: Item) => {
    setSelectedItem(item)
    setShowEditModal(true)
  }

  const handleCloseEditModal = () => {
    setShowEditModal(false)
    setSelectedItem(null)
  }

  const handleDeleteItem = (item: Item) => {
    setSelectedItem(item)
    setShowDeleteModal(true)
  }

  const confirmDelete = async () => {
    if (!selectedItem) return

    try {
      const response = await fetch(`/api/items/${selectedItem.id}`, {
        method: 'DELETE',
        credentials: 'include'
      })

      if (response.ok) {
        // Optimistically update the UI by removing the item from the cache
        mutate('/api/items', (currentItems: Item[] = []) => 
          currentItems.filter(i => i.id !== selectedItem.id)
        )
        setShowDeleteModal(false)
        setSelectedItem(null)
      } else {
        const error = await response.json()
        alert(`Failed to delete item: ${error.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Error deleting item:', error)
      alert('Failed to delete item. Please try again.')
    }
  }

  const cancelDelete = () => {
    setShowDeleteModal(false)
    setSelectedItem(null)
  }



  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
              >
                <Menu className="h-6 w-6" />
              </button>
              <button
                onClick={() => router.push('/dashboard')}
                className="p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-md mr-2"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <h1 className="text-xl font-semibold text-gray-900">
                Inventory Management
              </h1>
            </div>

            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">
                Welcome, {session?.user?.username}
              </span>
              <button
                onClick={handleSignOut}
                className="p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-md"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>
          <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Navigation</h2>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <nav className="mt-8 px-4">
            <div className="space-y-2">
              <button
                onClick={() => {
                  router.push('/dashboard')
                  setSidebarOpen(false)
                }}
                className="w-full flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              >
                <BarChart3 className="mr-3 h-5 w-5" />
                Dashboard
              </button>

              <button
                onClick={() => {
                  router.push('/inventory')
                  setSidebarOpen(false)
                }}
                className="w-full flex items-center px-3 py-2 text-sm font-medium rounded-md bg-primary-100 text-primary-700"
              >
                <Package className="mr-3 h-5 w-5" />
                Inventory
              </button>

              <button
                onClick={() => {
                  router.push('/categories')
                  setSidebarOpen(false)
                }}
                className="w-full flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              >
                <FolderOpen className="mr-3 h-5 w-5" />
                Categories
              </button>

              <button
                onClick={() => {
                  router.push('/analytics')
                  setSidebarOpen(false)
                }}
                className="w-full flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              >
                <BarChart3 className="mr-3 h-5 w-5" />
                Analytics
              </button>

              {isAdmin && (
                <button
                  onClick={() => {
                    router.push('/users')
                    setSidebarOpen(false)
                  }}
                  className="w-full flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                >
                  <Users className="mr-3 h-5 w-5" />
                  User Management
                </button>
              )}

              <button
                onClick={() => {
                  router.push('/settings')
                  setSidebarOpen(false)
                }}
                className="w-full flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              >
                <Settings className="mr-3 h-5 w-5" />
                Settings
              </button>
            </div>
          </nav>
        </div>

        {/* Main content */}
        <div className="flex-1 lg:ml-0">
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="space-y-8">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Inventory Management</h2>
                  <p className="mt-2 text-gray-600">
                    Manage your pantry items and categories. Click on any item card to edit its stock levels and thresholds, or use the delete button to remove items.
                  </p>
                </div>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="btn-primary"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Item
                </button>
              </div>





              {/* All Inventory Items */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">All Inventory Items</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Items are sorted by stock level (lowest first). Click any card to edit quantity and threshold, or use the delete button to remove items.
                </p>
                <InventoryList onEditItem={handleEditItem} onDeleteItem={handleDeleteItem} />
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* Add Item Modal */}
      <AddItemModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
      />

      {/* Edit Item Modal */}
      <EditItemModal
        isOpen={showEditModal}
        onClose={handleCloseEditModal}
        item={selectedItem}
      />

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedItem && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <Trash2 className="h-6 w-6 text-red-600" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Delete Item
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Are you sure you want to delete <span className="font-medium text-gray-900">"{selectedItem.name}"</span>? 
                        This action cannot be undone.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={confirmDelete}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Delete
                </button>
                <button
                  type="button"
                  onClick={cancelDelete}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
