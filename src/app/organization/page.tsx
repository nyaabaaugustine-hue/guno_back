'use client'

import { useState, useEffect, useMemo } from 'react'
import { useSession } from 'next-auth/react'
import Icon from '@/components/Icon'
import Modal from '@/components/Modal'
import { canManageStaff, canManageCompanies, roleLabel } from '@/lib/rbac'

const tabs = ['User Management', 'Companies', 'Subscriptions', 'Organization Settings', 'Integrations', 'Company Details', 'Referrals']

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

export default function OrganizationPage() {
  const { data: session } = useSession()
  const myRole = session?.user?.role
  const isAdmin = canManageStaff(myRole)

  const [activeTab, setActiveTab] = useState('User Management')
  const [search, setSearch] = useState('')
  const [members, setMembers] = useState<TeamMember[]>(demoMembers)
  const [loading, setLoading] = useState(true)

  const [companies, setCompanies] = useState<Company[]>([])
  const [companiesLoading, setCompaniesLoading] = useState(true)
  const [companySearch, setCompanySearch] = useState('')

  // Invite modal state
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [inviteForm, setInviteForm] = useState<{ name: string; email: string; role: string; companyIds: string[] }>({
    name: '', email: '', role: 'preparer', companyIds: [],
  })
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  // Add company modal state
  const [showCompanyModal, setShowCompanyModal] = useState(false)
  const [companyForm, setCompanyForm] = useState({ name: '', industry: '', contactName: '', contactEmail: '', contactPhone: '', notes: '' })
  const [companySaving, setCompanySaving] = useState(false)
  const [companyFormError, setCompanyFormError] = useState('')

  // Assign-staff mini panel state
  const [assigningCompanyId, setAssigningCompanyId] = useState<string | null>(null)
  const [assignUserId, setAssignUserId] = useState('')
  const [assigning, setAssigning] = useState(false)

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

  // Staff eligible to be assigned to a company (company_agent role primarily,
  // but any staff member can be scoped to a company).
  const assignableStaff = useMemo(
    () => members.filter((m) => m.id && !m.id.startsWith('demo')),
    [members]
  )

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
    await fetch(`/api/companies/${companyId}/staff?userId=${userId}`, { method: 'DELETE' })
    await loadCompanies()
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
            {isAdmin && (
              <button onClick={() => setShowInviteModal(true)} className="btn btn-primary">
                <Icon name="plus" className="w-4 h-4" />
                Invite User
              </button>
            )}
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
                        <th className="text-left px-6 py-3 text-xs font-medium text-dark-500 uppercase tracking-wider">Assigned Companies</th>
                        <th className="text-left px-6 py-3 text-xs font-medium text-dark-500 uppercase tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-dark-50">
                      {filtered.length === 0 ? (
                        <tr><td colSpan={5} className="px-6 py-12 text-center text-sm text-dark-400">No team members found.</td></tr>
                      ) : filtered.map((m) => (
                        <tr key={m.id} className="hover:bg-dark-50/50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-juno-dark-green flex items-center justify-center text-white text-xs font-semibold">{m.initials}</div>
                              <span className="text-sm font-medium text-dark-900">{m.name}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`text-xs font-medium px-2 py-1 rounded-full ${m.rawRole === 'company_agent' ? 'bg-amber-50 text-amber-700' : 'bg-dark-100 text-dark-600'}`}>{m.role}</span>
                          </td>
                          <td className="px-6 py-4 text-sm text-dark-600">{m.email}</td>
                          <td className="px-6 py-4">
                            {m.companies && m.companies.length > 0 ? (
                              <div className="flex flex-wrap gap-1">
                                {m.companies.map((c) => (
                                  <span key={c} className="text-xs bg-juno-light-green text-juno-dark-green px-2 py-0.5 rounded-full">{c}</span>
                                ))}
                              </div>
                            ) : (
                              <span className="text-xs text-dark-400">—</span>
                            )}
                          </td>
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

      {/* Companies Content */}
      {activeTab === 'Companies' && (
        <>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-dark-900">Companies</h2>
              <p className="text-xs text-dark-500 mt-0.5">Client organizations your firm serves. Assign staff (Company Agents) to scope their access.</p>
            </div>
            {canManageCompanies(myRole) && (
              <button onClick={() => setShowCompanyModal(true)} className="btn btn-primary">
                <Icon name="plus" className="w-4 h-4" />
                Add Company
              </button>
            )}
          </div>

          <div className="card overflow-hidden">
            <div className="flex items-center gap-2 p-4 border-b border-dark-100">
              <Icon name="search" className="w-4 h-4 text-dark-400 shrink-0" />
              <input type="text" placeholder="Search Companies" value={companySearch} onChange={(e) => setCompanySearch(e.target.value)} className="flex-1 bg-transparent border-none outline-none text-sm text-dark-900 placeholder-dark-400" aria-label="Search companies" />
            </div>

            {companiesLoading ? (
              <div className="flex items-center justify-center py-12"><Icon name="refresh" className="w-5 h-5 text-dark-400 animate-spin" /></div>
            ) : filteredCompanies.length === 0 ? (
              <div className="px-6 py-12 text-center text-sm text-dark-400">
                No companies yet. {canManageCompanies(myRole) && 'Click "Add Company" to create one.'}
              </div>
            ) : (
              <div className="divide-y divide-dark-50">
                {filteredCompanies.map((c) => (
                  <div key={c.id} className="p-5">
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                          <Icon name="teamwork" className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-dark-900">{c.name}</p>
                          <p className="text-xs text-dark-500">{c.industry || 'Industry not set'}</p>
                          {(c.contactName || c.contactEmail) && (
                            <p className="text-xs text-dark-400 mt-1">
                              {c.contactName}{c.contactName && c.contactEmail ? ' · ' : ''}{c.contactEmail}
                            </p>
                          )}
                        </div>
                      </div>

                      {canManageStaff(myRole) && (
                        <button
                          onClick={() => setAssigningCompanyId(assigningCompanyId === c.id ? null : c.id)}
                          className="btn btn-secondary text-xs"
                        >
                          <Icon name="plus" className="w-3.5 h-3.5" />
                          Assign Staff
                        </button>
                      )}
                    </div>

                    {/* Assigned staff chips */}
                    <div className="mt-3 flex flex-wrap gap-2">
                      {c.staff.length === 0 ? (
                        <span className="text-xs text-dark-400">No staff assigned yet.</span>
                      ) : c.staff.map((s) => (
                        <span key={s.id} className="inline-flex items-center gap-1.5 text-xs bg-dark-50 text-dark-700 px-2.5 py-1 rounded-full">
                          {s.name}
                          {canManageStaff(myRole) && (
                            <button onClick={() => handleUnassignStaff(c.id, s.id)} className="text-dark-400 hover:text-red-600" aria-label={`Remove ${s.name}`}>
                              <Icon name="cancel" className="w-3 h-3" />
                            </button>
                          )}
                        </span>
                      ))}
                    </div>

                    {/* Inline assign panel */}
                    {assigningCompanyId === c.id && (
                      <div className="mt-3 flex items-center gap-2 bg-dark-50 p-3 rounded-lg">
                        <select
                          className="input flex-1"
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
                          className="btn btn-primary text-xs"
                        >
                          {assigning ? 'Assigning…' : 'Assign'}
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* Placeholder tabs */}
      {activeTab !== 'User Management' && activeTab !== 'Companies' && (
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
            <select className="input" value={inviteForm.role} onChange={(e) => setInviteForm({ ...inviteForm, role: e.target.value, companyIds: [] })}>
              <option value="preparer">Preparer</option>
              <option value="reviewer">Reviewer</option>
              <option value="firm_admin">Firm Admin</option>
              <option value="advisor">Advisor</option>
              <option value="company_agent">Company Agent (scoped to specific companies)</option>
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
          <p className="text-xs text-dark-400">They will receive an email with instructions to set up their account. Initial password: <code className="text-juno-dark-green bg-juno-light-green px-1 rounded">welcome123</code></p>
          <div className="pt-3 flex gap-3">
            <button onClick={() => { setShowInviteModal(false); setFormError('') }} className="btn btn-secondary flex-1">Cancel</button>
            <button onClick={handleInviteUser} disabled={saving} className="btn btn-primary flex-1">
              {saving ? <><Icon name="refresh" className="w-4 h-4 animate-spin" /> Sending...</> : 'Send Invite'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Add Company Modal */}
      <Modal open={showCompanyModal} onClose={() => { setShowCompanyModal(false); setCompanyFormError('') }} title="Add Company">
        <div className="space-y-4">
          {companyFormError && <div className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{companyFormError}</div>}
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
            <button onClick={handleAddCompany} disabled={companySaving} className="btn btn-primary flex-1">
              {companySaving ? <><Icon name="refresh" className="w-4 h-4 animate-spin" /> Adding...</> : 'Add Company'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
