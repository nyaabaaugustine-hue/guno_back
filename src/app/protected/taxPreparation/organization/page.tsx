'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { cn } from '@/lib/utils'
import {
  Users, Search, Plus, ChevronDown, ChevronRight, Clock, Shield,
  LogOut, Settings, Loader2, X, Check, Building2, Mail, Phone,
  UserPlus, Trash2, MapPin, Briefcase, MoreHorizontal, FileText,
  CreditCard, Link2, Sliders, Star, RefreshCw
} from 'lucide-react'
import { canManageStaff, canManageCompanies, roleLabel as getRoleLabel } from '@/lib/rbac'

const TABS = ['User Management', 'Companies', 'Subscriptions', 'Organization Settings', 'Integrations', 'Company Details', 'Referrals']

interface TeamMember {
  id: string; initials: string; name: string; email: string; role: string; rawRole?: string; status: string; companies?: string[]
}
interface CompanyStaff { id: string; name: string; email: string; role: string }
interface Company {
  id: string; name: string; industry: string | null; contactName: string | null
  contactEmail: string | null; contactPhone: string | null; notes: string | null; staff: CompanyStaff[]
}

export default function OrganizationPage() {
  const { data: session } = useSession()
  const [activeTab, setActiveTab] = useState('User Management')
  const [profileOpen, setProfileOpen] = useState(false)
  const profileRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const user = session?.user
  const userName = user?.name || 'User'
  const userEmail = user?.email || ''
  const myRole = user?.role || 'preparer'
  const roleLabel = myRole === 'firm_admin' ? 'Org Admin' : myRole === 'admin' ? 'Admin' : myRole.charAt(0).toUpperCase() + myRole.slice(1)
  const uInitials = userName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
  const isAdmin = canManageStaff(myRole)

  // Members
  const [search, setSearch] = useState('')
  const [members, setMembers] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)
  // Companies
  const [companies, setCompanies] = useState<Company[]>([])
  const [companiesLoading, setCompaniesLoading] = useState(true)
  const [companySearch, setCompanySearch] = useState('')
  // Modals
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [inviteForm, setInviteForm] = useState({ name: '', email: '', role: 'preparer', companyIds: [] as string[] })
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [showCompanyModal, setShowCompanyModal] = useState(false)
  const [companyForm, setCompanyForm] = useState({ name: '', industry: '', contactName: '', contactEmail: '', contactPhone: '', notes: '' })
  const [companySaving, setCompanySaving] = useState(false)
  const [companyFormError, setCompanyFormError] = useState('')
  const [assigningCompanyId, setAssigningCompanyId] = useState<string | null>(null)
  const [assignUserId, setAssignUserId] = useState('')
  const [assigning, setAssigning] = useState(false)

  const loadMembers = async () => {
    try {
      const res = await fetch('/api/users')
      if (res.ok) setMembers(await res.json())
    } catch {} finally { setLoading(false) }
  }
  const loadCompanies = async () => {
    try {
      const res = await fetch('/api/companies')
      if (res.ok) setCompanies(await res.json())
    } catch {} finally { setCompaniesLoading(false) }
  }
  useEffect(() => { loadMembers(); loadCompanies() }, [])

  const filtered = members.filter(m => m.name.toLowerCase().includes(search.toLowerCase()) || m.email.toLowerCase().includes(search.toLowerCase()))
  const filteredCompanies = companies.filter(c => c.name.toLowerCase().includes(companySearch.toLowerCase()))
  const assignableStaff = useMemo(() => members.filter(m => m.id && !m.id.startsWith('demo')), [members])

  const handleInviteUser = async () => {
    setFormError('')
    if (!inviteForm.name || !inviteForm.email) { setFormError('Name and email are required'); return }
    if (inviteForm.role === 'company_agent' && inviteForm.companyIds.length === 0) { setFormError('Select at least one company'); return }
    setSaving(true)
    try {
      const res = await fetch('/api/users/invite', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(inviteForm) })
      if (!res.ok) { const err = await res.json(); throw new Error(err.error || 'Failed') }
      setShowInviteModal(false); setInviteForm({ name: '', email: '', role: 'preparer', companyIds: [] })
      setSuccessMsg('User invited successfully!'); setTimeout(() => setSuccessMsg(''), 3000)
      await loadMembers(); await loadCompanies()
    } catch (e: any) { setFormError(e.message) } finally { setSaving(false) }
  }

  const handleAddCompany = async () => {
    setCompanyFormError('')
    if (!companyForm.name) { setCompanyFormError('Company name is required'); return }
    setCompanySaving(true)
    try {
      const res = await fetch('/api/companies', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(companyForm) })
      if (!res.ok) { const err = await res.json(); throw new Error(err.error || 'Failed') }
      setShowCompanyModal(false); setCompanyForm({ name: '', industry: '', contactName: '', contactEmail: '', contactPhone: '', notes: '' })
      setSuccessMsg('Company added successfully!'); setTimeout(() => setSuccessMsg(''), 3000)
      await loadCompanies()
    } catch (e: any) { setCompanyFormError(e.message) } finally { setCompanySaving(false) }
  }

  const handleAssignStaff = async (companyId: string) => {
    if (!assignUserId) return
    setAssigning(true)
    try {
      const res = await fetch(`/api/companies/${companyId}/staff`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId: assignUserId }) })
      if (res.ok) { setAssignUserId(''); setAssigningCompanyId(null); await loadCompanies() }
    } finally { setAssigning(false) }
  }

  const handleUnassignStaff = async (companyId: string, userId: string) => {
    await fetch(`/api/companies/${companyId}/staff?userId=${userId}`, { method: 'DELETE' })
    await loadCompanies()
  }

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="flex items-center gap-3">
        <div className="flex-1 flex items-center gap-2 px-4 py-2.5 bg-white rounded-2xl border border-[#E5E7E5] shadow-sm">
          <div className="flex items-center gap-2 px-3 py-1 rounded-lg text-xs font-semibold bg-[#E8F5E8] text-[#0B3D2E]">
            <Building2 className="w-3 h-3" />Organization
          </div>
          <Clock className="w-3.5 h-3.5 text-[#6B7280]" />
          <span className="text-xs text-[#6B7280]">{members.length} members &middot; {companies.length} companies</span>
        </div>
        <div className="relative" ref={profileRef}>
          <button onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2 p-1.5 bg-white rounded-2xl border border-[#E5E7E5] shadow-sm hover:border-[#1FAA6F] transition-all">
            <div className="w-8 h-8 bg-gradient-to-br from-[#0B3D2E] to-[#1FAA6F] rounded-full flex items-center justify-center text-white text-xs font-semibold shadow-sm">{uInitials}</div>
            <div className="hidden sm:block text-left mr-1"><p className="text-sm font-medium text-[#1A1D1B] leading-tight">{userName}</p><p className="text-[10px] text-[#6B7280] font-medium">{roleLabel}</p></div>
            <ChevronDown className={cn('w-4 h-4 text-[#6B7280] transition-transform shrink-0', profileOpen && 'rotate-180')} />
          </button>
          {profileOpen && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl border border-[#E5E7E5] shadow-lg py-2 z-50">
              <div className="px-4 py-3 border-b border-[#E5E7E5]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#0B3D2E] to-[#1FAA6F] rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0">{uInitials}</div>
                  <div><p className="text-sm font-semibold text-[#1A1D1B]">{userName}</p><p className="text-xs text-[#6B7280]">{userEmail}</p></div>
                </div>
              </div>
              <div className="px-4 py-2 border-b border-[#E5E7E5]"><div className="flex items-center gap-2 text-xs text-[#6B7280]"><Shield className="w-3.5 h-3.5" /><span>{roleLabel}</span></div></div>
              <Link2 href="/settings" className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#6B7280] hover:bg-[#F7F9F8] transition-colors"><Settings className="w-4 h-4" />Settings</Link2>
              <button onClick={() => signOut({ redirect: false }).then(() => window.location.href = '/auth/signin')}
                className="flex items-center gap-3 w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"><LogOut className="w-4 h-4" />Sign out</button>
            </div>
          )}
        </div>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[26px] font-bold text-[#1A1D1B] tracking-tight">Organization</h1>
          <p className="text-sm text-[#6B7280] mt-0.5">Manage your team, companies, and firm settings.</p>
        </div>
      </div>

      {/* Success */}
      {successMsg && (
        <div className="flex items-center gap-2 px-4 py-3 bg-[#E8F5E8] rounded-2xl border border-[#1FAA6F]/20 text-sm text-[#0B3D2E] font-medium">
          <Check className="w-4 h-4 text-[#1FAA6F]" />{successMsg}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-[#F7F9F8] p-1 rounded-xl border border-[#E5E7E5] overflow-x-auto">
        {TABS.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={cn('px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all', activeTab === tab ? 'bg-white text-[#1A1D1B] shadow-sm' : 'text-[#6B7280] hover:text-[#1A1D1B]')}>{tab}</button>
        ))}
      </div>

      {/* ===== USER MANAGEMENT TAB ===== */}
      {activeTab === 'User Management' && (
        <>
          <div className="flex items-center justify-between">
            <p className="text-sm text-[#6B7280]">{members.length} team member{members.length !== 1 ? 's' : ''}</p>
            {isAdmin && (
              <button onClick={() => setShowInviteModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#0B3D2E] text-white text-sm font-semibold rounded-full hover:bg-[#1FAA6F] transition-all shadow-sm">
                <UserPlus className="w-4 h-4" />Invite User
              </button>
            )}
          </div>
          <div className="bg-white rounded-2xl border border-[#E5E7E5] shadow-sm overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-[#E5E7E5]">
              <Search className="w-4 h-4 text-[#9CA3AF] shrink-0" />
              <input type="text" placeholder="Search team members..." value={search} onChange={e => setSearch(e.target.value)}
                className="flex-1 bg-transparent border-none outline-none text-sm text-[#1A1D1B] placeholder-[#9CA3AF]" />
            </div>
            {loading ? (
              <div className="px-6 py-12 text-center text-sm text-[#6B7280]"><Loader2 className="w-5 h-5 animate-spin inline-block mr-2" />Loading...</div>
            ) : filtered.length === 0 ? (
              <div className="px-6 py-12 text-center text-sm text-[#6B7280]">No team members found.</div>
            ) : (
              <div className="divide-y divide-[#E5E7E5]">
                {filtered.map(m => (
                  <div key={m.id} className="flex items-center gap-4 px-5 py-4 hover:bg-[#F7F9F8] transition-colors">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0B3D2E] to-[#1FAA6F] flex items-center justify-center text-white text-sm font-semibold shrink-0 shadow-sm">{m.initials}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[#1A1D1B]">{m.name}</p>
                      <p className="text-xs text-[#6B7280]">{m.email}</p>
                    </div>
                    <span className={cn('text-xs font-medium px-2.5 py-0.5 rounded-full',
                      m.rawRole === 'company_agent' ? 'bg-amber-50 text-amber-700' : m.rawRole === 'admin' || m.rawRole === 'firm_admin' ? 'bg-purple-50 text-purple-700' : 'bg-[#F7F9F8] text-[#6B7280]')}>{m.role}</span>
                    {m.companies && m.companies.length > 0 && (
                      <div className="hidden sm:flex flex-wrap gap-1 max-w-[200px]">
                        {m.companies.map(c => <span key={c} className="text-xs bg-[#E8F5E8] text-[#0B3D2E] px-2 py-0.5 rounded-full">{c}</span>)}
                      </div>
                    )}
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#1FAA6F] bg-[#E8F5E8] px-2.5 py-0.5 rounded-full">
                      <span className="w-1.5 h-1.5 bg-[#1FAA6F] rounded-full" />{m.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* ===== COMPANIES TAB ===== */}
      {activeTab === 'Companies' && (
        <>
          <div className="flex items-center justify-between">
            <p className="text-sm text-[#6B7280]">{companies.length} compan{companies.length === 1 ? 'y' : 'ies'} &middot; Assign staff to scope their access</p>
            {canManageCompanies(myRole) && (
              <button onClick={() => setShowCompanyModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#0B3D2E] text-white text-sm font-semibold rounded-full hover:bg-[#1FAA6F] transition-all shadow-sm">
                <Plus className="w-4 h-4" />Add Company
              </button>
            )}
          </div>
          <div className="bg-white rounded-2xl border border-[#E5E7E5] shadow-sm overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-[#E5E7E5]">
              <Search className="w-4 h-4 text-[#9CA3AF] shrink-0" />
              <input type="text" placeholder="Search companies..." value={companySearch} onChange={e => setCompanySearch(e.target.value)}
                className="flex-1 bg-transparent border-none outline-none text-sm text-[#1A1D1B] placeholder-[#9CA3AF]" />
            </div>
            {companiesLoading ? (
              <div className="px-6 py-12 text-center text-sm text-[#6B7280]"><Loader2 className="w-5 h-5 animate-spin inline-block mr-2" />Loading...</div>
            ) : filteredCompanies.length === 0 ? (
              <div className="px-6 py-12 text-center text-sm text-[#6B7280]">
                {companySearch ? 'No companies match your search' : 'No companies yet. Click "Add Company" to create one.'}
              </div>
            ) : (
              <div className="divide-y divide-[#E5E7E5]">
                {filteredCompanies.map(c => (
                  <div key={c.id} className="p-5">
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div className="flex items-start gap-3">
                        <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                          <Building2 className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-[#1A1D1B]">{c.name}</p>
                          <p className="text-xs text-[#6B7280]">{c.industry || 'Industry not set'}</p>
                          {(c.contactName || c.contactEmail) && (
                            <div className="flex items-center gap-2 mt-1">
                              {c.contactName && <span className="text-xs text-[#6B7280]">{c.contactName}</span>}
                              {c.contactEmail && <span className="text-xs text-[#6B7280]">{c.contactEmail}</span>}
                            </div>
                          )}
                        </div>
                      </div>
                      {canManageStaff(myRole) && (
                        <button onClick={() => setAssigningCompanyId(assigningCompanyId === c.id ? null : c.id)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-[#E5E7E5] text-xs font-medium text-[#6B7280] rounded-full hover:border-[#1FAA6F] hover:text-[#1FAA6F] transition-all">
                          <UserPlus className="w-3.5 h-3.5" />Assign Staff
                        </button>
                      )}
                    </div>
                    {/* Staff chips */}
                    <div className="mt-3 flex flex-wrap items-center gap-1.5">
                      {c.staff.length === 0 ? (
                        <span className="text-xs text-[#9CA3AF]">No staff assigned yet.</span>
                      ) : c.staff.map(s => (
                        <span key={s.id} className="inline-flex items-center gap-1 text-xs bg-[#F7F9F8] text-[#6B7280] px-2.5 py-1 rounded-full">
                          {s.name}
                          {canManageStaff(myRole) && (
                            <button onClick={() => handleUnassignStaff(c.id, s.id)} className="text-[#9CA3AF] hover:text-red-500 ml-0.5"><X className="w-3 h-3" /></button>
                          )}
                        </span>
                      ))}
                    </div>
                    {/* Assign panel */}
                    {assigningCompanyId === c.id && (
                      <div className="mt-3 flex items-center gap-2 bg-[#F7F9F8] p-3 rounded-xl">
                        <select className="flex-1 px-3 py-2 bg-white border border-[#E5E7E5] rounded-lg text-sm text-[#1A1D1B] focus:outline-none focus:ring-2 focus:ring-[#1FAA6F]/20 focus:border-[#1FAA6F]"
                          value={assignUserId} onChange={e => setAssignUserId(e.target.value)}>
                          <option value="">Select staff member...</option>
                          {assignableStaff.filter(m => !c.staff.some(s => s.id === m.id)).map(m => (
                            <option key={m.id} value={m.id}>{m.name} ({m.role})</option>
                          ))}
                        </select>
                        <button onClick={() => handleAssignStaff(c.id)} disabled={!assignUserId || assigning}
                          className="px-4 py-2 bg-[#0B3D2E] text-white text-xs font-semibold rounded-lg hover:bg-[#1FAA6F] disabled:opacity-40 transition-all">
                          {assigning ? 'Assigning...' : 'Assign'}
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

      {/* ===== PLACEHOLDER TABS ===== */}
      {activeTab !== 'User Management' && activeTab !== 'Companies' && (
        <div className="bg-white rounded-2xl border border-[#E5E7E5] p-12 text-center shadow-sm">
          <Settings className="w-10 h-10 text-[#D1D5DB] mx-auto mb-3" />
          <p className="text-sm text-[#6B7280]">{activeTab} settings will be available here.</p>
        </div>
      )}

      {/* INVITE MODAL */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={e => { if (e.target === e.currentTarget) { setShowInviteModal(false); setFormError('') } }}>
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-[#1A1D1B]">Invite Team Member</h2>
              <button onClick={() => { setShowInviteModal(false); setFormError('') }} className="w-8 h-8 rounded-full bg-[#F7F9F8] flex items-center justify-center text-[#6B7280] hover:bg-[#E5E7E5] transition-all"><X className="w-4 h-4" /></button>
            </div>
            {formError && <div className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-xl">{formError}</div>}
            <InputField label="Full Name" value={inviteForm.name} onChange={v => setInviteForm(f => ({ ...f, name: v }))} placeholder="Jane Smith" />
            <InputField label="Email Address" type="email" value={inviteForm.email} onChange={v => setInviteForm(f => ({ ...f, email: v }))} placeholder="jane@firm.com" />
            <div>
              <label className="block text-xs font-medium text-[#6B7280] mb-1.5 uppercase tracking-wider">Role</label>
              <select value={inviteForm.role} onChange={e => setInviteForm(f => ({ ...f, role: e.target.value, companyIds: [] }))}
                className="w-full px-3 py-2.5 bg-[#F7F9F8] border border-[#E5E7E5] rounded-xl text-sm text-[#1A1D1B] focus:outline-none focus:ring-2 focus:ring-[#1FAA6F]/20 focus:border-[#1FAA6F]">
                <option value="preparer">Preparer</option>
                <option value="reviewer">Reviewer</option>
                <option value="firm_admin">Firm Admin</option>
                <option value="advisor">Advisor</option>
                <option value="company_agent">Company Agent (scoped)</option>
              </select>
            </div>
            {inviteForm.role === 'company_agent' && (
              <div>
                <label className="block text-xs font-medium text-[#6B7280] mb-1.5 uppercase tracking-wider">Assigned Companies</label>
                <div className="border border-[#E5E7E5] rounded-xl max-h-40 overflow-y-auto divide-y divide-[#E5E7E5]">
                  {companies.length === 0 ? (
                    <p className="text-xs text-[#9CA3AF] px-3 py-3">No companies yet. Add one from the Companies tab first.</p>
                  ) : companies.map(c => (
                    <label key={c.id} className="flex items-center gap-2 px-3 py-2 text-sm text-[#6B7280] cursor-pointer hover:bg-[#F7F9F8]">
                      <input type="checkbox" checked={inviteForm.companyIds.includes(c.id)}
                        onChange={e => setInviteForm(f => ({ ...f, companyIds: e.target.checked ? [...f.companyIds, c.id] : f.companyIds.filter(id => id !== c.id) }))}
                        className="rounded border-[#E5E7E5] text-[#1FAA6F] focus:ring-[#1FAA6F] accent-[#1FAA6F]" />
                      {c.name}
                    </label>
                  ))}
                </div>
              </div>
            )}
            <p className="text-xs text-[#6B7280]">Initial password: <code className="text-[#0B3D2E] bg-[#E8F5E8] px-1.5 py-0.5 rounded">welcome123</code></p>
            <div className="flex gap-3 pt-2">
              <button onClick={() => { setShowInviteModal(false); setFormError('') }} className="flex-1 px-4 py-2.5 border border-[#E5E7E5] text-[#6B7280] text-sm font-medium rounded-full hover:border-[#1FAA6F] transition-all">Cancel</button>
              <button onClick={handleInviteUser} disabled={saving}
                className="flex-1 px-4 py-2.5 bg-[#0B3D2E] text-white text-sm font-semibold rounded-full hover:bg-[#1FAA6F] disabled:opacity-50 transition-all shadow-sm">
                {saving ? <span className="inline-flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" />Sending...</span> : 'Send Invite'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD COMPANY MODAL */}
      {showCompanyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={e => { if (e.target === e.currentTarget) { setShowCompanyModal(false); setCompanyFormError('') } }}>
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-[#1A1D1B]">Add Company</h2>
              <button onClick={() => { setShowCompanyModal(false); setCompanyFormError('') }} className="w-8 h-8 rounded-full bg-[#F7F9F8] flex items-center justify-center text-[#6B7280] hover:bg-[#E5E7E5] transition-all"><X className="w-4 h-4" /></button>
            </div>
            {companyFormError && <div className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-xl">{companyFormError}</div>}
            <InputField label="Company Name" required value={companyForm.name} onChange={v => setCompanyForm(f => ({ ...f, name: v }))} placeholder="Acme Corp" />
            <div className="grid grid-cols-2 gap-3">
              <InputField label="Industry" value={companyForm.industry} onChange={v => setCompanyForm(f => ({ ...f, industry: v }))} placeholder="Manufacturing" />
              <InputField label="Contact Phone" value={companyForm.contactPhone} onChange={v => setCompanyForm(f => ({ ...f, contactPhone: v }))} placeholder="(555) 010-1000" />
            </div>
            <InputField label="Contact Email" type="email" value={companyForm.contactEmail} onChange={v => setCompanyForm(f => ({ ...f, contactEmail: v }))} placeholder="billing@acme.com" />
            <InputField label="Contact Name" value={companyForm.contactName} onChange={v => setCompanyForm(f => ({ ...f, contactName: v }))} placeholder="Wendell Acme" />
            <div>
              <label className="block text-xs font-medium text-[#6B7280] mb-1.5 uppercase tracking-wider">Notes</label>
              <textarea value={companyForm.notes} onChange={e => setCompanyForm(f => ({ ...f, notes: e.target.value }))} placeholder="Optional notes about this company" rows={3}
                className="w-full px-3 py-2.5 bg-[#F7F9F8] border border-[#E5E7E5] rounded-xl text-sm text-[#1A1D1B] placeholder-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#1FAA6F]/20 focus:border-[#1FAA6F] transition-all resize-none" />
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={() => { setShowCompanyModal(false); setCompanyFormError('') }} className="flex-1 px-4 py-2.5 border border-[#E5E7E5] text-[#6B7280] text-sm font-medium rounded-full hover:border-[#1FAA6F] transition-all">Cancel</button>
              <button onClick={handleAddCompany} disabled={companySaving}
                className="flex-1 px-4 py-2.5 bg-[#0B3D2E] text-white text-sm font-semibold rounded-full hover:bg-[#1FAA6F] disabled:opacity-50 transition-all shadow-sm">
                {companySaving ? <span className="inline-flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" />Adding...</span> : 'Add Company'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function InputField({ label, required, value, onChange, placeholder, type = 'text' }: {
  label: string; required?: boolean; value: string; onChange: (v: string) => void; placeholder?: string; type?: string
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-[#6B7280] mb-1.5 uppercase tracking-wider">{label}{required && <span className="text-red-400 ml-0.5">*</span>}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        className="w-full px-3 py-2.5 bg-[#F7F9F8] border border-[#E5E7E5] rounded-xl text-sm text-[#1A1D1B] placeholder-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#1FAA6F]/20 focus:border-[#1FAA6F] transition-all" />
    </div>
  )
}
