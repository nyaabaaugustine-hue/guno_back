'use client'

import { useState, useEffect, useMemo } from 'react'
import { useSession } from 'next-auth/react'
import Modal from '@/components/Modal'
import { canManageStaff, canManageCompanies, roleLabel } from '@/lib/rbac'
import {
  Users, Building2, CreditCard, Settings, Puzzle, FileText, Gift,
  Search, Plus, X, RefreshCw, Check, Clock, Loader2,
  ChevronRight, ChevronLeft, UserCog, Shield, UserCheck, UserX,
  Pencil, Trash2, Mail, Phone, Briefcase, Circle, AlertCircle,
  Sparkles, ChevronDown, ChevronUp,
} from 'lucide-react'

const tabs = [
  { id: 'User Management', label: 'User Management', icon: Users },
  { id: 'Companies', label: 'Companies', icon: Building2 },
  { id: 'Subscriptions', label: 'Subscriptions', icon: CreditCard },
  { id: 'Organization Settings', label: 'Organization Settings', icon: Settings },
  { id: 'Integrations', label: 'Integrations', icon: Puzzle },
  { id: 'Company Details', label: 'Company Details', icon: FileText },
  { id: 'Referrals', label: 'Referrals', icon: Gift },
]

interface TeamMember {
  id: string
  initials: string
  name: string
  email: string
  role: string
  rawRole?: string
  status: string
  companies?: string[]
}

interface CompanyStaff {
  id: string
  name: string
  email: string
  role: string
}

interface Company {
  id: string
  name: string
  industry: string | null
  contactName: string | null
  contactEmail: string | null
  contactPhone: string | null
  notes: string | null
  staff: CompanyStaff[]
}

const demoMembers: TeamMember[] = [
  { id: '1', initials: 'AN', name: 'Augustine Nyaaba', email: 'nyaabaaugustine@gmail.com', role: 'Admin', rawRole: 'admin', status: 'active', companies: [] },
  { id: '2', initials: 'JD', name: 'Jane Doe', email: 'jane@firm.com', role: 'Preparer', rawRole: 'preparer', status: 'active', companies: [] },
  { id: '3', initials: 'MR', name: 'Mike Ross', email: 'mike@firm.com', role: 'Reviewer', rawRole: 'reviewer', status: 'active', companies: [] },
]

const PLACEHOLDER_CONTENT: Record<string, { title: string; description: string; features: string[] }> = {
  Subscriptions: {
    title: 'Subscription & Billing',
    description: 'Manage your plan, billing cycle, and payment methods.',
    features: ['Free Trial — 5 free preparations included', 'Pro Plan — unlimited returns, priority support', 'Enterprise — dedicated onboarding, custom integrations', 'Billing history, invoices, and payment method management'],
  },
  'Organization Settings': {
    title: 'Organization Settings',
    description: 'Configure your firm profile, brand, and preferences.',
    features: ['Firm name, logo, and branding', 'Default tax year and fiscal period settings', 'Notification preferences for team members', 'Security policies: password requirements, session timeouts'],
  },
  Integrations: {
    title: 'Integrations',
    description: 'Connect Juno with the tools your firm already uses.',
    features: ['QuickBooks Online — sync client data & transactions', 'Google Workspace — calendar & document integration', 'Dropbox / Google Drive — document import', 'Slack — return status notifications'],
  },
  'Company Details': {
    title: 'Company Details',
    description: 'Manage your own firm\'s legal and tax information.',
    features: ['EIN / tax ID number', 'Business address and contact info', 'Professional licenses and certifications', 'Banking details for direct deposit'],
  },
  Referrals: {
    title: 'Referral Program',
    description: 'Earn rewards by referring other firms to Juno.',
    features: ['Share your referral link with other tax firms', 'Earn 20% of their first 3 months', 'No limit on referrals', 'Track your referrals and earnings in real time'],
  },
}

export default function OrganizationPage() {
  const { data: session } = useSession()
  const myRole = session?.user?.role
  const isAdmin = canManageStaff(myRole)

  const [activeTab, setActiveTab] = useState('User Management')
  const [search, setSearch] = useState('')
  const [members, setMembers] = useState<TeamMember[]>(demoMembers)
  const [loading, setLoading] = useState(true)
  const [togglingUser, setTogglingUser] = useState<string | null>(null)

  const [companies, setCompanies] = useState<Company[]>([])
  const [companiesLoading, setCompaniesLoading] = useState(true)
  const [companySearch, setCompanySearch] = useState('')

  const [showInviteModal, setShowInviteModal] = useState(false)
  const [inviteForm, setInviteForm] = useState<{ name: string; email: string; role: string; companyIds: string[] }>({
    name: '', email: '', role: 'preparer', companyIds: [],
  })
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  const [showCompanyModal, setShowCompanyModal] = useState(false)
  const [companyForm, setCompanyForm] = useState({ name: '', industry: '', contactName: '', contactEmail: '', contactPhone: '', notes: '' })
  const [companySaving, setCompanySaving] = useState(false)
  const [companyFormError, setCompanyFormError] = useState('')

  const [showEditCompanyModal, setShowEditCompanyModal] = useState(false)
  const [editingCompany, setEditingCompany] = useState<Company | null>(null)
  const [editCompanySaving, setEditCompanySaving] = useState(false)
  const [editCompanyFormError, setEditCompanyFormError] = useState('')

  const [assigningCompanyId, setAssigningCompanyId] = useState<string | null>(null)
  const [assignUserId, setAssignUserId] = useState('')
  const [assigning, setAssigning] = useState(false)
  const [removingStaffId, setRemovingStaffId] = useState<string | null>(null)

  const loadMembers = async () => {
    try {
      const res = await fetch('/api/users')
      if (res.ok) {
        const data = await res.json()
        setMembers(data)
      }
    } catch {
      /* keep demo/previous members on failure */
    } finally {
      setLoading(false)
    }
  }

  const loadCompanies = async () => {
    try {
      const res = await fetch('/api/companies')
      if (res.ok) {
        setCompanies(await res.json())
      }
    } catch {
      /* keep whatever is already loaded */
    } finally {
      setCompaniesLoading(false)
    }
  }

  useEffect(() => {
    loadMembers()
    loadCompanies()
  }, [])

  const filtered = members.filter((m) =>
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.email.toLowerCase().includes(search.toLowerCase())
  )

  const filteredCompanies = companies.filter((c) =>
    c.name.toLowerCase().includes(companySearch.toLowerCase())
  )

  const assignableStaff = useMemo(
    () => members.filter((m) => m.id && !m.id.startsWith('demo')),
    [members]
  )

  const handleToggleActive = async (user: TeamMember) => {
    setTogglingUser(user.id)
    try {
      const res = await fetch(`/api/users/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: user.status !== 'active' }),
      })
      if (res.ok) {
        await loadMembers()
      }
    } finally {
      setTogglingUser(null)
    }
  }

  const handleDeleteUser = async (user: TeamMember) => {
    if (!confirm(`Remove ${user.name} from the organization? This cannot be undone.`)) return
    try {
      const res = await fetch(`/api/users/${user.id}`, { method: 'DELETE' })
      if (res.ok) {
        setSuccessMsg(`${user.name} removed.`)
        setTimeout(() => setSuccessMsg(''), 3000)
        await loadMembers()
      }
    } catch {
      /* silent */
    }
  }

  const handleDeleteCompany = async (company: Company) => {
    if (!confirm(`Delete ${company.name}? This will also remove all staff assignments.`)) return
    try {
      const res = await fetch(`/api/companies/${company.id}`, { method: 'DELETE' })
      if (res.ok) {
        setSuccessMsg(`${company.name} deleted.`)
        setTimeout(() => setSuccessMsg(''), 3000)
        await loadCompanies()
      }
    } catch {
      /* silent */
    }
  }

  const handleEditCompany = async () => {
    if (!editingCompany) return
    setEditCompanyFormError('')
    if (!companyForm.name) {
      setEditCompanyFormError('Company name is required')
      return
    }
    setEditCompanySaving(true)
    try {
      const res = await fetch(`/api/companies/${editingCompany.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(companyForm),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Failed to update company')
      }
      setShowEditCompanyModal(false)
      setEditingCompany(null)
      setSuccessMsg('Company updated successfully!')
      setTimeout(() => setSuccessMsg(''), 3000)
      await loadCompanies()
    } catch (err: any) {
      setEditCompanyFormError(err.message)
    } finally {
      setEditCompanySaving(false)
    }
  }

  const handleInviteUser = async () => {
    setFormError('')
    if (!inviteForm.name || !inviteForm.email) {
      setFormError('Name and email are required')
      return
    }
    if (inviteForm.role === 'company_agent' && inviteForm.companyIds.length === 0) {
      setFormError('Select at least one company for a Company Agent')
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
      setShowInviteModal(false)
      setInviteForm({ name: '', email: '', role: 'preparer', companyIds: [] })
      setSuccessMsg('User invited successfully!')
      setTimeout(() => setSuccessMsg(''), 3000)
      await loadMembers()
      await loadCompanies()
    } catch (err: any) {
      setFormError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleAddCompany = async () => {
    setCompanyFormError('')
    if (!companyForm.name) {
      setCompanyFormError('Company name is required')
      return
    }
    setCompanySaving(true)
    try {
      const res = await fetch('/api/companies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(companyForm),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Failed to add company')
      }
      setShowCompanyModal(false)
      setCompanyForm({ name: '', industry: '', contactName: '', contactEmail: '', contactPhone: '', notes: '' })
      setSuccessMsg('Company added successfully!')
      setTimeout(() => setSuccessMsg(''), 3000)
      await loadCompanies()
    } catch (err: any) {
      setCompanyFormError(err.message)
    } finally {
      setCompanySaving(false)
    }
  }

  const handleAssignStaff = async (companyId: string) => {
    if (!assignUserId) return
    setAssigning(true)
    try {
      const res = await fetch(`/api/companies/${companyId}/staff`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: assignUserId }),
      })
      if (res.ok) {
        setAssignUserId('')
        setAssigningCompanyId(null)
        await loadCompanies()
      }
    } finally {
      setAssigning(false)
    }
  }

  const handleUnassignStaff = async (companyId: string, userId: string) => {
    setRemovingStaffId(userId)
    try {
      const res = await fetch(`/api/companies/${companyId}/staff?userId=${userId}`, { method: 'DELETE' })
      if (res.ok) await loadCompanies()
    } finally {
      setRemovingStaffId(null)
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Trial Status Bar */}
      <div className="card p-5 flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2 bg-juno-light-green text-juno-dark-green px-3 py-1.5 rounded-lg text-sm font-medium">
            <Circle className="w-2 h-2 fill-juno-dark-green" />
            Organization
          </div>
          <div className="flex items-center gap-2 text-sm text-dark-500">
            <Clock className="w-4 h-4 text-dark-400" />
            <span>0/5 Free Preparations started</span>
          </div>
          <div className="h-5 w-px bg-dark-200" />
          <div className="flex items-center gap-2 text-sm text-dark-500">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span className="font-medium text-dark-700">4d 12h</span>
            <span>left in trial</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-green-500" />
          <span className="text-xs text-dark-500 font-medium">Free Trial</span>
        </div>
      </div>

      {/* Trial progress bar */}
      <div className="w-full bg-dark-100 rounded-full h-2 overflow-hidden">
        <div className="h-full w-0 bg-gradient-to-r from-juno-accent to-juno-dark-green rounded-full transition-all" />
      </div>

      {/* Success message */}
      {successMsg && (
        <div className="flex items-center gap-2 text-sm text-juno-dark-green bg-juno-light-green px-4 py-3 rounded-xl border border-juno-green/20">
          <Check className="w-4 h-4 shrink-0" />
          {successMsg}
        </div>
      )}

      {/* Top Navigation Tabs */}
      <div className="flex gap-1 bg-dark-50 p-1 rounded-xl overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-white text-dark-900 shadow-sm border border-dark-100'
                  : 'text-dark-500 hover:text-dark-700 hover:bg-white/50'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-juno-dark-green' : 'text-dark-400'}`} />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* ─── USER MANAGEMENT ─── */}
      {activeTab === 'User Management' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-dark-900">Team Members</h2>
              <p className="text-sm text-dark-500 mt-0.5">{members.length} member{members.length !== 1 ? 's' : ''} in your organization</p>
            </div>
            {isAdmin && (
              <button onClick={() => setShowInviteModal(true)} className="btn btn-primary flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Invite User
              </button>
            )}
          </div>

          <div className="card overflow-hidden">
            <div className="flex items-center gap-2 px-5 py-3 border-b border-dark-100">
              <Search className="w-4 h-4 text-dark-400 shrink-0" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1 bg-transparent border-none outline-none text-sm text-dark-900 placeholder-dark-400"
                aria-label="Search users"
              />
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-6 h-6 text-dark-400 animate-spin" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-dark-100 bg-dark-50/50">
                      <th className="text-left px-5 py-3 text-xs font-semibold text-dark-500 uppercase tracking-wider">Member</th>
                      <th className="text-left px-5 py-3 text-xs font-semibold text-dark-500 uppercase tracking-wider">Role</th>
                      <th className="text-left px-5 py-3 text-xs font-semibold text-dark-500 uppercase tracking-wider">Email</th>
                      <th className="text-left px-5 py-3 text-xs font-semibold text-dark-500 uppercase tracking-wider">Companies</th>
                      <th className="text-left px-5 py-3 text-xs font-semibold text-dark-500 uppercase tracking-wider">Status</th>
                      {isAdmin && <th className="text-right px-5 py-3 text-xs font-semibold text-dark-500 uppercase tracking-wider">Actions</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-dark-50">
                    {filtered.length === 0 ? (
                      <tr><td colSpan={isAdmin ? 6 : 5} className="px-5 py-16 text-center text-sm text-dark-400">No team members found.</td></tr>
                    ) : filtered.map((m) => (
                      <tr key={m.id} className="hover:bg-dark-50/50 transition-colors group">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-semibold shadow-sm ${
                              m.status === 'active' ? 'bg-gradient-to-br from-juno-dark-green to-juno-accent' : 'bg-dark-300'
                            }`}>
                              {m.initials}
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-dark-900">{m.name}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${
                            m.rawRole === 'company_agent'
                              ? 'bg-amber-50 text-amber-700 ring-1 ring-amber-200'
                              : m.rawRole === 'admin' || m.rawRole === 'firm_admin'
                              ? 'bg-purple-50 text-purple-700 ring-1 ring-purple-200'
                              : m.rawRole === 'reviewer'
                              ? 'bg-blue-50 text-blue-700 ring-1 ring-blue-200'
                              : 'bg-dark-100 text-dark-600 ring-1 ring-dark-200'
                          }`}>
                            <Shield className="w-3 h-3" />
                            {m.role}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-sm text-dark-600">{m.email}</td>
                        <td className="px-5 py-4">
                          {m.companies && m.companies.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {m.companies.map((c) => (
                                <span key={c} className="text-xs bg-juno-light-green text-juno-dark-green px-2 py-0.5 rounded-full font-medium">{c}</span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-xs text-dark-400">—</span>
                          )}
                        </td>
                        <td className="px-5 py-4">
                          {isAdmin ? (
                            <button
                              onClick={() => handleToggleActive(m)}
                              disabled={togglingUser === m.id}
                              className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full transition-all ${
                                m.status === 'active'
                                  ? 'bg-green-50 text-green-700 ring-1 ring-green-200 hover:bg-red-50 hover:text-red-700 hover:ring-red-200'
                                  : 'bg-dark-100 text-dark-500 ring-1 ring-dark-200 hover:bg-green-50 hover:text-green-700 hover:ring-green-200'
                              }`}
                            >
                              {togglingUser === m.id ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : m.status === 'active' ? (
                                <><UserCheck className="w-3 h-3" /> Active</>
                              ) : (
                                <><UserX className="w-3 h-3" /> Inactive</>
                              )}
                            </button>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-green-700 bg-green-50 px-2.5 py-1 rounded-full ring-1 ring-green-200">
                              <UserCheck className="w-3 h-3" />
                              {m.status}
                            </span>
                          )}
                        </td>
                        {isAdmin && (
                          <td className="px-5 py-4 text-right">
                            <button
                              onClick={() => handleDeleteUser(m)}
                              className="p-1.5 rounded-lg text-dark-300 hover:text-red-600 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all"
                              aria-label={`Remove ${m.name}`}
                              title="Remove user"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── COMPANIES ─── */}
      {activeTab === 'Companies' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-dark-900">Companies</h2>
              <p className="text-sm text-dark-500 mt-0.5">Client organizations your firm serves. Assign staff to scope their access.</p>
            </div>
            {canManageCompanies(myRole) && (
              <button onClick={() => setShowCompanyModal(true)} className="btn btn-primary flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Add Company
              </button>
            )}
          </div>

          <div className="card overflow-hidden">
            <div className="flex items-center gap-2 px-5 py-3 border-b border-dark-100">
              <Search className="w-4 h-4 text-dark-400 shrink-0" />
              <input
                type="text"
                placeholder="Search companies..."
                value={companySearch}
                onChange={(e) => setCompanySearch(e.target.value)}
                className="flex-1 bg-transparent border-none outline-none text-sm text-dark-900 placeholder-dark-400"
                aria-label="Search companies"
              />
            </div>

            {companiesLoading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-6 h-6 text-dark-400 animate-spin" />
              </div>
            ) : filteredCompanies.length === 0 ? (
              <div className="px-6 py-16 text-center">
                <Building2 className="w-10 h-10 text-dark-300 mx-auto mb-3" />
                <p className="text-sm text-dark-500">No companies yet.</p>
                {canManageCompanies(myRole) && (
                  <p className="text-xs text-dark-400 mt-1">Click "Add Company" to create one.</p>
                )}
              </div>
            ) : (
              <div className="divide-y divide-dark-50">
                {filteredCompanies.map((c) => (
                  <div key={c.id} className="p-5 hover:bg-dark-50/30 transition-colors">
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div className="flex items-start gap-4">
                        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white shrink-0 shadow-sm">
                          <Building2 className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-semibold text-dark-900">{c.name}</p>
                            {isAdmin && (
                              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  onClick={() => {
                                    setEditingCompany(c)
                                    setCompanyForm({
                                      name: c.name,
                                      industry: c.industry || '',
                                      contactName: c.contactName || '',
                                      contactEmail: c.contactEmail || '',
                                      contactPhone: c.contactPhone || '',
                                      notes: c.notes || '',
                                    })
                                    setShowEditCompanyModal(true)
                                  }}
                                  className="p-1 rounded text-dark-400 hover:text-juno-dark-green hover:bg-juno-mint transition-colors"
                                  title="Edit company"
                                >
                                  <Pencil className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteCompany(c)}
                                  className="p-1 rounded text-dark-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                                  title="Delete company"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            )}
                          </div>
                          <p className="text-xs text-dark-500 mt-0.5">{c.industry || 'Industry not set'}</p>
                          {(c.contactName || c.contactEmail || c.contactPhone) && (
                            <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-dark-400">
                              {c.contactName && <span className="flex items-center gap-1"><UserCog className="w-3 h-3" />{c.contactName}</span>}
                              {c.contactEmail && <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{c.contactEmail}</span>}
                              {c.contactPhone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{c.contactPhone}</span>}
                            </div>
                          )}
                        </div>
                      </div>

                      {canManageStaff(myRole) && (
                        <button
                          onClick={() => setAssigningCompanyId(assigningCompanyId === c.id ? null : c.id)}
                          className="btn btn-secondary text-xs flex items-center gap-1.5 shrink-0"
                        >
                          {assigningCompanyId === c.id ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                          Assign Staff
                        </button>
                      )}
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {c.staff.length === 0 ? (
                        <span className="text-xs text-dark-400 italic">No staff assigned yet.</span>
                      ) : c.staff.map((s) => (
                        <span key={s.id} className="inline-flex items-center gap-1.5 text-xs font-medium bg-dark-50 text-dark-700 px-2.5 py-1 rounded-full ring-1 ring-dark-200">
                          <UserCog className="w-3 h-3 text-dark-400" />
                          {s.name}
                          {canManageStaff(myRole) && (
                            <button
                              onClick={() => handleUnassignStaff(c.id, s.id)}
                              disabled={removingStaffId === s.id}
                              className="ml-0.5 text-dark-400 hover:text-red-600 disabled:opacity-50 transition-colors"
                              aria-label={`Remove ${s.name}`}
                            >
                              {removingStaffId === s.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <X className="w-3 h-3" />}
                            </button>
                          )}
                        </span>
                      ))}
                    </div>

                    {assigningCompanyId === c.id && (
                      <div className="mt-4 flex items-center gap-2 bg-dark-50 p-3 rounded-xl ring-1 ring-dark-200">
                        <select
                          className="input flex-1 text-sm"
                          value={assignUserId}
                          onChange={(e) => setAssignUserId(e.target.value)}
                        >
                          <option value="">Select staff member…</option>
                          {assignableStaff
                            .filter((m) => !c.staff.some((s) => s.id === m.id))
                            .map((m) => (
                              <option key={m.id} value={m.id}>{m.name} ({m.role})</option>
                            ))}
                        </select>
                        <button
                          onClick={() => handleAssignStaff(c.id)}
                          disabled={!assignUserId || assigning}
                          className="btn btn-primary text-xs inline-flex items-center gap-1.5"
                        >
                          {assigning ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <UserCheck className="w-3.5 h-3.5" />}
                          {assigning ? 'Assigning…' : 'Assign'}
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── PLACEHOLDER TABS ─── */}
      {activeTab !== 'User Management' && activeTab !== 'Companies' && (
        <div className="card p-8 text-center max-w-lg mx-auto">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-juno-dark-green to-juno-accent flex items-center justify-center mx-auto mb-5 shadow-lg shadow-juno-dark-green/20">
            {(() => {
              const TabIcon = tabs.find(t => t.id === activeTab)?.icon || Settings
              return <TabIcon className="w-7 h-7 text-white" />
            })()}
          </div>
          <h3 className="text-lg font-bold text-dark-900 mb-2">{PLACEHOLDER_CONTENT[activeTab]?.title || activeTab}</h3>
          <p className="text-sm text-dark-500 mb-6">{PLACEHOLDER_CONTENT[activeTab]?.description || 'This section is coming soon.'}</p>
          {PLACEHOLDER_CONTENT[activeTab]?.features && (
            <div className="text-left space-y-3 bg-dark-50 rounded-xl p-5">
              {PLACEHOLDER_CONTENT[activeTab].features.map((f, i) => (
                <div key={i} className="flex items-start gap-3 text-sm text-dark-600">
                  <Check className="w-4 h-4 text-juno-accent shrink-0 mt-0.5" />
                  <span>{f}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ─── INVITE USER MODAL ─── */}
      <Modal open={showInviteModal} onClose={() => { setShowInviteModal(false); setFormError('') }} title="Invite Team Member">
        <div className="space-y-4">
          {formError && <div className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg flex items-center gap-2"><AlertCircle className="w-4 h-4 shrink-0" />{formError}</div>}
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
            <select className="input" value={inviteForm.role} onChange={(e) => setInviteForm({ ...inviteForm, role: e.target.value, companyIds: [] })}>
              <option value="preparer">Preparer</option>
              <option value="reviewer">Reviewer</option>
              <option value="firm_admin">Firm Admin</option>
              <option value="advisor">Advisor</option>
              <option value="company_agent">Company Agent (scoped to companies)</option>
            </select>
          </div>
          {inviteForm.role === 'company_agent' && (
            <div>
              <label className="label">Assigned Companies</label>
              <div className="border border-dark-200 rounded-lg max-h-40 overflow-y-auto divide-y divide-dark-50">
                {companies.length === 0 ? (
                  <p className="text-xs text-dark-400 px-3 py-3">No companies yet — add one from the Companies tab first.</p>
                ) : companies.map((c) => (
                  <label key={c.id} className="flex items-center gap-2 px-3 py-2 text-sm text-dark-700 cursor-pointer hover:bg-dark-50">
                    <input
                      type="checkbox"
                      checked={inviteForm.companyIds.includes(c.id)}
                      onChange={(e) => {
                        setInviteForm((prev) => ({
                          ...prev,
                          companyIds: e.target.checked
                            ? [...prev.companyIds, c.id]
                            : prev.companyIds.filter((id) => id !== c.id),
                        }))
                      }}
                      className="rounded border-dark-300 text-juno-dark-green focus:ring-juno-green/20"
                    />
                    {c.name}
                  </label>
                ))}
              </div>
            </div>
          )}
          <p className="text-xs text-dark-400">They will receive an email with setup instructions. Initial password: <code className="text-juno-dark-green bg-juno-light-green px-1 rounded">welcome123</code></p>
          <div className="pt-3 flex gap-3">
            <button onClick={() => { setShowInviteModal(false); setFormError('') }} className="btn btn-secondary flex-1">Cancel</button>
            <button onClick={handleInviteUser} disabled={saving} className="btn btn-primary flex-1 inline-flex items-center justify-center gap-2">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
              {saving ? 'Sending...' : 'Send Invite'}
            </button>
          </div>
        </div>
      </Modal>

      {/* ─── ADD COMPANY MODAL ─── */}
      <Modal open={showCompanyModal} onClose={() => { setShowCompanyModal(false); setCompanyFormError('') }} title="Add Company">
        <div className="space-y-4">
          {companyFormError && <div className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg flex items-center gap-2"><AlertCircle className="w-4 h-4 shrink-0" />{companyFormError}</div>}
          <div>
            <label className="label">Company Name</label>
            <input type="text" className="input" value={companyForm.name} onChange={(e) => setCompanyForm({ ...companyForm, name: e.target.value })} placeholder="Acme Corp" />
          </div>
          <div>
            <label className="label">Industry</label>
            <input type="text" className="input" value={companyForm.industry} onChange={(e) => setCompanyForm({ ...companyForm, industry: e.target.value })} placeholder="Manufacturing" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Contact Name</label>
              <input type="text" className="input" value={companyForm.contactName} onChange={(e) => setCompanyForm({ ...companyForm, contactName: e.target.value })} placeholder="Wendell Acme" />
            </div>
            <div>
              <label className="label">Contact Phone</label>
              <input type="text" className="input" value={companyForm.contactPhone} onChange={(e) => setCompanyForm({ ...companyForm, contactPhone: e.target.value })} placeholder="(555) 010-1000" />
            </div>
          </div>
          <div>
            <label className="label">Contact Email</label>
            <input type="email" className="input" value={companyForm.contactEmail} onChange={(e) => setCompanyForm({ ...companyForm, contactEmail: e.target.value })} placeholder="billing@acme.com" />
          </div>
          <div>
            <label className="label">Notes</label>
            <textarea className="input" rows={3} value={companyForm.notes} onChange={(e) => setCompanyForm({ ...companyForm, notes: e.target.value })} placeholder="Optional notes about this company" />
          </div>
          <div className="pt-3 flex gap-3">
            <button onClick={() => { setShowCompanyModal(false); setCompanyFormError('') }} className="btn btn-secondary flex-1">Cancel</button>
            <button onClick={handleAddCompany} disabled={companySaving} className="btn btn-primary flex-1 inline-flex items-center justify-center gap-2">
              {companySaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Building2 className="w-4 h-4" />}
              {companySaving ? 'Adding...' : 'Add Company'}
            </button>
          </div>
        </div>
      </Modal>

      {/* ─── EDIT COMPANY MODAL ─── */}
      <Modal open={showEditCompanyModal} onClose={() => { setShowEditCompanyModal(false); setEditCompanyFormError('') }} title="Edit Company">
        <div className="space-y-4">
          {editCompanyFormError && <div className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg flex items-center gap-2"><AlertCircle className="w-4 h-4 shrink-0" />{editCompanyFormError}</div>}
          <div>
            <label className="label">Company Name</label>
            <input type="text" className="input" value={companyForm.name} onChange={(e) => setCompanyForm({ ...companyForm, name: e.target.value })} placeholder="Acme Corp" />
          </div>
          <div>
            <label className="label">Industry</label>
            <input type="text" className="input" value={companyForm.industry} onChange={(e) => setCompanyForm({ ...companyForm, industry: e.target.value })} placeholder="Manufacturing" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Contact Name</label>
              <input type="text" className="input" value={companyForm.contactName} onChange={(e) => setCompanyForm({ ...companyForm, contactName: e.target.value })} placeholder="Wendell Acme" />
            </div>
            <div>
              <label className="label">Contact Phone</label>
              <input type="text" className="input" value={companyForm.contactPhone} onChange={(e) => setCompanyForm({ ...companyForm, contactPhone: e.target.value })} placeholder="(555) 010-1000" />
            </div>
          </div>
          <div>
            <label className="label">Contact Email</label>
            <input type="email" className="input" value={companyForm.contactEmail} onChange={(e) => setCompanyForm({ ...companyForm, contactEmail: e.target.value })} placeholder="billing@acme.com" />
          </div>
          <div>
            <label className="label">Notes</label>
            <textarea className="input" rows={3} value={companyForm.notes} onChange={(e) => setCompanyForm({ ...companyForm, notes: e.target.value })} placeholder="Optional notes" />
          </div>
          <div className="pt-3 flex gap-3">
            <button onClick={() => { setShowEditCompanyModal(false); setEditCompanyFormError('') }} className="btn btn-secondary flex-1">Cancel</button>
            <button onClick={handleEditCompany} disabled={editCompanySaving} className="btn btn-primary flex-1 inline-flex items-center justify-center gap-2">
              {editCompanySaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              {editCompanySaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
