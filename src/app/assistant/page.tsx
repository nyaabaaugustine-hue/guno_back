'use client'

import { useState } from 'react'
import { Clock, Sparkles, Send, ArrowRight } from 'lucide-react'

const examplePrompts = [
  {
    category: 'Standard Deduction',
    prompt: 'What is the current year standard deduction for a MFJ client?',
  },
  {
    category: 'Deduction Limits',
    prompt: 'What is the cap on the SALT deduction for Federal Taxable Income in 2026?',
  },
  {
    category: 'Filing Deadlines',
    prompt: 'What is the state tax deadline for corporations in Pennsylvania?',
  },
  {
    category: 'Tax Credit Details',
    prompt: 'My client is interested in getting solar for their home. Can you explain the details of the Residential Energy credit?',
  },
  {
    category: 'Filing Status Requirements',
    prompt: 'What are the requirements for someone to qualify for the Head of Household status?',
  },
  {
    category: 'Tax Credit Requirements',
    prompt: 'How many years can my client claim the American Opportunity Tax Credit for?',
  },
]

export default function AssistantPage() {
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [response, setResponse] = useState<string | null>(null)

  const handleSubmit = async (prompt?: string) => {
    const query = prompt || input
    if (!query.trim() || loading) return

    setInput('')
    setLoading(true)
    setResponse(null)

    // Simulate AI response
    setTimeout(() => {
      setResponse(`Here's what I found about "${query}":

Based on current tax regulations and IRS guidance, here are the key points you need to know:

1. The relevant tax code provisions apply based on the taxpayer's specific circumstances
2. Eligibility requirements vary depending on filing status, income level, and other factors
3. For the most accurate analysis, I recommend reviewing the specific client's situation

Would you like me to dive deeper into any particular aspect of this?`)
      setLoading(false)
    }, 2000)
  }

  return (
    <div>
      {/* Trial Status Bar */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-juno-light-green text-juno-dark-green px-3 py-1.5 rounded-lg text-sm font-medium">
            <span className="w-2 h-2 bg-juno-dark-green rounded-full" />
            Assistant
          </div>
          <div className="flex items-center gap-1.5 text-sm text-dark-500">
            <Clock className="w-4 h-4" />
            <span>0/5 Free Preparations started.</span>
          </div>
          <div className="text-sm text-dark-500">4d 12h Left in Your Trial</div>
        </div>
        <div className="w-8 h-8 bg-juno-dark-green rounded-full flex items-center justify-center text-white text-xs font-semibold">
          AN
        </div>
      </div>

      {/* Title */}
      <h1 className="text-2xl font-display font-bold text-dark-900 mb-8">Assistant</h1>

      {/* Main prompt input */}
      <div className="card p-6 mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 bg-juno-dark-green rounded-lg flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <h2 className="text-base font-semibold text-dark-900">Ask Juno Assistant</h2>
        </div>
        <p className="text-xs text-dark-400 mb-4 ml-11">Get instant answers to tax questions, research, and more.</p>
        <form
          onSubmit={(e) => { e.preventDefault(); handleSubmit() }}
          className="flex gap-3"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Explain the qualified business income deduction"
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
              <Send className="w-4 h-4" />
            )}
          </button>
        </form>
      </div>

      {/* Response area */}
      {loading && (
        <div className="card p-6 mb-8">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-juno-dark-green rounded-lg flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1">
              <div className="h-4 bg-dark-100 rounded animate-pulse mb-2 w-3/4"></div>
              <div className="h-4 bg-dark-100 rounded animate-pulse w-1/2"></div>
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
                  onClick={() => { setResponse(null); setInput('Explain the qualified business income deduction') }}
                  className="text-xs font-medium text-juno-dark-green hover:underline"
                >
                  Ask a follow-up →
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Example Prompts */}
      <div>
        <h2 className="text-sm font-semibold text-dark-900 mb-4">Example Prompts</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {examplePrompts.map((item) => (
            <button
              key={item.category}
              onClick={() => handleSubmit(item.prompt)}
              disabled={loading}
              className="card p-4 text-left hover:shadow-md hover:border-juno-green/30 transition-all group cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-juno-dark-green mb-1.5 uppercase tracking-wider">
                    {item.category}
                  </p>
                  <p className="text-sm text-dark-700 leading-relaxed line-clamp-2">
                    {item.prompt}
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-dark-300 group-hover:text-juno-dark-green group-hover:translate-x-0.5 transition-all shrink-0 mt-1" />
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
