'use client'

import { useState } from 'react'
import { Clock, Camera, Loader2, CheckCircle2 } from 'lucide-react'

type SettingsTab = 'account' | 'password'

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('account')
  const [, setAvatarFile] = useState<File | null>(null)

  // Profile form
  const [firstName, setFirstName] = useState('Augustine')
  const [lastName, setLastName] = useState('Nyaaba')
  const [email, setEmail] = useState('nyaabaaugustine@gmail.com')
  const [savingProfile, setSavingProfile] = useState(false)
  const [profileSuccess, setProfileSuccess] = useState(false)
  const [profileError, setProfileError] = useState('')

  // Password form
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [savingPassword, setSavingPassword] = useState(false)
  const [passwordSuccess, setPasswordSuccess] = useState(false)
  const [passwordError, setPasswordError] = useState('')

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
    <div>
      {/* Trial Status Bar */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-juno-light-green text-juno-dark-green px-3 py-1.5 rounded-lg text-sm font-medium">
            <span className="w-2 h-2 bg-juno-dark-green rounded-full" />
            Settings
          </div>
          <div className="flex items-center gap-1.5 text-sm text-dark-500">
            <Clock className="w-4 h-4" />
            <span>0/5 Free Preparations started.</span>
          </div>
          <div className="text-sm text-dark-500">4d 12h Left in Your Trial</div>
        </div>
        <div className="w-8 h-8 bg-juno-dark-green rounded-full flex items-center justify-center text-white text-xs font-semibold">
          AN
        </div>
      </div>

      <h1 className="text-2xl font-display font-bold text-dark-900 mb-6">Settings</h1>

      {/* Sub tabs */}
      <div className="flex gap-1 mb-8 bg-dark-50 p-1 rounded-lg w-fit">
        <button onClick={() => setActiveTab('account')} className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'account' ? 'bg-white text-dark-900 shadow-sm' : 'text-dark-500 hover:text-dark-700'}`}>Account Information</button>
        <button onClick={() => setActiveTab('password')} className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'password' ? 'bg-white text-dark-900 shadow-sm' : 'text-dark-500 hover:text-dark-700'}`}>Reset password</button>
      </div>

      {activeTab === 'account' && (
        <div className="max-w-2xl">
          <div className="card p-6">
            <h2 className="text-base font-semibold text-dark-900 mb-6">User Details</h2>

            {profileSuccess && (
              <div className="mb-4 flex items-center gap-2 text-sm text-juno-dark-green bg-juno-light-green px-4 py-2.5 rounded-lg">
                <CheckCircle2 className="w-4 h-4" />
                Profile updated successfully
              </div>
            )}
            {profileError && (
              <div className="mb-4 text-sm text-red-600 bg-red-50 px-4 py-2.5 rounded-lg">{profileError}</div>
            )}

            {/* Avatar upload */}
            <div className="flex items-center gap-4 mb-8">
              <div className="relative">
                <div className="w-16 h-16 rounded-full bg-juno-dark-green flex items-center justify-center text-white text-xl font-bold">
                  {firstName?.[0]}{lastName?.[0]}
                </div>
                <label className="absolute -bottom-1 -right-1 w-6 h-6 bg-white rounded-full border border-dark-200 flex items-center justify-center cursor-pointer shadow-sm hover:bg-dark-50 transition-colors">
                  <Camera className="w-3.5 h-3.5 text-dark-500" />
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => setAvatarFile(e.target.files?.[0] || null)} />
                </label>
              </div>
              <p className="text-xs text-dark-400">Click the camera icon to upload a photo</p>
            </div>

            {/* Form fields */}
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">First Name</label>
                  <input type="text" className="input" value={firstName} onChange={(e) => setFirstName(e.target.value)} id="firstName" />
                </div>
                <div>
                  <label className="label">Last Name</label>
                  <input type="text" className="input" value={lastName} onChange={(e) => setLastName(e.target.value)} id="lastName" />
                </div>
              </div>
              <div>
                <label className="label">Email</label>
                <input type="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} id="email" />
              </div>
              <div className="pt-2">
                <button onClick={handleSaveProfile} disabled={savingProfile} className="btn btn-primary">
                  {savingProfile ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'password' && (
        <div className="max-w-2xl">
          <div className="card p-6">
            <h2 className="text-base font-semibold text-dark-900 mb-6">Reset Password</h2>

            {passwordSuccess && (
              <div className="mb-4 flex items-center gap-2 text-sm text-juno-dark-green bg-juno-light-green px-4 py-2.5 rounded-lg">
                <CheckCircle2 className="w-4 h-4" />
                Password updated successfully
              </div>
            )}
            {passwordError && (
              <div className="mb-4 text-sm text-red-600 bg-red-50 px-4 py-2.5 rounded-lg">{passwordError}</div>
            )}

            <div className="space-y-5">
              <div>
                <label className="label">Current Password</label>
                <input type="password" className="input" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="Enter current password" id="currentPassword" />
              </div>
              <div>
                <label className="label">New Password</label>
                <input type="password" className="input" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Enter new password" id="newPassword" />
              </div>
              <div>
                <label className="label">Confirm New Password</label>
                <input type="password" className="input" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm new password" id="confirmPassword" />
              </div>
              <div className="pt-2">
                <button onClick={handleUpdatePassword} disabled={savingPassword} className="btn btn-primary">
                  {savingPassword ? <><Loader2 className="w-4 h-4 animate-spin" /> Updating...</> : 'Update Password'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
