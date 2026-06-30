import { Plus } from 'lucide-react'

const sampleReturns = [
  { id: '1', client: 'Acme Corp', form: '1120', year: '2025', preparer: 'Jane D.', reviewer: '—', status: 'In Review', updated: '2h ago' },
  { id: '2', client: 'Bob Smith', form: '1040', year: '2025', preparer: 'Jane D.', reviewer: 'Mike R.', status: 'Completed', updated: '5h ago' },
  { id: '3', client: 'TechStart Inc', form: '1065', year: '2025', preparer: 'Mike R.', reviewer: '—', status: 'Processing', updated: '1d ago' },
  { id: '4', client: 'Sarah Johnson', form: '1040', year: '2024', preparer: 'Jane D.', reviewer: '—', status: 'Draft', updated: '2d ago' },
  { id: '5', client: 'Global Partners', form: '1120-S', year: '2025', preparer: 'Mike R.', reviewer: 'Jane D.', status: 'In Review', updated: '2d ago' },
]

export default function ReturnsPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-display font-bold text-dark-900">Tax Returns</h1>
          <p className="text-dark-500 text-sm mt-1">Create, review, and manage tax returns</p>
        </div>
        <button className="btn btn-primary">
          <Plus className="w-4 h-4" />
          New Return
        </button>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-dark-100 bg-dark-50">
                <th className="text-left px-6 py-3 text-xs font-medium text-dark-500 uppercase tracking-wider">Client</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-dark-500 uppercase tracking-wider">Form</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-dark-500 uppercase tracking-wider">Year</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-dark-500 uppercase tracking-wider">Preparer</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-dark-500 uppercase tracking-wider">Reviewer</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-dark-500 uppercase tracking-wider">Status</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-dark-500 uppercase tracking-wider">Updated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-50">
              {sampleReturns.map((r) => (
                <tr key={r.id} className="hover:bg-dark-50/50 transition-colors cursor-pointer">
                  <td className="px-6 py-4 text-sm font-medium text-juno-dark-green hover:underline">{r.client}</td>
                  <td className="px-6 py-4 text-sm text-dark-600">{r.form}</td>
                  <td className="px-6 py-4 text-sm text-dark-600">{r.year}</td>
                  <td className="px-6 py-4 text-sm text-dark-600">{r.preparer}</td>
                  <td className="px-6 py-4 text-sm text-dark-600">{r.reviewer}</td>
                  <td className="px-6 py-4">
                    <span className={`badge ${
                      r.status === 'Completed' ? 'badge-green' :
                      r.status === 'In Review' ? 'badge-blue' :
                      r.status === 'Processing' ? 'badge-yellow' :
                      'badge'
                    }`}>{r.status}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-dark-500">{r.updated}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
