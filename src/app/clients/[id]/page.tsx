'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import Icon from '@/components/Icon'

interface ClientData {
  id: string
  firstName: string
  lastName: string
  email: string | null
  phone: string | null
  ssn: string | null
  address: string | null
  notes: string | null
  returnCount: number
  documentCount: number
  createdAt: string
}

export default function ClientDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [client, setClient] = useState<ClientData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadClient = async () => {
      if (!params?.id) return
      try {
        const res = await fetch(`/api/clients/${params.id}`)
        if (!res.ok) {
          setError('Client not found')
          return
        }
        const data = await res.json()
        setClient(data)
      } catch {
        setError('Failed to load client')
      } finally {
        setLoading(false)
      }
    }
    loadClient()
  }, [params?.id])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <Icon name="refresh" className="w-5 h-5 text-dark-400 animate-spin" />
      </div>
    )
  }

  if (error || !client) {
    return (
      <div>
        <Link href="/clients" className="inline-flex items-center gap-1 text-sm text-dark-500 hover:text-dark-900 transition-colors mb-6">
          <Icon name="back" className="w-4 h-4" />
          Back to clients
        </Link>
        <div className="card p-8 text-center">
          <p className="text-dark-500">{error || 'Client not found'}</p>
          <Link href="/clients" className="btn btn-primary mt-4 inline-flex">View All Clients</Link>
        </div>
      </div>
    )
  }

  const fullName = `${client.firstName} ${client.lastName}`
  const initials = (client.firstName[0] || '') + (client.lastName[0] || '')
  const createdDate = new Date(client.createdAt).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric'
  })

  return (
    <div>
      <Link href="/clients" className="inline-flex items-center gap-1 text-sm text-dark-500 hover:text-dark-900 transition-colors mb-6">
        <ArrowLeft className="w-4 h-4" />
        Back to clients
      </Link>

      <div className="flex items-start justify-between mb-8">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-juno-dark-green flex items-center justify-center text-white text-sm font-semibold">
              {initials}
            </div>
            <div>
              <h1 className="text-2xl font-display font-bold text-dark-900">{fullName}</h1>
              <p className="text-dark-500 text-sm mt-1">
                {client.email || 'No email'} · {client.phone || 'No phone'}
              </p>
            </div>
          </div>
        </div>
        <span className="badge-green">Active</span>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="card p-6">
            <h2 className="font-semibold text-dark-900 mb-4">
              Recent Returns
              <span className="text-sm font-normal text-dark-400 ml-2">({client.returnCount})</span>
            </h2>
            {client.returnCount > 0 ? (
              <p className="text-sm text-dark-500">{client.returnCount} return(s) on file.</p>
            ) : (
              <p className="text-sm text-dark-500">No tax returns yet. Create one to get started.</p>
            )}
            <button onClick={() => router.push('/preparer')} className="btn btn-primary mt-4">
              New Tax Return
            </button>
          </div>
          <div className="card p-6">
            <h2 className="font-semibold text-dark-900 mb-4">
              Documents
              <span className="text-sm font-normal text-dark-400 ml-2">({client.documentCount})</span>
            </h2>
            {client.documentCount > 0 ? (
              <p className="text-sm text-dark-500">{client.documentCount} document(s) uploaded.</p>
            ) : (
              <p className="text-sm text-dark-500">No documents uploaded yet.</p>
            )}
            <button onClick={() => router.push('/documents')} className="btn btn-secondary mt-4">
              Upload Document
            </button>
          </div>
        </div>
        <div className="space-y-6">
          <div className="card p-6">
            <h2 className="font-semibold text-dark-900 mb-3">Client Details</h2>
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="text-dark-500">Email</dt>
                <dd className="text-dark-900">{client.email || '—'}</dd>
              </div>
              <div>
                <dt className="text-dark-500">Phone</dt>
                <dd className="text-dark-900">{client.phone || '—'}</dd>
              </div>
              {client.address && (
                <div>
                  <dt className="text-dark-500">Address</dt>
                  <dd className="text-dark-900">{client.address}</dd>
                </div>
              )}
              {client.notes && (
                <div>
                  <dt className="text-dark-500">Notes</dt>
                  <dd className="text-dark-900">{client.notes}</dd>
                </div>
              )}
              <div>
                <dt className="text-dark-500">Created</dt>
                <dd className="text-dark-900">{createdDate}</dd>
              </div>
            </dl>
          </div>
          <div className="card p-6">
            <button onClick={() => router.push('/preparer')} className="btn btn-primary w-full">
              New Tax Return
            </button>
            <button onClick={() => router.push('/documents')} className="btn btn-secondary w-full mt-2">
              Upload Document
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
