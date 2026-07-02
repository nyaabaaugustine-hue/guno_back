'use client'

import { Book, ChevronRight } from 'lucide-react'

const endpoints = [
  {
    route: 'POST /api/auth/register',
    desc: 'Create a new firm account with admin user.',
    auth: 'None',
    body: '{ name, email, password, firmName }',
    rateLimit: '5/IP per 15min, 3/email per hour',
  },
  {
    route: 'PATCH /api/auth/profile',
    desc: 'Update current user profile (name, email).',
    auth: 'JWT',
    body: '{ firstName?, lastName?, email? }',
  },
  {
    route: 'PATCH /api/auth/password',
    desc: 'Change current user password.',
    auth: 'JWT',
    body: '{ currentPassword, newPassword }',
  },
  {
    route: 'GET /api/clients',
    desc: 'List all clients for the current firm. Falls back to demo data when no DB.',
    auth: 'JWT',
    query: '?search=keyword',
  },
  {
    route: 'POST /api/clients',
    desc: 'Create a new client. SSN encrypted before storage.',
    auth: 'JWT',
    body: '{ firstName, lastName, email?, phone?, tin?, city?, state?, zip? }',
  },
  {
    route: 'GET /api/clients/[id]',
    desc: 'Get a single client by ID with return and document counts.',
    auth: 'JWT',
  },
  {
    route: 'GET /api/returns',
    desc: 'List all tax returns with client and preparer info. Falls back to demo data.',
    auth: 'JWT',
  },
  {
    route: 'POST /api/returns',
    desc: 'Create a new tax return.',
    auth: 'JWT',
    body: '{ clientId, taxYear, returnType, notes? }',
  },
  {
    route: 'GET /api/documents',
    desc: 'List all documents with client info. Falls back to demo data.',
    auth: 'JWT',
  },
  {
    route: 'POST /api/documents',
    desc: 'Upload a document (multipart/form-data).',
    auth: 'JWT',
    body: 'FormData: { file, clientId, documentType? }',
  },
  {
    route: 'GET /api/users',
    desc: 'List all team members for the current firm.',
    auth: 'JWT',
  },
  {
    route: 'POST /api/users/invite',
    desc: 'Invite a new team member with default password welcome123.',
    auth: 'JWT (firm_admin)',
    body: '{ name, email, role }',
  },
  {
    route: 'GET /api/dashboard/summary',
    desc: 'Aggregated dashboard data: stats, returns by status, recent activity, deadlines.',
    auth: 'JWT',
  },
  {
    route: 'POST /api/ai/query',
    desc: 'Natural language query against your practice data. Uses Groq AI for intent classification + response generation.',
    auth: 'JWT',
    body: '{ query }',
    rateLimit: '20/user per minute',
  },
]

export default function ApiDocsPage() {
  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="flex items-center gap-2 bg-juno-light-green text-juno-dark-green px-3 py-1.5 rounded-lg text-sm font-medium">
          <span className="w-2 h-2 bg-juno-dark-green rounded-full" />
          API Reference
        </div>
      </div>

      <h1 className="text-2xl font-display font-bold text-dark-900 mb-2">API Reference</h1>
      <p className="text-dark-500 text-sm mb-8">
        All routes return JSON. Authenticated routes require session cookie or Authorization header.
      </p>

      <div className="space-y-4">
        {endpoints.map((ep) => (
          <div key={ep.route} className="card p-5 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <code className="text-xs font-mono font-semibold text-juno-dark-green bg-juno-light-green px-2 py-1 rounded-md">
                  {ep.route}
                </code>
                <p className="mt-2 text-sm text-dark-700">{ep.desc}</p>
                <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-xs text-dark-500">
                  <div>
                    <span className="font-semibold text-dark-400 uppercase tracking-wider">Auth:</span>{' '}
                    {ep.auth}
                  </div>
                  {ep.body && (
                    <div>
                      <span className="font-semibold text-dark-400 uppercase tracking-wider">Body:</span>{' '}
                      <code className="text-dark-600">{ep.body}</code>
                    </div>
                  )}
                  {ep.query && (
                    <div>
                      <span className="font-semibold text-dark-400 uppercase tracking-wider">Query:</span>{' '}
                      <code className="text-dark-600">{ep.query}</code>
                    </div>
                  )}
                  {ep.rateLimit && (
                    <div>
                      <span className="font-semibold text-dark-400 uppercase tracking-wider">Rate limit:</span>{' '}
                      {ep.rateLimit}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
