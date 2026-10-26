# SDS Distribution for suppliers (eCommerce / DirectSDS), the customer SDS portal, and integrations

> Summary: **SDS Distribution** (also called the eCommerce module; the collapsed sidebar shows it as **DirectSDS**) is the part of SDS Manager built for chemical suppliers, distributors and webshops that must hand safety data sheets to their own customers. Your ERP or webshop calls the SDS Manager eCommerce API with a product code (SKU, EAN, UPC or external system ID) and an email address; SDS Manager finds the current SDS in your library, emails the PDF to the customer, can subscribe that customer to future revisions, and can enrol the customer's company in a self-service **SDS Portal** where its staff sign in with an emailed code and download the SDSs for everything they have bought. Supporting screens let you set the countries you sell to, confirm which country each SDS belongs to, check kits/duplicates and missing country-language versions, read the API error log, manage email templates, embed an SDS search on your website, and manage your end customers. This topic also covers the other integrations visible in the app: the API key in Settings, MCP Server Access for AI assistants, the SafetyCulture integration, and the live chat widget.

## Where to find it

**SDS Distribution menu (supplier/merchant side)** — in the left sidebar, the shopping-cart item **SDS Distribution** (shown as **DirectSDS** under the icon when the sidebar is collapsed). It expands to these pages, in this order:

| Menu item | Page heading | URL path |
|---|---|---|
| **SDS Distribution** | SDS Distribution | /ecommerce/distribution-overview |
| **Version Update Subscriptions** | Version Update Subscriptions | /ecommerce/versionsUpdateSubscriptions |
| **Sent Emails** | Sent Emails | /ecommerce/sentEmails |
| **API Error Logs** | API Error Logs | /ecommerce/api-error-log |
| **SDS Country Review** | SDS Country Review | /ecommerce/country-review |
| **Kit Verification** | Verify SDS kits and bundles | /ecommerce/sku-conflicts |
| **Country Coverage Gaps** | Country coverage gaps | /ecommerce/coverage-gaps |
| **End Customers (Portal)** | End customers (portal users) | /ecommerce/end-customers |
| **Website Search** | Website SDS Search | /ecommerce/website-search |
| **SDS Library List** | SDS Library List | /ecommerce/sds-list |

Other places that belong to this area:
- **Settings → Integrations** (Administration → **Settings**, section **Integrations**): generate and manage the API key and read the built-in API reference. The **API Authentication** card on the SDS Distribution page links here.
- **Location management**: a **Webshop** column in the location tree and the checkbox **Make SDS on this location searchable on webshop search** in the add/edit location popup control which locations appear in your website SDS search.
- **SDS row menu inside a location** ("more actions"): **Version Update Subscriptions** lets you subscribe email addresses to updates of one SDS by hand.
- **Customer portal (your customers' side)**: /portal or /portal/login (sign-in page titled **SDS Portal**), then the tabs **SDSs** (/portal/sds), **Purchases** (/portal/purchases) and **Users** (/portal/users, portal admins only). /portal/preview is only used by the merchant's **Preview** button.
- **Unsubscribe page for email recipients**: the link in SDS emails opens /ecommerce/unsubscribe/… — a public page, no login needed.
- **Account settings → MCP Server Access** (connect an AI assistant), and in **User management** the row action for the **Chat AI Agent**.
- **SafetyCulture**: section **Connect SafetyCulture** in Administration → **Settings**, plus a **SafetyCulture Folder** field in location popups.

## Plan and permission requirements

### Who can open the SDS Distribution pages

All ten SDS Distribution pages require all of the following:
1. SDS Distribution (eCommerce settings) is switched on for your company account. If it is not, the menu is hidden. How it is switched on is decided by SDS Manager (it is not a setting you can toggle in the app) — contact SDS Manager sales/support.
2. Your plan carries the eCommerce page permission. If you type an /ecommerce/ address without it, the app sends you back to the start page (and may show the "feature not available" upgrade dialog).
3. Your role is **Owner** or **Admin**.
4. You are not signed in through a QR-code login.

| Role | SDS Distribution pages | API key (Settings → Integrations) | API Authentication card on SDS Distribution page |
|---|---|---|---|
| Owner | Yes | Yes | Yes |
| Admin | Yes | No | No (hidden) |
| Admin Light | No | No | No |
| Admin with approval (location role) | No | No | No |
| Staff | No | No | No |
| Read only | No | No | No |
| No Access | No | No | No |
| QR-code login users | No | No | No |

Related controls outside the SDS Distribution menu (all only on accounts with SDS Distribution enabled):
- The **Webshop** column in the location tree: Owner and Admin only (desktop only).
- The checkbox **Make SDS on this location searchable on webshop search** in the add/edit location popup: anyone who can add or edit that location.
- The **Version Update Subscriptions** item in an SDS's row menu inside a location: Owner, Admin and Admin Light, and only for SDSs that have a PDF.

### eCommerce plan tiers — what the app says each includes

eCommerce accounts see eCommerce plans on the **Subscription** page instead of the Inventory Manager plans. The plan names are **eCommerce Free**, **eCommerce Basic**, **eCommerce Premium** and **eCommerce Pro**. The plan boxes list these features (exact on-screen wording):

| Plan | Features listed in the app |
|---|---|
| **eCommerce Basic** | Suitable for B2C sales · Simple SDS database management · Quick drag-and-drop SDS import · Automatic replacement of outdated SDS versions · Website-embedded SDS search tool for customer access · Permanent SDS link for product pages - remains unchanged even when the SDS is updated to a new version. |
| **eCommerce Premium** | All features from "Basic" + · Optimized for B2B sales workflows · Automatically email SDSs triggered by your ERP system · Map product SKUs to the correct SDS files. · Customers are automatically subscribed to receive SDS updates · Auto-replacement of outdated SDSs and automatic emailing of the updated version to all affected customers · Dynamically display SDS links, hazard (H) and precautionary (P) statements, and GHS pictograms on your product pages · Add direct SDS links to sales orders and confirmations |
| **eCommerce Pro** | All features from "Premium" + · Optimized for B2B workflows with high frequency of SDS updates · Dedicated email address for SDS submissions from your suppliers · Automatic import of incoming SDS files · Employee access to your SDS library through QR code posters placed in your warehouse |
| **eCommerce Free** | The plan name exists, but the app shows no feature list for it. |

Notes:
- The app itself does not lock individual SDS Distribution pages per tier; which tier unlocks which capability is enforced by SDS Manager's servers. Prices are not in the application — see the topic **Plans, Free Trial, Sign-up, Billing and Subscription**, or confirm with SDS Manager sales.
- For eCommerce plans, the payment-method choice offers only **Pay by Invoice or PO** (the card option is not shown).

### API key and API endpoints

- The **Integrations** section in Settings is visible only to the **Owner**, and only when either SDS Distribution is enabled on the account or the Inventory Manager plan is **Pro** or **Enterprise** (Inventory **Premium** does not get it).
- A Pro/Enterprise Inventory Manager account without an eCommerce subscription can generate a key, sees only the two library endpoints, and sees the note: "These API endpoints require an active eCommerce (SDS Distribution) subscription. Your plan can generate an API key; dedicated Inventory Manager endpoints will be available soon."

### MCP Server Access (AI assistants)

- The **MCP Server Access** section in Account settings is a paid feature. It is blocked on free trials (unless SDS Manager has granted the account paid access, for example a paid subscription alongside the trial or a parent organization that pays for it), and the plan must include it; when your plan does not, clicking it opens the upgrade dialog, which names the plan you need. The exact list of plans is set by SDS Manager, not in the app — confirm with sales.
- The Owner always sees the section when the plan allows it (or as an upsell). Other users see it only after an Owner or Admin has activated/enabled the Chat AI Agent for them in **User management**.

### SafetyCulture

The SafetyCulture screens appear only when the SafetyCulture integration is enabled on your company account (how it gets enabled is not specified in the app; contact support). The pop-up asking for a SafetyCulture API key on start-up appears only for the Owner. On a free trial or the Free plan, at most 20 SDSs sync to SafetyCulture.

## How SDS distribution works end to end

1. **Build your SDS library** in SDS Manager as usual (see the topic **SDS library: substances list, SDS details, stock, archive and export**). Each SDS can carry product identifiers: **SKU**, **EAN code**, **UPC (barcode)** and **External System Id** (your ERP product ID). SKU and External System Id can, for example, come in through the product-list import, where the SKU column is described as "For use by ecommerce solutions".
2. **Generate an API key** (Owner → Settings → **Integrations** → **Generate API Key**). Your ERP/webshop sends this key in the X-Ecommerce-Api-Key header.
3. **Set up distribution** on the **SDS Distribution** page: tick **I only sell to …** if you sell to one country, or list the countries you sell to under **Selling to (target markets)**.
4. **Clean the data**: confirm country tags on **SDS Country Review**, check duplicate/kit bundles on **Kit Verification**, and fill missing country-language versions found on **Country Coverage Gaps**.
5. **Send SDSs**: when an order is placed, your system calls **Send SDS to Customer** with a product identifier and the customer's email. SDS Manager finds the correct, up-to-date SDS PDF in your library and emails it with the PDF attached, using your email template. It always sends the latest revision; replaced and archived SDSs are skipped and the "replaced by" chain is followed automatically. If more than one SDS shares the product code for the same country and language (a kit, e.g. Part A + Part B), all of them are attached to one email.
6. **Keep customers updated**: with add_subscription set to true (or via **Subscribe to SDS Updates**), the customer is subscribed to new versions of that SDS. When a new revision is published in your library, the customer receives the updated PDF by email automatically. Subscriptions appear on **Version Update Subscriptions**.
7. **Give customers a portal**: pass company_name in the send/subscribe call, or bulk-import your sales history as CSV on **End Customers (Portal)**. The customer's company is enrolled in the **SDS Portal**, where its users can sign in with an emailed 6-digit code and see/download SDSs for products they purchased.
8. **Monitor**: every API error and every country fallback is logged in real time to **API Error Logs**; every email sent appears on **Sent Emails**.

Duplicate protection: if the same product has already been sent to the same email address, no second email is sent and the API Error Log records "This product has already been sent to the specified email address. No additional email was sent."

## Settings → Integrations: API key and built-in API reference

**Who:** Owner only (see "Plan and permission requirements"). Opened from Administration → **Settings** → **Integrations**, or from the **Generate API Key** / **Manage API Key** button on the SDS Distribution page.

On-screen text: "Use this API key to authenticate with the SDS Manager API." and "Include this key in the X-Ecommerce-Api-Key header when calling the API."

### Generate, copy, regenerate, revoke
1. Click **Generate API Key**. The full key is shown once with the message "API key generated successfully. Copy it now — it will not be shown again."
2. Click **Copy** ("API key copied to clipboard."). Store it in your ERP/webshop.
3. Afterwards the page only shows **Current API Key** in masked form (only part of the key is visible). If the key is lost, regenerate it.
4. **Regenerate API Key** asks: "This will invalidate the current API key. Any integrations using the old key will stop working. Continue?" — **OK** issues a new key and the old one stops working.
5. **Revoke API Key** asks: "This will permanently delete the API key. Any integrations using this key will stop working. Continue?" — afterwards "API key revoked successfully." and "No API key has been generated for this account."

Only one key is shown per account.

### Available API Endpoints (as documented on screen)

After a key exists, the section **Available API Endpoints** lists expandable cards with a parameter table, an example request and a tip. eCommerce accounts see all five; Pro/Enterprise Inventory accounts see only the first two.

| Endpoint (on-screen title) | What it does |
|---|---|
| **List SDS Library** | Returns your whole SDS library with product identifiers (SKU, EAN, UPC, external system ID), supplier, revision date, language, signal word, UFI code, GHS pictograms (with image URLs), H-, P- and EUH-statements with text, PPE icons (M-codes) and the extracted Section 2 text — all statement texts in the SDS language. The app says this covers EU CLP Article 48 (online advertising of hazardous chemicals) and the upcoming Article 48a distance-selling requirements (from 1 January 2028). Parameters: updated_after (date, for delta syncs: items whose SDS revision date or inventory record changed on/after that date), page, page_size (default 100, max 200). |
| **Download SDS Library (file)** | Same data as one file: file_format xlsx (default), csv or json; optional updated_after. Spreadsheet formats flatten multi-value fields into delimited cells; JSON keeps nesting. The file is named sds_library_<date>.<ext>. |
| **Send SDS to Customer** | Emails the correct, current SDS PDF to a customer. Identify the product with at least one of sku, ean, upc, external_system_id or sds_id; email (required; comma-separate several); language (ISO 639-1, e.g. "no", "en", "de"; defaults to the SDS language); add_subscription (true = 365-day update subscription); company_name (enables portal access for that company). Duplicate sends are prevented automatically. |
| **Subscribe to SDS Updates** | Subscribes email(s) to new-version notifications for an SDS without sending it now (e.g. bulk-subscribing existing customers or extending subscriptions). Identifier (sku/ean/upc/external_system_id/sds_id), email (required, comma-separated allowed), subscription_length_days (default 365), language. Not needed if you already use add_subscription on Send SDS. |
| **Unsubscribe from SDS Updates** | Removes an email from notifications. email is required; with no product identifier the email is unsubscribed from all SDS notifications, with an identifier only that subscription is removed. |

The on-screen descriptions use these exact words for the parameter table: **Parameters**, **Name**, **Type**, **Description**, **required**, **Example**, **Tip:**.

## SDS Distribution page (setup, health and guide)

Heading **SDS Distribution** — "Configure and monitor how SDSs are sent to your customers through the ecommerce API." While country detection is running, a banner says "Detection is running in the background. Numbers will refresh automatically."

### Setup card
- **I only sell to {country} ({code})** — appears when your account country is set (otherwise: "Set your account country in account settings to enable the single-country shortcut."). Help text: "Treats every SDS as a {country} SDS — bypasses country tagging requirements." Saving shows "Setup saved" (or "Failed to save").
- If that country has more than one official language, a warning explains you must pass language on send-sds calls when a SKU is linked to SDSs in different languages, otherwise the API returns an error (visible on the API Error Log).
- **Selling to (target markets)** (only when single-country mode is off): pick countries in **Selling to** ("Add countries…"), then **Save target markets** ("Target markets saved" / "Failed to save target markets"). Hint: "Drives the Coverage Gaps analysis."
- **Email me a daily digest when SDSs need country review** (only when single-country mode is off) — tick to receive a daily email when SDSs are waiting on Country Review.

### Health cards
Each card shows a number, a status dot (OK or needs attention) and a button.

| Card | Shows | Button |
|---|---|---|
| **SDSs need country review** (hidden in single-country mode) | Need review + cannot detect. "Every SDS is reviewed. Re-run detection any time." or "{pending} need confirmation, {unresolved} could not be detected." | **Open Country Review** |
| **SDS bundles to verify** (info tooltip explains bundles/kits) | Product codes with more than one SDS. "No product codes bundle multiple SDSs together." or "Some product codes bundle multiple SDSs. Verify each is a real kit (Part A + Part B) and not an obsolete duplicate." | **Verify Kits** |
| **Country coverage gaps** (hidden in single-country mode) | "Set target markets above to enable gap analysis.", "Every product code covers all your target market combinations." or "Some product codes are missing SDSs for one or more of your target markets." | **View Coverage Gaps** |

### How it works guide
A collapsible box: **How SDS sending works for your single-country setup** (single-country mode) or **How country detection & SDS sending work** (multi-country). Its rules are described in "How the API chooses which SDS to send (countries, languages, kits)".

### API Authentication card (Owner only)
"API key is configured and active" with **Manage API Key**, or "No API key configured — generate one to start using the API" with **Generate API Key**. Both open Settings → Integrations.

### Recent API errors
The five newest API Error Log entries (reason, email, time); click one, or **Open API error log**. Empty state: "No recent API errors."

## How the API chooses which SDS to send (countries, languages, kits)

Why country matters (on-screen): your library may contain different SDSs for the same product across markets — a US and a Canadian version, or a French SDS that could belong to France, Belgium or Switzerland.

**Automatic country detection.** SDS Manager detects each SDS's country from the emergency phone number, the producer's location, and — when a language is used in only one country (Norwegian, Polish, Czech, etc.) — the SDS language. Unambiguous SDSs are auto-accepted; the rest go to **SDS Country Review** for you to confirm.

**Sending rules and quirks:**
- A send with a SKU/EAN/UPC sends every matching SDS in a single email (kits).
- **Country tagging:** if a SKU maps to SDSs for different countries, pass country in the request, otherwise the API returns MULTIPLE_SDS_REQUIRES_COUNTRY.
- **Language tagging:** if a SKU maps to SDSs in different languages, pass language, otherwise the API returns MIXED_LANGUAGE_SDS_NOT_ALLOWED. One language per send.
- **Country fallback:** if there is no exact match, SDS Manager falls back to a same-language SDS, an SDS with undecided country, or any SDS for the SKU, and writes a warning to the API Error Log.
- Replaced and archived SDSs are skipped; the "replaced by" chain is followed.
- Every API error and fallback appears in **API Error Logs** in real time.

**Single-country mode** (I only sell to …): every SDS in the library is treated as an SDS for that country, so most country ambiguity disappears. Country Review and Coverage Gaps cards are hidden. If the country has several official languages, you still need to pass language when a SKU has SDSs in different languages.

## SDS Country Review

Heading **SDS Country Review**. "Setup and the full guide live on the SDS Distribution page. This page is for confirming or correcting the country tag on each SDS."

### Run detection
- **Detect (incremental)** — starts country detection ("Country detection started"); the button shows **Running…** until it ends ("Country detection finished"); numbers refresh automatically.
- **Reset & rerun all** — confirmation **Reset all reviews?**: "This will reset every previous review for your library and rerun country detection from scratch. Are you sure?" Use only when you want to discard all earlier decisions.
- Error: "Failed to run detection". A run that has shown as running for more than 30 minutes is treated as stale so you can start a new one.

### Status bar
| Chip | Meaning | Clickable filter |
|---|---|---|
| **Total SDSs** | All SDSs in the library | No |
| **Not yet detected** | Not processed by detection yet | No |
| **Already correct** | Detection matches the country already set | Yes |
| **Need review** | Detected, waiting for your confirmation (default view) | Yes |
| **Accepted** | You accepted/saved a country | Yes |
| **Cannot detect** | Detection could not decide | Yes |

A **Rejected** status also exists as a badge. The line "Showing: {status} ({count} items)" names the current filter.

### Filters
**Detected country** (All countries), **Language** (All languages), **Search product / SKU** (Product name or SKU; press Enter), **No linked SKU** (only SDSs without a SKU), **Clear filters**. 20 SDSs per page.

### Each SDS card
- Product name ("(no name)" if missing), producer, SKU.
- Chips **Language: …** and **Emergency phone: …** ("(none extracted)" in warning colour if none was found).
- Icons: **Open SDS detail in new tab**, **Open PDF in new tab**; a status badge.
- **Currently set** vs **Detected** countries (new detections and removed countries are highlighted); **Accepted as** shows saved countries.
- Evidence line, by source: **Emergency phone match** (phone "…" → matching countries), **Producer country**, **SDS language → country**, **Region inference**, **Manually set**, **Could not detect** (with reason).

### Confirm or correct (Need review, Cannot detect, Already correct)
1. Adjust the **Countries** picker (Search country…) — it is pre-filled with the detected or existing countries. You can choose several.
2. Click **Save countries** → "Saved with countries: NO, SE…". (Disabled when no country is selected.)
3. Or click **Reset (re-detect later)** → "Review reset"; the SDS goes back to detection.
4. In the **Need review** view, **Accept all on this page ({count})** accepts the detected countries for every SDS on the page → "Accepted {count} items" (or "Bulk accept failed").
Errors: "Failed to apply review".

## Kit Verification (SDS bundles)

Menu **Kit Verification**, heading **Verify SDS kits and bundles**. It lists product codes that have **more than one SDS** in your library for the **same country and same language** — all of them are bundled into a single email when a customer requests this code via the ecommerce API. It is a read-only check; you fix issues elsewhere.

For each bundle decide:
- **Genuine kit** (Part A + Part B, primer + hardener, etc.) — leave as-is; both SDSs are sent together, which is intended.
- **Obsolete duplicate** — archive the old SDS so only the current one is sent; otherwise the recipient receives duplicates.
- **Different markets that got the same SKU** — fix the country tag on **Country Review** so each SDS is tagged for its country, then call send-sds with the country parameter.

Controls: **Group by:** SKU / EAN / UPC / External ID; **Limit** 50 / 200 / 500 / 1000 (default 200); **Refresh**; link **Re-run country detection** (opens Country Review). Count: "{count} bundles to verify". Each row shows the code, a country chip ("Unknown country" if none; hover for the full name), a language chip and "{count} SDSs bundled", expanded by default with each SDS's name (opens SDS detail in a new tab), producer and revision date (**View N items** / **Hide items**). Empty: "Nothing to verify. Each {field} has at most one SDS per (country, language) combination." If cut off: "Showing the first {limit} of {total} conflicts. Raise the limit or narrow your data to see the rest."

## Country Coverage Gaps

Heading **Country coverage gaps**. For each product code, SDS Manager compares the SDSs you have against the (country, language) combinations you should have based on your selling markets. Example from the screen: if you sell to Canada and the US and have an English SDS for the US version but no English SDS for Canada, that gap appears. Add the missing SDSs or document why they don't apply. If the API is asked for a missing combination, it falls back to the closest match (same language, undecided country, or any SDS) and writes a warning to the API error log.

- Requires target markets: otherwise "Target markets are not set" / "Set your target markets above to enable coverage gap analysis." with a link to SDS Distribution.
- Banners: "{count} {field}s need country review before we can analyze coverage." with **Review now** (opens Country Review filtered to Need review); "{count} items have no {field} set." with **Fix data** (lists sample SDSs to open and fix; **Hide items**).
- Controls: **Group by:** SKU / EAN / UPC / External ID; **Show** 100 / 200 / 500 / 1000 (default 200); **Refresh**. Count "{count} SKUs with gaps".
- Each gap row: the code, product name, "+N more" if several SDSs share it, the number of missing combinations, **You have** (chips "COUNTRY / LANG", or "untagged" when no country), **You are missing** (chips), and **View N items** to list the SDSs ("Showing first X of Y items").
- Empty: "No gaps. Every product code in your library covers all target market language combinations." Truncated: "Showing first {limit} of {total} gaps — refine your filters to see more."
- Not used in single-country mode.

## API Error Logs

Heading **API Error Logs**. A table of failed or problematic eCommerce API requests. Columns: **Requested by**, **Email address**, **Reason**, **Sent at** (click to sort newest/oldest; newest first by default), and a **Delete** icon that removes the row from the log. Rows per page: 10, 20, 50, 100. On mobile it shows cards.

| Reason shown | Meaning / what to do |
|---|---|
| SDS not found: {id} | The sds_id sent does not exist. Use IDs from the List SDS Library endpoint. |
| SKU not found / EAN not found / UPC not found / External system ID not found: {value} | No SDS in your library carries that code. Add the code to the right SDS or fix the code in your ERP. |
| SDS is not in customer library: {product} | The SDS exists in SDS Manager but not in your library (click to view it). Add it to your library. |
| At least one of sds_id, sku, external_system_id, ean, upc is required | The request had no product identifier. |
| Invalid email addresses provided: {emails} | Fix the recipient address(es). |
| No email addresses provided | The request had no email. |
| This product has already been sent to the specified email address. No additional email was sent. | Duplicate protection; nothing to fix unless a resend is needed. |
| Language is not supported: {language} | Use a supported ISO 639-1 language code. |
| Something went wrong while getting the SDS file | Temporary file problem; retry, contact support if it persists. |
| Something went wrong while getting the email templates | Template problem; check **Email Templates**, contact support if it persists. |

Country/language fallbacks and the codes MULTIPLE_SDS_REQUIRES_COUNTRY and MIXED_LANGUAGE_SDS_NOT_ALLOWED are also logged here (shown with the server's reason text).

## Sent Emails and Email Templates

### Sent Emails
Heading **Sent Emails** — the emails SDS Manager has sent to your customers through SDS Distribution. **Search** box (press Enter or the search icon). Columns: **Email address**, **Subject**, **Attachments** (click to open each attached PDF; "-" if none), **Sent at**, and an eye icon that opens the message: **To**, **Subject**, the message body ("No content available" if empty) and **Attachments**.

### Email Templates
Button **Email Templates** on the Sent Emails page opens a list with **Subject**, **Type**, **Language**, and edit/delete icons, plus **Add Email Template**.

Template **Type** options:
| Type | Used for |
|---|---|
| **Send SDS to Customer** | The email sent by a Send SDS request |
| **SDS New Version Notification** | Email to a subscriber when a new version of one SDS is published |
| **Multiple SDS New Version Notification** | New-version notification covering several SDSs |

How to add or edit a template (**Email Template Editor**):
1. Click **Add Email Template** (or the edit icon).
2. Choose **Language** and **Type** (choose the type explicitly).
3. Enter **Subject**. For Send SDS to Customer and SDS New Version Notification the helper says "use {% PRODUCT_NAME %} to display the product name in the subject".
4. Write the message. The variable **{% SDS_INFO %}** is required (it is pre-inserted as a locked token). Toolbar: **Bold**, **Italic**, **Underline**, **Add link** (highlight text first), **Remove link**, **Add image** (upload or image URL, optional Alt text), font size Small / Normal / Large / Huge.
5. Click **Save**.

Validation messages: "Missing required variables: {% SDS_INFO %}", "Subject is required", "Message is required", "Language is required", "Type is required", "Please highlight text to add a link.", "URL is required", "Enter a valid URL.", "Selection expired. Please highlight the text again.", "Image URL is required.", "Image is still uploading. Please wait.", "Enter a valid image URL.", "Cursor position expired. Place the cursor again.", "Unable to read the selected image.", "Failed to upload the image. Please try again."

Deleting a template removes it from your list. What is used afterwards for that type/language is not specified in the application; confirm with SDS Manager support.

## Version Update Subscriptions

Heading **Version Update Subscriptions** — every email address subscribed to new-version notifications. **Search** box. Columns: **Email address**, **Product Name** (click to open the SDS details), **Supplier Name**, **Language**, **End date** (when the subscription ends), and **Unsubscribe**. Empty: "No version update subscriptions found".

**Unsubscribe** opens **Unsubscribe Confirmation**: "Are you sure you want to unsubscribe? Please choose one of the options below." with **Unsubscribe from all SDSs for {email}**, **Unsubscribe from this SDS only**, or **Cancel**.

**Subscribe someone manually:** in a location, open an SDS's row menu → **Version Update Subscriptions** (Owner, Admin or Admin Light; SDS Distribution enabled; the SDS has a PDF). Enter **Email address** (several allowed: "Enter emails separated by commas (e.g. email@example.com, email2@example.com, ...)"), choose the language, click **Subscribe** → "You have been subscribed to version updates". Errors: "Email cannot be empty", "You have entered an invalid email address". The length of a manual subscription is not shown in the app.

Subscriptions created through the API last 365 days by default (add_subscription on Send SDS, or subscription_length_days on Subscribe).

## Unsubscribe page for email recipients

Recipients of SDS emails can unsubscribe through the link in the email (public page, title **Unsubscribe**, SDS Manager logo, no login):
1. The page lists "Below is a list of SDSs you are currently subscribed to. Select the SDSs you no longer wish to receive notifications for, then confirm your changes." Each line shows product name – supplier, with a checkbox; **Select all SDSs** ticks all.
2. Enter your email in **Email address**.
3. Click **Unsubscribe**. On success: "You have been unsubscribed from all versions" (the same message shows if no subscriptions remain).
Errors: "Email cannot be empty", "You have entered an invalid email address", "At least one SDS must be selected".

## End Customers (Portal)

Heading **End customers (portal users)**. "Companies that have been enrolled to your SDS distribution portal — either automatically when you call send-sds/subscribe-sds with a company_name, or via the bulk CSV import below."

### Customer list
- Search: "Search company, email, or external ID…" + **Search** (clear with the × icon). Count "{count} end customers". 20 per page ("Showing {from}–{to} of {total}").
- Each customer card: company name; "Primary: {email}"; country; "ext: {id}" (your external customer ID); chips for users ("1 user" / "N users"), purchases ("N purchases"), "Last login: {date}" and **Inactive** if deactivated; "Users: {emails}".
- Empty: "No end customers yet. Pass company_name in your send-sds calls or upload a CSV above to get started." Load error: "Failed to load end-customers" with **Retry**.

### Preview as customer
Click **Preview** ("Preview as this customer (opens the portal in a new window)"). The portal opens in a separate window showing exactly that customer's SDS portal; the snackbar says "Preview opened for {name}" (or "Preview unavailable"). The preview session lives only in that window and ends when you close it; it does not affect your own login. If nothing opens, allow pop-ups for the site.

### Manage users (set portal roles)
Click **Manage users** → **Manage users for {company}**: "Set each user's role. Admins can invite and manage other users in their portal." Table: **Email**, **Name**, **Status** (**Active**/**Disabled**), **Role** (**Viewer**/**Admin**). Changing a role asks **Confirm role change** — "Change role for {email} from {old} to {new}?" (with the warning "Heads up: this user is currently inactive. They won't be able to use admin privileges until you reactivate them." for inactive users) → **OK** → "Role updated." Errors: "Invalid role.", "User not found in this end-customer.", "Could not update the role. Please try again." Empty: "No users for this end-customer yet."

### Bulk import of sales history (CSV)
1. Optional: **Download sample CSV**.
2. Click or drag a file onto "Click to upload a CSV of sales history" (only .csv, max 10 MB).
3. A preview shows "{file} · {count} rows", row and column counts and the first 5 rows ("Review the first rows before importing." / "… and N more rows"). Click **Import** (or **Cancel**).
4. Status: "Uploading…", "Queued — waiting for worker…", "Importing…". "You can leave this page and come back — the import continues in the background." Large files can take several minutes.
5. Result: **Import succeeded** or **Import failed** (with "Import error: …"), counters "Imported successfully", "Skipped", "Failed", "End customers created", "End users created", "Purchases created", and "First few errors:". **Import another file** resets the panel.
If polling runs over about 10 minutes: "The import is still running. Check back later for the result." Other messages: "CSV file is too large (max 10 MB).", "Only .csv files are accepted.", "Could not read the CSV file. Please check the file format.", "Import job not found.", "Import failed".

## Sales-history CSV format (sample file)

Rules shown on screen: **Required:** company_name, email. **Strongly recommended:** purchased_at (so customers can filter their SDS list by "last X years"). Date formats accepted: YYYY-MM-DD, DD.MM.YYYY, DD/MM/YYYY, MM/DD/YYYY; aliases purchase_date, order_date, date. **Other optional:** sku, ean, upc, external_system_id, country, quantity, quantity_unit, order_reference. Generic emails (gmail, hotmail, etc.) get their own end-customer record per row; corporate emails are merged by company name.

The sample file has these columns in this order:

| Column | Meaning | Sample value |
|---|---|---|
| company_name | Buyer's company (required) | Acme Corp |
| email | Buyer's email — becomes a portal user (required) | alice@acme.com |
| external_system_id | Product ID from your ERP (identifies the product) | EXT-1001 |
| sku | Product SKU | SKU-001 |
| ean | EAN barcode | 5901234123457 |
| upc | UPC barcode | 012345678905 |
| quantity | Quantity bought | 2 |
| quantity_unit | Unit | L, pcs, kg |
| country | Two-letter country code | no, se, de, us |
| purchased_at | Purchase date | 2025-11-15 |
| order_reference | Your order number | ORD-1001 |

Each row needs at least one product code (sku, ean, upc or external_system_id) for the purchase to map to an SDS; the sample rows each fill one or more. A private buyer (e.g. "Joe Smith" with a gmail address) is also valid.

## Website Search (SDS search on your website)

Heading **Website SDS Search**: "Let your customers search and download safety data sheets directly from your website."

1. Under **Company Website**, enter **Website domain** without https:// (e.g. kompositthuset.no) and click **Save** → "Website saved successfully." (https:// and trailing slashes are stripped automatically.) Until a domain is saved: "Enter your company website above to see the embed instructions."
2. Under **Add SDS Search to Your Website** choose one option, copy it with the copy icon ("Copied to clipboard."):
   - **Direct link** — a URL to your SDS search page, for a menu item or button. **Open preview in new tab** to test it.
   - **Embed on your website (iframe)** — HTML to paste where the search should appear. The language follows your interface language; change lang= in the URL for another language.
   - **Inline JS Widget (no iframe)** — a snippet that renders inline (Shadow DOM) and resizes automatically; change data-lang for another language.

**Which SDSs appear?** "Only SDS stored in locations marked as searchable appear in your webshop search. By default all locations are included." To change it: Location management → edit the location → **Make SDS on this location searchable on webshop search**, or click the checkbox in the **Webshop** column of the location tree (Shift + click applies to all sub-locations). States: "Search enabled", "Search disabled", "Not set yet — customers can still search this location" (accounts with an eCommerce subscription), or "Not published — customers cannot search this location" (accounts with SDS Distribution settings but no eCommerce subscription). The Webshop column is hidden on mobile.

## SDS Library List (eCommerce view of your library)

Heading **SDS Library List** — a product-code-oriented list of every SDS in your library.
- Filters: **Search product / SKU / EAN** (Product name, SKU, EAN, or ID; press Enter), **Language**, a location filter, **No linked SKU**, **Clear filters**. Filters are kept in the page address so you can bookmark/share a filtered view.
- Count: "{count} SDSs in library" (or "… (filtered)").
- Columns: **Product name**, **Supplier**, **Location**, **Product code**, **EAN**, **SKU**, **Language**, **Country**. Click a row to open the SDS detail in a new tab. 20 per page. Empty: "No SDS found."
- **Download library** → **Excel (.xlsx)**, **CSV (.csv)** or **JSON (.json)**. It always exports the whole library (filters are not applied). The file is prepared in the background with an **Export status** window; the file can be fetched only once, so if the download breaks you must start a new export. Errors: "Failed to download the SDS library. Please try again.", "The export could not be generated. Please try again.", "The download was interrupted. Please try again.", "This export has expired. Please try again."

## The customer SDS Portal (for your customers)

**Who uses it:** your customers (end customers) — people at companies that bought products from you. They do not need an SDS Manager account or password. A portal account exists when you sent them an SDS with company_name, imported them via CSV, or a portal admin at their company invited them.

### Signing in (/portal or /portal/login)
1. Page **SDS Portal**: "Sign in to access the safety data sheets for products you have purchased."
2. Enter **Email address** → **Send login code** ("We'll email you a 6-digit code. No password needed."). Message: "If an account exists, a code was sent to your email".
3. "We sent a code to {email}. Check your inbox and enter it below." Enter **6-digit code** → **Sign in**. **Use a different email** goes back.
Errors: "Invalid or expired code", "Failed to request code". If the email has no portal account, no code arrives (the message is the same by design).

The header shows your supplier's (merchant's) name, "{company} · {email}", tabs **SDSs**, **Purchases**, **Users** (Users only for portal admins) and a **Sign out** icon.

### SDSs tab — **Your Safety Data Sheets**
"These SDSs cover products your company has purchased. They are resolved at view time so you always see the current revision."
- Summary: "Showing {count} SDSs from {purchases} purchases (all time / in the last N years)" and, when filtered, "{total} total purchases on file."
- Search: "Search by product name, supplier, or product code…" (also matches SKU, EAN, UPC, external ID).
- Time filter: **All time**, **Active in last 1 year**, **Active in last 2 years**, **Active in last 3 years**, **Active in last 5 years** (based on purchase dates).
- Each SDS card: product name, supplier · language · "Revised {date}"; purchases ("1 purchase:" / "N purchases:" "from … to …" or "on …", "N undated"); "Access valid until {date}" or "Access expired {date}" when access has an end date; up to 6 purchase chips (date · order reference · quantity unit); product-code chips (e.g. SKU: …); **Open PDF in new tab** icon.
- Errors: "This SDS is no longer available to your organisation.", "Could not open this PDF right now. Please try again.", "Please allow pop-ups for this site to view PDFs."
- Empty: "No SDSs are available yet. Once your company has a purchase recorded, the matching SDSs will appear here." / "No SDSs match your search."

**Download all SDSs (ZIP):** pick a time window (1–5 years) first ("Pick a time window (1–5 years) first." — the button is disabled for All time). A card shows "Preparing your ZIP…", "{done} files ready, {skipped} skipped", then "Your ZIP is ready" → **Download ZIP**. **Hide** closes the card. Limits/errors: "No SDSs in that time window.", "Too many SDSs (>500) — narrow the time window.", "ZIP export failed", "Something went wrong while creating the ZIP. Please try again.", "The export is taking longer than usual. You can return to it later.", "This download is no longer available.", "The ZIP is not ready yet. Please try again in a moment.", "Could not download the ZIP. Please try again."

### Purchases tab — **Your purchases**
"All recorded purchases that grant your company SDS access." Columns: **Purchased at**, **Order reference**, **SKU**, **EAN / UPC**, **External ID**, **Qty**, **Unit**, **Country**, **Source** (how the purchase was recorded). 50/100/200 rows per page (default 100). Empty: "No purchases on file yet."

### Users tab — **Portal users** (portal admins only)
"Invite, update, or deactivate users for your company portal." Non-admins see **Admins only** — "Only portal admins can manage users. Contact your administrator if you need access."
- Table: **Email**, **Name**, **Role** (**Admin**/**Viewer**), **Status** (**Active**/**Disabled**), **Last login**, **Created**, **Actions** (edit).
- **Invite user** → **Invite a new portal user**: **Email address** (required), **First name**, **Last name**, role (Viewer default, or Admin) → **Send invite**. "We'll email them a sign-in link. They use the same email with 'Request login code' to sign in." (the sign-in button is labelled **Send login code**). Success: "Invitation sent. An email has been sent to {email}." Errors: "Email is required.", "Please enter a valid email address.", "A user with this email already exists.", "Could not send invitation. Please try again."
- **Edit user** — change first/last name, role and Active/Disabled switch → **Save** → "User updated." You cannot change your own role ("You can't change your own role.") or deactivate yourself ("You can't deactivate your own account."). Error: "Could not update user. Please try again."

Portal roles: **Viewer** sees SDSs and purchases; **Admin** additionally manages the company's portal users. The supplier can also set roles from **End Customers (Portal) → Manage users**.

## SafetyCulture integration

For accounts with the SafetyCulture integration enabled, SDS Manager pushes SDS PDFs into folders in your SafetyCulture account, one SafetyCulture folder per SDS Manager location. A guide is linked from the app (SDS Manager FAQ: "SafetyCulture integration guide").

**Connect:** Administration → **Settings** → **Connect SafetyCulture**: "Enter your SafetyCulture API key. You can create it in the API Tokens section of your SafetyCulture settings." Paste it in **API Key** (eye icon shows/hides it). The Owner is also prompted on start-up with a **Connect SafetyCulture** popup when the key is missing, or when it has expired: "SafetyCulture API key has expired. Click here to generate new API key." → paste the new key → **Save** ("SafetyCulture API key updated successfully").

**Link locations to folders:** once an API key is saved, the add/edit location popup shows **SafetyCulture Folder**; choose the folder (searchable list with **Load more**). In edit, the sync icon next to the folder asks **Confirm Synchronization** — "Confirm to synchronize all SDSs from this location to the selected SafetyCulture folder?" → "Synced successfully" / "Synced failed". (To find a folder ID manually: it is the text after "documents/" in the folder's URL.)

**Sync everything:** the sync icon in the API Key field — "Synchronize all SDSs from your locations to the corresponding SafetyCulture folders" → "Synced successfully. This may take a few minutes."

**Label links in PDFs:** switch **Inject link to print secondary container labels to SDS PDF files**, then the button **Adds links to all PDF files** / **Removes links from all PDF files** asks "Do you want to update all PDFs in SafetyCulture to include (or remove) links for printing secondary container labels?" This bulk update can run once every 4 hours: "Synchronization is currently in progress. You may perform the next sync 4 hours after this one completes".

**Free trial and Free plan limit:** (the message names only the Free Trial plan, but the limit applies to accounts on a trial or on the Free plan) "With the Free Trial plan, you can sync up to 20 Safety Data Sheets (SDS) to SafetyCulture. Additional SDS can be added to your SDS Manager account, but they will not sync to SafetyCulture until a paid plan is activated." When exceeded, uploads to a linked location or a sync show **Warning: This Safety Data Sheet (SDS) could not be synced to your SafetyCulture account.** The Owner of a stand-alone account gets **Show upgrade options** (opens Subscription); others see "Contact the administrator to upgrade your subscription plan".

## MCP Server Access (connect an AI assistant)

In **Account settings**, the section **MCP Server Access**: "Connect your AI assistant (Claude, ChatGPT, Cursor, or any MCP-compatible client) to your SDS Manager account using the Model Context Protocol (MCP)." The app says your AI agent can search 16+ million SDSs in the global database (other screens say 18 million+; confirm the current figure with SDS Manager), add SDSs to your library from the database, PDF uploads or URLs, organise products by location, track hazardous substances and manage your SDS inventory through natural language.

How to connect:
1. If shown, confirm **Activate user access to the Chat AI Agent** (first time) or **Enable user access to the Chat AI Agent** with **OK**.
2. Add the MCP server URL shown in the panel (https://sds-mcp.sdsmanager.com/support/mcp) to your AI client with "Streamable HTTP" transport.
3. Copy the **API Key** with the copy icon ("Copy API key successfully") and use it to authenticate. Link: **Learn more about setting up the MCP server** (SDS Manager FAQ).

Owners/Admins control other users in **User management** with the row action **Activate / Enable / Disable user access to the Chat AI Agent**. Disabling is always allowed; enabling needs a paid plan that includes the feature (free trial → upgrade dialog "This feature is not available on your current trial plan", button **Show options**; paid plan without it → **Show upgrade options**; only the Owner of an account without a parent account gets the button).

The MCP key is separate from the eCommerce API key in Settings → Integrations.

## Live chat (Tidio)

A Tidio live-chat bubble appears on some pages (**Sites & Locations**, **Hazardous substances**, risk assessments, job procedures, and **Version Update Subscriptions**); the **Start chat** button in the onboarding "How can we help you?" panel opens it. (Single sign-on is covered in the topic **Login & Account Security, Users, Roles & Permissions, and Organization Settings**.)

## Rules, limits and edge cases

- SDS Distribution pages: Owner and Admin only, account must have SDS Distribution enabled; never Admin Light, Staff, Read only, No Access or QR-login users. Trying the URL otherwise redirects to the start page.
- API key: Owner only; one key shown; full key visible only once; regenerate/revoke break existing integrations immediately.
- A send needs at least one identifier (sku, ean, upc, external_system_id or sds_id) and at least one valid email; several emails comma-separated.
- One language per send; SKUs linked to SDSs in different languages need language; SKUs linked to SDSs for different countries need country (multi-country mode).
- Several SDSs with the same code, country and language are sent together as one email (kit). Archive obsolete duplicates.
- The same product is not emailed twice to the same address (duplicate protection).
- API-created subscriptions default to 365 days; End date shows expiry.
- Coverage gaps need target markets; country review and coverage gaps are hidden in single-country mode. Single-country option needs the account country set.
- Detection runs older than 30 minutes without finishing are treated as stale.
- Kit Verification limit options 50/200/500/1000; Coverage Gaps 100/200/500/1000 (both default 200).
- CSV import: .csv only, max 10 MB; company_name and email required; generic email domains create one end customer per row, corporate emails merge by company name.
- Website search shows only SDSs in searchable locations; with an eCommerce subscription, unset locations are searchable by default.
- SDS Library List download always contains the full library and can be fetched once per export.
- Portal sign-in: 6-digit emailed code, no password. Portal ZIP: needs a 1–5-year window, max 500 SDSs.
- Portal users cannot change their own role or deactivate themselves.
- Portal SDSs always show the current revision; an SDS no longer in the supplier's library becomes unavailable.
- SafetyCulture: a free trial or the Free plan syncs max 20 SDSs; PDF link bulk update once per 4 hours.
- Not specified in the application (confirm with SDS Manager): prices of eCommerce plans, how SDS Distribution or SafetyCulture gets enabled on an account, portal web address/branding beyond the supplier name, how long portal login codes stay valid, how "access valid until" dates are calculated, API rate limits.

## Messages and errors users may see

| Message (exact) | Where | What it means / what to do |
|---|---|---|
| API key generated successfully. Copy it now — it will not be shown again. | Integrations | Copy the key now. |
| No API key configured — generate one to start using the API | SDS Distribution | Owner must generate a key. |
| These API endpoints require an active eCommerce (SDS Distribution) subscription. … | Integrations | Inventory Pro/Enterprise key without eCommerce. |
| Setup saved / Failed to save | SDS Distribution | Single-country or digest setting result. |
| Target markets saved / Failed to save target markets | SDS Distribution | Selling-to list result. |
| Set your account country in account settings to enable the single-country shortcut. | SDS Distribution | Set company country first. |
| Country detection started / Country detection finished / Failed to run detection | Country Review | Detection status. |
| Saved with countries: … / Review reset / Failed to apply review | Country Review | Single review result. |
| Accepted {count} items / Bulk accept failed | Country Review | Bulk accept result. |
| Target markets are not set | Coverage Gaps | Set Selling to on SDS Distribution. |
| This product has already been sent to the specified email address. No additional email was sent. | API Error Logs | Duplicate prevented. |
| SKU not found (EAN/UPC/External system ID not found) | API Error Logs | Code not on any SDS in your library. |
| SDS is not in customer library | API Error Logs | Add that SDS to your library. |
| Missing required variables: {% SDS_INFO %} | Email Template Editor | Keep the SDS_INFO token in the message. |
| You have been subscribed to version updates | SDS row menu | Manual subscription saved. |
| No version update subscriptions found | Version Update Subscriptions | Nothing subscribed yet / no match. |
| You have been unsubscribed from all versions | Public unsubscribe page | Unsubscribe done. |
| At least one SDS must be selected | Public unsubscribe page | Tick at least one SDS or Select all. |
| CSV file is too large (max 10 MB). / Only .csv files are accepted. | End Customers | Fix the file. |
| The import is still running. Check back later for the result. | End Customers | Import continues in background. |
| Preview unavailable | End Customers | Preview could not start; try again. |
| Website saved successfully. | Website Search | Domain stored. |
| Failed to download the SDS library. Please try again. | SDS Library List | Export could not start. |
| If an account exists, a code was sent to your email | Portal login | Check inbox; no code = no portal account for that email. |
| Invalid or expired code | Portal login | Request a new code. |
| Pick a time window (1–5 years) first. | Portal | Choose 1–5 years before ZIP. |
| Too many SDSs (>500) — narrow the time window. | Portal | Use a shorter window. |
| This SDS is no longer available to your organisation. | Portal | The SDS was removed from the supplier's offering. |
| Admins only | Portal Users tab | Ask a portal admin. |
| A user with this email already exists. | Portal invite | That person already has access. |
| SafetyCulture API key has expired. | SafetyCulture | Create a new token in SafetyCulture and paste it. |
| Warning: This Safety Data Sheet (SDS) could not be synced to your SafetyCulture account. | SafetyCulture | Free Trial 20-SDS limit reached; upgrade. |
| Synchronization is currently in progress. You may perform the next sync 4 hours after this one completes | SafetyCulture | Wait 4 hours. |

## Frequently asked questions

Q: I am a chemical distributor. How can SDS Manager email SDSs to my customers automatically?
A: Use SDS Distribution. The Owner generates an API key in Settings → Integrations, and your ERP or webshop calls "Send SDS to Customer" with the product's SKU, EAN, UPC or external system ID plus the customer's email. SDS Manager finds the current SDS in your library and emails the PDF using your email template. The plan descriptions list ERP-triggered emailing under eCommerce Premium; confirm your plan with sales.

Q: Why can't I see the SDS Distribution menu?
A: It only appears when SDS Distribution (eCommerce) is enabled for your company and your role is Owner or Admin. Admin Light, Staff, Read only, No Access and QR-code users never see it. Contact SDS Manager to enable it.

Q: Do my customers get the new SDS when the supplier publishes a new revision?
A: Yes, if they are subscribed. Pass add_subscription: true in Send SDS (365-day subscription) or use Subscribe to SDS Updates. When a new version is published in your library, subscribers automatically receive the updated PDF. You can see and end subscriptions on Version Update Subscriptions.

Q: A product is a two-part kit. Will the customer get both SDSs?
A: Yes. If several SDSs share the same product code for the same country and language, all are attached to one email. Check Kit Verification to confirm each bundle is a real kit and archive obsolete duplicates.

Q: The API returned MULTIPLE_SDS_REQUIRES_COUNTRY. What should I do?
A: That SKU is linked to SDSs tagged for different countries. Pass the country parameter in the request, or fix the country tags on SDS Country Review. If you sell to one country only, tick "I only sell to …" on the SDS Distribution page.

Q: What does MIXED_LANGUAGE_SDS_NOT_ALLOWED mean?
A: The SKU is linked to SDSs in more than one language and the request did not say which. Pass language (ISO 639-1, e.g. "en"). One send can only contain one language.

Q: How does SDS Manager know which country an SDS belongs to?
A: It detects it from the emergency phone number, the producer's country, and the SDS language when that language is only used in one country. Clear cases are accepted automatically; the rest appear on SDS Country Review, where you save the correct countries or accept all on a page.

Q: What is a coverage gap?
A: A product code for which you have an SDS for some of your target markets but not for another (country, language) combination you sell to — for example an English US SDS but no English Canadian SDS. Set your target markets on the SDS Distribution page, then fix gaps on Country Coverage Gaps.

Q: Where can I see whether an SDS email failed?
A: API Error Logs lists every failed request and fallback with the email, reason and time, and the SDS Distribution page shows the five most recent. Successfully sent emails, with their attachments, are on Sent Emails.

Q: Can I change the text of the emails my customers receive?
A: Yes. Sent Emails → Email Templates → Add Email Template. Choose language and type (Send SDS to Customer, SDS New Version Notification, Multiple SDS New Version Notification), write the subject and message, and keep the required {% SDS_INFO %} variable. {% PRODUCT_NAME %} can be used in the subject.

Q: How does a customer stop receiving SDS update emails?
A: They click the unsubscribe link in the email, tick the SDSs (or Select all SDSs), enter their email and click Unsubscribe. As the supplier you can also click Unsubscribe on Version Update Subscriptions and choose this SDS only or all SDSs for that email.

Q: What is the SDS Portal and who uses it?
A: It is a self-service page for your customers' staff. They sign in with their email and a 6-digit emailed code (no password) and see the SDSs for the products their company bought, always the current revision, plus their purchase history. They can download a ZIP of SDSs for the last 1–5 years.

Q: How do my customers get portal access?
A: Their company is enrolled when you call send-sds or subscribe-sds with company_name, or when you upload a sales-history CSV on End Customers (Portal). Portal admins at the customer can then invite colleagues on the Users tab, and you can set Admin/Viewer roles from Manage users.

Q: What columns does the end-customer CSV need?
A: company_name and email are required; purchased_at is strongly recommended. Optional: sku, ean, upc, external_system_id, country, quantity, quantity_unit, order_reference. Dates can be YYYY-MM-DD, DD.MM.YYYY, DD/MM/YYYY or MM/DD/YYYY. Max 10 MB, .csv only; use Download sample CSV for a template.

Q: Can I see what my customer sees in the portal?
A: Yes. On End Customers (Portal), click Preview next to the company. The portal opens in a separate window as that customer, without affecting your own login. Allow pop-ups if nothing opens.

Q: My customer did not receive a login code.
A: The portal always says "If an account exists, a code was sent to your email", so a missing email usually means that address has no portal account. Check End Customers (Portal) for the company and its users, or ask a portal admin to invite them. Also check spam folders.

Q: How do I put an SDS search on my webshop?
A: Open Website Search, save your website domain (without https://), then copy the Direct link, the iframe code or the Inline JS Widget snippet into your site. Only SDSs in locations marked searchable for webshop search are shown; control that in Location management.

Q: Can I export my whole SDS library with SKUs and hazard data?
A: Yes. On SDS Library List click Download library and choose Excel, CSV or JSON; the full library is exported in the background. Systems can also fetch it through the List SDS Library or Download SDS Library (file) API endpoints, using updated_after for incremental syncs.

Q: Does the eCommerce API give data for EU CLP Article 48 online advertising?
A: The app says the List SDS Library endpoint returns pictograms, signal word, H/P/EUH statements, UFI, PPE icons and Section 2 text, covering Article 48 requirements and the upcoming Article 48a distance-selling requirements (from 1 January 2028). Legal adequacy for your case should be confirmed by you.

Q: I have Inventory Manager Pro. Can I use the API?
A: The Owner of a Pro or Enterprise account can generate an API key in Settings → Integrations, but the app notes that the listed endpoints require an active eCommerce (SDS Distribution) subscription and that dedicated Inventory Manager endpoints are coming. Premium does not get the Integrations section.

Q: How do I connect Claude or ChatGPT to SDS Manager?
A: Use Account settings → MCP Server Access. Add the MCP server URL shown there to your AI client with "Streamable HTTP" transport and authenticate with the API key from that panel. It requires a paid plan that includes MCP access (not the free trial); other users need an Owner/Admin to enable the Chat AI Agent for them in User management.

Q: How do I connect SafetyCulture?
A: If the SafetyCulture integration is enabled on your account, go to Settings → Connect SafetyCulture, paste an API token created in SafetyCulture's API Tokens section, then pick a SafetyCulture Folder on each location and sync. On a free trial or the Free plan only 20 SDSs sync.

Q: Why does SafetyCulture say an SDS could not be synced?
A: On a free trial or the Free plan at most 20 SDSs sync to SafetyCulture; more can be added to SDS Manager but won't sync until a paid plan is active. The Owner can click Show upgrade options. If the message is about an expired key, create a new API token in SafetyCulture and paste it.

Q: Which payment methods are available for eCommerce plans?
A: For eCommerce plans the app offers only Pay by Invoice or PO. Prices are not shown in this documentation; ask SDS Manager sales.

## Related topics

- **SDS library: substances list, SDS details, stock, archive and export** — SDS library, locations and archiving (managing the SDSs that get distributed)
- **Adding, finding and importing SDS (getting SDS into the library)** — product list import (adding SKU, EAN, UPC and External System Id to SDSs)
- **Plans, Free Trial, Sign-up, Billing and Subscription** — eCommerce plans and checkout
- **Login & Account Security, Users, Roles & Permissions, and Organization Settings** — user management and roles (Owner, Admin, Chat AI Agent access), Account settings (MCP Server Access, company country), Single Sign-On (SSO)
- **Keeping SDS up to date: newer versions, SDS update requests to vendors, vendor inbox and SDS Quality** — how new SDS revisions reach your library
