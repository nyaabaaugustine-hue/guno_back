'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { cn } from '@/lib/utils'
import { canManageStaff } from '@/lib/rbac'
import {
  LayoutDashboard, FileSearch, ClipboardCheck, Sparkles, LineChart, Users, Building2,
  Settings, Lightbulb, LogOut, ChevronsLeft, ChevronsRight, type LucideIcon
} from 'lucide-react'

export interface NavItem {
  label: string
  href: string
  icon: LucideIcon
}

export interface NavSection {
  title?: string
  items: NavItem[]
}

export const navSections: NavSection[] = [
  {
    title: 'Main',
    items: [
      { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
      { label: 'Preparer', href: '/preparer', icon: FileSearch },
      { label: 'Reviewer', href: '/reviewer', icon: ClipboardCheck },
      { label: 'Assistant', href: '/assistant', icon: Sparkles },
      { label: 'Advisor', href: '/advisor', icon: LineChart },
    ],
  },
  {
    title: 'Practice',
    items: [
      { label: 'Clients', href: '/clients', icon: Users },
      { label: 'Organization', href: '/organization', icon: Building2 },
    ],
  },
]

export const bottomItems: NavItem[] = [
  { label: 'Settings', href: '/settings', icon: Settings },
]

// Flat list for backward compatibility (derived from sections)
export const navItems: NavItem[] = navSections.flatMap(s => s.items).concat(bottomItems)

export const tipsItem: NavItem = { label: 'Tips & Limits', href: '/tips-limits', icon: Lightbulb }

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
}

function isActive(pathname: string, href: string): boolean {
  if (href === '/dashboard') {
    return pathname === '/dashboard' || pathname === '/'
  }
  return pathname === href || pathname.startsWith(href + '/')
}

function NavLink({ item, collapsed, pathname }: { item: NavItem; collapsed: boolean; pathname: string }) {
  const active = isActive(pathname, item.href)
  const Icon = item.icon

  return (
    <Link
      href={item.href}
      className={cn(
        'group/nav relative flex items-center gap-3 rounded-xl text-sm font-medium transition-all duration-200',
        collapsed ? 'justify-center px-0 py-3' : 'px-3.5 py-3',
        active
          ? 'bg-gradient-to-r from-juno-dark-green to-[#0B5C46] text-white shadow-md shadow-juno-dark-green/25'
          : 'text-dark-500 hover:bg-juno-mint hover:text-juno-dark-green'
      )}
    >
      {/* Active accent rail (expanded state) */}
      {active && !collapsed && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 h-5 w-1 rounded-r-full bg-juno-green" />
      )}

      <span
        className={cn(
          'flex items-center justify-center w-9 h-9 rounded-lg shrink-0 transition-all duration-200',
          active
            ? 'bg-white/15'
            : 'group-hover/nav:bg-white group-hover/nav:shadow-sm'
        )}
      >
        <Icon
          className={cn(
            'w-[17px] h-[17px] transition-transform duration-200',
            active ? 'text-white' : 'text-juno-accent group-hover/nav:scale-110'
          )}
        />
      </span>

      {!collapsed && <span className="truncate">{item.label}</span>}

      {/* Active dot (collapsed state) */}
      {active && collapsed && (
        <span className="absolute right-1 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-juno-green ring-2 ring-white" />
      )}

      {/* Flyout label on hover when collapsed — premium touch */}
      {collapsed && (
        <span className="pointer-events-none absolute left-full ml-3 whitespace-nowrap rounded-lg bg-dark-900 px-2.5 py-1.5 text-xs font-medium text-white opacity-0 shadow-lg shadow-dark-900/20 transition-all duration-150 group-hover/nav:opacity-100 group-hover/nav:translate-x-0 -translate-x-1 z-50">
          {item.label}
        </span>
      )}
    </Link>
  )
}

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { data: session } = useSession()

  const userName = session?.user?.name || 'User'
  const userRole = session?.user?.role || 'Member'
  const initials = userName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)

  // Organization (staff + company management) is admin-only. Other roles,
  // including Company Agent, don't see it in the nav at all.
  const visibleSections: NavSection[] = navSections.map((section) => ({
    ...section,
    items: section.items.filter((item) => item.href !== '/organization' || canManageStaff(userRole)),
  }))

  const handleSignOut = async () => {
    await signOut({ redirect: false })
    router.push('/auth/signin')
  }

  return (
    <aside
      className={cn(
        'relative h-full lg:h-screen bg-white border-r border-juno-border flex flex-col transition-[width] duration-300 ease-out',
        'shadow-[6px_0_24px_-12px_rgba(1,58,47,0.12)] lg:shadow-none',
        collapsed ? 'w-[76px]' : 'w-[260px]'
      )}
    >
      {/* ─── Logo ─── */}
      <div className="relative flex items-center h-[70px] px-4 border-b border-juno-border shrink-0">
        <Link
          href="/dashboard"
          className={cn(
            'flex items-center gap-2.5 group/logo',
            collapsed && 'mx-auto'
          )}
        >
          <span className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-juno-dark-green to-juno-accent shadow-md shadow-juno-dark-green/30 shrink-0 transition-transform duration-200 group-hover/logo:scale-105">
            <Sparkles className="w-4 h-4 text-white" strokeWidth={2.5} />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-juno-green ring-2 ring-white" />
          </span>
          {!collapsed && (
            <span className="font-extrabold text-lg text-dark-900 tracking-tight leading-none">
              JUNO<span className="text-juno-accent">.</span>
            </span>
          )}
        </Link>

        {!collapsed && (
          <button
            onClick={onToggle}
            className="ml-auto p-1.5 rounded-lg text-dark-400 hover:text-juno-dark-green hover:bg-juno-mint transition-colors"
            aria-label="Collapse sidebar"
          >
            <ChevronsLeft className="w-4 h-4" />
          </button>
        )}

        {/* Floating expand handle when collapsed, docked to the edge */}
        {collapsed && (
          <button
            onClick={onToggle}
            className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center rounded-full bg-white border border-juno-border text-dark-400 hover:text-juno-dark-green hover:border-juno-accent shadow-sm transition-colors"
            aria-label="Expand sidebar"
          >
            <ChevronsRight className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* ─── Navigation ─── fills full pane height, groups spread top → bottom */}
      <nav className="sidebar-scroll flex-1 flex flex-col justify-between py-6 px-3 overflow-y-auto overflow-x-hidden">
        {/* Primary groups ─ generously spaced */}
        <div className="flex flex-col gap-8">
          {visibleSections.map((section) => (
            section.items.length === 0 ? null : (
            <div key={section.title}>
              {!collapsed && section.title && (
                <p className="flex items-center gap-2 px-3.5 mb-2.5 text-[10.5px] font-bold uppercase tracking-[0.14em] text-dark-300">
                  <span className="w-3 h-[2px] rounded-full bg-juno-accent/50" />
                  {section.title}
                </p>
              )}
              <div className="space-y-2">
                {section.items.map((item) => (
                  <NavLink key={item.href} item={item} collapsed={collapsed} pathname={pathname} />
                ))}
              </div>
            </div>
            )
          ))}
        </div>

        {/* System group ─ anchored toward the bottom of the nav pane */}
        <div className="pt-5 mt-6 border-t border-dashed border-juno-border/80">
          {!collapsed && (
            <p className="flex items-center gap-2 px-3.5 mb-2.5 text-[10.5px] font-bold uppercase tracking-[0.14em] text-dark-300">
              <span className="w-3 h-[2px] rounded-full bg-juno-accent/50" />
              System
            </p>
          )}
          <div className="space-y-2">
            {bottomItems.map((item) => (
              <NavLink key={item.href} item={item} collapsed={collapsed} pathname={pathname} />
            ))}
          </div>
        </div>
      </nav>

      {/* ─── Tips & Limits ─── */}
      <div className="px-3 pb-3 shrink-0">
        <Link
          href={tipsItem.href}
          className={cn(
            'group/tips relative flex items-center gap-3 rounded-xl text-sm font-medium transition-all duration-200 overflow-hidden',
            collapsed ? 'justify-center px-0 py-2.5' : 'px-3.5 py-2.5',
            pathname === tipsItem.href
              ? 'bg-gradient-to-r from-juno-dark-green to-[#0B5C46] text-white shadow-md shadow-juno-dark-green/25'
              : 'bg-gradient-to-br from-juno-mint to-juno-light-green/60 text-juno-dark-green hover:from-juno-light-green hover:to-juno-light-green'
          )}
          title={collapsed ? tipsItem.label : undefined}
        >
          <span className="absolute inset-0 bg-white/0 group-hover/tips:bg-white/10 transition-colors" />
          <Lightbulb className="w-[18px] h-[18px] shrink-0 relative" />
          {!collapsed && <span className="relative">{tipsItem.label}</span>}
        </Link>
      </div>

      {/* ─── Account card ─── */}
      <div className="px-3 pb-4 pt-3 border-t border-juno-border shrink-0">
        <div
          className={cn(
            'flex items-center gap-2.5 rounded-xl transition-colors',
            collapsed ? 'justify-center' : 'px-2 py-1.5 hover:bg-dark-50'
          )}
        >
          <button
            onClick={() => router.push('/settings')}
            className="relative w-9 h-9 rounded-full bg-gradient-to-br from-juno-dark-green to-juno-accent flex items-center justify-center text-white text-xs font-bold shrink-0 ring-2 ring-white shadow-sm hover:scale-105 transition-transform"
            title="Profile & settings"
          >
            {initials || 'U'}
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-juno-green ring-2 ring-white" />
          </button>

          {!collapsed && (
            <>
              <div className="flex-1 min-w-0 text-left">
                <p className="text-sm font-semibold text-dark-900 truncate leading-tight">{userName}</p>
                <p className="text-[11px] text-dark-400 truncate leading-tight">{userRole}</p>
              </div>
              <button
                onClick={handleSignOut}
                className="p-2 rounded-lg text-dark-300 hover:text-red-600 hover:bg-red-50 transition-colors shrink-0"
                aria-label="Sign out"
                title="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </>
          )}
        </div>

        {collapsed && (
          <button
            onClick={handleSignOut}
            className="mt-2 w-full flex items-center justify-center p-2 rounded-lg text-dark-300 hover:text-red-600 hover:bg-red-50 transition-colors"
            aria-label="Sign out"
            title="Sign out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        )}
      </div>
    </aside>
  )
}
