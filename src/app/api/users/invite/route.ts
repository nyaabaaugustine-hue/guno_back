import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { db } from '@/db'
import { users, companyAssignments } from '@/db/schema'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/auth'
import { z } from 'zod'
import { canManageStaff } from '@/lib/rbac'

const inviteUserSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Valid email is required'),
  role: z.enum(['preparer', 'reviewer', 'firm_admin', 'advisor', 'company_agent']),
  // Required when role === 'company_agent': which companies this agent can access.
  companyIds: z.array(z.string()).optional(),
})

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const s = session as { user: { id: string; firmId?: string | null; role?: string } }
  if (!canManageStaff(s.user.role)) {
    return NextResponse.json({ error: 'Only admins can invite staff' }, { status: 403 })
  }

  try {
    const body = await request.json()
    const parsed = inviteUserSchema.parse(body)

    if (parsed.role === 'company_agent' && (!parsed.companyIds || parsed.companyIds.length === 0)) {
      return NextResponse.json(
        { error: 'Select at least one company for a Company Agent' },
        { status: 400 }
      )
    }

    const passwordHash = await bcrypt.hash('welcome123', 12)

    const firmId = s.user.firmId || 'demo-firm-1'
    const [user] = await db.insert(users).values({
      name: parsed.name,
      email: parsed.email,
      passwordHash,
      role: parsed.role,
      firmId,
      active: true,
    }).returning()

    if (parsed.role === 'company_agent' && parsed.companyIds?.length && firmId !== 'demo-firm-1') {
      await db.insert(companyAssignments).values(
        parsed.companyIds.map((companyId) => ({
          companyId,
          userId: user.id,
          assignedById: s.user.id,
        }))
      )
    }

    return NextResponse.json(user, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0]?.message ?? 'Validation failed' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to invite user' }, { status: 500 })
  }
}
