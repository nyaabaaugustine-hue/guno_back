'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import {
  Search, Filter, Plus, Trash2, Eye, Edit3,
  ChevronLeft, ChevronRight,
  MessageCircle, ArrowUpRight
} from 'lucide-react'

const projects = [
  { id: 1, client: 'Acme Corp', email: 'contact@acme.com', year: 2024, project: 'Business', owner: 'Alice', status: 'In Progress', notes: 'View Notes' },
  { id: 2, client: 'Globex Inc', email: 'info@globex.com', year: 2024, project: 'Personal', owner: 'Bob', status: 'Pending', notes: 'View Notes' },
  { id: 3, client: 'Initech', email: 'hello@initech.com', year: 2023, project: 'Business', owner: 'Alice', status: 'Completed', notes: 'View Notes' },
  { id: 4, client: 'Umbrella Co', email: 'support@umbrella.com', year: 2024, project: 'Personal', owner: 'Charlie', status: 'In Progress', notes: 'View Notes' },
  { id: 5, client: 'Stark Ind.', email: 'tony@stark.com', year: 2023, project: 'Business', owner: 'Diana', status: 'Archived', notes: 'View Notes' },
  { id: 6, client: 'Wayne Ent.', email: 'bruce@wayne.com', year: 2024, project: 'Business', owner: 'Alice', status: 'Pending', notes: 'View Notes' },
  { id: 7, client: 'Oscorp', email: 'osborn@oscorp.com', year: 2024, project: 'Personal', owner: 'Bob', status: 'In Progress', notes: 'View Notes' },
  { id: 8, client: 'LexCorp', email: 'lex@lexcorp.com', year: 2023, project: 'Business', owner: 'Charlie', status: 'Completed', notes: 'View Notes' },
]

const statusColors: Record<string, string> = {
  'In Progress': 'bg-[#1FAA6F]/10 text-[#1FAA6F]',
  'Pending': 'bg-amber-50 text-amber-600',
  'Completed': 'bg-blue-50 text-blue-600',
  'Archived': 'bg-gray-100 text-gray-500',
}

const categoryPills = ['All', 'Pending', 'Completed', 'Archived']

export default function TaxPreparationPage() {
  const [activeCategory, setActiveCategory] = useState('All')
  const [selectedRows, setSelectedRows] = useState<number[]>([])
  const [showArchived, setShowArchived] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const totalPages = 12

  const toggleRow = (id: number) => {
    setSelectedRows(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  const toggleAll = () => {
    if (selectedRows.length === projects.length) {
      setSelectedRows([])
    } else {
      setSelectedRows(projects.map(p => p.id))
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-[28px] font-bold text-[#1A1D1B] tracking-tight">Dashboard</h1>
        <button className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1FAA6F] text-white text-sm font-semibold rounded-full hover:bg-[#0B3D2E] transition-all duration-200 shadow-sm">
          <Plus className="w-4 h-4" />
          New Project
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-[320px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280]" />
          <input
            type="text"
            placeholder="Search..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#E5E7E5] rounded-full text-sm text-[#1A1D1B] placeholder-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#1FAA6F]/20 focus:border-[#1FAA6F] transition-all"
          />
        </div>

        <button className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-[#E5E7E5] rounded-full text-sm font-medium text-[#6B7280] hover:border-[#1FAA6F] hover:text-[#1FAA6F] transition-all">
          <Filter className="w-4 h-4" />
          Filter
        </button>

        <div className="flex items-center gap-1.5">
          {categoryPills.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={cn(
                'px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200',
                activeCategory === cat
                  ? 'bg-[#1FAA6F] text-white'
                  : 'bg-white border border-[#E5E7E5] text-[#6B7280] hover:border-[#1FAA6F] hover:text-[#1FAA6F]'
              )}
            >
              {cat}
            </button>
          ))}
        </div>

        <label className="flex items-center gap-2 ml-auto cursor-pointer select-none">
          <span className="text-sm text-[#6B7280]">Show archived</span>
          <button
            onClick={() => setShowArchived(!showArchived)}
            className={cn(
              'relative w-10 h-5 rounded-full transition-colors duration-200',
              showArchived ? 'bg-[#1FAA6F]' : 'bg-[#E5E7E5]'
            )}
          >
            <span className={cn(
              'absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-200',
              showArchived && 'translate-x-5'
            )} />
          </button>
        </label>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-2xl border border-[#E5E7E5] shadow-[0_2px_8px_rgba(0,0,0,.05)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[#F7F9F8] border-b border-[#E5E7E5]">
                <th className="w-12 px-4 py-3.5 text-left">
                  <input
                    type="checkbox"
                    checked={selectedRows.length === projects.length}
                    onChange={toggleAll}
                    className="w-4 h-4 rounded border-[#EAFAFA] text-[#1FAA6F] focus:ring-[#1FAA6F] cursor-pointer accent-[#1FAA6F]"
                  />
                </th>
                <th className="text-left px-4 py-3.5 text-[13px] font-medium text-[#6B7280] uppercase tracking-wider">Client</th>
                <th className="text-left px-4 py-3.5 text-[13px] font-medium text-[#6B7280] uppercase tracking-wider">Year</th>
                <th className="text-left px-4 py-3.5 text-[13px] font-medium text-[#6B7280] uppercase tracking-wider">Project</th>
                <th className="text-left px-4 py-3.5 text-[13px] font-medium text-[#6B7280] uppercase tracking-wider">Owner</th>
                <th className="text-left px-4 py-3.5 text-[13px] font-medium text-[#6B7280] uppercase tracking-wider">Status</th>
                <th className="text-left px-4 py-3.5 text-[13px] font-medium text-[#6B7280] uppercase tracking-wider">Notes</th>
                <th className="text-right px-4 py-3.5 text-[13px] font-medium text-[#6B7280] uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7E5]">
              {projects.map((project) => (
                <tr
                  key={project.id}
                  className={cn(
                    'group transition-colors duration-150',
                    selectedRows.includes(project.id) ? 'bg-[#1FAA6F]/5' : 'hover:bg-[#F7F9F8]',
                    selectedRows.includes(project.id) && 'outline outline-1 outline-dashed outline-[#1FAA6F]/40'
                  )}
                >
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedRows.includes(project.id)}
                      onChange={() => toggleRow(project.id)}
                      className="w-4 h-4 rounded border-[#E5E7E5] text-[#1FAA6F] focus:ring-[#1FAA6F] cursor-pointer accent-[#1FAA6F]"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-[#0B3D2E] flex items-center justify-center text-white text-xs font-semibold shrink-0">
                        {project.client.split(' ').map(w => w[0]).join('').slice(0, 2)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-[#1A1D1B]">{project.client}</p>
                        <p className="text-xs text-[#6B7280]">{project.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-[#1A1D1B]">{project.year}</td>
                  <td className="px-4 py-3">
                    <span className={cn(
                      'inline-flex px-3 py-1 rounded-full text-xs font-medium',
                      project.project === 'Business'
                        ? 'bg-[#1FAA6F]/10 text-[#1FAA6F]'
                        : 'bg-purple-50 text-purple-600'
                    )}>
                      {project.project}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <select className="text-sm text-[#1A1D1B] bg-white border border-[#E5E7E5] rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-[#1FAA6F]/20 focus:border-[#1FAA6F] cursor-pointer">
                      <option>{project.owner}</option>
                      <option>Alice</option>
                      <option>Bob</option>
                      <option>Charlie</option>
                      <option>Diana</option>
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn(
                      'inline-flex items-center px-3 py-1 rounded-full text-xs font-medium',
                      statusColors[project.status]
                    )}>
                      {project.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button className="text-sm text-[#1FAA6F] hover:text-[#0B3D2E] font-medium transition-colors">
                      {project.notes}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button className="p-2 text-[#6B7280] hover:text-[#1A1D1B] hover:bg-[#F7F9F8] rounded-lg transition-all" title="View">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-[#6B7280] hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all" title="Edit">
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-[#6B7280] hover:text-red-500 hover:bg-red-50 rounded-lg transition-all" title="Delete">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Analytics Section */}
      <div className="bg-white rounded-2xl border border-[#E5E7E5] shadow-[0_2px_8px_rgba(0,0,0,.05)] p-8">
        <div className="text-center mb-8">
          <h2 className="text-[22px] font-semibold text-[#1A1D1B]">Performance Overview</h2>
          <p className="text-sm text-[#6B7280] mt-1">Track your team's productivity and project completion rates</p>
        </div>

        <div className="max-w-2xl mx-auto space-y-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-[#1FAA6F]" />
                <span className="text-sm font-medium text-[#1A1D1B]">Easy Projects</span>
              </div>
              <span className="text-sm text-[#6B7280]">65%</span>
            </div>
            <div className="h-3 bg-[#F7F9F8] rounded-full overflow-hidden">
              <div className="h-full rounded-full bg-gradient-to-r from-[#1FAA6F] via-[#E8F5E8] to-[#EF6B6B] transition-all duration-700" style={{ width: '65%' }} />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-[#0B3D2E]" />
                <span className="text-sm font-medium text-[#1A1D1B]">Complex Projects</span>
              </div>
              <span className="text-sm text-[#6B7280]">35%</span>
            </div>
            <div className="h-3 bg-[#F7F9F8] rounded-full overflow-hidden">
              <div className="h-full rounded-full bg-gradient-to-r from-[#0B3D2E] via-[#1FAA6F] to-[#E8F5E8] transition-all duration-700" style={{ width: '35%' }} />
            </div>
          </div>

          <div className="flex items-center justify-center gap-6 pt-4 border-t border-[#E5E7E5]">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#1FAA6F]" />
              <span className="text-sm text-[#6B7280]">AI Recommended</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#EF6B6B]" />
              <span className="text-sm text-[#6B7280]">Manual Review</span>
            </div>
          </div>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-[#6B7280]">
          Page {currentPage} of {totalPages}
        </span>
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
                currentPage === page
                  ? 'bg-[#1FAA6F] text-white'
                  : 'text-[#6B7280] hover:bg-[#F7F9F8] border border-[#E5E7E5]'
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
