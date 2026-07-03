'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { cn } from '@/lib/utils'
import {
  Search, Play, Info, ChevronLeft, ChevronRight, Eye, FileText,
  MessageCircle, ArrowUpRight, CalendarDays, User, Clock, Loader2,
  ChevronDown, LogOut, Settings, Shield
} from 'lucide-react'

const STATUS_LABELS: Record<string, string> = {
  draft: 'Draft', in_review: 'In Progress', completed: 'Completed',
  filed: 'Filed', amended: 'Amended',
}
const statusStyles: Record<string, string> = {
  'In Progress': 'bg-[#1FAA6F]/10 text-[#1FAA6F]',
  'Draft': 'bg-amber-50 text-amber-600',
  'Pending': 'bg-amber-50 text-amber-600',
  'Completed': 'bg-blue-50 text-blue-600',
  'Filed': 'bg-purple-50 text-purple-600',
  'Amended': 'bg-red-50 text-red-500',
}
const complexityMap: Record<string, string> = {
  '1040': 'Easy', '1040-SR': 'Easy', '1120': 'Complex', '1120-S': 'Medium', '1065': 'Medium',
}
const complexityStyles: Record<string, string> = {
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
  const [currentPage, setCurrentPage] = useState(1)
  const totalPages = 3
  const [preparations, setPreparations] = useState<ReturnItem[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPrep, setSelectedPrep] = useState<ReturnItem | null>(null)
  const [profileOpen, setProfileOpen] = useState(false)
  const profileRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const userName = session?.user?.name || 'User'
  const userEmail = session?.user?.email || 'user@example.com'
  const userRole = session?.user?.role || 'preparer'
  const roleLabel = userRole === 'firm_admin' ? 'Org Admin' : userRole === 'admin' ? 'Admin' : userRole.charAt(0).toUpperCase() + userRole.slice(1)
  const initials = userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)

  useEffect(() => {
    fetch('/api/returns')
      .then(r => r.json())
      .then((data: ReturnItem[]) => {
        setPreparations(Array.isArray(data) ? data : [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const filtered = preparations.filter((r) => {
    const label = STATUS_LABELS[r.status] ?? r.status
    const matchesSearch = r.clientName?.toLowerCase().includes(search.toLowerCase())
    const matchesShowAll = showAll || label === 'In Progress'
    return matchesSearch && matchesShowAll
  })

  return (
    <div className="space-y-6">
      {/* Trial Status + Profile */}
      <div className="flex items-center gap-3">
        <div className="flex-1 flex items-center gap-2 px-4 py-2.5 bg-white rounded-2xl border border-[#E5E7E5] shadow-[0_2px_8px_rgba(0,0,0,.05)]">
          <div className="flex items-center gap-2 px-3 py-1 rounded-lg text-xs font-semibold bg-[#E8F5E8] text-[#0B3D2E]">
            <span className="w-1.5 h-1.5 bg-[#0B3D2E] rounded-full" />
            Preparer
          </div>
          <div className="flex items-center gap-1.5 text-xs text-[#6B7280]">
            <Clock className="w-3.5 h-3.5" />
            <span>0/5 Free Preparations started</span>
          </div>
          <span className="text-xs text-[#9CA3AF]">|</span>
          <span className="text-xs text-amber-600 font-medium">4d 12h left in trial</span>
          <button className="ml-auto text-[11px] font-semibold text-white bg-[#0B3D2E] px-3 py-1 rounded-full hover:bg-[#1FAA6F] transition-colors">
            Upgrade
          </button>
        </div>
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2 p-1.5 bg-white rounded-2xl border border-[#E5E7E5] shadow-[0_2px_8px_rgba(0,0,0,.05)] hover:border-[#1FAA6F] transition-all"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-[#0B3D2E] to-[#1FAA6F] rounded-full flex items-center justify-center text-white text-xs font-semibold shadow-sm">
              {initials}
            </div>
            <div className="hidden sm:block text-left mr-1">
              <p className="text-sm font-medium text-[#1A1D1B] leading-tight">{userName}</p>
              <p className="text-[10px] text-[#6B7280] font-medium">{roleLabel}</p>
            </div>
            <ChevronDown className={cn('w-4 h-4 text-[#6B7280] transition-transform duration-200 shrink-0', profileOpen && 'rotate-180')} />
          </button>
          {profileOpen && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl border border-[#E5E7E5] shadow-lg py-2 z-50">
              <div className="px-4 py-3 border-b border-[#E5E7E5]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#0B3D2E] to-[#1FAA6F] rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0">
                    {initials}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#1A1D1B]">{userName}</p>
                    <p className="text-xs text-[#6B7280]">{userEmail}</p>
                  </div>
                </div>
              </div>
              <div className="px-4 py-2 border-b border-[#E5E7E5]">
                <div className="flex items-center gap-2 text-xs text-[#6B7280]">
                  <Shield className="w-3.5 h-3.5" />
                  <span>{roleLabel}</span>
                </div>
              </div>
              <Link href="/settings" className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#6B7280] hover:bg-[#F7F9F8] hover:text-[#1A1D1B] transition-colors">
                <Settings className="w-4 h-4" />
                Settings
              </Link>
              <button
                onClick={() => signOut({ redirect: false }).then(() => window.location.href = '/auth/signin')}
                className="flex items-center gap-3 w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[28px] font-bold text-[#1A1D1B] tracking-tight">Preparer Dashboard</h1>
          <p className="text-sm text-[#6B7280] mt-1">Manage and track tax return preparations</p>
        </div>
        <button className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1FAA6F] text-white text-sm font-semibold rounded-full hover:bg-[#0B3D2E] transition-all duration-200 shadow-sm">
          <FileText className="w-4 h-4" />
          New Preparation
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-[320px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280]" />
          <input
            type="text"
            placeholder="Search client name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#E5E7E5] rounded-full text-sm text-[#1A1D1B] placeholder-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#1FAA6F]/20 focus:border-[#1FAA6F] transition-all"
          />
        </div>
        <label className="flex items-center gap-2 ml-auto cursor-pointer select-none">
          <span className="text-sm text-[#6B7280]">Show all preparations</span>
          <button
            onClick={() => setShowAll(!showAll)}
            className={cn(
              'relative w-10 h-5 rounded-full transition-colors duration-200',
              showAll ? 'bg-[#1FAA6F]' : 'bg-[#E5E7E5]'
            )}
          >
            <span className={cn(
              'absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-200',
              showAll && 'translate-x-5'
            )} />
          </button>
        </label>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-[#E5E7E5] shadow-[0_2px_8px_rgba(0,0,0,.05)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[#F7F9F8] border-b border-[#E5E7E5]">
                <th className="text-left px-4 py-3.5 text-[13px] font-medium text-[#6B7280] uppercase tracking-wider">Client</th>
                <th className="text-left px-4 py-3.5 text-[13px] font-medium text-[#6B7280] uppercase tracking-wider">Tax Year</th>
                <th className="text-left px-4 py-3.5 text-[13px] font-medium text-[#6B7280] uppercase tracking-wider">Return</th>
                <th className="text-left px-4 py-3.5 text-[13px] font-medium text-[#6B7280] uppercase tracking-wider">Preparer</th>
                <th className="text-left px-4 py-3.5 text-[13px] font-medium text-[#6B7280] uppercase tracking-wider">Complexity</th>
                <th className="text-left px-4 py-3.5 text-[13px] font-medium text-[#6B7280] uppercase tracking-wider">Status</th>
                <th className="text-left px-4 py-3.5 text-[13px] font-medium text-[#6B7280] uppercase tracking-wider">Notes</th>
                <th className="text-right px-4 py-3.5 text-[13px] font-medium text-[#6B7280] uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7E5]">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-sm text-[#6B7280]">
                    <Loader2 className="w-5 h-5 animate-spin inline-block mr-2" />
                    Loading preparations...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-sm text-[#6B7280]">
                    No preparations found.
                  </td>
                </tr>
              ) : filtered.map((r) => {
                const displayStatus = STATUS_LABELS[r.status] ?? r.status
                const complexity = complexityMap[r.formCode] ?? 'Medium'
                return (
                <tr
                  key={r.id}
                  onClick={() => setSelectedPrep(r)}
                  className="group hover:bg-[#F7F9F8] transition-colors duration-150 cursor-pointer"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#0B3D2E] to-[#1FAA6F] flex items-center justify-center text-white text-xs font-semibold shrink-0 shadow-sm">
                        {r.initials}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-[#1A1D1B] group-hover:text-[#1FAA6F] transition-colors">{r.clientName}</p>
                        <p className="text-xs text-[#6B7280]">{r.clientEmail}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-[#1A1D1B]">{r.taxYear}</td>
                  <td className="px-4 py-3">
                    <code className="text-xs font-mono font-semibold text-[#0B3D2E] bg-[#E8F5E8] px-2.5 py-1 rounded-lg">{r.formCode}</code>
                  </td>
                  <td className="px-4 py-3">
                    {r.preparerName ? (
                      <span className="text-sm text-[#1A1D1B]">{r.preparerName}</span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs text-[#9CA3AF] bg-[#F7F9F8] px-2 py-0.5 rounded-full">
                        <User className="w-3 h-3" />
                        Unassigned
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn('inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium', complexityStyles[complexity])}>
                      {complexity}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn('inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium', statusStyles[displayStatus])}>
                      {displayStatus === 'In Progress' && <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />}
                      {displayStatus}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-[#6B7280]">
                    {r.notes ? (
                      <button className="inline-flex items-center gap-1 text-[#1FAA6F] hover:underline text-xs font-medium">
                        <FileText className="w-3.5 h-3.5" /> View Notes
                      </button>
                    ) : (
                      <span className="text-[#D1D5DB]">{'\u2014'}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button className="p-2 text-[#9CA3AF] hover:text-[#1FAA6F] hover:bg-[#1FAA6F]/10 rounded-lg transition-all" title="View Details">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#0B3D2E] text-white text-xs font-semibold rounded-full hover:bg-[#1FAA6F] transition-all shadow-sm">
                        <Play className="w-3.5 h-3.5" />
                        Start
                      </button>
                    </div>
                  </td>
                </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-[#E5E7E5] bg-[#F7F9F8]">
          <span className="text-sm text-[#6B7280]">Page {currentPage} of {totalPages}</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg border border-[#E5E7E5] text-[#6B7280] hover:border-[#1FAA6F] hover:text-[#1FAA6F] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={cn(
                  'w-8 h-8 rounded-lg text-sm font-medium transition-all',
                  currentPage === page ? 'bg-[#1FAA6F] text-white' : 'text-[#6B7280] hover:bg-[#F7F9F8] border border-[#E5E7E5]'
                )}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg border border-[#E5E7E5] text-[#6B7280] hover:border-[#1FAA6F] hover:text-[#1FAA6F] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* How to Evaluate Juno Info Card */}
      <div className="bg-white rounded-2xl border border-[#E5E7E5] shadow-[0_2px_8px_rgba(0,0,0,.05)] p-6">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 bg-[#E8F5E8] rounded-xl flex items-center justify-center shrink-0 mt-0.5">
            <Info className="w-5 h-5 text-[#0B3D2E]" />
          </div>
          <div className="flex-1">
            <h3 className="text-base font-semibold text-[#1A1D1B] mb-2">How to Evaluate Juno</h3>
            <p className="text-sm text-[#6B7280] mb-4 leading-relaxed">
              Remember that Juno is here to save you and your team time. Start by giving Juno preparations
              that are indicative of the majority of your workload — not the hardest preparation you see all season.
            </p>
            <div className="relative pt-2">
              <div className="flex items-center justify-between text-xs text-[#6B7280] mb-1">
                <span>Easy Preparations</span>
                <span>Extremely Complicated Preparations</span>
              </div>
              <div className="relative h-6">
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#1FAA6F] via-[#E8F5E8] to-[#EF6B6B] opacity-60" />
                <div className="absolute top-1/2 left-1/3 -translate-y-1/2 w-3 h-3 bg-[#0B3D2E] rounded-full border-2 border-white shadow-md" />
              </div>
              <div className="flex justify-between text-[10px] text-[#6B7280] mt-1">
                <span className="text-[#0B3D2E] font-medium">Juno Handles This</span>
                <span className="text-amber-600 font-medium">Juno Excels Here</span>
                <span className="text-red-500 font-medium">Best Handled Manually</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Preparation Detail Modal */}
      {selectedPrep && (() => {
        const displayStatus = STATUS_LABELS[selectedPrep.status] ?? selectedPrep.status
        const complexity = complexityMap[selectedPrep.formCode] ?? 'Medium'
        return (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30"
          onClick={(e) => { if (e.target === e.currentTarget) setSelectedPrep(null) }}
        >
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden">
            <div className="relative bg-gradient-to-r from-[#0B3D2E] to-[#1FAA6F] px-6 pt-6 pb-16">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-white text-xl font-bold">
                  {selectedPrep.initials}
                </div>
                <div className="text-white">
                  <h2 className="text-xl font-bold">{selectedPrep.clientName}</h2>
                  <p className="text-sm text-white/80">{selectedPrep.clientEmail}</p>
                  <span className={cn(
                    'inline-flex items-center gap-1.5 px-3 py-0.5 mt-2 rounded-full text-xs font-medium',
                    displayStatus === 'In Progress' ? 'bg-white/20 text-white' :
                    displayStatus === 'Draft' ? 'bg-amber-400/30 text-amber-100' :
                    'bg-blue-400/30 text-blue-100'
                  )}>
                    {displayStatus}
                  </span>
                </div>
              </div>
            </div>

            <div className="px-6 py-5 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <CalendarDays className="w-4 h-4 text-[#6B7280] mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-[#6B7280] font-medium uppercase tracking-wider">Tax Year</p>
                    <p className="text-sm text-[#1A1D1B]">{selectedPrep.taxYear}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <FileText className="w-4 h-4 text-[#6B7280] mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-[#6B7280] font-medium uppercase tracking-wider">Return Type</p>
                    <p className="text-sm font-mono text-[#1A1D1B]">{selectedPrep.formCode}</p>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <User className="w-4 h-4 text-[#6B7280] mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-[#6B7280] font-medium uppercase tracking-wider">Preparer</p>
                    <p className="text-sm text-[#1A1D1B]">{selectedPrep.preparerName ?? '\u2014'}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="w-4 h-4 text-[#6B7280] mt-0.5 shrink-0">
                    <svg viewBox="0 0 20 20" fill="currentColor"><path d="M10 1a1 1 0 011 1v1.5a1 1 0 11-2 0V2a1 1 0 011-1zM4.5 4.5a1 1 0 011.414 0l1.06 1.06a1 1 0 11-1.414 1.414L4.5 5.914a1 1 0 010-1.414zM15.5 4.5a1 1 0 010 1.414l-1.06 1.06a1 1 0 11-1.414-1.414l1.06-1.06a1 1 0 011.414 0zM10 6a4 4 0 100 8 4 4 0 000-8z" /></svg>
                  </span>
                  <div>
                    <p className="text-xs text-[#6B7280] font-medium uppercase tracking-wider">Complexity</p>
                    <p className="text-sm text-[#1A1D1B]">{complexity}</p>
                  </div>
                </div>
              </div>

              {selectedPrep.notes && (
                <div className="flex items-start gap-3">
                  <FileText className="w-4 h-4 text-[#6B7280] mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-[#6B7280] font-medium uppercase tracking-wider">Notes</p>
                    <p className="text-sm text-[#6B7280] italic">{selectedPrep.notes}</p>
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button className="flex-1 px-4 py-2.5 bg-[#1FAA6F] text-white text-sm font-semibold rounded-full hover:bg-[#0B3D2E] transition-all">
                  <Play className="w-4 h-4 inline-block mr-1.5 -mt-0.5" />
                  Start Preparation
                </button>
                <button className="flex-1 px-4 py-2.5 border border-[#E5E7E5] text-[#6B7280] text-sm font-medium rounded-full hover:border-[#1FAA6F] hover:text-[#1FAA6F] transition-all">
                  View Details
                </button>
              </div>
            </div>
          </div>
        </div>
        )
      })()}

      {/* Floating AI Button */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-3">
        <button className="w-10 h-10 bg-white border border-[#E5E7E5] rounded-full shadow-md flex items-center justify-center text-[#6B7280] hover:text-[#1FAA6F] hover:border-[#1FAA6F] transition-all">
          <ArrowUpRight className="w-4 h-4" />
        </button>
        <button className="w-14 h-14 bg-[#0B3D2E] rounded-full shadow-lg flex items-center justify-center text-white hover:bg-[#1FAA6F] transition-all duration-200 hover:scale-105 active:scale-95">
          <MessageCircle className="w-6 h-6" />
        </button>
      </div>
    </div>
  )
}
