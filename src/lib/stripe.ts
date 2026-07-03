import Stripe from 'stripe'

let client: Stripe | null = null

/**
 * Lazy-loaded Stripe client. Throws only when actually used without a
 * key configured, so the app can still boot (e.g. in dev) without
 * billing set up.
 */
export function getStripe(): Stripe {
  if (!client) {
    const key = process.env.STRIPE_SECRET_KEY
    if (!key) {
      throw new Error('STRIPE_SECRET_KEY is not configured')
    }
    client = new Stripe(key, {
      apiVersion: '2025-08-27.basil',
    })
  }
  return client
}

export function isStripeConfigured(): boolean {
  return !!process.env.STRIPE_SECRET_KEY
}

export function getWebhookSecret(): string {
  const secret = process.env.STRIPE_WEBHOOK_SECRET
  if (!secret) {
    throw new Error('STRIPE_WEBHOOK_SECRET is not configured')
  }
  return secret
}
