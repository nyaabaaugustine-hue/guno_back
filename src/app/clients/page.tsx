'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Icon from '@/components/Icon'
import Modal from '@/components/Modal'

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
}

// Demo data fallback when API isn't available
const demoClients: Client[] = [
  { id: '1', initials: 'JP', name: 'John Doe - Demo Preparation', email: 'jdoe@juno.tax', tin: 'XXX-XX-1234', phone: '(555) 123-4567', city: 'Anytown', state: 'ST', zip: '12345', created: '2026-06-30' },
  { id: '2', initials: 'DC', name: 'Demo Corporation', email: 'dcorp@juno.tax', tin: 'XX-XXXXX', phone: '(555) 234-5678', city: 'Othertown', state: 'ST', zip: '23456', created: '2026-06-28' },
  { id: '3', initials: 'BS', name: 'Bob Smith', email: 'bob@smith.com', tin: 'XXX-XX-5678', phone: '(555) 345-6789', city: 'Springfield', state: 'IL', zip: '62701', created: '2026-06-25' },
]

type Tab = 'clients' | 'documents'

export default function ClientsPage() {
  const [tab, setTab] = useState<Tab>('clients')
  const [search, setSearch] = useState('')
  const [clients, setClients] = useState<Client[]>(demoClients)
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [addForm, setAddForm] = useState({ firstName: '', lastName: '', email: '', phone: '', tin: '', city: '', state: '', zip: '' })
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  // Load clients from API
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
              tin: c.ssn || '—',
              phone: c.phone || '—',
              city: c.address?.split(',')[0] || '—',
              state: c.address?.split(',')[1]?.trim() || '—',
              zip: c.address?.split(',')[2]?.trim() || '—',
              created: c.createdAt ? new Date(c.createdAt).toLocaleDateString() : '—',
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
        email: addForm.email || '—',
        tin: addForm.tin || '—',
        phone: addForm.phone || '—',
        city: addForm.city || '—',
        state: addForm.state || '—',
        zip: addForm.zip || '—',
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
    <div>
      {/* Trial Status Bar */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-juno-light-green text-juno-dark-green px-3 py-1.5 rounded-lg text-sm font-medium">
            <span className="w-2 h-2 bg-juno-dark-green rounded-full" />
            Clients
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

      {/* Success message */}
      {successMsg && (
        <div className="mb-4 text-sm text-juno-dark-green bg-juno-light-green px-4 py-2 rounded-lg">
          {successMsg}
        </div>
      )}

      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-display font-bold text-dark-900">Clients</h1>
        <button onClick={() => setShowAddModal(true)} className="btn btn-primary">
          <Icon name="plus" className="w-4 h-4" />
          Add Client
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-dark-50 p-1 rounded-lg w-fit">
        <button onClick={() => setTab('clients')} className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${tab === 'clients' ? 'bg-white text-dark-900 shadow-sm' : 'text-dark-500 hover:text-dark-700'}`}>Clients</button>
        <button onClick={() => setTab('documents')} className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${tab === 'documents' ? 'bg-white text-dark-900 shadow-sm' : 'text-dark-500 hover:text-dark-700'}`}>Documents</button>
      </div>

      {/* Search + Table */}
      <div className="card overflow-hidden">
        <div className="flex items-center gap-2 p-4 border-b border-dark-100">
          <Icon name="search" className="w-4 h-4 text-dark-400 shrink-0" />
          <input type="text" placeholder="Search List" value={search} onChange={(e) => setSearch(e.target.value)} className="flex-1 bg-transparent border-none outline-none text-sm text-dark-900 placeholder-dark-400" aria-label="Search clients" />
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Icon name="refresh" className="w-5 h-5 text-dark-400 animate-spin" />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-dark-100 bg-dark-50">
                    <th className="text-left px-6 py-3 text-xs font-medium text-dark-500 uppercase tracking-wider">Client</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-dark-500 uppercase tracking-wider">TIN</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-dark-500 uppercase tracking-wider">Phone</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-dark-500 uppercase tracking-wider">City</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-dark-500 uppercase tracking-wider">State</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-dark-500 uppercase tracking-wider">Zip</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-dark-500 uppercase tracking-wider">Created</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-50">
                  {filtered.map((c) => (
                    <tr key={c.id} className="hover:bg-dark-50/50 transition-colors cursor-pointer">
                      <td className="px-6 py-4">
                        <Link href={`/clients/${c.id}`} className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-dark-100 flex items-center justify-center text-xs font-semibold text-dark-600 shrink-0">{c.initials}</div>
                          <div>
                            <p className="text-sm font-medium text-dark-900 hover:text-juno-dark-green transition-colors">{c.name}</p>
                            <p className="text-xs text-dark-400">{c.email}</p>
                          </div>
                        </Link>
                      </td>
                      <td className="px-6 py-4 text-sm text-dark-600 font-mono">{c.tin}</td>
                      <td className="px-6 py-4 text-sm text-dark-600">{c.phone}</td>
                      <td className="px-6 py-4 text-sm text-dark-600">{c.city}</td>
                      <td className="px-6 py-4 text-sm text-dark-600">{c.state}</td>
                      <td className="px-6 py-4 text-sm text-dark-600">{c.zip}</td>
                      <td className="px-6 py-4 text-sm text-dark-500">{c.created}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between px-6 py-3 border-t border-dark-100 bg-dark-50">
              <p className="text-sm text-dark-500">1 of 1</p>
              <div className="flex items-center gap-2">
                <button className="p-1 text-dark-400 hover:text-dark-900 disabled:opacity-30 transition-colors" disabled><Icon name="back" className="w-4 h-4" /></button>
                <button className="p-1 text-dark-400 hover:text-dark-900 disabled:opacity-30 transition-colors" disabled><Icon name="forward" className="w-4 h-4" /></button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Add Client Modal */}
      <Modal open={showAddModal} onClose={() => { setShowAddModal(false); setFormError('') }} title="Add New Client">
        <div className="space-y-4">
          {formError && <div className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{formError}</div>}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">First Name *</label>
              <input type="text" className="input" value={addForm.firstName} onChange={(e) => setAddForm({ ...addForm, firstName: e.target.value })} placeholder="John" />
            </div>
            <div>
              <label className="label">Last Name *</label>
              <input type="text" className="input" value={addForm.lastName} onChange={(e) => setAddForm({ ...addForm, lastName: e.target.value })} placeholder="Doe" />
            </div>
          </div>
          <div>
            <label className="label">Email</label>
            <input type="email" className="input" value={addForm.email} onChange={(e) => setAddForm({ ...addForm, email: e.target.value })} placeholder="john@example.com" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Phone</label>
              <input type="text" className="input" value={addForm.phone} onChange={(e) => setAddForm({ ...addForm, phone: e.target.value })} placeholder="(555) 123-4567" />
            </div>
            <div>
              <label className="label">TIN / SSN</label>
              <input type="text" className="input" value={addForm.tin} onChange={(e) => setAddForm({ ...addForm, tin: e.target.value })} placeholder="XXX-XX-1234" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-1">
              <label className="label">City</label>
              <input type="text" className="input" value={addForm.city} onChange={(e) => setAddForm({ ...addForm, city: e.target.value })} placeholder="Anytown" />
            </div>
            <div>
              <label className="label">State</label>
              <input type="text" className="input" value={addForm.state} onChange={(e) => setAddForm({ ...addForm, state: e.target.value })} placeholder="ST" maxLength={2} />
            </div>
            <div>
              <label className="label">Zip</label>
              <input type="text" className="input" value={addForm.zip} onChange={(e) => setAddForm({ ...addForm, zip: e.target.value })} placeholder="12345" />
            </div>
          </div>
          <div className="pt-3 flex gap-3">
            <button onClick={() => { setShowAddModal(false); setFormError('') }} className="btn btn-secondary flex-1">Cancel</button>
            <button onClick={handleAddClient} disabled={saving} className="btn btn-primary flex-1">
              {saving ? <><Icon name="refresh" className="w-4 h-4 animate-spin" /> Saving...</> : 'Add Client'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
