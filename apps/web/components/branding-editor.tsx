'use client'

import { useMemo, useState, useTransition } from 'react'
import { toast } from 'sonner'
import { removeLogoAction, saveBrandingAction, uploadLogoAction } from '../app/agency/actions'
import { derivePalette, isBrandColor, type BrandTokens } from '../lib/brand-palette'
import { PLATFORM_BRAND_COLOR, PLATFORM_PRODUCT_NAME } from '../lib/brand-constants'
import { Button } from './ui/button'
import { Card, CardContent } from './ui/card'
import { Input } from './ui/input'
import { Label } from './ui/label'

export interface BrandingValues {
  productName: string
  brandColor: string
  supportEmail: string
  customDomain: string
}

/**
 * The branding form, with a preview that renders from the SAME derivation the
 * server uses (lib/brand-palette is pure and browser-safe).
 *
 * That shared function is the whole point of the preview. A hand-built mock
 * would be a second implementation of the palette, and the moment the two
 * disagreed the preview would be confidently wrong — which is worse than no
 * preview at all, because a reseller would ship a colour they had "checked".
 */
export function BrandingEditor({
  initial,
  targetOrgId,
  scopeLabel,
  inheritedFrom,
  senderVerified,
  platformFromAddress,
  hasLogo,
  logoStorage,
}: {
  initial: BrandingValues
  /** Omitted for the agency's own branding; set when editing one client. */
  targetOrgId?: string
  scopeLabel: string
  /** When set, empty fields fall back to this org's branding, not the platform's. */
  inheritedFrom?: string
  senderVerified: boolean
  platformFromAddress: string
  hasLogo: boolean
  /** False when the deployment has no object store — upload is unavailable. */
  logoStorage: boolean
}) {
  const [values, setValues] = useState<BrandingValues>(initial)
  const [pending, start] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const set = <K extends keyof BrandingValues>(k: K, v: BrandingValues[K]) =>
    setValues((s) => ({ ...s, [k]: v }))

  const colorValid = !values.brandColor || isBrandColor(values.brandColor)
  const effectiveColor = colorValid && values.brandColor ? values.brandColor : PLATFORM_BRAND_COLOR
  const palette = useMemo(() => derivePalette(effectiveColor), [effectiveColor])
  const productName = values.productName.trim() || inheritedFrom || PLATFORM_PRODUCT_NAME

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,420px)]">
      <Card>
        <CardContent className="p-6">
          <form
            action={(fd) =>
              start(async () => {
                setError(null)
                const res = await saveBrandingAction(fd)
                if (res.error) {
                  setError(res.error)
                  return
                }
                toast.success(`Branding saved for ${scopeLabel}`)
              })
            }
            className="space-y-5"
          >
            {targetOrgId && <input type="hidden" name="orgId" value={targetOrgId} />}

            <div className="space-y-1.5">
              <Label htmlFor="productName">Product name</Label>
              <Input
                id="productName"
                name="productName"
                maxLength={40}
                value={values.productName}
                onChange={(e) => set('productName', e.target.value)}
                placeholder={inheritedFrom ?? PLATFORM_PRODUCT_NAME}
              />
              <p className="text-xs text-muted-foreground">
                Appears in the sidebar, the browser tab, and every email they receive.
                {inheritedFrom && ' Leave blank to inherit ' + inheritedFrom + '.'}
              </p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="brandColor">Brand colour</Label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  aria-label="Pick brand colour"
                  value={effectiveColor}
                  onChange={(e) => set('brandColor', e.target.value)}
                  className="h-10 w-12 cursor-pointer rounded-lg border bg-card p-1"
                />
                <Input
                  id="brandColor"
                  name="brandColor"
                  value={values.brandColor}
                  onChange={(e) => set('brandColor', e.target.value)}
                  placeholder={PLATFORM_BRAND_COLOR}
                  className="font-mono"
                  aria-invalid={!colorValid}
                />
              </div>
              {!colorValid ? (
                <p className="text-xs text-destructive">Use a six-digit hex value, like #1a73e8.</p>
              ) : (
                <p className="text-xs text-muted-foreground">
                  One colour — buttons, links, highlights and the focus ring are derived from it,
                  and each is adjusted until it stays legible on both light and dark backgrounds.
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="supportEmail">Support email</Label>
              <Input
                id="supportEmail"
                name="supportEmail"
                type="email"
                value={values.supportEmail}
                onChange={(e) => set('supportEmail', e.target.value)}
                placeholder="help@your-agency.com"
              />
              <p className="text-xs text-muted-foreground">
                Shown at the foot of their emails, so they reach you and not us.
              </p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="customDomain">Custom domain</Label>
              <Input
                id="customDomain"
                name="customDomain"
                value={values.customDomain}
                onChange={(e) => set('customDomain', e.target.value)}
                placeholder="voice.your-agency.com"
                className="font-mono"
              />
              <p className="text-xs text-muted-foreground">
                Point a CNAME at us and their sign-in page and dashboard answer on your domain.
                Links in their emails will use it too.
              </p>
            </div>

            {/* Stated plainly rather than hidden: this is the one place the
                platform is still visible, and a reseller needs to know before a
                client notices it first. */}
            <div className="rounded-lg border border-dashed p-3 text-xs text-muted-foreground">
              <span className="font-medium text-foreground">Email sender</span>{' '}
              {senderVerified ? (
                <>is verified — mail goes out from your own domain.</>
              ) : (
                <>
                  shows your product name, but the address is still{' '}
                  <span className="font-mono">{platformFromAddress}</span>. Sending from your own
                  domain needs its DNS verified by us first — ask and we will set it up.
                </>
              )}
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <div className="flex justify-end">
              <Button type="submit" disabled={pending || !colorValid}>
                {pending ? 'Saving…' : 'Save branding'}
              </Button>
            </div>
          </form>

          {/* A SEPARATE form, outside the one above. HTML forbids nested forms
              and React drops the inner one silently — the upload button would
              simply submit the text fields instead. */}
          <LogoField targetOrgId={targetOrgId} hasLogo={hasLogo} logoStorage={logoStorage} />
        </CardContent>
      </Card>

      <div className="space-y-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          What your client sees
        </p>
        {palette && <Preview productName={productName} tokens={palette.light} theme="light" />}
        {palette && <Preview productName={productName} tokens={palette.dark} theme="dark" />}
      </div>
    </div>
  )
}

/**
 * A miniature of the real shell, painted with the derived tokens.
 *
 * Inline CSS custom properties rather than Tailwind classes: the preview has to
 * show the CLIENT's palette while the page around it stays on the reseller's,
 * so it cannot use the ambient --color-* tokens. Setting them on a wrapper
 * scopes the override to this box exactly the way the real injected stylesheet
 * scopes it to a document.
 */
function Preview({
  productName,
  tokens,
  theme,
}: {
  productName: string
  tokens: BrandTokens
  theme: 'light' | 'dark'
}) {
  const light = theme === 'light'
  const surface = light ? '#ffffff' : '#13161e'
  const page = light ? '#f4f6f9' : '#0a0c11'
  const ink = light ? '#0c0e14' : '#e8ecf3'
  const dim = light ? '#616b7a' : '#8b97a8'
  const line = light ? '#e6e9ef' : '#262b37'

  return (
    <div className="overflow-hidden rounded-xl border" style={{ background: page, borderColor: line }}>
      <div className="flex items-center gap-2 border-b px-3 py-2.5" style={{ borderColor: line }}>
        <span
          className="grid h-6 w-6 place-items-center rounded-md text-[11px] font-bold uppercase"
          style={{ background: tokens.brandSoft, color: tokens.brandStrong }}
        >
          {productName.trim().slice(0, 1) || '?'}
        </span>
        <span className="truncate text-xs font-semibold" style={{ color: ink }}>
          {productName}
        </span>
        <span className="ml-auto text-[10px] uppercase tracking-wider" style={{ color: dim }}>
          {theme}
        </span>
      </div>

      <div className="space-y-3 p-3">
        <div className="rounded-lg p-3" style={{ background: surface, border: `1px solid ${line}` }}>
          <div className="text-[10px] uppercase tracking-wider" style={{ color: dim }}>
            Calls this week
          </div>
          <div className="stat-num text-xl" style={{ color: ink }}>
            128
          </div>
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full" style={{ background: tokens.brandSoft }}>
            <div className="h-full w-2/3 rounded-full" style={{ background: tokens.brand }} />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span
            className="rounded-lg px-3 py-1.5 text-xs font-semibold"
            style={{ background: tokens.primary, color: tokens.primaryForeground }}
          >
            New agent
          </span>
          <span
            className="rounded-lg px-3 py-1.5 text-xs font-medium"
            style={{ background: tokens.brandSoft, color: tokens.brandStrong }}
          >
            Live
          </span>
          <span className="text-xs font-medium" style={{ color: tokens.brand }}>
            View all →
          </span>
        </div>

        <div
          className="rounded-lg px-3 py-2 text-xs"
          style={{ background: surface, border: `2px solid ${tokens.ring}`, color: dim }}
        >
          Focused input
        </div>
      </div>
    </div>
  )
}

/**
 * Logo upload. Its own form, and its own round trip — a file is not a text
 * field and should not make saving a colour wait on a network upload.
 */
function LogoField({
  targetOrgId,
  hasLogo,
  logoStorage,
}: {
  targetOrgId?: string
  hasLogo: boolean
  logoStorage: boolean
}) {
  const [pending, start] = useTransition()
  const [error, setError] = useState<string | null>(null)

  if (!logoStorage) {
    return (
      <div className="mt-6 border-t pt-5 text-xs text-muted-foreground">
        <span className="font-medium text-foreground">Logo</span> — image storage is not configured
        on this deployment, so your product name is shown as a wordmark instead.
      </div>
    )
  }

  const run = (fd: FormData, action: (f: FormData) => Promise<{ error?: string }>, msg: string) =>
    start(async () => {
      setError(null)
      const res = await action(fd)
      if (res.error) {
        setError(res.error)
        return
      }
      toast.success(msg)
    })

  return (
    <div className="mt-6 space-y-3 border-t pt-5">
      <Label htmlFor="logo">Logo</Label>
      <form action={(fd) => run(fd, uploadLogoAction, 'Logo updated')} className="flex flex-wrap items-center gap-3">
        {targetOrgId && <input type="hidden" name="orgId" value={targetOrgId} />}
        <Input
          id="logo"
          name="logo"
          type="file"
          // Raster only. The server re-checks the magic bytes — this attribute
          // is a file-picker filter, never the gate.
          accept="image/png,image/jpeg,image/webp"
          required
          className="max-w-xs"
        />
        <Button type="submit" variant="outline" disabled={pending}>
          {pending ? 'Uploading…' : 'Upload'}
        </Button>
      </form>
      {hasLogo && (
        <form action={(fd) => run(fd, removeLogoAction, 'Logo removed')}>
          {targetOrgId && <input type="hidden" name="orgId" value={targetOrgId} />}
          <button type="submit" className="text-xs text-muted-foreground underline hover:text-foreground">
            Remove logo and use the product name instead
          </button>
        </form>
      )}
      <p className="text-xs text-muted-foreground">
        PNG, JPEG or WebP, under 512 KB. SVG is not accepted. Shown in the sidebar and on the
        sign-in page; emails use your product name as text, because most mail clients block images
        by default.
      </p>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  )
}
