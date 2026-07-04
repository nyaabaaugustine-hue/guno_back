'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Icon from '@/components/Icon'

interface ReturnDetail {
  id: string
  clientId: string
  clientName: string
  clientEmail: string | null
  formCode: string
  taxYear: number
  preparerId: string | null
  preparerName: string | null
  reviewerId: string | null
  reviewerName: string | null
  status: string
  notes: string | null
}

function statusBadgeClass(status: string) {
  switch (status) {
    case 'completed': return 'badge-green'
    case 'in_review': return 'badge-blue'
    case 'processing': return 'badge-yellow'
    default: return 'badge'
  }
}

function statusLabel(status: string) {
  return status
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

export default function ReturnDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { data: session } = useSession()
  const role = (session?.user?.role || '').toLowerCase().replace(' ', '_')

  const [ret, setRet] = useState<ReturnDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/returns/${id}`)
      if (res.status === 404) {
        setNotFound(true)
        return
      }
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error || 'Failed to load return')
      }
      const data = await res.json()
      setRet(data)
      setNotes(data.notes || '')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load return')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    load()
  }, [load])

  const patch = async (body: Record<string, unknown>) => {
    setSaving(true)
    setError(null)
    try {
      const res = await fetch(`/api/returns/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        const respBody = await res.json().catch(() => ({}))
        throw new Error(respBody.error || 'Update failed')
      }
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Update failed')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Icon name="refresh" className="w-5 h-5 text-dark-400 animate-spin" />
      </div>
    )
  }

  if (notFound || !ret) {
    return (
      <div className="text-center py-24">
        <p className="text-sm text-dark-500 mb-4">This return doesn&apos;t exist, or you don&apos;t have access to it.</p>
        <button onClick={() => router.push('/returns')} className="btn btn-secondary">
          <Icon name="back" className="w-4 h-4" />
          Back to Returns
        </button>
      </div>
    )
  }

  const canSubmitForReview = ret.status === 'draft' && ['preparer', 'firm_admin', 'admin'].includes(role)
  const canApprove = ret.status === 'in_review' && ['reviewer', 'firm_admin', 'admin'].includes(role)
  const canSendBack = ret.status === 'in_review' && ['reviewer', 'firm_admin', 'admin'].includes(role)
  const notesChanged = notes !== (ret.notes || '')

  return (
    <div className="max-w-3xl">
      <button
        onClick={() => router.push('/returns')}
        className="inline-flex items-center gap-1.5 text-sm text-dark-500 hover:text-dark-800 mb-6"
      >
        <Icon name="back" className="w-4 h-4" />
        Back to Returns
      </button>

      <div className="card p-6 mb-6">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-xl font-display font-bold text-dark-900">{ret.clientName}</h1>
            {ret.clientEmail && <p className="text-sm text-dark-500 mt-0.5">{ret.clientEmail}</p>}
          </div>
          <span className={`badge ${statusBadgeClass(ret.status)}`}>{statusLabel(ret.status)}</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-dark-100">
          <div>
            <p className="text-xs text-dark-400 uppercase tracking-wide mb-1">Tax Year</p>
            <p className="text-sm font-medium text-dark-900">{ret.taxYear}</p>
          </div>
          <div>
            <p className="text-xs text-dark-400 uppercase tracking-wide mb-1">Form</p>
            <code className="text-xs font-mono font-medium text-dark-600 bg-dark-50 px-2 py-1 rounded-md">{ret.formCode}</code>
          </div>
          <div>
            <p className="text-xs text-dark-400 uppercase tracking-wide mb-1">Preparer</p>
            <p className="text-sm font-medium text-dark-900">{ret.preparerName || 'Unassigned'}</p>
          </div>
          <div>
            <p className="text-xs text-dark-400 uppercase tracking-wide mb-1">Reviewer</p>
            <p className="text-sm font-medium text-dark-900">{ret.reviewerName || 'Unassigned'}</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-4 text-sm text-red-600 bg-red-50 px-3 py-2.5 rounded-lg">{error}</div>
      )}

      <div className="card p-6 mb-6">
        <h2 className="text-sm font-semibold text-dark-900 mb-3">Notes</h2>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={4}
          placeholder="Add notes for the preparer or reviewer..."
          className="w-full rounded-xl border-2 border-dark-100 px-3 py-2.5 text-sm text-dark-900 focus:border-juno-accent focus:outline-none resize-none"
        />
        <div className="flex justify-end mt-3">
          <button
            onClick={() => patch({ notes })}
            disabled={!notesChanged || saving}
            className="btn btn-secondary"
          >
            {saving ? 'Saving...' : 'Save Notes'}
          </button>
        </div>
      </div>

      <div className="card p-6">
        <h2 className="text-sm font-semibold text-dark-900 mb-4">Actions</h2>
        <div className="flex flex-wrap gap-3">
          {canSubmitForReview && (
            <button onClick={() => patch({ status: 'in_review' })} disabled={saving} className="btn btn-primary">
              <Icon name="send" className="w-4 h-4" />
              Submit for Review
            </button>
          )}
          {canApprove && (
            <button onClick={() => patch({ status: 'completed' })} disabled={saving} className="btn btn-primary">
              <Icon name="check" className="w-4 h-4" />
              Approve &amp; Complete
            </button>
          )}
          {canSendBack && (
            <button onClick={() => patch({ status: 'draft' })} disabled={saving} className="btn btn-secondary">
              <Icon name="back" className="w-4 h-4" />
              Send Back for Revisions
            </button>
          )}
          {!canSubmitForReview && !canApprove && !canSendBack && (
            <p className="text-sm text-dark-400">
              {ret.status === 'completed'
                ? 'This return is complete — no further actions available.'
                : "You don't have permission to change this return's status."}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
