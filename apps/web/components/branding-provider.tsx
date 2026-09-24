'use client'

import { createContext, useContext, type ReactNode } from 'react'
import { PLATFORM_PRODUCT_NAME } from '../lib/brand-constants'

/**
 * Phase 27 — the product's name, for client components.
 *
 * A context rather than a prop threaded through the tree. The name appears in a
 * dozen leaf components (a delete confirmation, a credentials panel, a field
 * label) that have nothing else to do with branding, and routing a prop through
 * every intermediate component to reach them would mean each new copy string is
 * one more place to forget — which is precisely the failure mode of a
 * white-label tier. A component that needs the name asks for it.
 *
 * The default is the platform name, so a component rendered outside the provider
 * degrades to correct-for-most rather than to an empty string. Every branded
 * surface is inside the root layout, which always provides it.
 */
const ProductNameContext = createContext<string>(PLATFORM_PRODUCT_NAME)

export function BrandingProvider({ productName, children }: { productName: string; children: ReactNode }) {
  return <ProductNameContext.Provider value={productName}>{children}</ProductNameContext.Provider>
}

/** What this tenant calls the product. Never hardcode it in user-facing copy. */
export function useProductName(): string {
  return useContext(ProductNameContext)
}
