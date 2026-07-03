import { NextResponse } from 'next/server'
import { db } from '@/db'
import { clients, taxReturns, documents } from '@/db/schema'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/auth'
import { and, eq, count } from 'drizzle-orm'
import { z } from 'zod'
import { getFirmId, firmRequiredResponse } from '@/lib/tenant'
import { maskSSN, encryptSSN } from '@/lib/encryption'

const updateClientSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional().or(z.literal('')),
  tin: z.string().optional().or(z.literal('')),
  city: z.string().optional().or(z.literal('')),
  state: z.string().optional().or(z.literal('')),
  zip: z.string().optional().or(z.literal('')),
  address: z.string().optional().or(z.literal('')),
  notes: z.string().optional().or(z.literal('')),
})

async function getClient(firmId: string, id: string) {
  return db
    .select()
    .from(clients)
    .where(and(eq(clients.id, id), eq(clients.firmId, firmId)))
    .limit(1)
    .then((r) => r[0])
}

function clientNotFound() {
  return NextResponse.json({ error: 'Client not found' }, { status: 404 })
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
    const client = await getClient(firmId, id)
    if (!client) return clientNotFound()

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
      ssn: client.ssn ? maskSSN(client.ssn) : null,
      returnCount: returnCount?.count ?? 0,
      documentCount: docCount?.count ?? 0,
    })
  } catch (error) {
    console.error('Client fetch failed:', error)
    return NextResponse.json({ error: 'Failed to load client' }, { status: 500 })
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
    const client = await getClient(firmId, id)
    if (!client) return clientNotFound()

    const body = await request.json()
    const parsed = updateClientSchema.parse(body)

    const updateData: Record<string, any> = { updatedAt: new Date() }
    if (parsed.firstName !== undefined) updateData.firstName = parsed.firstName
    if (parsed.lastName !== undefined) updateData.lastName = parsed.lastName
    if (parsed.email !== undefined) updateData.email = parsed.email || null
    if (parsed.phone !== undefined) updateData.phone = parsed.phone || null
    if (parsed.tin !== undefined) updateData.ssn = parsed.tin ? encryptSSN(parsed.tin) : null
    if (parsed.notes !== undefined) updateData.notes = parsed.notes || null
    if (parsed.address !== undefined) {
      updateData.address = parsed.address
    } else if (parsed.city !== undefined || parsed.state !== undefined || parsed.zip !== undefined) {
      const parts = [
        parsed.city ?? client.address?.split(',')[0]?.trim(),
        parsed.state ?? client.address?.split(',')[1]?.trim(),
        parsed.zip ?? client.address?.split(',')[2]?.trim(),
      ]
      updateData.address = parts.filter(Boolean).join(', ') || null
    }

    const [updated] = await db
      .update(clients)
      .set(updateData)
      .where(and(eq(clients.id, id), eq(clients.firmId, firmId)))
      .returning()

    if (!updated) return NextResponse.json({ error: 'Failed to update client' }, { status: 500 })

    return NextResponse.json({
      ...updated,
      ssn: updated.ssn ? maskSSN(updated.ssn) : null,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0]?.message ?? 'Validation failed' }, { status: 400 })
    }
    console.error('Client update failed:', error)
    return NextResponse.json({ error: 'Failed to update client' }, { status: 500 })
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
    const client = await getClient(firmId, id)
    if (!client) return clientNotFound()

    await db
      .delete(clients)
      .where(and(eq(clients.id, id), eq(clients.firmId, firmId)))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Client delete failed:', error)
    return NextResponse.json({ error: 'Failed to delete client' }, { status: 500 })
  }
}
