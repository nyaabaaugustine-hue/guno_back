import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function ClientDetailPage() {
  return (
    <div>
      <Link href="/clients" className="inline-flex items-center gap-1 text-sm text-dark-500 hover:text-dark-900 transition-colors mb-6">
        <ArrowLeft className="w-4 h-4" />
        Back to clients
      </Link>

      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-display font-bold text-dark-900">Acme Corporation</h1>
          <p className="text-dark-500 text-sm mt-1">billing@acme.com · (555) 123-4567</p>
        </div>
        <span className="badge-green">Active</span>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="card p-6">
            <h2 className="font-semibold text-dark-900 mb-4">Recent Returns</h2>
            <p className="text-sm text-dark-500">No tax returns yet. Create one to get started.</p>
          </div>
          <div className="card p-6">
            <h2 className="font-semibold text-dark-900 mb-4">Documents</h2>
            <p className="text-sm text-dark-500">No documents uploaded yet.</p>
          </div>
        </div>
        <div className="space-y-6">
          <div className="card p-6">
            <h2 className="font-semibold text-dark-900 mb-3">Client Details</h2>
            <dl className="space-y-3 text-sm">
              <div><dt className="text-dark-500">Email</dt><dd className="text-dark-900">billing@acme.com</dd></div>
              <div><dt className="text-dark-500">Phone</dt><dd className="text-dark-900">(555) 123-4567</dd></div>
              <div><dt className="text-dark-500">Created</dt><dd className="text-dark-900">Jan 15, 2026</dd></div>
            </dl>
          </div>
          <div className="card p-6">
            <button className="btn btn-primary w-full">New Tax Return</button>
            <button className="btn btn-secondary w-full mt-2">Upload Document</button>
          </div>
        </div>
      </div>
    </div>
  )
}
