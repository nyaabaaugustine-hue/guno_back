import { NextResponse } from 'next/server'
import { db } from '@/db'
import { users } from '@/db/schema'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/auth'
import { eq } from 'drizzle-orm'

const DEMO_MEMBERS = [
  { id: '1', initials: 'AN', name: 'Augustine Nyaaba', email: 'nyaabaaugustine@gmail.com', role: 'Org Admin', status: 'active' },
  { id: '2', initials: 'JD', name: 'Jane Doe', email: 'jane@firm.com', role: 'Preparer', status: 'active' },
  { id: '3', initials: 'MR', name: 'Mike Ross', email: 'mike@firm.com', role: 'Reviewer', status: 'active' },
]

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const s = session as { user: { firmId?: string | null } }
    const firmId = s.user.firmId || 'demo-firm-1'

    if (firmId === 'demo-firm-1') {
      return NextResponse.json(DEMO_MEMBERS)
    }

    const results = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        status: users.active,
      })
      .from(users)
      .where(eq(users.firmId!, firmId as any))

    if (results.length > 0) {
      return NextResponse.json(results.map(u => ({
        id: u.id,
        initials: u.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2),
        name: u.name,
        email: u.email,
        role: u.role.charAt(0).toUpperCase() + u.role.slice(1).replace('_', ' '),
        status: u.status ? 'active' : 'inactive',
      })))
    }
  } catch {}

  return NextResponse.json(DEMO_MEMBERS)
}
