import { NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'
import bcrypt from 'bcryptjs'
import { db } from '@/db'
import { users } from '@/db/schema'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/auth'
import { z } from 'zod'

const inviteUserSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Valid email is required'),
  role: z.enum(['preparer', 'reviewer', 'firm_admin', 'advisor']),
})

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const parsed = inviteUserSchema.parse(body)

    const passwordHash = await bcrypt.hash('welcome123', 12)

    const s = session as { user: { firmId?: string | null } }
    const firmId = s.user.firmId || 'demo-firm-1'
    const [user] = await db.insert(users).values({
      name: parsed.name,
      email: parsed.email,
      passwordHash,
      role: parsed.role,
      firmId,
      active: true,
    }).returning()

    return NextResponse.json(user, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0]?.message ?? 'Validation failed' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to invite user' }, { status: 500 })
  }
}
