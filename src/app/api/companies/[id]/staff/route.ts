import { NextResponse } from 'next/server'
import { db } from '@/db'
import { companies, companyAssignments, users } from '@/db/schema'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/auth'
import { and, eq } from 'drizzle-orm'
import { z } from 'zod'
import { getFirmId, firmRequiredResponse } from '@/lib/tenant'
import { canManageStaff } from '@/lib/rbac'

const assignSchema = z.object({
  userId: z.string().min(1, 'A staff member is required'),
})

// POST /api/companies/:id/staff — assign a staff member (typically a
// company_agent) to this company.
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const s = session as { user: { id: string; role?: string } }
  if (!canManageStaff(s.user.role)) {
    return NextResponse.json({ error: 'Only admins can assign staff to companies' }, { status: 403 })
  }

  const firmId = getFirmId(session)
  if (!firmId) return firmRequiredResponse()

  const { id } = await params

  try {
    const body = await request.json()
    const parsed = assignSchema.parse(body)

    // Verify the company belongs to this firm.
    const [company] = await db
      .select()
      .from(companies)
      .where(and(eq(companies.id, id), eq(companies.firmId, firmId)))
      .limit(1)
    if (!company) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 })
    }

    // Verify the target user belongs to this firm too.
    const [targetUser] = await db
      .select()
      .from(users)
      .where(and(eq(users.id, parsed.userId), eq(users.firmId!, firmId)))
      .limit(1)
    if (!targetUser) {
      return NextResponse.json({ error: 'Staff member not found in your firm' }, { status: 404 })
    }

    const [assignment] = await db
      .insert(companyAssignments)
      .values({ companyId: id, userId: parsed.userId, assignedById: s.user.id })
      .onConflictDoNothing()
      .returning()

    return NextResponse.json(
      assignment ?? { companyId: id, userId: parsed.userId, note: 'already assigned' },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0]?.message ?? 'Validation failed' }, { status: 400 })
    }
    console.error('Staff assignment failed:', error)
    return NextResponse.json({ error: 'Failed to assign staff' }, { status: 500 })
  }
}

// DELETE /api/companies/:id/staff?userId=... — remove a staff member from this company.
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const s = session as { user: { role?: string } }
  if (!canManageStaff(s.user.role)) {
    return NextResponse.json({ error: 'Only admins can unassign staff' }, { status: 403 })
  }

  const firmId = getFirmId(session)
  if (!firmId) return firmRequiredResponse()

  const { id } = await params
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('userId')
  if (!userId) {
    return NextResponse.json({ error: 'userId query param is required' }, { status: 400 })
  }

  try {
    const [company] = await db
      .select()
      .from(companies)
      .where(and(eq(companies.id, id), eq(companies.firmId, firmId)))
      .limit(1)
    if (!company) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 })
    }

    await db
      .delete(companyAssignments)
      .where(and(eq(companyAssignments.companyId, id), eq(companyAssignments.userId, userId)))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Staff unassignment failed:', error)
    return NextResponse.json({ error: 'Failed to unassign staff' }, { status: 500 })
  }
}
