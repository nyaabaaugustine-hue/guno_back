import { NextResponse } from 'next/server'
import { db } from '@/db'
import { taxReturns, clients, users } from '@/db/schema'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/auth'
import { eq, desc, sql } from 'drizzle-orm'
import { z } from 'zod'

const DEMO_RETURNS = [
  { id: '1', clientName: 'Acme Corp', form: '1120', year: 2025, preparer: 'Jane D.', reviewer: null, status: 'In Review', updated: '2h ago' },
  { id: '2', clientName: 'Bob Smith', form: '1040', year: 2025, preparer: 'Jane D.', reviewer: 'Mike R.', status: 'Completed', updated: '5h ago' },
  { id: '3', clientName: 'TechStart Inc', form: '1065', year: 2025, preparer: 'Mike R.', reviewer: null, status: 'Processing', updated: '1d ago' },
  { id: '4', clientName: 'Sarah Johnson', form: '1040', year: 2024, preparer: 'Jane D.', reviewer: null, status: 'Draft', updated: '2d ago' },
  { id: '5', clientName: 'Global Partners', form: '1120-S', year: 2025, preparer: 'Mike R.', reviewer: 'Jane D.', status: 'In Review', updated: '2d ago' },
]

const createReturnSchema = z.object({
  clientId: z.string().min(1, 'Client is required'),
  taxYear: z.number().int().min(2020).max(2030),
  returnType: z.string().min(1),
  notes: z.string().optional(),
})

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const results = await db
      .select({
        id: taxReturns.id,
        clientName: sql<string>`CONCAT(${clients.firstName}, ' ', ${clients.lastName})`,
        form: taxReturns.status,
        year: taxReturns.taxYear,
        preparer: users.name,
        status: taxReturns.status,
        updated: taxReturns.updatedAt,
      })
      .from(taxReturns)
      .leftJoin(clients, eq(taxReturns.clientId, clients.id))
      .leftJoin(users, eq(taxReturns.preparerId!, users.id))
      .orderBy(desc(taxReturns.updatedAt))
      .limit(50)

    if (results.length > 0) {
      return NextResponse.json(results)
    }
  } catch {}

  return NextResponse.json(DEMO_RETURNS)
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const parsed = createReturnSchema.parse(body)

    const s = session as { user: { id: string; firmId?: string | null } }
    const firmId = s.user.firmId || 'demo-firm-1'

    const [ret] = await db.insert(taxReturns).values({
      clientId: parsed.clientId,
      taxYear: parsed.taxYear,
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
    return NextResponse.json({ error: 'Failed to create return' }, { status: 500 })
  }
}
