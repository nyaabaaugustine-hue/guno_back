'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Icon from '@/components/Icon'
import Modal from '@/components/Modal'

interface Preparation {
  id: string
  initials: string
  client: string
  email: string
  taxYear: number
  returnType: string
  preparer: string
  status: string
  notes: string | null
  hasNotes: boolean
}

const STATUS_FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'draft', label: 'Draft' },
  { value: 'in_review', label: 'In Review' },
  { value: 'processing', label: 'Processing' },
  { value: 'completed', label: 'Completed' },
]

function statusBadgeClass(status: string) {
  switch (status) {
    case 'completed': return 'badge-green'
    case 'in_review': return 'badge-blue'
    case 'processing': return 'badge-yellow'
    default: return 'badge'
  }
}

function statusLabel(status: string) {
  return status
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

export default function PreparerPage() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [preparations, setPreparations] = useState<Preparation[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Preparation | null>(null)
  const router = useRouter()
  const { data: session } = useSession()

  const userName = session?.user?.name || 'User'
  const userRole = session?.user?.role || 'Preparer'
  const initials = userName.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) || 'U'

  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await fetch('/api/returns')
        if (res.ok) {
          const data = await res.json()
          setPreparations(data.map((r: any) => ({
            id: r.id,
            initials: (r.clientName || r.client || '').split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase() || '??',
            client: r.clientName || r.client || 'Unknown',
            email: r.clientEmail || r.email || '',
            taxYear: r.taxYear || r.year || new Date().getFullYear(),
            returnType: r.formCode || r.form || '1040',
            preparer: r.preparerName || r.preparer || 'Unassigned',
            status: r.status || 'draft',
            notes: r.notes || null,
            hasNotes: Boolean(r.notes),
          })))
        }
      } catch {
        /* leave preparations empty on failure — table shows an empty state */
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const filtered = preparations.filter((r) => {
    const matchesSearch = r.client.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter === 'all' || r.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const counts = {
    all: preparations.length,
    draft: preparations.filter((r) => r.status === 'draft').length,
    in_review: preparations.filter((r) => r.status === 'in_review').length,
    processing: preparations.filter((r) => r.status === 'processing').length,
    completed: preparations.filter((r) => r.status === 'completed').length,
  }

  return (
    <div>
      {/* Trial Status Bar */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-juno-light-green text-juno-dark-green px-3 py-1.5 rounded-lg text-sm font-medium">
            <span className="w-2 h-2 bg-juno-dark-green rounded-full" />
            {userRole}
          </div>
          <div className="flex items-center gap-1.5 text-sm text-dark-500">
            <Icon name="clock" className="w-4 h-4" />
            <span>{Math.min(counts.completed, 5)}/5 Free Preparations started.</span>
          </div>
          <div className="text-sm text-dark-500">4d 12h Left in Your Trial</div>
        </div>
        <button
          onClick={() => router.push('/settings')}
          className="w-8 h-8 bg-juno-dark-green rounded-full flex items-center justify-center text-white text-xs font-semibold"
          title={userName}
        >
          {initials}
        </button>
      </div>

      {/* Page Title */}
      <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-display font-bold text-dark-900">Preparer Dashboard</h1>
          <p className="text-sm text-dark-500 mt-1">{preparations.length} preparation{preparations.length === 1 ? '' : 's'} in your pipeline</p>
        </div>
        <button onClick={() => router.push('/tax-preparation/new')} className="btn btn-primary">
          <Icon name="plus" className="w-4 h-4" />
          Start Tax Preparation
        </button>
      </div>

      {/* Status filter pills */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setStatusFilter(f.value)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              statusFilter === f.value
                ? 'bg-juno-dark-green text-white'
                : 'bg-dark-50 text-dark-600 hover:bg-dark-100'
            }`}
          >
            {f.label}
            {f.value !== 'all' && counts[f.value as keyof typeof counts] > 0 && (
              <span className="ml-1.5 opacity-75">{counts[f.value as keyof typeof counts]}</span>
            )}
          </button>
        ))}
      </div>

      {/* Table Card */}
      <div className="card overflow-hidden">
        {/* Search */}
        <div className="flex items-center justify-between p-4 border-b border-dark-100 flex-wrap gap-3">
          <div className="flex items-center gap-2 flex-1 min-w-[200px]">
            <Icon name="search" className="w-4 h-4 text-dark-400 shrink-0" />
            <input
              type="text"
              placeholder="Search Client Name"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 bg-transparent border-none outline-none text-sm text-dark-900 placeholder-dark-400"
              aria-label="Search clients"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-dark-100 bg-dark-50">
                <th className="text-left px-6 py-3 text-xs font-medium text-dark-500 uppercase tracking-wider">Client</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-dark-500 uppercase tracking-wider">Tax Year</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-dark-500 uppercase tracking-wider">Return</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-dark-500 uppercase tracking-wider">Preparer</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-dark-500 uppercase tracking-wider">Status</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-dark-500 uppercase tracking-wider">Notes/Comments</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-dark-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-50">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-sm text-dark-400">
                    <Icon name="refresh" className="w-5 h-5 text-dark-400 animate-spin mx-auto" />
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-sm text-dark-400">
                    {preparations.length === 0 ? 'No preparations yet. Start your first one above.' : 'No preparations match your search/filter.'}
                  </td>
                </tr>
              ) : (
                filtered.map((r) => (
                  <tr key={r.id} className="hover:bg-dark-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <button
                        onClick={() => setSelected(r)}
                        className="flex items-center gap-3 group text-left"
                      >
                        <div className="w-8 h-8 rounded-full bg-dark-100 flex items-center justify-center text-xs font-semibold text-dark-600 group-hover:bg-juno-light-green group-hover:text-juno-dark-green transition-colors shrink-0">
                          {r.initials}
                        </div>
                        <span className="text-sm font-medium text-dark-900 group-hover:text-juno-dark-green group-hover:underline transition-colors">
                          {r.client}
                        </span>
                      </button>
                    </td>
                    <td className="px-6 py-4 text-sm text-dark-600">{r.taxYear}</td>
                    <td className="px-6 py-4 text-sm text-dark-600">
                      <code className="text-xs font-mono font-medium text-dark-600 bg-dark-50 px-2 py-1 rounded-md">{r.returnType}</code>
                    </td>
                    <td className="px-6 py-4 text-sm text-dark-600">{r.preparer}</td>
                    <td className="px-6 py-4">
                      <span className={`badge ${statusBadgeClass(r.status)}`}>{statusLabel(r.status)}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-dark-400">
                      {r.hasNotes ? (
                        <span title={r.notes ?? ''}>📝</span>
                      ) : '—'}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => router.push(`/returns`)}
                        className="inline-flex items-center gap-1.5 text-sm font-medium text-juno-dark-green hover:underline"
                      >
                        <Icon name="play" className="w-3.5 h-3.5" />
                        Start
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* How to Evaluate Juno Info Card */}
      <div className="mt-6 card p-6">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 bg-juno-light-green rounded-lg flex items-center justify-center shrink-0 mt-0.5">
            <Icon name="info" className="w-4 h-4 text-juno-dark-green" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-dark-900 mb-2">How to Evaluate Juno</h3>
            <p className="text-xs text-dark-500 mb-4 leading-relaxed">
              Remember that Juno is here to save you and your team time. Start by giving Juno preparations
              that are indicative of the majority of your workload — not the hardest preparation you see all season.
            </p>
            <div className="relative pt-2">
              {/* Spectrum bar */}
              <div className="flex items-center justify-between text-xs text-dark-400 mb-1">
                <span>Easy Preparations</span>
                <span>Extremely Complicated Preparations</span>
              </div>
              <div className="relative h-6">
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-juno-green via-yellow-300 to-red-300 opacity-60"></div>
                <div className="absolute top-1/2 left-1/3 -translate-y-1/2 w-3 h-3 bg-juno-dark-green rounded-full border-2 border-white shadow-md"></div>
              </div>
              <div className="flex justify-between text-[10px] text-dark-400 mt-1">
                <span className="text-juno-dark-green font-medium">Juno Handles This</span>
                <span className="text-amber-600 font-medium">Juno Excels Here</span>
                <span className="text-red-500 font-medium">Best Handled Manually</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Client Detail Modal */}
      <Modal open={selected !== null} onClose={() => setSelected(null)} title={selected?.client ?? 'Preparation Details'}>
        {selected && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-juno-light-green flex items-center justify-center text-juno-dark-green text-sm font-semibold">
                {selected.initials}
              </div>
              <div>
                <p className="text-sm font-semibold text-dark-900">{selected.client}</p>
                {selected.email && <p className="text-xs text-dark-500">{selected.email}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-dark-400 uppercase tracking-wide mb-1">Tax Year</p>
                <p className="text-sm font-medium text-dark-900">{selected.taxYear}</p>
              </div>
              <div>
                <p className="text-xs text-dark-400 uppercase tracking-wide mb-1">Return Type</p>
                <code className="text-xs font-mono font-medium text-dark-600 bg-dark-50 px-2 py-1 rounded-md">{selected.returnType}</code>
              </div>
              <div>
                <p className="text-xs text-dark-400 uppercase tracking-wide mb-1">Preparer</p>
                <p className="text-sm font-medium text-dark-900">{selected.preparer}</p>
              </div>
              <div>
                <p className="text-xs text-dark-400 uppercase tracking-wide mb-1">Status</p>
                <span className={`badge ${statusBadgeClass(selected.status)}`}>{statusLabel(selected.status)}</span>
              </div>
            </div>

            <div>
              <p className="text-xs text-dark-400 uppercase tracking-wide mb-1">Notes / Comments</p>
              <p className="text-sm text-dark-700 bg-dark-50 rounded-lg px-3 py-2 min-h-[2.5rem]">
                {selected.notes || 'No notes yet.'}
              </p>
            </div>

            <div className="pt-2 flex gap-3">
              <button onClick={() => setSelected(null)} className="btn btn-secondary flex-1">Close</button>
              <button
                onClick={() => { router.push('/returns'); setSelected(null) }}
                className="btn btn-primary flex-1"
              >
                <Icon name="play" className="w-3.5 h-3.5" />
                Start Preparation
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
