'use client'

import { useState, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { cn } from '@/lib/utils'
import {
  ArrowUp, Sparkles, Clock, Send, Loader2, MessageSquare, Lightbulb,
  Search, ChevronRight, User, Building2, FileText, Target, Briefcase,
  Home, TrendingUp, MapPin, Layers, Star, History, Upload
} from 'lucide-react'

const AGENTS = [
  { name: 'Business Return Analysis', prompt: 'Analyze this business return for all optimization opportunities.', icon: Briefcase },
  { name: 'Charitable Giving Optimization', prompt: 'Identify the most tax-advantaged ways to make charitable donations.', icon: Target },
  { name: 'OBBB Impact Scenarios', prompt: 'Analyze every tax change from the One Big Beautiful Bill on a client tax return.', icon: FileText },
  { name: 'Tax Bracket Planning', prompt: 'Strategize income in relation to the prevailing income tax brackets to minimize current and future liabilities.', icon: TrendingUp },
  { name: 'Real Estate Tax Analysis', prompt: 'Evaluate tax implications associated with owning, managing, or investing in real estate.', icon: Home },
  { name: 'Retirement Contribution Strategy', prompt: 'Determine optimal retirement plan contributions for maximum tax benefit.', icon: Building2 },
  { name: 'State Residency Analysis', prompt: 'Analyze residency status and potential tax impact across states.', icon: MapPin },
  { name: 'Tax Strategy Deep Analysis', prompt: 'Identify all tax savings and optimizations possible.', icon: Layers },
]

export default function AdvisorPage() {
  const { data: session } = useSession()
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [response, setResponse] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const initials = (session?.user?.name || 'AN').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)

  const handleSubmit = async (prompt?: string) => {
    const query = prompt || input
    if (!query.trim() || loading) return
    setInput('')
    setLoading(true)
    setResponse(null)
    try {
      const res = await fetch('/api/ai/query', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      })
      const data = await res.json()
      setResponse(data.error ? `Error: ${data.error}` : data.response)
    } catch {
      setResponse('Sorry, I encountered an error.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Bar */}
      <div className="flex items-center gap-3">
        <div className="flex-1 flex items-center gap-2 px-4 py-2.5 bg-white rounded-2xl border border-[#E5E7E5] shadow-sm">
          <div className="flex items-center gap-2 px-3 py-1 rounded-lg text-xs font-semibold bg-[#E8F5E8] text-[#0B3D2E]">
            <Sparkles className="w-3 h-3" />Advisor
          </div>
          <Clock className="w-3.5 h-3.5 text-[#6B7280]" />
          <span className="text-xs text-[#6B7280]">0/5 Free Preparations started.</span>
          <span className="text-xs text-amber-600 font-medium ml-auto">4d 12h Left in Your Trial</span>
        </div>
        <div className="w-9 h-9 bg-gradient-to-br from-[#0B3D2E] to-[#1FAA6F] rounded-full flex items-center justify-center text-white text-xs font-semibold shadow-sm shrink-0">{initials}</div>
      </div>

      {/* Header */}
      <div>
        <h1 className="text-[26px] font-bold text-[#1A1D1B] tracking-tight">Advisor</h1>
        <p className="text-sm text-[#6B7280] mt-0.5">Deep tax research, strategy analysis, and complex advisory queries.</p>
      </div>

      {/* Main Input */}
      <div className="bg-white rounded-2xl border border-[#E5E7E5] shadow-sm p-5">
        <form onSubmit={e => { e.preventDefault(); handleSubmit() }} className="flex gap-3">
          <input ref={inputRef} type="text" value={input} onChange={e => setInput(e.target.value)}
            placeholder="Ask me about tax law, advisory, tax planning, etc..." disabled={loading}
            className="flex-1 px-4 py-3 bg-[#F7F9F8] border border-[#E5E7E5] rounded-xl text-sm text-[#1A1D1B] placeholder-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#1FAA6F]/20 focus:border-[#1FAA6F] transition-all disabled:opacity-50" />
          <button type="submit" disabled={!input.trim() || loading}
            className="px-5 py-3 bg-[#0B3D2E] text-white text-sm font-semibold rounded-xl hover:bg-[#1FAA6F] disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-2">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            {loading ? 'Thinking...' : 'Ask'}
          </button>
        </form>
      </div>

      {/* Quick Action Cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Select Client', desc: 'Choose your client', icon: User, color: 'bg-[#E8F5E8] text-[#0B3D2E]' },
          { label: 'Attach Files', desc: 'Drag or click to upload', icon: Upload, color: 'bg-blue-50 text-blue-600' },
          { label: 'Chat History', desc: 'View recent conversations', icon: History, color: 'bg-purple-50 text-purple-600' },
        ].map(item => {
          const Icon = item.icon
          return (
            <button key={item.label}
              className="flex items-start gap-4 p-4 bg-white rounded-2xl border border-[#E5E7E5] text-left hover:border-[#1FAA6F]/40 hover:shadow-sm transition-all group">
              <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform', item.color)}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-[#1A1D1B] group-hover:text-[#1FAA6F] transition-colors">{item.label}</p>
                <p className="text-xs text-[#6B7280] mt-0.5">{item.desc}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-[#D1D5DB] mt-1 shrink-0 group-hover:text-[#1FAA6F] group-hover:translate-x-0.5 transition-all" />
            </button>
          )
        })}
      </div>

      {/* Response */}
      {loading && (
        <div className="bg-white rounded-2xl border border-[#E5E7E5] p-5 shadow-sm">
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#0B3D2E] to-[#1FAA6F] flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1 space-y-2">
              <div className="h-3 bg-[#F7F9F8] rounded-full animate-pulse w-3/4" />
              <div className="h-3 bg-[#F7F9F8] rounded-full animate-pulse w-1/2" />
              <div className="h-3 bg-[#F7F9F8] rounded-full animate-pulse w-2/3" />
            </div>
          </div>
        </div>
      )}
      {response && (
        <div className="bg-white rounded-2xl border border-[#E5E7E5] p-5 shadow-sm">
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#0B3D2E] to-[#1FAA6F] flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm text-[#6B7280] leading-relaxed whitespace-pre-line">{response}</div>
              <button onClick={() => { setResponse(null); inputRef.current?.focus() }}
                className="mt-3 text-xs font-medium text-[#1FAA6F] hover:underline inline-flex items-center gap-1">
                Ask another question <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Prompt Library */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-[#1A1D1B]">Prompt Library</h2>
          <p className="text-xs text-[#6B7280]">Responses may take longer due to depth and precision involved</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {AGENTS.map(a => {
            const Icon = a.icon
            return (
              <button key={a.name} onClick={() => handleSubmit(a.prompt)} disabled={loading}
                className="flex flex-col gap-2 p-4 bg-white rounded-2xl border border-[#E5E7E5] text-left hover:border-[#1FAA6F]/40 hover:shadow-sm transition-all group disabled:opacity-50 disabled:cursor-not-allowed">
                <div className="flex items-start justify-between">
                  <div className="w-9 h-9 rounded-xl bg-[#E8F5E8] flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Icon className="w-4.5 h-4.5 text-[#0B3D2E]" />
                  </div>
                  <Star className="w-3.5 h-3.5 text-[#9CA3AF] group-hover:text-[#1FAA6F] transition-colors" />
                </div>
                <p className="text-sm font-semibold text-[#1A1D1B]">{a.name}</p>
                <p className="text-xs text-[#6B7280] leading-relaxed line-clamp-2">{a.prompt}</p>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
