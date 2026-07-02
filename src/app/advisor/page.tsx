'use client'

import { useState } from 'react'
import Icon from '@/components/Icon'

const agentPrompts = [
  {
    category: 'Advisory Agents',
    description: 'Designed for deep tax research and complex queries, these prompts activate advanced reasoning paths and gather extensive, highly detailed insights.',
    note: 'Responses may take a bit longer to generate due to the depth and precision involved.',
    agents: [
      { name: 'Business Return Analysis', prompt: 'Analyze this business return for all optimization opportunities.' },
      { name: 'Charitable Giving Optimization Analysis', prompt: 'Identify the most tax-advantaged ways to make charitable donations.' },
      { name: 'OBBB Impact Scenarios', prompt: 'Analyze every tax change from the One Big Beautiful Bill on a client tax return.' },
      { name: 'Tax Bracket Planning Analysis', prompt: 'Strategize income in relation to the prevailing income tax brackets to minimize current and future liabilities.' },
      { name: 'Real Estate Tax Analysis', prompt: 'Evaluate tax implications associated with owning, managing, or investing in real estate.' },
      { name: 'Retirement Contribution Strategy', prompt: 'Determine optimal retirement plan contributions for maximum tax benefit.' },
      { name: 'State Residency Analysis', prompt: 'Analyze residency status and potential tax impact across states.' },
      { name: 'Tax Strategy Deep Analysis', prompt: 'Identify all tax savings and optimizations possible.' },
    ],
  },
]

export default function AdvisorPage() {
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [response, setResponse] = useState<string | null>(null)

  const handleSubmit = async (prompt?: string) => {
    const query = prompt || input
    if (!query.trim() || loading) return

    setInput('')
    setLoading(true)
    setResponse(null)

    try {
      const res = await fetch('/api/ai/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      })

      const data = await res.json()

      if (data.error) {
        setResponse(`❌ ${data.error}`)
      } else {
        setResponse(data.response)
      }
    } catch (err) {
      setResponse('❌ Sorry, I encountered an error. Please check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      {/* Trial Status Bar */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-juno-light-green text-juno-dark-green px-3 py-1.5 rounded-lg text-sm font-medium">
            <span className="w-2 h-2 bg-juno-dark-green rounded-full" />
            Advisor
          </div>
          <div className="flex items-center gap-1.5 text-sm text-dark-500">
            <Icon name="clock" className="w-4 h-4" />
            <span>0/5 Free Preparations started.</span>
          </div>
          <div className="text-sm text-dark-500">4d 12h Left in Your Trial</div>
        </div>
        <div className="w-8 h-8 bg-juno-dark-green rounded-full flex items-center justify-center text-white text-xs font-semibold">
          AN
        </div>
      </div>

      {/* Main Prompt Input */}
      <div className="card p-5 mb-5">
        <form
          onSubmit={(e) => { e.preventDefault(); handleSubmit() }}
          className="flex gap-3"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask me about tax law, advisory, tax planning, etc..."
            className="flex-1 px-4 py-3 rounded-lg border-2 border-dark-200 bg-white text-sm text-dark-900 placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-juno-green/20 focus:border-juno-green transition-all"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="btn btn-primary px-5"
          >
            {loading ? (
              <div className="flex gap-0.5">
                <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            ) : (
              <Icon name="send" className="w-4 h-4" />
            )}
          </button>
        </form>
      </div>

      {/* Action Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <button className="card p-5 text-left hover:shadow-md hover:border-juno-green/30 transition-all group cursor-pointer">
          <div className="flex items-start justify-between">
            <div>
              <div className="w-9 h-9 bg-juno-light-green rounded-lg flex items-center justify-center mb-3">
                <Icon name="teamwork" className="w-5 h-5 text-juno-dark-green" />
              </div>
              <h3 className="text-sm font-semibold text-dark-900 mb-1">Select Client</h3>
              <p className="text-xs text-dark-400">Choose your client</p>
            </div>
            <ChevronRight className="w-4 h-4 text-dark-300 group-hover:text-juno-dark-green transition-colors mt-1" />
          </div>
        </button>

        <button className="card p-5 text-left hover:shadow-md hover:border-juno-green/30 transition-all group cursor-pointer">
          <div className="flex items-start justify-between">
            <div>
              <div className="w-9 h-9 bg-blue-100 rounded-lg flex items-center justify-center mb-3">
                <Icon name="attach" className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="text-sm font-semibold text-dark-900 mb-1">Attach Files</h3>
              <p className="text-xs text-dark-400">Drag or click to upload</p>
            </div>
            <ChevronRight className="w-4 h-4 text-dark-300 group-hover:text-juno-dark-green transition-colors mt-1" />
          </div>
        </button>

        <button className="card p-5 text-left hover:shadow-md hover:border-juno-green/30 transition-all group cursor-pointer">
          <div className="flex items-start justify-between">
            <div>
              <div className="w-9 h-9 bg-purple-100 rounded-lg flex items-center justify-center mb-3">
                <Icon name="chat" className="w-5 h-5 text-purple-600" />
              </div>
              <h3 className="text-sm font-semibold text-dark-900 mb-1">Chat History</h3>
              <p className="text-xs text-dark-400">View all recent conversations</p>
            </div>
            <ChevronRight className="w-4 h-4 text-dark-300 group-hover:text-juno-dark-green transition-colors mt-1" />
          </div>
        </button>
      </div>

      {/* Response Area */}
      {loading && (
        <div className="card p-6 mb-8">
          <div className="flex gap-3">
            <div className="w-8 h-8 bg-juno-dark-green rounded-lg flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-dark-100 rounded animate-pulse w-3/4"></div>
              <div className="h-4 bg-dark-100 rounded animate-pulse w-1/2"></div>
              <div className="h-4 bg-dark-100 rounded animate-pulse w-2/3"></div>
            </div>
          </div>
        </div>
      )}

      {response && (
        <div className="card p-6 mb-8">
          <div className="flex gap-3">
            <div className="w-8 h-8 bg-juno-dark-green rounded-lg flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1">
              <div className="text-sm text-dark-700 leading-relaxed whitespace-pre-line">
                {response}
              </div>
              <div className="flex items-center gap-2 mt-4 pt-3 border-t border-dark-100">
                <button
                  onClick={() => { setResponse(null) }}
                  className="text-xs font-medium text-juno-dark-green hover:underline"
                >
                  Ask another question →
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Prompt Library Section */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-base font-semibold text-dark-900">Prompt Library</h2>
          <button className="text-xs font-medium text-juno-dark-green hover:underline flex items-center gap-1">
            Explore Popular Prompts              <Icon name="forward" className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Advisory Agents */}
      {agentPrompts.map((section) => (
        <div key={section.category} className="mb-8">
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-dark-900 mb-1">{section.category}</h3>
            <p className="text-xs text-dark-500 leading-relaxed">{section.description}</p>
            <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
              <Icon name="clock" className="w-3 h-3" />
              {section.note}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {section.agents.map((agent) => (
              <button
                key={agent.name}
                onClick={() => handleSubmit(agent.prompt)}
                disabled={loading}
                className="card p-4 text-left hover:shadow-md hover:border-juno-green/30 transition-all group cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-dark-900 mb-1.5">{agent.name}</p>
                    <p className="text-xs text-dark-500 leading-relaxed line-clamp-2">{agent.prompt}</p>
                  </div>
                  <Icon name="star" className="w-4 h-4 text-juno-dark-green/40 group-hover:text-juno-dark-green shrink-0 mt-0.5" />
                </div>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
