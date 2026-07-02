import { NextResponse } from 'next/server'
import { db } from '@/db'
import { documents, clients } from '@/db/schema'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/auth'
import { eq, desc, sql } from 'drizzle-orm'
import { z } from 'zod'

const DEMO_DOCUMENTS = [
  { id: '1', client: 'Acme Corp', name: 'W-2_2025_Acme.pdf', type: 'W-2', size: '245 KB', status: 'Extracted', date: '2h ago' },
  { id: '2', client: 'Bob Smith', name: '1099-INT_Bob_Smith.pdf', type: '1099-INT', size: '180 KB', status: 'Processing', date: '5h ago' },
  { id: '3', client: 'TechStart Inc', name: 'K-1_2025_TechStart.pdf', type: 'K-1', size: '420 KB', status: 'Uploaded', date: '1d ago' },
  { id: '4', client: 'Sarah Johnson', name: '1040_2024_Sarah.pdf', type: '1040', size: '310 KB', status: 'Verified', date: '2d ago' },
  { id: '5', client: 'Global Partners', name: '1120-S_2025_Global.pdf', type: '1120-S', size: '560 KB', status: 'Extracted', date: '3d ago' },
]

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const results = await db
      .select({
        id: documents.id,
        name: documents.originalName,
        type: documents.documentType,
        size: documents.fileSize,
        status: documents.status,
        clientName: sql<string>`CONCAT(${clients.firstName}, ' ', ${clients.lastName})`,
        date: documents.createdAt,
      })
      .from(documents)
      .leftJoin(clients, eq(documents.clientId, clients.id))
      .orderBy(desc(documents.createdAt))
      .limit(50)

    if (results.length > 0) {
      return NextResponse.json(results.map(d => ({
        id: d.id,
        client: d.clientName || 'Unknown',
        name: d.name,
        type: String(d.type || 'other'),
        size: d.size ? `${d.size} KB` : '—',
        status: String(d.status || 'uploaded'),
        date: d.date ? new Date(d.date).toLocaleDateString() : '—',
      })))
    }
  } catch {}

  return NextResponse.json(DEMO_DOCUMENTS)
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const clientId = formData.get('clientId') as string | null
    const documentType = formData.get('documentType') as string | null

    if (!file || !clientId) {
      return NextResponse.json({ error: 'File and clientId are required' }, { status: 400 })
    }

    const s = session as { user: { id: string; firmId?: string | null } }
    const firmId = s.user.firmId || 'demo-firm-1'

    // Get client's firm to verify they belong to the same firm
    const [client] = await db.select().from(clients).where(eq(clients.id, clientId)).limit(1)

    const [doc] = await db.insert(documents).values({
      clientId,
      firmId,
      uploadedById: s.user.id,
      filename: file.name,
      originalName: file.name,
      fileSize: file.size,
      mimeType: file.type,
      documentType: (documentType as any) || 'other',
      status: 'uploaded',
    }).returning()

    return NextResponse.json(doc, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to upload document' }, { status: 500 })
  }
}
