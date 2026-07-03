/**
 * Plan tiers for Juno Tax SaaS.
 *
 * This is the single source of truth for what each tier includes and
 * costs. Stripe Price IDs are read from env so the same code works
 * across Stripe test/live modes without a redeploy.
 *
 * Positioning note: Juno is a practice-management platform for tax
 * firms (clients, documents, return workflow, staff/role access) —
 * not a tax-calculation or e-file engine. Copy on the pricing page
 * and here should stay consistent with that.
 */

export type PlanTier = 'trial' | 'starter' | 'professional' | 'enterprise'

export interface PlanDefinition {
  tier: PlanTier
  name: string
  description: string
  monthlyPriceUsd: number | null // null = "contact us"
  stripePriceId: string | undefined
  seatLimit: number | null // null = unlimited
  clientLimit: number | null
  features: string[]
}

export const PLANS: Record<PlanTier, PlanDefinition> = {
  trial: {
    tier: 'trial',
    name: 'Trial',
    description: '14-day full-featured trial, no card required.',
    monthlyPriceUsd: 0,
    stripePriceId: undefined,
    seatLimit: 3,
    clientLimit: 15,
    features: [
      'Up to 3 staff seats',
      'Up to 15 clients',
      'Document uploads & tracking',
      'Return workflow (draft → review → complete)',
    ],
  },
  starter: {
    tier: 'starter',
    name: 'Starter',
    description: 'For solo preparers and small practices.',
    monthlyPriceUsd: 39,
    stripePriceId: process.env.STRIPE_PRICE_STARTER,
    seatLimit: 3,
    clientLimit: 75,
    features: [
      'Up to 3 staff seats',
      'Up to 75 clients',
      'Document storage & tracking',
      'Role-based staff access',
      'Email support',
    ],
  },
  professional: {
    tier: 'professional',
    name: 'Professional',
    description: 'For growing firms managing multiple preparers and reviewers.',
    monthlyPriceUsd: 99,
    stripePriceId: process.env.STRIPE_PRICE_PROFESSIONAL,
    seatLimit: 15,
    clientLimit: 500,
    features: [
      'Up to 15 staff seats',
      'Up to 500 clients',
      'AI document data extraction',
      'Company/entity assignment for scoped staff access',
      'Audit log',
      'Priority support',
    ],
  },
  enterprise: {
    tier: 'enterprise',
    name: 'Enterprise',
    description: 'For multi-office firms with custom compliance needs.',
    monthlyPriceUsd: null,
    stripePriceId: process.env.STRIPE_PRICE_ENTERPRISE,
    seatLimit: null,
    clientLimit: null,
    features: [
      'Unlimited staff seats & clients',
      'AI document data extraction',
      'Audit log & extended retention',
      'SSO (coming soon)',
      'Dedicated support & onboarding',
    ],
  },
}

export function getPlan(tier: PlanTier): PlanDefinition {
  return PLANS[tier]
}

export function planTierFromStripePriceId(priceId: string | null | undefined): PlanTier | null {
  if (!priceId) return null
  for (const plan of Object.values(PLANS)) {
    if (plan.stripePriceId === priceId) return plan.tier
  }
  return null
}

/** Statuses that should be treated as "the firm has active access." */
export const ACTIVE_SUBSCRIPTION_STATUSES = new Set(['trialing', 'active'])
