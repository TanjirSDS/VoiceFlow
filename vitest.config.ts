import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: ['packages/**/*.test.ts', 'apps/**/*.test.ts'],
  },
  // Phase 27: the email templates are .tsx, and a test that renders them needs
  // the SAME JSX transform Next uses. esbuild defaults to the classic runtime
  // (React.createElement, React in scope), which throws "React is not defined"
  // in files written for the automatic runtime — the whole codebase, since
  // React 17. No test imported a .tsx file before this phase, so nothing had
  // surfaced it.
  esbuild: { jsx: 'automatic' },
})
