-- S1: Jev's per-call judgement (apps/web/lib/outcome.ts → Judgement). One jsonb
-- column rather than eleven: it is written once per finished call, read whole
-- by the call drawer, and null means "not judged yet". outcome/summary keep
-- their own columns — analytics, digests and opt-out handling read those.
alter table public.calls add column if not exists judgement jsonb;
