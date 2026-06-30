import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { db } from '@/db'
import { users, firms } from '@/db/schema'
import { eq } from 'drizzle-orm'

export async function POST(req: Request) {
  try {
    const { name, email, password, firmName } = await req.json()

    if (!name || !email || !password || !firmName) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 })
    }

    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 })
    }

    const existing = await db.query.users.findFirst({ where: eq(users.email, email) })
    if (existing) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 409 })
    }

    const passwordHash = await bcrypt.hash(password, 12)

    const slug = firmName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '-' + Math.random().toString(36).slice(2, 6)

    const [firm] = await db.insert(firms).values({
      name: firmName,
      slug,
    }).returning()

    await db.insert(users).values({
      name,
      email,
      passwordHash,
      firmId: firm.id,
      role: 'firm_admin',
    })

    return NextResponse.json({ success: true }, { status: 201 })
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
