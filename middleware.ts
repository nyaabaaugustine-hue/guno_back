import { withAuth } from 'next-auth/middleware'

export default withAuth({
  pages: {
    signIn: '/auth/signin',
  },
})

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
