'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Menu, Search, Bell, User, Settings, LogOut } from 'lucide-react'

interface DashboardHeaderProps {
  onMenuClick: () => void
}

export default function DashboardHeader({ onMenuClick }: DashboardHeaderProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [searchFocused, setSearchFocused] = useState(false)
  const userMenuRef = useRef<HTMLDivElement>(null)

  const userName = session?.user?.name || 'User'
  const userRole = session?.user?.role || 'User'
  const initials = userName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)

  // Close user menu on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false)
      }
    }
    if (userMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [userMenuOpen])

  // Keyboard shortcut: Ctrl/Cmd + K to focus search
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        const input = document.querySelector<HTMLInputElement>('[data-search-input]')
        input?.focus()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  const handleSignOut = async () => {
    setUserMenuOpen(false)
    await signOut({ redirect: false })
    router.push('/auth/signin')
  }

  return (
    <header
      className="sticky top-0 z-20 h-16 w-full bg-white/90 backdrop-blur-md border-b border-dark-100 flex items-center justify-between px-4 md:px-6 shrink-0"
    >
      {/* ─── Left side: Menu + Search ─── */}
      <div className="flex items-center gap-3 md:gap-4 flex-1 min-w-0">
        <button
          onClick={onMenuClick}
          className="p-2 text-dark-400 hover:text-dark-900 rounded-lg hover:bg-dark-100 transition-colors lg:hidden"
          aria-label="Toggle menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className={cn(
          'relative flex-1 max-w-md transition-all duration-200',
          searchFocused ? 'max-w-lg' : ''
        )}>
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400 pointer-events-none" />
          <input
            data-search-input
            type="text"
            placeholder="Search clients, returns, documents..."
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            className={cn(
              'w-full pl-9 pr-16 py-2 rounded-lg border bg-dark-50 text-sm text-dark-900 placeholder-dark-400 outline-none transition-all',
              searchFocused
                ? 'border-juno-accent ring-2 ring-juno-accent/10 shadow-sm'
                : 'border-dark-200 hover:border-dark-300'
            )}
          />
          {/* Keyboard shortcut badge */}
          <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-mono font-medium text-dark-400 bg-white border border-dark-200 shadow-sm">
            <span className="text-[9px]">⌘</span>K
          </kbd>
        </div>
      </div>

      {/* ─── Right side: Notifications + User ─── */}
      <div className="flex items-center gap-2 md:gap-3 shrink-0">
        {/* Notification bell */}
        <button className="relative p-2 text-dark-400 hover:text-dark-900 rounded-lg hover:bg-dark-100 transition-colors" aria-label="Notifications">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white" />
        </button>

        {/* User avatar with dropdown */}
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className={cn(
              'flex items-center gap-2 md:gap-3 pl-3 ml-1 border-l border-dark-100 transition-all',
              userMenuOpen ? 'opacity-90' : 'hover:opacity-80'
            )}
            aria-label="User menu"
            aria-expanded={userMenuOpen}
          >
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium text-dark-900 leading-tight">{userName}</p>
              <p className="text-[11px] text-dark-400 leading-tight">{userRole}</p>
            </div>
            <div className="w-8 h-8 bg-juno-dark-green rounded-full flex items-center justify-center text-white text-xs font-semibold ring-2 ring-white shadow-sm">
              {initials}
            </div>
          </button>

          {/* Dropdown menu */}
          {userMenuOpen && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl border border-dark-100 shadow-xl shadow-dark-900/5 py-1.5 z-50">
              {/* User info */}
              <div className="px-4 py-3 border-b border-dark-100">
                <p className="text-sm font-semibold text-dark-900">{userName}</p>
                <p className="text-xs text-dark-400 mt-0.5">{session?.user?.email || ''}</p>
              </div>

              {/* Menu items */}
              <div className="py-1">
                <Link
                  href="/settings"
                  onClick={() => setUserMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-dark-600 hover:bg-dark-50 hover:text-dark-900 transition-colors"
                >
                  <User className="w-4 h-4 text-dark-400" />
                  Profile & Settings
                </Link>
                <Link
                  href="/organization"
                  onClick={() => setUserMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-dark-600 hover:bg-dark-50 hover:text-dark-900 transition-colors"
                >
                  <Settings className="w-4 h-4 text-dark-400" />
                  Organization
                </Link>
              </div>

              {/* Sign out */}
              <div className="border-t border-dark-100 pt-1">
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
