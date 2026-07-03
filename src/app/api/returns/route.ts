import { NextResponse } from 'next/server'
import { db } from '@/db'
import { taxReturns, clients, users } from '@/db/schema'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/auth'
import { eq, desc, sql } from 'drizzle-orm'
import { z } from 'zod'
import { getFirmId, firmRequiredResponse, isDemoSession } from '@/lib/tenant'

const DEMO_RETURNS = [
  { id: '1', clientName: 'Acme Corp', clientEmail: 'billing@acme.com', initials: 'AC', formCode: '1120', taxYear: 2025, preparerName: 'Jane D.', status: 'in_review', notes: null },
  { id: '2', clientName: 'Bob Smith', clientEmail: 'bob@smith.com', initials: 'BS', formCode: '1040', taxYear: 2025, preparerName: 'Jane D.', status: 'completed', notes: null },
  { id: '3', clientName: 'TechStart Inc', clientEmail: 'info@techstart.io', initials: 'TI', formCode: '1065', taxYear: 2025, preparerName: 'Mike R.', status: 'in_review', notes: null },
  { id: '4', clientName: 'Sarah Johnson', clientEmail: 'sarah@j.com', initials: 'SJ', formCode: '1040', taxYear: 2024, preparerName: 'Jane D.', status: 'draft', notes: null },
  { id: '5', clientName: 'Global Partners LLC', clientEmail: 'info@global.com', initials: 'GP', formCode: '1120-S', taxYear: 2025, preparerName: 'Mike R.', status: 'draft', notes: null },
  { id: '6', clientName: 'John Smith', clientEmail: 'john.smith@email.com', initials: 'JS', formCode: '1040', taxYear: 2025, preparerName: 'Bob Martinez', status: 'in_review', notes: null },
]

const PREPARER_FIELDS = {
  id: taxReturns.id,
  clientName: sql<string>`CONCAT(${clients.firstName}, ' ', ${clients.lastName})`,
  clientEmail: clients.email,
  formCode: sql<string>`COALESCE(${taxReturns.formData}->>'formCode', '1040')`,
  taxYear: taxReturns.taxYear,
  preparerName: users.name,
  status: taxReturns.status,
  notes: taxReturns.notes,
}

const createReturnSchema = z.object({
  clientId: z.string().min(1, 'Client is required'),
  taxYear: z.number().int().min(2020).max(2030).default(new Date().getFullYear()),
  formCode: z.string().min(1, 'Return type is required'),
  notes: z.string().optional(),
})

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const firmId = getFirmId(session)
  if (!firmId) {
    if (isDemoSession(session)) return NextResponse.json(DEMO_RETURNS)
    return firmRequiredResponse()
  }

  try {
    const results = await db
      .select(PREPARER_FIELDS)
      .from(taxReturns)
      .leftJoin(clients, eq(taxReturns.clientId, clients.id))
      .leftJoin(users, eq(taxReturns.preparerId!, users.id))
      .where(eq(taxReturns.firmId, firmId))
      .orderBy(desc(taxReturns.updatedAt))
      .limit(50)

    const enriched = results.map(r => ({
      ...r,
      initials: (r.clientName ?? '').split(' ').map(w => w[0]).filter(Boolean).slice(0, 2).join('').toUpperCase() || '??',
    }))
    // Empty is a legitimate state for a new firm — return it as-is,
    // never substitute fake data for a real (if empty) result set.
    return NextResponse.json(enriched)
  } catch (error) {
    console.error('Returns fetch failed:', error)
    return NextResponse.json({ error: 'Failed to load returns' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const firmId = getFirmId(session)
  if (!firmId) return firmRequiredResponse()

  try {
    const body = await request.json()
    const parsed = createReturnSchema.parse(body)

    const s = session as { user: { id: string } }

    const [ret] = await db.insert(taxReturns).values({
      clientId: parsed.clientId,
      taxYear: parsed.taxYear,
      formData: { formCode: parsed.formCode },
      firmId,
      preparerId: s.user.id,
      status: 'draft',
      notes: parsed.notes || null,
    }).returning()

    return NextResponse.json(ret, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0]?.message ?? 'Validation failed' }, { status: 400 })
    }
    console.error('Return create failed:', error)
    return NextResponse.json({ error: 'Failed to create return' }, { status: 500 })
  }
}
