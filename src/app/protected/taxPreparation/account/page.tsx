'use client'

import { useState, useEffect, useRef } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { cn } from '@/lib/utils'
import {
  User, Lock, Save, Eye, EyeOff, Check, Loader2, Camera,
  ChevronDown, LogOut, Settings as SettingsIcon, Shield, Clock,
  Mail, RefreshCw, AlertCircle
} from 'lucide-react'

type Tab = 'account' | 'password'

export default function AccountPage() {
  const { data: session, update } = useSession()
  const [activeTab, setActiveTab] = useState<Tab>('account')
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
  const userRole = user?.role || 'preparer'
  const roleLabel = userRole === 'firm_admin' ? 'Org Admin' : userRole === 'admin' ? 'Admin' : userRole.charAt(0).toUpperCase() + userRole.slice(1)
  const uInitials = userName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)

  // Profile form
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [savingProfile, setSavingProfile] = useState(false)
  const [profileSuccess, setProfileSuccess] = useState(false)
  const [profileError, setProfileError] = useState('')

  useEffect(() => {
    if (user) {
      const parts = (user.name || '').split(' ')
      setFirstName(parts[0] || '')
      setLastName(parts.slice(1).join(' ') || '')
      setEmail(user.email || '')
    }
  }, [user])

  // Password form
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)
  const [passwordSuccess, setPasswordSuccess] = useState(false)
  const [passwordError, setPasswordError] = useState('')

  const handleSaveProfile = async () => {
    setProfileError(''); setProfileSuccess(false); setSavingProfile(true)
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName, lastName, email }),
      })
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || 'Failed') }
      await update({ name: `${firstName} ${lastName}`, email })
      setProfileSuccess(true); setTimeout(() => setProfileSuccess(false), 3000)
    } catch (e: any) { setProfileError(e.message) } finally { setSavingProfile(false) }
  }

  const handleChangePassword = async () => {
    setPasswordError(''); setPasswordSuccess(false)
    if (newPassword !== confirmPassword) { setPasswordError('Passwords do not match'); return }
    if (newPassword.length < 8) { setPasswordError('Password must be at least 8 characters'); return }
    setSavingPassword(true)
    try {
      const res = await fetch('/api/auth/password', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      })
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || 'Failed') }
      setPasswordSuccess(true); setCurrentPassword(''); setNewPassword(''); setConfirmPassword('')
      setTimeout(() => setPasswordSuccess(false), 3000)
    } catch (e: any) { setPasswordError(e.message) } finally { setSavingPassword(false) }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Top Bar */}
      <div className="flex items-center gap-3">
        <div className="flex-1 flex items-center gap-2 px-4 py-2.5 bg-white rounded-2xl border border-[#E5E7E5] shadow-sm">
          <div className="flex items-center gap-2 px-3 py-1 rounded-lg text-xs font-semibold bg-[#E8F5E8] text-[#0B3D2E]">
            <SettingsIcon className="w-3 h-3" />Account
          </div>
          <Clock className="w-3.5 h-3.5 text-[#6B7280]" />
          <span className="text-xs text-[#6B7280]">Manage your profile and security</span>
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
              <button onClick={() => signOut({ redirect: false }).then(() => window.location.href = '/auth/signin')}
                className="flex items-center gap-3 w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"><LogOut className="w-4 h-4" />Sign out</button>
            </div>
          )}
        </div>
      </div>

      {/* Header */}
      <div>
        <h1 className="text-[26px] font-bold text-[#1A1D1B] tracking-tight">Account</h1>
        <p className="text-sm text-[#6B7280] mt-0.5">Manage your profile information and security settings.</p>
      </div>

      {/* Profile Avatar Card */}
      <div className="bg-white rounded-2xl border border-[#E5E7E5] shadow-sm p-6">
        <div className="flex items-center gap-5">
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#0B3D2E] to-[#1FAA6F] flex items-center justify-center text-white text-2xl font-bold shadow-md">{uInitials}</div>
            <button className="absolute -bottom-1 -right-1 w-8 h-8 bg-white rounded-full border border-[#E5E7E5] flex items-center justify-center text-[#6B7280] hover:text-[#1FAA6F] hover:border-[#1FAA6F] transition-all shadow-sm">
              <Camera className="w-4 h-4" />
            </button>
          </div>
          <div>
            <p className="text-lg font-bold text-[#1A1D1B]">{userName}</p>
            <p className="text-sm text-[#6B7280]">{userEmail}</p>
            <span className="inline-flex items-center gap-1 text-xs font-medium text-[#0B3D2E] bg-[#E8F5E8] px-2.5 py-0.5 rounded-full mt-1.5"><Shield className="w-3 h-3" />{roleLabel}</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-[#F7F9F8] p-1 rounded-xl border border-[#E5E7E5] w-fit">
        {(['account', 'password'] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={cn('px-5 py-2 rounded-lg text-sm font-medium capitalize transition-all', activeTab === tab ? 'bg-white text-[#1A1D1B] shadow-sm' : 'text-[#6B7280] hover:text-[#1A1D1B]')}>{tab}</button>
        ))}
      </div>

      {/* ===== ACCOUNT TAB ===== */}
      {activeTab === 'account' && (
        <div className="bg-white rounded-2xl border border-[#E5E7E5] shadow-sm p-6 space-y-5">
          <div className="flex items-center gap-2 pb-2 border-b border-[#E5E7E5]">
            <User className="w-4 h-4 text-[#1FAA6F]" />
            <h2 className="text-base font-semibold text-[#1A1D1B]">Personal Information</h2>
          </div>
          {profileSuccess && (
            <div className="flex items-center gap-2 px-4 py-3 bg-[#E8F5E8] rounded-xl text-sm text-[#0B3D2E] font-medium">
              <Check className="w-4 h-4 text-[#1FAA6F]" />Profile updated successfully
            </div>
          )}
          {profileError && (
            <div className="flex items-center gap-2 px-4 py-3 bg-red-50 rounded-xl text-sm text-red-600 font-medium">
              <AlertCircle className="w-4 h-4" />{profileError}
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <InputField label="First Name" value={firstName} onChange={setFirstName} placeholder="First name" />
            <InputField label="Last Name" value={lastName} onChange={setLastName} placeholder="Last name" />
          </div>
          <InputField label="Email Address" type="email" value={email} onChange={setEmail} placeholder="your@email.com" />
          <div className="pt-2">
            <button onClick={handleSaveProfile} disabled={savingProfile}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#0B3D2E] text-white text-sm font-semibold rounded-full hover:bg-[#1FAA6F] disabled:opacity-50 transition-all shadow-sm">
              {savingProfile ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {savingProfile ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      )}

      {/* ===== PASSWORD TAB ===== */}
      {activeTab === 'password' && (
        <div className="bg-white rounded-2xl border border-[#E5E7E5] shadow-sm p-6 space-y-5">
          <div className="flex items-center gap-2 pb-2 border-b border-[#E5E7E5]">
            <Lock className="w-4 h-4 text-[#1FAA6F]" />
            <h2 className="text-base font-semibold text-[#1A1D1B]">Change Password</h2>
          </div>
          {passwordSuccess && (
            <div className="flex items-center gap-2 px-4 py-3 bg-[#E8F5E8] rounded-xl text-sm text-[#0B3D2E] font-medium">
              <Check className="w-4 h-4 text-[#1FAA6F]" />Password changed successfully
            </div>
          )}
          {passwordError && (
            <div className="flex items-center gap-2 px-4 py-3 bg-red-50 rounded-xl text-sm text-red-600 font-medium">
              <AlertCircle className="w-4 h-4" />{passwordError}
            </div>
          )}
          <InputField label="Current Password" type="password" value={currentPassword} onChange={setCurrentPassword} placeholder="Enter current password" />
          <div className="relative">
            <label className="block text-xs font-medium text-[#6B7280] mb-1.5 uppercase tracking-wider">New Password</label>
            <div className="relative">
              <input type={showNew ? 'text' : 'password'} value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Enter new password"
                className="w-full px-3 py-2.5 bg-[#F7F9F8] border border-[#E5E7E5] rounded-xl text-sm text-[#1A1D1B] placeholder-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#1FAA6F]/20 focus:border-[#1FAA6F] transition-all pr-10" />
              <button onClick={() => setShowNew(!showNew)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#6B7280]">
                {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div className="relative">
            <label className="block text-xs font-medium text-[#6B7280] mb-1.5 uppercase tracking-wider">Confirm New Password</label>
            <div className="relative">
              <input type={showConfirm ? 'text' : 'password'} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Confirm new password"
                className="w-full px-3 py-2.5 bg-[#F7F9F8] border border-[#E5E7E5] rounded-xl text-sm text-[#1A1D1B] placeholder-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#1FAA6F]/20 focus:border-[#1FAA6F] transition-all pr-10" />
              <button onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#6B7280]">
                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div className="pt-2">
            <button onClick={handleChangePassword} disabled={savingPassword || !currentPassword || !newPassword || !confirmPassword}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#0B3D2E] text-white text-sm font-semibold rounded-full hover:bg-[#1FAA6F] disabled:opacity-50 transition-all shadow-sm">
              {savingPassword ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
              {savingPassword ? 'Updating...' : 'Update Password'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function InputField({ label, value, onChange, placeholder, type = 'text' }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-[#6B7280] mb-1.5 uppercase tracking-wider">{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        className="w-full px-3 py-2.5 bg-[#F7F9F8] border border-[#E5E7E5] rounded-xl text-sm text-[#1A1D1B] placeholder-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#1FAA6F]/20 focus:border-[#1FAA6F] transition-all" />
    </div>
  )
}
