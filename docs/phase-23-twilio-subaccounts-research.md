# Phase 23 research — Twilio subaccounts (resolves architecture §12 Q3)

_Researched 2026-09-23. Primary sources only; inferences and gaps marked._

## The decision this serves

§12 Q3 asks: one shared Twilio account, or a subaccount per tenant? Choosing wrong is
expensive in one direction only. Staying shared means every org's numbers sit under one
set of credentials, so a leaked token exposes every tenant. Moving to subaccounts is
reversible for *new* numbers but touches *existing* ones — so the load-bearing question
is whether an already-purchased number can move without being released.

## Master register

| # | Question | Finding | Source |
|---|---|---|---|
| 1 | Create a subaccount | `POST /2010-04-01/Accounts`, authenticated with the **parent** account SID + token. Response returns `sid` and `auth_token` | [subaccounts] |
| 2 | Retrieve a subaccount's token | `GET /2010-04-01/Accounts/{Sid}.json` with **parent** creds returns `auth_token` in the body — retrievable at any time, not just at creation | [account] |
| 3 | Rotate a token | `POST accounts.twilio.com/v1/AuthTokens/Secondary` (create), `POST .../v1/AuthTokens/Promote` (promote), `DELETE .../v1/AuthTokens/Secondary`. "This action deletes the current primary Auth Token and promotes the secondary Auth Token to primary." | [secondary][authtoken] |
| 4 | **Transfer an existing number** | **Yes.** `POST /2010-04-01/Accounts/{SourceSid}/IncomingPhoneNumbers/{Sid}.json` with form field `AccountSid={TargetSid}`. Works parent↔subaccount and subaccount↔subaccount. **"You must use your main account's credentials when making the API request to transfer a phone number."** | [incomingphonenumber][exchanging] |
| 5 | **Isolation guarantee** | **"You can't use a subaccount's credentials to access resources in your main Twilio account or any other subaccounts."** Parent creds *can* reach any subaccount's v2010 resources | [subaccounts] |
| 6 | Subaccount ceiling | **"A main account can only have up to 1000 subaccounts by default."** | [subaccounts] |
| 7 | Statuses | `active` / `suspended` / `closed`. Suspended: "can't make or receive phone calls or send and receive SMS". Closed: **"Twilio will release all phone numbers assigned to it"**, and "you can't reopen a closed account" | [subaccounts] |
| 8 | Key type for management | "To create, update, or list subaccounts, use a Main API key; Standard API keys cannot perform those actions on the parent account's behalf" | [account] |

## Transfer caveats that cost real money or uptime

From [exchanging], on moving a number between accounts:
- "Number configurations may need to be reconfigured" — voice URLs do not reliably survive.
- "Any Toll-Free number verifications, A2P registrations or Trust Hub enrollments will need
  to be resubmitted." This is the expensive one: A2P re-registration is not instant.
- Numbers with regulatory address requirements need "a compliant Address in the target
  subaccount before transferring".
- WhatsApp-connected numbers do not move automatically — they need a Twilio support ticket.

## Recommendation

**Adopt subaccount-per-org.** §5 is a documented isolation guarantee that matches the phase's
done-condition exactly — org A's credentials cannot touch org B's number, enforced by Twilio
rather than by our own query filters. §4 means existing numbers migrate without being released,
so no customer loses a number.

**Runner-up:** stay on one account and isolate with per-org API Keys. Switch to this only if
the 1000-subaccount ceiling (§6) is hit before Twilio raises it, since API Keys have no such cap.

**Design consequences, load-bearing:**
1. Purchases for a new org happen *directly* in that org's subaccount, so no transfer is needed.
   Only pre-existing numbers need the backfill script.
2. The backfill needs **parent** creds (§4); the runtime search/purchase/release path needs the
   **org's** creds. Two different credential scopes in one codebase — keep them separate.
3. Never map "delete org" to subaccount `closed`: §7 says that releases their phone numbers.
   Suspend instead.
4. Because §2 lets the parent re-fetch any token, our encrypted copy is a cache, not the only
   record. A lost encryption key is recoverable — it is not a data-loss event. [INFERRED]

## Unverified / needs confirmation

- **Rotating a subaccount's token from the parent in one call is not documented.** The
  `/v1/AuthTokens/Promote` endpoint shows no subaccount SID parameter and appears to act only on
  the authenticating account, implying a rotation script must authenticate *as each subaccount*
  in turn. Not stated either way in the docs. `[UNVERIFIED]`
- Whether API Keys are rejected by the AuthToken endpoints (error 20003 was reported by a
  secondary source, not found in the primary page). `[UNVERIFIED]`
- Whether the 1000-subaccount default can be raised on request, and the lead time. `[UNVERIFIED]`
- Per-subaccount cost: no evidence subaccounts carry a separate fee, but the pricing page was
  not consulted for this. `[UNVERIFIED]`

[subaccounts]: https://www.twilio.com/docs/iam/api/subaccounts
[account]: https://www.twilio.com/docs/iam/api/account
[incomingphonenumber]: https://www.twilio.com/docs/phone-numbers/api/incomingphonenumber-resource
[exchanging]: https://www.twilio.com/docs/iam/api/subaccounts#exchanging-numbers
[secondary]: https://www.twilio.com/docs/iam/api/secondary_authtoken
[authtoken]: https://www.twilio.com/docs/iam/api/authtoken
