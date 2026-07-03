'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { cn } from '@/lib/utils'
import { ArrowLeft, ChevronDown, ChevronRight, Mail, Lock, User, Building2, Phone, MapPin, Loader2, CheckCircle2 } from 'lucide-react'

function AddClientForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const formCode = searchParams.get('form') || '1040'
  const [showExtra, setShowExtra] = useState(false)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', ssnLast4: '',
    company: '', phone: '', address: '', city: '', state: '', zip: '',
  })

  const valid = form.firstName.trim() && form.lastName.trim() && form.email.trim() && form.ssnLast4.trim().length === 4

  const handleSubmit = async () => {
    if (!valid) return
    setLoading(true)
    try {
      const res = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: form.firstName, lastName: form.lastName,
          email: form.email, ssnLast4: form.ssnLast4,
          company: form.company || undefined, phone: form.phone || undefined,
          address: form.address || undefined, city: form.city || undefined,
          state: form.state || undefined, zip: form.zip || undefined,
        }),
      })
      if (res.ok) {
        const body = await res.json()
        setDone(true)
        setTimeout(() => {
          const id = body?.id || body?.client?.id || ''
          window.location.href = `/protected/taxPreparation/new-return/select-client?form=${formCode}&new=${id}`
        }, 1500)
      }
    } catch {}
    setLoading(false)
  }

  if (done) {
    return (
      <div className="max-w-lg mx-auto pt-20 text-center">
        <div className="w-16 h-16 bg-[#1FAA6F]/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-8 h-8 text-[#1FAA6F]" />
        </div>
        <h2 className="text-xl font-bold text-[#1A1D1B]">Client Added</h2>
        <p className="text-sm text-[#6B7280] mt-2">Redirecting to select client...</p>
      </div>
    )
  }

  return (
    <div className="max-w-xl mx-auto space-y-6">
      {/* Back + Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => router.back()} className="w-9 h-9 rounded-full bg-white border border-[#E5E7E5] flex items-center justify-center text-[#6B7280] hover:border-[#1FAA6F] hover:text-[#1FAA6F] transition-all">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <code className="text-xs font-mono font-semibold text-[#0B3D2E] bg-[#E8F5E8] px-2 py-0.5 rounded-lg">{formCode}</code>
            <span className="text-xs text-[#6B7280]">|</span>
            <span className="text-xs text-[#6B7280]">New Client</span>
          </div>
          <h1 className="text-[26px] font-bold text-[#1A1D1B] tracking-tight">Add Individual Client</h1>
          <p className="text-sm text-[#6B7280] mt-0.5">Enter the client&apos;s information to get started.</p>
        </div>
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-2xl border border-[#E5E7E5] shadow-sm p-6 space-y-5">
        {/* Row: First + Last Name */}
        <div className="grid grid-cols-2 gap-4">
          <Field label="First Name" required value={form.firstName} onChange={v => setForm(f => ({ ...f, firstName: v }))} placeholder="First Name" icon={User} />
          <Field label="Last Name" required value={form.lastName} onChange={v => setForm(f => ({ ...f, lastName: v }))} placeholder="Last Name" icon={User} />
        </div>

        {/* Email */}
        <Field label="Email" required type="email" value={form.email} onChange={v => setForm(f => ({ ...f, email: v }))} placeholder="Email" icon={Mail} />
        <p className="-mt-3 text-[11px] text-[#6B7280] flex items-center gap-1"><Lock className="w-3 h-3" /> Juno will never contact your client via email</p>

        {/* SSN Last 4 */}
        <div className="max-w-[200px]">
          <Field label="Last Four Digits of SSN" required value={form.ssnLast4} onChange={v => {
            const digits = v.replace(/\D/g, '').slice(0, 4)
            setForm(f => ({ ...f, ssnLast4: digits }))
          }} placeholder="xxxx" icon={Lock} maxLength={4} inputMode="numeric" />
        </div>

        {/* Additional Client Details */}
        <button onClick={() => setShowExtra(!showExtra)}
          className="flex items-center gap-2 text-sm font-semibold text-[#0B3D2E] pt-2 hover:text-[#1FAA6F] transition-colors">
          <ChevronDown className={cn('w-4 h-4 transition-transform', showExtra && 'rotate-180')} />
          Additional Client Details
        </button>

        {showExtra && (
          <div className="space-y-4 pt-1 border-t border-[#E5E7E5]">
            <Field label="Company" value={form.company} onChange={v => setForm(f => ({ ...f, company: v }))} placeholder="Company name" icon={Building2} />
            <Field label="Phone" value={form.phone} onChange={v => setForm(f => ({ ...f, phone: v }))} placeholder="Phone number" icon={Phone} />
            <Field label="Address" value={form.address} onChange={v => setForm(f => ({ ...f, address: v }))} placeholder="Street address" icon={MapPin} />
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-1">
                <label className="block text-xs font-medium text-[#6B7280] mb-1.5 uppercase tracking-wider">City</label>
                <input value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} placeholder="City"
                  className="w-full px-3 py-2.5 bg-[#F7F9F8] border border-[#E5E7E5] rounded-xl text-sm text-[#1A1D1B] placeholder-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#1FAA6F]/20 focus:border-[#1FAA6F] transition-all" />
              </div>
              <Field label="State" value={form.state} onChange={v => setForm(f => ({ ...f, state: v }))} placeholder="ST" maxLength={2} />
              <Field label="ZIP" value={form.zip} onChange={v => setForm(f => ({ ...f, zip: v }))} placeholder="ZIP" maxLength={10} />
            </div>
          </div>
        )}
      </div>

      {/* Submit */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-[#6B7280]">{valid ? 'Ready to add client' : 'Fill in required fields to continue'}</p>
        <button onClick={handleSubmit} disabled={!valid || loading}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#0B3D2E] text-white text-sm font-semibold rounded-full hover:bg-[#1FAA6F] disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm">
          {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : <>Add Client <ChevronRight className="w-4 h-4" /></>}
        </button>
      </div>
    </div>
  )
}

export default function AddClientPage() {
  return (
    <Suspense fallback={
      <div className="max-w-lg mx-auto pt-20 text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#6B7280]" />
      </div>
    }>
      <AddClientForm />
    </Suspense>
  )
}

function Field({ label, required, value, onChange, placeholder, icon: Icon, type = 'text', maxLength, inputMode }: {
  label: string; required?: boolean; value: string; onChange: (v: string) => void
  placeholder?: string; icon?: any; type?: string; maxLength?: number; inputMode?: string
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-[#6B7280] mb-1.5 uppercase tracking-wider">
        {label}{required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      <div className="relative">
        {Icon && <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />}
        <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
          maxLength={maxLength} inputMode={inputMode as any}
          className={cn(
            'w-full bg-[#F7F9F8] border border-[#E5E7E5] rounded-xl text-sm text-[#1A1D1B] placeholder-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#1FAA6F]/20 focus:border-[#1FAA6F] transition-all',
            Icon ? 'pl-9 pr-3 py-2.5' : 'px-3 py-2.5'
          )} />
      </div>
    </div>
  )
}
