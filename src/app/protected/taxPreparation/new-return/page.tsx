'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { ArrowLeft, FileText, Building2, Users, Briefcase, ChevronRight } from 'lucide-react'

const RETURN_TYPES = [
  { id: '1040', label: '1040', category: 'Individual', desc: 'U.S. Individual Income Tax Return', icon: Users, color: 'from-[#0B3D2E] to-[#1FAA6F]' },
  { id: '1120', label: '1120', category: 'Business', desc: 'U.S. Corporation Income Tax Return', icon: Building2, color: 'from-blue-600 to-blue-400' },
  { id: '1120-S', label: '1120-S', category: 'Business', desc: 'U.S. S Corporation Income Tax Return', icon: Briefcase, color: 'from-purple-600 to-purple-400' },
  { id: '1065', label: '1065', category: 'Business', desc: 'U.S. Return of Partnership Income', icon: FileText, color: 'from-amber-600 to-amber-400' },
]

export default function NewReturnPage() {
  const router = useRouter()
  const [selected, setSelected] = useState<string | null>(null)

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Back + Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => router.back()} className="w-9 h-9 rounded-full bg-white border border-[#E5E7E5] flex items-center justify-center text-[#6B7280] hover:border-[#1FAA6F] hover:text-[#1FAA6F] transition-all">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-[26px] font-bold text-[#1A1D1B] tracking-tight">Select Return Type</h1>
          <p className="text-sm text-[#6B7280] mt-0.5">Choose the type of tax return you&apos;d like to prepare for this client.</p>
        </div>
      </div>

      {/* Return Type Cards */}
      <div className="grid gap-4">
        {RETURN_TYPES.map(rt => {
          const Icon = rt.icon
          const isSelected = selected === rt.id
          return (
            <button
              key={rt.id}
              onClick={() => setSelected(rt.id)}
              className={cn(
                'flex items-center gap-5 p-5 bg-white rounded-2xl border-2 text-left transition-all group',
                isSelected ? 'border-[#1FAA6F] shadow-[0_0_0_3px_rgba(31,170,111,0.12)]' : 'border-[#E5E7E5] hover:border-[#1FAA6F]/40 hover:shadow-sm'
              )}
            >
              <div className={cn('w-14 h-14 rounded-2xl bg-gradient-to-br flex items-center justify-center text-white shrink-0 shadow-sm transition-transform group-hover:scale-105', rt.color)}>
                <Icon className="w-7 h-7" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3">
                  <span className="text-xl font-bold text-[#1A1D1B]">{rt.label}</span>
                  <span className="text-xs font-medium text-[#6B7280] bg-[#F7F9F8] px-2.5 py-0.5 rounded-full">{rt.category}</span>
                </div>
                <p className="text-sm text-[#6B7280] mt-0.5">{rt.desc}</p>
              </div>
              <div className={cn('w-8 h-8 rounded-full border-2 flex items-center justify-center shrink-0 transition-all', isSelected ? 'border-[#1FAA6F] bg-[#1FAA6F]' : 'border-[#D1D5DB]')}>
                {isSelected && <div className="w-3 h-3 rounded-full bg-white" />}
              </div>
            </button>
          )
        })}
      </div>

      {/* Continue */}
      <div className="flex items-center justify-between pt-2">
        <p className="text-xs text-[#6B7280]">
          {selected ? `${RETURN_TYPES.find(r => r.id === selected)?.label} selected` : 'Select a return type to continue'}
        </p>
        <button
          disabled={!selected}
          onClick={() => selected && router.push(`/protected/taxPreparation/new-return/select-client?form=${selected}`)}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#0B3D2E] text-white text-sm font-semibold rounded-full hover:bg-[#1FAA6F] disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
        >
          Continue <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
