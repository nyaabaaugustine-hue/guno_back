/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === 'production'

// upgrade-insecure-requests only makes sense over real TLS. In dev
// (plain http://localhost), it causes the browser to silently rewrite
// same-origin fetches (e.g. next-auth's /api/auth/session call) to
// https://, which fails with a generic "Failed to fetch" since the dev
// server has no TLS listener.
const cspHeader = `
  default-src 'self';
  script-src 'self' 'unsafe-inline' 'unsafe-eval';
  style-src 'self' 'unsafe-inline';
  img-src 'self' blob: data:;
  font-src 'self';
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  frame-ancestors 'none';
  ${isProd ? 'block-all-mixed-content;\n  upgrade-insecure-requests;' : ''}
`

const nextConfig = {
  serverExternalPackages: [],
  outputFileTracingExcludes: {
    '/*': ['./middleware.js'],
  },
  turbopack: {
    root: process.cwd(),
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: cspHeader.replace(/\n/g, ' ').trim(),
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
          },
          // HSTS forces https for this origin for the next 2 years —
          // only ever send this in production, over real TLS.
          ...(isProd
            ? [
                {
                  key: 'Strict-Transport-Security',
                  value: 'max-age=63072000; includeSubDomains; preload',
                },
              ]
            : []),
        ],
      },
    ]
  },
}

module.exports = nextConfig
