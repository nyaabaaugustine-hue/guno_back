import { db } from '@/db'
import { subscriptions, users, clients } from '@/db/schema'
import { and, count, eq } from 'drizzle-orm'
import { ACTIVE_SUBSCRIPTION_STATUSES, getPlan, type PlanTier } from '@/lib/plans'

export interface FirmEntitlements {
  tier: PlanTier
  status: string
  active: boolean
  seatLimit: number | null
  clientLimit: number | null
  seatsUsed: number
  clientsUsed: number
  trialEndsAt: Date | null
  hasFeature: (feature: 'ai_extraction' | 'audit_log' | 'company_scoping') => boolean
}

const FEATURE_MIN_TIER: Record<string, PlanTier> = {
  ai_extraction: 'professional',
  audit_log: 'professional',
  company_scoping: 'starter',
}

const TIER_RANK: Record<PlanTier, number> = {
  trial: 0,
  starter: 1,
  professional: 2,
  enterprise: 3,
}

/**
 * Loads a firm's current plan + live usage counts. Call this before any
 * action gated by seats/clients/features (inviting staff, adding a
 * client, using AI extraction, etc).
 *
 * If a firm somehow has no subscription row (shouldn't happen post
 * signup, but defends against partial data), it's treated as an
 * expired trial — safest default is "read-only until they subscribe."
 */
export async function getFirmEntitlements(firmId: string): Promise<FirmEntitlements> {
  const [subResult, seatsUsedResult, clientsUsedResult] = await Promise.all([
    db.select().from(subscriptions).where(eq(subscriptions.firmId, firmId)).limit(1),
    db
      .select({ value: count() })
      .from(users)
      .where(and(eq(users.firmId, firmId), eq(users.active, true))),
    db.select({ value: count() }).from(clients).where(eq(clients.firmId, firmId)),
  ])

  const [sub] = subResult
  const seatsUsed = seatsUsedResult[0]?.value ?? 0
  const clientsUsed = clientsUsedResult[0]?.value ?? 0

  const tier = (sub?.tier ?? 'trial') as PlanTier
  const status = sub?.status ?? 'canceled'
  const plan = getPlan(tier)

  const active = ACTIVE_SUBSCRIPTION_STATUSES.has(status)

  return {
    tier,
    status,
    active,
    seatLimit: plan.seatLimit,
    clientLimit: plan.clientLimit,
    seatsUsed,
    clientsUsed,
    trialEndsAt: sub?.trialEndsAt ?? null,
    hasFeature: (feature) => active && TIER_RANK[tier] >= TIER_RANK[FEATURE_MIN_TIER[feature] ?? 'enterprise'],
  }
}

export function seatLimitReached(ent: FirmEntitlements): boolean {
  return ent.seatLimit !== null && ent.seatsUsed >= ent.seatLimit
}

export function clientLimitReached(ent: FirmEntitlements): boolean {
  return ent.clientLimit !== null && ent.clientsUsed >= ent.clientLimit
}
