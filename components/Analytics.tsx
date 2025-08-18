'use client'

import { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { motion } from 'framer-motion'
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
  const [isLoaded, setIsLoaded] = useState(false)
  const router = useRouter()
  const isAdmin = session?.user?.role === 'ADMIN'

  const { data: items = [] } = useSWR<Item[]>('/api/items')
  const { data: categories = [] } = useSWR<Category[]>('/api/categories')

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 100)
    return () => clearTimeout(timer)
  }, [])

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
                className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 transition-colors"
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
              className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 transition-colors"
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
          <motion.div 
            className="mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <motion.h2 
              className="text-3xl font-bold text-gray-900 mb-4"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              Transform Your Pantry into a Profit Center
            </motion.h2>
            <motion.p 
              className="text-lg text-gray-600 max-w-3xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              Unlock the hidden insights in your pantry data. Discover spending patterns, 
              optimize shopping habits, and turn food waste into savings with Pantree's 
              powerful analytics engine.
            </motion.p>
          </motion.div>

          {/* Key Metrics Grid */}
          <motion.div 
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            {[
              {
                icon: Package,
                iconBg: 'bg-blue-100',
                iconColor: 'text-blue-600',
                label: 'Total Items',
                value: mockData.totalItems,
                delay: 0.6
              },
              {
                icon: DollarSign,
                iconBg: 'bg-green-100',
                iconColor: 'text-green-600',
                label: 'Monthly Savings',
                value: `$${mockData.monthlySavings}`,
                delay: 0.7
              },
              {
                icon: TrendingUp,
                iconBg: 'bg-purple-100',
                iconColor: 'text-purple-600',
                label: 'Waste Reduction',
                value: `${mockData.wasteReduction}%`,
                delay: 0.8
              },
              {
                icon: ShoppingCart,
                iconBg: 'bg-orange-100',
                iconColor: 'text-orange-600',
                label: 'Shopping Trips',
                value: mockData.shoppingTrips,
                delay: 0.9
              }
            ].map((metric, index) => (
              <motion.div 
                key={index}
                className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:shadow-md transition-all duration-200"
                initial={{ opacity: 0, y: 30, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.5, delay: metric.delay }}
                whileHover={{ scale: 1.02, y: -5 }}
              >
                <div className="flex items-center">
                  <motion.div 
                    className={`p-2 ${metric.iconBg} rounded-lg`}
                    whileHover={{ rotate: 5, scale: 1.1 }}
                    transition={{ duration: 0.2 }}
                  >
                    <metric.icon className={`h-6 w-6 ${metric.iconColor}`} />
                  </motion.div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">{metric.label}</p>
                    <motion.p 
                      className="text-2xl font-bold text-gray-900"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: metric.delay + 0.2, duration: 0.4 }}
                    >
                      {metric.value}
                    </motion.p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Coming Soon Section */}
          <motion.div 
            className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 mb-8 text-center text-white"
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6, delay: 1.0 }}
            whileHover={{ scale: 1.01 }}
          >
            <div className="max-w-4xl mx-auto">
              <motion.div 
                className="mb-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1.1 }}
              >
                <motion.div
                  whileHover={{ rotate: 360, scale: 1.1 }}
                  transition={{ duration: 0.6, ease: "easeInOut" }}
                >
                  <Zap className="h-16 w-16 mx-auto text-yellow-300 mb-4" />
                </motion.div>
                <motion.h3 
                  className="text-4xl font-bold mb-4"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: 1.2 }}
                >
                  🚀 Coming Soon...
                </motion.h3>
                <motion.p 
                  className="text-xl text-blue-100 mb-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 1.3 }}
                >
                  Advanced analytics that will revolutionize how you think about your pantry
                </motion.p>
              </motion.div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
                {[
                  {
                    icon: Target,
                    title: 'Predictive Analytics',
                    description: 'AI-powered insights that predict when you\'ll run out of items and suggest optimal shopping times'
                  },
                  {
                    icon: PieChart,
                    title: 'Spending Intelligence',
                    description: 'Deep dive into your grocery spending patterns with category breakdowns and cost optimization'
                  },
                  {
                    icon: Activity,
                    title: 'Consumption Tracking',
                    description: 'Real-time monitoring of how quickly you use items with personalized recommendations'
                  }
                ].map((feature, index) => (
                  <motion.div 
                    key={index}
                    className="bg-white/10 rounded-lg p-6 backdrop-blur-sm hover:bg-white/20 transition-colors duration-200"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 1.4 + index * 0.1 }}
                    whileHover={{ scale: 1.05, y: -5 }}
                  >
                    <motion.div
                      whileHover={{ rotate: 5, scale: 1.1 }}
                      transition={{ duration: 0.2 }}
                    >
                      <feature.icon className="h-8 w-8 text-yellow-300 mb-3" />
                    </motion.div>
                    <h4 className="text-lg font-semibold mb-2">{feature.title}</h4>
                    <p className="text-blue-100 text-sm">{feature.description}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Current Insights */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Top Categories */}
            <motion.div 
              className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow duration-200"
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.6, delay: 1.6 }}
              whileHover={{ scale: 1.01 }}
            >
              <motion.h3 
                className="text-lg font-semibold text-gray-900 mb-4 flex items-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 1.7 }}
              >
                <motion.div
                  whileHover={{ rotate: 5, scale: 1.1 }}
                  transition={{ duration: 0.2 }}
                >
                  <FolderOpen className="h-5 w-5 mr-2 text-blue-600" />
                </motion.div>
                Top Categories
              </motion.h3>
              <div className="space-y-3">
                {categories.slice(0, 5).map((category, index) => (
                  <motion.div 
                    key={category.id} 
                    className="flex items-center justify-between hover:bg-gray-50 p-2 rounded-lg transition-colors duration-200"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 1.8 + index * 0.1 }}
                    whileHover={{ x: 5, scale: 1.02 }}
                  >
                    <div className="flex items-center">
                      <motion.div 
                        className={`w-3 h-3 rounded-full mr-3 ${
                          index === 0 ? 'bg-yellow-400' : 
                          index === 1 ? 'bg-gray-400' : 
                          index === 2 ? 'bg-orange-400' : 'bg-blue-400'
                        }`}
                        whileHover={{ scale: 1.5 }}
                        transition={{ duration: 0.2 }}
                      />
                      <span className="text-gray-700">{category.name}</span>
                    </div>
                    <span className="text-sm text-gray-500">
                      {Math.floor(Math.random() * 20) + 5} items
                    </span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Recent Activity */}
            <motion.div 
              className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow duration-200"
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.6, delay: 1.7 }}
              whileHover={{ scale: 1.01 }}
            >
              <motion.h3 
                className="text-lg font-semibold text-gray-900 mb-4 flex items-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 1.8 }}
              >
                <motion.div
                  whileHover={{ rotate: 5, scale: 1.1 }}
                  transition={{ duration: 0.2 }}
                >
                  <Clock className="h-5 w-5 mr-2 text-green-600" />
                </motion.div>
                Recent Activity
              </motion.h3>
              <div className="space-y-3">
                {[
                  { color: 'bg-green-500', text: 'Added 3 items to inventory', time: '2h ago' },
                  { color: 'bg-blue-500', text: 'Updated rice quantity', time: '4h ago' },
                  { color: 'bg-orange-500', text: 'Created new category', time: '1d ago' },
                  { color: 'bg-purple-500', text: 'Consumed milk', time: '1d ago' }
                ].map((activity, index) => (
                  <motion.div 
                    key={index}
                    className="flex items-center text-sm hover:bg-gray-50 p-2 rounded-lg transition-colors duration-200"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 1.9 + index * 0.1 }}
                    whileHover={{ x: 5, scale: 1.02 }}
                  >
                    <motion.div 
                      className={`w-2 h-2 ${activity.color} rounded-full mr-3`}
                      whileHover={{ scale: 1.5 }}
                      transition={{ duration: 0.2 }}
                    />
                    <span className="text-gray-600">{activity.text}</span>
                    <span className="ml-auto text-gray-400">{activity.time}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Call to Action */}
          <motion.div 
            className="bg-white rounded-xl shadow-sm p-8 border border-gray-200 text-center hover:shadow-md transition-shadow duration-200"
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6, delay: 2.0 }}
            whileHover={{ scale: 1.01 }}
          >
            <motion.div
              whileHover={{ rotate: 360, scale: 1.1 }}
              transition={{ duration: 0.6, ease: "easeInOut" }}
            >
              <Star className="h-12 w-12 mx-auto text-yellow-400 mb-4" />
            </motion.div>
            <motion.h3 
              className="text-2xl font-bold text-gray-900 mb-4"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 2.1 }}
            >
              Ready to Unlock Your Pantry's Full Potential?
            </motion.h3>
            <motion.p 
              className="text-gray-600 mb-6 max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 2.2 }}
            >
              Join thousands of families who are already saving money and reducing waste 
              with Pantree's intelligent pantry management system.
            </motion.p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button
                onClick={() => router.push('/inventory')}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                Explore Inventory
              </motion.button>
              <motion.button
                onClick={() => router.push('/categories')}
                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                Manage Categories
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
