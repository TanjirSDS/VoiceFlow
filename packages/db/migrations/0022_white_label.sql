-- Phase 27: the agency / white-label tier (build plan P8, "agency/white-label tier").
--
-- Four things, in dependency order: sub-orgs (orgs.parent_org_id), the role that
-- may manage them, the branding a reseller puts on them, and the rollup row that
-- turns many sub-orgs' minutes into one line on the parent's invoice.
--
-- The security shape of this phase is one sentence: a reseller reaches DOWN into
-- the orgs it created, never sideways and never up. Everything below exists to
-- make that sentence enforceable by Postgres as well as by the app.

-- ───────────────────────────────────────────────────────── sub-orgs
--
-- A sub-org is an ordinary org with a parent. Everything already written against
-- orgs — agents, numbers, calls, usage, RLS — keeps working unchanged, which is
-- the entire reason this is a column and not a second tenancy model.
--
-- ON DELETE RESTRICT, not CASCADE: a parent with live sub-orgs is a parent with
-- other people's phone numbers and call recordings under it. Deleting it must be
-- an explicit unwind, not a side effect.
alter table orgs add column parent_org_id uuid references orgs(id) on delete restrict;
create index orgs_parent_idx on orgs (parent_org_id) where parent_org_id is not null;

comment on column orgs.parent_org_id is
  'The reseller org that owns this one. NULL for a normal (direct) customer. '
  'Exactly one level deep — enforced by orgs_one_level_deep().';

-- ONE LEVEL ONLY. A check constraint cannot see another row, so this is a
-- trigger. Three ways to build a grandchild and all three are refused:
--
--   1. attaching to a parent that is itself a sub-org  (depth 3)
--   2. attaching an org that already has sub-orgs      (demoting a parent)
--   3. attaching an org to itself                      (depth ∞)
--
-- Why refuse depth at all: every rule below ("a reseller sees its children",
-- "usage rolls up to the parent") is written as ONE hop. A second level would
-- make each of them silently wrong rather than loudly broken — a grandchild's
-- minutes would reach nobody's invoice, and a top-level reseller would not see
-- the orgs it is ultimately responsible for. Depth is cheap to add later and
-- impossible to remove once data depends on it.
create function orgs_one_level_deep() returns trigger
language plpgsql as $$
begin
  if new.parent_org_id is null then
    -- Clearing a parent is always fine; becoming one is checked on the child.
    return new;
  end if;

  if new.parent_org_id = new.id then
    raise exception 'org % cannot be its own parent', new.id
      using errcode = 'check_violation';
  end if;

  if exists (select 1 from orgs p where p.id = new.parent_org_id and p.parent_org_id is not null) then
    raise exception 'org % is already a sub-org; sub-orgs cannot have sub-orgs', new.parent_org_id
      using errcode = 'check_violation';
  end if;

  if exists (select 1 from orgs c where c.parent_org_id = new.id) then
    raise exception 'org % already has sub-orgs and cannot become one', new.id
      using errcode = 'check_violation';
  end if;

  return new;
end $$;

create trigger orgs_one_level_deep_trg
  before insert or update of parent_org_id on orgs
  for each row execute function orgs_one_level_deep();

-- ───────────────────────────────────────────────────────── the reseller role
--
-- 'reseller' sits between owner and member ON THE PARENT ORG: it may create and
-- administer sub-orgs and see the rollup, but not touch the parent's own card,
-- plan or subscription (those stay owner-only, as they were). An agency's staff
-- get this; the agency's founder keeps 'owner'.
--
-- The constraint is dropped and recreated because 0004 wrote it inline.
alter table org_members drop constraint org_members_role_check;
alter table org_members add constraint org_members_role_check
  check (role in ('owner', 'member', 'reseller'));

comment on column org_members.role is
  'owner = full control incl. billing; reseller = may manage this org''s sub-orgs '
  'and see their rollup, but not its billing; member = day-to-day use.';

-- ───────────────────────────────────────────────────────── the plan gate
--
-- Same add-a-flag pattern as qa_enabled (0014) and api_enabled (0020). The flag
-- is not decoration: is_org_member() below reads it, so losing the entitlement
-- narrows what Postgres will return, not just what the UI draws.
alter table plans add column agency_enabled boolean not null default false;
-- What the agency pays per billable minute once the pooled allowance is spent.
-- Below the $0.35 direct overage rate — the agency is buying wholesale and is
-- the one carrying support for its clients. Still ~48% margin at the RFC's
-- conservative $0.13/min cost.
alter table plans add column agency_rate_cents_per_min int not null default 25;
-- Standing rule 5: no true "unlimited" anywhere. agency_enabled is the on/off,
-- this is the ceiling — without it the tier is an unbounded org factory, and
-- every sub-org is a row in the pooled allowance somebody has to pay for.
alter table plans add column max_sub_orgs int not null default 0;
-- Metered price for pooled overage, filled in by `npm run stripe-setup` exactly
-- like stripe_overage_price_id (0005). One global price duplicated per row, so
-- "price ids live in plans" stays true without a second table.
alter table plans add column stripe_agency_price_id text;

-- A new plan rather than agency_enabled on 'pro': the tier sells a different
-- thing (seats for other people's businesses) at a different price, and an
-- existing Pro customer must not silently acquire the ability to create orgs.
--
-- included_minutes here is the POOL shared by the agency and all its sub-orgs.
-- Priced off the RFC's §4 ladder at the same conservative $0.13/min: 10,000
-- pooled minutes cost $1,300, so $3,999 holds ~67% margin at 100% usage. That
-- is below the 78–80% the direct plans carry, which is the point — the agency
-- buys at $0.40/min included against Pro's $0.60 and does its own support.
insert into plans (
  id, name, price_cents, included_minutes, max_agents, max_numbers, max_concurrent,
  kb_enabled, adaptive_enabled, qa_enabled, api_enabled, agency_enabled,
  agency_rate_cents_per_min, max_sub_orgs
) values (
  'agency', 'Agency', 399900, 10000, 50, 50, 20,
  true, true, true, true, true,
  25, 25
);

-- ───────────────────────────────────────────────────────── branding
--
-- One row per org that has been branded. Resolution is in the app
-- (lib/branding.ts): own row → parent's row → the platform default. That is what
-- makes a reseller brand ONCE and have every client it owns inherit it.
--
-- Only brand_color is stored, not a palette: the twelve Signal colour tokens are
-- derived from it. Letting a reseller set each token by hand is how you ship an
-- unreadable product with your own name on it — the derivation holds contrast
-- whatever hue it is handed.
create table org_branding (
  org_id uuid primary key references orgs(id) on delete cascade,

  -- What the product is called everywhere a customer can see: page titles, the
  -- sidebar wordmark, every email. NULL falls back through the chain.
  --
  -- The control-character clause is NOT tidiness. This value is interpolated
  -- into RFC 5322 `From` and `Subject` headers (lib/email.ts), and a bare CR or
  -- LF inside a header value is how an extra header — `Bcc:` — gets appended to
  -- every message the tenant's workspace sends. Length alone does not stop it:
  -- "Acme\r\nBcc: attacker@evil" is 24 characters.
  product_name text check (
    product_name is null
    or (length(btrim(product_name)) between 1 and 40 and product_name !~ '[[:cntrl:]]')
  ),

  -- Object key in the recordings bucket (NOT a URL). The logo is served from our
  -- own origin by /api/branding/logo because the app's CSP is img-src 'self',
  -- and widening it to https: for every page — so one reseller can host a PNG on
  -- their CDN — is a bad trade. It also means the logo cannot vanish because
  -- someone else's bucket went private.
  logo_key text,
  -- RASTER ONLY, AND SVG IS DELIBERATELY ABSENT. An SVG is a document: it can
  -- carry <script>, and this file is served from OUR origin so that the CSP can
  -- stay img-src 'self'. A tenant-uploaded SVG opened directly would therefore
  -- execute script in our origin — a stored XSS handed to us by the very
  -- decision that keeps the CSP tight. The app checks the magic bytes on upload
  -- as well; this is the backstop.
  logo_content_type text check (logo_content_type is null or logo_content_type in
    ('image/png', 'image/jpeg', 'image/webp')),

  -- The single source colour. The regex is a SECURITY control, not tidiness:
  -- this value is interpolated into a <style> block and into inline styles in
  -- email HTML. Anything that is not exactly six hex digits is a CSS injection.
  -- The app validates it again before emitting (lib/branding.ts) — this is the
  -- backstop for every writer that is not the app.
  brand_color text check (brand_color is null or brand_color ~ '^#[0-9a-fA-F]{6}$'),

  -- Vanity host for this org's sign-in and dashboard, e.g. voice.acme-agency.com.
  -- Lowercase hostname only; resolved pre-auth, so it is matched exactly and
  -- never interpolated anywhere.
  custom_domain text unique check (custom_domain is null or custom_domain ~ '^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$'),

  -- A CLAIMED hostname is not a PROVEN one, and branding resolves by host
  -- BEFORE it resolves by session — so an unverified claim is not a cosmetic
  -- mistake, it is a takeover. A tenant who writes our own hostname here would
  -- otherwise repaint the real product, on the real domain, for every visitor
  -- including other tenants' signed-in users: a phishing page hosted by us.
  --
  -- So a vanity host is inert until this is set, and members cannot set it (the
  -- grant below withholds the column, exactly like email_sender_verified). We
  -- set it after a DNS challenge. Fails closed: NULL means "do not resolve".
  custom_domain_verified_at timestamptz,

  -- Shown to end users as "contact support". A sub-org's user must reach the
  -- agency, not us — we have no relationship with them.
  support_email text check (support_email is null or support_email ~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$'),

  -- Envelope From for this org's mail. Using it requires a sending domain that
  -- has been verified with the mail provider, which is an operational step we
  -- perform — hence the separate flag, which members cannot write (grant below).
  -- Without verification the address is ignored and only the DISPLAY NAME is
  -- branded; sending as an unverified domain gets the mail spam-foldered, which
  -- is worse for the agency than a neutral address.
  email_from_address text check (email_from_address is null or email_from_address ~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$'),
  email_sender_verified boolean not null default false,

  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

-- No separate partial index for custom_domain: the column's own UNIQUE already
-- builds one, and Postgres does not treat NULLs as equal, so unbranded orgs do
-- not collide. A second index here would be a duplicate that still has to be
-- maintained on every write.

comment on table org_branding is
  'Per-org white-label overrides. Inherited by sub-orgs from the parent unless '
  'the sub-org has its own row (lib/branding.ts resolves the chain).';

-- ───────────────────────────────────────────────────── the agency period
--
-- One row per agency per month: the pooled allowance, what the family actually
-- used, and how much of the overage has already reached Stripe.
--
-- There is deliberately NO per-child table here. Each child's minutes already
-- live in usage_periods; the per-client breakdown the statement UI shows is a
-- join through orgs.parent_org_id, not a copy. A copy would be a second number
-- that can disagree with the first, and rule 5 says billing reads one source.
--
-- reported_minutes is family-level for the same reason the pool is: billable =
-- max(0, family − pool) does not decompose per child, so "which child used the
-- overage minute" is not a question with an answer. The breakdown attributes
-- USAGE; the pool prices it.
create table agency_periods (
  parent_org_id uuid not null references orgs(id) on delete cascade,
  period_start date not null,                 -- first day of the UTC month
  pooled_minutes int not null,                -- snapshot of the parent's cap at first write
  family_minutes numeric not null default 0,  -- parent + every sub-org, this period
  billable_minutes numeric not null default 0,-- max(0, family_minutes - pooled_minutes)
  reported_minutes numeric not null default 0,-- already sent to the Stripe meter
  updated_at timestamptz not null default now(),
  primary key (parent_org_id, period_start)
);

-- ───────────────────────────────────────────────────────────── RLS
--
-- THE ONE NEW REACH IN THIS PHASE. Everything else above is data.
--
-- A reseller of P may read and write the orgs whose parent is P. It is a single
-- hop downward by construction: the function starts at the CHILD and looks up
-- exactly one parent_org_id. There is no recursive term, so no path exists from
-- a child to a sibling, to the parent, or to anything the parent can reach.
--
-- Gated on the parent's plan flag on purpose. If entitlement and reach can
-- disagree, the flag is decoration; with the flag inside the policy, a lapsed
-- agency's reach NARROWS — which is the safe direction for a gate to fail. The
-- sub-orgs and their data are untouched by a lapse; only the reseller's cross-org
-- visibility stops until the plan is restored.
--
-- Fails closed for a bearer key with no further work: auth.uid() is NULL for an
-- API key (0020), so the org_members join matches nothing and a key can never
-- borrow the reseller reach of the person who created it.
create function is_parent_reseller(p_org uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1
    from orgs child
    join orgs parent on parent.id = child.parent_org_id
    join plans plan on plan.id = parent.plan_id
    join org_members m on m.org_id = parent.id
    where child.id = p_org
      and child.parent_org_id is not null
      and m.user_id = auth.uid()
      and m.role in ('owner', 'reseller')
      and plan.agency_enabled
  );
$$;

-- Owner of this specific org — used by the branding policies below, which are
-- stricter than the blanket org_rw policies every other tenant table uses.
create function is_org_owner(p_org uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from org_members where org_id = p_org and user_id = auth.uid() and role = 'owner'
  ) or is_admin();
$$;

-- The one-line extension, exactly as 0020 did it: every policy that calls
-- is_org_member() inherits the new arm, so a reseller administering a client's
-- agents, numbers and calls needs no per-table change.
create or replace function is_org_member(p_org uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from org_members where org_id = p_org and user_id = auth.uid())
      or is_admin()
      or p_org = auth.api_key_org()
      or is_parent_reseller(p_org);
$$;

alter table org_branding enable row level security;

-- Read: anyone who can see the org can see how it is branded — they are looking
-- at it on every page anyway.
create policy branding_read on org_branding for select to authenticated
  using (is_org_member(org_id));

-- ...AND a client may read the branding of the agency ABOVE it. This is not a
-- convenience, it is the tier working at all: resolution is own row → PARENT's
-- row → platform (lib/branding.ts), and a sub-org's member is NOT a member of
-- the parent, so without this the parent's row is invisible to them and every
-- client that has not been branded individually falls all the way back to
-- "VoiceFlow" — precisely what the tier is sold to prevent.
--
-- It reads DOWNWARD-inverted, not upward-general: you may read org X's branding
-- only if you belong to an org whose parent IS X. A client still cannot see the
-- agency's agents, calls, usage or anything else — just the name, colour and
-- logo it is already being shown on every screen.
create policy branding_read_parent on org_branding for select to authenticated
  using (
    exists (
      select 1 from orgs child
      where child.parent_org_id = org_branding.org_id
        and child.id in (select org_id from org_members where user_id = auth.uid())
    )
  );

-- Write: the org's own owner, or the reseller above it. NOT a plain member and
-- NOT a sub-org's owner acting on itself — a white-labelled client changing the
-- product name out from under the agency reselling to them is the one edit this
-- table must refuse. is_parent_reseller() is the only arm that lets a sub-org
-- row be written at all.
create policy branding_write on org_branding for insert to authenticated
  with check (
    (is_org_owner(org_id) and not exists (select 1 from orgs o where o.id = org_id and o.parent_org_id is not null))
    or is_parent_reseller(org_id)
  );
create policy branding_update on org_branding for update to authenticated
  using (
    (is_org_owner(org_id) and not exists (select 1 from orgs o where o.id = org_id and o.parent_org_id is not null))
    or is_parent_reseller(org_id)
  )
  with check (
    (is_org_owner(org_id) and not exists (select 1 from orgs o where o.id = org_id and o.parent_org_id is not null))
    or is_parent_reseller(org_id)
  );

-- Column privileges on top of RLS, the 0020 pattern. 0000 grants members
-- table-level SELECT/UPDATE on every public table, and TWO columns must not be
-- among the updatable ones. Both assert a fact only WE can establish:
--
--   email_sender_verified     — that this tenant controls a sending domain. A
--                               reseller who could set it would send mail as
--                               any domain they liked from our infrastructure.
--   custom_domain_verified_at — that this tenant controls a hostname. A
--                               reseller who could set it would point a vanity
--                               host at our own domain and repaint the real
--                               product for everyone.
--
-- Both are spoofing primitives, not features.
revoke update on org_branding from authenticated;
grant update (product_name, logo_key, logo_content_type, brand_color, custom_domain,
              support_email, email_from_address, updated_at)
  on org_branding to authenticated;

-- INSERT needs the same treatment, and it is easy to miss: 0000 grants members
-- table-level INSERT on every public table, so a FIRST write could set either
-- verification flag even though no UPDATE ever can. saveBranding() builds its
-- row from a fixed key set today, which is why this is latent rather than
-- exploitable — but the next field added to BrandingPatch should not be able to
-- turn a column grant into a spoofing primitive.
revoke insert on org_branding from authenticated;
grant insert (org_id, product_name, logo_key, logo_content_type, brand_color,
              custom_domain, support_email, email_from_address, updated_at, created_at)
  on org_branding to authenticated;

-- THE STAMP MUST NOT SURVIVE A CHANGE OF HOSTNAME.
--
-- custom_domain_verified_at says "we checked that this tenant controls THIS
-- host". The tenant can edit custom_domain (they must — that is how they claim
-- one), and the stamp is a separate column, so without this trigger a tenant
-- whose first host was verified could repoint the column at ANY other hostname
-- and keep the verification. That is the takeover the stamp exists to stop,
-- surviving the gate.
--
-- It has to live in the database: `authenticated` deliberately holds no UPDATE
-- privilege on the stamp, so the app physically cannot clear it.
create function org_branding_reverify() returns trigger
language plpgsql as $$
begin
  if new.custom_domain is distinct from old.custom_domain then
    new.custom_domain_verified_at := null;
  end if;
  return new;
end $$;

create trigger org_branding_reverify_trg
  before update on org_branding
  for each row execute function org_branding_reverify();

-- Rollup is read-only to members (owners and resellers read it on the statement
-- page). Only the nightly job writes it, as service_role — rule 5: billing
-- numbers come from reconciliation, never from something a member can POST.
alter table agency_periods enable row level security;
create policy agency_periods_read on agency_periods for select to authenticated
  using (is_org_member(parent_org_id));
revoke insert, update, delete on agency_periods from authenticated;

-- ────────────────────────────────────────────────── rollup recomputation
--
-- Rewrites one agency's period from usage_periods (rule 5: the billed number is
-- derived from the reconciled source, never accumulated from webhooks).
-- reported_minutes is deliberately NOT touched — it is the ledger of what Stripe
-- has already been told, and recomputing family usage must never make a minute
-- billable twice.
create function recompute_agency_usage(p_parent uuid, p_period date)
returns void language plpgsql as $$
declare
  v_family numeric;
  v_pool   int;
begin
  select o.minutes_cap into v_pool from orgs o where o.id = p_parent;
  if v_pool is null then
    return; -- unknown org: nothing to roll up
  end if;

  -- The family is the parent plus its sub-orgs. One query, so a sub-org that
  -- has not billed a minute this month simply contributes nothing.
  select coalesce(sum(u.minutes_used), 0) into v_family
  from usage_periods u
  join orgs o on o.id = u.org_id
  where u.period_start = p_period
    and (o.id = p_parent or o.parent_org_id = p_parent);

  insert into agency_periods (parent_org_id, period_start, pooled_minutes,
                              family_minutes, billable_minutes, updated_at)
  values (p_parent, p_period, v_pool, v_family, greatest(v_family - v_pool, 0), now())
  on conflict (parent_org_id, period_start) do update set
    -- The pool follows the parent's current cap: an agency that upgrades
    -- mid-month should see the larger allowance apply to the whole month, the
    -- same way orgs.minutes_cap already works for a direct customer.
    pooled_minutes   = excluded.pooled_minutes,
    family_minutes   = excluded.family_minutes,
    billable_minutes = greatest(excluded.family_minutes - excluded.pooled_minutes, 0),
    updated_at       = now();
end $$;

revoke execute on function recompute_agency_usage(uuid, date) from public, anon, authenticated;
