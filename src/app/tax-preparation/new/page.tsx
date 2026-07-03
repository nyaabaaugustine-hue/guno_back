'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Icon from '@/components/Icon'
import Modal from '@/components/Modal'

interface ReturnType {
  form: string
  label: string
  description: string
  icon: string
  color: string
  bgColor: string
}

const returnTypes: ReturnType[] = [
  {
    form: '1040',
    label: 'Individual',
    description: 'U.S. Individual Income Tax Return',
    icon: 'user',
    color: 'text-juno-dark-green',
    bgColor: 'bg-juno-light-green',
  },
  {
    form: '1120',
    label: 'Business',
    description: 'U.S. Corporation Income Tax Return',
    icon: 'building',
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-100',
  },
  {
    form: '1120-S',
    label: 'Business',
    description: 'U.S. S Corporation Income Tax Return',
    icon: 'organization',
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-100',
  },
  {
    form: '1065',
    label: 'Business',
    description: 'U.S. Return of Partnership Income',
    icon: 'teamwork',
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-100',
  },
]

export default function NewReturnPage() {
  const router = useRouter()
  const [selected, setSelected] = useState<ReturnType | null>(null)
  const [showConfirm, setShowConfirm] = useState(false)

  const handleSelect = (rt: ReturnType) => {
    setSelected(rt)
    setShowConfirm(true)
  }

  const handleConfirm = () => {
    setShowConfirm(false)
    // In production, this would navigate to the actual tax preparation form
    // For now, navigate back to the returns page
    router.push('/returns')
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => router.push('/tax-preparation')}
          className="p-2 text-dark-500 hover:text-dark-900 hover:bg-dark-100 rounded-xl transition-colors"
          aria-label="Go back"
        >
          <Icon name="back" className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-display font-bold text-dark-900">Select Return Type</h1>
          <p className="text-dark-500 text-sm mt-1">Choose the type of tax return you'd like to prepare for this client.</p>
        </div>
        <div className="w-8 h-8 bg-juno-dark-green rounded-full flex items-center justify-center text-white text-xs font-semibold">
          AN
        </div>
      </div>

      {/* Trial Status */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex items-center gap-2 bg-juno-light-green text-juno-dark-green px-3 py-1.5 rounded-lg text-sm font-medium">
          <span className="w-2 h-2 bg-juno-dark-green rounded-full" />
          Preparer
        </div>
        <div className="flex items-center gap-1.5 text-sm text-dark-500">
          <Icon name="clock" className="w-4 h-4" />
          <span>0/5 Free Preparations started.</span>
        </div>
        <div className="text-sm text-dark-500">3d 20h Left in Your Trial</div>
      </div>

      {/* Return Type Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {returnTypes.map((rt) => (
          <button
            key={rt.form}
            onClick={() => handleSelect(rt)}
            className="group flex items-center gap-4 p-5 bg-white rounded-2xl border-2 border-dark-100 hover:border-juno-accent hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 text-left"
          >
            <div className={`w-16 h-16 ${rt.bgColor} rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300`}>              <Icon name={rt.icon} className={`w-7 h-7 ${rt.color}`} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-1">
                <h3 className="text-xl font-bold text-dark-900">{rt.form}</h3>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                  rt.label === 'Individual'
                    ? 'bg-juno-light-green text-juno-dark-green'
                    : 'bg-emerald-100 text-emerald-700'
                }`}>
                  {rt.label}
                </span>
              </div>
              <p className="text-sm text-dark-500 truncate">{rt.description}</p>
            </div>
            <Icon name="forward" className="w-5 h-5 text-dark-300 group-hover:text-juno-accent group-hover:translate-x-1 transition-all duration-200 shrink-0" />
          </button>
        ))}
      </div>

      {/* Confirmation Modal */}
      <Modal open={showConfirm} onClose={() => setShowConfirm(false)} title="Confirm Return Type">
        {selected && (
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className={`w-14 h-14 ${selected.bgColor} rounded-2xl flex items-center justify-center`}>                <Icon name={selected.icon} className={`w-6 h-6 ${selected.color}`} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-dark-900">Form {selected.form}</h3>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                    selected.label === 'Individual'
                      ? 'bg-juno-light-green text-juno-dark-green'
                      : 'bg-emerald-100 text-emerald-700'
                  }`}>
                    {selected.label}
                  </span>
                </div>
                <p className="text-sm text-dark-500 mt-0.5">{selected.description}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 justify-end">
              <button
                onClick={() => setShowConfirm(false)}
                className="btn btn-ghost"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                className="btn btn-primary"
              >
                Start Preparing
                <Icon name="forward" className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
