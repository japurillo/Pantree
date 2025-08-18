'use client'

import { useState } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { Package, Users, LogOut, Menu, X, BarChart3, Settings, ArrowLeft, FolderOpen } from 'lucide-react'
import { useRouter } from 'next/navigation'
import LowStockOverview from './LowStockOverview'
import PantryList from './PantryList'

export default function Dashboard() {
  const { data: session } = useSession()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const router = useRouter()

  const isAdmin = session?.user?.role === 'ADMIN'

  const handleSignOut = () => {
    signOut({ callbackUrl: '/auth/signin' })
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
              <h1 className="text-xl font-semibold text-gray-900 ml-2 lg:ml-0">
                PanTree Dashboard
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
                className="w-full flex items-center px-3 py-2 text-sm font-medium rounded-md bg-primary-100 text-primary-700"
              >
                <BarChart3 className="mr-3 h-5 w-5" />
                Dashboard
              </button>

              <button
                onClick={() => {
                  router.push('/inventory')
                  setSidebarOpen(false)
                }}
                className="w-full flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900"
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
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Welcome to PanTree</h2>
                <p className="mt-2 text-gray-600">
                  Click on any item card below to consume it. Use the sidebar to navigate to other sections.
                </p>
              </div>

              {/* Low Stock Overview */}
              <LowStockOverview />

              {/* Pantry Items - Clickable Cards */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Pantry Items</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Click on any item card to consume it
                </p>
                <PantryList />
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
