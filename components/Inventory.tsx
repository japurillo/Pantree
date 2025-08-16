'use client'

import { useState } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { Plus, Package, Users, LogOut, Menu, X, ArrowLeft, BarChart3, Settings, FolderOpen } from 'lucide-react'
import { useRouter } from 'next/navigation'
import LowStockDashboard from './LowStockDashboard'
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

  const managementCards = [
    {
      title: 'Low Stock Alerts',
      description: 'View items that need restocking',
      icon: Package,
      color: 'bg-orange-500',
      action: () => router.push('/')
    },
    {
      title: 'Categories',
      description: 'Manage item categories',
      icon: Package,
      color: 'bg-blue-500',
      action: () => router.push('/categories')
    },
    {
      title: 'Analytics',
      description: 'View consumption patterns',
      icon: BarChart3,
      color: 'bg-purple-500',
      action: () => router.push('/analytics')
    }
  ]

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
                onClick={() => router.push('/')}
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
                  router.push('/')
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
                    Manage your pantry items, categories, and view detailed analytics. Click on any item card to edit its stock levels.
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

              {/* Management Cards */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {managementCards.map((card, index) => {
                    const IconComponent = card.icon
                    return (
                      <button
                        key={index}
                        onClick={card.action}
                        className="group relative bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <div className={`p-3 rounded-lg ${card.color}`}>
                            <IconComponent className="h-6 w-6 text-white" />
                          </div>
                        </div>
                        
                        <h4 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
                          {card.title}
                        </h4>
                        
                        <p className="text-sm text-gray-600">
                          {card.description}
                        </p>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Low Stock Dashboard */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Low Stock Alerts</h3>
                <LowStockDashboard />
              </div>

              {/* All Inventory Items */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">All Inventory Items</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Items are sorted by stock level (lowest first). Click any card to edit quantity and threshold.
                </p>
                <InventoryList onEditItem={handleEditItem} />
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
    </div>
  )
}
