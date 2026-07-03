import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/auth'
import { db } from '@/db'
import { firms, subscriptions, users } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { getFirmId, firmRequiredResponse } from '@/lib/tenant'
import { getStripe, isStripeConfigured } from '@/lib/stripe'
import { PLANS, type PlanTier } from '@/lib/plans'
import { canManageStaff } from '@/lib/rbac'

const checkoutSchema = z.object({
  tier: z.enum(['starter', 'professional']), // enterprise is sales-assisted, not self-serve
})

/**
 * Creates a Stripe Checkout session to start or upgrade a firm's
 * subscription. Only firm_admin/admin can change billing.
 */
export async function POST(request: Request) {
  if (!isStripeConfigured()) {
    return NextResponse.json({ error: 'Billing is not configured on this deployment' }, { status: 503 })
  }

  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const s = session as { user: { id: string; role: string } }
  if (!canManageStaff(s.user.role)) {
    return NextResponse.json({ error: 'Only firm admins can manage billing' }, { status: 403 })
  }

  const firmId = getFirmId(session)
  if (!firmId) return firmRequiredResponse()

  try {
    const body = await request.json()
    const { tier } = checkoutSchema.parse(body)

    const plan = PLANS[tier as PlanTier]
    if (!plan.stripePriceId) {
      return NextResponse.json({ error: `No Stripe price configured for the ${tier} plan` }, { status: 500 })
    }

    const [firm] = await db.select().from(firms).where(eq(firms.id, firmId)).limit(1)
    if (!firm) return NextResponse.json({ error: 'Firm not found' }, { status: 404 })

    const [existingSub] = await db.select().from(subscriptions).where(eq(subscriptions.firmId, firmId)).limit(1)
    const [admin] = await db.select().from(users).where(eq(users.id, s.user.id)).limit(1)

    const stripe = getStripe()
    const appUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'

    const checkoutSession = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: existingSub?.stripeCustomerId || undefined,
      customer_email: existingSub?.stripeCustomerId ? undefined : admin?.email,
      client_reference_id: firmId,
      line_items: [{ price: plan.stripePriceId, quantity: 1 }],
      subscription_data: {
        metadata: { firmId },
      },
      metadata: { firmId, tier },
      success_url: `${appUrl}/settings/billing?checkout=success`,
      cancel_url: `${appUrl}/settings/billing?checkout=canceled`,
      allow_promotion_codes: true,
    })

    return NextResponse.json({ url: checkoutSession.url })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0]?.message ?? 'Validation failed' }, { status: 400 })
    }
    console.error('Checkout session creation failed:', error)
    return NextResponse.json({ error: 'Failed to start checkout' }, { status: 500 })
  }
}
