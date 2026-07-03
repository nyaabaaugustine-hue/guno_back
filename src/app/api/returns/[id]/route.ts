import { NextResponse } from 'next/server'
import { db } from '@/db'
import { taxReturns, clients, users } from '@/db/schema'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/auth'
import { and, eq, sql } from 'drizzle-orm'
import { z } from 'zod'
import { getFirmId, firmRequiredResponse } from '@/lib/tenant'

const VALID_STATUSES = ['draft', 'in_review', 'completed'] as const

const updateReturnSchema = z.object({
  status: z.enum(VALID_STATUSES).optional(),
  reviewerId: z.string().optional(),
  preparerId: z.string().optional(),
  formData: z.record(z.any()).optional(),
  notes: z.string().optional().or(z.literal('')),
})

async function getReturn(firmId: string, id: string) {
  return db
    .select({
      id: taxReturns.id,
      clientId: taxReturns.clientId,
      firmId: taxReturns.firmId,
      taxYear: taxReturns.taxYear,
      preparerId: taxReturns.preparerId,
      reviewerId: taxReturns.reviewerId,
      status: taxReturns.status,
      formData: taxReturns.formData,
      notes: taxReturns.notes,
      createdAt: taxReturns.createdAt,
      updatedAt: taxReturns.updatedAt,
      clientName: sql<string>`CONCAT(${clients.firstName}, ' ', ${clients.lastName})`,
      clientEmail: clients.email,
      preparerName: users.name,
    })
    .from(taxReturns)
    .leftJoin(clients, eq(taxReturns.clientId, clients.id))
    .leftJoin(users, eq(taxReturns.preparerId!, users.id))
    .where(and(eq(taxReturns.id, id), eq(taxReturns.firmId, firmId)))
    .limit(1)
    .then((r) => r[0])
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const firmId = getFirmId(session)
  if (!firmId) return firmRequiredResponse()

  const { id } = await params

  try {
    const ret = await getReturn(firmId, id)
    if (!ret) {
      return NextResponse.json({ error: 'Return not found' }, { status: 404 })
    }
    return NextResponse.json(ret)
  } catch (error) {
    console.error('Return fetch failed:', error)
    return NextResponse.json({ error: 'Failed to load return' }, { status: 500 })
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const firmId = getFirmId(session)
  if (!firmId) return firmRequiredResponse()

  const { id } = await params

  try {
    const ret = await getReturn(firmId, id)
    if (!ret) {
      return NextResponse.json({ error: 'Return not found' }, { status: 404 })
    }

    const body = await request.json()
    const parsed = updateReturnSchema.parse(body)

    const updateData: Record<string, any> = { updatedAt: new Date() }
    if (parsed.status !== undefined) updateData.status = parsed.status
    if (parsed.reviewerId !== undefined) updateData.reviewerId = parsed.reviewerId || null
    if (parsed.preparerId !== undefined) updateData.preparerId = parsed.preparerId || null
    if (parsed.formData !== undefined) updateData.formData = parsed.formData
    if (parsed.notes !== undefined) updateData.notes = parsed.notes || null

    const [updated] = await db
      .update(taxReturns)
      .set(updateData)
      .where(and(eq(taxReturns.id, id), eq(taxReturns.firmId, firmId)))
      .returning()

    const enriched = await getReturn(firmId, id)
    return NextResponse.json(enriched ?? updated)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0]?.message ?? 'Validation failed' }, { status: 400 })
    }
    console.error('Return update failed:', error)
    return NextResponse.json({ error: 'Failed to update return' }, { status: 500 })
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const firmId = getFirmId(session)
  if (!firmId) return firmRequiredResponse()

  const { id } = await params

  try {
    const [ret] = await db
      .select({ id: taxReturns.id })
      .from(taxReturns)
      .where(and(eq(taxReturns.id, id), eq(taxReturns.firmId, firmId)))
      .limit(1)

    if (!ret) {
      return NextResponse.json({ error: 'Return not found' }, { status: 404 })
    }

    await db
      .delete(taxReturns)
      .where(and(eq(taxReturns.id, id), eq(taxReturns.firmId, firmId)))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Return delete failed:', error)
    return NextResponse.json({ error: 'Failed to delete return' }, { status: 500 })
  }
}
