'use client'

import {
  Search, Plus, Users, X, Clock, MessageCircle, Paperclip, Star, Info,
  RefreshCw, ArrowLeft, ArrowRight, Play, Check, Send, HelpCircle,
  FileText, BookOpen, Link2, LifeBuoy, Calendar, BarChart3, AlertCircle,
  Eye, DollarSign, Upload, Home, Circle, type LucideIcon,
} from 'lucide-react'

interface IconProps {
  name: string
  size?: number
  className?: string
}

/**
 * Maps the app's plain-English icon names (originally icons8 filenames)
 * to lucide-react components. lucide-react ships as an actual npm
 * package — no network request, no CSP allowlist needed, no third-party
 * icon-CDN licensing to worry about, and it still renders (previously,
 * every <Icon /> in the app was silently blocked by the CSP's
 * `img-src 'self' blob: data:` policy, since icons8.com was never
 * allowlisted and mask-image URLs are governed by img-src).
 */
const ICONS: Record<string, LucideIcon> = {
  search: Search,
  plus: Plus,
  teamwork: Users,
  cancel: X,
  close: X,
  clock: Clock,
  chat: MessageCircle,
  attach: Paperclip,
  star: Star,
  info: Info,
  refresh: RefreshCw,
  back: ArrowLeft,
  forward: ArrowRight,
  play: Play,
  check: Check,
  send: Send,
  help: HelpCircle,
  document: FileText,
  book: BookOpen,
  link: Link2,
  support: LifeBuoy,
  calendar: Calendar,
  statistics: BarChart3,
  error: AlertCircle,
  visible: Eye,
  money: DollarSign,
  upload: Upload,
  home: Home,
}

/**
 * Icon component backed by lucide-react.
 * Keeps the original name/size/className API so no call site changes.
 *
 * Usage:
 *   <Icon name="search" className="w-5 h-5 text-dark-400" />
 *   <Icon name="plus" size={24} className="text-juno-dark-green" />
 */
export default function Icon({ name, size = 24, className = '' }: IconProps) {
  const Component = ICONS[name] ?? Circle

  if (process.env.NODE_ENV !== 'production' && !ICONS[name]) {
    // eslint-disable-next-line no-console
    console.warn(`Icon: no lucide mapping for "${name}" — add one in components/Icon.tsx`)
  }

  return <Component size={size} className={`shrink-0 ${className}`} aria-hidden="true" />
}
