'use client'

import { useState, useEffect } from 'react'
import { Outfit } from 'next/font/google'
import { SessionProvider } from 'next-auth/react'
import { usePathname } from 'next/navigation'
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
    <div className="min-h-screen">
      {/* Mobile overlay */}
      {mobileSidebar && (
        <div
          className="fixed inset-0 bg-dark-900/50 z-30 lg:hidden"
          onClick={() => setMobileSidebar(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-40 transition-all duration-300 ${
        mobileSidebar ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0 lg:static lg:inset-auto`}>
        <Sidebar collapsed={sidebarCollapsed} />
      </div>

      <DashboardHeader
        onMenuClick={() => setMobileSidebar(!mobileSidebar)}
        collapsed={sidebarCollapsed}
      />

      <main
        className={`pt-16 min-h-screen transition-all duration-300 ${
          sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-60'
        }`}
      >
        <div className="p-6 md:p-8">
          {children}
        </div>
      </main>

      {/* Floating AI Assistant - only on dashboard pages */}
      <FloatingAIButton />
    </div>
  )
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isAuthPage = pathname.startsWith('/auth/')
  const isProtectedPage = pathname.startsWith('/protected/')

  return (
    <SessionProvider>
      <html lang="en" className={outfit.className}>
        <body>
          {isAuthPage ? (
            <AuthLayout>{children}</AuthLayout>
          ) : isProtectedPage ? (
            children
          ) : (
            <AppShell>{children}</AppShell>
          )}
        </body>
      </html>
    </SessionProvider>
  )
}
