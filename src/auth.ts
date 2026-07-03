import type { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { db } from '@/db'
import { users } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { rateLimitByEmail } from '@/lib/rate-limit'

// Demo users for testing without a database
const DEMO_USERS = [
  {
    id: 'demo-1',
    email: 'admin@xainhotel.com',
    password: 'password123',
    name: 'Augustine Nyaaba',
    role: 'Org Admin',
    firmId: 'demo-firm-1',
  },
  {
    id: 'demo-2',
    email: 'preparer@demo.com',
    password: 'password123',
    name: 'Jane Doe',
    role: 'Preparer',
    firmId: 'demo-firm-1',
  },
  {
    id: 'demo-3',
    email: 'reviewer@demo.com',
    password: 'password123',
    name: 'Mike Ross',
    role: 'Reviewer',
    firmId: 'demo-firm-1',
  },
]

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      name: string
      role: string
      firmId: string | null
    }
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        // Brute-force protection: 10 attempts per email per 15 minutes.
        // (/api/auth/register already rate-limits account creation — this
        // was the one auth entry point with no attempt limit at all.)
        const limit = rateLimitByEmail(credentials.email, 10, 15 * 60 * 1000)
        if (!limit.allowed) {
          throw new Error('Too many sign-in attempts. Please try again in a few minutes.')
        }

        // Demo users — enabled in dev by default, also in prod when DEMO_MODE=true
        if (process.env.NODE_ENV !== 'production' || process.env.DEMO_MODE === 'true') {
          const demoUser = DEMO_USERS.find(
            (u) => u.email === credentials.email && u.password === credentials.password
          )
          if (demoUser) {
            return {
              id: demoUser.id,
              email: demoUser.email,
              name: demoUser.name,
              role: demoUser.role,
              firmId: demoUser.firmId,
            }
          }
        }

        // Fall back to database lookup
        try {
          const user = await db.query.users.findFirst({
            where: eq(users.email, credentials.email),
          })

          if (!user || !user.active) return null

          const valid = await bcrypt.compare(credentials.password, user.passwordHash)
          if (!valid) return null

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            firmId: user.firmId,
          }
        } catch (error) {
          console.error('Auth database lookup failed:', error)
          return null
        }
      },
    }),
  ],
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/auth/signin',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = (user as any).role
        token.firmId = (user as any).firmId
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
        session.user.firmId = token.firmId as string | null
      }
      return session
    },
  },
}
