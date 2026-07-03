'use client'

import { useState, useEffect } from 'react'
import { Outfit } from 'next/font/google'
import { SessionProvider } from 'next-auth/react'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import Sidebar from '@/components/Sidebar'
import DashboardHeader from '@/components/DashboardHeader'
import FloatingAIButton from '@/components/FloatingAIButton'
import '@/styles/globals.css'

const outfit = Outfit({
  subsets: ['latin'],
  display: 'swap',
})

function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-dark-50">
      {children}
    </div>
  )
}

// ─── App shell ────────────────────────────────────────────────────
// Sidebar and main content are children of ONE flex row, so the
// sidebar always reserves its own column and content simply starts
// after it — no manual margin/left-offset math to keep in sync.
function AppShell({ children }: { children: React.ReactNode }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileSidebar, setMobileSidebar] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 1024px)')
    setSidebarCollapsed(mq.matches)
    const handler = (e: MediaQueryListEvent) => setSidebarCollapsed(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  return (
    <div className="flex min-h-screen bg-dark-50">
      {/* Mobile overlay — dims content while the drawer is open */}
      {mobileSidebar && (
        <div
          className="fixed inset-0 bg-dark-900/50 z-40 lg:hidden"
          onClick={() => setMobileSidebar(false)}
        />
      )}

      {/* ── Sidebar column ──────────────────────────────────────
          Desktop (lg+): a normal flex child — reserves real space,
          sticky so it stays put while content scrolls.
          Mobile: a fixed off-canvas drawer, slid in/out. */}
      <div
        className={cn(
          'z-50 lg:z-30 shrink-0 transition-all duration-300 ease-out',
          'fixed inset-y-0 left-0 lg:sticky lg:top-0 lg:h-screen',
          mobileSidebar ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
      </div>

      {/* ── Main column ──────────────────────────────────────────
          Fills the remaining width automatically (flex-1). Header
          and content live in the SAME column, so they always share
          identical horizontal alignment. */}
      <div className="flex-1 min-w-0 flex flex-col min-h-screen">
        <DashboardHeader
          onMenuClick={() => setMobileSidebar(!mobileSidebar)}
        />

        <main className="flex-1">
          <div className="p-6 md:p-8">
            {children}
          </div>
        </main>
      </div>

      {/* Floating AI Assistant */}
      <FloatingAIButton />
    </div>
  )
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isAuthPage = pathname.startsWith('/auth/')

  return (
    <SessionProvider>
      <html lang="en" className={outfit.className}>
        <body>
          {isAuthPage ? (
            <AuthLayout>{children}</AuthLayout>
          ) : (
            <AppShell>{children}</AppShell>
          )}
        </body>
      </html>
    </SessionProvider>
  )
}
