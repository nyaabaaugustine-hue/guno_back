'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import Icon from '@/components/Icon'

// ─── Animated Counter ───────────────────────────────────────────
function AnimatedNumber({ value, suffix = '', duration = 1500 }: { value: number; suffix?: string; duration?: number }) {
  const [display, setDisplay] = useState(0)
  const started = useRef(false)

  useEffect(() => {
    if (started.current) return
    started.current = true

    const startTime = performance.now()
    const step = (now: number) => {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplay(Math.round(eased * value))
      if (progress < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [value, duration])

  return <span className="tabular-nums">{display.toLocaleString()}{suffix}</span>
}

// ─── SVG Donut Chart ────────────────────────────────────────────
function DonutChart({ segments }: {
  segments: { label: string; value: number; color: string }[]
}) {
  const total = segments.reduce((a, b) => a + b.value, 0)
  const radius = 72
  const circumference = 2 * Math.PI * radius
  let offset = 0

  return (
    <svg viewBox="0 0 200 200" className="w-full h-full">
      {segments.map((seg) => {
        const proportion = seg.value / total
        const segmentLength = proportion * circumference
        const dashArray = `${segmentLength} ${circumference - segmentLength}`
        const dashOffset = -offset
        offset += segmentLength
        return (
          <circle
            key={seg.label}
            cx="100"
            cy="100"
            r={radius}
            fill="none"
            stroke={seg.color}
            strokeWidth="28"
            strokeDasharray={dashArray}
            strokeDashoffset={dashOffset}
            strokeLinecap="butt"
            transform="rotate(-90 100 100)"
            className="transition-all duration-700"
          />
        )
      })}
      <text x="100" y="92" textAnchor="middle" className="text-3xl font-bold" fill="#020617">
        {total}
      </text>
      <text x="100" y="112" textAnchor="middle" className="text-xs" fill="#64748B">
        Returns
      </text>
    </svg>
  )
}

// ─── Dashboard data type ─────────────────────────────────────────
interface DashboardData {
  stats: {
    label: string
    value: number
    change: string
    trend: 'up' | 'down'
    isCurrency?: boolean
  }[]
  returnsByStatus: { label: string; value: number; color: string; count?: string }[]
  recentReturns: { client: string; form: string; status: string; updated: string; amount: string }[]
  activities: { action: string; client: string; initials: string; form: string; user: string; time: string; type: string }[]
  deadlines: { task: string; date: string; priority: string; daysLeft: number }[]
}

// ─── Icon picker for stats ──────────────────────────────────────
const iconColorMap: Record<string, string> = {
  'Total Returns': 'text-blue-600 bg-blue-100',
  'Active Clients': 'text-juno-dark-green bg-juno-light-green',
  'Documents': 'text-purple-600 bg-purple-100',
  'Team Members': 'text-emerald-600 bg-emerald-100',
  'Avg. Processing Time': 'text-purple-600 bg-purple-100',
  'Revenue (MTD)': 'text-emerald-600 bg-emerald-100',
}

const iconNameMap: Record<string, string> = {
  'Total Returns': 'document',
  'Active Clients': 'teamwork',
  'Documents': 'document',
  'Team Members': 'teamwork',
  'Avg. Processing Time': 'clock',
  'Revenue (MTD)': 'money',
}

// ─── Component ──────────────────────────────────────────────────
export default function DashboardPage() {
  const { data: session, status: authStatus } = useSession()
  const router = useRouter()
  const [greeting, setGreeting] = useState('')
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const hour = new Date().getHours()
    if (hour < 12) setGreeting('Good morning')
    else if (hour < 18) setGreeting('Good afternoon')
    else setGreeting('Good evening')
  }, [])

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const res = await fetch('/api/dashboard/summary')
        if (res.ok) {
          setData(await res.json())
        }
      } catch {} finally {
        setLoading(false)
      }
    }
    loadDashboard()
  }, [])

  useEffect(() => {
    if (authStatus === 'unauthenticated') router.push('/auth/signin')
  }, [authStatus, router])

  if (authStatus === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-juno-dark-green border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-dark-500">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (!session) return null

  const userName = session.user?.name || 'User'
  const firstName = userName.split(' ')[0]

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-juno-dark-green border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-dark-500">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  // Use API data or fall back to empty defaults
  const stats = data?.stats ?? []
  const activities = data?.activities ?? []
  const deadlines = data?.deadlines ?? []
  const returnsByStatus = data?.returnsByStatus ?? []
  const recentReturns = data?.recentReturns ?? []

  return (
    <div className="space-y-8">
      {/* ── Welcome Header ── */}
      <div>
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full bg-juno-green animate-pulse" />
              <span className="text-xs font-medium text-dark-400 uppercase tracking-wider">Dashboard</span>
            </div>
            <h1 className="text-3xl font-display font-bold text-dark-900 tracking-tight">
              {greeting}, {firstName}
            </h1>
            <p className="text-dark-500 text-sm mt-1">Here&apos;s your practice at a glance.</p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/tips-limits" className="btn btn-ghost text-sm">
              <Icon name="calendar" className="w-4 h-4" />
              <span className="hidden sm:inline">View Calendar</span>
            </Link>
            <Link href="/preparer" className="btn btn-primary shadow-lg shadow-juno-dark-green/20">
              <Icon name="plus" className="w-4 h-4" />
              New Return
            </Link>
          </div>
        </div>
      </div>

      {/* ── Stats Grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((s, idx) => (
          <div
            key={s.label}
            className="group relative card p-5 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 overflow-hidden"
            style={{ animationDelay: `${idx * 100}ms` }}
          >
            {/* Hover gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-dark-50/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${iconColorMap[s.label] || 'text-blue-600 bg-blue-100'} ring-4 ring-white shadow-sm`}>
                  <Icon name={iconNameMap[s.label] || 'document'} className="w-5.5 h-5.5" />
                </div>
                <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${
                  s.trend === 'up' ? 'text-emerald-700 bg-emerald-50' : 'text-purple-700 bg-purple-50'
                }`}>
                  {s.change}
                  <Icon name="link" className={`w-3 h-3 ${s.trend === 'down' ? 'rotate-180' : ''}`} />
                </span>
              </div>

              {s.label === 'Avg. Processing Time' ? (
                <p className="text-2xl font-bold text-dark-900 tabular-nums">
                  <AnimatedNumber value={Math.floor(s.value)} />.<AnimatedNumber value={Math.round((s.value % 1) * 10)} duration={1200} />h
                </p>
              ) : s.isCurrency || s.label === 'Revenue (MTD)' ? (
                <p className="text-2xl font-bold text-dark-900 tabular-nums">
                  $<AnimatedNumber value={s.value} />
                </p>
              ) : (
                <p className="text-2xl font-bold text-dark-900 tabular-nums">
                  <AnimatedNumber value={s.value} />
                </p>
              )}

              <p className="text-sm text-dark-500 mt-1">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Main Grid ── */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Returns by Status — Donut + Legend */}
        <div className="card p-6 hover:shadow-lg transition-shadow duration-300">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold text-dark-900">Returns by Status</h2>
            <Icon name="statistics" className="w-4 h-4 text-dark-400" />
          </div>
          <div className="flex items-center gap-6">
            {/* Donut */}
            <div className="w-36 h-36 shrink-0">
              <DonutChart segments={returnsByStatus.map(s => ({
                label: s.label,
                value: s.value,
                color: s.color
              }))} />
            </div>
            {/* Legend */}
            <div className="flex-1 space-y-3">
              {returnsByStatus.map((s) => {
                const pct = Math.round((s.value / returnsByStatus.reduce((a, b) => a + b.value, 0)) * 100)
                return (
                  <div key={s.label} className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded" style={{ backgroundColor: s.color }} />
                    <span className="text-sm text-dark-600 flex-1">{s.label}</span>
                    <span className="text-sm font-medium text-dark-900 tabular-nums">{s.count}</span>
                    <span className="text-xs text-dark-400 w-8 text-right tabular-nums">{pct}%</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Upcoming Deadlines */}
        <div className="card p-6 hover:shadow-lg transition-shadow duration-300">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold text-dark-900">Upcoming Deadlines</h2>
            <Icon name="calendar" className="w-4 h-4 text-dark-400" />
          </div>
          <div className="space-y-4">
            {deadlines.map((d) => (
              <div
                key={d.task}
                onClick={() => router.push('/tips-limits')}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter') router.push('/tips-limits') }}
                className="group flex items-start gap-3 p-3 -mx-3 rounded-xl hover:bg-dark-50 transition-colors cursor-pointer"
              >
                {/* Priority indicator bar */}
                <div className={`w-1 h-10 rounded-full shrink-0 mt-0.5 ${
                  d.priority === 'high' ? 'bg-red-500' :
                  d.priority === 'medium' ? 'bg-amber-400' :
                  'bg-dark-300'
                }`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-dark-900 group-hover:text-juno-dark-green transition-colors">{d.task}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <p className="text-xs text-dark-500">{d.date}</p>
                    <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${
                      d.daysLeft <= 14 ? 'bg-red-50 text-red-600' :
                      d.daysLeft <= 30 ? 'bg-amber-50 text-amber-600' :
                      'bg-dark-100 text-dark-500'
                    }`}>
                      {d.daysLeft}d left
                    </span>
                  </div>
                </div>
                <Icon name="forward" className="w-4 h-4 text-dark-300 group-hover:text-juno-dark-green group-hover:translate-x-0.5 transition-all shrink-0 mt-0.5" />
              </div>
            ))}
          </div>
          <Link href="/tips-limits" className="inline-flex items-center gap-1 text-xs font-medium text-juno-dark-green hover:text-juno-mid-green transition-colors mt-4 group">
            View all deadlines
            <Icon name="forward" className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {/* Quick Actions */}
        <div className="card p-6 hover:shadow-lg transition-shadow duration-300">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold text-dark-900">Quick Actions</h2>
            <Icon name="statistics" className="w-4 h-4 text-dark-400" />
          </div>
          <div className="space-y-2">
            <Link href="/preparer" className="flex items-center gap-3 p-3 rounded-xl hover:bg-juno-light-green/30 transition-all group">
              <div className="w-10 h-10 bg-juno-light-green rounded-xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-0 transition-all duration-300">
                <Icon name="plus" className="w-4.5 h-4.5 text-juno-dark-green" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-dark-900 group-hover:text-juno-dark-green transition-colors">New Tax Return</p>
                <p className="text-xs text-dark-500">Start a new preparation</p>
              </div>
              <Icon name="forward" className="w-4 h-4 text-dark-300 group-hover:text-juno-dark-green group-hover:translate-x-0.5 transition-all" />
            </Link>
            <Link href="/clients" className="flex items-center gap-3 p-3 rounded-xl hover:bg-blue-50 transition-all group">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-all duration-300">
                <Icon name="teamwork" className="w-4.5 h-4.5 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-dark-900 group-hover:text-blue-600 transition-colors">Add Client</p>
                <p className="text-xs text-dark-500">Add a new client to your roster</p>
              </div>
              <Icon name="forward" className="w-4 h-4 text-dark-300 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
            </Link>
            <Link href="/assistant" className="flex items-center gap-3 p-3 rounded-xl hover:bg-purple-50 transition-all group">
              <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-all duration-300">
                <Icon name="visible" className="w-4.5 h-4.5 text-purple-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-dark-900 group-hover:text-purple-600 transition-colors">Ask Assistant</p>
                <p className="text-xs text-dark-500">Get tax answers instantly</p>
              </div>
              <Icon name="forward" className="w-4 h-4 text-dark-300 group-hover:text-purple-600 group-hover:translate-x-0.5 transition-all" />
            </Link>
            <Link href="/advisor" className="flex items-center gap-3 p-3 rounded-xl hover:bg-amber-50 transition-all group">
              <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-all duration-300">
                <Icon name="statistics" className="w-4.5 h-4.5 text-amber-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-dark-900 group-hover:text-amber-600 transition-colors">Tax Planning</p>
                <p className="text-xs text-dark-500">Run advisory scenarios</p>
              </div>
              <Icon name="forward" className="w-4 h-4 text-dark-300 group-hover:text-amber-600 group-hover:translate-x-0.5 transition-all" />
            </Link>
          </div>
        </div>
      </div>

      {/* ── Returns Table ── */}
      <div className="card overflow-hidden hover:shadow-lg transition-shadow duration-300">
        <div className="flex items-center justify-between px-6 py-4 border-b border-dark-100">
          <div className="flex items-center gap-3">
            <h2 className="font-semibold text-dark-900">Recent Returns</h2>
            <span className="text-xs text-dark-400 bg-dark-50 px-2 py-0.5 rounded-full font-medium">{recentReturns.length} active</span>
          </div>
          <Link href="/returns" className="text-sm font-medium text-juno-dark-green hover:text-juno-mid-green transition-colors flex items-center gap-1 group">
            View all              <Icon name="forward" className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-dark-100 bg-dark-50/80">
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-dark-500 uppercase tracking-wider">Client</th>
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-dark-500 uppercase tracking-wider">Form</th>
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-dark-500 uppercase tracking-wider">Status</th>
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-dark-500 uppercase tracking-wider">Amount</th>
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-dark-500 uppercase tracking-wider">Updated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-50">
              {recentReturns.map((r, i) => (
                <tr
                  key={i}
                  onClick={() => router.push('/returns')}
                  className="hover:bg-juno-light-green/10 transition-colors cursor-pointer group"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-dark-100 flex items-center justify-center text-xs font-semibold text-dark-600 group-hover:bg-juno-light-green group-hover:text-juno-dark-green transition-colors">
                        {r.client.split(' ').map(w => w[0]).join('').slice(0, 2)}
                      </div>
                      <span className="text-sm font-medium text-dark-900 group-hover:text-juno-dark-green transition-colors">{r.client}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <code className="text-xs font-mono font-medium text-dark-600 bg-dark-50 px-2 py-1 rounded-md">{r.form}</code>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 badge ${
                      r.status === 'Completed' ? 'badge-green' :
                      r.status === 'In Review' ? 'badge-blue' :
                      r.status === 'Processing' ? 'badge-yellow' :
                      'bg-dark-100 text-dark-600'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        r.status === 'Completed' ? 'bg-juno-dark-green' :
                        r.status === 'In Review' ? 'bg-blue-500' :
                        r.status === 'Processing' ? 'bg-amber-500' :
                        'bg-dark-400'
                      }`} />
                      {r.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-dark-900 tabular-nums">{r.amount}</td>
                  <td className="px-6 py-4 text-sm text-dark-500">{r.updated}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Recent Activity Timeline ── */}
      <div className="card p-6 hover:shadow-lg transition-shadow duration-300">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-semibold text-dark-900">Recent Activity</h2>
          <Link href="/returns" className="text-sm font-medium text-juno-dark-green hover:text-juno-mid-green transition-colors flex items-center gap-1 group">
            View all              <Icon name="forward" className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-[19px] top-0 bottom-0 w-0.5 bg-dark-100" />
          <div className="space-y-0">
            {activities.map((a, i) => (
              <div key={i} className="relative flex items-start gap-4 pb-6 last:pb-0">
                {/* Timeline dot */}
                <div className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center shrink-0 ring-4 ring-white ${
                  a.type === 'completed' ? 'bg-juno-light-green' :
                  a.type === 'alert' ? 'bg-red-50' :
                  a.type === 'upload' ? 'bg-blue-50' :
                  'bg-dark-50'
                }`}>
                  {a.type === 'completed' ? <Icon name="check" className="w-4 h-4 text-juno-dark-green" /> :
                   a.type === 'alert' ? <Icon name="error" className="w-4 h-4 text-red-500" /> :
                   a.type === 'upload' ? <Icon name="link" className="w-4 h-4 text-blue-500" /> :
                   <Icon name="plus" className="w-4 h-4 text-dark-400" />}
                </div>
                {/* Content */}
                <div className="flex-1 min-w-0 pt-1.5">
                  <p className="text-sm font-medium text-dark-900">{a.action}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <div className="flex items-center gap-1.5">
                      <div className="w-5 h-5 rounded-full bg-dark-100 flex items-center justify-center text-[9px] font-semibold text-dark-500">
                        {a.initials}
                      </div>
                      <span className="text-xs text-dark-600 font-medium">{a.client}</span>
                    </div>
                    <span className="text-dark-300">·</span>
                    <span className="text-xs text-dark-400">{a.form}</span>
                    <span className="text-dark-300">·</span>
                    <span className="text-xs text-dark-500">{a.user}</span>
                  </div>
                  <span className="text-[11px] text-dark-400 mt-0.5 block">{a.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
