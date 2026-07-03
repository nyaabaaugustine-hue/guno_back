import { getToken } from 'next-auth/jwt'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export default async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })

  if (!token) {
    const signinUrl = new URL('/auth/signin', req.url)
    signinUrl.searchParams.set('callbackUrl', req.nextUrl.pathname)
    return NextResponse.redirect(signinUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/preparer/:path*',
    '/reviewer/:path*',
    '/assistant/:path*',
    '/advisor/:path*',
    '/clients/:path*',
    '/organization/:path*',
    '/settings/:path*',
    '/tips-limits/:path*',
    '/returns/:path*',
    '/documents/:path*',
  ],
}
