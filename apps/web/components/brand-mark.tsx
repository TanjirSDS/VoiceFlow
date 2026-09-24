import { cn } from '../lib/utils'
import { Logo } from './icons'

/**
 * Phase 27 — the product's identity mark, wherever it appears.
 *
 * Three states, and the middle one is the one that matters:
 *
 *   platform                    → the VoiceFlow logo tile + wordmark
 *   white-labelled, has a logo  → their logo image
 *   white-labelled, no logo yet → a monogram tile + their product name
 *
 * The third exists because falling back to <Logo/> would put OUR waveform next
 * to THEIR name — which is the exact failure the tier is sold to prevent, and it
 * would appear the moment a reseller set a name before uploading artwork. The
 * monogram keeps the same tile geometry, radius and shadow as the real logo, so
 * the shell does not reflow between the two and the design system still holds;
 * only the glyph inside changes.
 *
 * Its colours are `bg-brand-soft text-brand-strong`, which is the pair the
 * palette derivation is proven to keep above 4.5:1 for any hue — so a monogram
 * is legible on a tenant colour we have never seen.
 */
export function BrandMark({
  productName,
  logoUrl,
  whiteLabelled,
  className,
  size = 'md',
}: {
  productName: string
  logoUrl: string | null
  whiteLabelled: boolean
  className?: string
  /** `sm` is the collapsed sidebar rail; `md` is everywhere else. */
  size?: 'sm' | 'md'
}) {
  const tile = size === 'sm' ? 'h-8 w-8 rounded-[10px] text-xs' : 'h-9 w-9 rounded-[11px] text-sm'

  if (logoUrl) {
    // A plain <img>, not next/image: a tenant-uploaded logo has no build-time
    // dimensions, is already served from our own origin by /api/branding/logo,
    // and next/image would add a second hop plus a cache keyed on a URL that is
    // identical for every tenant — which is exactly the sharing bug that route's
    // `private` cache-control exists to avoid.
    return (
      <img
        src={logoUrl}
        alt={productName}
        className={cn('w-auto object-contain', size === 'sm' ? 'h-8 max-w-8' : 'h-8 max-w-[168px]', className)}
      />
    )
  }

  if (whiteLabelled) {
    // First character of the product name. Intl.Segmenter so an emoji or a
    // combining accent counts as one glyph rather than rendering half of one.
    const first = firstGrapheme(productName)
    return (
      <span
        className={cn(
          'grid shrink-0 place-items-center bg-brand-soft font-display font-bold uppercase text-brand-strong',
          tile,
          className
        )}
        aria-hidden
      >
        {first}
      </span>
    )
  }

  return <Logo className={cn(size === 'sm' && 'h-8 w-8 rounded-[10px]', className)} />
}

function firstGrapheme(s: string): string {
  const t = s.trim()
  if (!t) return '?'
  if (typeof Intl !== 'undefined' && 'Segmenter' in Intl) {
    const seg = new Intl.Segmenter(undefined, { granularity: 'grapheme' })
    for (const { segment } of seg.segment(t)) return segment
  }
  return t.slice(0, 2)
}

/** Mark plus wordmark — the signed-out header and the sidebar switcher. */
export function BrandLockup({
  productName,
  logoUrl,
  whiteLabelled,
  className,
}: {
  productName: string
  logoUrl: string | null
  whiteLabelled: boolean
  className?: string
}) {
  return (
    <span className={cn('flex items-center gap-3', className)}>
      <BrandMark productName={productName} logoUrl={logoUrl} whiteLabelled={whiteLabelled} />
      {/* A logo image already carries the name, so repeating it as text would
          set the tenant's wordmark twice at two different weights. */}
      {!logoUrl && (
        <span className="font-display text-lg font-semibold tracking-tight">{productName}</span>
      )}
    </span>
  )
}
