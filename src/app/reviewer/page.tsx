'use client'

import { useState } from 'react'
import { Search, Clock, Play } from 'lucide-react'

const reviews = [
  {
    id: '1',
    initials: 'JP',
    client: 'John Doe - Demo Preparation',
    email: 'jdoe@juno.tax',
    taxYear: 2025,
    returnType: '1040',
    preparer: 'David Haase',
    assignedTo: '•',
    status: 'Demo Preparation',
    hasNotes: false,
  },
  {
    id: '2',
    initials: 'DC',
    client: 'Demo Corporation',
    email: 'dcorp@juno.tax',
    taxYear: 2025,
    returnType: '1120-S',
    preparer: 'David Haase',
    assignedTo: '•',
    status: 'Demo Preparation',
    hasNotes: false,
  },
]

export default function ReviewerPage() {
  const [search, setSearch] = useState('')

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
            <Clock className="w-4 h-4" />
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
          <Search className="w-4 h-4 text-dark-400" />
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
              {filtered.map((r) => (
                <tr key={r.id} className="hover:bg-dark-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-dark-100 flex items-center justify-center text-xs font-semibold text-dark-600">
                        {r.initials}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-dark-900">{r.client}</p>
                        <p className="text-xs text-dark-400">{r.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-dark-600">{r.taxYear}</td>
                  <td className="px-6 py-4 text-sm text-dark-600">{r.returnType}</td>
                  <td className="px-6 py-4 text-sm text-dark-600">{r.preparer}</td>
                  <td className="px-6 py-4 text-sm text-dark-600">{r.assignedTo}</td>
                  <td className="px-6 py-4">
                    <span className="badge badge-blue">{r.status}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-dark-400">
                    {r.hasNotes ? '📝' : '—'}
                  </td>
                  <td className="px-6 py-4">
                    <button className="inline-flex items-center gap-1.5 text-sm font-medium text-juno-dark-green hover:underline">
                      <Play className="w-3.5 h-3.5" />
                      View Tutorial
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
