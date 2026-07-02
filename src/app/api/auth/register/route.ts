import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { db } from '@/db'
import { users, firms } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { registerSchema } from '@/lib/validation'
import { rateLimitByIp, rateLimitByEmail } from '@/lib/rate-limit'

export async function POST(req: Request) {
  try {
    // Rate limiting: 5 registration attempts per IP per 15 minutes
    const ipLimit = rateLimitByIp(req, 5, 15 * 60 * 1000)
    if (!ipLimit.allowed) {
      return NextResponse.json(
        { error: 'Too many attempts. Please try again later.' },
        {
          status: 429,
          headers: {
            'Retry-After': String(Math.ceil((ipLimit.resetAt - Date.now()) / 1000)),
          },
        }
      )
    }

    const body = await req.json()

    // Validate with Zod
    const parsed = registerSchema.safeParse(body)
    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors
      const firstError = Object.values(fieldErrors).flat()[0] || 'Invalid input'
      return NextResponse.json({ error: firstError }, { status: 400 })
    }

    const { name, email, password, firmName } = parsed.data

    // Rate limiting: 3 registration attempts per email per hour
    const emailLimit = rateLimitByEmail(email, 3, 60 * 60 * 1000)
    if (!emailLimit.allowed) {
      return NextResponse.json({ error: 'Too many attempts. Please try again later.' }, { status: 429 })
    }

    // Check if email already exists (generic message to prevent enumeration)
    const existing = await db.query.users.findFirst({ where: eq(users.email, email.toLowerCase()) })
    if (existing) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
    }

    const passwordHash = await bcrypt.hash(password, 12)

    const slug =
      firmName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '') +
      '-' +
      Math.random().toString(36).slice(2, 6)

    const [firm] = await db
      .insert(firms)
      .values({ name: firmName, slug })
      .returning()

    if (!firm) {
      throw new Error('Failed to create firm')
    }

    await db.insert(users).values({
      name,
      email: email.toLowerCase(),
      passwordHash,
      firmId: firm.id,
      role: 'firm_admin',
    })

    return NextResponse.json({ success: true }, { status: 201 })
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
  }
}
