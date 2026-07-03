'use client'

import { useState, useEffect, useRef, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { cn } from '@/lib/utils'
import { ArrowLeft, Search, UserPlus, Users, ChevronRight, Loader2, CheckCircle2, Sparkles, Zap } from 'lucide-react'

interface Client {
  id: string; name: string; email: string; initials: string
  company?: string; returnCount?: number
}

function SelectClientForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const formCode = searchParams.get('form') || '1040'
  const newClientId = searchParams.get('new')
  const [search, setSearch] = useState('')
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)
  const newRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetch('/api/clients')
      .then(r => r.json())
      .then((data: Client[]) => {
        if (Array.isArray(data)) {
          const mapped = data.map((c: any) => ({
            id: c.id, name: c.name || c.clientName || `${c.firstName || ''} ${c.lastName || ''}`.trim() || 'Unknown',
            email: c.email || '',
            initials: c.initials || (c.name || `${c.firstName || ''} ${c.lastName || ''}`).split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2) || '??',
            company: c.company || '', returnCount: c.returnCount ?? c._count?.taxReturns ?? 0,
          }))
          setClients(mapped)
          if (newClientId && mapped.find(c => c.id === newClientId)) {
            setSelectedId(newClientId)
            setTimeout(() => newRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 100)
          }
        }
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [newClientId])

  const startPreparation = async () => {
    if (!selectedId) return
    setCreating(true)
    try {
      const res = await fetch('/api/returns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId: selectedId, formCode, taxYear: new Date().getFullYear() }),
      })
      if (res.ok) {
        router.push('/protected/taxPreparation/preparer')
      }
    } catch {}
    setCreating(false)
  }

  const filtered = clients.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase())
  )

  const newlyAdded = newClientId && clients.find(c => c.id === newClientId)

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Back + Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => router.back()} className="w-9 h-9 rounded-full bg-white border border-[#E5E7E5] flex items-center justify-center text-[#6B7280] hover:border-[#1FAA6F] hover:text-[#1FAA6F] transition-all">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <code className="text-xs font-mono font-semibold text-[#0B3D2E] bg-[#E8F5E8] px-2 py-0.5 rounded-lg">{formCode}</code>
            <span className="text-xs text-[#6B7280]">|</span>
            <span className="text-xs text-[#6B7280]">Step 2 of 2</span>
          </div>
          <h1 className="text-[26px] font-bold text-[#1A1D1B] tracking-tight">Select Client</h1>
          <p className="text-sm text-[#6B7280] mt-0.5">Choose a client for this return or add a new one.</p>
        </div>
      </div>

      {/* Newly Added Success Banner */}
      {newlyAdded && (
        <div className="flex items-center gap-3 px-5 py-3 bg-[#E8F5E8] rounded-2xl border border-[#1FAA6F]/20">
          <CheckCircle2 className="w-5 h-5 text-[#1FAA6F] shrink-0" />
          <p className="text-sm text-[#0B3D2E] font-medium">
            <strong>{newlyAdded.name}</strong> added successfully &mdash; selected below
          </p>
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280]" />
        <input type="text" placeholder="Search client name or email..." value={search} onChange={e => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-white border border-[#E5E7E5] rounded-full text-sm text-[#1A1D1B] placeholder-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#1FAA6F]/20 focus:border-[#1FAA6F] transition-all" />
      </div>

      {/* Add New Client Button */}
      <button onClick={() => router.push(`/protected/taxPreparation/new-return/clients/new?form=${formCode}`)}
        className="w-full flex items-center gap-4 p-4 bg-white rounded-2xl border-2 border-dashed border-[#E5E7E5] text-left hover:border-[#1FAA6F] hover:bg-[#F7F9F8] transition-all group">
        <div className="w-12 h-12 rounded-xl bg-[#E8F5E8] flex items-center justify-center group-hover:scale-110 transition-transform">
          <UserPlus className="w-6 h-6 text-[#1FAA6F]" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-[#1A1D1B] group-hover:text-[#1FAA6F] transition-colors">New Client</p>
          <p className="text-xs text-[#6B7280]">Add a client to your roster</p>
        </div>
        <ChevronRight className="w-5 h-5 text-[#9CA3AF] group-hover:text-[#1FAA6F] group-hover:translate-x-0.5 transition-all" />
      </button>

      {/* Client List */}
      <div className="bg-white rounded-2xl border border-[#E5E7E5] shadow-sm overflow-hidden">
        {loading ? (
          <div className="px-6 py-12 text-center text-sm text-[#6B7280]"><Loader2 className="w-5 h-5 animate-spin inline-block mr-2" />Loading clients...</div>
        ) : filtered.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <Users className="w-10 h-10 text-[#D1D5DB] mx-auto mb-2" />
            <p className="text-sm font-medium text-[#1A1D1B]">{search ? 'No clients match your search' : 'No clients yet'}</p>
            <p className="text-xs text-[#6B7280] mt-1">{search ? 'Try a different name or email' : 'Add your first client above'}</p>
          </div>
        ) : (
          <div className="divide-y divide-[#E5E7E5]">
            {filtered.map(c => {
              const isSelected = selectedId === c.id
              const isNew = newClientId === c.id
              return (
                <div key={c.id} ref={isNew ? newRef : undefined}>
                  <button onClick={() => setSelectedId(c.id)}
                    className={cn(
                      'w-full flex items-center gap-4 px-5 py-4 text-left transition-all group hover:bg-[#F7F9F8] relative',
                      isSelected && 'bg-[#1FAA6F]/5',
                      isNew && 'ring-2 ring-[#1FAA6F] ring-inset'
                    )}>
                    <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#0B3D2E] to-[#1FAA6F] flex items-center justify-center text-white text-sm font-semibold shrink-0 shadow-sm">{c.initials}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-[#1A1D1B] group-hover:text-[#1FAA6F] transition-colors">{c.name}</p>
                        {isNew && <Sparkles className="w-3.5 h-3.5 text-[#1FAA6F]" />}
                      </div>
                      <p className="text-xs text-[#6B7280]">{c.email}</p>
                    </div>
                    {(c.returnCount ?? 0) > 0 && (
                      <span className="text-xs text-[#6B7280] bg-[#F7F9F8] px-2.5 py-1 rounded-full font-medium">{c.returnCount} return{c.returnCount !== 1 ? 's' : ''}</span>
                    )}
                    <div className={cn('w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all', isSelected ? 'border-[#1FAA6F] bg-[#1FAA6F]' : 'border-[#D1D5DB]')}>
                      {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-white" />}
                    </div>
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Continue */}
      <div className="flex items-center justify-between pt-1">
        <p className="text-xs text-[#6B7280]">
          {selectedId
            ? `${clients.find(c => c.id === selectedId)?.name} selected for ${formCode}`
            : 'Select a client or add a new one'}
        </p>
        <button disabled={!selectedId || creating} onClick={startPreparation}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#0B3D2E] text-white text-sm font-semibold rounded-full hover:bg-[#1FAA6F] disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm">
          {creating ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating...</> : <><Zap className="w-4 h-4" /> Start Preparation</>}
        </button>
      </div>
    </div>
  )
}

export default function SelectClientPage() {
  return (
    <Suspense fallback={
      <div className="max-w-3xl mx-auto pt-20 text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#6B7280]" />
      </div>
    }>
      <SelectClientForm />
    </Suspense>
  )
}
