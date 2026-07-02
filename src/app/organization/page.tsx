'use client'

import { useState, useEffect } from 'react'
import Icon from '@/components/Icon'
import Modal from '@/components/Modal'

const tabs = ['User Management', 'Subscriptions', 'Organization Settings', 'Integrations', 'Company Details', 'Referrals']

interface TeamMember {
  id: string
  initials: string
  name: string
  email: string
  role: string
  status: string
}

const demoMembers: TeamMember[] = [
  { id: '1', initials: 'AN', name: 'Augustine Nyaaba', email: 'nyaabaaugustine@gmail.com', role: 'Org Admin', status: 'active' },
  { id: '2', initials: 'JD', name: 'Jane Doe', email: 'jane@firm.com', role: 'Preparer', status: 'active' },
  { id: '3', initials: 'MR', name: 'Mike Ross', email: 'mike@firm.com', role: 'Reviewer', status: 'active' },
]

export default function OrganizationPage() {
  const [activeTab, setActiveTab] = useState('User Management')
  const [search, setSearch] = useState('')
  const [members, setMembers] = useState<TeamMember[]>(demoMembers)
  const [loading, setLoading] = useState(true)

  // Invite modal state
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [inviteForm, setInviteForm] = useState({ name: '', email: '', role: 'preparer' })
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  useEffect(() => {
    // Could load real members from API here in the future
    setLoading(false)
  }, [])

  const filtered = members.filter((m) =>
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.email.toLowerCase().includes(search.toLowerCase())
  )

  const handleInviteUser = async () => {
    setFormError('')
    if (!inviteForm.name || !inviteForm.email) {
      setFormError('Name and email are required')
      return
    }
    setSaving(true)
    try {
      const res = await fetch('/api/users/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(inviteForm),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Failed to invite user')
      }
      const user = await res.json()
      const newMember: TeamMember = {
        id: user.id,
        initials: inviteForm.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2),
        name: inviteForm.name,
        email: inviteForm.email,
        role: inviteForm.role.charAt(0).toUpperCase() + inviteForm.role.slice(1).replace('_', ' '),
        status: 'active',
      }
      setMembers([...members, newMember])
      setShowInviteModal(false)
      setInviteForm({ name: '', email: '', role: 'preparer' })
      setSuccessMsg('User invited successfully!')
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
            Organization
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
        <div className="mb-4 flex items-center gap-2 text-sm text-juno-dark-green bg-juno-light-green px-4 py-2.5 rounded-lg">
          <Icon name="check" className="w-4 h-4" />
          {successMsg}
        </div>
      )}

      {/* Top Navigation Tabs */}
      <div className="flex gap-1 mb-6 bg-dark-50 p-1 rounded-lg overflow-x-auto">
        {tabs.map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-all ${activeTab === tab ? 'bg-white text-dark-900 shadow-sm' : 'text-dark-500 hover:text-dark-700'}`}>{tab}</button>
        ))}
      </div>

      {/* User Management Content */}
      {activeTab === 'User Management' && (
        <>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-dark-900">Team Members</h2>
            <button onClick={() => setShowInviteModal(true)} className="btn btn-primary">
              <Icon name="plus" className="w-4 h-4" />
              Invite User
            </button>
          </div>

          <div className="card overflow-hidden">
            <div className="flex items-center gap-2 p-4 border-b border-dark-100">
              <Icon name="search" className="w-4 h-4 text-dark-400 shrink-0" />
              <input type="text" placeholder="Search User" value={search} onChange={(e) => setSearch(e.target.value)} className="flex-1 bg-transparent border-none outline-none text-sm text-dark-900 placeholder-dark-400" aria-label="Search users" />
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">              <Icon name="refresh" className="w-5 h-5 text-dark-400 animate-spin" /></div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-dark-100 bg-dark-50">
                        <th className="text-left px-6 py-3 text-xs font-medium text-dark-500 uppercase tracking-wider">Members</th>
                        <th className="text-left px-6 py-3 text-xs font-medium text-dark-500 uppercase tracking-wider">Role</th>
                        <th className="text-left px-6 py-3 text-xs font-medium text-dark-500 uppercase tracking-wider">Email</th>
                        <th className="text-left px-6 py-3 text-xs font-medium text-dark-500 uppercase tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-dark-50">
                      {filtered.map((m) => (
                        <tr key={m.id} className="hover:bg-dark-50/50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-juno-dark-green flex items-center justify-center text-white text-xs font-semibold">{m.initials}</div>
                              <span className="text-sm font-medium text-dark-900">{m.name}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4"><span className="text-sm text-dark-600">{m.role}</span></td>
                          <td className="px-6 py-4 text-sm text-dark-600">{m.email}</td>
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-green-700 bg-green-50 px-2.5 py-0.5 rounded-full">
                              <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                              {m.status}
                            </span>
                          </td>
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
        </>
      )}

      {/* Placeholder tabs */}
      {activeTab !== 'User Management' && (
        <div className="card p-8 text-center">
          <p className="text-dark-500 text-sm">{activeTab} settings will be available here.</p>
        </div>
      )}

      {/* Invite User Modal */}
      <Modal open={showInviteModal} onClose={() => { setShowInviteModal(false); setFormError('') }} title="Invite Team Member">
        <div className="space-y-4">
          {formError && <div className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{formError}</div>}
          <div>
            <label className="label">Full Name</label>
            <input type="text" className="input" value={inviteForm.name} onChange={(e) => setInviteForm({ ...inviteForm, name: e.target.value })} placeholder="Jane Smith" />
          </div>
          <div>
            <label className="label">Email Address</label>
            <input type="email" className="input" value={inviteForm.email} onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })} placeholder="jane@firm.com" />
          </div>
          <div>
            <label className="label">Role</label>
            <select className="input" value={inviteForm.role} onChange={(e) => setInviteForm({ ...inviteForm, role: e.target.value })}>
              <option value="preparer">Preparer</option>
              <option value="reviewer">Reviewer</option>
              <option value="firm_admin">Firm Admin</option>
              <option value="advisor">Advisor</option>
            </select>
          </div>
          <p className="text-xs text-dark-400">They will receive an email with instructions to set up their account. Initial password: <code className="text-juno-dark-green bg-juno-light-green px-1 rounded">welcome123</code></p>
          <div className="pt-3 flex gap-3">
            <button onClick={() => { setShowInviteModal(false); setFormError('') }} className="btn btn-secondary flex-1">Cancel</button>
            <button onClick={handleInviteUser} disabled={saving} className="btn btn-primary flex-1">
              {saving ? <><Icon name="refresh" className="w-4 h-4 animate-spin" /> Sending...</> : 'Send Invite'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
