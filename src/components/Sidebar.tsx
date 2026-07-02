'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { cn } from '@/lib/utils'
import {
  Gauge, FileEdit, CheckCheck, Bot, Star, Users, Building2, Settings,
  Lightbulb, LogOut, type LucideIcon
} from 'lucide-react'

interface NavItem {
  label: string
  href: string
  icon: LucideIcon
}

const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: Gauge },
  { label: 'Preparer', href: '/preparer', icon: FileEdit },
  { label: 'Reviewer', href: '/reviewer', icon: CheckCheck },
  { label: 'Assistant', href: '/assistant', icon: Bot },
  { label: 'Advisor', href: '/advisor', icon: Star },
  { label: 'Clients', href: '/clients', icon: Users },
  { label: 'Organization', href: '/organization', icon: Building2 },
  { label: 'Settings', href: '/settings', icon: Settings },
  { label: 'Tips & Limits', href: '/tips-limits', icon: Lightbulb },
]

interface SidebarProps {
  collapsed: boolean
}

export default function Sidebar({ collapsed }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()

  const handleSignOut = async () => {
    await signOut({ redirect: false })
    router.push('/auth/signin')
  }

  return (
    <aside
      className={`fixed left-0 top-0 h-full bg-white border-r border-dark-100 z-30 transition-all duration-300 flex flex-col ${
        collapsed ? 'w-16' : 'w-60'
      }`}
    >
      <div className="flex items-center h-16 px-4 border-b border-dark-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-juno-dark-green rounded-lg flex items-center justify-center shrink-0">
            <span className="text-white font-bold text-sm">J</span>
          </div>
          {!collapsed && <span className="font-bold text-lg text-dark-900 font-display">Juno</span>}
        </div>
      </div>

      <nav className="py-4 px-2 space-y-0.5">
        {navItems.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + '/')
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'group relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                active
                  ? 'bg-[#0B3D2E] text-white shadow-sm'
                  : 'text-dark-600 hover:text-dark-900 hover:bg-dark-50'
              )}
              title={collapsed ? item.label : undefined}
            >
              {active && <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-4 bg-[#1FAA6F] rounded-r-full" />}
              <Icon className={cn('w-[18px] h-[18px] shrink-0 transition-transform duration-200', !active && 'group-hover:scale-110')} />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          )
        })}
      </nav>

      <div className="flex-1 min-h-0" />

      <div className="px-3 pt-3 pb-3">
        <div className="border-t border-dark-100 -mx-3 -mt-3 mb-3" />
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 w-full px-3 py-3.5 rounded-lg text-sm font-medium text-dark-500 hover:text-red-600 hover:bg-red-50 transition-colors"
          title={collapsed ? 'Sign out' : undefined}
        >
          <LogOut className="w-5 h-5 shrink-0" />
          {!collapsed && <span>Sign out</span>}
        </button>
      </div>
    </aside>
  )
}
