import { NextResponse } from 'next/server'
import { db } from '@/db'
import { companies, companyAssignments, users } from '@/db/schema'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/auth'
import { and, eq } from 'drizzle-orm'
import { z } from 'zod'
import { getFirmId, firmRequiredResponse } from '@/lib/tenant'
import { canManageCompanies } from '@/lib/rbac'

const updateCompanySchema = z.object({
  name: z.string().min(1).optional(),
  industry: z.string().optional().or(z.literal('')),
  contactName: z.string().optional().or(z.literal('')),
  contactEmail: z.string().email().optional().or(z.literal('')),
  contactPhone: z.string().optional().or(z.literal('')),
  notes: z.string().optional().or(z.literal('')),
})

async function getCompany(firmId: string, id: string) {
  return db
    .select()
    .from(companies)
    .where(and(eq(companies.id, id), eq(companies.firmId, firmId)))
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
    const company = await getCompany(firmId, id)
    if (!company) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 })
    }

    const staff = await db
      .select({ id: users.id, name: users.name, email: users.email, role: users.role })
      .from(companyAssignments)
      .innerJoin(users, eq(companyAssignments.userId, users.id))
      .where(eq(companyAssignments.companyId, id))

    return NextResponse.json({ ...company, staff })
  } catch (error) {
    console.error('Company fetch failed:', error)
    return NextResponse.json({ error: 'Failed to load company' }, { status: 500 })
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

  const s = session as { user: { role?: string } }
  if (!canManageCompanies(s.user.role)) {
    return NextResponse.json({ error: 'Only admins can update companies' }, { status: 403 })
  }

  const firmId = getFirmId(session)
  if (!firmId) return firmRequiredResponse()

  const { id } = await params

  try {
    const company = await getCompany(firmId, id)
    if (!company) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 })
    }

    const body = await request.json()
    const parsed = updateCompanySchema.parse(body)

    const updateData: Record<string, any> = { updatedAt: new Date() }
    if (parsed.name !== undefined) updateData.name = parsed.name
    if (parsed.industry !== undefined) updateData.industry = parsed.industry || null
    if (parsed.contactName !== undefined) updateData.contactName = parsed.contactName || null
    if (parsed.contactEmail !== undefined) updateData.contactEmail = parsed.contactEmail || null
    if (parsed.contactPhone !== undefined) updateData.contactPhone = parsed.contactPhone || null
    if (parsed.notes !== undefined) updateData.notes = parsed.notes || null

    const [updated] = await db
      .update(companies)
      .set(updateData)
      .where(and(eq(companies.id, id), eq(companies.firmId, firmId)))
      .returning()

    const staff = await db
      .select({ id: users.id, name: users.name, email: users.email, role: users.role })
      .from(companyAssignments)
      .innerJoin(users, eq(companyAssignments.userId, users.id))
      .where(eq(companyAssignments.companyId, id))

    return NextResponse.json({ ...updated, staff })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0]?.message ?? 'Validation failed' }, { status: 400 })
    }
    console.error('Company update failed:', error)
    return NextResponse.json({ error: 'Failed to update company' }, { status: 500 })
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

  const s = session as { user: { role?: string } }
  if (!canManageCompanies(s.user.role)) {
    return NextResponse.json({ error: 'Only admins can delete companies' }, { status: 403 })
  }

  const firmId = getFirmId(session)
  if (!firmId) return firmRequiredResponse()

  const { id } = await params

  try {
    const company = await getCompany(firmId, id)
    if (!company) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 })
    }

    // onDelete cascade handles companyAssignments cleanup
    await db
      .delete(companies)
      .where(and(eq(companies.id, id), eq(companies.firmId, firmId)))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Company delete failed:', error)
    return NextResponse.json({ error: 'Failed to delete company' }, { status: 500 })
  }
}
