'use client'

import { useState, FormEvent, Suspense } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff, ArrowLeft, CheckCircle2 } from 'lucide-react'

function SignInForm() {
  const searchParams = useSearchParams()
  const [email, setEmail] = useState(() => searchParams.get('email') ?? '')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const justRegistered = searchParams.get('registered') === '1'

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        // authorize() throws specific messages for rate-limiting and for
        // backend/service problems (e.g. database unreachable); anything
        // else (wrong email/password, inactive account, etc.) stays generic
        // so we never confirm whether an email exists in the system.
        const lower = result.error.toLowerCase()
        setError(
          lower.includes('too many') || lower.includes('unavailable') || lower.includes('timed out')
            ? result.error
            : 'Invalid email or password'
        )
        setLoading(false)
        return
      }

      router.push('/dashboard')
    } catch {
      // signIn() rejecting (network down, server unreachable, etc.) used to
      // be unhandled here and would surface as an uncaught console error
      // with no feedback for the user.
      setError('Unable to reach the server. Check your connection and try again.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-10 h-10 bg-juno-dark-green rounded-xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-lg">J</span>
          </div>
          <h1 className="text-xl font-bold text-dark-900">Sign in to Juno</h1>
          <p className="text-sm text-dark-500 mt-1">Enter your credentials to access your account</p>
        </div>

        {justRegistered && !error && (
          <div className="mb-4 flex items-start gap-2 text-sm text-juno-dark-green bg-juno-light-green px-3 py-2.5 rounded-lg">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
            <span>Account created. Sign in below to get started.</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="card p-6 space-y-4">
          {error && (
            <div role="alert" className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</div>
          )}

          <div>
            <label className="label" htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              className="input"
              placeholder="you@firm.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              autoFocus
              required
            />
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label className="label" htmlFor="password">Password</label>
              <Link href="/auth/forgot-password" className="text-xs font-medium text-juno-dark-green hover:underline">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                className="input pr-10"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400 hover:text-dark-700 transition-colors"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button type="submit" className="btn btn-primary w-full" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-sm text-dark-500 mt-6">
          Don&apos;t have an account?{' '}
          <Link href="/auth/signup" className="text-juno-dark-green hover:underline font-medium">Create one</Link>
        </p>

        <p className="text-center mt-8">
          <Link href="/" className="inline-flex items-center gap-1 text-xs text-dark-400 hover:text-dark-600 transition-colors">
            <ArrowLeft className="w-3 h-3" /> Back to marketing site
          </Link>
        </p>
      </div>
    </div>
  )
}

// useSearchParams() requires a Suspense boundary in the app router.
export default function SignInPage() {
  return (
    <Suspense fallback={null}>
      <SignInForm />
    </Suspense>
  )
}
