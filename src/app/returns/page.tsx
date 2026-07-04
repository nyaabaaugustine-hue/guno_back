'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Icon from '@/components/Icon'

interface Return {
  id: string
  clientName: string
  formCode: string
  taxYear: number
  preparerName: string | null
  reviewerName: string | null
  status: string
}

export default function ReturnsPage() {
  const [returns, setReturns] = useState<Return[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const loadReturns = async () => {
      try {
        const res = await fetch('/api/returns')
        if (res.ok) {
          const data = await res.json()
          setReturns(data)
        }
      } catch {} finally {
        setLoading(false)
      }
    }
    loadReturns()
  }, [])

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-display font-bold text-dark-900">Tax Returns</h1>
          <p className="text-dark-500 text-sm mt-1">Create, review, and manage tax returns</p>
        </div>
        <button onClick={() => router.push('/tax-preparation/new')} className="btn btn-primary">
          <Icon name="plus" className="w-4 h-4" />
          New Return
        </button>
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Icon name="refresh" className="w-5 h-5 text-dark-400 animate-spin" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-dark-100 bg-dark-50">
                  <th className="text-left px-6 py-3 text-xs font-medium text-dark-500 uppercase tracking-wider">Client</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-dark-500 uppercase tracking-wider">Form</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-dark-500 uppercase tracking-wider">Year</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-dark-500 uppercase tracking-wider">Preparer</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-dark-500 uppercase tracking-wider">Reviewer</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-dark-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-50">
                {returns.map((r) => (
                  <tr key={r.id} className="hover:bg-dark-50/50 transition-colors cursor-pointer" onClick={() => router.push(`/returns/${r.id}`)}>
                    <td className="px-6 py-4 text-sm font-medium text-juno-dark-green hover:underline">{r.clientName}</td>
                    <td className="px-6 py-4 text-sm text-dark-600">
                      <code className="text-xs font-mono font-medium text-dark-600 bg-dark-50 px-2 py-1 rounded-md">{r.formCode}</code>
                    </td>
                    <td className="px-6 py-4 text-sm text-dark-600">{r.taxYear}</td>
                    <td className="px-6 py-4 text-sm text-dark-600">{r.preparerName || '—'}</td>
                    <td className="px-6 py-4 text-sm text-dark-600">{r.reviewerName || '—'}</td>
                    <td className="px-6 py-4">
                      <span className={`badge ${
                        r.status === 'completed' ? 'badge-green' :
                        r.status === 'in_review' ? 'badge-blue' :
                        r.status === 'processing' ? 'badge-yellow' :
                        'badge'
                      }`}>{r.status.split('_').map(w => (w[0]?.toUpperCase() ?? '') + w.slice(1)).join(' ')}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
