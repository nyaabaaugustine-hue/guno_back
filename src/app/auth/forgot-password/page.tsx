'use client'

import Link from 'next/link'
import { ArrowLeft, Mail } from 'lucide-react'

// NOTE: There is no self-service password reset flow yet (no reset-token
// table, no transactional email sending). Rather than link to a 404 from
// the sign-in page, this explains the current process honestly. When a
// real reset flow ships (token + email), replace this with the actual form.
export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-10 h-10 bg-juno-dark-green rounded-xl flex items-center justify-center mx-auto mb-4">
            <Mail className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-xl font-bold text-dark-900">Reset your password</h1>
        </div>

        <div className="card p-6 space-y-4 text-sm text-dark-600 leading-relaxed">
          <p>
            Self-service password reset isn&apos;t available yet. If you already
            know your current password, you can change it from{' '}
            <Link href="/settings" className="text-juno-dark-green hover:underline font-medium">
              Settings
            </Link>{' '}
            once signed in.
          </p>
          <p>
            If you&apos;re locked out, ask your firm administrator to invite you
            again with a new temporary password, or contact support.
          </p>
        </div>

        <p className="text-center mt-8">
          <Link href="/auth/signin" className="inline-flex items-center gap-1 text-xs text-dark-400 hover:text-dark-600 transition-colors">
            <ArrowLeft className="w-3 h-3" /> Back to sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
