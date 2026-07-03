import { NextResponse } from 'next/server'
import { db } from '@/db'
import { clients, taxReturns, documents } from '@/db/schema'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/auth'
import { and, eq, count } from 'drizzle-orm'
import { getFirmId, firmRequiredResponse } from '@/lib/tenant'
import { maskSSN } from '@/lib/encryption'

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
    // Scope by firmId as well as id — prevents one firm from fetching
    // another firm's client by guessing/enumerating UUIDs.
    const [client] = await db
      .select()
      .from(clients)
      .where(and(eq(clients.id, id), eq(clients.firmId, firmId)))
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
      // Show only the last 4 digits — never return decrypted SSN to the client.
      ssn: client.ssn ? maskSSN(client.ssn) : null,
      returnCount: returnCount?.count ?? 0,
      documentCount: docCount?.count ?? 0,
    })
  } catch (error) {
    console.error('Client fetch failed:', error)
    return NextResponse.json({ error: 'Failed to load client' }, { status: 500 })
  }
}
