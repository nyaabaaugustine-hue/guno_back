'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import {
  ArrowLeft, ArrowUpRight, FileText, User, Mail, Phone,
  MapPin, CalendarDays, Shield, FileSpreadsheet, Upload,
  Loader2, ExternalLink, Hash, Building2, ChevronRight
} from 'lucide-react'

const DEMO_CLIENT = {
  id: 'demo-1', firstName: 'John', lastName: 'Smith',
  email: 'john.smith@email.com', phone: '(212) 555-0101',
  ssn: null, address: '350 Fifth Ave, New York, NY 10118',
  notes: 'Long-term client. Prefers e-delivery.', returnCount: 3, documentCount: 5,
  createdAt: new Date().toISOString(),
}

interface ClientData {
  id: string; firstName: string; lastName: string
  email: string | null; phone: string | null; ssn: string | null
  address: string | null; notes: string | null
  returnCount: number; documentCount: number; createdAt: string
}

export default function ClientDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [client, setClient] = useState<ClientData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadClient = async () => {
      if (!params?.id) return
      try {
        const res = await fetch(`/api/clients/${params.id}`)
        if (!res.ok) {
          if (res.status === 404) setError('Client not found')
          else setError('Failed to load client')
          return
        }
        const data = await res.json()
        setClient(data)
      } catch {
        setError('Failed to load client')
      } finally {
        setLoading(false)
      }
    }
    loadClient()
  }, [params?.id])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-[#1FAA6F] animate-spin" />
          <p className="text-sm text-[#6B7280]">Loading client...</p>
        </div>
      </div>
    )
  }

  if (error || !client) {
    return (
      <div className="max-w-lg mx-auto mt-20 text-center">
        <Link
          href="/protected/taxPreparation/clients"
          className="inline-flex items-center gap-1.5 text-sm text-[#6B7280] hover:text-[#1A1D1B] transition-colors mb-10"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to clients
        </Link>
        <div className="bg-white rounded-3xl border border-[#E5E7E5] shadow-[0_4px_20px_rgba(0,0,0,.06)] p-12">
          <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-[#F7F9F8] flex items-center justify-center">
            <User className="w-8 h-8 text-[#9CA3AF]" />
          </div>
          <h2 className="text-xl font-bold text-[#1A1D1B] mb-2">Client not found</h2>
          <p className="text-sm text-[#6B7280] mb-6">
            {error || 'This client does not exist or has been removed.'}
          </p>
          <Link
            href="/protected/taxPreparation/clients"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1FAA6F] text-white text-sm font-semibold rounded-full hover:bg-[#0B3D2E] transition-all shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            View All Clients
          </Link>
        </div>
      </div>
    )
  }

  const fullName = `${client.firstName} ${client.lastName}`
  const initials = (client.firstName?.[0] || '') + (client.lastName?.[0] || '')
  const createdDate = new Date(client.createdAt).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric'
  })

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Back link */}
      <Link
        href="/protected/taxPreparation/clients"
        className="inline-flex items-center gap-1.5 text-sm text-[#6B7280] hover:text-[#1FAA6F] transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to clients
        <ChevronRight className="w-3.5 h-3.5 text-[#D1D5DB]" />
        <span className="text-[#1A1D1B] font-medium">{fullName}</span>
      </Link>

      {/* Hero Profile Card */}
      <div className="relative bg-white rounded-3xl border border-[#E5E7E5] shadow-[0_4px_24px_rgba(0,0,0,.06)] overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-[#0B3D2E] via-[#1FAA6F]/80 to-[#1FAA6F]" />
        <div className="px-8 pb-8">
          <div className="flex flex-col sm:flex-row sm:items-end gap-5 -mt-12">
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-[#0B3D2E] to-[#1FAA6F] flex items-center justify-center text-white text-3xl font-bold shadow-lg border-4 border-white shrink-0">
              {initials}
            </div>
            <div className="flex-1 pt-2 sm:pt-0 sm:pb-1">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl font-bold text-[#1A1D1B]">{fullName}</h1>
                <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full text-xs font-medium bg-[#E8F5E8] text-[#0B3D2E]">
                  <span className="w-1.5 h-1.5 bg-[#1FAA6F] rounded-full" />
                  Active
                </span>
              </div>
              <div className="flex items-center gap-3 mt-1 text-sm text-[#6B7280] flex-wrap">
                {client.email && (
                  <span className="inline-flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5" /> {client.email}
                  </span>
                )}
                {client.phone && (
                  <span className="inline-flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5" /> {client.phone}
                  </span>
                )}
              </div>
            </div>
            <div className="flex gap-2 sm:self-end">
              <button className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#0B3D2E] text-white text-sm font-semibold rounded-full hover:bg-[#1FAA6F] transition-all shadow-sm">
                <FileText className="w-4 h-4" />
                New Return
              </button>
              <button className="inline-flex items-center gap-1.5 px-4 py-2 border border-[#E5E7E5] text-[#6B7280] text-sm font-medium rounded-full hover:border-[#1FAA6F] hover:text-[#1FAA6F] transition-all">
                <Upload className="w-4 h-4" />
                Upload
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Tax Returns', value: client.returnCount, icon: FileSpreadsheet, color: 'text-[#1FAA6F]', bg: 'bg-[#E8F5E8]' },
          { label: 'Documents', value: client.documentCount, icon: FileText, color: 'text-blue-500', bg: 'bg-blue-50' },
          { label: 'Tax Year', value: '2025', icon: CalendarDays, color: 'text-amber-500', bg: 'bg-amber-50' },
          { label: 'Client Since', value: createdDate, icon: CalendarDays, color: 'text-purple-500', bg: 'bg-purple-50' },
        ].map((stat) => {
          const Icon = stat.icon
          return (
            <div key={stat.label} className="bg-white rounded-2xl border border-[#E5E7E5] p-5 shadow-[0_2px_8px_rgba(0,0,0,.04)]">
              <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center mb-3', stat.bg)}>
                <Icon className={cn('w-5 h-5', stat.color)} />
              </div>
              <p className="text-2xl font-bold text-[#1A1D1B]">{stat.value}</p>
              <p className="text-xs text-[#6B7280] mt-0.5">{stat.label}</p>
            </div>
          )
        })}
      </div>

      {/* Main Content: Two column layout */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left: Returns + Documents */}
        <div className="lg:col-span-2 space-y-6">
          {/* Tax Returns Section */}
          <div className="bg-white rounded-2xl border border-[#E5E7E5] shadow-[0_2px_8px_rgba(0,0,0,.04)] overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E7E5]">
              <h2 className="text-base font-semibold text-[#1A1D1B]">
                Tax Returns
                <span className="text-sm font-normal text-[#6B7280] ml-2">({client.returnCount})</span>
              </h2>
              <button className="text-sm font-medium text-[#1FAA6F] hover:underline">View All</button>
            </div>
            <div className="p-6">
              {client.returnCount > 0 ? (
                <div className="space-y-3">
                  {Array.from({ length: Math.min(client.returnCount, 3) }, (_, i) => (
                    <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-[#F7F9F8] hover:bg-[#E8F5E8] transition-colors cursor-pointer group">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-white border border-[#E5E7E5] flex items-center justify-center">
                          <FileSpreadsheet className="w-5 h-5 text-[#0B3D2E]" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-[#1A1D1B]">2025 Tax Return</p>
                          <p className="text-xs text-[#6B7280]">Form 1040</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#1FAA6F]/10 text-[#1FAA6F]">
                          <span className="w-1.5 h-1.5 rounded-full bg-current" />
                          In Progress
                        </span>
                        <ArrowUpRight className="w-4 h-4 text-[#9CA3AF] group-hover:text-[#1FAA6F] transition-colors" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-[#F7F9F8] flex items-center justify-center">
                    <FileSpreadsheet className="w-6 h-6 text-[#9CA3AF]" />
                  </div>
                  <p className="text-sm text-[#6B7280]">No tax returns yet</p>
                  <button className="mt-3 text-sm font-medium text-[#1FAA6F] hover:underline">
                    Create your first return
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Documents Section */}
          <div className="bg-white rounded-2xl border border-[#E5E7E5] shadow-[0_2px_8px_rgba(0,0,0,.04)] overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E7E5]">
              <h2 className="text-base font-semibold text-[#1A1D1B]">
                Documents
                <span className="text-sm font-normal text-[#6B7280] ml-2">({client.documentCount})</span>
              </h2>
              <button className="text-sm font-medium text-[#1FAA6F] hover:underline">View All</button>
            </div>
            <div className="p-6">
              {client.documentCount > 0 ? (
                <div className="space-y-3">
                  {['W-2_2025.pdf', '1099-INT_2025.pdf', 'Brokerage_Statement_Q1.pdf'].slice(0, Math.min(client.documentCount, 3)).map((name, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-xl hover:bg-[#F7F9F8] transition-colors cursor-pointer group">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center">
                          <FileText className="w-4.5 h-4.5 text-blue-500" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-[#1A1D1B]">{name}</p>
                          <p className="text-xs text-[#6B7280]">Uploaded 2 days ago</p>
                        </div>
                      </div>
                      <ExternalLink className="w-4 h-4 text-[#9CA3AF] group-hover:text-[#1FAA6F] transition-colors" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-[#F7F9F8] flex items-center justify-center">
                    <Upload className="w-6 h-6 text-[#9CA3AF]" />
                  </div>
                  <p className="text-sm text-[#6B7280]">No documents uploaded</p>
                  <button className="mt-3 text-sm font-medium text-[#1FAA6F] hover:underline">
                    Upload your first document
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: Client Details Sidebar */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-[#E5E7E5] shadow-[0_2px_8px_rgba(0,0,0,.04)] p-6">
            <h2 className="text-base font-semibold text-[#1A1D1B] mb-5">Client Details</h2>
            <div className="space-y-4">
              {[
                { icon: Mail, label: 'Email', value: client.email, href: client.email ? `mailto:${client.email}` : null },
                { icon: Phone, label: 'Phone', value: client.phone, href: null },
                { icon: MapPin, label: 'Address', value: client.address, href: null },
                { icon: Hash, label: 'SSN', value: client.ssn || null, href: null },
                { icon: Building2, label: 'Firm', value: 'Juno Tax Services', href: null },
                { icon: CalendarDays, label: 'Client Since', value: createdDate, href: null },
                { icon: User, label: 'Notes', value: client.notes, href: null },
              ].map((item) => {
                const Icon = item.icon
                if (!item.value) return null
                return (
                  <div key={item.label} className="flex items-start gap-3">
                    <Icon className="w-4 h-4 text-[#6B7280] mt-0.5 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-[11px] font-medium text-[#6B7280] uppercase tracking-wider">{item.label}</p>
                      {item.href ? (
                        <a href={item.href} className="text-sm text-[#1FAA6F] hover:underline break-all">{item.value}</a>
                      ) : (
                        <p className="text-sm text-[#1A1D1B] break-all">{item.value}</p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-[#E5E7E5] shadow-[0_2px_8px_rgba(0,0,0,.04)] p-6 space-y-3">
            <button className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#1FAA6F] text-white text-sm font-semibold rounded-full hover:bg-[#0B3D2E] transition-all shadow-sm">
              <FileText className="w-4 h-4" />
              New Tax Return
            </button>
            <button className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 border border-[#E5E7E5] text-[#6B7280] text-sm font-medium rounded-full hover:border-[#1FAA6F] hover:text-[#1FAA6F] transition-all">
              <Upload className="w-4 h-4" />
              Upload Document
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
