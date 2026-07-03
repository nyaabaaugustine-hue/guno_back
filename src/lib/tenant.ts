import { NextResponse } from 'next/server'

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export function isUuid(value: unknown): value is string {
  return typeof value === 'string' && UUID_RE.test(value)
}

/**
 * Extracts a validated firmId from a NextAuth session for tenant-scoped
 * queries. Returns null if the session has no real firm association —
 * e.g. an account that hasn't finished firm setup, or a dev-only demo
 * login (whose fake "demo-firm-1" id is not a real firm and must never
 * be used to read/write real tenant data).
 */
export function getFirmId(session: unknown): string | null {
  const firmId = (session as { user?: { firmId?: string | null } } | null)?.user?.firmId
  return isUuid(firmId) ? firmId : null
}

/**
 * True only for the dev-only "demo-firm-1" login, and only outside
 * production. Used to gate sample/demo data so it can NEVER appear
 * for a real production tenant, even on an empty or errored query.
 */
export function isDemoSession(session: unknown): boolean {
  if (process.env.NODE_ENV === 'production') return false
  const firmId = (session as { user?: { firmId?: string | null } } | null)?.user?.firmId
  return firmId === 'demo-firm-1'
}

export function firmRequiredResponse() {
  return NextResponse.json(
    { error: 'Your account is not associated with a firm yet.' },
    { status: 400 }
  )
}
