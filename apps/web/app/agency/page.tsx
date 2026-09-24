import Link from 'next/link'
import { AgencyClients } from '../../components/agency-clients'
import { AgencyIcon } from '../../components/icons'
import { Button } from '../../components/ui/button'
import { Card, CardContent } from '../../components/ui/card'
import { agencyPeriod, currentPeriodStart, listSubOrgs, parentUsage } from '../../lib/agency-db'
import { agencyRollup, subOrgHeadroom } from '../../lib/agency-math'
import { currentBranding } from '../../lib/branding'
import { userClient } from '../../lib/db'
import { activeOrg } from '../../lib/org'
import { requireResellerRead } from './actions'

export const dynamic = 'force-dynamic'

const money = (cents: number) =>
  `$${(cents / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

export default async function AgencyPage() {
  const org = await activeOrg()

  // Plan gate, same shape as /knowledge and /qa: a tenant without the tier sees
  // what it is, not a 404. The SERVER ACTIONS are the real gate — this card is
  // the sales pitch, and a sub-org never reaches it (requireResellerRead 404s
  // for any org with a parent, because reselling your reseller is not a feature).
  if (!org?.plan.agencyEnabled || org.parentOrgId !== null) {
    if (org?.parentOrgId) return null // a sub-org: the nav item is hidden anyway
    return (
      <div className="mx-auto max-w-xl">
        <Card className="overflow-hidden">
          <div className="flex flex-col items-center gap-4 bg-brand-soft px-8 py-10 text-center">
            <span className="grid h-14 w-14 place-items-center rounded-2xl bg-brand text-primary-foreground shadow-brand">
              <AgencyIcon className="h-7 w-7" />
            </span>
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-brand">
                Agency plan
              </div>
              <h1 className="mt-1 text-xl font-semibold tracking-tight">
                Sell voice agents under your own brand
              </h1>
            </div>
          </div>
          <CardContent className="space-y-5 p-8 text-sm text-muted-foreground">
            <p>
              Run a workspace for each of your clients, put your name, logo and colours on every
              screen and every email they see, and receive one invoice for all of them from a
              shared pool of minutes.
            </p>
            <Link href="/billing" className="block">
              <Button size="lg" className="w-full">
                Upgrade plan
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  await requireResellerRead()
  const db = await userClient()
  const period = currentPeriodStart()

  const [clients, ownMinutes, rollupRow, branding] = await Promise.all([
    listSubOrgs(db, org.orgId, period),
    parentUsage(db, org.orgId, period),
    agencyPeriod(db, org.orgId, period),
    currentBranding(),
  ])

  // Computed live from usage_periods rather than read from agency_periods.
  //
  // agency_periods is the BILLING ledger — it only changes when the nightly job
  // runs, so a screen driven by it would show yesterday's numbers all day and
  // an agency would think a client's calls had not registered. The pure function
  // is the same one the job uses, so the two agree by construction; what the
  // ledger uniquely knows (how much has actually reached Stripe) is shown
  // separately and labelled as such.
  const rollup = agencyRollup({
    parentMinutes: ownMinutes,
    children: clients.map((c) => ({ orgId: c.orgId, name: c.name, minutes: c.minutesUsed })),
    pooledMinutes: rollupRow?.pooled_minutes ?? org.minutesCap,
    rateCentsPerMin: org.plan.agencyRateCentsPerMin,
    baseCents: 0, // the plan's own price is on /billing; this card is usage
  })

  const headroom = subOrgHeadroom(clients.length, org.plan.maxSubOrgs)
  const poolPct = rollup.pooledMinutes > 0 ? Math.min(100, (rollup.familyMinutes / rollup.pooledMinutes) * 100) : 0

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight">Agency</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Your client workspaces, their usage, and the branding they see.
          </p>
        </div>
        <Link href="/agency/branding">
          <Button variant="outline">Branding</Button>
        </Link>
      </div>

      {/* The pool. One number decides this tier's bill, so it leads. */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-wrap items-baseline justify-between gap-4">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Pooled minutes this month
              </div>
              <div className="stat-num mt-1 text-3xl">
                {Math.round(rollup.familyMinutes).toLocaleString()}
                <span className="text-lg text-muted-foreground">
                  {' / '}
                  {rollup.pooledMinutes.toLocaleString()}
                </span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Usage charges so far
              </div>
              <div className="stat-num mt-1 text-3xl">{money(rollup.overageCents)}</div>
              <div className="text-xs text-muted-foreground">
                {rollup.billableMinutes > 0
                  ? `${Math.floor(rollup.billableMinutes).toLocaleString()} min past the pool at ${money(rollup.rateCentsPerMin)}/min`
                  : 'Inside your allowance'}
              </div>
            </div>
          </div>

          <div className="mt-5 h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className={poolPct >= 100 ? 'h-full bg-destructive' : poolPct >= 80 ? 'h-full bg-warn' : 'h-full bg-brand'}
              style={{ width: `${Math.max(poolPct, 1)}%` }}
            />
          </div>

          <p className="mt-4 text-xs text-muted-foreground">
            Every client workspace draws on this one allowance, and everything past it appears as a
            single line on your own invoice — your clients are never billed by us.
            {rollupRow ? (
              <>
                {' '}
                {Math.floor(rollupRow.reported_minutes).toLocaleString()} minute
                {Math.floor(rollupRow.reported_minutes) === 1 ? '' : 's'} have been sent to billing so
                far; the figure above is live and settles overnight.
              </>
            ) : (
              ' Billing figures settle overnight, after usage is reconciled against the provider.'
            )}
          </p>
        </CardContent>
      </Card>

      <AgencyClients
        clients={clients.map((c) => ({
          ...c,
          sharePct: rollup.children.find((r) => r.orgId === c.orgId)?.sharePct ?? 0,
        }))}
        ownMinutes={ownMinutes}
        ownName={org.name}
        headroom={headroom}
        maxSubOrgs={org.plan.maxSubOrgs}
        maxMinutesCap={org.minutesCap}
        agencyProductName={branding.productName}
      />
    </div>
  )
}
