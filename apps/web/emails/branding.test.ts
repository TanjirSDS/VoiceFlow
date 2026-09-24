import { createElement, type ReactElement } from 'react'
import { render } from '@react-email/render'
import { describe, expect, it } from 'vitest'
import {
  AgentLearningEmail,
  AlertEmail,
  MagicLinkEmail,
  PaymentFailedEmail,
  UsageCappedEmail,
  UsageWarnEmail,
  WeeklySummaryEmail,
  WelcomeEmail,
  type EmailBrand,
} from './index'
import { derivePalette } from '../lib/brand-palette'
import { PLATFORM_BRAND_COLOR, PLATFORM_PRODUCT_NAME } from '../lib/branding'

/**
 * THE ACCEPTANCE CRITERION FOR PHASE 27's EMAIL HALF:
 * "a sub-org sees zero VoiceFlow branding anywhere including emails".
 *
 * Emails are the surface that leaves our control — forwarded, archived, read
 * months later by people who never open the app — so this is asserted rather
 * than reviewed. Every template is rendered to real HTML with a reseller's
 * branding and checked for the platform name.
 *
 * The POSITIVE CONTROL below is the part that makes this test worth anything:
 * an absence assertion passes trivially if the renderer returns nothing, so the
 * same templates are also rendered with platform branding and asserted to
 * CONTAIN the name. If the renderer breaks, that half fails first.
 */

const RESELLER: EmailBrand = {
  productName: 'Northwind Voice',
  accent: derivePalette('#c1121f')!.light.brandStrong,
  supportEmail: 'help@northwind-agency.com',
  appUrl: 'https://voice.northwind-agency.com',
}

const PLATFORM: EmailBrand = {
  productName: PLATFORM_PRODUCT_NAME,
  accent: derivePalette(PLATFORM_BRAND_COLOR)!.light.brandStrong,
  supportEmail: null,
  appUrl: 'https://app.example.com',
}

/** Every template, with realistic props, parameterised by brand. */
function everyTemplate(brand: EmailBrand): [string, ReactElement][] {
  return [
    ['MagicLinkEmail', createElement(MagicLinkEmail, { url: `${brand.appUrl}/verify?t=abc`, brand })],
    ['WelcomeEmail', createElement(WelcomeEmail, { orgName: 'Northside Dental', brand })],
    [
      'AlertEmail',
      createElement(AlertEmail, {
        orgName: 'Northside Dental',
        alertName: 'Failure rate high',
        metricLabel: 'Failure rate',
        operatorLabel: 'is above',
        value: 12.5,
        threshold: 10,
        brand,
      }),
    ],
    ['UsageWarnEmail', createElement(UsageWarnEmail, { orgName: 'Northside Dental', minutesUsed: 600, capMinutes: 750, brand })],
    ['UsageCappedEmail', createElement(UsageCappedEmail, { orgName: 'Northside Dental', capMinutes: 750, policy: 'pause', brand })],
    ['PaymentFailedEmail', createElement(PaymentFailedEmail, { orgName: 'Northside Dental', graceDays: 7, brand })],
    [
      'WeeklySummaryEmail',
      createElement(WeeklySummaryEmail, {
        orgName: 'Northside Dental',
        calls: 41,
        minutes: 190.4,
        outcomes: [{ outcome: 'booked', count: 12 }],
        topQuestions: ['Do you take walk-ins?'],
        brand,
      }),
    ],
    [
      'AgentLearningEmail',
      createElement(AgentLearningEmail, {
        orgName: 'Northside Dental',
        agents: [{ agentId: 'a1', agentName: 'Front desk', titles: ['Add opening hours'] }],
        totalSuggestions: 3,
        brand,
      }),
    ],
  ]
}

describe('every transactional email, rendered for a reseller', () => {
  const templates = everyTemplate(RESELLER)

  it.each(templates)('%s carries the reseller name', async (_name, el) => {
    const html = await render(el)
    expect(html).toContain('Northwind Voice')
  })

  // The criterion itself. Case-insensitive so "voiceflow" in a URL or an
  // attribute cannot slip past, and it covers the preview text, the subject
  // line's source, every heading, the body and the footer at once.
  it.each(templates)('%s contains NO platform branding', async (_name, el) => {
    const html = await render(el)
    expect(html.toLowerCase()).not.toContain('voiceflow')
  })

  it.each(templates)('%s links only to the reseller origin', async (_name, el) => {
    const html = await render(el)
    for (const href of [...html.matchAll(/href="(https?:\/\/[^"]+)"/g)].map((m) => m[1])) {
      // mailto: is excluded by the pattern; every http(s) link must be theirs.
      expect(new URL(href).host).toBe('voice.northwind-agency.com')
    }
  })

  it.each(templates)('%s routes support to the reseller, not to us', async (_name, el) => {
    const html = await render(el)
    expect(html).toContain('help@northwind-agency.com')
  })

  it.each(templates)('%s uses the derived accent and no hardcoded brand hex', async (_name, el) => {
    const html = await render(el)
    // The Signal indigo must not appear in a reseller's mail — its presence
    // would mean a template kept a literal colour instead of reading the brand.
    expect(html.toLowerCase()).not.toContain('5457e5')
  })
})

/**
 * POSITIVE CONTROL. Without this, every assertion above would still pass if
 * render() started returning an empty string.
 */
describe('positive control — the same templates DO carry the platform name', () => {
  it.each(everyTemplate(PLATFORM))('%s says VoiceFlow when unbranded', async (_name, el) => {
    const html = await render(el)
    expect(html.length).toBeGreaterThan(200)
    expect(html).toContain('VoiceFlow')
  })
})
