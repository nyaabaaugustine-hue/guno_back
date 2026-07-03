'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { cn } from '@/lib/utils'
import {
  Search, Play, Info, ChevronLeft, ChevronRight, Eye, FileText,
  FileSpreadsheet, ArrowUpRight, CalendarDays, User, Clock, Loader2,
  ChevronDown, LogOut, Settings, Shield, Plus, CheckCircle2, X,
  Zap, Sparkles, LayoutDashboard, ExternalLink
} from 'lucide-react'

const STATUS_LABELS: Record<string, string> = {
  draft: 'Draft', in_review: 'In Progress', completed: 'Completed',
  filed: 'Filed', amended: 'Amended',
}
const STATUS_STYLES: Record<string, string> = {
  'In Progress': 'bg-[#1FAA6F]/10 text-[#1FAA6F]',
  'Draft': 'bg-amber-50 text-amber-600',
  'Completed': 'bg-blue-50 text-blue-600',
  'Filed': 'bg-purple-50 text-purple-600',
  'Amended': 'bg-red-50 text-red-500',
}
const COMPLEXITY_MAP: Record<string, string> = {
  '1040': 'Easy', '1040-SR': 'Easy', '1120': 'Complex', '1120-S': 'Medium', '1065': 'Medium',
}
const COMPLEXITY_STYLES: Record<string, string> = {
  'Easy': 'bg-[#1FAA6F]/10 text-[#1FAA6F]',
  'Medium': 'bg-amber-50 text-amber-600',
  'Complex': 'bg-red-50 text-red-500',
}

interface ReturnItem {
  id: string; clientName: string; clientEmail: string; initials: string
  formCode: string; taxYear: number; preparerName: string | null
  status: string; notes: string | null
}

export default function PreparerPage() {
  const { data: session } = useSession()
  const [search, setSearch] = useState('')
  const [showAll, setShowAll] = useState(false)
  const [page, setPage] = useState(1)
  const perPage = 10
  const [preparations, setPreparations] = useState<ReturnItem[]>([])
  const [loading, setLoading] = useState(true)
  const [startingId, setStartingId] = useState<string | null>(null)
  const [selectedPrep, setSelectedPrep] = useState<ReturnItem | null>(null)
  const [profileOpen, setProfileOpen] = useState(false)
  const profileRef = useRef<HTMLDivElement>(null)
  const [activeTab, setActiveTab] = useState<'queue' | 'all' | 'completed'>('queue')

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  useEffect(() => {
    fetch('/api/returns')
      .then(r => r.json())
      .then((data: ReturnItem[]) => { setPreparations(Array.isArray(data) ? data : []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const startPreparation = useCallback(async (returnItem: ReturnItem, e?: React.MouseEvent) => {
    e?.stopPropagation()
    setStartingId(returnItem.id)
    try {
      const res = await fetch(`/api/returns/${returnItem.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'in_review' }) })
      if (res.ok) {
        setPreparations(prev => prev.map(p => p.id === returnItem.id ? { ...p, status: 'in_review' } : p))
        setSelectedPrep(prev => prev?.id === returnItem.id ? { ...prev, status: 'in_review' } : prev)
      }
    } catch {}
    setStartingId(null)
  }, [])

  const userName = session?.user?.name || 'User'
  const userEmail = session?.user?.email || ''
  const userRole = session?.user?.role || 'preparer'
  const roleLabel = userRole === 'firm_admin' ? 'Org Admin' : userRole === 'admin' ? 'Admin' : userRole.charAt(0).toUpperCase() + userRole.slice(1)
  const initials = userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)

  const filtered = preparations.filter(r => {
    const matchesSearch = r.clientName?.toLowerCase().includes(search.toLowerCase())
    const label = STATUS_LABELS[r.status] ?? r.status
    if (activeTab === 'queue') return matchesSearch && label === 'In Progress'
    if (activeTab === 'completed') return matchesSearch && (label === 'Completed' || label === 'Filed')
    return matchesSearch
  })
  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage))
  const paged = filtered.slice((page - 1) * perPage, page * perPage)

  const queueCount = preparations.filter(r => (STATUS_LABELS[r.status] ?? r.status) === 'In Progress').length
  const draftCount = preparations.filter(r => (STATUS_LABELS[r.status] ?? r.status) === 'Draft').length
  const doneCount = preparations.filter(r => {
    const l = STATUS_LABELS[r.status] ?? r.status; return l === 'Completed' || l === 'Filed'
  }).length

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="flex items-center gap-3">
        <div className="flex-1 flex items-center gap-2 px-4 py-2.5 bg-white rounded-2xl border border-[#E5E7E5] shadow-sm">
          <div className="flex items-center gap-2 px-3 py-1 rounded-lg text-xs font-semibold bg-[#E8F5E8] text-[#0B3D2E]">
            <span className="w-1.5 h-1.5 bg-[#0B3D2E] rounded-full" />Preparer
          </div>
          <Clock className="w-3.5 h-3.5 text-[#6B7280]" />
          <span className="text-xs text-[#6B7280]">{queueCount} active, {draftCount} drafts</span>
          <button className="ml-auto text-[11px] font-semibold text-white bg-[#0B3D2E] px-3 py-1 rounded-full hover:bg-[#1FAA6F] transition-colors">Upgrade</button>
        </div>
        <div className="relative" ref={profileRef}>
          <button onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2 p-1.5 bg-white rounded-2xl border border-[#E5E7E5] shadow-sm hover:border-[#1FAA6F] transition-all">
            <div className="w-8 h-8 bg-gradient-to-br from-[#0B3D2E] to-[#1FAA6F] rounded-full flex items-center justify-center text-white text-xs font-semibold shadow-sm">{initials}</div>
            <div className="hidden sm:block text-left mr-1"><p className="text-sm font-medium text-[#1A1D1B] leading-tight">{userName}</p><p className="text-[10px] text-[#6B7280] font-medium">{roleLabel}</p></div>
            <ChevronDown className={cn('w-4 h-4 text-[#6B7280] transition-transform shrink-0', profileOpen && 'rotate-180')} />
          </button>
          {profileOpen && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl border border-[#E5E7E5] shadow-lg py-2 z-50">
              <div className="px-4 py-3 border-b border-[#E5E7E5]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#0B3D2E] to-[#1FAA6F] rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0">{initials}</div>
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
          <h1 className="text-[28px] font-bold text-[#1A1D1B] tracking-tight">Preparer Dashboard</h1>
          <p className="text-sm text-[#6B7280] mt-1">{queueCount} in progress &middot; {draftCount} drafts &middot; {doneCount} completed</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-white border border-[#E5E7E5] rounded-full p-0.5 shadow-sm">
            {(['queue', 'all', 'completed'] as const).map(tab => (
              <button key={tab} onClick={() => { setActiveTab(tab); setPage(1) }}
                className={cn('px-4 py-2 text-xs font-semibold rounded-full capitalize transition-all', activeTab === tab ? 'bg-[#0B3D2E] text-white shadow-sm' : 'text-[#6B7280] hover:text-[#1A1D1B]')}>
                {tab === 'queue' ? 'My Queue' : tab === 'all' ? 'All' : 'Completed'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'In Progress', value: queueCount, icon: Play, color: 'text-[#1FAA6F]', bg: 'bg-[#1FAA6F]/10' },
          { label: 'Drafts', value: draftCount, icon: FileText, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Completed', value: doneCount, icon: CheckCircle2, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Total Assigned', value: preparations.length, icon: LayoutDashboard, color: 'text-[#0B3D2E]', bg: 'bg-[#E8F5E8]' },
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
      <div className="relative max-w-[320px]">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280]" />
        <input type="text" placeholder="Search client name..." value={search} onChange={e => { setSearch(e.target.value); setPage(1) }}
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#E5E7E5] rounded-full text-sm text-[#1A1D1B] placeholder-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#1FAA6F]/20 focus:border-[#1FAA6F] transition-all" />
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-[#E5E7E5] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[#F7F9F8] border-b border-[#E5E7E5]">
                {['Client', 'Form / Year', 'Preparer', 'Complexity', 'Status', 'Notes', ''].map(h => (
                  <th key={h} className={cn('px-4 py-3.5 text-[13px] font-medium text-[#6B7280] uppercase tracking-wider', h === '' ? 'text-right' : 'text-left')}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7E5]">
              {loading ? (
                <tr><td colSpan={7} className="px-4 py-12 text-center text-sm text-[#6B7280]"><Loader2 className="w-5 h-5 animate-spin inline-block mr-2" />Loading...</td></tr>
              ) : paged.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-12 text-center">
                  {activeTab === 'queue' ? (
                    <><Play className="w-10 h-10 text-[#D1D5DB] mx-auto mb-2" /><p className="text-sm text-[#6B7280]">No active preparations</p></>
                  ) : (
                    <><FileSpreadsheet className="w-10 h-10 text-[#D1D5DB] mx-auto mb-2" /><p className="text-sm text-[#6B7280]">No preparations found</p></>
                  )}
                </td></tr>
              ) : paged.map(r => {
                const ds = STATUS_LABELS[r.status] ?? r.status;
                const cx = COMPLEXITY_MAP[r.formCode] ?? 'Medium';
                const isStarting = startingId === r.id;
                const isDraft = r.status === 'draft';
                return (
                <tr key={r.id} onClick={() => setSelectedPrep(r)} className="group hover:bg-[#F7F9F8] transition-colors cursor-pointer">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#0B3D2E] to-[#1FAA6F] flex items-center justify-center text-white text-xs font-semibold shrink-0 shadow-sm">{r.initials}</div>
                      <div>
                        <p className="text-sm font-medium text-[#1A1D1B] group-hover:text-[#1FAA6F] transition-colors">{r.clientName}</p>
                        <p className="text-xs text-[#6B7280]">{r.clientEmail}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <code className="text-xs font-mono font-semibold text-[#0B3D2E] bg-[#E8F5E8] px-2.5 py-1 rounded-lg">{r.formCode}</code>
                      <span className="text-sm text-[#6B7280] font-medium">{r.taxYear}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {r.preparerName ? (
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#0B3D2E] to-[#1FAA6F] flex items-center justify-center text-[9px] text-white font-bold">
                          {r.preparerName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </div>
                        <span className="text-sm text-[#1A1D1B]">{r.preparerName}</span>
                      </div>
                    ) : <span className="inline-flex items-center gap-1 text-xs text-[#9CA3AF] bg-[#F7F9F8] px-2 py-0.5 rounded-full"><User className="w-3 h-3" />Unassigned</span>}
                  </td>
                  <td className="px-4 py-3"><span className={cn('inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium', COMPLEXITY_STYLES[cx])}>{cx}</span></td>
                  <td className="px-4 py-3">
                    <span className={cn('inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium', STATUS_STYLES[ds])}>
                      {ds === 'In Progress' && <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />}
                      {ds === 'Completed' && <CheckCircle2 className="w-3 h-3" />}
                      {ds}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {r.notes ? (
                      <span className="inline-flex items-center gap-1 text-xs text-[#6B7280]"><FileText className="w-3.5 h-3.5" />{r.notes.length > 20 ? r.notes.slice(0, 20) + '\u2026' : r.notes}</span>
                    ) : <span className="text-[#D1D5DB] text-sm">{'\u2014'}</span>}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {isDraft ? (
                      <button onClick={e => startPreparation(r, e)} disabled={isStarting}
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#0B3D2E] text-white text-xs font-semibold rounded-full hover:bg-[#1FAA6F] disabled:opacity-50 transition-all shadow-sm">
                        {isStarting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
                        {isStarting ? 'Starting...' : 'Start'}
                      </button>
                    ) : (
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-1.5 text-[#9CA3AF] hover:text-[#1FAA6F] hover:bg-[#1FAA6F]/10 rounded-lg transition-all" title="Open"><Eye className="w-4 h-4" /></button>
                        <button className="p-1.5 text-[#9CA3AF] hover:text-[#1FAA6F] hover:bg-[#1FAA6F]/10 rounded-lg transition-all" title="Continue"><ExternalLink className="w-4 h-4" /></button>
                      </div>
                    )}
                  </td>
                </tr>
              )})}
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
                  className={cn('w-8 h-8 rounded-lg text-sm font-medium transition-all', page === p ? 'bg-[#1FAA6F] text-white' : 'text-[#6B7280] hover:bg-[#F7F9F8] border border-[#E5E7E5]')}>{p}</button>
              ))}
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="p-2 rounded-lg border border-[#E5E7E5] text-[#6B7280] hover:border-[#1FAA6F] hover:text-[#1FAA6F] disabled:opacity-40 disabled:cursor-not-allowed transition-all"><ChevronRight className="w-4 h-4" /></button>
            </div>
          </div>
        )}
      </div>

      {/* Preparation Workspace Modal */}
      {selectedPrep && (() => {
        const ds = STATUS_LABELS[selectedPrep.status] ?? selectedPrep.status;
        const cx = COMPLEXITY_MAP[selectedPrep.formCode] ?? 'Medium';
        const isDraft = selectedPrep.status === 'draft';
        return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={e => { if (e.target === e.currentTarget) setSelectedPrep(null) }}>
          <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="relative bg-gradient-to-r from-[#0B3D2E] to-[#1FAA6F] px-8 pt-7 pb-20 shrink-0">
              <button onClick={() => setSelectedPrep(null)} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-all"><X className="w-4 h-4" /></button>
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center text-white text-2xl font-bold backdrop-blur-sm">{selectedPrep.initials}</div>
                <div className="text-white">
                  <h2 className="text-2xl font-bold">{selectedPrep.clientName}</h2>
                  <p className="text-sm text-white/80">{selectedPrep.clientEmail}</p>
                  <div className="flex items-center gap-3 mt-2.5">
                    <span className={cn('inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-medium',
                      ds === 'In Progress' ? 'bg-white/20 text-white' : ds === 'Draft' ? 'bg-amber-400/30 text-amber-100' : 'bg-blue-400/30 text-blue-100')}>{ds}</span>
                    <code className="text-xs font-mono bg-white/20 text-white px-3 py-0.5 rounded-full">{selectedPrep.formCode}</code>
                    <span className="text-xs text-white/70">{selectedPrep.taxYear}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6">
              {isDraft && (
                <div className="bg-gradient-to-r from-[#E8F5E8] to-[#F7F9F8] rounded-2xl p-5 border border-[#1FAA6F]/20">
                  <div className="flex items-start gap-4">
                    <Sparkles className="w-6 h-6 text-[#1FAA6F] shrink-0 mt-0.5" />
                    <div>
                      <h3 className="text-base font-semibold text-[#1A1D1B]">Ready to prepare this return</h3>
                      <p className="text-sm text-[#6B7280] mt-1">Juno will guide you through each step. Start the preparation to begin working on this return with AI assistance.</p>
                      <button onClick={e => startPreparation(selectedPrep, e)} disabled={startingId === selectedPrep.id}
                        className="mt-4 inline-flex items-center gap-2 px-6 py-2.5 bg-[#1FAA6F] text-white text-sm font-semibold rounded-full hover:bg-[#0B3D2E] disabled:opacity-50 transition-all shadow-sm">
                        {startingId === selectedPrep.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                        {startingId === selectedPrep.id ? 'Starting...' : 'Start Preparation'}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-5">
                <div className="bg-[#F7F9F8] rounded-2xl p-4"><p className="text-xs text-[#6B7280] font-medium uppercase tracking-wider mb-1">Preparer</p><p className="text-sm text-[#1A1D1B] font-medium">{selectedPrep.preparerName ?? 'Not assigned'}</p></div>
                <div className="bg-[#F7F9F8] rounded-2xl p-4"><p className="text-xs text-[#6B7280] font-medium uppercase tracking-wider mb-1">Complexity</p><p className={cn('text-sm font-semibold', cx === 'Easy' ? 'text-[#1FAA6F]' : cx === 'Medium' ? 'text-amber-600' : 'text-red-500')}>{cx}</p></div>
                <div className="bg-[#F7F9F8] rounded-2xl p-4"><p className="text-xs text-[#6B7280] font-medium uppercase tracking-wider mb-1">Return Type</p><p className="text-sm font-mono text-[#1A1D1B] font-medium">{selectedPrep.formCode}</p></div>
                <div className="bg-[#F7F9F8] rounded-2xl p-4"><p className="text-xs text-[#6B7280] font-medium uppercase tracking-wider mb-1">Tax Year</p><p className="text-sm text-[#1A1D1B] font-medium">{selectedPrep.taxYear}</p></div>
              </div>

              {selectedPrep.notes && (
                <div className="bg-[#F7F9F8] rounded-2xl p-4">
                  <p className="text-xs text-[#6B7280] font-medium uppercase tracking-wider mb-2">Notes</p>
                  <p className="text-sm text-[#6B7280]">{selectedPrep.notes}</p>
                </div>
              )}

              <div className="bg-[#F7F9F8] rounded-2xl p-5">
                <h4 className="text-sm font-semibold text-[#1A1D1B] mb-3 flex items-center gap-2"><LayoutDashboard className="w-4 h-4 text-[#1FAA6F]" />Preparation Steps</h4>
                <div className="space-y-3">
                  {[
                    { step: 'Review Client Information', done: false },
                    { step: 'Enter Income Data', done: false },
                    { step: 'Apply Deductions', done: false },
                    { step: 'Review & Validate', done: false },
                    { step: 'Submit for Review', done: false },
                  ].map((s, i) => (
                    <div key={s.step} className="flex items-center gap-3 py-1">
                      <div className={cn('w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2', s.done ? 'bg-[#1FAA6F] border-[#1FAA6F] text-white' : 'border-[#D1D5DB] text-[#9CA3AF]')}>{i + 1}</div>
                      <span className={cn('text-sm', s.done ? 'text-[#1FAA6F] font-medium line-through' : 'text-[#1A1D1B]')}>{s.step}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="shrink-0 px-8 py-4 border-t border-[#E5E7E5] bg-white flex items-center justify-end gap-3 rounded-b-3xl">
              {isDraft ? (
                <button onClick={() => setSelectedPrep(null)} className="px-5 py-2.5 border border-[#E5E7E5] text-[#6B7280] text-sm font-medium rounded-full hover:border-[#1FAA6F] hover:text-[#1FAA6F] transition-all">Close</button>
              ) : (
                <>
                  <button className="px-5 py-2.5 border border-[#E5E7E5] text-[#6B7280] text-sm font-medium rounded-full hover:border-[#1FAA6F] transition-all">Mark Complete</button>
                  <button className="px-6 py-2.5 bg-[#1FAA6F] text-white text-sm font-semibold rounded-full hover:bg-[#0B3D2E] transition-all shadow-sm">Continue Working</button>
                </>
              )}
            </div>
          </div>
        </div>
      )})()}

      {/* AI Button */}
      <div className="fixed bottom-6 right-6 z-40">
        <button className="w-14 h-14 bg-white rounded-full shadow-lg flex items-center justify-center hover:scale-105 active:scale-95 transition-all border border-[#E5E7E5] overflow-hidden p-2.5">
          <img src="https://res.cloudinary.com/dwsl2ktt2/image/upload/v1783039077/AI_FLOATINGBUTTON_mt76nz.png" alt="AI" className="w-full h-full object-contain" />
        </button>
      </div>
    </div>
  )
}
