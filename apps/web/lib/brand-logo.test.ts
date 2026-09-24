import { describe, expect, it } from 'vitest'
import { ALLOWED_LOGO_TYPES, checkLogo, logoKey, MAX_LOGO_BYTES, sniffImageType } from './brand-logo'

const bytes = (...v: number[]) => new Uint8Array(v)
const PNG = bytes(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0)
const JPEG = bytes(0xff, 0xd8, 0xff, 0xe0, 0, 0, 0, 0)
const WEBP = bytes(0x52, 0x49, 0x46, 0x46, 0, 0, 0, 0, 0x57, 0x45, 0x42, 0x50)
const utf8 = (s: string) => new TextEncoder().encode(s)

describe('sniffImageType — what the bytes actually are', () => {
  it('recognises the three accepted formats', () => {
    expect(sniffImageType(PNG)).toBe('image/png')
    expect(sniffImageType(JPEG)).toBe('image/jpeg')
    expect(sniffImageType(WEBP)).toBe('image/webp')
  })

  it('does not mistake a truncated header for a valid image', () => {
    expect(sniffImageType(bytes(0x89, 0x50))).toBeNull()
    expect(sniffImageType(bytes(0x52, 0x49, 0x46, 0x46))).toBeNull() // RIFF but not WEBP
  })

  it('returns null for empty input', () => {
    expect(sniffImageType(new Uint8Array(0))).toBeNull()
  })
})

/**
 * THE REASON THIS MODULE EXISTS.
 *
 * The logo is served from our own origin so the CSP can stay img-src 'self'.
 * That makes any uploaded file that a browser will treat as a DOCUMENT a
 * stored-XSS primitive in our origin. The declared MIME type and the filename
 * both come from the uploader, so neither is consulted — only the bytes.
 */
describe('checkLogo — refuses anything a browser could execute', () => {
  it('accepts a real PNG', () => {
    expect(checkLogo(PNG)).toEqual({ ok: true, contentType: 'image/png' })
  })

  it('refuses SVG, which can carry <script>', () => {
    const svg = utf8('<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>')
    const res = checkLogo(svg)
    expect(res.ok).toBe(false)
    expect(res.ok === false && res.error).toMatch(/SVG is not accepted/)
  })

  it('refuses SVG with a leading XML declaration too', () => {
    expect(checkLogo(utf8('<?xml version="1.0"?><svg onload="alert(1)"/>')).ok).toBe(false)
  })

  it('refuses HTML', () => {
    expect(checkLogo(utf8('<!doctype html><script>alert(1)</script>')).ok).toBe(false)
  })

  it('refuses a file whose NAME and declared type say PNG but whose bytes do not', () => {
    // The whole attack: upload evil.svg renamed to logo.png with
    // Content-Type: image/png. Nothing but the magic number catches it.
    expect(checkLogo(utf8('<svg/>')).ok).toBe(false)
  })

  it('SVG is not in the accepted list at all', () => {
    expect(ALLOWED_LOGO_TYPES as readonly string[]).not.toContain('image/svg+xml')
    expect([...ALLOWED_LOGO_TYPES].sort()).toEqual(['image/jpeg', 'image/png', 'image/webp'])
  })

  it('refuses an empty file', () => {
    expect(checkLogo(new Uint8Array(0)).ok).toBe(false)
  })

  it('refuses a file over the size ceiling', () => {
    const big = new Uint8Array(MAX_LOGO_BYTES + 1)
    big.set(PNG.slice(0, 8))
    const res = checkLogo(big)
    expect(res.ok).toBe(false)
    expect(res.ok === false && res.error).toMatch(/under/)
  })

  it('accepts a file exactly at the ceiling', () => {
    const atLimit = new Uint8Array(MAX_LOGO_BYTES)
    atLimit.set(PNG.slice(0, 8))
    expect(checkLogo(atLimit).ok).toBe(true)
  })
})

describe('logoKey', () => {
  it('namespaces by org so one tenant cannot overwrite another', () => {
    expect(logoKey('org-a', 'v1')).toBe('branding/org-a/logo-v1')
    expect(logoKey('org-a', 'v1')).not.toBe(logoKey('org-b', 'v1'))
  })

  it('changes with the version, so a replaced logo is not served from cache', () => {
    expect(logoKey('org-a', 'v1')).not.toBe(logoKey('org-a', 'v2'))
  })
})
