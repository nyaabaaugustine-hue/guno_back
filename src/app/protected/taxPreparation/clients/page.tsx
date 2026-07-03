'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { cn } from '@/lib/utils'
import {
  Search, Plus, User, Mail, ChevronLeft, ChevronRight, ChevronDown,
  FileText, Loader2, Clock, Users, UserPlus, Phone, CalendarDays,
  LogOut, Settings, Shield, ArrowUpRight
} from 'lucide-react'

interface ClientItem {
  id: string; initials: string; name: string; email: string
  phone: string; returnCount: number; documentCount: number; created: string
}

export default function ClientsPage() {
  const { data: session } = useSession()
  const [search, setSearch] = useState('')
  const [clients, setClients] = useState<ClientItem[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const perPage = 10
  const [profileOpen, setProfileOpen] = useState(false)
  const profileRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  useEffect(() => {
    fetch('/api/clients')
      .then(r => r.json())
      .then((data: any[]) => {
        if (data?.length) {
          setClients(data.map(c => ({
            id: c.id,
            initials: ((c.firstName?.[0] || '') + (c.lastName?.[0] || '')).toUpperCase(),
            name: `${c.firstName ?? ''} ${c.lastName ?? ''}`.trim(),
            email: c.email || '',
            phone: c.phone || '',
            returnCount: c.returnCount ?? 0,
            documentCount: c.documentCount ?? 0,
            created: c.createdAt ? new Date(c.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '',
          })))
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const userName = session?.user?.name || 'User'
  const userEmail = session?.user?.email || ''
  const userRole = session?.user?.role || 'preparer'
  const roleLabel = userRole === 'firm_admin' ? 'Org Admin' : userRole === 'admin' ? 'Admin' : userRole.charAt(0).toUpperCase() + userRole.slice(1)
  const uInitials = userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)

  const filtered = clients.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase())
  )
  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage))
  const paged = filtered.slice((page - 1) * perPage, page * perPage)

  const totalReturns = clients.reduce((a, c) => a + c.returnCount, 0)
  const totalDocs = clients.reduce((a, c) => a + c.documentCount, 0)

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="flex items-center gap-3">
        <div className="flex-1 flex items-center gap-2 px-4 py-2.5 bg-white rounded-2xl border border-[#E5E7E5] shadow-sm">
          <div className="flex items-center gap-2 px-3 py-1 rounded-lg text-xs font-semibold bg-[#E8F5E8] text-[#0B3D2E]">
            <Users className="w-3 h-3" />Clients
          </div>
          <Clock className="w-3.5 h-3.5 text-[#6B7280]" />
          <span className="text-xs text-[#6B7280]">{clients.length} clients &middot; {totalReturns} returns</span>
        </div>
        <div className="relative" ref={profileRef}>
          <button onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2 p-1.5 bg-white rounded-2xl border border-[#E5E7E5] shadow-sm hover:border-[#1FAA6F] transition-all">
            <div className="w-8 h-8 bg-gradient-to-br from-[#0B3D2E] to-[#1FAA6F] rounded-full flex items-center justify-center text-white text-xs font-semibold shadow-sm">{uInitials}</div>
            <div className="hidden sm:block text-left mr-1"><p className="text-sm font-medium text-[#1A1D1B] leading-tight">{userName}</p><p className="text-[10px] text-[#6B7280] font-medium">{roleLabel}</p></div>
            <ChevronDown className={cn('w-4 h-4 text-[#6B7280] transition-transform shrink-0', profileOpen && 'rotate-180')} />
          </button>
          {profileOpen && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl border border-[#E5E7E5] shadow-lg py-2 z-50">
              <div className="px-4 py-3 border-b border-[#E5E7E5]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#0B3D2E] to-[#1FAA6F] rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0">{uInitials}</div>
                  <div><p className="text-sm font-semibold text-[#1A1D1B]">{userName}</p><p className="text-xs text-[#6B7280]">{userEmail}</p></div>
                </div>
              </div>
              <div className="px-4 py-2 border-b border-[#E5E7E5]"><div className="flex items-center gap-2 text-xs text-[#6B7280]"><Shield className="w-3.5 h-3.5" /><span>{roleLabel}</span></div></div>
              <Link href="/settings" className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#6B7280] hover:bg-[#F7F9F8] transition-colors"><Settings className="w-4 h-4" />Settings</Link>
              <button onClick={() => signOut({ redirect: false }).then(() => window.location.href = '/auth/signin')}
                className="flex items-center gap-3 w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"><LogOut className="w-4 h-4" />Sign out</button>
            </div>
          )}
        </div>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[26px] font-bold text-[#1A1D1B] tracking-tight">Clients</h1>
          <p className="text-sm text-[#6B7280] mt-0.5">{clients.length} client{clients.length !== 1 ? 's' : ''} on file &middot; {totalReturns} total returns &middot; {totalDocs} documents</p>
        </div>
        <Link href="/protected/taxPreparation/new-return/clients/new"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0B3D2E] text-white text-sm font-semibold rounded-full hover:bg-[#1FAA6F] transition-all shadow-sm">
          <Plus className="w-4 h-4" />Add Client
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total Clients', value: clients.length, icon: Users, color: 'text-[#0B3D2E]', bg: 'bg-[#E8F5E8]' },
          { label: 'Active Returns', value: totalReturns, icon: FileText, color: 'text-[#1FAA6F]', bg: 'bg-[#1FAA6F]/10' },
          { label: 'Documents', value: totalDocs, icon: Clock, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Avg Returns/Client', value: clients.length ? (totalReturns / clients.length).toFixed(1) : '0', icon: UserPlus, color: 'text-purple-600', bg: 'bg-purple-50' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl border border-[#E5E7E5] p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-[#6B7280] font-medium uppercase tracking-wider">{s.label}</p>
              <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center', s.bg)}><s.icon className={cn('w-4 h-4', s.color)} /></div>
            </div>
            <p className="text-2xl font-bold text-[#1A1D1B]">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
        <input type="text" placeholder="Search by name or email..." value={search}
          onChange={e => { setSearch(e.target.value); setPage(1) }}
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#E5E7E5] rounded-full text-sm text-[#1A1D1B] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#1FAA6F]/20 focus:border-[#1FAA6F] transition-all" />
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-[#E5E7E5] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[#F7F9F8] border-b border-[#E5E7E5]">
                {['Client', 'Phone', 'Returns', 'Documents', 'Created', ''].map(h => (
                  <th key={h} className={cn('px-4 py-3.5 text-[13px] font-medium text-[#6B7280] uppercase tracking-wider', h === '' ? 'text-right' : 'text-left')}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7E5]">
              {loading ? (
                <tr><td colSpan={6} className="px-4 py-12 text-center text-sm text-[#6B7280]"><Loader2 className="w-5 h-5 animate-spin inline-block mr-2" />Loading clients...</td></tr>
              ) : paged.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-12 text-center">
                  <User className="w-10 h-10 text-[#D1D5DB] mx-auto mb-2" />
                  <p className="text-sm text-[#6B7280]">{search ? 'No clients match your search' : 'No clients yet'}</p>
                </td></tr>
              ) : paged.map(c => (
                <tr key={c.id} className="group hover:bg-[#F7F9F8] transition-colors">
                  <td className="px-4 py-3">
                    <Link href={`/protected/taxPreparation/clients/${c.id}`} className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#0B3D2E] to-[#1FAA6F] flex items-center justify-center text-white text-xs font-semibold shrink-0 shadow-sm">{c.initials}</div>
                      <div>
                        <p className="text-sm font-medium text-[#1A1D1B] group-hover:text-[#1FAA6F] transition-colors">{c.name}</p>
                        <p className="text-xs text-[#6B7280] flex items-center gap-1"><Mail className="w-3 h-3" />{c.email}</p>
                      </div>
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-sm text-[#6B7280]">{c.phone || <span className="text-[#D1D5DB]">{'\u2014'}</span>}</td>
                  <td className="px-4 py-3">
                    <span className={cn('inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium', c.returnCount > 0 ? 'bg-[#E8F5E8] text-[#0B3D2E]' : 'bg-[#F7F9F8] text-[#9CA3AF]')}>
                      <FileText className="w-3 h-3" />{c.returnCount}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn('inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium', c.documentCount > 0 ? 'bg-blue-50 text-blue-600' : 'bg-[#F7F9F8] text-[#9CA3AF]')}>
                      <FileText className="w-3 h-3" />{c.documentCount}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-[#6B7280]">{c.created}</td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/protected/taxPreparation/clients/${c.id}`}
                      className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-[#0B3D2E] text-white text-xs font-semibold rounded-full hover:bg-[#1FAA6F] transition-all opacity-0 group-hover:opacity-100 shadow-sm">
                      View <ArrowUpRight className="w-3 h-3" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length > perPage && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-[#E5E7E5] bg-[#F7F9F8]">
            <span className="text-sm text-[#6B7280]">Page {page} of {totalPages}</span>
            <div className="flex items-center gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="p-2 rounded-lg border border-[#E5E7E5] text-[#6B7280] hover:border-[#1FAA6F] hover:text-[#1FAA6F] disabled:opacity-40 disabled:cursor-not-allowed transition-all"><ChevronLeft className="w-4 h-4" /></button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(p => (
                <button key={p} onClick={() => setPage(p)}
                  className={cn('w-8 h-8 rounded-lg text-sm font-medium transition-all', page === p ? 'bg-[#1FAA6F] text-white' : 'text-[#6B7280] bg-white border border-[#E5E7E5] hover:bg-[#F7F9F8]')}>{p}</button>
              ))}
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="p-2 rounded-lg border border-[#E5E7E5] text-[#6B7280] hover:border-[#1FAA6F] hover:text-[#1FAA6F] disabled:opacity-40 disabled:cursor-not-allowed transition-all"><ChevronRight className="w-4 h-4" /></button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
