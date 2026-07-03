'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { cn } from '@/lib/utils'
import {
  Search, ChevronLeft, ChevronRight, Eye, FileText, CheckCheck,
  X, Loader2, User, Clock, ChevronDown, LogOut, Settings,
  Shield, ThumbsUp, AlertTriangle, ArrowUpRight
} from 'lucide-react'

const STATUS_LABELS: Record<string, string> = {
  draft: 'Draft', in_review: 'In Progress', completed: 'Ready for Review',
  filed: 'Filed', amended: 'Amended',
}
const STATUS_STYLES: Record<string, string> = {
  'In Progress': 'bg-[#1FAA6F]/10 text-[#1FAA6F]',
  'Draft': 'bg-amber-50 text-amber-600',
  'Ready for Review': 'bg-blue-50 text-blue-600',
  'Filed': 'bg-purple-50 text-purple-600',
  'Amended': 'bg-red-50 text-red-500',
}

interface ReviewItem {
  id: string; clientName: string; clientEmail: string; initials: string
  formCode: string; taxYear: number; preparerName: string | null
  status: string; notes: string | null; reviewNotes?: string
}

export default function ReviewerPage() {
  const { data: session } = useSession()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const perPage = 10
  const [reviews, setReviews] = useState<ReviewItem[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedReview, setSelectedReview] = useState<ReviewItem | null>(null)
  const [profileOpen, setProfileOpen] = useState(false)
  const profileRef = useRef<HTMLDivElement>(null)
  const [filter, setFilter] = useState<'all' | 'ready'>('ready')

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
      .then((data: ReviewItem[]) => { setReviews(Array.isArray(data) ? data : []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const userName = session?.user?.name || 'User'
  const userEmail = session?.user?.email || ''
  const userRole = session?.user?.role || 'reviewer'
  const roleLabel = userRole === 'firm_admin' ? 'Org Admin' : userRole === 'admin' ? 'Admin' : userRole.charAt(0).toUpperCase() + userRole.slice(1)
  const initials = userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)

  const readyCount = reviews.filter(r => r.status === 'completed').length
  const filtered = reviews.filter(r => {
    const matchesSearch = r.clientName?.toLowerCase().includes(search.toLowerCase())
    if (filter === 'ready') return matchesSearch && r.status === 'completed'
    return matchesSearch
  })
  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage))
  const paged = filtered.slice((page - 1) * perPage, page * perPage)

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="flex items-center gap-3">
        <div className="flex-1 flex items-center gap-2 px-4 py-2.5 bg-white rounded-2xl border border-[#E5E7E5] shadow-[0_2px_8px_rgba(0,0,0,.05)]">
          <div className="flex items-center gap-2 px-3 py-1 rounded-lg text-xs font-semibold bg-[#E8F5E8] text-[#0B3D2E]">
            <span className="w-1.5 h-1.5 bg-[#0B3D2E] rounded-full" />Reviewer
          </div>
          <CheckCheck className="w-3.5 h-3.5 text-[#6B7280]" />
          <span className="text-xs text-[#6B7280]">{readyCount} ready for review</span>
          <span className="text-xs text-[#9CA3AF]">|</span>
          <span className="text-xs text-[#6B7280]">{reviews.length - readyCount} in progress</span>
        </div>
        <div className="relative" ref={profileRef}>
          <button onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2 p-1.5 bg-white rounded-2xl border border-[#E5E7E5] shadow-[0_2px_8px_rgba(0,0,0,.05)] hover:border-[#1FAA6F] transition-all">
            <div className="w-8 h-8 bg-gradient-to-br from-[#0B3D2E] to-[#1FAA6F] rounded-full flex items-center justify-center text-white text-xs font-semibold shadow-sm">{initials}</div>
            <div className="hidden sm:block text-left mr-1">
              <p className="text-sm font-medium text-[#1A1D1B] leading-tight">{userName}</p>
              <p className="text-[10px] text-[#6B7280] font-medium">{roleLabel}</p>
            </div>
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
              <div className="px-4 py-2 border-b border-[#E5E7E5]">
                <div className="flex items-center gap-2 text-xs text-[#6B7280]"><Shield className="w-3.5 h-3.5" /><span>{roleLabel}</span></div>
              </div>
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
          <h1 className="text-[28px] font-bold text-[#1A1D1B] tracking-tight">Review Queue</h1>
          <p className="text-sm text-[#6B7280] mt-1">{readyCount} return{readyCount !== 1 ? 's' : ''} awaiting your review</p>
        </div>
        <div className="flex items-center gap-2 bg-white border border-[#E5E7E5] rounded-full p-0.5 shadow-[0_2px_8px_rgba(0,0,0,.05)]">
          {(['ready', 'all'] as const).map(f => (
            <button key={f} onClick={() => { setFilter(f); setPage(1) }}
              className={cn('px-4 py-2 text-xs font-semibold rounded-full transition-all capitalize', filter === f ? 'bg-[#0B3D2E] text-white shadow-sm' : 'text-[#6B7280] hover:text-[#1A1D1B]')}>{f}</button>
          ))}
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-[320px]">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280]" />
        <input type="text" placeholder="Search client name..." value={search} onChange={e => { setSearch(e.target.value); setPage(1) }}
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#E5E7E5] rounded-full text-sm text-[#1A1D1B] placeholder-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#1FAA6F]/20 focus:border-[#1FAA6F] transition-all" />
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Ready for Review', value: readyCount, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'In Progress', value: reviews.filter(r => r.status === 'in_review').length, color: 'text-[#1FAA6F]', bg: 'bg-[#1FAA6F]/10' },
          { label: 'Filed', value: reviews.filter(r => r.status === 'filed').length, color: 'text-purple-600', bg: 'bg-purple-50' },
          { label: 'Total Returns', value: reviews.length, color: 'text-[#1A1D1B]', bg: 'bg-[#E8F5E8]' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl border border-[#E5E7E5] p-4 shadow-[0_2px_8px_rgba(0,0,0,.05)]">
            <p className="text-xs text-[#6B7280] font-medium uppercase tracking-wider mb-1.5">{s.label}</p>
            <p className={cn('text-2xl font-bold', s.color)}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-[#E5E7E5] shadow-[0_2px_8px_rgba(0,0,0,.05)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[#F7F9F8] border-b border-[#E5E7E5]">
                {['Client', 'Return', 'Tax Year', 'Preparer', 'Status', 'Notes', 'Actions'].map(h => (
                  <th key={h} className={cn('px-4 py-3.5 text-[13px] font-medium text-[#6B7280] uppercase tracking-wider', h === 'Actions' ? 'text-right' : 'text-left')}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7E5]">
              {loading ? (
                <tr><td colSpan={7} className="px-4 py-12 text-center text-sm text-[#6B7280]"><Loader2 className="w-5 h-5 animate-spin inline-block mr-2" />Loading reviews...</td></tr>
              ) : paged.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-12 text-center">
                  <CheckCheck className="w-10 h-10 text-[#D1D5DB] mx-auto mb-2" />
                  <p className="text-sm text-[#6B7280]">{filter === 'ready' ? 'No returns ready for review' : 'No returns found'}</p>
                </td></tr>
              ) : paged.map(r => {
                const ds = STATUS_LABELS[r.status] ?? r.status
                return (
                <tr key={r.id} onClick={() => setSelectedReview(r)} className="group hover:bg-[#F7F9F8] transition-colors duration-150 cursor-pointer">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#0B3D2E] to-[#1FAA6F] flex items-center justify-center text-white text-xs font-semibold shrink-0 shadow-sm">{r.initials}</div>
                      <div><p className="text-sm font-medium text-[#1A1D1B] group-hover:text-[#1FAA6F] transition-colors">{r.clientName}</p><p className="text-xs text-[#6B7280]">{r.clientEmail}</p></div>
                    </div>
                  </td>
                  <td className="px-4 py-3"><code className="text-xs font-mono font-semibold text-[#0B3D2E] bg-[#E8F5E8] px-2.5 py-1 rounded-lg">{r.formCode}</code></td>
                  <td className="px-4 py-3 text-sm font-medium text-[#1A1D1B]">{r.taxYear}</td>
                  <td className="px-4 py-3">
                    {r.preparerName ? (
                      <div className="flex items-center gap-2"><div className="w-5 h-5 rounded-full bg-gradient-to-br from-[#0B3D2E] to-[#1FAA6F] flex items-center justify-center text-[8px] text-white font-semibold">{r.preparerName.split(' ').map(n=>n[0]).join('').slice(0,2)}</div><span className="text-sm text-[#1A1D1B]">{r.preparerName}</span></div>
                    ) : <span className="inline-flex items-center gap-1 text-xs text-[#9CA3AF] bg-[#F7F9F8] px-2 py-0.5 rounded-full"><User className="w-3 h-3" />Unassigned</span>}
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn('inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium', STATUS_STYLES[ds])}>
                      {ds === 'In Progress' && <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />}{ds}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-[#6B7280]">
                    {r.notes ? <button className="inline-flex items-center gap-1 text-[#1FAA6F] hover:underline text-xs font-medium"><FileText className="w-3.5 h-3.5" />View</button>
                    : <span className="text-[#D1D5DB]">{'\u2014'}</span>}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button className="p-2 text-[#9CA3AF] hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-all" title="View Details"><Eye className="w-4 h-4" /></button>
                      {r.status === 'completed' && (
                        <>
                          <button className="p-2 text-[#9CA3AF] hover:text-[#1FAA6F] hover:bg-[#1FAA6F]/10 rounded-lg transition-all" title="Approve"><ThumbsUp className="w-4 h-4" /></button>
                          <button className="p-2 text-[#9CA3AF] hover:text-red-500 hover:bg-red-50 rounded-lg transition-all" title="Request Changes"><AlertTriangle className="w-4 h-4" /></button>
                        </>
                      )}
                    </div>
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

      {/* Modal */}
      {selectedReview && (() => {
        const ds = STATUS_LABELS[selectedReview.status] ?? selectedReview.status
        return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30" onClick={e => { if (e.target === e.currentTarget) setSelectedReview(null) }}>
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden">
            <div className="relative bg-gradient-to-r from-[#0B3D2E] to-[#1FAA6F] px-6 pt-6 pb-16">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-white text-xl font-bold">{selectedReview.initials}</div>
                <div className="text-white">
                  <h2 className="text-xl font-bold">{selectedReview.clientName}</h2>
                  <p className="text-sm text-white/80">{selectedReview.clientEmail}</p>
                  <div className="flex gap-2 mt-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-medium bg-white/20 text-white">{ds}</span>
                    <code className="text-xs font-mono bg-white/20 text-white px-2 py-0.5 rounded-full">{selectedReview.formCode}</code>
                  </div>
                </div>
              </div>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><p className="text-xs text-[#6B7280] font-medium uppercase tracking-wider">Tax Year</p><p className="text-sm text-[#1A1D1B] font-medium">{selectedReview.taxYear}</p></div>
                <div><p className="text-xs text-[#6B7280] font-medium uppercase tracking-wider">Preparer</p><p className="text-sm text-[#1A1D1B]">{selectedReview.preparerName ?? '\u2014'}</p></div>
              </div>
              {selectedReview.notes && (
                <div><p className="text-xs text-[#6B7280] font-medium uppercase tracking-wider mb-1">Preparer Notes</p><p className="text-sm text-[#6B7280] italic bg-[#F7F9F8] rounded-xl p-3">{selectedReview.notes}</p></div>
              )}
              <div><p className="text-xs text-[#6B7280] font-medium uppercase tracking-wider mb-1">Review Notes</p><textarea rows={3} placeholder="Add review notes..." className="w-full px-3 py-2.5 bg-[#F7F9F8] border border-[#E5E7E5] rounded-xl text-sm text-[#1A1D1B] placeholder-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#1FAA6F]/20 focus:border-[#1FAA6F] transition-all resize-none" /></div>
              <div className="flex gap-3 pt-1">
                <button className="flex-1 px-4 py-2.5 bg-[#1FAA6F] text-white text-sm font-semibold rounded-full hover:bg-[#0B3D2E] transition-all"><ThumbsUp className="w-4 h-4 inline-block mr-1.5 -mt-0.5" />Approve</button>
                <button className="px-4 py-2.5 border border-amber-200 text-amber-600 text-sm font-medium rounded-full hover:bg-amber-50 transition-all"><AlertTriangle className="w-4 h-4 inline-block mr-1.5 -mt-0.5" />Request Changes</button>
                <button className="px-4 py-2.5 border border-red-200 text-red-500 text-sm font-medium rounded-full hover:bg-red-50 transition-all"><X className="w-4 h-4 inline-block mr-1.5 -mt-0.5" />Reject</button>
              </div>
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
