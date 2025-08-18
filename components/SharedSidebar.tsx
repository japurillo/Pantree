'use client'

import { useSession } from 'next-auth/react'
import { Package, Users, BarChart3, Settings, FolderOpen } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface SharedSidebarProps {
  currentPage: 'dashboard' | 'inventory' | 'analytics' | 'users' | 'categories' | 'settings'
  onClose: () => void
}

export default function SharedSidebar({ currentPage, onClose }: SharedSidebarProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const isAdmin = session?.user?.role === 'ADMIN'

  const handleNavigation = (path: string) => {
    router.push(path)
    onClose()
  }

  const getButtonClass = (page: string) => {
    return currentPage === page
      ? 'w-full flex items-center px-3 py-2 text-sm font-medium rounded-md bg-primary-100 text-primary-700'
      : 'w-full flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900'
  }

  return (
    <nav className="mt-8 px-4">
      <div className="space-y-2">
        <button
          onClick={() => handleNavigation('/dashboard')}
          className={getButtonClass('dashboard')}
        >
          <BarChart3 className="mr-3 h-5 w-5" />
          Dashboard
        </button>

        <button
          onClick={() => handleNavigation('/inventory')}
          className={getButtonClass('inventory')}
        >
          <Package className="mr-3 h-5 w-5" />
          Inventory
        </button>

        <button
          onClick={() => handleNavigation('/analytics')}
          className={getButtonClass('analytics')}
        >
          <BarChart3 className="mr-3 h-5 w-5" />
          Analytics
        </button>

        {isAdmin && (
          <button
            onClick={() => handleNavigation('/users')}
            className={getButtonClass('users')}
          >
            <Users className="mr-3 h-5 w-5" />
            User Management
          </button>
        )}

        <button
          onClick={() => handleNavigation('/categories')}
          className={getButtonClass('categories')}
        >
          <FolderOpen className="mr-3 h-5 w-5" />
          Categories
        </button>

        <button
          onClick={() => handleNavigation('/settings')}
          className={getButtonClass('settings')}
        >
          <Settings className="mr-3 h-5 w-5" />
          Settings
        </button>
      </div>
    </nav>
  )
}
