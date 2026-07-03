import { NextResponse } from 'next/server'
import { db } from '@/db'
import { clients } from '@/db/schema'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/auth'
import { and, eq, ilike, or } from 'drizzle-orm'
import { z } from 'zod'
import { getFirmId, firmRequiredResponse, isDemoSession } from '@/lib/tenant'
import { encryptSSN, maskSSN } from '@/lib/encryption'

// Matches the demo data shape used by /api/companies, /api/documents, and
// /api/returns — kept here too so the demo login has something to show
// without ever touching real tenant data.
const DEMO_CLIENTS = [
  { id: 'demo-cl-1', firstName: 'John', lastName: 'Doe', email: 'jdoe@juno.tax', phone: '(555) 123-4567', ssn: '•••-••-••••', address: 'Anytown, ST, 12345', createdAt: '2026-06-30' },
  { id: 'demo-cl-2', firstName: 'Demo', lastName: 'Corporation', email: 'dcorp@juno.tax', phone: '(555) 234-5678', ssn: '•••-••-••••', address: 'Othertown, ST, 23456', createdAt: '2026-06-28' },
  { id: 'demo-cl-3', firstName: 'Bob', lastName: 'Smith', email: 'bob@smith.com', phone: '(555) 345-6789', ssn: '•••-••-••••', address: 'Springfield, IL, 62701', createdAt: '2026-06-25' },
]

const createClientSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional().or(z.literal('')),
  tin: z.string().optional().or(z.literal('')),
  city: z.string().optional().or(z.literal('')),
  state: z.string().optional().or(z.literal('')),
  zip: z.string().optional().or(z.literal('')),
  notes: z.string().optional().or(z.literal('')),
})

export async function GET(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const firmId = getFirmId(session)
  if (!firmId) {
    if (isDemoSession(session)) return NextResponse.json(DEMO_CLIENTS)
    return firmRequiredResponse()
  }

  const { searchParams } = new URL(request.url)
  const search = searchParams.get('search') || ''

  try {
    const tenantScope = eq(clients.firmId, firmId)
    const where = search
      ? and(
          tenantScope,
          or(
            ilike(clients.firstName, `%${search}%`),
            ilike(clients.lastName, `%${search}%`),
            ilike(clients.email!, `%${search}%`)
          )
        )
      : tenantScope

    const result = await db.select().from(clients).where(where)

    // Never return raw SSN ciphertext to the client — mask it.
    const masked = result.map((c) => ({ ...c, ssn: c.ssn ? maskSSN2(c.ssn) : null }))
    return NextResponse.json(masked)
  } catch (error) {
    console.error('Clients fetch failed:', error)
    return NextResponse.json({ error: 'Failed to load clients' }, { status: 500 })
  }
}

// maskSSN() in lib/encryption also transparently decrypts if given
// ciphertext, which we don't want for a list view — this just formats
// without ever decrypting the underlying value.
function maskSSN2(_encrypted: string): string {
  return '•••-••-••••'
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
    const parsed = createClientSchema.parse(body)

    const s = session as { user: { id: string } }

    const [client] = await db.insert(clients).values({
      firstName: parsed.firstName,
      lastName: parsed.lastName,
      email: parsed.email || null,
      phone: parsed.phone || null,
      ssn: parsed.tin ? encryptSSN(parsed.tin) : null,
      address: [parsed.city, parsed.state, parsed.zip].filter(Boolean).join(', ') || null,
      firmId,
      createdById: s.user.id,
    }).returning()

    if (!client) return NextResponse.json({ error: 'Failed to create client' }, { status: 500 })
    return NextResponse.json({ ...client, ssn: client.ssn ? maskSSN2(client.ssn) : null }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0]?.message ?? 'Validation failed' }, { status: 400 })
    }
    console.error('Client create failed:', error)
    return NextResponse.json({ error: 'Failed to create client' }, { status: 500 })
  }
}
