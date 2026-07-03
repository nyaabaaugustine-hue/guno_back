'use client'

import { useState, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { cn } from '@/lib/utils'
import { ArrowUp, Sparkles, Clock, Send, Loader2, MessageSquare, Lightbulb, Search, ChevronRight, User } from 'lucide-react'

const EXAMPLE_PROMPTS = [
  { category: 'Standard Deduction', prompt: 'What is the current year standard deduction for a MFJ client?' },
  { category: 'Deduction Limits', prompt: 'What is the cap on the SALT deduction for Federal Taxable Income in 2026?' },
  { category: 'Filing Deadlines', prompt: 'What is the state tax deadline for corporations in Pennsylvania?' },
  { category: 'Tax Credit Details', prompt: 'My client is interested in getting solar for their home. Can you explain the details of the Residential Energy credit?' },
  { category: 'Filing Status Requirements', prompt: 'What are the requirements for someone to qualify for the Head of Household status?' },
  { category: 'Tax Credit Requirements', prompt: 'How many years can my client claim the American Opportunity Tax Credit for?' },
]

export default function AssistantPage() {
  const { data: session } = useSession()
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [response, setResponse] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const userInitials = (session?.user?.name || 'AN').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)

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
      setResponse('Sorry, I encountered an error. Please check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Top Bar */}
      <div className="flex items-center gap-3">
        <div className="flex-1 flex items-center gap-2 px-4 py-2.5 bg-white rounded-2xl border border-[#E5E7E5] shadow-sm">
          <div className="flex items-center gap-2 px-3 py-1 rounded-lg text-xs font-semibold bg-[#E8F5E8] text-[#0B3D2E]">
            <Sparkles className="w-3 h-3" />Assistant
          </div>
          <Clock className="w-3.5 h-3.5 text-[#6B7280]" />
          <span className="text-xs text-[#6B7280]">0/5 Free Preparations started.</span>
          <span className="text-xs text-amber-600 font-medium ml-auto">4d 12h Left in Your Trial</span>
        </div>
        <div className="w-9 h-9 bg-gradient-to-br from-[#0B3D2E] to-[#1FAA6F] rounded-full flex items-center justify-center text-white text-xs font-semibold shadow-sm shrink-0">{userInitials}</div>
      </div>

      {/* Header */}
      <div>
        <h1 className="text-[26px] font-bold text-[#1A1D1B] tracking-tight">Assistant</h1>
        <p className="text-sm text-[#6B7280] mt-0.5">Get instant answers to tax questions, research, and more.</p>
      </div>

      {/* Chat Card */}
      <div className="bg-white rounded-2xl border border-[#E5E7E5] shadow-sm overflow-hidden">
        {/* Messages Area */}
        <div className="p-5 space-y-4 min-h-[200px]">
          {!response && !loading && (
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#0B3D2E] to-[#1FAA6F] flex items-center justify-center shrink-0 mt-0.5">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[#1A1D1B]">Juno Assistant</p>
                <p className="text-sm text-[#6B7280] mt-1">Hello! I&apos;m your AI tax assistant. Ask me anything about tax preparation, deductions, filing requirements, and more.</p>
              </div>
            </div>
          )}
          {loading && (
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#0B3D2E] to-[#1FAA6F] flex items-center justify-center shrink-0 mt-0.5">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-[#1A1D1B]">Juno Assistant</p>
                <div className="flex gap-1 mt-2">
                  <div className="w-2 h-2 bg-[#1FAA6F] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-[#1FAA6F] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-[#1FAA6F] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
          {response && (
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#0B3D2E] to-[#1FAA6F] flex items-center justify-center shrink-0 mt-0.5">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[#1A1D1B]">Juno Assistant</p>
                <div className="text-sm text-[#6B7280] mt-1 leading-relaxed whitespace-pre-line">{response}</div>
                <button onClick={() => { setResponse(null); inputRef.current?.focus() }}
                  className="mt-3 text-xs font-medium text-[#1FAA6F] hover:underline inline-flex items-center gap-1">
                  Ask another question <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="border-t border-[#E5E7E5] px-4 py-3">
          <form onSubmit={e => { e.preventDefault(); handleSubmit() }} className="flex items-center gap-3">
            <input ref={inputRef} type="text" value={input} onChange={e => setInput(e.target.value)}
              placeholder="Explain the qualified business income deduction..." disabled={loading}
              className="flex-1 px-4 py-2.5 bg-[#F7F9F8] border border-[#E5E7E5] rounded-full text-sm text-[#1A1D1B] placeholder-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#1FAA6F]/20 focus:border-[#1FAA6F] transition-all disabled:opacity-50" />
            <button type="submit" disabled={!input.trim() || loading}
              className="w-10 h-10 rounded-full bg-[#0B3D2E] text-white flex items-center justify-center hover:bg-[#1FAA6F] disabled:opacity-40 disabled:cursor-not-allowed transition-all shrink-0">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </form>
        </div>
      </div>

      {/* Example Prompts */}
      <div>
        <h2 className="text-sm font-semibold text-[#1A1D1B] mb-3 flex items-center gap-2">
          <Lightbulb className="w-4 h-4 text-[#1FAA6F]" /> Example Prompts
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {EXAMPLE_PROMPTS.map(item => (
            <button key={item.category} onClick={() => handleSubmit(item.prompt)} disabled={loading}
              className="flex items-start gap-3 p-4 bg-white rounded-2xl border border-[#E5E7E5] text-left hover:border-[#1FAA6F]/40 hover:shadow-sm transition-all group disabled:opacity-50 disabled:cursor-not-allowed">
              <Search className="w-4 h-4 text-[#9CA3AF] mt-0.5 shrink-0 group-hover:text-[#1FAA6F] transition-colors" />
              <div className="min-w-0">
                <p className="text-xs font-semibold text-[#1FAA6F] uppercase tracking-wider">{item.category}</p>
                <p className="text-sm text-[#6B7280] mt-0.5 leading-relaxed line-clamp-2">{item.prompt}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
