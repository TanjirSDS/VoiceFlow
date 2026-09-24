# Phase 25 research — HubSpot & Pipedrive CRM sync

_Researched 2026-09-24. Primary sources only; inferences and gaps marked._

## The decision this serves

Phase 25 replaces the `/integrations` "Register interest" button with real sync: connect a
CRM by OAuth, then log every completed call against the caller's contact record. Three
things had to be settled before any client code could be written, because each one is
expensive to discover late:

1. **Which OAuth endpoints and scopes** — a wrong scope string does not fail at call time,
   it fails at *install* time: HubSpot rejects the authorize URL outright, so the customer
   sees a broken "Connect" button and we see nothing.
2. **Token lifetime and refresh semantics** — these differ enough between the two providers
   that one refresh strategy cannot serve both (see register rows 5–7).
3. **How a contact is matched by phone number** — we hold E.164 (`+15551234567`). Neither
   CRM matches on that string the way you would expect, and HubSpot's behaviour here is the
   single most likely cause of "the call logged against the wrong contact / a duplicate".

## Master register — OAuth

| # | Question | HubSpot | Pipedrive |
|---|---|---|---|
| 1 | Authorize URL | `https://app.hubspot.com/oauth/authorize` [hs-oauth] | `https://oauth.pipedrive.com/oauth/authorize` [pd-oauth] |
| 2 | Token URL | `https://api.hubapi.com/oauth/2026-09/token` [hs-token] | `https://oauth.pipedrive.com/oauth/token` [pd-oauth] |
| 3 | Client auth at token endpoint | `client_id` + `client_secret` in the **form body** [hs-token] | **HTTP Basic**: `Authorization: Basic base64(client_id:client_secret)` [pd-oauth] |
| 4 | Content-Type | `application/x-www-form-urlencoded` [hs-token] | `application/x-www-form-urlencoded` [pd-oauth] |
| 5 | Access token lifetime | `expires_in: 1800` — 30 minutes [hs-token][hs-expiry] | "`access_token` expires after 60 minutes" [pd-oauth] |
| 6 | Refresh token expiry | No documented expiry. Changelog: "This change will have no effect on refresh tokens" [hs-expiry]. Indefinite-until-uninstall is community-sourced — see Unverified | "`refresh_token` will expire if it isn't used in **60 days**" [pd-oauth] |
| 7 | Refresh rotation | Response returns a `refresh_token` field [hs-token]; no documented rotation requirement | "Each time `refresh_token` is used, its expiry date is **reset** back to 60 days" — same token reissued, window extended [pd-oauth] |
| 8 | API base URL | Fixed: `https://api.hubapi.com` [hs-ver] | **Per-install**: the token response's `api_domain`, "the base URL path, including the `company_domain`, where the requests can be sent to" [pd-oauth] |
| 9 | Scopes we request | `crm.objects.contacts.read`, `crm.objects.contacts.write` — see row 10 | `base` (mandatory), `contacts:full`, `activities:full` [pd-scopes] |
| 10 | **Scope for logging a call** | The Calls API's own scope-requirements section reads: **"This API requires one of the following scopes: `crm.objects.contacts.read`, `crm.objects.contacts.write`"** [hs-calls-legacy]. `crm.objects.calls.write` exists but is a granular scope tied to the Calling Extensions SDK and is **not** in the public scopes table [hs-scopes] | `activities:full` [pd-scopes] |

**Row 10 is the finding that changes the code.** The intuitive scope string for "log a call"
is `crm.objects.calls.write`. Requesting it is an install-time failure mode for a scope we do
not need: the contacts scopes we already require to upsert the contact are the same scopes
the Calls API asks for. We request exactly two HubSpot scopes and no call-specific scope.

## Master register — contact matching and call logging

| # | Question | HubSpot | Pipedrive |
|---|---|---|---|
| 11 | Search for a contact by phone | `POST /crm/objects/2026-09/contacts/search` with `filterGroups[].filters[]` of `{propertyName, operator, value}` [hs-search-guide] | `GET /api/v2/persons/search?term=&fields=phone&exact_match=true` [pd-persons] |
| 12 | **Phone-number matching quirk** | **"HubSpot only uses the area code and local number"** and advises to **"refrain from including the country code in your search or filter criteria"** — normalization happens via calculated `hs_searchable_calculated_*` properties [hs-search] | Matches the stored string; `exact_match` is "case-insensitive" full match [pd-persons] |
| 13 | **Search freshness** | **"It may take a few moments for newly created or updated CRM objects to appear in search results."** [hs-search] | Not documented — see Unverified |
| 14 | Create a contact | `POST /crm/objects/2026-09/contacts`, body `{ "properties": { … } }` [hs-contacts] | `POST /api/v2/persons`; only `name` required; **`phones`** (plural in v2) — an array of `{value, primary, label}`. v2 renamed them: "'phone', 'email' and 'im' fields have been renamed to 'phones', 'emails' and 'ims'" [pd-persons][pd-v2] |
| 15 | Log the call | `POST /crm/objects/2026-09/calls` [hs-calls] | `POST /api/v2/activities` [pd-activities] |
| 16 | Required field on the call | **`hs_timestamp`** — "This field marks the call's time of creation"; accepts Unix ms or UTC ISO [hs-calls] | No field is explicitly marked required [pd-activities]; we send `subject`, `type`, `due_date`, `due_time`, `duration`, `person_id`, `done`, `note` |
| 17 | **Duration units** | **Milliseconds** [hs-calls] | **`HH:MM` string** (e.g. `01:20`) [pd-activities-fmt] |
| 18 | Timestamp format | Unix ms, or UTC ISO-8601 (`2021-03-17T01:32:44.872Z`) [hs-calls] | `due_date` = `YYYY-MM-DD`, `due_time` = `HH:MM` [pd-activities-fmt] |
| 19 | Direction / status enums | `hs_call_direction`: `INBOUND` \| `OUTBOUND`. `hs_call_status`: `BUSY`, `CALLING_CRM_USER`, `CANCELED`, `COMPLETED`, `CONNECTING`, `FAILED`, `IN_PROGRESS`, `NO_ANSWER`, `QUEUED`, `RINGING` [hs-calls] | `type: "call"`; `done: true` — v2 accepts **only** `true`/`false`, not `1`/`0` [pd-activities-fmt][pd-v2] |
| 20 | Associating the call to the contact | In the create body: `associations[].to.id` + `types[]` of `{associationCategory: "HUBSPOT_DEFINED", associationTypeId: 194}`. **194 = call → contact** [hs-calls] | `person_id` on the activity [pd-activities] |

## Rate limits and 429 semantics

| | HubSpot | Pipedrive |
|---|---|---|
| Model | Fixed burst + daily cap | **Token budget**: "30,000 base tokens × subscription plan multiplier × number of seats" [pd-rate] |
| Burst | **190 requests / 10 seconds** for OAuth apps [hs-limits] | Per **2-second** window; OAuth apps get **4×** the API-token limits (Lite 20, Growth 40, Premium 100, Ultimate 120 → ×4) [pd-rate] |
| Search-specific | **5 requests/second per account**, results capped at 10,000 [hs-search] | **10 requests per 2s window, all plans** [pd-rate] |
| On exceed | `429`, **with a `Retry-After` header** [hs-limits] | `429` ("Once the daily budget is fully depleted, all further API requests will be rejected with a 429"); sustained abuse gets `403` [pd-rate] |
| Headers | `Retry-After` [hs-limits] | `x-ratelimit-limit`, `x-ratelimit-remaining`, `x-ratelimit-reset`; **no `Retry-After`** [pd-rate] |

The asymmetry in the last row is why retry/backoff is per-provider rather than shared: for
HubSpot the server tells us how long to wait and we should obey it; for Pipedrive nothing
does, so the client computes its own backoff. Both search endpoints are far stricter than
the general limit, and the search call is the one this job makes on every single call — so
the search is the limit that binds, not the write.

## API versioning — why dated paths

HubSpot moved to date-based versioning. The legacy numeric paths still work but have an
announced end: endpoints using `/v1/`, `/v2/`, `/v3/` **"will move to unsupported status"**
and **"After September 2027, these endpoints will be unsupported"** [hs-legacy]. The docs are
explicit for new work: **"For new integrations, always use the latest date version."** [hs-ver]
All HubSpot paths above are pinned to `2026-09`, the current dated version, and the version
segment is a single constant in the client so the next bump is a one-line change.

Pipedrive is mid-migration from v1 to v2; persons, persons/search and activities all have v2
endpoints and v2 is what the current reference documents [pd-persons][pd-activities]. v2
tightened validation (booleans no longer accept `1`/`0`) [pd-v2].

## Consequences for the implementation

1. **HubSpot phone search must strip the country code.** Sending the E.164 string we store
   (`+15551234567`) searches against a value HubSpot has normalized to area code + local
   number. Row 12 is documented guidance, not a guess, and getting it wrong means every
   search misses and every call creates a duplicate contact.
2. **Search-then-create is racy on HubSpot** (row 13). Two calls from the same number inside
   the indexing window both miss and both create. Fixed by caching the CRM record id on our
   own `contacts` row (`contacts.crm_ids`, migration 0021), so only a number's first-ever
   call searches at all — which also lifts the scarcest metered request off the per-call
   path. A number whose local contact row does not exist yet still searches each time.
3. **Duration conversion differs per provider** (row 17): `duration_secs × 1000` for HubSpot,
   `duration_secs` formatted `HH:MM` for Pipedrive. A shared "duration" field would be wrong
   for one of them.
4. **Pipedrive's API base URL is per-install** (row 8) and must be persisted with the tokens;
   it cannot be a constant or an env var.
5. **Pipedrive refresh tokens die after 60 days of disuse** (row 6). An org that takes no
   calls for two months silently loses its connection, so the stored connection needs a
   visible status the UI can show rather than failing at the next call.

## Unverified / needs confirmation

- **HubSpot refresh-token expiry.** No primary doc states that refresh tokens never expire.
  The changelog says only that the access-token change "will have no effect on refresh
  tokens" [hs-expiry]; "they do not expire except on uninstall" comes from HubSpot Community
  threads, not documentation. **[UNVERIFIED]** — the code therefore treats a refresh failure
  as an expected state (mark the connection `revoked`, surface it in the UI) rather than an
  impossible one.
- **Pipedrive search-index freshness.** Whether `persons/search` reads an index with lag, as
  HubSpot's does, is not documented. **[UNVERIFIED]** — the same serialize-and-re-search
  guard is applied to both providers rather than only to HubSpot.
- **`hs_call_disposition`.** Valid values are a per-account GUID list fetched from a
  dispositions endpoint, not a fixed enum; not needed for this phase, so the field is left
  unset rather than guessed. **[INFERRED]** from its absence in the create example [hs-calls].
- **Pipedrive plan multiplier at our customers' tiers** is unknowable from our side — the
  budget depends on their seat count and plan. The client cannot predict the daily cap and
  so treats 429 as a normal, retryable condition rather than an error worth paging on.
- **`api.hubspot.com` vs `api.hubapi.com`.** The Calls guide's example uses
  `https://api.hubspot.com/crm/objects/2026-09/calls` [hs-calls] while the versioning
  overview states "all APIs, whether legacy, new, or beta, use the same root path as before:
  `https://api.hubapi.com/`" [hs-ver]. We use `api.hubapi.com` — the root the versioning doc
  is explicit about. **[UNVERIFIED]** that both hosts serve the same routes.

## Sources

All fetched 2026-09-24.

- [hs-oauth] HubSpot, Working with OAuth — https://developers.hubspot.com/docs/guides/apps/authentication/working-with-oauth
- [hs-token] HubSpot, Refresh an access token (2026-09) — https://developers.hubspot.com/docs/api-reference/latest/authentication/oauth-tokens/refresh-oauth-token
- [hs-expiry] HubSpot changelog, Expiration of OAuth access tokens is changing — https://developers.hubspot.com/changelog/upcoming-expiration-of-oauth-access-tokens-is-changing
- [hs-scopes] HubSpot, Scopes — https://developers.hubspot.com/docs/apps/legacy-apps/authentication/scopes
- [hs-calls] HubSpot, Calls API guide (latest) — https://developers.hubspot.com/docs/api-reference/latest/crm/activities/calls/guide
- [hs-calls-legacy] HubSpot, Activities | Calls guide (scope requirements) — https://developers.hubspot.com/docs/api-reference/legacy/crm/activities/calls/guide
- [hs-contacts] HubSpot, Contacts API — https://developers.hubspot.com/docs/api-reference/legacy/crm/objects/contacts/guide
- [hs-search] HubSpot, CRM Search API (latest) — https://developers.hubspot.com/docs/api-reference/latest/crm/search-the-crm
- [hs-search-guide] HubSpot, CRM search guide — https://developers.hubspot.com/docs/guides/api/crm/search
- [hs-limits] HubSpot, API usage guidelines and limits — https://developers.hubspot.com/docs/developer-tooling/platform/usage-guidelines
- [hs-ver] HubSpot, API overview / date-based versioning — https://developers.hubspot.com/docs/guides/api/overview
- [hs-legacy] HubSpot changelog, Legacy APIs and Apps: What's Going Unsupported and When — https://developers.hubspot.com/changelog/legacy-apis-and-legacy-apps-whats-going-unsupported-and-when
- [pd-oauth] Pipedrive, Marketplace OAuth authorization — https://pipedrive.readme.io/docs/marketplace-oauth-authorization
- [pd-scopes] Pipedrive, Scopes and permissions — https://pipedrive.readme.io/docs/marketplace-scopes-and-permissions-explanations
- [pd-persons] Pipedrive, Persons (v2) — https://developers.pipedrive.com/docs/api/v1/Persons
- [pd-activities] Pipedrive, Activities (v2) — https://developers.pipedrive.com/docs/api/v1/Activities
- [pd-activities-fmt] Pipedrive, Adding activities tutorial — https://developers.pipedrive.com/tutorials/add-activity-pipedrive-api
- [pd-v2] Pipedrive, API v2 migration guide — https://pipedrive.readme.io/docs/pipedrive-api-v2-migration-guide
- [pd-rate] Pipedrive, Rate limiting — https://pipedrive.readme.io/docs/core-api-concepts-rate-limiting
