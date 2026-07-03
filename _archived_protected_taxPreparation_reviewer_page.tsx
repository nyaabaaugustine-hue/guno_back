'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import {
  Search, Filter, ChevronLeft, ChevronRight,
  CheckCircle2, XCircle, AlertTriangle, Eye,
  MessageCircle, ArrowUpRight, Clock
} from 'lucide-react'

const reviewItems = [
  { id: 1, client: 'Acme Corp', form: '1040', reviewer: 'Alice', submitted: '2 hours ago', priority: 'High', status: 'Pending Review', score: 92 },
  { id: 2, client: 'Globex Inc', form: '1120', reviewer: 'Bob', submitted: '5 hours ago', priority: 'Medium', status: 'Approved', score: 98 },
  { id: 3, client: 'Initech', form: '1065', reviewer: 'Charlie', submitted: '1 day ago', priority: 'Low', status: 'Needs Revision', score: 71 },
  { id: 4, client: 'Umbrella Co', form: '1040', reviewer: 'Alice', submitted: '1 day ago', priority: 'High', status: 'Pending Review', score: 88 },
  { id: 5, client: 'Stark Ind.', form: '1120-S', reviewer: 'Diana', submitted: '2 days ago', priority: 'Medium', status: 'Approved', score: 96 },
  { id: 6, client: 'Wayne Ent.', form: '1041', reviewer: 'Bob', submitted: '2 days ago', priority: 'High', status: 'Pending Review', score: 85 },
  { id: 7, client: 'Oscorp', form: '1065', reviewer: 'Charlie', submitted: '3 days ago', priority: 'Low', status: 'Needs Revision', score: 67 },
  { id: 8, client: 'LexCorp', form: '1040', reviewer: 'Diana', submitted: '3 days ago', priority: 'Medium', status: 'Approved', score: 94 },
]

const statusStyles: Record<string, string> = {
  'Pending Review': 'bg-amber-50 text-amber-600',
  'Approved': 'bg-[#1FAA6F]/10 text-[#1FAA6F]',
  'Needs Revision': 'bg-red-50 text-red-500',
}

const priorityStyles: Record<string, string> = {
  'High': 'text-red-500 bg-red-50',
  'Medium': 'text-amber-500 bg-amber-50',
  'Low': 'text-[#6B7280] bg-gray-100',
}

const filterPills = ['All Items', 'Pending Review', 'Approved', 'Needs Revision']

export default function ReviewerPage() {
  const [activeFilter, setActiveFilter] = useState('All Items')
  const [currentPage, setCurrentPage] = useState(1)
  const totalPages = 8

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[28px] font-bold text-[#1A1D1B] tracking-tight">Reviewer</h1>
          <p className="text-sm text-[#6B7280] mt-1">Review and approve tax returns before filing</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-[#E5E7E5] rounded-full text-sm font-medium text-[#6B7280] hover:border-[#1FAA6F] hover:text-[#1FAA6F] transition-all">
            <Clock className="w-4 h-4" />
            Review History
          </button>
          <button className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1FAA6F] text-white text-sm font-semibold rounded-full hover:bg-[#0B3D2E] transition-all duration-200 shadow-sm">
            <CheckCircle2 className="w-4 h-4" />
            Review All
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Pending Review', value: 24, color: 'bg-amber-500' },
          { label: 'Approved Today', value: 12, color: 'bg-[#1FAA6F]' },
          { label: 'Needs Revision', value: 5, color: 'bg-red-500' },
          { label: 'Avg. Score', value: '91%', color: 'bg-blue-500' },
        ].map(stat => (
          <div key={stat.label} className="bg-white rounded-2xl border border-[#E5E7E5] p-5 shadow-[0_2px_8px_rgba(0,0,0,.05)]">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-[#6B7280]">{stat.label}</span>
              <div className={cn('w-2.5 h-2.5 rounded-full', stat.color)} />
            </div>
            <p className="text-2xl font-bold text-[#1A1D1B]">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-[320px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280]" />
          <input
            type="text"
            placeholder="Search returns..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#E5E7E5] rounded-full text-sm text-[#1A1D1B] placeholder-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#1FAA6F]/20 focus:border-[#1FAA6F] transition-all"
          />
        </div>

        <button className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-[#E5E7E5] rounded-full text-sm font-medium text-[#6B7280] hover:border-[#1FAA6F] hover:text-[#1FAA6F] transition-all">
          <Filter className="w-4 h-4" />
          Filter
        </button>

        <div className="flex items-center gap-1.5">
          {filterPills.map(pill => (
            <button
              key={pill}
              onClick={() => setActiveFilter(pill)}
              className={cn(
                'px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200',
                activeFilter === pill
                  ? 'bg-[#1FAA6F] text-white'
                  : 'bg-white border border-[#E5E7E5] text-[#6B7280] hover:border-[#1FAA6F] hover:text-[#1FAA6F]'
              )}
            >
              {pill}
            </button>
          ))}
        </div>
      </div>

      {/* Review Table */}
      <div className="bg-white rounded-2xl border border-[#E5E7E5] shadow-[0_2px_8px_rgba(0,0,0,.05)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[#F7F9F8] border-b border-[#E5E7E5]">
                <th className="text-left px-4 py-3.5 text-[13px] font-medium text-[#6B7280] uppercase tracking-wider">Client</th>
                <th className="text-left px-4 py-3.5 text-[13px] font-medium text-[#6B7280] uppercase tracking-wider">Form</th>
                <th className="text-left px-4 py-3.5 text-[13px] font-medium text-[#6B7280] uppercase tracking-wider">Reviewer</th>
                <th className="text-left px-4 py-3.5 text-[13px] font-medium text-[#6B7280] uppercase tracking-wider">Submitted</th>
                <th className="text-left px-4 py-3.5 text-[13px] font-medium text-[#6B7280] uppercase tracking-wider">Priority</th>
                <th className="text-left px-4 py-3.5 text-[13px] font-medium text-[#6B7280] uppercase tracking-wider">Status</th>
                <th className="text-left px-4 py-3.5 text-[13px] font-medium text-[#6B7280] uppercase tracking-wider">Score</th>
                <th className="text-right px-4 py-3.5 text-[13px] font-medium text-[#6B7280] uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7E5]">
              {reviewItems.map(item => {
                const scoreColor = item.score >= 90 ? 'text-[#1FAA6F]' : item.score >= 75 ? 'text-amber-500' : 'text-red-500'
                return (
                  <tr key={item.id} className="group hover:bg-[#F7F9F8] transition-colors duration-150">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-[#0B3D2E] flex items-center justify-center text-white text-xs font-semibold shrink-0">
                          {item.client.split(' ').map(w => w[0]).join('').slice(0, 2)}
                        </div>
                        <span className="text-sm font-medium text-[#1A1D1B]">{item.client}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <code className="text-xs font-mono font-medium text-[#6B7280] bg-[#F7F9F8] px-2 py-1 rounded-md">{item.form}</code>
                    </td>
                    <td className="px-4 py-3 text-sm text-[#1A1D1B]">{item.reviewer}</td>
                    <td className="px-4 py-3 text-sm text-[#6B7280]">{item.submitted}</td>
                    <td className="px-4 py-3">
                      <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', priorityStyles[item.priority])}>
                        {item.priority}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn('inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium', statusStyles[item.status])}>
                        {item.status === 'Approved' && <CheckCircle2 className="w-3 h-3" />}
                        {item.status === 'Needs Revision' && <XCircle className="w-3 h-3" />}
                        {item.status === 'Pending Review' && <AlertTriangle className="w-3 h-3" />}
                        {item.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn('text-sm font-semibold tabular-nums', scoreColor)}>
                        {item.score}%
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-2 text-[#6B7280] hover:text-[#1FAA6F] hover:bg-[#1FAA6F]/10 rounded-lg transition-all" title="Review">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-[#6B7280] hover:text-[#1FAA6F] hover:bg-[#1FAA6F]/10 rounded-lg transition-all" title="Approve">
                          <CheckCircle2 className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-[#6B7280] hover:text-red-500 hover:bg-red-50 rounded-lg transition-all" title="Request Revision">
                          <XCircle className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
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
