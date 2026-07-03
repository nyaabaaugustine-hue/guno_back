'use client'

import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import {
  Plus, Search, Filter, ChevronLeft, ChevronRight, Loader2,
  Clock, X, Mail, Phone, MapPin, Hash, FileText, Briefcase,
  CalendarDays, MessageCircle, ArrowUpRight, User, Building2
} from 'lucide-react'

interface Client {
  id: string
  initials: string
  name: string
  email: string
  tin: string
  phone: string
  city: string
  state: string
  zip: string
  created: string
  notes?: string
  returnCount?: number
  documentCount?: number
}

const demoClients: Client[] = [
  { id: '1', initials: 'JP', name: 'John Doe - Demo Preparation', email: 'jdoe@juno.tax', tin: 'XXX-XX-1234', phone: '(555) 123-4567', city: 'Anytown', state: 'ST', zip: '12345', created: '2026-06-30', notes: 'Individual return — W2 + investment income', returnCount: 2, documentCount: 5 },
  { id: '2', initials: 'DC', name: 'Demo Corporation', email: 'dcorp@juno.tax', tin: 'XX-XXXXX', phone: '(555) 234-5678', city: 'Othertown', state: 'ST', zip: '23456', created: '2026-06-28', notes: 'S-Corp filing — 1120-S', returnCount: 1, documentCount: 12 },
  { id: '3', initials: 'BS', name: 'Bob Smith', email: 'bob@smith.com', tin: 'XXX-XX-5678', phone: '(555) 345-6789', city: 'Springfield', state: 'IL', zip: '62701', created: '2026-06-25', notes: 'New client — prior year catch-up', returnCount: 0, documentCount: 3 },
]

type Tab = 'clients' | 'documents'

export default function ClientsPage() {
  const [tab, setTab] = useState<Tab>('clients')
  const [search, setSearch] = useState('')
  const [clients, setClients] = useState<Client[]>(demoClients)
  const [loading, setLoading] = useState(true)
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [addForm, setAddForm] = useState({ firstName: '', lastName: '', email: '', phone: '', tin: '', city: '', state: '', zip: '' })
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  useEffect(() => {
    const loadClients = async () => {
      try {
        const res = await fetch('/api/clients')
        if (res.ok) {
          const data = await res.json()
          if (data.length > 0) {
            setClients(data.map((c: any) => ({
              id: c.id,
              initials: String(c.firstName || '').charAt(0) + String(c.lastName || '').charAt(0),
              name: `${c.firstName || ''} ${c.lastName || ''}`.trim(),
              email: c.email || '',
              tin: c.ssn || '\u2014',
              phone: c.phone || '\u2014',
              city: c.address?.split(',')[0] || '\u2014',
              state: c.address?.split(',')[1]?.trim() || '\u2014',
              zip: c.address?.split(',')[2]?.trim() || '\u2014',
              created: c.createdAt ? new Date(c.createdAt).toLocaleDateString() : '\u2014',
              notes: c.notes || '',
            })))
          }
        }
      } catch {} finally {
        setLoading(false)
      }
    }
    loadClients()
  }, [])

  const filtered = clients.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase())
  )

  const handleAddClient = async () => {
    setFormError('')
    if (!addForm.firstName || !addForm.lastName) {
      setFormError('First and last name are required')
      return
    }
    setSaving(true)
    try {
      const res = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(addForm),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Failed to create client')
      }
      const client = await res.json()
      const newClient: Client = {
        id: client.id,
        initials: (String(addForm.firstName).charAt(0) + String(addForm.lastName).charAt(0)).toUpperCase(),
        name: `${addForm.firstName} ${addForm.lastName}`,
        email: addForm.email || '\u2014',
        tin: addForm.tin || '\u2014',
        phone: addForm.phone || '\u2014',
        city: addForm.city || '\u2014',
        state: addForm.state || '\u2014',
        zip: addForm.zip || '\u2014',
        created: new Date().toLocaleDateString(),
      }
      setClients([newClient, ...clients])
      setShowAddModal(false)
      setAddForm({ firstName: '', lastName: '', email: '', phone: '', tin: '', city: '', state: '', zip: '' })
      setSuccessMsg('Client added successfully!')
      setTimeout(() => setSuccessMsg(''), 3000)
    } catch (err: any) {
      setFormError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Trial Status Banner */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium bg-[#E8F5E8] text-[#0B3D2E]">
            <span className="w-2 h-2 bg-[#0B3D2E] rounded-full" />
            Clients
          </div>
          <div className="flex items-center gap-1.5 text-sm text-[#6B7280]">
            <Clock className="w-4 h-4" />
            <span>0/5 Free Preparations started.</span>
          </div>
          <div className="text-sm text-[#6B7280]">4d 12h Left in Your Trial</div>
        </div>
        <button className="w-8 h-8 bg-[#0B3D2E] rounded-full flex items-center justify-center text-white text-xs font-semibold hover:bg-[#1FAA6F] transition-colors">
          AN
        </button>
      </div>

      {/* Success message */}
      {successMsg && (
        <div className="text-sm text-[#0B3D2E] bg-[#E8F5E8] px-4 py-2.5 rounded-xl">
          {successMsg}
        </div>
      )}

      {/* Page Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-[28px] font-bold text-[#1A1D1B] tracking-tight">Clients</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1FAA6F] text-white text-sm font-semibold rounded-full hover:bg-[#0B3D2E] transition-all duration-200 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Add Client
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-[#F7F9F8] p-1 rounded-xl w-fit border border-[#E5E7E5]">
        <button
          onClick={() => setTab('clients')}
          className={cn(
            'px-4 py-2 rounded-lg text-sm font-medium transition-all',
            tab === 'clients' ? 'bg-white text-[#1A1D1B] shadow-sm border border-[#E5E7E5]' : 'text-[#6B7280] hover:text-[#1A1D1B]'
          )}
        >
          Clients
        </button>
        <button
          onClick={() => setTab('documents')}
          className={cn(
            'px-4 py-2 rounded-lg text-sm font-medium transition-all',
            tab === 'documents' ? 'bg-white text-[#1A1D1B] shadow-sm border border-[#E5E7E5]' : 'text-[#6B7280] hover:text-[#1A1D1B]'
          )}
        >
          Documents
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-[320px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280]" />
          <input
            type="text"
            placeholder="Search clients..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#E5E7E5] rounded-full text-sm text-[#1A1D1B] placeholder-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#1FAA6F]/20 focus:border-[#1FAA6F] transition-all"
          />
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-[#E5E7E5] rounded-full text-sm font-medium text-[#6B7280] hover:border-[#1FAA6F] hover:text-[#1FAA6F] transition-all">
          <Filter className="w-4 h-4" />
          Filter
        </button>
      </div>

      {/* Clients Table */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-5 h-5 text-[#6B7280] animate-spin" />
        </div>
      ) : tab === 'clients' ? (
        <div className="bg-white rounded-2xl border border-[#E5E7E5] shadow-[0_2px_8px_rgba(0,0,0,.05)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-[#F7F9F8] border-b border-[#E5E7E5]">
                  <th className="text-left px-4 py-3.5 text-[13px] font-medium text-[#6B7280] uppercase tracking-wider">Client</th>
                  <th className="text-left px-4 py-3.5 text-[13px] font-medium text-[#6B7280] uppercase tracking-wider">TIN</th>
                  <th className="text-left px-4 py-3.5 text-[13px] font-medium text-[#6B7280] uppercase tracking-wider">Phone</th>
                  <th className="text-left px-4 py-3.5 text-[13px] font-medium text-[#6B7280] uppercase tracking-wider">City</th>
                  <th className="text-left px-4 py-3.5 text-[13px] font-medium text-[#6B7280] uppercase tracking-wider">State</th>
                  <th className="text-left px-4 py-3.5 text-[13px] font-medium text-[#6B7280] uppercase tracking-wider">Zip</th>
                  <th className="text-left px-4 py-3.5 text-[13px] font-medium text-[#6B7280] uppercase tracking-wider">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7E5]">
                {filtered.map((c) => (
                  <tr
                    key={c.id}
                    onClick={() => setSelectedClient(c)}
                    className="group hover:bg-[#F7F9F8] transition-colors duration-150 cursor-pointer"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-[#0B3D2E] flex items-center justify-center text-white text-xs font-semibold shrink-0">
                          {c.initials}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-[#1A1D1B] group-hover:text-[#1FAA6F] transition-colors">{c.name}</p>
                          <p className="text-xs text-[#6B7280]">{c.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-[#6B7280] font-mono">{c.tin}</td>
                    <td className="px-4 py-3 text-sm text-[#6B7280]">{c.phone}</td>
                    <td className="px-4 py-3 text-sm text-[#6B7280]">{c.city}</td>
                    <td className="px-4 py-3 text-sm text-[#6B7280]">{c.state}</td>
                    <td className="px-4 py-3 text-sm text-[#6B7280]">{c.zip}</td>
                    <td className="px-4 py-3 text-sm text-[#6B7280]">{c.created}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between px-4 py-3 border-t border-[#E5E7E5] bg-[#F7F9F8]">
            <span className="text-sm text-[#6B7280]">1 of 1</span>
            <div className="flex items-center gap-2">
              <button className="p-2 rounded-lg border border-[#E5E7E5] text-[#6B7280] opacity-40 cursor-not-allowed">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button className="p-2 rounded-lg border border-[#E5E7E5] text-[#6B7280] opacity-40 cursor-not-allowed">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-[#E5E7E5] shadow-[0_2px_8px_rgba(0,0,0,.05)] p-12 text-center">
          <FileText className="w-10 h-10 text-[#6B7280] mx-auto mb-3" />
          <p className="text-sm font-medium text-[#6B7280]">No documents yet</p>
          <p className="text-xs text-[#6B7280] mt-1">Documents will appear here once clients upload them.</p>
        </div>
      )}

      {/* Floating AI Button */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-3">
        <button className="w-10 h-10 bg-white border border-[#E5E7E5] rounded-full shadow-md flex items-center justify-center text-[#6B7280] hover:text-[#1FAA6F] hover:border-[#1FAA6F] transition-all">
          <ArrowUpRight className="w-4 h-4" />
        </button>
        <button className="w-14 h-14 bg-[#0B3D2E] rounded-full shadow-lg flex items-center justify-center text-white hover:bg-[#1FAA6F] transition-all duration-200 hover:scale-105 active:scale-95">
          <MessageCircle className="w-6 h-6" />
        </button>
      </div>

      {/* Client Detail Modal */}
      {selectedClient && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30"
          onClick={(e) => { if (e.target === e.currentTarget) setSelectedClient(null) }}
        >
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden">
            <div className="relative bg-gradient-to-r from-[#0B3D2E] to-[#1FAA6F] px-6 pt-6 pb-16">
              <button
                onClick={() => setSelectedClient(null)}
                className="absolute top-4 right-4 p-1 text-white/70 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-white text-xl font-bold">
                  {selectedClient.initials}
                </div>
                <div className="text-white">
                  <h2 className="text-xl font-bold">{selectedClient.name}</h2>
                  <p className="text-sm text-white/80">{selectedClient.email}</p>
                </div>
              </div>
            </div>

            <div className="px-6 py-5 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <Hash className="w-4 h-4 text-[#6B7280] mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-[#6B7280] font-medium uppercase tracking-wider">TIN / SSN</p>
                    <p className="text-sm text-[#1A1D1B] font-mono">{selectedClient.tin}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="w-4 h-4 text-[#6B7280] mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-[#6B7280] font-medium uppercase tracking-wider">Phone</p>
                    <p className="text-sm text-[#1A1D1B]">{selectedClient.phone}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-[#6B7280] mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-[#6B7280] font-medium uppercase tracking-wider">Address</p>
                  <p className="text-sm text-[#1A1D1B]">{selectedClient.city}, {selectedClient.state} {selectedClient.zip}</p>
                </div>
              </div>

              {selectedClient.notes && (
                <div className="flex items-start gap-3">
                  <FileText className="w-4 h-4 text-[#6B7280] mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-[#6B7280] font-medium uppercase tracking-wider">Notes</p>
                    <p className="text-sm text-[#1A1D1B]">{selectedClient.notes}</p>
                  </div>
                </div>
              )}

              <div className="border-t border-[#E5E7E5] pt-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-3 bg-[#F7F9F8] rounded-xl">
                    <CalendarDays className="w-4 h-4 text-[#1FAA6F] mx-auto mb-1" />
                    <p className="text-xs text-[#6B7280]">Client Since</p>
                    <p className="text-sm font-semibold text-[#1A1D1B]">{selectedClient.created}</p>
                  </div>
                  <div className="text-center p-3 bg-[#F7F9F8] rounded-xl">
                    <Briefcase className="w-4 h-4 text-[#1FAA6F] mx-auto mb-1" />
                    <p className="text-xs text-[#6B7280]">Returns</p>
                    <p className="text-sm font-semibold text-[#1A1D1B]">{selectedClient.returnCount ?? 0}</p>
                  </div>
                  <div className="text-center p-3 bg-[#F7F9F8] rounded-xl">
                    <FileText className="w-4 h-4 text-[#1FAA6F] mx-auto mb-1" />
                    <p className="text-xs text-[#6B7280]">Documents</p>
                    <p className="text-sm font-semibold text-[#1A1D1B]">{selectedClient.documentCount ?? 0}</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button className="flex-1 px-4 py-2.5 bg-[#1FAA6F] text-white text-sm font-semibold rounded-full hover:bg-[#0B3D2E] transition-all">
                  View Returns
                </button>
                <button className="flex-1 px-4 py-2.5 border border-[#E5E7E5] text-[#6B7280] text-sm font-medium rounded-full hover:border-[#1FAA6F] hover:text-[#1FAA6F] transition-all">
                  Send Message
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Client Modal */}
      {showAddModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30"
          onClick={(e) => { if (e.target === e.currentTarget) { setShowAddModal(false); setFormError('') } }}
        >
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E7E5]">
              <h2 className="text-lg font-semibold text-[#1A1D1B]">Add New Client</h2>
              <button
                onClick={() => { setShowAddModal(false); setFormError('') }}
                className="p-1 text-[#6B7280] hover:text-[#1A1D1B] rounded-lg hover:bg-[#F7F9F8] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="px-6 py-5 space-y-4">
              {formError && (
                <div className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-xl">{formError}</div>
              )}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-[#1A1D1B] mb-1.5">First Name *</label>
                  <input
                    type="text"
                    value={addForm.firstName}
                    onChange={(e) => setAddForm({ ...addForm, firstName: e.target.value })}
                    placeholder="John"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5E7E5] bg-white text-sm text-[#1A1D1B] placeholder-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#1FAA6F]/20 focus:border-[#1FAA6F] transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#1A1D1B] mb-1.5">Last Name *</label>
                  <input
                    type="text"
                    value={addForm.lastName}
                    onChange={(e) => setAddForm({ ...addForm, lastName: e.target.value })}
                    placeholder="Doe"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5E7E5] bg-white text-sm text-[#1A1D1B] placeholder-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#1FAA6F]/20 focus:border-[#1FAA6F] transition-all"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1A1D1B] mb-1.5">Email</label>
                <input
                  type="email"
                  value={addForm.email}
                  onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                  placeholder="john@example.com"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5E7E5] bg-white text-sm text-[#1A1D1B] placeholder-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#1FAA6F]/20 focus:border-[#1FAA6F] transition-all"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-[#1A1D1B] mb-1.5">Phone</label>
                  <input
                    type="text"
                    value={addForm.phone}
                    onChange={(e) => setAddForm({ ...addForm, phone: e.target.value })}
                    placeholder="(555) 123-4567"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5E7E5] bg-white text-sm text-[#1A1D1B] placeholder-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#1FAA6F]/20 focus:border-[#1FAA6F] transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#1A1D1B] mb-1.5">TIN / SSN</label>
                  <input
                    type="text"
                    value={addForm.tin}
                    onChange={(e) => setAddForm({ ...addForm, tin: e.target.value })}
                    placeholder="XXX-XX-1234"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5E7E5] bg-white text-sm text-[#1A1D1B] placeholder-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#1FAA6F]/20 focus:border-[#1FAA6F] transition-all"
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-medium text-[#1A1D1B] mb-1.5">City</label>
                  <input
                    type="text"
                    value={addForm.city}
                    onChange={(e) => setAddForm({ ...addForm, city: e.target.value })}
                    placeholder="Anytown"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5E7E5] bg-white text-sm text-[#1A1D1B] placeholder-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#1FAA6F]/20 focus:border-[#1FAA6F] transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#1A1D1B] mb-1.5">State</label>
                  <input
                    type="text"
                    value={addForm.state}
                    onChange={(e) => setAddForm({ ...addForm, state: e.target.value })}
                    placeholder="ST"
                    maxLength={2}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5E7E5] bg-white text-sm text-[#1A1D1B] placeholder-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#1FAA6F]/20 focus:border-[#1FAA6F] transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#1A1D1B] mb-1.5">Zip</label>
                  <input
                    type="text"
                    value={addForm.zip}
                    onChange={(e) => setAddForm({ ...addForm, zip: e.target.value })}
                    placeholder="12345"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5E7E5] bg-white text-sm text-[#1A1D1B] placeholder-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#1FAA6F]/20 focus:border-[#1FAA6F] transition-all"
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => { setShowAddModal(false); setFormError('') }}
                  className="flex-1 px-4 py-2.5 border border-[#E5E7E5] text-[#6B7280] text-sm font-medium rounded-full hover:border-[#1FAA6F] hover:text-[#1FAA6F] transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddClient}
                  disabled={saving}
                  className="flex-1 px-4 py-2.5 bg-[#1FAA6F] text-white text-sm font-semibold rounded-full hover:bg-[#0B3D2E] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? <span className="inline-flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Saving...</span> : 'Add Client'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
