'use client'

// Searchable model picker (2026-10-09): the provider-hosted models plus every OpenRouter
// model. Typing filters by id, name or vendor (cmdk); arrows + Enter or click to pick.
// Nothing is restricted — models that may misbehave on a call are labelled, not hidden.
import { MODEL_INFO, modelLabel } from '@voiceflow/engine/templates'
import { useState } from 'react'
import { isOpenRouterChoice, modelChoiceLabel, OPENROUTER_PREFIX, type OpenRouterModel } from '../lib/model-choice'
import { Badge } from './ui/badge'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from './ui/command'
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover'

const price = (m: OpenRouterModel) =>
  m.promptPerM === null ? '' : m.promptPerM === 0 && m.completionPerM === 0 ? 'free' : `$${m.promptPerM}/$${m.completionPerM} per M`

export function ModelPicker({
  id,
  value,
  onChange,
  openRouterModels,
}: {
  id?: string
  value: string
  onChange: (choice: string) => void
  openRouterModels: OpenRouterModel[]
}) {
  const [open, setOpen] = useState(false)
  const pick = (choice: string) => {
    onChange(choice)
    setOpen(false)
  }
  const current = isOpenRouterChoice(value)
    ? openRouterModels.find((m) => OPENROUTER_PREFIX + m.id === value)
    : undefined

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          id={id}
          type="button"
          role="combobox"
          aria-expanded={open}
          className="flex h-10 w-full items-center justify-between gap-2 rounded-lg border border-input bg-background px-3 text-left text-sm hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <span className="truncate">{current?.name ?? modelChoiceLabel(value, modelLabel)}</span>
          <span aria-hidden className="text-muted-foreground">▾</span>
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-[min(32rem,90vw)] p-0">
        <Command>
          <CommandInput placeholder="Search models — e.g. claude, gemini flash, jev, deepseek" autoFocus />
          <CommandList className="max-h-96">
            <CommandEmpty>No model matches.</CommandEmpty>
            <CommandGroup heading="Hosted by the voice platform (fastest)">
              {MODEL_INFO.map((m) => (
                <CommandItem key={m.id} value={`${m.id} ${m.label}`} onSelect={() => pick(m.id)}>
                  <div className="min-w-0 flex-1">
                    <div className="truncate">{m.label}{m.id === value && ' ✓'}</div>
                    <div className="truncate text-xs text-muted-foreground">{m.hint}</div>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
            {openRouterModels.length > 0 && (
              <CommandGroup heading={`OpenRouter (${openRouterModels.length} models)`}>
                {openRouterModels.map((m) => (
                  <CommandItem key={m.id} value={`${m.id} ${m.name}`} onSelect={() => pick(OPENROUTER_PREFIX + m.id)}>
                    <div className="min-w-0 flex-1">
                      <div className="truncate">
                        {m.name}
                        {OPENROUTER_PREFIX + m.id === value && ' ✓'}
                      </div>
                      <div className="truncate text-xs text-muted-foreground">
                        {m.id}
                        {price(m) && ` · ${price(m)}`}
                      </div>
                    </div>
                    {m.reasoning && (
                      <Badge variant="warn" className="shrink-0 normal-case" title="Thinks before it speaks — longer pauses on a call">
                        slow
                      </Badge>
                    )}
                    {!m.tools && (
                      <Badge variant="outline" className="shrink-0 normal-case" title="No tool calling — ending calls and flow steps may not work">
                        may not work
                      </Badge>
                    )}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
