'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Camera, Check, RefreshCw, User, Lock, Save, Eye, EyeOff } from 'lucide-react'
import { cn } from '@/lib/utils'

type SettingsTab = 'account' | 'password'

export default function SettingsPage() {
  const { data: session, update } = useSession()
  const [activeTab, setActiveTab] = useState<SettingsTab>('account')
  const [avatarFile, setAvatarFile] = useState<File | null>(null)

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [savingProfile, setSavingProfile] = useState(false)
  const [profileSuccess, setProfileSuccess] = useState(false)
  const [profileError, setProfileError] = useState('')

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)
  const [passwordSuccess, setPasswordSuccess] = useState(false)
  const [passwordError, setPasswordError] = useState('')

  useEffect(() => {
    if (session?.user) {
      const name = session.user.name || ''
      const parts = name.split(' ')
      setFirstName(parts[0] || '')
      setLastName(parts.slice(1).join(' ') || '')
      setEmail(session.user.email || '')
    }
  }, [session])

  const initials = firstName?.[0] && lastName?.[0]
    ? (firstName[0] + lastName[0]).toUpperCase()
    : (session?.user?.name || 'U').slice(0, 2).toUpperCase()

  const handleSaveProfile = async () => {
    setProfileError('')
    setProfileSuccess(false)
    setSavingProfile(true)
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName, lastName, email }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Failed to save')
      }
      setProfileSuccess(true)
      setTimeout(() => setProfileSuccess(false), 3000)
    } catch (err: any) {
      setProfileError(err.message)
    } finally {
      setSavingProfile(false)
    }
  }

  const handleUpdatePassword = async () => {
    setPasswordError('')
    setPasswordSuccess(false)
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match')
      return
    }
    if (newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters')
      return
    }
    setSavingPassword(true)
    try {
      const res = await fetch('/api/auth/password', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Failed to update password')
      }
      setPasswordSuccess(true)
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setTimeout(() => setPasswordSuccess(false), 3000)
    } catch (err: any) {
      setPasswordError(err.message)
    } finally {
      setSavingPassword(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-[28px] font-bold text-[#1A1D1B] tracking-tight">Settings</h1>
        <p className="text-sm text-[#6B7280] mt-1">Manage your account and security preferences</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-[#F3F4F6] p-1 rounded-xl w-fit">
        <button
          onClick={() => setActiveTab('account')}
          className={cn(
            'flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
            activeTab === 'account' ? 'bg-white text-[#1A1D1B] shadow-sm' : 'text-[#6B7280] hover:text-[#1A1D1B]'
          )}
        >
          <User className="w-4 h-4" />
          Account Information
        </button>
        <button
          onClick={() => setActiveTab('password')}
          className={cn(
            'flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
            activeTab === 'password' ? 'bg-white text-[#1A1D1B] shadow-sm' : 'text-[#6B7280] hover:text-[#1A1D1B]'
          )}
        >
          <Lock className="w-4 h-4" />
          Reset Password
        </button>
      </div>

      {activeTab === 'account' && (
        <div className="bg-white rounded-2xl border border-[#E5E7E5] p-8 shadow-[0_2px_8px_rgba(0,0,0,.05)]">
          <h2 className="text-lg font-semibold text-[#1A1D1B] mb-8">User Details</h2>

          {profileSuccess && (
            <div className="mb-6 flex items-center gap-2.5 text-sm text-[#0B3D2E] bg-[#E8F5E8] px-4 py-3 rounded-xl">
              <Check className="w-4 h-4 shrink-0" />
              Profile updated successfully
            </div>
          )}
          {profileError && (
            <div className="mb-6 text-sm text-red-600 bg-red-50 px-4 py-3 rounded-xl">{profileError}</div>
          )}

          {/* Avatar */}
          <div className="flex items-center gap-5 mb-10">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#0B3D2E] to-[#1FAA6F] flex items-center justify-center text-white text-2xl font-bold shadow-md">
                {initials}
              </div>
              <label className="absolute -bottom-1 -right-1 w-7 h-7 bg-white rounded-full border-2 border-[#E5E7E5] flex items-center justify-center cursor-pointer shadow-sm hover:bg-[#F7F9F8] transition-colors">
                <Camera className="w-3.5 h-3.5 text-[#6B7280]" />
                <input type="file" accept="image/*" className="hidden" onChange={(e) => setAvatarFile(e.target.files?.[0] || null)} />
              </label>
            </div>
            <div>
              <p className="text-sm font-medium text-[#1A1D1B]">{firstName} {lastName}</p>
              <p className="text-xs text-[#6B7280]">Click the camera icon to upload a photo</p>
            </div>
          </div>

          {/* Form */}
          <div className="space-y-5 max-w-xl">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-[#1A1D1B] mb-1.5">First Name</label>
                <input
                  id="firstName"
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white border border-[#E5E7E5] rounded-xl text-sm text-[#1A1D1B] placeholder-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#1FAA6F]/20 focus:border-[#1FAA6F] transition-all"
                />
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-[#1A1D1B] mb-1.5">Last Name</label>
                <input
                  id="lastName"
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white border border-[#E5E7E5] rounded-xl text-sm text-[#1A1D1B] placeholder-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#1FAA6F]/20 focus:border-[#1FAA6F] transition-all"
                />
              </div>
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[#1A1D1B] mb-1.5">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-[#E5E7E5] rounded-xl text-sm text-[#1A1D1B] placeholder-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#1FAA6F]/20 focus:border-[#1FAA6F] transition-all"
              />
            </div>
            <div className="pt-3">
              <button
                onClick={handleSaveProfile}
                disabled={savingProfile}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#0B3D2E] text-white text-sm font-semibold rounded-full hover:bg-[#1FAA6F] transition-all duration-200 shadow-sm disabled:opacity-50"
              >
                {savingProfile ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {savingProfile ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'password' && (
        <div className="bg-white rounded-2xl border border-[#E5E7E5] p-8 shadow-[0_2px_8px_rgba(0,0,0,.05)]">
          <h2 className="text-lg font-semibold text-[#1A1D1B] mb-8">Reset Password</h2>

          {passwordSuccess && (
            <div className="mb-6 flex items-center gap-2.5 text-sm text-[#0B3D2E] bg-[#E8F5E8] px-4 py-3 rounded-xl">
              <Check className="w-4 h-4 shrink-0" />
              Password updated successfully
            </div>
          )}
          {passwordError && (
            <div className="mb-6 text-sm text-red-600 bg-red-50 px-4 py-3 rounded-xl">{passwordError}</div>
          )}

          <div className="space-y-5 max-w-md">
            <div>
              <label htmlFor="currentPassword" className="block text-sm font-medium text-[#1A1D1B] mb-1.5">Current Password</label>
              <input
                id="currentPassword"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
                className="w-full px-4 py-2.5 bg-white border border-[#E5E7E5] rounded-xl text-sm text-[#1A1D1B] placeholder-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#1FAA6F]/20 focus:border-[#1FAA6F] transition-all"
              />
            </div>

            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-[#1A1D1B] mb-1.5">New Password</label>
              <div className="relative">
                <input
                  id="newPassword"
                  type={showNew ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  className="w-full px-4 py-2.5 pr-10 bg-white border border-[#E5E7E5] rounded-xl text-sm text-[#1A1D1B] placeholder-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#1FAA6F]/20 focus:border-[#1FAA6F] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-[#1A1D1B]"
                >
                  {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-[#1A1D1B] mb-1.5">Confirm New Password</label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirm ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  className="w-full px-4 py-2.5 pr-10 bg-white border border-[#E5E7E5] rounded-xl text-sm text-[#1A1D1B] placeholder-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#1FAA6F]/20 focus:border-[#1FAA6F] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-[#1A1D1B]"
                >
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="pt-3">
              <button
                onClick={handleUpdatePassword}
                disabled={savingPassword}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#0B3D2E] text-white text-sm font-semibold rounded-full hover:bg-[#1FAA6F] transition-all duration-200 shadow-sm disabled:opacity-50"
              >
                {savingPassword ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {savingPassword ? 'Updating...' : 'Update Password'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
