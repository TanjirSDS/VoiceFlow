# Plans, Free Trial, Sign-up, Billing and Subscription

> Summary: SDS Manager is sold as a subscription. The price depends on the plan (Basic, Premium, Pro, or Enterprise for the SDS Inventory Manager, and eCommerce Basic/Premium/Pro for the eCommerce product) and on the size of the SDS package, meaning how many active Safety Data Sheets (SDS) the library may hold. New customers start on a free trial and can then buy a paid plan, stay on the limited Free plan, or let the trial expire. This section explains the plans, what each plan unlocks in the app, the free trial, sign-up, how to buy, upgrade, downgrade or stop renewal, how payment works (card, or invoice/PO), and the messages users see along the way. It is for account Owners (the only users who manage the subscription), and for anyone who hits an "upgrade" message. Prices are never stored in the app's text: they are loaded from the system for the customer's currency, so this document never quotes a price.

## Where to find it

| What | Where | Who sees it |
|---|---|---|
| Subscription page (title on screen: **Billing Page**) | Left sidebar → **Subscription**; also **Subscription** in the account menu in the header; URL path `/administration/subscription/` | The account **Owner**. The sidebar item is hidden for everyone else, the page needs the subscription-page permission, and it is not available in child (sub-)organizations that are managed by a parent organization or to QR-code users. |
| **Activate subscription** shortcut | Left sidebar → **Pending Tasks** → **Activate subscription** | Owner, during the trial only (not in child organizations) |
| **View Plans & Pricing** button and the **Start Subscription** step | Trial dashboard (the **Dashboard** while the account is on a trial) | Trial users |
| **Billing details** page (checkout form) | Opened from the Subscription page when you click **PURCHASE …**, **Change To …**, **Upgrade** or **Change**; URL path `/billing/` | Owner |
| Payment result page (**Payment Successful!**, **Payment Failed**, **Payment Processing**, **Change Scheduled**) | Shown automatically after a card payment or a scheduled change; URL path `/billing/result` | Owner |
| **Billing & Invoices** panel with **Manage Billing** button | Right-hand side of the Subscription page | Owner of a paid account that has a billing account linked |
| **Billing Information** (billing address, billing emails, VAT) | Subscription page (pencil icon) → **Organization profile** page | Owner / users who can open Organization profile |
| Account migration invitation | Link in an invitation email; URL path `/migration-invitation/...` | The person who was invited (no login needed) |

When a user who is not the Owner gets an upgrade popup, it shows "Contact the administrator to upgrade your subscription plan" instead of an upgrade button.

## Plan and permission requirements

- **Only the Owner can manage the subscription.** The **Subscription** menu item in the sidebar is shown only to the Owner, the page also requires the subscription-page permission, and the upgrade buttons inside upgrade popups appear only for the Owner. Admin, Admin Light, Admin with approval, Staff, Read only and No Access users cannot buy, change or stop renewal of the plan. The **Manage Billing** button (invoices and payment methods) is also Owner-only.
- **Child organizations** (an organization that belongs to a parent organization) cannot open the Subscription page: they are sent back to the start page. Their subscription is handled by the parent organization. Upgrade popups in a child organization show "Contact the administrator to upgrade your subscription plan" instead of an upgrade button.
- **Upgrade popups** ("This feature is not available on your current subscription plan.") are shown only to users whose role is allowed to see them; the button to go to the Subscription page appears only for the Owner.
- **Users who log in with a QR code** (employee access without a login) do not get the **Subscription** menu item.
- Which features each plan includes is decided by the SDS Manager system (each plan carries a list of permissions). The app reads that list; the section "Feature availability by plan" lists the rules that are visible in the app.

## Subscription plans at a glance

| Plan (on-screen name) | Product | Can you buy it on the Subscription page? | Notes |
|---|---|---|---|
| **Free** | SDS Inventory Manager | No purchase needed. The **Free** card is shown only to accounts on a trial or on the Free plan, with the button **Change to Free plan**. | Limited plan. The plan card says "Max 200 Safety Data Sheets". Employee access via QR code is not allowed on Free (see "The Free plan"). |
| **Basic** | SDS Inventory Manager | Yes | Entry paid plan. |
| **Premium** | SDS Inventory Manager | Yes | "All features from "Basic" +" more. |
| **Pro** | SDS Inventory Manager | Yes | "All features from "Premium" +" more. |
| **Enterprise** | SDS Inventory Manager | No (arranged with SDS Manager sales) | Shown as the current plan for Enterprise customers. Some features are Enterprise-only (see the feature table). |
| **eCommerce Basic** | SDS Manager eCommerce | Yes (for eCommerce accounts) | For distributors/sellers publishing SDS to their customers. |
| **eCommerce Premium** | SDS Manager eCommerce | Yes (for eCommerce accounts) | "All features from "Basic" +" more. |
| **eCommerce Pro** | SDS Manager eCommerce | Yes (for eCommerce accounts) | "All features from "Premium" +" more. |
| **eCommerce Free** | SDS Manager eCommerce | No | Free eCommerce tier; treated like the Free plan in some places (for example, the billing form starts with an empty company name). |
| **Demo Inv Mgr** | SDS Inventory Manager | No | Internal demonstration plan; not sold. |

- An SDS Inventory Manager account only sees the Free/Basic/Premium/Pro cards; an eCommerce account only sees the eCommerce Basic/Premium/Pro cards.
- The app also recognises the plan names **Standard** and **Small Enterprise**. They are not offered on the Subscription page, and the app does not describe what they include. Confirm details with SDS Manager sales.
- Every plan can be **Billed Monthly** or **Billed Annually** (see "How pricing works").

## What each plan includes (plan cards)

The Subscription page shows one card per plan, with the plan name, a short feature list, the price per month (`/mo`) and a button. The feature lists below are exactly what the cards say. They are marketing summaries, not a complete list. For the full comparison, the page links to **See a detailed comparison of the plans** (opens the pricing page on the SDS Manager website).

| Plan card | Features listed on the card |
|---|---|
| **Free** | Effortless Setup; Max 200 Safety Data Sheets; Generate your Electronic Safety Data Sheet Binder; Employee access |
| **Basic** | Mobile access for all users; GHS labels included; Upload your own SDS; Secondary container labelling (GHS) with QR Code |
| **Premium** | All features from "Basic" +; Access SDS library by scanning QR-code; Automatic alerts for new revisions; Organize SDS by location; Printing of SDS-binders |
| **Pro** | All features from "Premium" +; Risk assessment; Alert for hazardous substances; Reports and XLS export; Assistance in building your initial SDS inventory |
| **eCommerce Basic** | Suitable for B2C sales; Simple SDS database management; Quick drag-and-drop SDS import; Automatic replacement of outdated SDS versions; Website-embedded SDS search tool for customer access; Permanent SDS link for product pages - remains unchanged even when the SDS is updated to a new version. |
| **eCommerce Premium** | All features from "Basic" +; Optimized for B2B sales workflows; Automatically email SDSs triggered by your ERP system; Map product SKUs to the correct SDS files.; Customers are automatically subscribed to receive SDS updates; Auto-replacement of outdated SDSs and automatic emailing of the updated version to all affected customers; Dynamically display SDS links, hazard (H) and precautionary (P) statements, and GHS pictograms on your product pages; Add direct SDS links to sales orders and confirmations |
| **eCommerce Pro** | All features from "Premium" +; Optimized for B2B workflows with high frequency of SDS updates; Dedicated email address for SDS submissions from your suppliers; Automatic import of incoming SDS files; Employee access to your SDS library through QR code posters placed in your warehouse |

There is no plan card for Enterprise.

## How pricing works

- **Prices are not written in the app.** Every price, currency and discount is loaded from the SDS Manager system when the Subscription page opens, for the customer's billing country/currency. The knowledge base therefore cannot quote prices. For a price, open the Subscription page (Owner) or contact SDS Manager sales.
- **Pricing is based on the number of active SDS.** The pricing information popup (the (i) icon next to the SDS selector) says: "Our standard pricing is based solely on the number of active Safety Data Sheets (SDSs) in your library. SDSs you move to the archive are not counted as active. While there are no extra fees for number of locations, admin users, or employees, SDSs used at multiple locations are counted once per location. For organizations with many sites using the same SDSs, this can result in a disproportionately high cost. If this applies to you, please contact us for a customized quote tailored to your actual usage." The "contact us" link opens an email to sales@mail.sdsmanager.com.
- **SDS package sizes.** Under "Select how many Safety Data Sheets you need in your library" you pick a package: 100, 200, 400, 600, 800, 1,000, 1,500, 2,000, 4,000, 6,000, 8,000, 10,000, 20,000, 30,000, 40,000, 50,000 or 100,000 SDS. On a computer the sizes up to 2,000 are shown as buttons and the larger ones are in a "4,000 +" drop-down; on a phone the buttons go up to 800 and the rest are in a "1,000 +" drop-down.
- **Volume discount.** Larger packages get a lower price per additional SDS. The discount steps start at 600, 1,000, 2,000 and 10,000 SDS; the discount rates themselves come from the system.
- **Monthly vs annual billing.** Two buttons, **Billed Monthly** and **Billed Annually**, switch the prices on the cards (annual is selected by default). The card price is always shown per month (for example "…/mo"). On the cards, the monthly-billing price is calculated as 20% above the per-month equivalent of annual billing. The exact amount to pay is always recalculated by the system on the **Billing details** page and in the order summary before you pay.
- **Currency.** The currency sign comes from the system. Changing the billing country can change the price or currency (see "Billing details form").
- **VAT/tax.** When the billing country is Norway, the card-payment order summary shows **Subtotal**, **VAT (25%)** and **Total**. For other countries the summary shows a **Total** only. Other tax handling is not specified in the application; confirm with SDS Manager support.
- **Discounts on an existing subscription.** If an account has a negotiated discount, the current-plan panel shows **List-price of current active subscription**, **Discount** (with the percentage when it is a percentage discount) and **Price of current active subscription**. A warning may say "Note that your discount will not applied on plans below {number} SDS".
- **If prices cannot load**, the page shows: "We couldn't load the subscription prices, so plans can't be purchased or changed right now. Reload the page to try again, or contact support if the problem continues." The purchase buttons stay disabled until prices load.
- More than 100,000 SDS, multi-site pricing or custom terms: contact sales (the pricing popup offers a customized quote).

## How plan restrictions work in the app

SDS Manager limits features by plan in four ways:

1. **Plan permissions (most features).** Each plan comes with a list of features it includes. The list is set by SDS Manager in the system, not in the app's screens. When a user opens something their plan does not include, either the item is hidden, or it stays visible and clicking it opens the upgrade popup. For many features, users can still see menu items and buttons the plan lacks, so they know the feature exists.
2. **Built-in trial and Free rules.** Some features are switched off for any account on a trial or the Free plan, whatever plan the trial is for.
3. **Rules tied to plan names.** A few screens check the plan name directly. For example, the Exposure tab in job procedures is Enterprise-only.
4. **Usage limits.** These are the SDS package size and a few counted limits (see "Usage limits shown in the app").

**The upgrade popup ("feature not available").**
- Title: "This feature is not available on your current subscription plan." During a trial: "This feature is not available on your current trial plan."
- "Your current plan is {PLAN}" (trial: "Your current trial plan is {PLAN}").
- "You need to upgrade to {PLAN} plan to use this feature." (trial: "You need to change to {PLAN} plan to use this feature."). The plan named is the lowest plan whose feature list includes the feature. This line is left out if no plan can be named.
- For many features: "Click here to read more about this feature" (opens an SDS Manager FAQ article).
- Button for the Owner: **Show upgrade options** (trial: **Show options**). It opens the Subscription page, where the "Explore Different Plans" tip appears next to the trial plan name.
- Everyone else sees: "Contact the administrator to upgrade your subscription plan".
- Only users whose role is allowed to see upgrade popups get it; for others, the feature is simply hidden.

**Opening a page by link.** If someone opens a page their plan or role does not allow (for example from a bookmark), they are sent back to the dashboard. The upgrade popup may open on top. For a few pages (SDS Quality, PPE Approval, Disposal Classification, My job procedures, APB, Labelling compliance) they are sent back without a popup.

## Feature availability by plan

Use these tables to answer "Can I use X on my plan?". Where the app shows a hint about which plan includes a feature, it is quoted. For anything marked "set by plan permissions", the exact plan is named in the upgrade popup the user sees, and SDS Manager sales or support can confirm it.

### Features the app turns off on a trial or the Free plan

| Feature / screen (on-screen name) | Trial | Free plan | Paid plans | What a blocked user sees |
|---|---|---|---|---|
| **SDS Quality** (sidebar item, SDS quality checks, "SDS to check for quality" / "SDS Quality Issues" rows in the dashboard Review Queue, the quality section of Inspection readiness) | Not available | Not available | Available when the plan includes it; Premium has a limited number of checks (see "Usage limits") | Item is hidden. A direct link goes back to the dashboard. |
| Upgrading SDS to newer versions: **Upgrade all SDS to the latest version**, the switch **Automatically update SDS to new versions** on the SDS where newer version exists page, **Move to newer version** / **Upgrade to new version** | Not available | Not available | Paid plans whose features include SDS updates | Snackbar: "Upgrade to latest version is only available on Premium, Pro and Enterprise paid plans" |
| **SDS where newer version exists** list | First 5 rows only | First 5 rows only | Full list | Pagination is disabled, with the tooltip "Full list of Safety Data Sheets that has newer version are only available on Premium, Pro and Enterprise paid plans" |
| Vendor tools under **SDS Updates**: **Vendor Contacts**, **Request Updated SDS**, Sent requests, **Inbox (from vendors)**, **Unverified SDS** | Hidden | Hidden | Owner/Admin, if the plan includes SDS updates | Menu items not shown |
| **Send** in email preview popups (emails to vendors, distributor emails, and the email to a QR-login user) | Not available | Available | Available | Greyed-out **Send** button with tooltip "This function is not available in the free trial" |
| **Automatic SDS Translation** (QR poster setting "Automatic SDS Translation (Pro & Enterprise Plans)", and the **Translate** button on SDS sections) | Not available | Not available | Paid Pro/Enterprise accounts that have the translation service turned on | Snackbar "Autotranslation is only available on paid Pro/Enterprise plans" (or the upgrade popup on a paid plan without it). The Translate button is hidden on trial/Free. |
| **Chat AI Agent** / **MCP Server Access** (Account settings; "Enable user access to the Chat AI Agent" in User management) | Blocked unless SDS Manager has granted paid access | Set by plan permissions | Set by plan permissions | Upgrade popup. Turning access off is never blocked. |
| **Log presence of product**, **Mark product as discontinued** (row ⋮ menu) | May be greyed out | Set by plan permissions | Set by plan permissions | Menu item disabled, no message |
| SafetyCulture sync | Up to 20 SDS | Up to 20 SDS | No sync limit shown in the app | SafetyCulture warning popup (see "Usage limits") |
| "Our Promise" SDS-finding help | Shown as an offer | Shown as an offer | Included (text: "If you're on paid plan (Premium, Pro or Enterprise), we offer a personalized SDS-finding service — completely free of charge.") | When a global search finds no exact match, trial/Free users see "Our Promise: As a paying subscriber, you're guaranteed assistance - we'll locate the Safety Data Sheet for your product even if it's not yet in our database – at no extra cost." |
| Webinar invitation in the header ("Webinar: Join our weekly webinar to learn how to get started with SDS Manager") | Shown on the dashboard | Shown on the dashboard | Not shown | – |

Free-plan-only differences:
- Free accounts get a **Generate SDS Binder** button directly on the location page. Paid plans use the location ⋮ menu instead.
- The setup checklist leaves out location, QR poster and go-live steps on Free and adds a "Print SDS Binder file" step.
- The SDS file (ZIP) import page hides the folder-structure explanation and how-to video on Free.

### Features tied to specific plan names

| Feature / screen | Who gets it | Others see |
|---|---|---|
| **Integrations** (Settings → API key generation) | The Owner on Pro or Enterprise (including a Pro trial), or accounts with eCommerce settings turned on | Section not shown. Premium is excluded. |
| **Exposure** tab on a job procedure (and the full exposure registration form inside it) | Enterprise only | The tab is visible, but clicking it opens the upgrade popup and the tab does not open |
| **Exposures** (sidebar) | Enterprise (main sidebar); Premium and Pro (under **More**) | Not in the sidebar on Free or Basic. Clicking still needs the plan to include exposures. |
| **Substitutions** (sidebar) | Enterprise (main sidebar); Premium and Pro (under **More**) | Not in the sidebar on Free or Basic |
| **Job procedures** (sidebar; called "COSHH assessments" for UK accounts) | Pro and Enterprise with 5 or more SDS (main sidebar); Premium, and Pro/Enterprise with fewer than 5 SDS (under **More**) | Not in the sidebar on Free or Basic |
| **My job procedures** (sidebar) | Pro and Enterprise, for users with assigned procedures | Hidden |
| **Risk assessment** (sidebar) | Pro, Enterprise, and Premium with 5 or more SDS (main sidebar); Free, Basic and Premium with fewer than 5 SDS (under **More**) | Clicking still needs the plan to include risk assessment (upgrade popup otherwise) |
| **Reports** (sidebar: **Use & disposal**, **Export SDS library**, Classification and Labeling Report (GHS)) | Pro, Enterprise, and Premium with 5 or more SDS in use (main sidebar); Free, Basic and Premium below 5 (under **More**) | Clicking still needs the plan to include reports |
| **Sites & Locations** / **My locations** (sidebar) | Main sidebar on Premium and higher (multi-location accounts) | On Free and Basic it is under **More** |
| **Labelling compliance** (under **SDS compliance**) | Decided by the system from the user's role, the plan and the country. SDS Manager describes it as being for paid Pro or Enterprise plans in countries using CLP labelling. | Hidden, or the upgrade popup |
| **APB** (sidebar) | Danish organizations whose plan includes it, Owner/Admin | Hidden |
| SDS library setup questions | Free and Basic are only asked to name the library; other plans are also asked "Do you want to organize SDS by locations where chemicals are stored or used?" | – |

### Features controlled by plan permissions (upgrade popup)

For these features the system decides which plans include them. A user whose plan lacks the feature usually still sees the menu item or button and gets the upgrade popup on click; otherwise the item is hidden. Roles also apply, so a user with a limited role may not see the item at all. The "Plan card hint" column quotes the plan cards and on-screen notes.

| Feature area | Where users meet it (on-screen names) | Plan card hint |
|---|---|---|
| SDS updates and new revisions | **SDS where newer version exists**, **Manage SDS Updates**, the newer-version bell in the header, "A newer version of this SDS exist. Click here to move to new version", **Automatically update SDS to new versions** (Settings), dashboard "SDS with newer versions available" | Premium: "Automatic alerts for new revisions". On-screen messages name Premium, Pro and Enterprise. |
| SDS tasks | **Pending Tasks**: Products Awaiting SDS, SDS requests, Pending my approval; header task icon | – |
| SDS compliance / hazardous substances | **SDS compliance** → **Hazardous substances**, **PPE Approval**, **Disposal Classification**, Settings → **Private restricted list**, ingredient check, dashboard PPE and disposal rows | Pro: "Alert for hazardous substances" |
| Risk assessment | **Risk assessment** menu, **Create risk evaluation**, open/edit risk evaluation, "Open chemical job instruction", "Risk must be evaluated" link, Settings → "AI functions on risk assessment" | Pro: "Risk assessment" |
| Job procedures | **Job procedures**, **My job procedures**, dashboard "Work Procedures" | – (see plan-name table) |
| Exposures | **Exposures**, **My Exposures**, "Register Exposure", Settings → Exposure | – (Exposure tab is Enterprise-only) |
| Substitutions | **Substitutions**, "Evaluate Substitution" | – |
| Reports and Excel export | **Reports**, **Export SDS library**, "Export to XLSX" (SDS Filter), "Export SDS information to Excel file" (location ⋮), Inspection readiness "Export SDS library (CSV)" | Pro: "Reports and XLS export" |
| Locations | **Sites & Locations** / **My locations**, **Add location**, "Edit location settings", "Move location to Archive", "Add new admin user" on a location | Premium: "Organize SDS by location" |
| Employee access with QR codes | **Employee Access**, **Manage QR codes**, "Manage QR code access", "Print QR poster", "Preview SDS library for this code", QR-login users | Premium: "Access SDS library by scanning QR-code". Free plan: QR access for employees is not allowed. |
| SDS binders | **Generate SDS Binder** (location ⋮) | Premium: "Printing of SDS-binders". Free: "Generate your Electronic Safety Data Sheet Binder". If the plan lacks it, the item is hidden rather than showing a popup. |
| Secondary container labels | **Print Label** | Basic: "Secondary container labelling (GHS) with QR Code" |
| Custom fields | **Personalized view**, "Create custom fields", "Modify custom field", "Custom Fields" filter | – |
| Adding SDS in bulk | **Import product list**, **Scan Paper Binder** / "Shoot pictures of labels of your chemicals", "Upload Product List" | – |
| SDS row actions (⋮ menu) | Safety information summary, Log presence of product, Open chemical instruction, Copy SDS, Move SDS, Replace with new SDS, Mark product as discontinued, Archive SDS, Edit SDS information, Add attachment, Hide from Non-admin, Find SDS for product | – |
| Administration pages | **User management**, **Invite members**, **Organization profile**, **Settings**, **Go live checklist**, **Archive**, **Import status**, **SDS Filter**, **Manage SDS Library**, **Global SDS Search** | Mostly role-based; the popup appears if the plan lacks the page |
| Two-factor authentication | Account settings → **Two Factor Authentication** (turning it on) | – |
| eCommerce SDS distribution | **SDS Distribution** pages (eCommerce accounts) | eCommerce plan cards |

The plan cards are summaries. When a customer asks whether a specific feature is in a specific plan and the table only says "set by plan permissions", the reliable sources are the upgrade popup (it names the plan needed), the detailed comparison on the pricing page, or SDS Manager sales.

## Usage limits shown in the app

| Limit | What the user sees | Where the number comes from |
|---|---|---|
| SDS package (all plans) | When an addition would exceed it: "You have reached the limit of Safety Data Sheets in your current subscription." / "Current plan is limited to {n} Safety Data Sheets" with **Show upgrade options** (Owner) or "Contact the administrator to upgrade your subscription plan" | System (the account's SDS allowance) |
| Approaching the SDS limit | A **Notice** after adding SDS: "You can now add one more SDS until you reach the SDS limit on your plan." / "You have now reached your SDS limit on your current plan. You must increase your plan size to add additional SDS to your SDS library." | System |
| ZIP upload larger than the remaining allowance | Trial: "This ZIP file contains {n} files. Please note that the Free Trial plan allows a maximum of {limit} SDS. To upload this entire ZIP file, please activate a paid plan". Paid: "This ZIP file contains {n} files. However, your current plan permits adding only {remaining} more SDSs to your library. Click here to view upgrade options." Both links open the Subscription page. | System |
| SDS usage on trial/Free | Subscription page: "{used} of {limit} SDS used" | System |
| Free plan size | Free card: "Max 200 Safety Data Sheets" | Text in the app; the enforced limit is the system's |
| SafetyCulture sync on trial/Free | "Warning: This Safety Data Sheet (SDS) could not be synced to your SafetyCulture account." / "With the Free Trial plan, you can sync up to 20 Safety Data Sheets (SDS) to SafetyCulture. Additional SDS can be added to your SDS Manager account, but they will not sync to SafetyCulture until a paid plan is activated." | The 20 is written in the app's text; when the limit is reached is decided by the system |
| SDS quality checks on Premium | "{used} of {limit} quality checks used on your Premium plan"; when used up: "Your Premium plan includes quality checks for up to 5 SDSs. Upgrade to Pro to run quality checks on all SDSs in your library. AI quality checks use advanced language models which carry token costs." | Counter from the system; the "5" is in the app's text |
| Newer-version list on trial/Free | First 5 rows only | Fixed in the app |
| Sidebar placement thresholds | Some menus move from **More** to the main sidebar at 5 SDS (see plan-name table) | Fixed in the app |
| Locations, users, admins, employees | No limit is stated in the app; standard pricing has "no extra fees for number of locations, admin users, or employees" | Not specified; confirm with sales |

## The free trial

**Length.** The app's on-screen text says the free trial gives "full access to SDS Manager for 30 days" (trial welcome wizard) and offers "or try for free for 30 days" on the plan cards. The trial length is stored per plan by the system, so an individual account can differ (SDS Manager staff can also extend a trial). The trial dashboard says: "Need more time to evaluate? Contact us and we'll happily extend your trial."

**What is included.** During a trial the account runs on a trial version of a chosen plan (Basic, Premium or Pro; or an eCommerce plan). It gets that plan's features, with some trial-specific restrictions listed in "Feature availability by plan". The SDS limit during a trial is set by the system (the plan's base allowance plus any extra package SDS Manager staff added). The Subscription page shows usage as "{used} of {limit} SDS used".

**Changing the trial plan.** While on a trial, the Owner can try a different plan without paying:
1. Open **Subscription**.
2. In **Your Current Plan**, click the plan name (it has a pencil icon), choose another plan from the list (Basic, Premium, Pro, or the eCommerce plans for eCommerce accounts), and it switches right away.
3. Or, on a plan card, under "or try for free for 30 days", click **Unlock {Plan} free trial now** (shown for plans above the current one) or **Start Free Trial** (shown for plans below the current one). The current trial plan's card shows "Current Free trial plan".
When the Owner arrives from an upgrade popup, a tip appears next to the plan name: "Explore Different Plans: While you're on your free trial, feel free to adjust your trial plan to best suit your needs right here." with a thumbs-up **Got it** button.

**Trial dashboard.** While the account is on a trial, the **Dashboard** is a trial version focused on setting up the library. It has a "You're on a free trial — if you get stuck, our team can help for free." note, search and add-SDS tabs, and guides. For the Owner it also has a **Setup Progress** tracker with six steps (Create Locations, Add Products, Find SDS for Products, Employee Access & QR Posters, Go Live, Start Subscription) and a **View Plans & Pricing** button that opens the Subscription page. Accounts on the Free plan (not a trial) see the normal dashboard instead. The step "Step 6: Start Your Subscription" explains: "Your free trial gives you full access for 30 days. When you're ready, choose a monthly or annual subscription to keep your library active. You can start monthly and switch to annual at any time. Need more time to evaluate? Contact us and we'll happily extend your trial." It also says there is no lock-in ("Should you choose to discontinue, simply inform us or cease payments.") and "Start with a smaller tier and increase later when needed — there's no saving by starting big. When you upgrade to a higher SDS tier, you only pay the pro-rated difference between the two plans for the remaining contract period." Other setup steps can be marked as done during the trial, but the **Start Subscription** step cannot be ticked by hand while on trial (tooltip: "Available after you start a paid subscription"); it completes when you actually subscribe.

**Trial welcome wizard (first login).** The first time a trial Owner opens the dashboard, a wizard says "Hi, {name}" / "Welcome to your free trial." / "You have full access to SDS Manager for 30 days…", lists highlights, and asks "What best describes your status of Safety Data Sheets in your organization?" with six options (paper-based SDS binder; SDS PDF files on a file share or SharePoint; XLS lists; another SDS management system; no overview of chemicals in use; don't know the status). **Continue →** saves the answer and tailors the setup steps; **Skip for now** hides the wizard for 7 days. The wizard is shown only to the Owner of a trial account, and not to accounts that signed up for label printing, accounts with the SafetyCulture integration turned on, or accounts that already answered the onboarding questions.

**When the trial ends.** When the trial period is over:
- The Owner is redirected to the Subscription page and sees the snackbar "Your subscription plan has expired". The current-plan panel shows "Trial period expired on {date}".
- The reset-trial popup opens (heading "Welcome back to" followed by the SDS Manager logo). It says "Your account expired {n} days ago" and "Start another 7 days trial for your team", with two choices:
  - **Reset trial** – starts another 7-day trial and returns to the start page.
  - **Downgrade to our FREE version** – moves the account to the Free plan. A link says "Read about our FREE plan here." (opens the SDS Manager FAQ).
- The Owner can also simply buy a plan with **PURCHASE {Plan}**.
- Other users (not the Owner) are logged out with the message "Subscription expired. Please contact the owner to extend."
- Employees using QR-code access are sent to a "service unavailable" page ("Your company does not have an active subscription for this service.").
- The Owner of a child organization (one managed by a parent organization) whose subscription has expired is sent to the same "service unavailable" page, because the subscription is handled by the parent organization.

**Before the end.** About 15 days before a subscription's end date, the Owner sees a one-time message: "Your subscription plan is about to expire".

## The Free plan

- The Free plan is chosen either with **Change to Free plan** on the **Free** card (visible during a trial or when already on Free) or with **Downgrade to our FREE version** after a trial expires.
- The Free card lists: Effortless Setup; Max 200 Safety Data Sheets; Generate your Electronic Safety Data Sheet Binder; Employee access. The 200 figure is the UI's description; the limit that is actually enforced is set by the system and is shown on the Subscription page as "{used} of {limit} SDS used".
- The older (classic) dashboard explains the Free plan like this: "Our FREE version is intended to be an efficient tool to help you manage your Safety Data Sheets and generate a digital SDS Binder file. The SDS Binder file should be made available for employees to comply with EHS regulations that require employees handling chemicals to have access to Safety Data Sheets. On our FREE plan you are not allowed to share online access to SDS Manager with your employees using our QR code feature or sharing login credentials."
- Free-plan accounts share most of the trial restrictions (see the feature table), but they see the normal dashboard, not the trial dashboard, and they can send emails from email previews. They can start a trial of a paid plan from the plan cards (**Unlock {Plan} free trial now**).
- For a Free-plan account, **Your Current Plan** shows the plan name, the SDS usage line, and the counts **SDSs in use**, **Unique SDSs in use** and **Archived SDSs**.

## Signing up for a new account

- The app no longer has its own stand-alone sign-up form: the old sign-up page and the separate sign-up wizard page have been retired. New trial accounts complete their setup inside the app through the **trial welcome wizard** on the trial dashboard (see "The free trial").
- How a brand-new account is first created (for example from the SDS Manager website) is not specified in the application; confirm with SDS Manager support/sales.
- When a new account is created, the system records the person's email, first name, last name, phone number, company, country, default language, the product (SDS Inventory Manager or eCommerce) and the starting plan.
- Accounts that signed up through the label-printing sign-up page go straight to **All my SDSs** instead of the trial dashboard while on trial.
- The account Owner is the only user who can manage the subscription (see "Plan and permission requirements").

## The Subscription page (Billing Page)

The page heading is **Billing Page**, with the intro "SDS Manager has subscription plans to meet a variety of budgets and needs. You can start with our free-plan to test our solution to see if it fits your needs."

What is on the page:

| Area | What it shows |
|---|---|
| **Your Current Plan** (at the top for trial/Free accounts, on the right for paid accounts) | Plan name; status lines (trial end date, price, subscription period, next billing date, renewal link); SDS usage; billing-cycle selector; SDS package selector |
| Plan chooser | "Select how many Safety Data Sheets you need in your library", the SDS package selector with an (i) pricing information icon, and the **Billed Monthly** / **Billed Annually** toggle. Shown to trial/Free accounts and to accounts on a self-service plan (Free, Basic, Premium, Pro, eCommerce Basic/Premium/Pro). |
| Plan cards | One card per plan with features, price per month and an action button |
| **See a detailed comparison of the plans** | Link to the pricing page on the SDS Manager website |
| **Billing & Invoices** | "View invoices, update payment methods, and download receipts." and a **Manage Billing** button (Owner of a paid account with a billing account) |
| **Billing Information** | Company name, contact name, billing email (or the Owner's email if none), billing country, with a pencil icon that opens **Organization profile** (paid accounts) |
| Incomplete payment banner | "You have one incomplete payment for the {plan} plan. Please review and complete your payment to continue enjoying our services." with **Review**, **Cancel**, **Later** |

**Your Current Plan – status lines** (only the relevant ones appear):

| Situation | Text shown |
|---|---|
| No plan | No active subscription |
| On a trial | Trial period until {date} |
| Trial ended | Trial period expired on {date} |
| Paid plan that starts in the future | Price of current active subscription: {price}; Paid subscription starts on {date}; You have free access until {date} |
| Paid plan expired | Subscription expired on {date}; Price of the last active subscription: {price} |
| Active paid plan | Price of current active subscription: {price} (plus list price and discount rows if a discount applies); For period from {start} to {end}; Next billing date: {date} with **Stop renewal** or **Reactivate renewal** |
| A plan change is already ordered for the next period | **Next subscription plan** (click to expand): "{plan} Subscription SDS Inventory Manager", "For period from … to …", "Number of SDS: {n}", "Order at {date, time}" |

For paid accounts the panel also shows **SDSs in use**, **Unique SDSs in use** and **Archived SDSs**, each with an (i) icon that opens the pricing explanation.

**Plan card buttons:**

| Account situation | Button on a plan card |
|---|---|
| Trial, Free, expired, or no plan | **PURCHASE {Plan}** (goes to Billing details). Below it, while the trial has not expired: "or try for free for 30 days" and **Unlock {Plan} free trial now** / **Start Free Trial**, or "Current Free trial plan" on the current trial plan |
| Free card (trial or Free accounts) | **Change to Free plan**, or "Current plan" if already on Free |
| Paid, same plan and same SDS package as selected | **Current plan** |
| Paid, different plan or different package selected | **Change To {n} x {Plan}** (goes to Billing details) |

The purchase/change buttons are disabled until prices have loaded and until the app has checked for unpaid orders.

## How to buy a subscription (step by step)

1. Log in as the **Owner** and open **Subscription** in the sidebar.
2. Under "Select how many Safety Data Sheets you need in your library", choose the SDS package size. Archived SDS do not count; an SDS used at several locations counts once per location.
3. Choose **Billed Monthly** or **Billed Annually**.
4. On the plan you want, click **PURCHASE {Plan}** (or **Change To {n} x {Plan}** if you already pay).
5. On **Billing details**, check or fill in the company name, billing contact and billing address (see "Billing details form"). You can still change the number of SDS in the footer; the footer shows the price for the chosen billing cycle.
6. Click **Review order**. The details you entered are saved to your organization.
7. In **Select Payment Method**, choose **Pay by Credit Card or Link** or **Pay by Invoice or PO** (see "Choosing a payment method").
8. Card: check the order summary, enter or pick a card, and click **Pay and subscribe**. You land on the result page ("Payment Successful!").
   Invoice/PO: check the order summary and click **Submit order**. You see "Thank you for your order! Our order department will promptly email you the invoice along with payment details."

## Billing details form

Page title **Billing details**, with a back button **Subscription**.

| Field | Required | Notes |
|---|---|---|
| Company name | Yes | Empty to start with for trial, Free and eCommerce Free accounts; otherwise filled with the organization name |
| **Billing contact** → First name | Yes | |
| Last name | Yes | |
| Billing email address (separate multiple recipients with a comma ',') | Yes | Several invoice recipients can be entered, separated by commas |
| **Billing address** → Country | Yes | Can be changed only on a trial or Free account. On a paid plan it is locked. Changing it opens a warning (see below) |
| Street | Yes | |
| Apt/Suite | No | |
| City | Yes | |
| State | No | |
| ZIP code/Postal code | Yes | Checked for a valid format |
| Tax ID or VAT ID | No | Up to 20 characters |

Footer: the plan name, an SDS count selector ("100 SDS" … "100000 SDS"), the price label (**Annual price** or **Monthly price**; **New annual price** or **New monthly price** when changing an existing subscription) with the amount calculated by the system, and **Review order**.

When an existing paid package is being changed, a line explains what is due now: "Amount due now for package change from {old} to {new} from today until {date}: {price} {currency}".

**Changing the country.** Picking a different country shows a **Warning**: "Changing your country may affect your subscription price or currency. Please review your plan and select it again to continue." **OK** saves the new billing country and takes you back to the Subscription page so you can choose the plan again (prices may now be in another currency). **Cancel** closes the warning without saving the new country.

**Validation messages:** "First name can not be empty", "Last name cannot be empty required", "Company name cannot be empty", "Email cannot be empty", "Invalid email address", "Street can not be empty", "City can not be empty", "ZIP/Postal can not be empty", "Invalid Zip/Postal".

If you open the Billing details page without choosing a plan first, you see "Please choose a subscription plan" and are sent back to the Subscription page.

## Choosing a payment method

After **Review order**, the **Select Payment Method** popup says: "Please select your preferred payment method. The option you choose for your first purchase will be set as your default for all future billing."

| Option | On-screen description |
|---|---|
| **Pay by Credit Card or Link** | "Pay instantly by credit or debit card, or Link. Charged now and on each renewal." |
| **Pay by Invoice or PO** | "We'll email an invoice your company can pay later by bank transfer (ACH/wire) or card. Choose this if you need a PO." |

Rules:
- **The first purchase sets the default.** Afterwards the other method is greyed out, with the tooltip "This payment method is unavailable because your default was established during your initial purchase. To request an update, please contact sales@mail.sdsmanager.com."
- **An unpaid invoice blocks card payment.** If an invoice order is already waiting for payment, card payment is greyed out: "Online payment is unavailable because an invoice order is already awaiting payment for this billing period. It becomes available once that invoice is settled or cancelled."
- **Switching to invoice cancels an unfinished card attempt.** If a card payment was started but not finished, the invoice option shows: "Continuing with invoice payment will cancel your unfinished card payment attempt."
- **eCommerce accounts** only see **Pay by Invoice or PO**; card payment is not offered.

## Paying by card

- The card checkout shows **Order summary** (or **Change order summary** when changing an existing plan), **Billed to** (company, address, country, billing email) and a table with **Description**, **Number of SDS** and **Amount**, then **Total** (Norway: **Subtotal**, **VAT (25%)**, **Total**). A discount row appears if a discount applies.
- For a new subscription the description reads "{Plan} Subscription SDS Inventory Manager" with the period. For a change, the summary shows a charge line "Remaining time on {n} × {plan} subscription SDS Inventory Manager after {date}" and a credit line "Unused time on {n} × {plan} subscription SDS Inventory Manager after {date}", so you pay only the pro-rated difference for the rest of the period.
- Express payment buttons may appear at the top, then "Or pay with card". If a card is saved, you can pick it (shown with card brand, last digits and expiry) or choose **Use a different card**. Below a new card there is a checkbox "Save card information for future purchases".
- Consent text: "By confirming your subscription, you allow SDS Inventory Manager to charge you for future payments in accordance with their terms. You can always cancel your subscription."
- Click **Pay and subscribe** (shows "Processing..." while working).
- If the card is declined, a box says "Card didn't go through? You can still start today. Choose Pay by Invoice or PO and we'll email an invoice your company can pay by bank transfer or card." with the button **Pay by Invoice or PO instead**, which turns the same order into an invoice order.
- **Buying during a trial.** If you pay while still on a trial, the paid period can start later than today. The result page then says "Your payment was successful! Your new subscription will start on {date}", and **Your Current Plan** shows "Paid subscription starts on {date}" and "You have free access until {date}".

## Paying by invoice or PO

- The review popup shows the same **Order summary** / **Billed to** / items / **Total** and two buttons: **Back** and **Submit order**.
- After **Submit order**: "Thank you for your order! Our order department will promptly email you the invoice along with payment details." Click **Close** to go back to the Subscription page.
- The invoice is emailed to the billing email address(es). The invoice can be paid by bank transfer (ACH/wire) or card, according to the on-screen description.
- If an order for this package has already been created and is not active yet, **Submit order** is disabled with the tooltip "You already own a subscription package that hasn't been activated yet."

## Upgrading, adding SDS, changing billing cycle or downgrading

All changes start on the Subscription page (Owner only) and go through Billing details and payment.

**Add SDS (bigger package) on the same plan**
1. In **Your Current Plan**, pick a bigger number in **SDS package**.
2. Click **Upgrade** (disabled while the selected size equals your current package).
3. Continue through Billing details and payment. You pay the pro-rated difference for the rest of the current period ("Amount due now for package change…").

**Change to a higher plan**: on the plan card click **Change To {n} x {Plan}** and pay. Upgrades and new subscriptions take effect immediately after payment.

**Change billing cycle**: in **Your Current Plan**, choose **Billed Monthly** or **Billed Annually** in the drop-down and click **Change** (disabled when the cycle is unchanged).

**Downgrade or billing-cycle change = scheduled change.** A downgrade or a change of billing period does not take effect right away. With card payment, a **Confirm subscription change** popup says: "Your current plan continues unchanged until {date}. On that date your subscription will change to: {plan} ({n} SDS). No payment is taken today — the new price will be billed on {date} using your existing payment method." Buttons: **Cancel** and **Confirm change**. After confirming, the result page shows **Change Scheduled**: "Your plan change is scheduled and will take effect on {date}. No payment is needed now — your current plan and card continue until then."

**Changing SDS quantity together with a cycle change or downgrade.** If you change the number of SDS and at the same time change the billing cycle or downgrade, a **Warning** appears: "Please note that when you change your billing cycle or downgrade your plan, any changes to the SDS quantity will take effect at the start of the next billing cycle. If you would like the SDS quantity change to take effect immediately, please first submit an order update for the revised SDS quantity. Once it has been processed, you may proceed with changing the billing cycle or downgrading your plan." Choose **Back** (return to the Subscription page) or **Continue**.

**Reducing the SDS package** (fewer SDS) is handled by the system as part of the order; whether it is immediate or scheduled is decided by the system and shown in the order summary.

## Incomplete payments

If a card payment was started but not completed, the Subscription page shows a yellow banner: "You have one incomplete payment for the {plan} plan. Please review and complete your payment to continue enjoying our services."

| Button | What it does |
|---|---|
| **Review** | Reopens the payment for that order so you can finish it (only shown when the payment can be resumed). If the card fails again you can choose **Pay by Invoice or PO instead**. |
| **Cancel** | Cancels the unpaid order so you can start again. |
| **Later** | Hides the banner for now. |

If you try to buy or change a plan while such an order exists, an **Incomplete Payment** popup shows the same message with **Review** and **Start a new plan** (cancels the unpaid order and continues to the plan you picked). If the period of that order has already been paid, cancelling is refused: "This subscription is already paid for the current period, so it was not cancelled."

## Payment results, receipts and invoices

**After a card payment (result page):**

| Result | Heading and text | Buttons |
|---|---|---|
| Success | **Payment Successful!** "Your subscription is now active." If the paid plan starts later: "Your payment was successful! Your new subscription will start on {date}" | **Back to subscription page**, **Go to Dashboard** |
| Processing | **Payment Processing** "Your payment is being processed. Please wait a moment." | – |
| Failed or cancelled | **Payment Failed** "Payment failed or was canceled. Please try again." | **Try Again** (back to Billing details) |
| Scheduled change | **Change Scheduled** (see "Upgrading…") | **Back to subscription page**, **Go to Dashboard** |
| Nothing found | "No subscription details found." | – |

On success the page shows **Subscription Details** (Plan, Status, Price, SDS Package Size, Start date, End date) and **Invoice Details** (Invoice Number, Status, Amount Paid, Paid At) with **View Online** and **Download PDF** for the invoice.

**Payment status page.** There is also a payment status page (title "Payment status") that shows **Payment completed**, **Payment failed** or **Payment pending**, with Transaction ID, Status, Plan, Billing method (**Billed annually** / **Billed monthly**), Number of SDS, Total, and **Back to Home**. Payment statuses map like this:

| Payment status | Shown as |
|---|---|
| Paid | Payment completed |
| Unpaid, Expired, Refunded, Failed | Payment failed |
| Pending, Processing | Payment pending |

**Invoices, receipts and payment methods later.** In the **Billing & Invoices** panel on the Subscription page, the Owner clicks **Manage Billing** to open the billing portal of the payment provider in a new tab: "View invoices, update payment methods, and download receipts." The panel only appears for an Owner whose organization has a billing account. Invoice-paying customers receive invoices by email at the billing email address(es).

## Renewal, cancellation and the end of a paid subscription

- **Automatic renewal.** A paid subscription renews at the **Next billing date** shown in **Your Current Plan**. Card subscriptions are "Charged now and on each renewal".
- **Stop renewal.** Next to **Next billing date**, the Owner clicks **Stop renewal** to stop the subscription from renewing. The link then changes to **Reactivate renewal**, which turns renewal back on. (The link is shown when no next-period plan change is already ordered.)
- **No lock-in.** The trial dashboard says: "SDS Manager offers a flexible subscription model, ensuring you're never bound by more than your current commitment. Should you choose to discontinue, simply inform us or cease payments. We guarantee complete freedom from contractual lock-ins."
- **Refunds** are not described in the application; confirm with SDS Manager support.
- **When a paid subscription expires**, the same rules as an expired trial apply: the Owner is sent to the Subscription page ("Your subscription plan has expired"), other users are logged out ("Subscription expired. Please contact the owner to extend."), and QR-code users see "Your company does not have an active subscription for this service." On an expired account the plan cards show **PURCHASE {Plan}** again, so the Owner renews by buying a plan; the **Upgrade** button in **Your Current Plan** is hidden while the subscription is expired.

## Billing information on the Organization profile

- The Subscription page's **Billing Information** pencil opens **Organization profile**, which has a **Billing Information** section.
- Paid accounts edit **Company name**, **Billing contact** (first name, last name, billing email address(es) separated by commas), and **Billing address** (country, street, Apt/Suite, city, state, ZIP code/Postal code, Tax ID or VAT ID).
- Trial and Free accounts see the billing address fields and a checkbox "Billing address is the same as organization country". Unticking it lets them choose a different billing country.
- On paid plans the billing country is locked (it affects VAT and cannot be re-pointed); contact SDS Manager support to change it.
- Invoices go to the billing email address(es); if none is set, the Owner's email is used.

## Add-on services (extension subscriptions)

Some services are add-ons that SDS Manager switches on for an organization separately from the plan.

| Add-on (on-screen name) | Where it appears | If not active |
|---|---|---|
| **IP Restriction** | **Set IP Restriction** in the Login QR Code popup (Owner only; others see a disabled button with "Contact owner"), and **IP restrictions** in the QR-login user menu in User management | A popup "This feature is not available on your current subscription plan." with a **Contact Us** button. It opens the contact/report form with the subject "Request for IP Restriction subscription". The page also says "Contact us about pricing for using such IP limitations." |
| **Automatic SDS Translation** | Settings → **Automatic SDS Translation** (a read-only switch), plus the per-QR-poster option "Automatic SDS Translation (Pro & Enterprise Plans)" | Settings text: "Contact SDS Manager to turn ON/OFF this feature:" (with the support email) and "We charge based on number of translated in-use SDS per year." It also needs a paid Pro/Enterprise plan; on trial: "Autotranslation is only available on paid Pro/Enterprise plans". |
| **Single Sign-On (SSO)** | Settings → Single sign-on and SSO options in user forms | Hidden (no popup). SSO is covered in the topic **Login & Account Security, Users, Roles & Permissions, and Organization Settings**. |

Prices for add-ons are not shown in the app; contact SDS Manager sales.

## Account migration invitations (moving a user from another account)

- When someone in your organization invites a user (for example from **User management** or **Invite members**) whose email is already registered under another SDS Manager account, the inviter sees: "This user is already registered under another account. A migration invitation has been sent — the recipient will be asked to confirm migrating to your organization."
- The invited person gets a link that opens the page "You've been invited to join {company}", showing **Invited by**, **Organization** and **Role**, and the warning: "By accepting this invitation, your current account under {current company} will be deactivated and you will be transferred to the new organization. If your current organization has no other users, it will be archived."
- **Accept Invitation** moves the person to the new organization and takes them to a page where they set a password. **Decline** shows "Invitation Declined – No changes were made to your account." with a link **Return to log in**.
- If the link is no longer valid: "Invitation Expired – This invitation has expired or is no longer valid. Please contact the person who invited you to request a new invitation."
- No login is needed to open the invitation page.

## Rules, limits and edge cases

- **Only the Owner** can buy, change, renew or stop renewal. Child organizations cannot manage their own subscription.
- **SDS limit.** Every plan has an SDS allowance (the package size you bought; on trial/Free, the limit set by the system). If an action would go over it, the system blocks it and shows "You have reached the limit of Safety Data Sheets in your current subscription. Current plan is limited to {n} Safety Data Sheets" with **Show upgrade options** (Owner) or "Contact the administrator to upgrade your subscription plan" (others). The number in this popup comes from the system, not from the app.
- **Archived SDS are free.** Only active SDS count toward the package; SDS moved to the archive are not counted. An SDS used at several locations counts once per location.
- **No fees per location, admin or employee** under standard pricing (pricing popup text). Limits on number of locations or users are not stated in the application; confirm with sales.
- **SafetyCulture on trial/Free.** With the SafetyCulture integration on a trial or Free account, only 20 SDS sync to SafetyCulture (this number is written in the app's message). More SDS can be added in SDS Manager but do not sync until a paid plan is active.
- **One payment method.** The first purchase fixes the payment method; changing it needs sales (sales@mail.sdsmanager.com).
- **One open order at a time.** An unpaid invoice blocks card payment for that period; an open card attempt blocks a new invoice. Identical orders are refused ("An identical order is already awaiting payment.").
- **Billing country is locked on paid plans**, both on Billing details and on Organization profile.
- **Downgrades and billing-cycle changes are scheduled** for the end of the current period; upgrades and package increases are immediate and pro-rated.
- **Purchase buttons are disabled** until prices load and until the unpaid-order check finishes.
- **eCommerce** accounts pay by invoice only.
- **Reset trial** is offered only after a trial has expired, and gives 7 more days (per the popup text).

## Messages and errors users may see

| Message (exact text) | Where | What it means / what to do |
|---|---|---|
| This feature is not available on your current subscription plan. | Upgrade popup | The plan does not include the feature. Owner: click **Show upgrade options**. Others: ask the Owner. |
| This feature is not available on your current trial plan. | Upgrade popup on trial | The trial plan lacks the feature. Owner: **Show options** to switch the trial plan or buy. |
| Your current plan is {plan} / Your current trial plan is {plan} | Upgrade popup | Shows the current plan. |
| You need to upgrade to {plan} plan to use this feature. / You need to change to {plan} plan to use this feature. | Upgrade popup | The lowest plan that includes the feature. |
| Click here to read more about this feature | Upgrade popup | Opens an FAQ article about the feature. |
| Contact the administrator to upgrade your subscription plan | Any upgrade popup | You are not the Owner (or are in a child organization). Ask the Owner. |
| You have reached the limit of Safety Data Sheets in your current subscription. Current plan is limited to {n} Safety Data Sheets | SDS limit popup | The SDS package is full. Owner: **Show upgrade options** → buy a bigger package, or archive unused SDS. |
| Warning: This Safety Data Sheet (SDS) could not be synced to your SafetyCulture account. With the Free Trial plan, you can sync up to 20 Safety Data Sheets (SDS) to SafetyCulture… | SafetyCulture sync | Trial/Free sync limit reached. Buy a paid plan. |
| Upgrade to latest version is only available on Premium, Pro and Enterprise paid plans | Snackbar in the SDS library | Upgrading SDS to newer versions is not available on a trial or the Free plan; the message names the paid plans that include it. |
| Your subscription plan is about to expire | Popup for the Owner | End date within about 15 days. Renew or check **Stop renewal** status. |
| Your subscription plan has expired | Snackbar | Owner is sent to the Subscription page to renew. |
| Subscription expired. Please contact the owner to extend. | Login | Non-Owner users are logged out until the Owner renews. |
| Your company does not have an active subscription for this service. | Service unavailable page | QR-code users or child organizations when the subscription has expired. |
| Your account expired {n} days ago / Start another 7 days trial for your team | Reset-trial popup ("Welcome back to") | Trial expired. **Reset trial** or **Downgrade to our FREE version**. |
| We couldn't load the subscription prices, so plans can't be purchased or changed right now… | Subscription page | Reload; contact support if it persists. |
| Please choose a subscription plan | Billing details | You opened checkout without choosing a plan. Choose on the Subscription page. |
| Changing your country may affect your subscription price or currency… | Billing details | Confirm to save the new country and choose the plan again. |
| Amount due now for package change from {a} to {b} from today until {date}: {price} {currency} | Billing details | Pro-rated amount for changing an existing package. |
| This payment method is unavailable because your default was established during your initial purchase… | Payment method popup | Payment method is fixed; contact sales to change it. |
| Online payment is unavailable because an invoice order is already awaiting payment for this billing period… | Payment method popup | Pay or cancel the open invoice first. |
| Continuing with invoice payment will cancel your unfinished card payment attempt. | Payment method popup | Expected; the old card attempt is cancelled. |
| Card didn't go through? You can still start today… | Card checkout | Use **Pay by Invoice or PO instead** or another card. |
| You already own a subscription package that hasn't been activated yet. | Checkout | An order for this package already exists and is not active yet; don't order it again. |
| We couldn't check whether you already have an unpaid subscription order, so the order was not started. Please try again. | Card checkout | Temporary problem; **Try again**. |
| Your order is still being processed. Do not start a new order — refresh in a moment to see its status. | Card checkout | Wait and refresh. |
| A previous subscription attempt is still being processed or could not be resolved automatically. Please review your subscription status or try again in a moment. | Card checkout | Check the incomplete-payment banner on the Subscription page. |
| A card payment attempt for this subscription is still in progress or could not be cancelled automatically. Please complete or cancel it, or try again in a few minutes. | Checkout | Finish or cancel the open card attempt. |
| An invoice order is already awaiting payment for this billing period. Online payment becomes available once it is settled or cancelled. | Checkout | Pay or cancel the invoice. |
| An identical order is already awaiting payment. | Checkout | Don't order twice; pay the existing order. |
| Another card payment attempt for this subscription is still open, so we cannot send an invoice yet. This usually clears within a day - please contact support if it does not. | Card-to-invoice switch | Wait or contact support. |
| Your subscription has a recent or scheduled plan change, so we cannot switch it to invoice payment right now. Your current plan stays active - please contact support to change it. | Card-to-invoice switch | Contact support. |
| We could not switch your card subscription to invoice payment, so no invoice was created and your current plan is unchanged. Please try again later, or contact support if this keeps happening. | Card-to-invoice switch | Retry later or contact support. |
| We could not check your card payment with our payment provider, so no invoice was created. Please try again in a few minutes. | Card-to-invoice switch | Retry in a few minutes. |
| We could not find the failed card payment… / This card payment has not failed or has already been handled… / This invoice order does not match the card payment that failed… | Card-to-invoice switch | Reload the page and try again. |
| This card payment does not belong to your organization, so no invoice was created. Please contact support. | Card-to-invoice switch | Contact support. |
| Payment failed or was canceled. Please try again. | Result page | Click **Try Again**. |
| Your payment is being processed. Please wait a moment. | Result page | Wait; check the Subscription page later. |
| This subscription is already paid for the current period, so it was not cancelled. | Cancelling an unpaid order | Nothing to cancel; the period is paid. |
| We couldn't cancel this pending subscription. Please try again, or contact support if the problem continues. | Cancelling an unpaid order | Retry or contact support. |
| No billing account is linked to your organization. / Billing is not configured. / Stripe customer not found. / The billing account has been deleted. / Billing portal configuration error. / Unable to reach the billing provider. Please try again later. | **Manage Billing** | The billing portal could not open. Contact SDS Manager support. |

## Frequently asked questions

Q: How much does SDS Manager cost?
A: Prices are not fixed in the app's text; they depend on the plan, the number of active SDS in your package, whether you pay monthly or annually, and your billing country/currency. The Owner can see live prices on the **Subscription** page by choosing a package size and billing cycle. For a quote, multi-site pricing or very large libraries, contact sales@mail.sdsmanager.com.

Q: What is the price based on? Do I pay per user or per location?
A: Standard pricing is based on the number of active Safety Data Sheets in your library. There are no extra fees for the number of locations, admin users or employees. Archived SDS are not counted, but an SDS used at several locations is counted once per location; organizations with many sites using the same SDS can ask sales for a customized quote.

Q: How long is the free trial?
A: The app says the free trial gives full access for 30 days. The exact trial length is set per account by SDS Manager, and the team can extend a trial if you need more time to evaluate. The current end date is shown on the Subscription page as "Trial period until {date}".

Q: What happens when my trial ends?
A: The Owner is taken to the Subscription page and offered three choices: buy a plan, **Reset trial** (another 7-day trial), or **Downgrade to our FREE version**. Other users are logged out with "Subscription expired. Please contact the owner to extend." until the Owner acts. Employees using QR-code access see that the company has no active subscription.

Q: Can I try a different plan during my trial?
A: Yes. On the Subscription page, click your plan name in **Your Current Plan** (pencil icon) and pick Basic, Premium or Pro, or click **Unlock {Plan} free trial now** on a plan card. The switch is immediate and free.

Q: What does the Free plan include?
A: The Free plan card lists Effortless Setup, Max 200 Safety Data Sheets, an electronic SDS binder and employee access. On the Free plan you are not allowed to share online access with employees through QR codes or shared logins. Many features are limited on Free (see "Feature availability by plan"), and the enforced SDS limit is shown on the Subscription page.

Q: Who can buy or change the subscription?
A: Only the account Owner. Other users who click an upgrade button see "Contact the administrator to upgrade your subscription plan". Child organizations are managed by their parent organization.

Q: Can I pay by invoice instead of card?
A: Yes. Choose **Pay by Invoice or PO** after **Review order**. An invoice is emailed to your billing email address(es) and can be paid by bank transfer (ACH/wire) or card. eCommerce accounts can only pay by invoice.

Q: I chose card the first time; can I switch to invoice later?
A: The payment method chosen on the first purchase becomes the default, and the other option is greyed out. To change it, contact sales@mail.sdsmanager.com. If a card is declined during checkout, you can still switch that order to **Pay by Invoice or PO instead**.

Q: How do I get more SDS in my package?
A: As Owner, open **Subscription**, choose a larger number in **SDS package** under **Your Current Plan** and click **Upgrade**, then complete checkout. You pay only the pro-rated difference for the rest of the current period, and the bigger package applies right away.

Q: Can I switch from monthly to annual billing?
A: Yes. In **Your Current Plan**, choose the other billing cycle and click **Change**. A change of billing period is scheduled for the end of your current period, with no payment taken now. If you also change the SDS quantity at the same time, that quantity change waits until the next cycle too, unless you submit the quantity change first.

Q: How do I downgrade my plan?
A: Pick the lower plan card (**Change To {n} x {Plan}**) and complete checkout. Downgrades are scheduled: your current plan continues until the end of the period, and the new price is billed then using your existing payment method. You will see "Change Scheduled" with the effective date.

Q: How do I cancel my subscription?
A: The Owner can click **Stop renewal** next to **Next billing date** on the Subscription page so the subscription does not renew; **Reactivate renewal** undoes this. The app describes the model as having no contractual lock-in ("simply inform us or cease payments"). Refunds are not described in the app; contact SDS Manager support.

Q: Where can I find my invoices and receipts?
A: Owners of a paid account click **Manage Billing** in the **Billing & Invoices** panel on the Subscription page to view invoices, update payment methods and download receipts. Right after a card payment, the result page also offers **View Online** and **Download PDF** for the invoice. Invoice customers receive invoices by email.

Q: Is VAT added?
A: For a billing country of Norway, the card checkout adds **VAT (25%)** to the subtotal. For other countries the app shows a single **Total**; any other tax treatment is not specified in the app. Enter your Tax ID or VAT ID on the Billing details form.

Q: Why can't I change the billing country?
A: On paid plans the billing country is locked because it affects VAT and pricing. It can be changed only during a trial or on the Free plan, and doing so may change the price or currency. Contact SDS Manager support to change it on a paid plan.

Q: I see "You have reached the limit of Safety Data Sheets in your current subscription". What now?
A: Your library is at the SDS package limit shown in the message. The Owner can click **Show upgrade options** to buy a bigger package, or you can archive SDS you no longer use, since archived SDS do not count. Non-Owners should contact the Owner.

Q: I see "You have one incomplete payment". What should I do?
A: A card payment was started but not finished. Click **Review** to complete it (or switch to invoice if the card fails), **Cancel** to cancel that order and start over, or **Later** to hide the message for now.

Q: My card was declined. Can I still start my subscription?
A: Yes. In the checkout, click **Pay by Invoice or PO instead**; the order is converted to an invoice that your company can pay by bank transfer or card. You can also try **Use a different card**.

Q: I got an email saying I've been invited to join another organization. What happens if I accept?
A: Accepting moves you to the new organization with the role shown on the invitation page; your current account in your old organization is deactivated, and if that organization has no other users it is archived. You then set a password. Declining changes nothing.

Q: Why does SafetyCulture only sync 20 SDS?
A: On a trial or the Free plan, the SafetyCulture integration syncs up to 20 SDS. You can keep adding SDS to SDS Manager, but they will sync to SafetyCulture only after a paid plan is activated.

Q: Why do I see "This feature is not available on your current subscription plan"?
A: Your organization's plan does not include that feature. The popup shows your current plan and, when possible, the plan you need ("You need to upgrade to {plan} plan to use this feature"). The Owner can click **Show upgrade options** to go to the Subscription page; other users see "Contact the administrator to upgrade your subscription plan" and should ask the Owner.

Q: Does the free trial include every feature?
A: A trial gives the features of the plan you are trialling (Basic, Premium or Pro), with some exceptions that are always off during a trial or on the Free plan. These are SDS Quality, upgrading SDS to newer versions, the vendor tools under SDS Updates, sending emails from email previews, automatic SDS translation, and the full list of SDS with newer versions. SafetyCulture sync is also limited to 20 SDS. You can switch the trial plan on the Subscription page to try a higher plan.

Q: Which plan includes risk assessment, reports and Excel export?
A: The Pro plan card lists "Risk assessment", "Alert for hazardous substances" and "Reports and XLS export". The exact plan needed for any feature is named in the upgrade popup, and the detailed comparison is on the pricing page linked from the Subscription page ("See a detailed comparison of the plans").

Q: Why can't I find Exposures, Substitutions or Job procedures in the menu?
A: These menu items depend on the plan, and on Free and Basic they are not shown in the sidebar at all. **Exposures** and **Substitutions** are in the main sidebar only on Enterprise; on Premium and Pro they are under **More**. **Job procedures** is in the main sidebar on Pro and Enterprise once the library has 5 or more SDS, and under **More** on Premium (or on Pro/Enterprise with fewer than 5 SDS). The Exposure tab inside a job procedure is Enterprise-only.

Q: Can I use the API / integrations?
A: The **Integrations** section in Settings (API key) is shown only to the Owner on the Pro or Enterprise plan, or on accounts with eCommerce settings turned on. Premium does not include it.

Q: Is automatic SDS translation included in my plan?
A: Automatic SDS Translation is marked "Pro & Enterprise Plans" and is not available on a trial or the Free plan. SDS Manager also has to turn it on for your organization, and it is charged "based on number of translated in-use SDS per year". Contact SDS Manager support to activate it.

Q: Can I buy the Enterprise plan online?
A: No. Enterprise is not offered as a plan card on the Subscription page; contact SDS Manager sales.

## Related topics

- **Login & Account Security, Users, Roles & Permissions, and Organization Settings** — who is the Owner, inviting users, SSO, Organization profile and Settings
- **SDS Distribution for suppliers (eCommerce / DirectSDS), the customer SDS portal, and integrations** — what eCommerce plans unlock in detail, SafetyCulture integration
- **SDS library: substances list, SDS details, stock, archive and export** — archive, SDS binders
- **Keeping SDS up to date: newer versions, SDS update requests to vendors, vendor inbox and SDS Quality** — upgrading to newer SDS versions
- **Locations, QR codes and employee access to SDS** — locations, QR codes and employee access
- **SDS Manager: product overview, navigation, Dashboard and getting started** — trial dashboard and setup checklist
