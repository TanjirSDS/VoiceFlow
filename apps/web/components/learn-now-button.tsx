'use client'

import { useState, useTransition } from 'react'
import { learnNowAction } from '../app/agents/actions'
import { Button } from './ui/button'

/** Runs one learning pass now (≈30-60 s: the judge reads every recent call). */
export function LearnNowButton({ agentId, judge }: { agentId: string; judge: string }) {
  const [pending, start] = useTransition()
  const [result, setResult] = useState<{ error?: string; message?: string } | null>(null)
  return (
    <div className="flex flex-col items-end gap-1">
      <Button
        disabled={pending}
        onClick={() => start(async () => setResult(await learnNowAction(agentId)))}
      >
        {pending ? `${judge} is reviewing your calls…` : 'Learn from recent calls'}
      </Button>
      {result && (
        <p role="status" className={`text-xs ${result.error ? 'text-destructive' : 'text-muted-foreground'}`}>
          {result.error ?? result.message}
        </p>
      )}
    </div>
  )
}
