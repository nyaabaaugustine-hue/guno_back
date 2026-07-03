'use client'

import { useRouter } from 'next/navigation'
import Icon from '@/components/Icon'

export default function TaxPreparationPage() {
  const router = useRouter()

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center">
      <div className="max-w-2xl w-full text-center space-y-8">
        {/* Hero Icon */}
        <div className="relative inline-flex">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-juno-dark-green to-juno-accent flex items-center justify-center shadow-2xl shadow-juno-dark-green/30">
            <Icon name="document" className="w-12 h-12 text-white" />
          </div>
          <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
            <Icon name="visible" className="w-4 h-4 text-white" />
          </div>
        </div>

        {/* Title */}
        <div>
          <h1 className="text-4xl font-display font-bold text-dark-900 tracking-tight mb-3">
            Tax Preparation
          </h1>
          <p className="text-lg text-dark-500 max-w-md mx-auto">
            Start preparing tax returns with AI-powered assistance.
          </p>
        </div>

        {/* Premium Button */}
        <div className="pt-2">
          <button
            onClick={() => router.push('/tax-preparation/new')}
            className="group relative inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-juno-dark-green via-[#0B5D3E] to-juno-accent text-white text-lg font-bold rounded-2xl shadow-2xl shadow-juno-dark-green/30 hover:shadow-juno-dark-green/50 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
            <span className="relative z-10">START TAX PREPARATION</span>
            <Icon name="forward" className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform duration-200" />
          </button>
        </div>

        {/* Feature cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-8">
          <div className="card p-5 hover:shadow-lg transition-all duration-300">
            <div className="w-10 h-10 bg-juno-light-green rounded-xl flex items-center justify-center mb-3">
              <Icon name="check" className="w-5 h-5 text-juno-dark-green" />
            </div>
            <h3 className="text-sm font-semibold text-dark-900 mb-1">AI-Powered</h3>
            <p className="text-xs text-dark-500">Intelligent error detection and deduction suggestions</p>
          </div>
          <div className="card p-5 hover:shadow-lg transition-all duration-300">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center mb-3">
              <Icon name="document" className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="text-sm font-semibold text-dark-900 mb-1">Multi-Form</h3>
            <p className="text-xs text-dark-500">Support for 1040, 1120, 1120-S, and 1065</p>
          </div>
          <div className="card p-5 hover:shadow-lg transition-all duration-300">
            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center mb-3">
              <Icon name="statistics" className="w-5 h-5 text-purple-600" />
            </div>
            <h3 className="text-sm font-semibold text-dark-900 mb-1">Real-Time</h3>
            <p className="text-xs text-dark-500">Updated tax laws and compliance checks</p>
          </div>
        </div>
      </div>
    </div>
  )
}
