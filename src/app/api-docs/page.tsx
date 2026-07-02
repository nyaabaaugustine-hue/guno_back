

const endpoints = [
  {
    route: 'POST /api/auth/register',
    desc: 'Create a new firm account with admin user.',
    auth: 'None',
    body: '{ name, email, password, firmName }',
    rateLimit: '5/IP per 15min, 3/email per hour',
  },
  {
    route: 'GET|POST /api/auth/[...nextauth]',
    desc: 'NextAuth handler — sign in, session, callback. Uses credentials provider.',
    auth: 'Varies',
    body: 'POST: { email, password }',
  },
  {
    route: 'GET /api/clients',
    desc: 'List all clients for the current firm. SSNs are masked.',
    auth: 'JWT (admin, firm_admin, preparer, reviewer, advisor)',
  },
  {
    route: 'POST /api/clients',
    desc: 'Create a new client. SSN encrypted before storage.',
    auth: 'JWT (admin, firm_admin, preparer)',
    body: '{ firstName, lastName, email?, phone?, ssn?, address?, notes? }',
  },
  {
    route: 'GET /api/clients/[id]',
    desc: 'Get a single client by ID.',
    auth: 'JWT',
  },
]

export default function ApiDocsPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-2 text-3xl font-bold">API Reference</h1>
        <p className="mb-8 text-gray-600">Juno Tax API — all routes are JSON.</p>

        <div className="space-y-4">
          {endpoints.map((ep) => (
            <div key={ep.route} className="rounded-lg border bg-white p-6 shadow-sm">
              <code className="rounded bg-gray-100 px-2 py-1 text-sm font-mono text-blue-700">{ep.route}</code>
              <p className="mt-3 text-gray-700">{ep.desc}</p>

              <div className="mt-3 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-semibold text-gray-500">Auth:</span>{' '}
                  <span className="text-gray-700">{ep.auth}</span>
                </div>
                {'body' in ep && ep.body && (
                  <div>
                    <span className="font-semibold text-gray-500">Body:</span>{' '}
                    <code className="text-gray-700">{ep.body}</code>
                  </div>
                )}
                {'rateLimit' in ep && ep.rateLimit && (
                  <div>
                    <span className="font-semibold text-gray-500">Rate limit:</span>{' '}
                    <span className="text-gray-700">{ep.rateLimit}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-800">
          <strong>Note:</strong> All authenticated routes require <code className="rounded bg-yellow-100 px-1">Authorization: Bearer &lt;token&gt;</code> header or session cookie.
        </div>
      </div>
    </div>
  )
}
