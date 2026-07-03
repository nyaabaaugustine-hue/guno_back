import { NextResponse } from 'next/server'
import type Stripe from 'stripe'
import { db } from '@/db'
import { subscriptions } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { getStripe, getWebhookSecret, isStripeConfigured } from '@/lib/stripe'
import { planTierFromStripePriceId } from '@/lib/plans'
import { logAudit } from '@/lib/audit'

// Stripe webhooks need the raw request body to verify the signature —
// Next.js route handlers give us that via request.text() as long as we
// don't run this through any body-parsing middleware.
export const runtime = 'nodejs'

export async function POST(request: Request) {
  if (!isStripeConfigured()) {
    return NextResponse.json({ error: 'Billing is not configured' }, { status: 503 })
  }

  const signature = request.headers.get('stripe-signature')
  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 })
  }

  const rawBody = await request.text()
  const stripe = getStripe()

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, getWebhookSecret())
  } catch (err) {
    console.error('Stripe webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const checkoutSession = event.data.object as Stripe.Checkout.Session
        const firmId = checkoutSession.client_reference_id || checkoutSession.metadata?.firmId
        if (!firmId || typeof checkoutSession.subscription !== 'string') break

        const stripeSub = await stripe.subscriptions.retrieve(checkoutSession.subscription)
        await upsertSubscriptionFromStripe(firmId, stripeSub)
        await logAudit({
          firmId,
          actorId: null,
          action: 'billing.subscription_started',
          targetType: 'subscription',
          metadata: { stripeSubscriptionId: stripeSub.id },
        })
        break
      }

      case 'customer.subscription.updated':
      case 'customer.subscription.created': {
        const stripeSub = event.data.object as Stripe.Subscription
        const firmId = stripeSub.metadata?.firmId
        if (!firmId) break
        await upsertSubscriptionFromStripe(firmId, stripeSub)
        break
      }

      case 'customer.subscription.deleted': {
        const stripeSub = event.data.object as Stripe.Subscription
        const firmId = stripeSub.metadata?.firmId
        if (!firmId) break

        await db
          .update(subscriptions)
          .set({ status: 'canceled', updatedAt: new Date() })
          .where(eq(subscriptions.firmId, firmId))

        await logAudit({
          firmId,
          actorId: null,
          action: 'billing.subscription_canceled',
          targetType: 'subscription',
          metadata: { stripeSubscriptionId: stripeSub.id },
        })
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        const subId = (invoice as unknown as { subscription?: string }).subscription
        if (!subId) break
        const stripeSub = await stripe.subscriptions.retrieve(subId)
        const firmId = stripeSub.metadata?.firmId
        if (!firmId) break

        await db
          .update(subscriptions)
          .set({ status: 'past_due', updatedAt: new Date() })
          .where(eq(subscriptions.firmId, firmId))

        await logAudit({
          firmId,
          actorId: null,
          action: 'billing.payment_failed',
          targetType: 'subscription',
          metadata: { invoiceId: invoice.id },
        })
        break
      }

      default:
        // Unhandled event types are fine to ignore — Stripe sends many
        // more than we act on.
        break
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error(`Stripe webhook handler failed for ${event.type}:`, error)
    // Return 500 so Stripe retries — we want at-least-once delivery for
    // billing state changes.
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
  }
}

async function upsertSubscriptionFromStripe(firmId: string, stripeSub: Stripe.Subscription) {
  const priceId = stripeSub.items.data[0]?.price?.id
  const tier = planTierFromStripePriceId(priceId) || 'starter'
  const item = stripeSub.items.data[0] as unknown as { current_period_end?: number } | undefined

  const values = {
    firmId,
    tier,
    status: stripeSub.status as typeof subscriptions.$inferInsert.status,
    seats: stripeSub.items.data[0]?.quantity || 1,
    stripeCustomerId: typeof stripeSub.customer === 'string' ? stripeSub.customer : stripeSub.customer.id,
    stripeSubscriptionId: stripeSub.id,
    stripePriceId: priceId ?? null,
    currentPeriodEnd: item?.current_period_end ? new Date(item.current_period_end * 1000) : null,
    cancelAtPeriodEnd: stripeSub.cancel_at_period_end,
    updatedAt: new Date(),
  }

  const [existing] = await db.select({ id: subscriptions.id }).from(subscriptions).where(eq(subscriptions.firmId, firmId)).limit(1)

  if (existing) {
    await db.update(subscriptions).set(values).where(eq(subscriptions.firmId, firmId))
  } else {
    await db.insert(subscriptions).values(values)
  }
}
