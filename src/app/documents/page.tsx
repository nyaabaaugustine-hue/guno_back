'use client'

import { useState, useEffect, useRef } from 'react'
import Icon from '@/components/Icon'

interface Document {
  id: string
  client: string
  name: string
  type: string
  size: string
  status: string
  date: string
}

export default function DocumentsPage() {
  const [docs, setDocs] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const loadDocs = async () => {
      try {
        const res = await fetch('/api/documents')
        if (res.ok) {
          const data = await res.json()
          setDocs(data)
        }
      } catch {} finally {
        setLoading(false)
      }
    }
    loadDocs()
  }, [])

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    const formData = new FormData()
    formData.append('file', file)
    formData.append('clientId', 'demo')

    try {
      const res = await fetch('/api/documents', {
        method: 'POST',
        body: formData,
      })
      if (res.ok) {
        // Reload the document list
        const refresh = await fetch('/api/documents')
        if (refresh.ok) {
          setDocs(await refresh.json())
        }
      }
    } catch {} finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const filtered = docs.filter((d) =>
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    d.client.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-display font-bold text-dark-900">Documents</h1>
          <p className="text-dark-500 text-sm mt-1">Upload and manage client documents</p>
        </div>
        <div>
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={handleUpload}
            accept=".pdf,.jpg,.jpeg,.png"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="btn btn-primary"
          >
            {uploading ? (
              <><Icon name="refresh" className="w-4 h-4 animate-spin" /> Uploading...</>
            ) : (
              <><Icon name="upload" className="w-4 h-4" /> Upload Documents</>
            )}
          </button>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="flex items-center gap-2 p-4 border-b border-dark-100">
          <Icon name="search" className="w-4 h-4 text-dark-400" />
          <input
            type="text"
            placeholder="Search documents..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-transparent border-none outline-none text-sm text-dark-900 placeholder-dark-400"
          />
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Icon name="refresh" className="w-5 h-5 text-dark-400 animate-spin" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-dark-100 bg-dark-50">
                  <th className="text-left px-6 py-3 text-xs font-medium text-dark-500 uppercase tracking-wider">Name</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-dark-500 uppercase tracking-wider">Client</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-dark-500 uppercase tracking-wider">Type</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-dark-500 uppercase tracking-wider">Size</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-dark-500 uppercase tracking-wider">Status</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-dark-500 uppercase tracking-wider">Uploaded</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-50">
                {filtered.map((d) => (
                  <tr key={d.id || d.name} className="hover:bg-dark-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Icon name="document" className="w-4 h-4 text-dark-400" />
                        <span className="text-sm font-medium text-dark-900">{d.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-dark-600">{d.client}</td>
                    <td className="px-6 py-4 text-sm text-dark-600">{d.type}</td>
                    <td className="px-6 py-4 text-sm text-dark-600">{d.size}</td>
                    <td className="px-6 py-4">
                      <span className={`badge ${
                        d.status === 'Extracted' || d.status === 'verified' ? 'badge-green' :
                        d.status === 'Processing' || d.status === 'processing' ? 'badge-yellow' :
                        'badge'
                      }`}>{d.status}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-dark-500">{d.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
