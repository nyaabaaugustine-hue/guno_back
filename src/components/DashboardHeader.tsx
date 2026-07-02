'use client'

import { useSession } from 'next-auth/react'
import Icon from '@/components/Icon'

interface DashboardHeaderProps {
  onMenuClick: () => void
  collapsed: boolean
}

export default function DashboardHeader({ onMenuClick, collapsed }: DashboardHeaderProps) {
  const { data: session } = useSession()
  const userName = session?.user?.name || 'User'
  const userRole = session?.user?.role || 'User'
  const initials = userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)

  return (
    <header
      className={`fixed top-0 right-0 h-16 bg-white border-b border-dark-100 z-20 flex items-center justify-between px-6 transition-all duration-300 ${
        collapsed ? 'left-16' : 'left-60'
      }`}
    >
      <div className="flex items-center gap-4">          <button onClick={onMenuClick} className="p-2 text-dark-500 hover:text-dark-900 rounded-lg hover:bg-dark-50 transition-colors lg:hidden">
          <Icon name="menu" className="w-5 h-5" />
        </button>
        <div className="relative hidden sm:block">
          <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
          <input
            type="text"
            placeholder="Search..."
            className="w-64 pl-9 pr-4 py-2 rounded-lg border border-dark-200 bg-dark-50 text-sm text-dark-900 placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-juno-green/20 focus:border-juno-green transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button className="relative p-2 text-dark-500 hover:text-dark-900 rounded-lg hover:bg-dark-50 transition-colors">
          <Icon name="bell" className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>
        <div className="flex items-center gap-3 pl-3 border-l border-dark-100">
          <div className="w-8 h-8 bg-juno-dark-green rounded-full flex items-center justify-center text-white text-xs font-semibold">
            {initials}
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-dark-900">{userName}</p>
            <p className="text-xs text-dark-500">{userRole}</p>
          </div>
        </div>
      </div>
    </header>
  )
}
