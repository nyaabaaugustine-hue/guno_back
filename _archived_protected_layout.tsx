'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { cn } from '@/lib/utils'
import {
  Gauge, ClipboardEdit, SearchCheck, Sparkles, ChartNoAxesCombined,
  UserRound, Building2, Settings, ChevronDown, LogOut, Menu, X,
  ChevronRight, HelpCircle, CreditCard, type LucideIcon
} from 'lucide-react'

interface NavItem {
  label: string
  href: string
  icon: LucideIcon
  badge?: string
}

const primaryNav: NavItem[] = [
  { label: 'Dashboard', href: '/protected/taxPreparation', icon: Gauge },
  { label: 'Preparer', href: '/protected/taxPreparation/preparer', icon: ClipboardEdit },
  { label: 'Reviewer', href: '/protected/taxPreparation/reviewer', icon: SearchCheck },
  { label: 'Clients', href: '/protected/taxPreparation/clients', icon: UserRound },
]

const secondaryNav: NavItem[] = [
  { label: 'AI Assistant', href: '#', icon: Sparkles, badge: 'New' },
  { label: 'Reports', href: '#', icon: ChartNoAxesCombined },
]

const tertiaryNav: NavItem[] = [
  { label: 'Organization', href: '#', icon: Building2 },
  { label: 'Settings', href: '#', icon: Settings },
]

export default function TaxPreparationLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { data: session } = useSession()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const userName = session?.user?.name || 'User'
  const userEmail = session?.user?.email || 'user@example.com'
  const initials = userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)

  const handleSignOut = async () => {
    await signOut({ redirect: false })
    router.push('/auth/signin')
  }

  return (
    <div className="min-h-screen bg-[#F7F9F8]">
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/30 z-40 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      <aside className={cn(
        'fixed top-0 left-0 h-full w-[260px] bg-white border-r border-[#E5E7E5] z-50 flex flex-col transition-transform duration-300',
        mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      )}>
        <div className="flex items-center gap-3 h-[70px] px-6 border-b border-[#E5E7E5] shrink-0">
          <div className="w-8 h-8 bg-[#0B3D2E] rounded-xl flex items-center justify-center shadow-sm">
            <span className="text-white font-bold text-sm tracking-tight">J</span>
          </div>
          <div className="flex flex-col leading-tight">
            <span className="font-bold text-base text-[#1A1D1B] tracking-tight">Juno</span>
            <span className="text-[10px] text-[#6B7280] font-medium tracking-wide uppercase">Tax Suite</span>
          </div>
          <button className="lg:hidden ml-auto p-1 text-[#0B3D2E]" onClick={() => setMobileOpen(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 py-5 px-4 space-y-5 overflow-y-auto">
          {/* Primary */}
          <div className="space-y-0.5">
            <p className="px-4 text-[10px] font-semibold text-[#9CA3AF] uppercase tracking-widest">Main</p>
            <div className="mt-2 space-y-0.5">
              {primaryNav.map((item) => {
                const active = pathname === item.href
                const Icon = item.icon
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={cn(
                      'group relative flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                      active
                        ? 'bg-[#0B3D2E] text-white shadow-md shadow-[#0B3D2E]/15'
                        : 'text-[#6B7280] hover:bg-[#E8F5E8] hover:text-[#0B3D2E]'
                    )}
                  >
                    {active && <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-[#1FAA6F] rounded-r-full" />}
                    <Icon className={cn('w-[18px] h-[18px] transition-all duration-200', active ? 'text-white' : 'text-[#1FAA6F] group-hover:scale-110')} />
                    <span>{item.label}</span>
                  </Link>
                )
              })}
            </div>
          </div>

          {/* Secondary */}
          <div className="space-y-0.5">
            <p className="px-4 text-[10px] font-semibold text-[#9CA3AF] uppercase tracking-widest">Insights</p>
            <div className="mt-2 space-y-0.5">
              {secondaryNav.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="group relative flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-[#6B7280] hover:bg-[#E8F5E8] hover:text-[#0B3D2E] transition-all duration-200"
                >
                  <item.icon className="w-[18px] h-[18px] text-[#1FAA6F] group-hover:scale-110 transition-all duration-200" />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="ml-auto text-[10px] font-semibold text-white bg-[#1FAA6F] px-2 py-0.5 rounded-full">{item.badge}</span>
                  )}
                </Link>
              ))}
            </div>
          </div>

          {/* Tertiary */}
          <div className="space-y-0.5">
            <p className="px-4 text-[10px] font-semibold text-[#9CA3AF] uppercase tracking-widest">Workspace</p>
            <div className="mt-2 space-y-0.5">
              {tertiaryNav.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="group relative flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-[#6B7280] hover:bg-[#E8F5E8] hover:text-[#0B3D2E] transition-all duration-200"
                >
                  <item.icon className="w-[18px] h-[18px] text-[#1FAA6F] group-hover:scale-110 transition-all duration-200" />
                  <span>{item.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </nav>

        <div className="px-3 pb-3">
          <div className="bg-[#E8F5E8] rounded-2xl p-4">
            <HelpCircle className="w-6 h-6 text-[#0B3D2E] mb-2" />
            <p className="text-sm font-semibold text-[#0B3D2E]">Tips & Guides</p>
            <p className="text-xs text-[#0B3D2E]/70 mt-1">Learn how to get the most out of Juno</p>
            <Link href="#" className="inline-flex items-center gap-1 text-xs font-medium text-[#0B3D2E] mt-2 hover:underline">
              View guides <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        <div className="px-3 pb-4">
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 w-full px-4 py-2.5 rounded-full text-sm font-medium text-[#6B7280] hover:text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Sign out
          </button>
        </div>
      </aside>

      <div className="lg:ml-[260px] min-h-screen flex flex-col">
        <header className="h-[70px] bg-white border-b border-[#E5E7E5] flex items-center px-6 gap-4 shrink-0">
          <button className={cn('lg:hidden p-2 rounded-lg transition-colors', mobileOpen ? 'text-[#0B3D2E] bg-[#E8F5E8]' : 'text-[#6B7280] hover:text-[#1A1D1B]')} onClick={() => setMobileOpen(!mobileOpen)}>
            <Menu className="w-5 h-5" />
          </button>

          <h1 className="text-xl font-bold text-[#1A1D1B]">
            {[...primaryNav, ...secondaryNav, ...tertiaryNav].find(i => pathname === i.href)?.label || 'Tax Preparation'}
          </h1>

          <div className="hidden md:flex items-center gap-2 ml-auto mr-auto bg-[#E8F5E8] rounded-full px-4 py-1.5">
            <span className="text-sm text-[#0B3D2E] font-medium">5 Free Projects Remaining</span>
            <span className="text-[#0B3D2E]/40 mx-1">·</span>
            <span className="text-sm text-[#0B3D2E]">3 Days Left</span>
            <button className="ml-2 text-sm font-semibold text-white bg-[#0B3D2E] px-3 py-0.5 rounded-full hover:bg-[#1FAA6F] transition-colors">
              Upgrade Plan
            </button>
          </div>

          <div className="relative ml-auto" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2.5 p-1.5 rounded-full hover:bg-[#F7F9F8] transition-colors"
            >
              <div className="w-8 h-8 bg-[#0B3D2E] rounded-full flex items-center justify-center text-white text-xs font-semibold">
                {initials}
              </div>
              <span className="hidden sm:block text-sm font-medium text-[#1A1D1B]">{userName}</span>
              <ChevronDown className={cn('w-4 h-4 text-[#6B7280] transition-transform duration-200', dropdownOpen && 'rotate-180')} />
            </button>
            {dropdownOpen && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl border border-[#E5E7E5] shadow-lg py-2 z-50">
                <div className="px-4 py-2 border-b border-[#E5E7E5]">
                  <p className="text-sm font-medium text-[#1A1D1B]">{userName}</p>
                  <p className="text-xs text-[#6B7280]">{userEmail}</p>
                </div>
                <Link href="/settings" className="block px-4 py-2 text-sm text-[#6B7280] hover:bg-[#F7F9F8] hover:text-[#1A1D1B]">Settings</Link>
                <button onClick={handleSignOut} className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50">Sign out</button>
              </div>
            )}
          </div>
        </header>

        <main className="flex-1 p-6 md:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
