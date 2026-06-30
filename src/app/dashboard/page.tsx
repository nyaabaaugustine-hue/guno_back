import { DollarSign, Users, FileText, TrendingUp } from 'lucide-react'

const stats = [
  { label: 'Total Returns', value: '147', change: '+12%', icon: FileText, color: 'text-blue-600 bg-blue-100' },
  { label: 'Active Clients', value: '89', change: '+8%', icon: Users, color: 'text-juno-dark-green bg-juno-light-green' },
  { label: 'Avg. Processing Time', value: '4.2h', change: '-32%', icon: TrendingUp, color: 'text-purple-600 bg-purple-100' },
  { label: 'Revenue (MTD)', value: '$7,203', change: '+18%', icon: DollarSign, color: 'text-green-600 bg-green-100' },
]

const recentReturns = [
  { client: 'Acme Corp', form: '1120', preparer: 'Jane D.', status: 'In Review', date: '2h ago' },
  { client: 'Bob Smith', form: '1040', preparer: 'Jane D.', status: 'Completed', date: '5h ago' },
  { client: 'TechStart Inc', form: '1065', preparer: 'Mike R.', status: 'Processing', date: '1d ago' },
  { client: 'Sarah Johnson', form: '1040', preparer: 'Jane D.', status: 'Draft', date: '2d ago' },
  { client: 'Global Partners', form: '1120-S', preparer: 'Mike R.', status: 'In Review', date: '2d ago' },
]

export default function DashboardPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-display font-bold text-dark-900">Dashboard</h1>
        <p className="text-dark-500 text-sm mt-1">Welcome back. Here&apos;s your practice at a glance.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((s) => (
          <div key={s.label} className="card p-5">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${s.color}`}>
                <s.icon className="w-5 h-5" />
              </div>
              <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full">{s.change}</span>
            </div>
            <p className="text-2xl font-bold text-dark-900">{s.value}</p>
            <p className="text-sm text-dark-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="flex items-center justify-between px-6 py-4 border-b border-dark-100">
          <h2 className="font-semibold text-dark-900">Recent Returns</h2>
          <button className="text-sm font-medium text-juno-dark-green hover:underline">View all</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-dark-100">
                <th className="text-left px-6 py-3 text-xs font-medium text-dark-500 uppercase tracking-wider">Client</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-dark-500 uppercase tracking-wider">Form</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-dark-500 uppercase tracking-wider">Preparer</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-dark-500 uppercase tracking-wider">Status</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-dark-500 uppercase tracking-wider">Updated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-50">
              {recentReturns.map((r) => (
                <tr key={r.client} className="hover:bg-dark-50/50 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-dark-900">{r.client}</td>
                  <td className="px-6 py-4 text-sm text-dark-600">{r.form}</td>
                  <td className="px-6 py-4 text-sm text-dark-600">{r.preparer}</td>
                  <td className="px-6 py-4">
                    <span className={`badge ${
                      r.status === 'Completed' ? 'badge-green' :
                      r.status === 'In Review' ? 'badge-blue' :
                      r.status === 'Processing' ? 'badge-yellow' :
                      'badge'
                    }`}>{r.status}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-dark-500">{r.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
