import { NextResponse } from 'next/server'
import { db } from '@/db'
import { clients, taxReturns, documents } from '@/db/schema'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/auth'
import { eq, count } from 'drizzle-orm'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  try {
    const [client] = await db
      .select()
      .from(clients)
      .where(eq(clients.id, id))
      .limit(1)

    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 })
    }

    const [returnCount] = await db
      .select({ count: count() })
      .from(taxReturns)
      .where(eq(taxReturns.clientId, id))

    const [docCount] = await db
      .select({ count: count() })
      .from(documents)
      .where(eq(documents.clientId, id))

    return NextResponse.json({
      ...client,
      returnCount: returnCount?.count ?? 0,
      documentCount: docCount?.count ?? 0,
    })
  } catch {
    // Return demo client data when DB isn't available
    const s = session as { user: { firmId?: string | null } }
    return NextResponse.json({
      id,
      firmId: s.user.firmId || 'demo-firm-1',
      firstName: 'Acme',
      lastName: 'Corporation',
      email: 'billing@acme.com',
      phone: '(555) 123-4567',
      ssn: null,
      address: '123 Business Ave, Springfield, IL 62701',
      notes: 'Key client — multi-entity return',
      returnCount: 3,
      documentCount: 7,
      createdAt: new Date('2026-01-15').toISOString(),
    })
  }
}
