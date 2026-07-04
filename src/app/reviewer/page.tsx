'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Icon from '@/components/Icon'

interface ReviewItem {
  id: string
  initials: string
  client: string
  email: string
  taxYear: number
  returnType: string
  preparer: string
  assignedTo: string
  status: string
  hasNotes: boolean
}

export default function ReviewerPage() {
  const [search, setSearch] = useState('')
  const [reviews, setReviews] = useState<ReviewItem[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await fetch('/api/returns')
        if (res.ok) {
          const data = await res.json()
          setReviews(data.map((r: any) => ({
            id: r.id,
            initials: (r.clientName || '').split(' ').map((w: string) => w[0]).filter(Boolean).join('').slice(0, 2).toUpperCase() || '??',
            client: r.clientName || 'Unknown',
            email: r.clientEmail || '',
            taxYear: r.taxYear || new Date().getFullYear(),
            returnType: r.formCode || '1040',
            preparer: r.preparerName || 'Unassigned',
            assignedTo: r.reviewerName || 'Unassigned',
            status: r.status || 'draft',
            hasNotes: Boolean(r.notes),
          })))
        }
      } catch {} finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const filtered = reviews.filter((r) =>
    r.client.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-juno-light-green text-juno-dark-green px-3 py-1.5 rounded-lg text-sm font-medium">
            <span className="w-2 h-2 bg-juno-dark-green rounded-full" />
            Reviewer
          </div>
          <div className="flex items-center gap-1.5 text-sm text-dark-500">
            <Icon name="clock" className="w-4 h-4" />
            <span>0/5 Free Preparations started.</span>
          </div>
          <div className="text-sm text-dark-500">6d 5h Left in Your Trial</div>
        </div>
        <div className="w-8 h-8 bg-juno-dark-green rounded-full flex items-center justify-center text-white text-xs font-semibold">
          AN
        </div>
      </div>

      <div className="mb-6">
        <h1 className="text-2xl font-display font-bold text-dark-900">Reviewer Dashboard</h1>
      </div>

      <div className="card overflow-hidden">
        <div className="flex items-center gap-2 p-4 border-b border-dark-100">
          <Icon name="search" className="w-4 h-4 text-dark-400" />
          <input
            type="text"
            placeholder="Search Client Name"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-transparent border-none outline-none text-sm text-dark-900 placeholder-dark-400"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-dark-100 bg-dark-50">
                <th className="text-left px-6 py-3 text-xs font-medium text-dark-500 uppercase tracking-wider">Client</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-dark-500 uppercase tracking-wider">Tax Year</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-dark-500 uppercase tracking-wider">Return</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-dark-500 uppercase tracking-wider">Preparer</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-dark-500 uppercase tracking-wider">Assigned To</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-dark-500 uppercase tracking-wider">Status</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-dark-500 uppercase tracking-wider">Notes</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-dark-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-50">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-sm text-dark-400">Loading...</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-sm text-dark-400">No items to review.</td>
                </tr>
              ) : (
                filtered.map((r) => (
                  <tr key={r.id} className="hover:bg-dark-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <button onClick={() => router.push(`/returns/${r.id}`)} className="flex items-center gap-3 group text-left">
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
                    <td className="px-6 py-4 text-sm text-dark-600">{r.assignedTo}</td>
                    <td className="px-6 py-4">
                      <span className={`badge ${
                        r.status === 'completed' ? 'badge-green' :
                        r.status === 'in_review' ? 'badge-blue' :
                        'badge'
                      }`}>{r.status.split('_').map((w: string) => (w[0]?.toUpperCase() ?? '') + w.slice(1)).join(' ')}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-dark-400">
                      {r.hasNotes ? '📝' : '—'}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => router.push(`/returns/${r.id}`)}
                        className="inline-flex items-center gap-1.5 text-sm font-medium text-juno-dark-green hover:underline"
                      >
                        <Icon name="play" className="w-3.5 h-3.5" />
                        Review
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
