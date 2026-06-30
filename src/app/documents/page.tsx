import { Upload, FileText, Search } from 'lucide-react'

const sampleDocs = [
  { client: 'Acme Corp', name: 'W-2_2025_Acme.pdf', type: 'W-2', size: '245 KB', status: 'Extracted', date: '2h ago' },
  { client: 'Bob Smith', name: '1099-INT_Bob_Smith.pdf', type: '1099-INT', size: '180 KB', status: 'Processing', date: '5h ago' },
  { client: 'TechStart Inc', name: 'K-1_2025_TechStart.pdf', type: 'K-1', size: '420 KB', status: 'Uploaded', date: '1d ago' },
]

export default function DocumentsPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-display font-bold text-dark-900">Documents</h1>
          <p className="text-dark-500 text-sm mt-1">Upload and manage client documents</p>
        </div>
        <button className="btn btn-primary">
          <Upload className="w-4 h-4" />
          Upload Documents
        </button>
      </div>

      <div className="card overflow-hidden">
        <div className="flex items-center gap-2 p-4 border-b border-dark-100">
          <Search className="w-4 h-4 text-dark-400" />
          <input type="text" placeholder="Search documents..." className="flex-1 bg-transparent border-none outline-none text-sm text-dark-900 placeholder-dark-400" />
        </div>
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
              {sampleDocs.map((d) => (
                <tr key={d.name} className="hover:bg-dark-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-dark-400" />
                      <span className="text-sm font-medium text-dark-900">{d.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-dark-600">{d.client}</td>
                  <td className="px-6 py-4 text-sm text-dark-600">{d.type}</td>
                  <td className="px-6 py-4 text-sm text-dark-600">{d.size}</td>
                  <td className="px-6 py-4">
                    <span className={`badge ${
                      d.status === 'Extracted' ? 'badge-green' :
                      d.status === 'Processing' ? 'badge-yellow' :
                      'badge'
                    }`}>{d.status}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-dark-500">{d.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
