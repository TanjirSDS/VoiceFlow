/**
 * Phase 27 — deriving the Signal palette from one agency brand colour.
 *
 * A reseller gives us a single hex. Everything the UI needs — the brand text
 * colour, the button fill, the label on that fill, the soft badge background,
 * the focus ring, and a second full set for dark mode — is computed from it.
 *
 * WHY ONE INPUT AND NOT TWELVE. A form with twelve colour pickers reliably
 * produces an unreadable product with someone else's name on it: white text on
 * a pastel button, a "soft" background indistinguishable from the card, a focus
 * ring nobody can see. The reseller does not want to design a palette; they want
 * their colour. So we take the colour and hold the relationships ourselves.
 *
 * HOW THE CONTRAST GUARANTEE WORKS. Every derived colour is produced by taking
 * the brand hue and chroma and moving ONLY its lightness until the pair it must
 * form meets its WCAG ratio. Hue is never rotated and chroma is only reduced to
 * stay in gamut, so the result still reads as the agency's colour; lightness is
 * the one axis a human does not notice being corrected. The search always
 * terminates because the extremes (black, white) sit far beyond any threshold we
 * ask for.
 *
 * Working space is OKLab/OKLCH. sRGB lightness is not perceptual — darkening a
 * yellow and a blue by the same sRGB amount changes their apparent brightness by
 * very different amounts, so a ratio search in sRGB lands somewhere different for
 * every hue. In OKLab, "same L" means "looks equally bright", which is what makes
 * one set of constants below work for all of them.
 *
 * Pure, dependency-free and browser-safe: the branding editor previews with the
 * exact function the server renders with, so the preview cannot lie.
 */

/** WCAG AA for normal text. Body copy, labels on buttons, badge text. */
export const AA_TEXT = 4.5
/** WCAG AA for large text and meaningful non-text edges (focus rings, borders). */
export const AA_LARGE = 3

// ── sRGB ⇄ linear ⇄ OKLab ────────────────────────────────────────────────────

interface Rgb {
  r: number
  g: number
  b: number
} // 0..1, gamma-encoded sRGB
interface Lab {
  L: number
  a: number
  b: number
} // OKLab
interface Lch {
  L: number
  C: number
  h: number
} // OKLCH, h in radians

function srgbToLinear(c: number): number {
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
}

function linearToSrgb(c: number): number {
  return c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055
}

// Björn Ottosson's OKLab matrices (the reference values from the 2020 write-up).
function rgbToLab({ r, g, b }: Rgb): Lab {
  const lr = srgbToLinear(r)
  const lg = srgbToLinear(g)
  const lb = srgbToLinear(b)
  const l = Math.cbrt(0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb)
  const m = Math.cbrt(0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb)
  const s = Math.cbrt(0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb)
  return {
    L: 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    a: 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    b: 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  }
}

function labToRgb({ L, a, b }: Lab): Rgb {
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b
  const s_ = L - 0.0894841775 * a - 1.291485548 * b
  const l = l_ * l_ * l_
  const m = m_ * m_ * m_
  const s = s_ * s_ * s_
  return {
    r: linearToSrgb(4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s),
    g: linearToSrgb(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s),
    b: linearToSrgb(-0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s),
  }
}

function labToLch({ L, a, b }: Lab): Lch {
  return { L, C: Math.hypot(a, b), h: Math.atan2(b, a) }
}

function lchToLab({ L, C, h }: Lch): Lab {
  return { L, a: C * Math.cos(h), b: C * Math.sin(h) }
}

const inGamut = ({ r, g, b }: Rgb): boolean =>
  r >= -1e-4 && r <= 1 + 1e-4 && g >= -1e-4 && g <= 1 + 1e-4 && b >= -1e-4 && b <= 1 + 1e-4

/**
 * OKLCH → sRGB, reducing chroma until the colour actually exists in sRGB.
 *
 * Raising or lowering lightness at a fixed chroma walks straight out of the sRGB
 * solid for saturated hues, and naively clamping the channels there shifts the
 * HUE (clipping blue while red and green stay put is a different colour, not a
 * darker one). Binary-searching chroma down instead desaturates toward the same
 * hue and lightness, which is the mistake a human will not notice.
 */
function lchToRgbClamped(lch: Lch): Rgb {
  const direct = labToRgb(lchToLab(lch))
  if (inGamut(direct)) return clampRgb(direct)
  let lo = 0
  let hi = lch.C
  for (let i = 0; i < 24; i++) {
    const mid = (lo + hi) / 2
    if (inGamut(labToRgb(lchToLab({ ...lch, C: mid })))) lo = mid
    else hi = mid
  }
  return clampRgb(labToRgb(lchToLab({ ...lch, C: lo })))
}

const clampRgb = ({ r, g, b }: Rgb): Rgb => ({
  r: Math.min(1, Math.max(0, r)),
  g: Math.min(1, Math.max(0, g)),
  b: Math.min(1, Math.max(0, b)),
})

// ── hex ⇄ rgb ────────────────────────────────────────────────────────────────

/**
 * The ONLY accepted shape is exactly `#` + six hex digits.
 *
 * This is a security boundary, not a formatting preference: the value is
 * interpolated into a <style> block and into inline styles in outgoing email.
 * Three-digit shorthand, `rgb()`, and named colours are all refused rather than
 * normalised — every additional accepted shape is another string that has to be
 * proven inert, and nobody needs to type `#fff` into a branding form.
 */
export function parseHex(hex: string): Rgb | null {
  if (!/^#[0-9a-fA-F]{6}$/.test(hex)) return null
  return {
    r: parseInt(hex.slice(1, 3), 16) / 255,
    g: parseInt(hex.slice(3, 5), 16) / 255,
    b: parseInt(hex.slice(5, 7), 16) / 255,
  }
}

/** True for exactly the shape parseHex accepts. Re-exported as the app-side guard. */
export const isBrandColor = (v: unknown): v is string => typeof v === 'string' && parseHex(v) !== null

function toHex({ r, g, b }: Rgb): string {
  const c = (v: number) =>
    Math.round(Math.min(1, Math.max(0, v)) * 255)
      .toString(16)
      .padStart(2, '0')
  return `#${c(r)}${c(g)}${c(b)}`
}

// ── contrast ─────────────────────────────────────────────────────────────────

/** WCAG 2.1 relative luminance. */
function luminance({ r, g, b }: Rgb): number {
  return 0.2126 * srgbToLinear(r) + 0.7152 * srgbToLinear(g) + 0.0722 * srgbToLinear(b)
}

/** WCAG contrast ratio between two hex colours, 1..21. Order-independent. */
export function contrast(a: string, b: string): number {
  const ra = parseHex(a)
  const rb = parseHex(b)
  if (!ra || !rb) return 0
  const la = luminance(ra)
  const lb = luminance(rb)
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05)
}

// ── the one primitive everything else is built from ──────────────────────────

/**
 * Move a colour's LIGHTNESS — hue and chroma held — until it clears `target`
 * against `against`, searching in `dir` (-1 darker, +1 lighter).
 *
 * Coarse walk then bisection: contrast against a fixed colour is monotonic in
 * lightness on each side of that colour, so once one step clears the threshold
 * the answer is between it and the previous step. Bisecting there returns the
 * SMALLEST correction that works, which matters — overshooting is how a brand
 * colour silently turns into black.
 *
 * Returns the extreme (L=0 or L=1) if the whole range fails, which cannot happen
 * for any target ≤ 21 but keeps the function total rather than throwing into a
 * page render.
 */
function nudgeToContrast(base: Lch, against: string, target: number, dir: -1 | 1): Lch {
  const fits = (L: number) => contrast(toHex(lchToRgbClamped({ ...base, L })), against) >= target
  if (fits(base.L)) return base

  const limit = dir < 0 ? 0 : 1
  const STEPS = 40
  let prev = base.L
  for (let i = 1; i <= STEPS; i++) {
    const L = base.L + ((limit - base.L) * i) / STEPS
    if (fits(L)) {
      let lo = prev // known failing
      let hi = L // known passing
      for (let j = 0; j < 20; j++) {
        const mid = (lo + hi) / 2
        if (fits(mid)) hi = mid
        else lo = mid
      }
      return { ...base, L: hi }
    }
    prev = L
  }
  return { ...base, L: limit }
}

/** Same hue/chroma at an absolute lightness, chroma scaled (tints keep less of it). */
const atLightness = (base: Lch, L: number, chromaScale = 1): Lch => ({
  L,
  C: base.C * chromaScale,
  h: base.h,
})

// ── the palette ──────────────────────────────────────────────────────────────

/** The brand-dependent half of the Signal token set, for one theme. */
export interface BrandTokens {
  /** Brand as TEXT/icon colour on this theme's surfaces. */
  brand: string
  /** Emphasis/hover brand — also the ::selection text colour over brandSoft. */
  brandStrong: string
  /** Tinted surface for badges, selection, soft banners. */
  brandSoft: string
  /** The faintest tint — hover rows, subtle fills. */
  brandSofter: string
  /** Solid button fill. */
  primary: string
  /** Label on `primary`. Picked by contrast, never assumed to be white. */
  primaryForeground: string
  /** Focus ring. Held to the non-text 3:1 threshold against the page. */
  ring: string
}

export interface BrandPalette {
  light: BrandTokens
  dark: BrandTokens
}

// The neutral surfaces these tokens have to survive against, read from
// globals.css. Kept here as constants rather than parsed at runtime: they are
// the contract the derivation is proven against, and a silent change to them
// should break the palette tests rather than quietly degrade a live tenant.
const LIGHT_CARD = '#ffffff' // --color-card
const LIGHT_PAGE = '#f4f6f9' // --color-background
const DARK_CARD = '#13161e' // --color-card
const DARK_PAGE = '#0a0c11' // --color-background

// WHICH SURFACE IS THE HARD ONE — and it is not the obvious one in light mode.
// Contrast is a ratio of luminances, so for DARK text the harder background is
// the DARKER of the two (the page, #f4f6f9), not the white card: white gives a
// dark colour its best possible ratio. For LIGHT text on a dark theme it
// inverts, and the harder background is the LIGHTER one (the card, #13161e).
// Clearing the strict surface clears the other for free, so the derivation only
// ever searches against these two. Getting this backwards produced brand text
// that passed on cards and failed on every page body — caught by the hue sweep,
// at 330° and 345°, not by looking at indigo.
const LIGHT_STRICT = LIGHT_PAGE
const DARK_STRICT = DARK_CARD

/** Near-black label option. The page foreground, so a light button reads as text. */
const INK = '#0c0e14'
const PAPER = '#ffffff'

/**
 * Derive both themes from one brand hex.
 *
 * Returns null for anything that is not exactly #rrggbb — callers fall back to
 * the platform palette rather than rendering a half-branded page.
 */
export function derivePalette(hex: string): BrandPalette | null {
  const rgb = parseHex(hex)
  if (!rgb) return null
  const base = labToLch(rgbToLab(rgb))

  // A near-grey input carries no hue to build a palette from, and amplifying the
  // rounding noise in its a/b would pick an arbitrary one. Give it a defined
  // chroma floor instead so tints stay neutral rather than randomly tinted.
  const seed: Lch = base.C < 0.01 ? { ...base, C: 0 } : base

  return { light: lightTokens(seed), dark: darkTokens(seed) }
}

function lightTokens(seed: Lch): BrandTokens {
  // Brand as text on white: darken until body-text contrast holds. White is the
  // strictest of the two light surfaces, so clearing it clears the page too.
  const brandLch = nudgeToContrast(seed, LIGHT_STRICT, AA_TEXT, -1)
  const brand = toHex(lchToRgbClamped(brandLch))

  // Soft tints: fixed high lightness, chroma pulled right down. Held at a fixed
  // L rather than derived so every tenant's badge backgrounds sit at the same
  // visual weight — a pale yellow and a deep navy must both read as "a tint",
  // or the same component looks like two different components across tenants.
  const brandSoft = toHex(lchToRgbClamped(atLightness(seed, 0.955, 0.16)))
  const brandSofter = toHex(lchToRgbClamped(atLightness(seed, 0.978, 0.1)))

  // Emphasis: darker than brand, and it must clear 4.5:1 against the SOFT tint
  // too — that exact pair is ::selection (brand-strong on brand-soft) in
  // globals.css, which is otherwise the first thing to become unreadable.
  const strongSeed = atLightness(brandLch, Math.max(0, brandLch.L - 0.08))
  const brandStrong = toHex(
    lchToRgbClamped(nudgeToContrast(nudgeToContrast(strongSeed, LIGHT_STRICT, AA_TEXT, -1), brandSoft, AA_TEXT, -1))
  )

  // Button fill: the label is whichever of ink/paper is further from the fill,
  // and the fill then moves until that label clears 4.5:1. Choosing the label
  // FIRST and correcting the fill toward it is what keeps a bright brand bright
  // (black label, fill barely moves) instead of dragging every hue toward navy.
  const primarySeed = seed
  const primaryHex0 = toHex(lchToRgbClamped(primarySeed))
  const wantsInk = contrast(primaryHex0, INK) >= contrast(primaryHex0, PAPER)
  const primaryForeground = wantsInk ? INK : PAPER
  const primary = toHex(
    lchToRgbClamped(nudgeToContrast(primarySeed, primaryForeground, AA_TEXT, wantsInk ? 1 : -1))
  )

  // Focus ring: a non-text boundary, so 3:1 — against the PAGE, because that is
  // what a ring on an input sits on.
  const ring = toHex(lchToRgbClamped(nudgeToContrast(seed, LIGHT_PAGE, AA_LARGE, -1)))

  return { brand, brandStrong, brandSoft, brandSofter, primary, primaryForeground, ring }
}

function darkTokens(seed: Lch): BrandTokens {
  // Mirror image: lighten until the brand reads on the dark card.
  const brandLch = nudgeToContrast(seed, DARK_STRICT, AA_TEXT, 1)
  const brand = toHex(lchToRgbClamped(brandLch))

  // Dark tints are the same idea inverted — a deep, low-chroma version of the
  // hue that a lightened brandStrong can sit on.
  const brandSoft = toHex(lchToRgbClamped(atLightness(seed, 0.28, 0.45)))
  const brandSofter = toHex(lchToRgbClamped(atLightness(seed, 0.22, 0.35)))

  const strongSeed = atLightness(brandLch, Math.min(1, brandLch.L + 0.08))
  const brandStrong = toHex(
    lchToRgbClamped(nudgeToContrast(nudgeToContrast(strongSeed, DARK_STRICT, AA_TEXT, 1), brandSoft, AA_TEXT, 1))
  )

  const primarySeed = atLightness(seed, Math.min(1, seed.L + 0.04))
  const primaryHex0 = toHex(lchToRgbClamped(primarySeed))
  const wantsInk = contrast(primaryHex0, INK) >= contrast(primaryHex0, PAPER)
  const primaryForeground = wantsInk ? INK : PAPER
  const primary = toHex(
    lchToRgbClamped(nudgeToContrast(primarySeed, primaryForeground, AA_TEXT, wantsInk ? 1 : -1))
  )

  const ring = toHex(lchToRgbClamped(nudgeToContrast(seed, DARK_PAGE, AA_LARGE, 1)))

  return { brand, brandStrong, brandSoft, brandSofter, primary, primaryForeground, ring }
}

/**
 * The palette as a CSS block, ready to drop into a <style> element.
 *
 * Both scopes are emitted on purpose. Tailwind v4 compiles `@theme` into `:root`
 * and globals.css redefines the same names under `.dark`; `:root` and `.dark`
 * have EQUAL specificity, so whichever appears later in the document wins. An
 * injected `:root` block alone therefore beats `.dark` and would leave a branded
 * tenant with light-mode brand colours on a dark page. Writing both scopes keeps
 * each theme overriding the right baseline.
 *
 * Every value here came out of toHex(), so the only characters that can reach
 * the stylesheet are `#` and hex digits. parseHex is the gate; this function
 * cannot emit anything it did not produce itself.
 */
export function paletteCss(p: BrandPalette): string {
  const vars = (t: BrandTokens) =>
    [
      `--color-brand:${t.brand}`,
      `--color-brand-strong:${t.brandStrong}`,
      `--color-brand-soft:${t.brandSoft}`,
      `--color-brand-softer:${t.brandSofter}`,
      `--color-primary:${t.primary}`,
      `--color-primary-foreground:${t.primaryForeground}`,
      `--color-ring:${t.ring}`,
    ].join(';')
  return `:root{${vars(p.light)}}\n.dark{${vars(p.dark)}}`
}
