'use client'

import { useState } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { 
  Package, 
  Users, 
  LogOut, 
  Menu, 
  X, 
  BarChart3, 
  Settings, 
  ArrowLeft, 
  FolderOpen,
  TrendingUp,
  DollarSign,
  Calendar,
  Target,
  Zap,
  Star,
  Clock,
  ShoppingCart,
  PieChart,
  Activity
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import useSWR from 'swr'

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

export default function Analytics() {
  const { data: session } = useSession()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const router = useRouter()
  const isAdmin = session?.user?.role === 'ADMIN'

  const { data: items = [] } = useSWR<Item[]>('/api/items')
  const { data: categories = [] } = useSWR<Category[]>('/api/categories')

  const handleSignOut = () => {
    signOut({ callbackUrl: '/auth/signin' })
  }

  // Mock analytics data for demonstration
  const mockData = {
    totalItems: items.length,
    totalCategories: categories.length,
    monthlySavings: 127.50,
    itemsConsumed: 23,
    shoppingTrips: 4,
    wasteReduction: 78,
    topCategory: categories[0]?.name || 'Pantry',
    avgItemCost: 8.45
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
                Analytics & Insights
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
              <X className="h-6 w-6" />
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
                className="w-full flex items-center px-3 py-2 text-sm font-medium rounded-md bg-primary-100 text-primary-700"
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
            </div>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-4 sm:p-6 lg:p-8">
          {/* Hero Section */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Transform Your Pantry into a Profit Center
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl">
              Unlock the hidden insights in your pantry data. Discover spending patterns, 
              optimize shopping habits, and turn food waste into savings with Pantree's 
              powerful analytics engine.
            </p>
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Package className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Items</p>
                  <p className="text-2xl font-bold text-gray-900">{mockData.totalItems}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Monthly Savings</p>
                  <p className="text-2xl font-bold text-gray-900">${mockData.monthlySavings}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Waste Reduction</p>
                  <p className="text-2xl font-bold text-gray-900">{mockData.wasteReduction}%</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <div className="flex items-center">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <ShoppingCart className="h-6 w-6 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Shopping Trips</p>
                  <p className="text-2xl font-bold text-gray-900">{mockData.shoppingTrips}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Coming Soon Section */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 mb-8 text-center text-white">
            <div className="max-w-4xl mx-auto">
              <div className="mb-6">
                <Zap className="h-16 w-16 mx-auto text-yellow-300 mb-4" />
                <h3 className="text-4xl font-bold mb-4">
                  🚀 Coming Soon...
                </h3>
                <p className="text-xl text-blue-100 mb-6">
                  Advanced analytics that will revolutionize how you think about your pantry
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
                <div className="bg-white/10 rounded-lg p-6 backdrop-blur-sm">
                  <Target className="h-8 w-8 text-yellow-300 mb-3" />
                  <h4 className="text-lg font-semibold mb-2">Predictive Analytics</h4>
                  <p className="text-blue-100 text-sm">
                    AI-powered insights that predict when you'll run out of items and suggest optimal shopping times
                  </p>
                </div>
                
                <div className="bg-white/10 rounded-lg p-6 backdrop-blur-sm">
                  <PieChart className="h-8 w-8 text-yellow-300 mb-3" />
                  <h4 className="text-lg font-semibold mb-2">Spending Intelligence</h4>
                  <p className="text-blue-100 text-sm">
                    Deep dive into your grocery spending patterns with category breakdowns and cost optimization
                  </p>
                </div>
                
                <div className="bg-white/10 rounded-lg p-6 backdrop-blur-sm">
                  <Activity className="h-8 w-8 text-yellow-300 mb-3" />
                  <h4 className="text-lg font-semibold mb-2">Consumption Tracking</h4>
                  <p className="text-blue-100 text-sm">
                    Real-time monitoring of how quickly you use items with personalized recommendations
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Current Insights */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Top Categories */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <FolderOpen className="h-5 w-5 mr-2 text-blue-600" />
                Top Categories
              </h3>
              <div className="space-y-3">
                {categories.slice(0, 5).map((category, index) => (
                  <div key={category.id} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`w-3 h-3 rounded-full mr-3 ${
                        index === 0 ? 'bg-yellow-400' : 
                        index === 1 ? 'bg-gray-400' : 
                        index === 2 ? 'bg-orange-400' : 'bg-blue-400'
                      }`} />
                      <span className="text-gray-700">{category.name}</span>
                    </div>
                    <span className="text-sm text-gray-500">
                      {Math.floor(Math.random() * 20) + 5} items
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Clock className="h-5 w-5 mr-2 text-green-600" />
                Recent Activity
              </h3>
              <div className="space-y-3">
                <div className="flex items-center text-sm">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3" />
                  <span className="text-gray-600">Added 3 items to inventory</span>
                  <span className="ml-auto text-gray-400">2h ago</span>
                </div>
                <div className="flex items-center text-sm">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-3" />
                  <span className="text-gray-600">Updated rice quantity</span>
                  <span className="ml-auto text-gray-400">4h ago</span>
                </div>
                <div className="flex items-center text-sm">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mr-3" />
                  <span className="text-gray-600">Created new category</span>
                  <span className="ml-auto text-gray-400">1d ago</span>
                </div>
                <div className="flex items-center text-sm">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mr-3" />
                  <span className="text-gray-600">Consumed milk</span>
                  <span className="ml-auto text-gray-400">1d ago</span>
                </div>
              </div>
            </div>
          </div>

          {/* Call to Action */}
          <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-200 text-center">
            <Star className="h-12 w-12 mx-auto text-yellow-400 mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Ready to Unlock Your Pantry's Full Potential?
            </h3>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Join thousands of families who are already saving money and reducing waste 
              with Pantree's intelligent pantry management system.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => router.push('/inventory')}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Explore Inventory
              </button>
              <button
                onClick={() => router.push('/categories')}
                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
              >
                Manage Categories
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
