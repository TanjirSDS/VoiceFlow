import { describe, expect, it } from 'vitest'
import {
  AA_LARGE,
  AA_TEXT,
  contrast,
  derivePalette,
  isBrandColor,
  paletteCss,
  parseHex,
} from './brand-palette'

// The neutral surfaces from globals.css that the derivation is proven against.
const LIGHT_CARD = '#ffffff'
const LIGHT_PAGE = '#f4f6f9'
const DARK_CARD = '#13161e'
const DARK_PAGE = '#0a0c11'

/**
 * A deliberately hostile spread. The point of the derivation is that it holds
 * for colours a reseller actually picks, INCLUDING the ones that are hard:
 * near-white yellow (no room to darken a label onto it), pure black and pure
 * white (no hue at all), and mid-lightness saturated hues (the zone where
 * neither black nor white text is comfortable).
 */
const HOSTILE: [string, string][] = [
  ['VoiceFlow iris (the platform default)', '#5457e5'],
  ['safety yellow — brightest realistic brand', '#ffd400'],
  ['pure white', '#ffffff'],
  ['pure black', '#000000'],
  ['mid grey — no hue to work with', '#808080'],
  ['vivid cyan', '#00e5ff'],
  ['vivid lime', '#7fff00'],
  ['hot magenta', '#ff00aa'],
  ['blood red', '#c1121f'],
  ['navy — already dark', '#0b1f3a'],
  ['pale pastel pink', '#ffd9e8'],
  ['forest green', '#14532d'],
  ['orange', '#f97316'],
  ['teal', '#0d9488'],
]

// A full hue sweep at a punishing mid lightness/chroma — the band where a naive
// derivation fails, because neither a white nor a black label is comfortable.
const HUE_SWEEP = Array.from({ length: 24 }, (_, i) => {
  const h = (i * 15 * Math.PI) / 180
  // Build an sRGB colour around L≈0.6 by hand-rolling a simple HSL at 55% light.
  const hsl = (deg: number) => {
    const s = 0.9
    const l = 0.55
    const c = (1 - Math.abs(2 * l - 1)) * s
    const hp = deg / 60
    const x = c * (1 - Math.abs((hp % 2) - 1))
    const [r, g, b] =
      hp < 1 ? [c, x, 0] : hp < 2 ? [x, c, 0] : hp < 3 ? [0, c, x] : hp < 4 ? [0, x, c] : hp < 5 ? [x, 0, c] : [c, 0, x]
    const m = l - c / 2
    const to = (v: number) =>
      Math.round((v + m) * 255)
        .toString(16)
        .padStart(2, '0')
    return `#${to(r)}${to(g)}${to(b)}`
  }
  return [`hue ${i * 15}°`, hsl(((h * 180) / Math.PI) % 360)] as [string, string]
})

describe('parseHex / isBrandColor', () => {
  it('accepts exactly #rrggbb', () => {
    expect(isBrandColor('#5457e5')).toBe(true)
    expect(isBrandColor('#ABCDEF')).toBe(true)
  })

  // Each of these is a string that would otherwise be interpolated into a
  // <style> block. Shorthand and functional notation are refused rather than
  // normalised — fewer accepted shapes is fewer things to prove inert.
  it.each([
    ['shorthand', '#fff'],
    ['no hash', '5457e5'],
    ['functional', 'rgb(1,2,3)'],
    ['named', 'rebeccapurple'],
    ['eight digits (alpha)', '#5457e5ff'],
    ['trailing space', '#5457e5 '],
    ['css injection', '#fff;}body{display:none}'],
    ['expression', 'red; } body { background: url(http://evil/) '],
    ['empty', ''],
  ])('refuses %s', (_label, value) => {
    expect(isBrandColor(value)).toBe(false)
    expect(parseHex(value)).toBeNull()
    expect(derivePalette(value)).toBeNull()
  })

  it('refuses non-strings', () => {
    expect(isBrandColor(null)).toBe(false)
    expect(isBrandColor(undefined)).toBe(false)
    expect(isBrandColor(123)).toBe(false)
    expect(isBrandColor({ toString: () => '#5457e5' })).toBe(false)
  })
})

describe('contrast', () => {
  it('matches the WCAG reference extremes', () => {
    expect(contrast('#000000', '#ffffff')).toBeCloseTo(21, 1)
    expect(contrast('#ffffff', '#ffffff')).toBeCloseTo(1, 5)
  })

  it('is order-independent', () => {
    expect(contrast('#5457e5', '#ffffff')).toBeCloseTo(contrast('#ffffff', '#5457e5'), 10)
  })

  it('is 0 for an unparseable colour rather than throwing into a render', () => {
    expect(contrast('nope', '#ffffff')).toBe(0)
  })
})

/**
 * THE GUARANTEE. Every pair the UI actually forms has to clear its WCAG
 * threshold for every input, or a tenant ships an unreadable product carrying
 * their own name. These run over the hostile set AND a full hue sweep, so a
 * regression in the lightness search shows up as a specific failing hue rather
 * than as "it looked fine on indigo".
 */
describe.each([...HOSTILE, ...HUE_SWEEP])('derivePalette(%s = %s)', (_label, hex) => {
  const p = derivePalette(hex)!

  it('derives a palette', () => {
    expect(p).not.toBeNull()
    for (const v of [...Object.values(p.light), ...Object.values(p.dark)]) {
      expect(v).toMatch(/^#[0-9a-f]{6}$/)
    }
  })

  it('light: brand is readable as text on card and page', () => {
    expect(contrast(p.light.brand, LIGHT_CARD)).toBeGreaterThanOrEqual(AA_TEXT)
    expect(contrast(p.light.brand, LIGHT_PAGE)).toBeGreaterThanOrEqual(AA_TEXT)
  })

  it('light: brandStrong is readable on card AND on brandSoft (the ::selection pair)', () => {
    expect(contrast(p.light.brandStrong, LIGHT_CARD)).toBeGreaterThanOrEqual(AA_TEXT)
    expect(contrast(p.light.brandStrong, p.light.brandSoft)).toBeGreaterThanOrEqual(AA_TEXT)
  })

  it('light: the button label is readable on the button fill', () => {
    expect(contrast(p.light.primaryForeground, p.light.primary)).toBeGreaterThanOrEqual(AA_TEXT)
  })

  it('light: the focus ring is visible against the page', () => {
    expect(contrast(p.light.ring, LIGHT_PAGE)).toBeGreaterThanOrEqual(AA_LARGE)
  })

  it('light: soft tints stay tints — they must not read as a card or a fill', () => {
    // Close to the card (it is a tint OF the surface), far from the text that sits on it.
    expect(contrast(p.light.brandSoft, LIGHT_CARD)).toBeLessThan(AA_LARGE)
    expect(contrast(p.light.brandSofter, LIGHT_CARD)).toBeLessThan(AA_LARGE)
  })

  it('dark: brand is readable as text on card and page', () => {
    expect(contrast(p.dark.brand, DARK_CARD)).toBeGreaterThanOrEqual(AA_TEXT)
    expect(contrast(p.dark.brand, DARK_PAGE)).toBeGreaterThanOrEqual(AA_TEXT)
  })

  it('dark: brandStrong is readable on card AND on brandSoft', () => {
    expect(contrast(p.dark.brandStrong, DARK_CARD)).toBeGreaterThanOrEqual(AA_TEXT)
    expect(contrast(p.dark.brandStrong, p.dark.brandSoft)).toBeGreaterThanOrEqual(AA_TEXT)
  })

  it('dark: the button label is readable on the button fill', () => {
    expect(contrast(p.dark.primaryForeground, p.dark.primary)).toBeGreaterThanOrEqual(AA_TEXT)
  })

  it('dark: the focus ring is visible against the page', () => {
    expect(contrast(p.dark.ring, DARK_PAGE)).toBeGreaterThanOrEqual(AA_LARGE)
  })

  it('dark tints are dark — a light tint on a dark page is the classic inversion bug', () => {
    expect(contrast(p.dark.brandSoft, DARK_PAGE)).toBeLessThan(AA_LARGE)
  })
})

describe('derivePalette — identity is preserved, not just contrast', () => {
  // Contrast alone is satisfiable by returning black and white for everything.
  // These assert the result still LOOKS like the colour that was asked for.
  it('keeps a saturated brand saturated rather than collapsing it to grey', () => {
    const p = derivePalette('#c1121f')!
    const r = parseInt(p.light.primary.slice(1, 3), 16)
    const b = parseInt(p.light.primary.slice(5, 7), 16)
    expect(r - b).toBeGreaterThan(60) // still unmistakably red
  })

  it('a bright brand keeps a dark label instead of being dragged dark for a white one', () => {
    // The failure this guards: forcing white text onto safety yellow by
    // darkening it into olive. The correct answer is black text on yellow.
    const p = derivePalette('#ffd400')!
    expect(p.light.primaryForeground).toBe('#0c0e14')
    const g = parseInt(p.light.primary.slice(3, 5), 16)
    expect(g).toBeGreaterThan(150) // still bright
  })

  it('a dark brand keeps a light label', () => {
    const p = derivePalette('#0b1f3a')!
    expect(p.light.primaryForeground).toBe('#ffffff')
  })

  it('is deterministic — the same input always derives the same palette', () => {
    expect(derivePalette('#5457e5')).toEqual(derivePalette('#5457e5'))
  })

  it('an achromatic brand yields neutral tints, not a randomly tinted one', () => {
    const p = derivePalette('#808080')!
    const [r, g, b] = [1, 3, 5].map((i) => parseInt(p.light.brandSoft.slice(i, i + 2), 16))
    expect(Math.max(r, g, b) - Math.min(r, g, b)).toBeLessThanOrEqual(2)
  })
})

describe('paletteCss', () => {
  const css = paletteCss(derivePalette('#c1121f')!)

  it('emits BOTH scopes — :root alone would beat .dark and break dark mode', () => {
    expect(css).toContain(':root{')
    expect(css).toContain('.dark{')
  })

  it('declares every brand-dependent token in each scope', () => {
    for (const token of [
      '--color-brand:',
      '--color-brand-strong:',
      '--color-brand-soft:',
      '--color-brand-softer:',
      '--color-primary:',
      '--color-primary-foreground:',
      '--color-ring:',
    ]) {
      expect(css.split(token).length - 1).toBe(2)
    }
  })

  it('can only ever contain hex — nothing that could close the <style> element', () => {
    // Everything emitted came out of toHex(), so the character set is closed.
    // Asserted directly because this is what makes the injection point safe.
    expect(css).not.toMatch(/[<>"'`\\]/)
    const values = [...css.matchAll(/--color-[a-z-]+:([^;}]*)/g)].map((m) => m[1])
    expect(values.length).toBe(14)
    for (const v of values) expect(v).toMatch(/^#[0-9a-f]{6}$/)
  })
})
