'use client'

import { useState, useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import {
  Search, FileText, Users, Upload, Clock, CalendarDays,
  ChevronRight, Loader2, Plus, ChevronDown, ArrowUpRight,
  FileSpreadsheet, Briefcase, User, Check, AlertCircle,
  Play, Eye, EyeOff, SlidersHorizontal, List, LayoutGrid,
  TrendingUp, ChevronLeft, MoreHorizontal, Trash2, Edit,
  Download, RefreshCw
} from 'lucide-react'

const STATUS_LABELS: Record<string, string> = {
  draft: 'Draft', in_review: 'In Review', completed: 'Completed',
  filed: 'Filed', amended: 'Amended',
}
const STATUS_STYLES: Record<string, string> = {
  'Draft': 'bg-[#F7F9F8] text-[#6B7280]',
  'In Review': 'bg-blue-50 text-blue-600',
  'Completed': 'bg-[#1FAA6F]/10 text-[#1FAA6F]',
  'Filed': 'bg-purple-50 text-purple-600',
  'Amended': 'bg-red-50 text-red-500',
}

function AnimatedNumber({ value, duration = 1500 }: { value: number; duration?: number }) {
  const [display, setDisplay] = useState(0)
  const started = useRef(false)
  useEffect(() => {
    if (started.current) return
    started.current = true
    const startTime = performance.now()
    const step = (now: number) => {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplay(Math.round(eased * value))
      if (progress < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [value, duration])
  return <span className="tabular-nums">{display.toLocaleString()}</span>
}

interface ReturnItem {
  id: string; clientName: string; clientEmail: string; initials: string
  formCode: string; taxYear: number; preparerName: string | null
  reviewName: string | null; status: string; updated: string
}

export default function TaxPreparationDashboard() {
  const { data: session } = useSession()
  const [greeting, setGreeting] = useState('')
  const [search, setSearch] = useState('')
  const [stats, setStats] = useState<{ label: string; value: number; change: string; trend: string }[]>([
    { label: 'Total Returns', value: 24, change: '+12%', trend: 'up' },
    { label: 'Active Clients', value: 18, change: '+3', trend: 'up' },
    { label: 'Documents Received', value: 47, change: '+8', trend: 'up' },
    { label: 'Team Members', value: 6, change: '0', trend: 'down' },
  ])
  const [returns, setReturns] = useState<ReturnItem[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [selectAll, setSelectAll] = useState(false)
  const perPage = 10

  useEffect(() => {
    const hour = new Date().getHours()
    if (hour < 12) setGreeting('Good morning')
    else if (hour < 18) setGreeting('Good afternoon')
    else setGreeting('Good evening')
  }, [])

  useEffect(() => {
    Promise.all([
      fetch('/api/dashboard/summary').then(r => r.json()).catch(() => null),
      fetch('/api/returns').then(r => r.json()).catch(() => []),
    ]).then(([data, returnsData]) => {
      if (data?.stats) setStats(data.stats)
      if (Array.isArray(returnsData) && returnsData.length) {
        setReturns(returnsData.map((r: any) => ({
          id: r.id, clientName: r.clientName || r.client || 'Unknown',
          clientEmail: r.clientEmail || '', initials: r.initials || '??',
          formCode: r.formCode || r.form || '1040', taxYear: r.taxYear || 2026,
          preparerName: r.preparerName || null, reviewName: r.reviewName || null,
          status: r.status, updated: r.updated ? new Date(r.updated).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '\u2014',
        })))
      }
    }).finally(() => setLoading(false))
  }, [])

  const firstName = session?.user?.name?.split(' ')[0] || 'there'
  const statsIcons = [FileText, Users, Upload, Briefcase]

  const filtered = returns.filter(r =>
    r.clientName?.toLowerCase().includes(search.toLowerCase()) ||
    r.formCode?.toLowerCase().includes(search.toLowerCase()) ||
    r.preparerName?.toLowerCase().includes(search.toLowerCase())
  )
  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage))
  const paged = filtered.slice((page - 1) * perPage, page * perPage)

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds)
    if (next.has(id)) next.delete(id); else next.add(id)
    setSelectedIds(next)
  }
  const toggleSelectAll = () => {
    if (selectAll || selectedIds.size === paged.length) { setSelectedIds(new Set()); setSelectAll(false) }
    else { setSelectedIds(new Set(paged.map(r => r.id))); setSelectAll(true) }
  }

  return (
    <div className="space-y-7">
      {/* Greeting Banner */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-[#6B7280]">{greeting}, <span className="text-[#1A1D1B]">{firstName}</span></p>
          <h1 className="text-[26px] font-bold text-[#1A1D1B] tracking-tight mt-0.5">Tax Returns</h1>
          <p className="text-sm text-[#6B7280] mt-0.5">Create, review, and manage tax returns</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/protected/taxPreparation/new-return" className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0B3D2E] text-white text-sm font-semibold rounded-full hover:bg-[#1FAA6F] transition-all shadow-sm">
            <Plus className="w-4 h-4" />New Return
          </Link>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => {
          const Icon = statsIcons[i] || FileText
          return (
            <div key={s.label} className="bg-white rounded-2xl border border-[#E5E7E5] p-5 shadow-[0_2px_8px_rgba(0,0,0,.04)] hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-[#E8F5E8] flex items-center justify-center">
                  <Icon className="w-5 h-5 text-[#0B3D2E]" />
                </div>
                <span className={cn(
                  'inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full',
                  s.trend === 'up' ? 'text-[#1FAA6F] bg-[#E8F5E8]' : 'text-[#6B7280] bg-[#F7F9F8]'
                )}>
                  {s.change} <TrendingUp className={cn('w-3 h-3', s.trend === 'down' && 'rotate-180')} />
                </span>
              </div>
              <p className="text-2xl font-bold text-[#1A1D1B]"><AnimatedNumber value={s.value} /></p>
              <p className="text-xs text-[#6B7280] mt-0.5">{s.label}</p>
            </div>
          )
        })}
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[240px] max-w-[380px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280]" />
          <input type="text" placeholder="Search clients, returns, documents..." value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
            className="w-full pl-10 pr-12 py-2.5 bg-white border border-[#E5E7E5] rounded-full text-sm text-[#1A1D1B] placeholder-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#1FAA6F]/20 focus:border-[#1FAA6F] transition-all" />
          <kbd className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[10px] font-mono text-[#9CA3AF] bg-[#F7F9F8] border border-[#E5E7E5] px-1.5 py-0.5 rounded-md">⌘K</kbd>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2.5 bg-white border border-[#E5E7E5] rounded-full text-[#6B7280] hover:border-[#1FAA6F] hover:text-[#1FAA6F] transition-all"><SlidersHorizontal className="w-4 h-4" /></button>
          <div className="flex items-center bg-white border border-[#E5E7E5] rounded-full p-0.5">
            <button className="p-2 bg-[#F7F9F8] rounded-full text-[#1A1D1B]"><List className="w-4 h-4" /></button>
            <button className="p-2 text-[#6B7280] rounded-full hover:text-[#1A1D1B]"><LayoutGrid className="w-4 h-4" /></button>
          </div>
          <button className="p-2.5 bg-white border border-[#E5E7E5] rounded-full text-[#6B7280] hover:border-[#1FAA6F] hover:text-[#1FAA6F] transition-all"><RefreshCw className="w-4 h-4" /></button>
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-2xl border border-[#E5E7E5] shadow-[0_2px_12px_rgba(0,0,0,.06)] overflow-hidden">
        {/* Title Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E7E5] bg-[#F7F9F8]">
          <div className="flex items-center gap-4">
            <h2 className="text-base font-semibold text-[#1A1D1B]">All Returns</h2>
            <span className="text-xs text-[#6B7280] bg-white border border-[#E5E7E5] px-2.5 py-0.5 rounded-full font-medium">{returns.length} total</span>
          </div>
          <div className="flex items-center gap-2">
            {selectedIds.size > 0 && (
              <span className="text-xs text-[#6B7280] mr-1">{selectedIds.size} selected</span>
            )}
            {[Edit, Trash2, Download, EyeOff].map((Icon, i) => (
              <button key={i} className={cn(
                'p-2 border border-[#E5E7E5] rounded-lg transition-all',
                selectedIds.size > 0 ? 'opacity-100 text-[#6B7280] hover:text-[#1FAA6F] hover:border-[#1FAA6F]' : 'opacity-30 cursor-not-allowed'
              )}><Icon className="w-3.5 h-3.5" /></button>
            ))}
          </div>
        </div>
        {loading ? (
          <div className="px-6 py-16 text-center text-sm text-[#6B7280]"><Loader2 className="w-5 h-5 animate-spin inline-block mr-2" />Loading returns...</div>
        ) : paged.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <FileText className="w-10 h-10 text-[#D1D5DB] mx-auto mb-3" />
            <p className="text-sm font-medium text-[#1A1D1B]">No returns found</p>
            <p className="text-xs text-[#6B7280] mt-1">{search ? 'Try a different search term' : 'Create your first return to get started'}</p>
          </div>
        ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#E5E7E5]">
                <th className="px-4 py-4 w-10">
                  <input type="checkbox" checked={selectAll} onChange={toggleSelectAll}
                    className="w-4 h-4 rounded border-[#E5E7E5] text-[#1FAA6F] focus:ring-[#1FAA6F] accent-[#1FAA6F]" />
                </th>
                {['Client', 'Form', 'Year', 'Preparer', 'Reviewer', 'Status', 'Updated'].map(h => (
                  <th key={h} className="text-left px-4 py-4 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">{h}</th>
                ))}
                <th className="px-4 py-4 w-14" />
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7E5]">
              {paged.map(r => {
                const sl = STATUS_LABELS[r.status] ?? r.status
                const isSelected = selectedIds.has(r.id)
                return (
                <tr key={r.id} className={cn('group transition-colors cursor-pointer', isSelected ? 'bg-[#1FAA6F]/5' : 'hover:bg-[#F7F9F8]')}>
                  <td className="px-4 py-3.5" onClick={e => e.stopPropagation()}>
                    <input type="checkbox" checked={isSelected} onChange={() => toggleSelect(r.id)}
                      className="w-4 h-4 rounded border-[#E5E7E5] text-[#1FAA6F] focus:ring-[#1FAA6F] accent-[#1FAA6F]" />
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#0B3D2E] to-[#1FAA6F] flex items-center justify-center text-white text-xs font-semibold shrink-0 shadow-sm">{r.initials}</div>
                      <div>
                        <p className="text-sm font-medium text-[#1A1D1B]">{r.clientName}</p>
                        <p className="text-xs text-[#6B7280]">{r.clientEmail}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5"><code className="text-xs font-mono font-semibold text-[#0B3D2E] bg-[#E8F5E8] px-2.5 py-1 rounded-lg">{r.formCode}</code></td>
                  <td className="px-4 py-3.5 text-sm font-medium text-[#1A1D1B]">{r.taxYear}</td>
                  <td className="px-4 py-3.5">
                    {r.preparerName ? (
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#0B3D2E] to-[#1FAA6F] flex items-center justify-center text-[9px] text-white font-bold">
                          {r.preparerName.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                        </div>
                        <span className="text-sm text-[#1A1D1B]">{r.preparerName}</span>
                      </div>
                    ) : <span className="text-sm text-[#D1D5DB]">{'\u2014'}</span>}
                  </td>
                  <td className="px-4 py-3.5">
                    {r.reviewName ? (
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#0B3D2E] to-[#1FAA6F] flex items-center justify-center text-[9px] text-white font-bold">
                          {r.reviewName.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                        </div>
                        <span className="text-sm text-[#1A1D1B]">{r.reviewName}</span>
                      </div>
                    ) : <span className="text-sm text-[#D1D5DB]">{'\u2014'}</span>}
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={cn('inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-medium', STATUS_STYLES[sl] || STATUS_STYLES['Draft'])}>
                      {sl === 'In Review' && <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />}
                      {sl === 'Completed' && <Check className="w-3 h-3" />}
                      {sl}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-sm text-[#6B7280]">{r.updated}</td>
                  <td className="px-4 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-1.5 text-[#9CA3AF] hover:text-[#1FAA6F] hover:bg-[#1FAA6F]/10 rounded-lg transition-all"><Eye className="w-4 h-4" /></button>
                      <Link href={r.status === 'in_review' ? `/protected/taxPreparation/preparer` : '#'}
                        className="p-1.5 text-[#9CA3AF] hover:text-[#1FAA6F] hover:bg-[#1FAA6F]/10 rounded-lg transition-all"><Play className="w-4 h-4" /></Link>
                      <button className="p-1.5 text-[#9CA3AF] hover:text-[#6B7280] hover:bg-[#F7F9F8] rounded-lg transition-all"><MoreHorizontal className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              )})}
            </tbody>
          </table>
        </div>
        )}
        {filtered.length > perPage && (
          <div className="flex items-center justify-between px-6 py-3.5 border-t border-[#E5E7E5] bg-[#F7F9F8]">
            <span className="text-sm text-[#6B7280]">Showing {Math.min((page - 1) * perPage + 1, filtered.length)}&ndash;{Math.min(page * perPage, filtered.length)} of {filtered.length}</span>
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
