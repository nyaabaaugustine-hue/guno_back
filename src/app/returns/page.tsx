'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Icon from '@/components/Icon'

interface Return {
  id: string
  client: string
  form: string
  year: number
  preparer: string
  reviewer: string | null
  status: string
  updated: string
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
        <button onClick={() => router.push('/preparer')} className="btn btn-primary">
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
                  <th className="text-left px-6 py-3 text-xs font-medium text-dark-500 uppercase tracking-wider">Updated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-50">
                {returns.map((r) => (
                  <tr key={r.id} className="hover:bg-dark-50/50 transition-colors cursor-pointer" onClick={() => router.push('/returns')}>
                    <td className="px-6 py-4 text-sm font-medium text-juno-dark-green hover:underline">{r.client}</td>
                    <td className="px-6 py-4 text-sm text-dark-600">{r.form}</td>
                    <td className="px-6 py-4 text-sm text-dark-600">{r.year}</td>
                    <td className="px-6 py-4 text-sm text-dark-600">{r.preparer || '—'}</td>
                    <td className="px-6 py-4 text-sm text-dark-600">{r.reviewer || '—'}</td>
                    <td className="px-6 py-4">
                      <span className={`badge ${
                        r.status === 'Completed' ? 'badge-green' :
                        r.status === 'In Review' || r.status === 'in_review' ? 'badge-blue' :
                        r.status === 'Processing' || r.status === 'processing' ? 'badge-yellow' :
                        'badge'
                      }`}>{r.status}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-dark-500">{r.updated}</td>
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
