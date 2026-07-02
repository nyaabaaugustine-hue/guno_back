'use client'

import { Info, CheckCircle, TrendingUp, Users, FileText } from 'lucide-react'

const tips = [
  {
    icon: TrendingUp,
    title: 'Start with your easiest returns',
    description: 'Begin by giving Juno preparations that are representative of your typical workload. Save your most complex returns for after you\'ve seen Juno handle the standard stuff.',
    color: 'text-blue-600 bg-blue-100',
  },
  {
    icon: FileText,
    title: 'Upload clear source documents',
    description: 'For best results, upload PDF versions of source documents when available. Juno handles photos too, but clear scans give the highest extraction accuracy.',
    color: 'text-juno-dark-green bg-juno-light-green',
  },
  {
    icon: Users,
    title: 'Involve your team early',
    description: 'Have your preparers and reviewers both test Juno during the trial period. Each role has different needs, and we want to make sure the workflow works for everyone.',
    color: 'text-purple-600 bg-purple-100',
  },
  {
    icon: CheckCircle,
    title: 'Review every extraction',
    description: 'Every data point Juno extracts links back to the source document. Click any value to verify it against the original — transparency is built into every step.',
    color: 'text-amber-600 bg-amber-100',
  },
]

const limits = [
  { label: 'Free Preparations Used', current: 0, max: 5 },
  { label: 'Team Members', current: 3, max: 10 },
  { label: 'Documents Stored', current: 12, max: 100 },
  { label: 'Returns in Progress', current: 2, max: 25 },
]

export default function TipsLimitsPage() {
  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="flex items-center gap-2 bg-juno-light-green text-juno-dark-green px-3 py-1.5 rounded-lg text-sm font-medium">
          <span className="w-2 h-2 bg-juno-dark-green rounded-full" />
          Tips & Limits
        </div>
      </div>

      <h1 className="text-2xl font-display font-bold text-dark-900 mb-2">Tips & Limits</h1>
      <p className="text-dark-500 text-sm mb-8">View usage limits and helpful tips for getting the most out of Juno.</p>

      {/* Usage Limits */}
      <div className="mb-10">
        <h2 className="text-lg font-semibold text-dark-900 mb-4">Your Trial Limits</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {limits.map((limit) => {
            const percentage = (limit.current / limit.max) * 100
            return (
              <div key={limit.label} className="card p-5">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-medium text-dark-700">{limit.label}</p>
                  <span className={`text-xs font-semibold ${
                    percentage >= 80 ? 'text-red-600' :
                    percentage >= 50 ? 'text-amber-600' :
                    'text-juno-dark-green'
                  }`}>
                    {limit.current} / {limit.max}
                  </span>
                </div>
                <div className="h-2 bg-dark-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      percentage >= 80 ? 'bg-red-500' :
                      percentage >= 50 ? 'bg-amber-400' :
                      'bg-juno-dark-green'
                    }`}
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>

        <div className="mt-4 flex items-center gap-2 text-xs text-dark-400">
          <Info className="w-3 h-3" />
          <span>Limits reset when you upgrade to a paid plan. 4d 12h remaining in your trial.</span>
        </div>
      </div>

      {/* Tips */}
      <h2 className="text-lg font-semibold text-dark-900 mb-4">Tips for Success</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {tips.map((tip) => (
          <div key={tip.title} className="card p-5 hover:shadow-md transition-all">
            <div className="flex gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${tip.color}`}>
                <tip.icon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-dark-900 mb-1">{tip.title}</h3>
                <p className="text-xs text-dark-500 leading-relaxed">{tip.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
