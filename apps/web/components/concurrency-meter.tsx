import { CONCURRENCY_WARN_PCT, concurrencyState } from '../lib/concurrency-math'
import { AlertIcon, GaugeIcon } from './icons'
import { Badge } from './ui/badge'
import { Card } from './ui/card'

// Phase 20 (architecture §3). ElevenLabs bills minutes but CAPS simultaneous
// calls, so this tile answers one question: how close is the org to its ceiling?
// That job — a single ratio against a limit — is a METER. A one-bar bar chart or
// a two-slice pie would both be worse ways of saying the same thing.
//
// Severity rides the fill (brand → warn → destructive) over a track that is the
// lighter step of the SAME ramp (brand-soft → warn-soft → danger-soft), so the
// state reads across the whole bar rather than only where it happens to end.
//
// The icon + text label are NOT decoration. Measured with the dataviz palette
// validator, this app's warn (#c67608) and destructive (#e5484d) sit at ΔE 4.3
// under deuteranopia on the light card — hue alone cannot separate "approaching"
// from "at limit". The label is the mitigation; never reduce it back to a colour.

const STYLES = {
  ok: { fill: 'bg-brand', track: 'bg-brand-soft' },
  approaching: { fill: 'bg-warn', track: 'bg-warn-soft' },
  at_limit: { fill: 'bg-destructive', track: 'bg-danger-soft' },
} as const

const STATUS = {
  ok: null,
  approaching: { variant: 'warn', text: 'Approaching limit' },
  at_limit: { variant: 'destructive', text: 'At limit' },
} as const

/** '09-23 14:20 UTC' — same UTC basis the rest of the dashboard counts in. */
function stamp(iso: string) {
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())} ${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())} UTC`
}

export interface ConcurrencyMeterProps {
  peak: number
  limit: number
  /** ISO instant the peak was first reached; null when there were no calls. */
  at: string | null
  planName: string
  /** Human name for the window the peak was measured over, e.g. 'last 30 days'. */
  windowLabel: string
}

export function ConcurrencyMeter({ peak, limit, at, planName, windowLabel }: ConcurrencyMeterProps) {
  const state = concurrencyState(peak, limit)
  const style = STYLES[state]
  const status = STATUS[state]
  const pct = limit > 0 ? Math.min(100, Math.round((peak / limit) * 100)) : 0

  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-muted-foreground">Peak concurrent calls</span>
            {status && (
              <Badge variant={status.variant} className="normal-case">
                <AlertIcon className="h-3.5 w-3.5" />
                {status.text}
              </Badge>
            )}
          </div>
          {/* Value stays in ink, never the severity colour — the bar carries that. */}
          <div className="stat-num mt-3 text-[2rem] leading-none">
            {peak}
            <span className="ml-1.5 text-base font-normal text-muted-foreground">of {limit}</span>
          </div>
        </div>
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-brand-soft text-brand">
          <GaugeIcon className="h-4.5 w-4.5" />
        </span>
      </div>

      {/* Track + fill: square at the baseline, 4px rounded data-end. */}
      <div
        className={`mt-4 h-2 w-full overflow-hidden rounded-[4px] ${style.track}`}
        role="meter"
        aria-valuenow={peak}
        aria-valuemin={0}
        aria-valuemax={limit}
        aria-label={`Peak concurrent calls, ${peak} of ${limit} allowed`}
        title={`${peak} of ${limit} concurrent calls (${pct}%) — ${windowLabel}`}
      >
        <div className={`h-full rounded-r-[4px] ${style.fill}`} style={{ width: `${pct}%` }} />
      </div>

      <p className="mt-2 text-xs text-muted-foreground">
        {peak > 0 && at ? `${pct}% of the ${planName} ceiling · peaked ${stamp(at)}` : `No calls in the ${windowLabel}`}
        {state === 'ok' && peak > 0 && ` · alert at ${CONCURRENCY_WARN_PCT}%`}
      </p>
    </Card>
  )
}
