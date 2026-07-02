'use client'

import { useState } from 'react'
import Icon from '@/components/Icon'

const preparations = [
  {
    id: '1',
    initials: 'JP',
    client: 'John Doe - Demo Preparation',
    email: 'jdoe@juno.tax',
    taxYear: 2025,
    returnType: '1040',
    preparer: '•',
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
    preparer: '•',
    status: 'Demo Preparation',
    hasNotes: false,
  },
]

export default function PreparerPage() {
  const [search, setSearch] = useState('')
  const [showAll, setShowAll] = useState(false)

  const filtered = preparations.filter((r) => {
    const matchesSearch = r.client.toLowerCase().includes(search.toLowerCase())
    const matchesShowAll = showAll || r.status === 'Demo Preparation'
    return matchesSearch && matchesShowAll
  })

  return (
    <div>
      {/* Trial Status Bar */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-juno-light-green text-juno-dark-green px-3 py-1.5 rounded-lg text-sm font-medium">
            <span className="w-2 h-2 bg-juno-dark-green rounded-full" />
            Preparer
          </div>
          <div className="flex items-center gap-1.5 text-sm text-dark-500">
            <Icon name="clock" className="w-4 h-4" />
            <span>0/5 Free Preparations started.</span>
          </div>
          <div className="text-sm text-dark-500">4d 12h Left in Your Trial</div>
        </div>
        <div className="w-8 h-8 bg-juno-dark-green rounded-full flex items-center justify-center text-white text-xs font-semibold">
          AN
        </div>
      </div>

      {/* Page Title */}
      <div className="mb-6">
        <h1 className="text-2xl font-display font-bold text-dark-900">Preparer Dashboard</h1>
      </div>

      {/* Table Card */}
      <div className="card overflow-hidden">
        {/* Search + Filter */}
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
          <label className="flex items-center gap-2 text-sm text-dark-600 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={showAll}
              onChange={(e) => setShowAll(e.target.checked)}
              className="rounded border-dark-300 text-juno-dark-green focus:ring-juno-green/20"
            />
            Show all preparations
          </label>
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
                  <td className="px-6 py-4">
                    <span className="badge badge-blue">{r.status}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-dark-400">
                    {r.hasNotes ? '📝' : '—'}
                  </td>
                  <td className="px-6 py-4">
                    <button className="inline-flex items-center gap-1.5 text-sm font-medium text-juno-dark-green hover:underline">
                      <Icon name="play" className="w-3.5 h-3.5" />
                      View Tutorial
                    </button>
                  </td>
                </tr>
              ))}
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
    </div>
  )
}
