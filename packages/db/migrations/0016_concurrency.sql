-- Phase 20: the concurrency ceiling (architecture §3 + §8 row 6).
--
-- ElevenLabs plans cap SIMULTANEOUS calls (Pro ≈ 20, Scale ≈ 30, Business ≈ 40)
-- and every tenant shares that one pool, so peak concurrency — not minutes — is
-- what forces a provider upgrade. Two limits follow from that:
--   * the shared pool ceiling, which is a property of OUR ElevenLabs plan and so
--     lives in env (ELEVENLABS_MAX_CONCURRENCY), not here; and
--   * a per-org ceiling, below, so one tenant's busy hour cannot eat the pool
--     and reject every other tenant's calls (§8 row 6: "per-org concurrency
--     limits").
--
-- Seeded with the max_numbers/qa_enabled pattern (0012, 0014): ADD COLUMN with a
-- default, then one UPDATE per plan that differs. Starter keeps the default 2.
-- Pro's 10 is deliberately half of a 20-seat Pro-tier pool — a ceiling that
-- still leaves room for everyone else.
alter table plans add column max_concurrent int not null default 2;
update plans set max_concurrent = 5 where id = 'growth';
update plans set max_concurrent = 10 where id = 'pro';

-- No new index: the peak/live-concurrency reads are windowed scans over
-- started_at, and calls_org_started_idx (0004) covers the org-scoped read while
-- calls_started_at_idx (0003) covers the platform-wide pool read.
