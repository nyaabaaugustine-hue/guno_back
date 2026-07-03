import { NextResponse } from 'next/server'
import { db } from '@/db'
import { companies, companyAssignments, users } from '@/db/schema'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/auth'
import { and, eq, ilike } from 'drizzle-orm'
import { z } from 'zod'
import { getFirmId, firmRequiredResponse, isDemoSession } from '@/lib/tenant'
import { canManageCompanies, hasFullCompanyAccess } from '@/lib/rbac'

const DEMO_COMPANIES = [
  {
    id: 'demo-co-1',
    name: 'Acme Corp',
    industry: 'Manufacturing',
    contactName: 'Wendell Acme',
    contactEmail: 'billing@acme.com',
    contactPhone: '(555) 010-1000',
    notes: null,
    staff: [{ id: 'demo-2', name: 'Jane Doe', email: 'jane@firm.com', role: 'preparer' }],
  },
  {
    id: 'demo-co-2',
    name: 'TechStart Inc',
    industry: 'Software',
    contactName: 'Priya Shah',
    contactEmail: 'info@techstart.io',
    contactPhone: '(555) 010-2000',
    notes: null,
    staff: [],
  },
]

const createCompanySchema = z.object({
  name: z.string().min(1, 'Company name is required'),
  industry: z.string().optional().or(z.literal('')),
  contactName: z.string().optional().or(z.literal('')),
  contactEmail: z.string().email().optional().or(z.literal('')),
  contactPhone: z.string().optional().or(z.literal('')),
  notes: z.string().optional().or(z.literal('')),
})

export async function GET(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const search = (searchParams.get('search') || '').toLowerCase()

  const firmId = getFirmId(session)
  if (!firmId) {
    if (isDemoSession(session)) {
      const filtered = search
        ? DEMO_COMPANIES.filter((c) => c.name.toLowerCase().includes(search))
        : DEMO_COMPANIES
      return NextResponse.json(filtered)
    }
    return firmRequiredResponse()
  }

  try {
    const s = session as { user: { id: string; role?: string } }
    const tenantScope = eq(companies.firmId, firmId)
    const where = search ? and(tenantScope, ilike(companies.name, `%${search}%`)) : tenantScope

    const rows = await db.select().from(companies).where(where)

    // company_agent only sees companies they're actually assigned to.
    let visibleRows = rows
    if (!hasFullCompanyAccess(s.user.role)) {
      const assigned = await db
        .select({ companyId: companyAssignments.companyId })
        .from(companyAssignments)
        .where(eq(companyAssignments.userId, s.user.id))
      const assignedIds = new Set(assigned.map((a) => a.companyId))
      visibleRows = rows.filter((c) => assignedIds.has(c.id))
    }

    const withStaff = await Promise.all(
      visibleRows.map(async (c) => {
        const staff = await db
          .select({ id: users.id, name: users.name, email: users.email, role: users.role })
          .from(companyAssignments)
          .innerJoin(users, eq(companyAssignments.userId, users.id))
          .where(eq(companyAssignments.companyId, c.id))
        return { ...c, staff }
      })
    )

    return NextResponse.json(withStaff)
  } catch (error) {
    console.error('Companies fetch failed:', error)
    return NextResponse.json({ error: 'Failed to load companies' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const s = session as { user: { id: string; role?: string; firmId?: string | null } }
  if (!canManageCompanies(s.user.role)) {
    return NextResponse.json({ error: 'Only admins can add companies' }, { status: 403 })
  }

  const firmId = getFirmId(session)
  if (!firmId) {
    if (isDemoSession(session)) {
      return NextResponse.json(
        { error: 'Adding companies requires a real firm account (not the demo login).' },
        { status: 400 }
      )
    }
    return firmRequiredResponse()
  }

  try {
    const body = await request.json()
    const parsed = createCompanySchema.parse(body)

    const [company] = await db
      .insert(companies)
      .values({
        name: parsed.name,
        industry: parsed.industry || null,
        contactName: parsed.contactName || null,
        contactEmail: parsed.contactEmail || null,
        contactPhone: parsed.contactPhone || null,
        notes: parsed.notes || null,
        firmId,
        createdById: s.user.id,
      })
      .returning()

    return NextResponse.json({ ...company, staff: [] }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0]?.message ?? 'Validation failed' }, { status: 400 })
    }
    console.error('Company create failed:', error)
    return NextResponse.json({ error: 'Failed to create company' }, { status: 500 })
  }
}
