'use client'

import { useState, useRef, useEffect } from 'react'
import Icon from '@/components/Icon'

interface Message {
  role: 'user' | 'assistant'
  content: string
  sql?: string
  cached?: boolean
}

type View = 'home' | 'messages' | 'chat'

interface SupportArticle {
  title: string
  category: string
  icon: string
}

const supportArticles: SupportArticle[] = [
  { title: 'Supported Source Documents', category: 'Guides', icon: 'document' },
  { title: 'How to Connect Juno & TaxDome', category: 'Integrations', icon: 'book' },
  { title: 'Getting Started with Preparer', category: 'Getting Started', icon: 'book' },
  { title: 'Juno <> CCH Axcess Export Demo', category: 'Integrations', icon: 'book' },
]

export default function FloatingAIButton() {
  const [open, setOpen] = useState(false)
  const [view, setView] = useState<View>('home')
  const [searchQuery, setSearchQuery] = useState('')
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (open && view === 'chat') inputRef.current?.focus()
  }, [open, view])

  const filteredArticles = supportArticles.filter((a) =>
    a.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleSubmit = async (query?: string) => {
    const q = query || input
    if (!q.trim() || loading) return

    setView('chat')
    setInput('')
    setMessages((prev) => [...prev, { role: 'user', content: q }])
    setLoading(true)

    try {
      const res = await fetch('/api/ai/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q }),
      })

      const data = await res.json()

      if (data.error) {
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: `❌ ${data.error}` },
        ])
      } else {
        const responseText = data.sql
          ? `${data.response}\n\n${data.cached ? '⚡ _Cached result_' : ''}`
          : data.response

        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: responseText,
            sql: data.sql,
            cached: data.cached,
          },
        ])
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: "❌ Sorry, I couldn't reach the server. Please try again.",
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  // ─── Home View ─────────────────────────────────────────────────
  const HomeView = () => (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Greeting */}
      <div className="px-6 pt-6 pb-4">
        <h2 className="text-xl font-bold text-dark-900">
          Hi Augustine! Welcome to <span className="text-juno-dark-green">Juno Support</span>
        </h2>
      </div>

      {/* Search */}
      <div className="px-6 pb-4">
        <div className="relative">
          <Icon name="search" className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for help"
            className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-dark-200 bg-dark-50 text-sm text-dark-900 placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-juno-green/20 focus:border-juno-green transition-all"
          />
        </div>
      </div>

      {/* Support Articles */}
      <div className="flex-1 overflow-y-auto px-6 pb-4">
        <h3 className="text-xs font-semibold text-dark-400 uppercase tracking-wider mb-3">
          Supported Source Documents
        </h3>
        <div className="space-y-2">
          {filteredArticles.map((article, i) => (
            <button
              key={i}
              onClick={() => setView('chat')}
              className="w-full flex items-center gap-3 p-3.5 rounded-xl bg-white border border-dark-100 hover:border-juno-green/40 hover:bg-juno-light-green/20 transition-all text-left group"
            >
              <div className="w-9 h-9 rounded-lg bg-juno-light-green flex items-center justify-center shrink-0 group-hover:bg-juno-green/30 transition-colors">
                <Icon name={article.icon} className="w-4.5 h-4.5 text-juno-dark-green" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-dark-900 truncate">
                  {article.title}
                </p>
                <p className="text-xs text-dark-400 mt-0.5">{article.category}</p>
              </div>
              <Icon name="forward" className="w-4 h-4 text-dark-300 group-hover:text-juno-dark-green shrink-0" />
            </button>
          ))}
        </div>

        {/* Contact Support */}
        <button className="w-full flex items-center gap-3 p-3.5 mt-4 rounded-xl border-2 border-dashed border-dark-200 hover:border-juno-green/40 hover:bg-juno-light-green/20 transition-all text-left group">
          <div className="w-9 h-9 rounded-lg bg-dark-100 flex items-center justify-center shrink-0 group-hover:bg-juno-light-green transition-colors">
            <Icon name="support" className="w-4.5 h-4.5 text-dark-500 group-hover:text-juno-dark-green" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-dark-900">Contact support</p>
            <p className="text-xs text-dark-400 mt-0.5">Talk to our team</p>
          </div>                      <Icon name="link" className="w-4 h-4 text-dark-300 group-hover:text-juno-dark-green shrink-0" />
        </button>
      </div>
    </div>
  )

  // ─── Messages View ─────────────────────────────────────────────
  const MessagesView = () => (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="px-6 pt-6 pb-4">
        <h2 className="text-lg font-bold text-dark-900">Messages</h2>
        <p className="text-sm text-dark-400 mt-1">Your conversation history</p>
      </div>
      <div className="flex-1 overflow-y-auto px-6 pb-4">
        {messages.length === 0 ? (
          <div className="text-center py-12">
            <Icon name="chat" className="w-10 h-10 text-dark-300 mx-auto mb-3" />
            <p className="text-sm text-dark-400">No messages yet. Ask a question to get started.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {messages
              .filter((m) => m.role === 'user')
              .slice(-5)
              .reverse()
              .map((msg, i) => (
                <button
                  key={i}
                  onClick={() => { setView('chat') }}
                  className="w-full flex items-center gap-3 p-3 rounded-xl bg-dark-50 hover:bg-juno-light-green/30 transition-all text-left"
                >
                  <div className="w-8 h-8 rounded-full bg-juno-dark-green flex items-center justify-center shrink-0">
                    <span className="text-white text-xs font-semibold">A</span>
                  </div>
                  <p className="text-sm text-dark-700 truncate flex-1">{msg.content}</p>
                  <Icon name="forward" className="w-3.5 h-3.5 text-dark-300 shrink-0" />
                </button>
              ))}
          </div>
        )}
      </div>
    </div>
  )

  // ─── Chat View ─────────────────────────────────────────────────
  const ChatView = () => (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Chat header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-dark-100 shrink-0">
        <button
          onClick={() => setView('home')}
          className="p-1.5 text-dark-500 hover:text-dark-900 hover:bg-dark-100 rounded-lg transition-all"
        >
          <Icon name="back" className="w-4 h-4" />
        </button>
        <div className="w-8 h-8 rounded-full bg-juno-light-green flex items-center justify-center">
          <Icon name="star" className="w-4 h-4 text-juno-dark-green" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-dark-900">Juno AI</h3>
          <p className="text-xs text-dark-400">Ask me anything about your data</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-8">
            <Icon name="chat" className="w-10 h-10 text-juno-dark-green/30 mx-auto mb-3" />
            <p className="text-sm text-dark-500">
              Ask a question about your clients, returns, or team.
            </p>
            <div className="flex flex-wrap justify-center gap-2 mt-4">
              {[
                'How many clients?',
                'Completed returns?',
                'Team members?',
                'Full summary',
              ].map((q) => (
                <button
                  key={q}
                  onClick={() => handleSubmit(q)}
                  className="text-xs px-3 py-1.5 rounded-full bg-dark-50 text-dark-600 hover:bg-juno-light-green hover:text-juno-dark-green border border-dark-100 hover:border-juno-green/30 transition-all"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
            {msg.role === 'assistant' && (
              <div className="w-7 h-7 rounded-full bg-juno-light-green flex items-center justify-center shrink-0 mt-0.5">
                <Icon name="star" className="w-3.5 h-3.5 text-juno-dark-green" />
              </div>
            )}
            <div
              className={`max-w-[85%] ${
                msg.role === 'user'
                  ? 'bg-juno-dark-green text-white rounded-2xl rounded-br-md px-4 py-2.5'
                  : 'text-dark-700'
              }`}
            >
              <div className="text-sm leading-relaxed whitespace-pre-line">{msg.content}</div>
              {msg.sql && (
                <div className="mt-2 pt-2 border-t border-dark-100/50">
                  <code className="text-[10px] font-mono text-dark-400 block truncate">
                    🗄️ {msg.sql}
                  </code>
                </div>
              )}
              {msg.cached && (
                <div className="mt-1 flex items-center gap-1">
                  <span className="text-[10px] text-dark-400">⚡ from cache</span>
                </div>
              )}
            </div>
            {msg.role === 'user' && (
              <div className="w-7 h-7 rounded-full bg-juno-dark-green flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-white text-[10px] font-semibold">A</span>
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex gap-3">
            <div className="w-7 h-7 rounded-full bg-juno-light-green flex items-center justify-center shrink-0">
              <Sparkles className="w-3.5 h-3.5 text-juno-dark-green" />
            </div>
            <div className="flex items-center gap-2 text-sm text-dark-400">
              <Icon name="refresh" className="w-4 h-4 animate-spin text-dark-400" />
              Thinking...
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-dark-100 p-3 shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleSubmit()
          }}
          className="flex gap-2"
        >
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question..."
            className="flex-1 px-3.5 py-2.5 rounded-xl border-2 border-dark-200 bg-dark-50 text-sm text-dark-900 placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-juno-green/20 focus:border-juno-green transition-all"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="w-10 h-10 bg-juno-dark-green hover:bg-juno-mid-green disabled:bg-dark-200 text-white rounded-xl flex items-center justify-center transition-all disabled:cursor-not-allowed shrink-0"
          >
            {loading ? <Icon name="refresh" className="w-4 h-4 animate-spin text-white" /> : <Icon name="send" className="w-4 h-4" />}
          </button>
        </form>
      </div>
    </div>
  )

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => {
          setOpen(!open)
          if (!open) setView('home')
        }}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-juno-dark-green hover:bg-juno-mid-green text-white rounded-full shadow-lg shadow-juno-dark-green/30 flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 group"
        aria-label="Juno Support"
      >
        {open ? (
          <Icon name="cancel" className="w-6 h-6" />
        ) : (
          <div className="relative">
            <Icon name="chat" className="w-6 h-6" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-juno-green rounded-full animate-pulse" />
          </div>
        )}
      </button>

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-[400px] max-w-[calc(100vw-48px)] h-[600px] max-h-[calc(100vh-160px)] bg-white rounded-2xl shadow-2xl border border-dark-100 flex flex-col overflow-hidden">
          {/* Header bar */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-dark-100 bg-dark-50 shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-juno-dark-green rounded-full flex items-center justify-center">
                <Icon name="chat" className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="text-sm font-semibold text-dark-900">Juno Support</span>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="p-1 text-dark-400 hover:text-dark-900 hover:bg-dark-100 rounded-lg transition-all"
            >
              <Icon name="cancel" className="w-4 h-4" />
            </button>
          </div>

          {/* Content area */}
          {view === 'home' && <HomeView />}
          {view === 'messages' && <MessagesView />}
          {view === 'chat' && <ChatView />}

          {/* Bottom Navigation */}
          <div className="flex items-center border-t border-dark-100 bg-white shrink-0">
            <button
              onClick={() => setView('home')}
              className={`flex-1 flex flex-col items-center gap-0.5 py-2.5 text-xs font-medium transition-colors ${
                view === 'home' ? 'text-juno-dark-green' : 'text-dark-400 hover:text-dark-600'
              }`}
            >
              <Icon name="home" className={`w-5 h-5 ${view === 'home' ? 'text-juno-dark-green' : ''}`} />
              <span>Home</span>
            </button>
            <button
              onClick={() => setView('messages')}
              className={`flex-1 flex flex-col items-center gap-0.5 py-2.5 text-xs font-medium transition-colors ${
                view === 'messages' ? 'text-juno-dark-green' : 'text-dark-400 hover:text-dark-600'
              }`}
            >
              <Icon name="chat" className={`w-5 h-5 ${view === 'messages' ? 'text-juno-dark-green' : ''}`} />
              <span>Messages</span>
              {messages.length > 0 && (
                <span className="absolute top-1 right-1/4 w-4 h-4 bg-juno-green text-juno-dark-green text-[9px] font-bold rounded-full flex items-center justify-center">
                  {messages.filter((m) => m.role === 'user').length}
                </span>
              )}
            </button>
            <button
              onClick={() => setView('chat')}
              className={`flex-1 flex flex-col items-center gap-0.5 py-2.5 text-xs font-medium transition-colors ${
                view === 'chat' ? 'text-juno-dark-green' : 'text-dark-400 hover:text-dark-600'
              }`}
            >
              <Icon name="help" className={`w-5 h-5 ${view === 'chat' ? 'text-juno-dark-green' : ''}`} />
              <span>Help</span>
            </button>
          </div>
        </div>
      )}
    </>
  )
}
