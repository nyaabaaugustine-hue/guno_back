import { getToken } from 'next-auth/jwt'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function proxy(req: NextRequest) {
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  })

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
    '/clients/:path*',
    '/returns/:path*',
    '/documents/:path*',
    '/preparer/:path*',
    '/reviewer/:path*',
    '/advisor/:path*',
    '/assistant/:path*',
    '/organization/:path*',
    '/settings/:path*',
    '/tips-limits/:path*',
  ],
}
