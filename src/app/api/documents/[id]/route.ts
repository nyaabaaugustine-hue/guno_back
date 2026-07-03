import { NextResponse } from 'next/server'
import { db } from '@/db'
import { documents, clients } from '@/db/schema'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/auth'
import { and, eq, sql } from 'drizzle-orm'
import { z } from 'zod'
import { getFirmId, firmRequiredResponse } from '@/lib/tenant'

const VALID_DOCUMENT_TYPES = ['w2', '1099', 'k1', 'brokerage', 'other'] as const
const VALID_DOCUMENT_STATUSES = ['uploaded', 'processing', 'extracted', 'verified', 'error'] as const

const updateDocumentSchema = z.object({
  documentType: z.enum(VALID_DOCUMENT_TYPES).optional(),
  status: z.enum(VALID_DOCUMENT_STATUSES).optional(),
  extractedData: z.record(z.any()).optional(),
})

async function getDocument(firmId: string, id: string) {
  const results = await db
    .select({
      id: documents.id,
      clientId: documents.clientId,
      firmId: documents.firmId,
      uploadedById: documents.uploadedById,
      filename: documents.filename,
      originalName: documents.originalName,
      fileSize: documents.fileSize,
      mimeType: documents.mimeType,
      documentType: documents.documentType,
      status: documents.status,
      extractedData: documents.extractedData,
      pages: documents.pages,
      createdAt: documents.createdAt,
      updatedAt: documents.updatedAt,
      clientName: sql<string>`CONCAT(${clients.firstName}, ' ', ${clients.lastName})`,
    })
    .from(documents)
    .leftJoin(clients, eq(documents.clientId, clients.id))
    .where(and(eq(documents.id, id), eq(documents.firmId, firmId)))
    .limit(1)
  return results[0]
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
    const doc = await getDocument(firmId, id)
    if (!doc) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 })
    }
    return NextResponse.json(doc)
  } catch (error) {
    console.error('Document fetch failed:', error)
    return NextResponse.json({ error: 'Failed to load document' }, { status: 500 })
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
    const doc = await getDocument(firmId, id)
    if (!doc) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 })
    }

    const body = await request.json()
    const parsed = updateDocumentSchema.parse(body)

    const updateData: Record<string, any> = { updatedAt: new Date() }
    if (parsed.documentType !== undefined) updateData.documentType = parsed.documentType
    if (parsed.status !== undefined) updateData.status = parsed.status
    if (parsed.extractedData !== undefined) updateData.extractedData = parsed.extractedData

    const [updated] = await db
      .update(documents)
      .set(updateData)
      .where(and(eq(documents.id, id), eq(documents.firmId, firmId)))
      .returning()

    return NextResponse.json(updated)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0]?.message ?? 'Validation failed' }, { status: 400 })
    }
    console.error('Document update failed:', error)
    return NextResponse.json({ error: 'Failed to update document' }, { status: 500 })
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
    const [doc] = await db
      .select({ id: documents.id })
      .from(documents)
      .where(and(eq(documents.id, id), eq(documents.firmId, firmId)))
      .limit(1)

    if (!doc) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 })
    }

    await db
      .delete(documents)
      .where(and(eq(documents.id, id), eq(documents.firmId, firmId)))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Document delete failed:', error)
    return NextResponse.json({ error: 'Failed to delete document' }, { status: 500 })
  }
}
