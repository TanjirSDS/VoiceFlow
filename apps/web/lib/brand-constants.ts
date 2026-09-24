/**
 * The platform's own identity — the end of every branding fallback chain.
 *
 * ITS OWN MODULE, WITH ZERO IMPORTS, ON PURPOSE. These constants are needed by
 * CLIENT components (the branding editor's preview, the product-name context's
 * default). Importing them from lib/branding.ts drags that module's transitive
 * dependencies — lib/org → lib/auth → next/headers — into the browser bundle,
 * which fails the build outright with "You're importing a component that needs
 * next/headers".
 *
 * lib/branding.ts re-exports these, so server code has one import and nothing
 * needs to know the split exists.
 */

/** What the product is called when nobody has said otherwise. */
export const PLATFORM_PRODUCT_NAME = 'VoiceFlow'

/** The Signal brand colour from globals.css — the value the tokens ship with. */
export const PLATFORM_BRAND_COLOR = '#5457e5'

export const PLATFORM_TAGLINE = 'AI voice agents for small business'

/**
 * Tenant text that will end up in a mail header, made safe for one.
 *
 * A product name reaches RFC 5322 `From` and `Subject` headers. A bare CR or LF
 * inside a header value is how an extra header gets appended to the message —
 * `Acme\r\nBcc: attacker@evil` is 24 characters and passes any length check.
 * Escaping quotes and backslashes (which `From` also needs) does nothing about
 * that, so line breaks and every other control character are removed outright
 * rather than escaped: none of them belong in a product name.
 *
 * Applied at BOTH boundaries — on write, and again here on the way into a
 * header — so a row that arrived by any other route is still safe to send.
 */
export function headerSafe(text: string): string {
  // eslint-disable-next-line no-control-regex
  return text.replace(/[\u0000-\u001f\u007f]+/g, ' ').trim()
}
