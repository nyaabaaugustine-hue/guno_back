import Link from 'next/link'
import { Plus } from 'lucide-react'

const sampleClients = [
  { id: '1', name: 'Acme Corporation', email: 'billing@acme.com', phone: '(555) 123-4567', returns: 3, status: 'Active' },
  { id: '2', name: 'Bob Smith', email: 'bob@smith.com', phone: '(555) 234-5678', returns: 1, status: 'Active' },
  { id: '3', name: 'TechStart Inc', email: 'info@techstart.io', phone: '(555) 345-6789', returns: 2, status: 'Active' },
  { id: '4', name: 'Sarah Johnson', email: 'sarah@johnson.com', phone: '(555) 456-7890', returns: 1, status: 'New' },
  { id: '5', name: 'Global Partners LLC', email: 'legal@globalpartners.com', phone: '(555) 567-8901', returns: 5, status: 'Active' },
]

export default function ClientsPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-display font-bold text-dark-900">Clients</h1>
          <p className="text-dark-500 text-sm mt-1">Manage your client roster</p>
        </div>
        <button className="btn btn-primary">
          <Plus className="w-4 h-4" />
          Add Client
        </button>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-dark-100 bg-dark-50">
                <th className="text-left px-6 py-3 text-xs font-medium text-dark-500 uppercase tracking-wider">Client</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-dark-500 uppercase tracking-wider">Email</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-dark-500 uppercase tracking-wider">Phone</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-dark-500 uppercase tracking-wider">Returns</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-dark-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-50">
              {sampleClients.map((c) => (
                <tr key={c.id} className="hover:bg-dark-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <Link href={`/clients/${c.id}`} className="text-sm font-medium text-juno-dark-green hover:underline">{c.name}</Link>
                  </td>
                  <td className="px-6 py-4 text-sm text-dark-600">{c.email}</td>
                  <td className="px-6 py-4 text-sm text-dark-600">{c.phone}</td>
                  <td className="px-6 py-4 text-sm text-dark-600">{c.returns}</td>
                  <td className="px-6 py-4">
                    <span className={`badge ${c.status === 'Active' ? 'badge-green' : 'badge-blue'}`}>{c.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
