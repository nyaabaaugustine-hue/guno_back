import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/auth'
import { db } from '@/db'
import { subscriptions } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { getFirmId, firmRequiredResponse } from '@/lib/tenant'
import { getStripe, isStripeConfigured } from '@/lib/stripe'
import { canManageStaff } from '@/lib/rbac'

/**
 * Creates a Stripe Billing Portal session so a firm admin can update
 * payment method, view invoices, change plan, or cancel — without us
 * building any of that UI ourselves.
 */
export async function POST() {
  if (!isStripeConfigured()) {
    return NextResponse.json({ error: 'Billing is not configured on this deployment' }, { status: 503 })
  }

  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const s = session as { user: { role: string } }
  if (!canManageStaff(s.user.role)) {
    return NextResponse.json({ error: 'Only firm admins can manage billing' }, { status: 403 })
  }

  const firmId = getFirmId(session)
  if (!firmId) return firmRequiredResponse()

  const [sub] = await db.select().from(subscriptions).where(eq(subscriptions.firmId, firmId)).limit(1)
  if (!sub?.stripeCustomerId) {
    return NextResponse.json({ error: 'No billing account found. Start a subscription first.' }, { status: 400 })
  }

  try {
    const stripe = getStripe()
    const appUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: sub.stripeCustomerId,
      return_url: `${appUrl}/settings/billing`,
    })

    return NextResponse.json({ url: portalSession.url })
  } catch (error) {
    console.error('Billing portal session failed:', error)
    return NextResponse.json({ error: 'Failed to open billing portal' }, { status: 500 })
  }
}
