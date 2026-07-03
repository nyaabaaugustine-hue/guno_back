import { NextResponse } from 'next/server'
import { db } from '@/db'
import { users } from '@/db/schema'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/auth'
import { and, eq } from 'drizzle-orm'
import { getFirmId, firmRequiredResponse } from '@/lib/tenant'
import { canManageStaff } from '@/lib/rbac'

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const s = session as { user: { id: string; role?: string } }
  if (!canManageStaff(s.user.role)) {
    return NextResponse.json({ error: 'Only admins can manage users' }, { status: 403 })
  }

  const firmId = getFirmId(session)
  if (!firmId) return firmRequiredResponse()

  const { id } = await params

  // Prevent self-deactivation
  if (id === s.user.id) {
    return NextResponse.json({ error: 'You cannot deactivate your own account' }, { status: 400 })
  }

  try {
    const [user] = await db
      .select({ id: users.id, active: users.active })
      .from(users)
      .where(and(eq(users.id, id), eq(users.firmId!, firmId)))
      .limit(1)

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const body = await request.json()
    const newActive = body.active

    if (typeof newActive !== 'boolean') {
      return NextResponse.json({ error: 'active must be a boolean' }, { status: 400 })
    }

    const [updated] = await db
      .update(users)
      .set({ active: newActive, updatedAt: new Date() })
      .where(and(eq(users.id, id), eq(users.firmId!, firmId)))
      .returning({ id: users.id, name: users.name, email: users.email, role: users.role, active: users.active })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('User update failed:', error)
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 })
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

  const s = session as { user: { id: string; role?: string } }
  if (!canManageStaff(s.user.role)) {
    return NextResponse.json({ error: 'Only admins can remove users' }, { status: 403 })
  }

  const firmId = getFirmId(session)
  if (!firmId) return firmRequiredResponse()

  const { id } = await params

  if (id === s.user.id) {
    return NextResponse.json({ error: 'You cannot delete your own account' }, { status: 400 })
  }

  try {
    const [user] = await db
      .select({ id: users.id })
      .from(users)
      .where(and(eq(users.id, id), eq(users.firmId!, firmId)))
      .limit(1)

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    await db
      .delete(users)
      .where(and(eq(users.id, id), eq(users.firmId!, firmId)))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('User delete failed:', error)
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 })
  }
}
