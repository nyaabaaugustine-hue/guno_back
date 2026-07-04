import { NextResponse } from 'next/server'
import { db } from '@/db'
import { taxReturns, clients, users } from '@/db/schema'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/auth'
import { and, eq, sql } from 'drizzle-orm'
import { alias } from 'drizzle-orm/pg-core'
import { z } from 'zod'
import { getFirmId, firmRequiredResponse, isDemoSession, isUuid } from '@/lib/tenant'
import { normalizeRole } from '@/lib/rbac'

const preparerUsers = alias(users, 'preparer_users')
const reviewerUsers = alias(users, 'reviewer_users')

const DEMO_RETURN = {
  id: '1',
  clientId: 'demo-client-1',
  clientName: 'Acme Corp',
  clientEmail: 'billing@acme.com',
  formCode: '1120',
  taxYear: 2025,
  preparerId: 'demo-2',
  preparerName: 'Jane D.',
  reviewerId: null,
  reviewerName: null,
  status: 'in_review',
  notes: null,
  formData: { formCode: '1120' },
}

// Allowed status transitions, keyed by the role initiating them.
// draft -> in_review: preparer/firm_admin/admin submits for review
// in_review -> completed: reviewer/firm_admin/admin approves
// in_review -> draft: reviewer/firm_admin/admin sends back for revision
const TRANSITIONS: Record<string, { to: string; roles: string[] }[]> = {
  draft: [{ to: 'in_review', roles: ['preparer', 'firm_admin', 'admin'] }],
  in_review: [
    { to: 'completed', roles: ['reviewer', 'firm_admin', 'admin'] },
    { to: 'draft', roles: ['reviewer', 'firm_admin', 'admin'] },
  ],
  completed: [],
}

const patchSchema = z.object({
  status: z.string().optional(),
  notes: z.string().nullable().optional(),
  reviewerId: z.string().nullable().optional(),
})

async function loadReturn(id: string, firmId: string) {
  const [ret] = await db
    .select({
      id: taxReturns.id,
      clientId: taxReturns.clientId,
      clientName: sql<string>`CONCAT(${clients.firstName}, ' ', ${clients.lastName})`,
      clientEmail: clients.email,
      formCode: sql<string>`COALESCE(${taxReturns.formData}->>'formCode', '1040')`,
      taxYear: taxReturns.taxYear,
      preparerId: taxReturns.preparerId,
      preparerName: preparerUsers.name,
      reviewerId: taxReturns.reviewerId,
      reviewerName: reviewerUsers.name,
      status: taxReturns.status,
      notes: taxReturns.notes,
      formData: taxReturns.formData,
      createdAt: taxReturns.createdAt,
      updatedAt: taxReturns.updatedAt,
    })
    .from(taxReturns)
    .leftJoin(clients, eq(taxReturns.clientId, clients.id))
    .leftJoin(preparerUsers, eq(taxReturns.preparerId, preparerUsers.id))
    .leftJoin(reviewerUsers, eq(taxReturns.reviewerId, reviewerUsers.id))
    .where(and(eq(taxReturns.id, id), eq(taxReturns.firmId, firmId)))
    .limit(1)

  return ret ?? null
}

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const firmId = getFirmId(session)
  if (!firmId) {
    if (isDemoSession(session)) return NextResponse.json(DEMO_RETURN)
    return firmRequiredResponse()
  }

  if (!isUuid(id)) {
    return NextResponse.json({ error: 'Return not found' }, { status: 404 })
  }

  try {
    const ret = await loadReturn(id, firmId)
    if (!ret) {
      return NextResponse.json({ error: 'Return not found' }, { status: 404 })
    }
    return NextResponse.json(ret)
  } catch (error) {
    console.error('Return fetch failed:', error)
    return NextResponse.json({ error: 'Failed to load return' }, { status: 500 })
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const firmId = getFirmId(session)
  if (!firmId) return firmRequiredResponse()

  if (!isUuid(id)) {
    return NextResponse.json({ error: 'Return not found' }, { status: 404 })
  }

  try {
    const body = await request.json()
    const parsed = patchSchema.parse(body)

    const s = session as { user: { id: string; role?: string | null } }
    const role = normalizeRole(s.user.role)

    const [existing] = await db
      .select({ id: taxReturns.id, status: taxReturns.status })
      .from(taxReturns)
      .where(and(eq(taxReturns.id, id), eq(taxReturns.firmId, firmId)))
      .limit(1)

    if (!existing) {
      return NextResponse.json({ error: 'Return not found' }, { status: 404 })
    }

    const updates: Partial<typeof taxReturns.$inferInsert> = {}

    if (parsed.status !== undefined && parsed.status !== existing.status) {
      const allowed = TRANSITIONS[existing.status] ?? []
      const transition = allowed.find((t) => t.to === parsed.status)

      if (!transition) {
        return NextResponse.json(
          { error: `Cannot move a return from "${existing.status}" to "${parsed.status}"` },
          { status: 400 }
        )
      }
      if (!transition.roles.includes(role)) {
        return NextResponse.json(
          { error: `Your role cannot perform this transition` },
          { status: 403 }
        )
      }
      updates.status = parsed.status
    }

    if (parsed.notes !== undefined) {
      updates.notes = parsed.notes
    }

    if (parsed.reviewerId !== undefined) {
      // Reassigning the reviewer is a staff-management-adjacent action —
      // restrict it the same way status transitions into review are.
      if (!['firm_admin', 'admin', 'preparer', 'reviewer'].includes(role)) {
        return NextResponse.json({ error: 'Not permitted to assign a reviewer' }, { status: 403 })
      }
      if (parsed.reviewerId !== null) {
        if (!isUuid(parsed.reviewerId)) {
          return NextResponse.json({ error: 'Invalid reviewer' }, { status: 400 })
        }
        const [reviewer] = await db
          .select({ id: users.id })
          .from(users)
          .where(and(eq(users.id, parsed.reviewerId), eq(users.firmId, firmId)))
          .limit(1)
        if (!reviewer) {
          return NextResponse.json({ error: 'Reviewer not found in your firm' }, { status: 404 })
        }
      }
      updates.reviewerId = parsed.reviewerId
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })
    }

    const [updated] = await db
      .update(taxReturns)
      .set({ ...updates, updatedAt: new Date() })
      .where(and(eq(taxReturns.id, id), eq(taxReturns.firmId, firmId)))
      .returning()

    return NextResponse.json(updated)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0]?.message ?? 'Validation failed' }, { status: 400 })
    }
    console.error('Return update failed:', error)
    return NextResponse.json({ error: 'Failed to update return' }, { status: 500 })
  }
}
