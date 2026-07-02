'use client'

interface IconProps {
  name: string
  size?: number
  className?: string
}

/**
 * Icon component using icons8 CDN.
 * Uses CSS mask-image so the icon inherits the current text color (via currentColor).
 * This means you can style it with any Tailwind text color class (e.g. text-blue-600).
 *
 * Usage:
 *   <Icon name="home" className="w-5 h-5 text-dark-400" />
 *   <Icon name="plus" size={24} className="text-juno-dark-green" />
 */
export default function Icon({ name, size = 24, className = '' }: IconProps) {
  const url = `https://img.icons8.com/fluency-systems-regular/${size}/${name}.png`

  return (
    <span
      className={`inline-block shrink-0 ${className}`}
      style={{
        width: size,
        height: size,
        backgroundColor: 'currentColor',
        maskImage: `url(${url})`,
        maskSize: 'contain',
        maskRepeat: 'no-repeat',
        maskPosition: 'center',
        WebkitMaskImage: `url(${url})`,
        WebkitMaskSize: 'contain',
        WebkitMaskRepeat: 'no-repeat',
        WebkitMaskPosition: 'center',
      }}
      aria-hidden="true"
    />
  )
}
