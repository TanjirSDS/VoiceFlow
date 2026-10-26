# SDS Manager: product overview, navigation, Dashboard and getting started

> Summary: SDS Manager is a web application (with companion mobile apps) for building and maintaining an organization's Safety Data Sheet (SDS) library and chemical inventory, and for giving employees instant access to those SDSs through QR-code posters, links and an offline app. Around the SDS library it offers compliance tools: SDS update tracking and vendor requests, restricted-substance checks, risk assessments, job procedures, exposures, substitutions, PPE approval, disposal classification, labels, reports and more. This topic explains what the product is, how the menus and pages are organized, what each Dashboard panel means, how a new (trial) customer gets started, and which help channels exist. It is the entry point for questions like "where do I find X?", "why can't I see menu item Y?" and "what does this Dashboard number mean?".

## Where to find it

- **Dashboard**: first item in the left menu (collapsed label "Dashboard"); on phones it is the first icon in the bottom navigation bar. URL path: `/dashboard`.
- **Left menu (sidebar)**: always on the left on desktop; on phones it opens from the menu (hamburger) button in the top bar or from **More** in the bottom bar.
- **More** menu: the "…" item near the bottom of the left menu opens a drawer with additional pages (imports, administration, settings, **Go live checklist**).
- **Profile menu**: click your avatar (top right) for **Manage account**, **Organization profile**, **User management**, **Subscription**, **Go live checklist**, **Language**, **Invite members**, **Import product lists**, **Settings** and **Logout**.
- **Inspection Readiness**: a panel on the Dashboard (United States customers only) that opens the full page at `/inspection-readiness`.
- **Go live checklist**: **More** menu or profile menu; URL path `/go-live-checklist`.
- **Accessibility statement**: **Accessibility** link in the page footer; URL path `/accessibility` (also works when signed out).
- **Mobile app download page**: `/download-app` (sends phones to the right app store).

## Plan and permission requirements

SDS Manager decides what you see from three things: your **role**, your organization's **subscription plan** (or trial), and your organization's **settings and data** (for example country, number of SDSs, whether multiple locations are used).

**Roles** shown in the app: **Owner** (the account owner), **Admin**, **Admin Light**, **Staff**, **Read only**, **No Access**. On individual locations there is also **Admin with approval** (all Admin permissions plus the right to approve SDSs, risk assessments and other approval-required content). Employees who open the library by scanning a QR poster use a special QR-code login (an employee/read-only view).

**Plans** referenced by the app: **Free**, **Basic**, **Premium**, **Pro**, **Enterprise**, plus a **free trial** of a plan. The app's own trial texts say a free trial gives "full access to SDS Manager for 30 days". Exact plan contents and prices are not specified in the application; see the topic **Plans, Free Trial, Sign-up, Billing and Subscription** or confirm with SDS Manager sales.

How the menu reacts:

| Situation | What happens |
|---|---|
| Your role does not allow a page | The menu item is hidden. If you type the page address, you are sent back to the start page. |
| Your plan does not include a page, but SDS Manager wants you to know it exists | The menu item is still shown; clicking it opens the upgrade popup "This feature is not available on your current subscription plan." (or "...on your current trial plan.") |
| Your subscription has expired | The left menu is hidden and you are redirected (see **Rules, limits and edge cases**). |
| You are an employee using a QR-code login | You get a reduced menu focused on reading SDSs (see **What employees with a QR-code login see**). |

Page-specific rules in this topic:

| Page / panel | Who can use it |
|---|---|
| Dashboard | Everyone except QR-code (employee) logins, who land on **All my SDSs** instead |
| Trial Setup Progress panel | Owner only, during a trial |
| Inspection Readiness | Owner and Admin, organization country United States, not QR logins |
| Go live checklist | All signed-in users except QR logins, if the account has Go-live checklist access |
| New features popup | Owner and Admin |

## What SDS Manager is and who it is for

**What it does (in the app's own words).** SDS Manager lets you "add new SDSs, update existing ones, and organize your chemical inventory" in an online SDS library, organized "by site, building, floor, department, or storage area". You can "search our database of 18 million+ Safety Data Sheets" (other screens say "16 million+"; the app uses both figures, so confirm the current number with SDS Manager) and add the right SDS to your library instantly, or build the library by scanning product barcodes, photographing a paper SDS binder, importing an Excel/CSV product list, uploading existing PDF files (individually or as a ZIP) or having SDS Manager migrate data from another SDS system.

**Problems it solves** (as described in the app):
- **Employee access to SDSs**: QR posters placed where chemicals are used give employees instant access "no app to download, no password, no training needed"; there are also intranet links, tablets/kiosks, an offline mobile app and a printable indexed PDF **SDS Binder**.
- **Keeping SDSs current**: the app flags "SDS where newer version exists" and helps you request updated SDSs from vendors ("Suppliers are legally required to provide updated SDSs upon request").
- **Compliance**: identifies SDSs containing substances on regulatory or restricted chemical lists; produces reports (REACH, GHS and more, per the trial welcome screen); for US customers maps your data against what an OSHA inspector typically asks for.
- **Risk and safe work**: chemical risk assessments (Risk Evaluation), job procedures / Job Hazard Analysis "according to OSHA REACH and COSHH", exposure registration, substitution of hazardous products, PPE approval and disposal classification.
- **Labels and translation**: "GHS compliant labels — generate with one click" and "Auto-translate safety info — SDS to employee language" (trial welcome screen).

**Who it is for**: organizations that use or store chemicals and their EHS/safety staff (Owners and Admins who build the library), local site or department administrators, employees on the shop floor who need to read SDSs, and suppliers/distributors who use the **SDS Distribution** module to send SDSs to their own customers.

**Product name**: always "SDS Manager" (never translated). The accessibility statement calls the web application "SDS Manager Inventory Manager".

## Module map

Each paragraph names the module as it appears on screen and points to the knowledge-base topic that covers it in depth.

- **SDS library (All my SDSs, Manage SDS Library, SDS Filter, Archive, Global SDS Search)**: your organization's collection of SDSs per location. **All my SDSs** is the employee-style reading view (the default view after a QR scan); **Manage SDS Library** is the admin workspace; **SDS Filter** offers "over 10 filters, including an ingredient search" across the whole library; **Archive** holds archived and deleted SDSs. See the topics **SDS library: substances list, SDS details, stock, archive and export** and **Adding, finding and importing SDS (getting SDS into the library)**.
- **Adding SDSs and Tasks (Pending Tasks)**: search the global database, scan barcodes, photograph binders, import product lists or SDS files, and work through **Products Awaiting SDS**, **SDS requests** and **Pending my approval**. See the topic **Adding, finding and importing SDS (getting SDS into the library)**.
- **Locations (Sites & Locations / My locations)**: the location hierarchy (site, building, floor, room, cabinet) and per-location administrators. See the topic **Locations, QR codes and employee access to SDS**.
- **Employee Access (QR codes)**: QR posters, intranet links, tablets/kiosks, offline app and SDS Binder; the info email to employees. See the topic **Locations, QR codes and employee access to SDS**.
- **Labels**: secondary-container and GHS labels, label layouts, and **Labelling compliance** (shown under **SDS compliance** for customers who have that check). See the topic **Labels, labelling compliance, kits and usage tracking**.
- **Risk assessment**: "Create detailed Chemical Instruction & Risk Evaluation documents". See the topic **Chemical risk assessment, PPE approval, disposal classification and substitution**.
- **Job procedures** (shown as **COSHH assessments** for UK customers and **7-point risk assessment** for Danish customers; called "work procedures" in some places): procedures employees can be assigned to and confirm they have read. See the topic **Job procedures (job hazard analysis, COSHH assessments, 7-point risk assessments) and chemical work instructions**. Danish customers may also have **APB** (Arbejdspladsbrugsanvisning, workplace chemical instructions; the Country setting tooltip spells it out as "Accident Prevention Book").
- **Exposures / My Exposures**: exposure registration (chemical, biological, mining, asbestos). See the topic **Exposure register, reports (incl. Tier II) and Danish APB**.
- **Substitutions**: record and track substitution of hazardous products with approved alternatives. See the topic **Chemical risk assessment, PPE approval, disposal classification and substitution**.
- **PPE Approval**: review PPE suggested from hazard and precautionary statements; approved PPE is shown to users. See the topic **Chemical risk assessment, PPE approval, disposal classification and substitution**.
- **Disposal Classification**: disposal categories derived from hazard codes and SDS disposal instructions (Hazardous waste, Environmentally hazardous, Special Disposal, Normal disposal). See the topic **Chemical risk assessment, PPE approval, disposal classification and substitution**.
- **SDS Updates and vendors**: **SDS where newer version exists**, **Vendor Contacts**, **Request Updated SDS**, **Sent Requests**, **Inbox (from vendors)**, **Unverified SDS**. See the topic **Keeping SDS up to date: newer versions, SDS update requests to vendors, vendor inbox and SDS Quality**.
- **SDS Quality**: an AI quality check of the SDSs in your library (missing H/P-codes, outdated emergency numbers, unreadable sections). See the topic **Keeping SDS up to date: newer versions, SDS update requests to vendors, vendor inbox and SDS Quality**.
- **SDS compliance**: SDSs with components on restricted substance lists (the **Hazardous substances** list). See the topic **SDS library: substances list, SDS details, stock, archive and export**.
- **Reports**: **Use & disposal**, **Export SDS library**, **Classification and Labeling Report (GHS)**. See the topic **Exposure register, reports (incl. Tier II) and Danish APB**.
- **Kit Management**: "A KIT is a product that consists of multiple components (e.g., Part A and Part B)". See the topic **Labels, labelling compliance, kits and usage tracking**.
- **SDS Distribution (eCommerce) and SDS Portal**: for suppliers who distribute SDSs to end customers, with a customer **SDS Portal** that uses email login codes. See the topic **SDS Distribution for suppliers (eCommerce / DirectSDS), the customer SDS portal, and integrations**.
- **Integrations**: SafetyCulture integration, single sign-on (SSO) and the mobile app. See the topic **SDS Distribution for suppliers (eCommerce / DirectSDS), the customer SDS portal, and integrations**; single sign-on is covered in the topic **Login & Account Security, Users, Roles & Permissions, and Organization Settings**, and the mobile app in the section "Mobile app and offline access" of this topic.
- **Administration**: **Organization profile**, **User management**, **Invite members**, **Subscription**, **Settings**. See the topics **Login & Account Security, Users, Roles & Permissions, and Organization Settings** and **Plans, Free Trial, Sign-up, Billing and Subscription**.

## The page layout at a glance

Every signed-in page has the same frame:

1. **Top bar (header)**: logo, scan-barcode button, task and message counters, notification bell, your avatar (profile menu). On **All my SDSs** pages it can also show the mobile-app download badges.
2. **Left menu (sidebar)**: the main navigation. It can be expanded (icons with full names) or collapsed (icons with short names underneath). The menu is a labelled navigation region for screen readers ("Main navigation").
3. **Main content**: the page you opened. A "Skip to main content" link is the first item for keyboard users.
4. **Footer**: **Privacy Policy**, **Terms and Conditions**, **Accessibility**. For QR-code (employee) logins it also shows the **Emergency agency** and **Phone**.
5. **Mobile bottom bar** (phones only, screen width up to 767 px): Dashboard, All my SDSs, Pending Tasks, Employee Access, More.

## Left menu: every item and who sees it

The main menu shows items in this order. "Collapsed label" is the short text under the icon when the menu is collapsed. Tooltips explaining items are shown to Owners and Admins only.

| Menu item (on screen) | Collapsed label | Opens | Who sees it |
|---|---|---|---|
| **Dashboard** | Dashboard | The Dashboard (trial or regular version) | Everyone except QR-code logins |
| **Pending Tasks** | Tasks | Submenu of task lists (see "Pending Tasks submenu"); badge = number of SDS tasks | Owner and Admin |
| **All my SDSs** | My SDS | Your SDS library reading view, with a location list underneath | Users without **Manage SDS Library** access (for example Staff, Read only, QR logins). Users with that access see it here only once 5 or more products are in use; otherwise it is in **More** |
| **Sites & Locations** (Owner/Admin) or **My locations** (other roles) | Locations | Location overview | Hidden on Free and Basic plans, and hidden when the organization uses a single list (no multiple locations and only one location). In those cases it is in **More** |
| **Manage SDS Library** | SDS Admin | Location tree plus admin sub-items (see "Manage SDS Library submenu"); badge = number of SDSs in your locations | Users with Manage SDS Library access (typically Owner and Admin) |
| **SDS Updates** | Updates | Submenu (see "SDS Updates submenu"); badge = SDSs with a newer version | Owner and Admin |
| **SDS Filter** | Filter | Advanced filtering of the whole library | Hidden for Staff, Read only and No Access |
| **SDS compliance** | Compliance | Hazardous substances list, or a submenu with **Hazardous substances** and **Labelling compliance** when the labelling check is enabled for the customer | Hidden for Staff, Read only and No Access |
| **PPE Approval** | PPE | PPE Suggestions Review | Owner and Admin |
| **Disposal Classification** | Disposal | Disposal categories page | Owner and Admin |
| **SDS Quality** | Quality | SDS quality check | Hidden for Staff, Read only, No Access and on trial or Free plan |
| **Employee Access** | QR Access | QR code management (posters, links, kiosks, offline app, binder) | Owner and Admin |
| **Substitutions** | Substitutions | Substitutions list | In the main menu on Enterprise; in **More** on Premium and Pro |
| **Risk assessment** | Risk | Risk assessments | Hidden for Read only and No Access. Main menu on Pro and Enterprise (and on Premium once the library has 5+ SDSs); in **More** on Free, Basic and Premium with fewer than 5 SDSs |
| **APB** | APB | APB management | Danish organizations only, Owner and Admin, when APB is enabled |
| **Job procedures** / **COSHH assessments** (UK) / **7-point risk assessment** (Denmark) | Procedures / COSHH / 7-pkt | Job procedures list | Hidden for Read only and No Access. Main menu on Pro and Enterprise once the library has 5+ SDSs; otherwise in **More** (Premium, or Pro/Enterprise with fewer than 5 SDSs) |
| **My job procedures** / **My COSHH assessments** / **My 7-point risk assessments** | My Proc. / My COSHH / Mine 7-pkt | Procedures assigned to you | Users who have access to their own procedures page (typically employees assigned to procedures), on Pro and Enterprise |
| **Exposures** | Exposures | Exposure registrations | Main menu on Enterprise; in **More** on Premium and Pro |
| **My Exposures** | My Exposures | Your own exposures | Users who have access to their own exposure page |
| **Reports** | Reports | Submenu (see "Reports submenu") | Not QR logins. Main menu on plans other than Free and Basic (on Premium once 5+ products are in use); otherwise in **More** |
| **SDS Distribution** | DirectSDS | eCommerce submenu (see "SDS Distribution (eCommerce) submenu") | Owner and Admin of organizations with eCommerce settings enabled |
| **SDS requests** | Requests | Opens the request form so an employee can ask for an SDS that is missing | QR-code logins only, when the organization allows employees to request SDSs and the QR user may create requests |
| **Global SDS Search** | Global Search | Search the global SDS database | QR-code logins (in the main menu); everyone else finds it in **More** |
| **More** | More | Opens the More drawer | Everyone except QR-code logins |
| **Admin** (bottom of menu) | Admin | Popup "Read-only account reminder" with a log-out option | QR-code logins only |

Notes:
- Every item also requires the underlying feature permission. If your plan lacks the feature, the item may still show and open the upgrade popup instead of the page.
- Counters (badges) show up to 99; larger numbers show as "99+".

## Pending Tasks submenu

**Pending Tasks** (Owner and Admin) groups everything waiting for action. On desktop, opening it jumps straight to the first list below that has items, unless you are already on one of them.

| Sub-item | What it is (tooltip text) | Shown when |
|---|---|---|
| **Products Awaiting SDS** | "SDS requests imported from XLS or added via barcode/picture that have not yet been matched with an existing SDS." | There are open SDS tasks or completed SDS requests |
| **SDS requests** | "SDS Requests created using the 'Add request for Safety Data Sheet' dialog, with or without a linked SDS." | Same as above |
| **Pending my approval** | "Tasks assigned to you that require your review or approval." | Same as above |
| **SDS Awaiting Approval** | "SDS files in the approval flow. Items here are visible only to configured approvers until every step is signed off." | At least one SDS is held for approval (even if the approval workflow was later switched off) |
| **Inbox (from vendors)** | Replies from your suppliers | Owner/Admin, not on trial or Free plan |
| **SDS where newer version exists** | SDSs with a newer supplier revision | Owner/Admin |
| **Activate subscription** | Opens the Subscription page | Owner during a trial (or with no plan), not for sub-accounts of a parent organization |

## Manage SDS Library submenu

Clicking **Manage SDS Library** opens your default location (or the library root) and expands a location tree. Below the tree are:

| Sub-item | Shown when |
|---|---|
| **Add location** | You have permission to add locations |
| **Import status** | Your organization has imported an SDS binder or ZIP file |
| **SDS Tasks** | There are open SDS tasks or completed requests |
| **Close match approval** | There are close matches waiting for approval |
| **Archive** | There are archived or deleted SDSs, or archived locations you may see |

## SDS Updates submenu

**SDS Updates** (Owner and Admin) contains **SDS where newer version exists**, **Vendor Contacts**, **Request Updated SDS**, **Sent Requests**, **Inbox (from vendors)** and **Unverified SDS**. The vendor items (all except the first) are hidden on trial and Free plans; **Unverified SDS** appears only when unverified SDSs exist. Opening the submenu refreshes the "newer version" count.

## Reports submenu

| Sub-item | What it does | Who |
|---|---|---|
| **Use & disposal** | Opens the use and disposal report page | Not QR logins; requires the report permission |
| **Export SDS library** | Prepares a CSV file of the whole library in the background and shows a progress popup until the file ("sds-library.csv") can be downloaded | Owner and Admin |
| **Classification and Labeling Report (GHS)** | Same background process, file "ghs-report.csv" | Owner and Admin |

If preparing an export fails, the message "Something went wrong." appears.

## SDS Distribution (eCommerce) submenu

Shown only to Owners and Admins of organizations with eCommerce settings enabled: **SDS Distribution**, **Version Update Subscriptions**, **Sent Emails**, **API Error Logs**, **SDS Country Review**, **Kit Verification**, **Country Coverage Gaps**, **End Customers (Portal)**, **Website Search**, **SDS Library List**. See the topic **SDS Distribution for suppliers (eCommerce / DirectSDS), the customer SDS portal, and integrations**.

## The More menu

**More** opens a drawer with grouped items (each group appears only if it has visible items). Many items here are "overflow" items that move to the main menu once your plan or library size qualifies.

| Group | Items (and conditions) |
|---|---|
| Library and modules | **All my SDSs** (while fewer than 5 products are in use), **Sites & Locations / My locations** (when not in the main menu), **SDS Updates** and **SDS Filter** and **SDS compliance** (extra shortcut while fewer than 2 products are in use), **Global SDS Search**, **Kit Management** (not Staff or QR logins), **Substitutions** (Premium, Pro), **Risk assessment** (Free, Basic, Premium under 5 SDSs), **Job procedures** (Premium; Pro/Enterprise under 5 SDSs), **Exposures** (Premium, Pro), **Reports** (Free, Basic, Premium under 5 products) |
| Adding SDSs | **Import ZIP Files**, **Import product list**, **Shoot pictures of labels of your chemicals** (Owner and Admin), **Import status** (after a binder/ZIP import), **Archive** |
| People and organization | **Organization profile** (Owner), **User management** (Owner, Admin), **Invite members** (Owner, Admin with user-creation permission) |
| Account | **Subscription** (Owner, not sub-accounts), **Settings** |
| Go live | **Go live checklist** |

Close the drawer with the X, by clicking outside it (desktop) or with the phone's back button.

## Expanding, collapsing and pinning the left menu

- **Expand / collapse** (desktop): the arrow at the bottom of the menu expands it (forward arrow) or collapses it (back arrow, shown when pinned).
- **Pin**: when the expanded menu is not pinned, a pin icon appears at the bottom; clicking it shows "Menu has been pinned" and keeps the menu open. When the menu is not pinned it collapses automatically after you choose a page.
- The pinned/unpinned choice is remembered per user in your browser.
- Clicking the logo in the top bar collapses an unpinned menu, or goes to the start page when the menu is pinned.
- On phones the menu opens as a full drawer from the menu button; the phone's back button closes it.

## Mobile navigation (bottom bar)

On phones (screen width up to 767 px) a bottom bar labelled "Quick navigation" offers:

| Button | Opens | Who |
|---|---|---|
| **Dashboard** | Dashboard | All except QR logins |
| **All my SDSs** | SDS library reading view | All except QR logins |
| **Pending Tasks** | Tasks page | Owner and Admin |
| **Employee Access** | QR code management | Owner and Admin |
| **More** | Opens the full left menu | All except QR logins |

QR-code (employee) logins do not get the bottom bar.

## Top bar icons and the profile menu

| Icon | Tooltip | What it does | Who sees it |
|---|---|---|---|
| Barcode scanner | "Scan barcode" | Opens the camera barcode scanner to find a product in your inventory | All users |
| Tasks counter | "Tasks: Product awaiting SDS, SDS Requests and Pending approval" | Opens the Tasks page | Users with access to Tasks, when the count is not zero (not No Access) |
| Envelope counter | "You have new message from vendor" | Opens **Inbox (from vendors)** | Users with access to Tasks, when there are new vendor messages |
| Bell counter | "SDS with newer version" | Opens **SDS where newer version exists** | Owner and Admin (not Staff, Read only, No Access), when the count is not zero |
| Avatar | — | Opens the profile menu | All users |

**Barcode scanner results**: one matching product in your inventory opens it for editing the amount; several matches show "Multiple matches found" so you can pick one; no match shows "Product not found" ("No substance in your inventory matches this barcode.") with **Search manually** (opens Global SDS Search with the barcode), **Register barcode to existing substance** and **Scan again**.

**Profile menu** (avatar) shows your name, organization and plan, then:

| Item | Shown when |
|---|---|
| **Set Password** (highlighted) | You still need to set a password (not for SSO-only users) |
| **Manage account** | Always (not QR logins) |
| **Organization profile** | Owner |
| **User management** | Owner and Admin |
| **Subscription** | Organization is not a sub-account of a parent organization, and you have subscription access |
| **Go live checklist** | Not QR logins |
| **Impersonate** / **Cancel impersonate** | Only for specially authorised accounts; not a customer feature |
| **Language** | A dropdown to change your interface language (not QR logins) |
| **Invite members** | Owner and Admin |
| **Import product lists** | Users with import permission |
| **Settings** | Not QR logins |
| **Logout** | Always |

**Mobile app badges**: on **All my SDSs** pages, when the organization has enabled offline app access, the top bar shows "Scan barcodes & Off-line access" with **App Store** and **Google Play** download buttons (see **Mobile app and offline access**).

## Footer

- **Privacy Policy** and **Terms and Conditions** open the SDS Manager website (localized where available) in a new tab.
- **Accessibility** opens the accessibility statement.
- For QR-code (employee) logins the footer also shows **Emergency agency** and **Phone** (a tap-to-call number). The values come from the organization's own emergency settings, or from the default for the organization's country; a dash is shown if none is set.
- The footer is hidden on login, sign-up and reset-password pages and on public SDS views.

## What employees with a QR-code login see

Employees who scan a QR poster get a read-focused view:
- They land on **All my SDSs** (the library for their location or assigned access). Opening the Dashboard address sends them to **All my SDSs**.
- The menu typically shows **All my SDSs** with the location list, **Global SDS Search** (if allowed), **SDS requests** (if the organization allows employees to request SDSs) and, at the bottom, **Admin**. **Admin** explains: "This is a read-only account. To perform administrative tasks, please log out (click here or top right corner) and sign in with an Admin account".
- No Dashboard, Reports, More menu or mobile bottom bar; the profile menu offers only **Logout**.
- The footer shows the emergency agency and phone number.

## Country-specific menu labels

- **United Kingdom** organizations see **COSHH assessments** and **My COSHH assessments** instead of **Job procedures** and **My job procedures**.
- **Danish** organizations see **7-point risk assessment** and **My 7-point risk assessments**, and may see **APB** (Arbejdspladsbrugsanvisning). The APB tooltip says Danish law requires a workplace chemical instruction for every hazardous chemical; each APB must be approved by a named user, is valid for 3 years and includes local notes.
- **United States** organizations see the **Inspection Readiness** panel and page.

## Which start page and which Dashboard you get

After you sign in, the start page sends you on:

| You are... | You land on |
|---|---|
| An employee with a QR-code login | **All my SDSs** |
| On a trial that started from the print-label sign-up offer | **All my SDSs** |
| Everyone else | **Dashboard** |

The **Dashboard** then picks the layout automatically:
- **Trial dashboard** while your organization is on a free trial (setup-focused: welcome, Setup Progress, add-SDS tabs).
- **Regular dashboard** for everyone else, including Free and paid plans (compliance-focused: health score, Review Queue, metrics).

Old bookmarks to the former onboarding address also open the Dashboard. Older dashboard layouts ("Dashboard (classic)" and the former getting-started page) still exist at legacy addresses but are not linked from the menu; the supported view is **Dashboard**.

## Regular Dashboard (paid and Free plans)

Panels appear top to bottom in this order. Most panels have an **×** that hides them (see **Hiding and restoring Dashboard panels**).

1. **Refresh** button (tooltip "Refresh dashboard data"): recalculates the dashboard figures and reloads review counts and the location structure.
2. **Hidden panels** strip (only if you hid something).
3. **Compliance Health Score**.
4. **Inspection Readiness** (US Owners/Admins).
5. **Review Queue**.
6. **Search & Import** section (only for users allowed to add SDSs).
7. **Key Metrics**.
8. **Disposal Categories** (Owner/Admin) and **Guides & Help** side by side.

While the figures are being computed the Key Metrics panel shows "This may take a moment. The page will update automatically when done." or "Update in progress. Please wait, this might take a while." Panels whose data failed to load show "Something went wrong." (or "Failed to load disposal statistics") with a **Retry** button.

### Compliance Health Score

A gauge with an overall percentage plus one bar per metric. Each metric appears only if it has data and its value is above 0%; the banner is hidden if no metric qualifies or while any input is still loading or has failed.

| Metric | Measures | Shown to / when | Click opens |
|---|---|---|---|
| **SDS Currency** | % of SDSs on the latest supplier revision | Owner/Admin with SDS update access | SDS where newer version exists |
| **Disposal Classification** | % of substances with a linked SDS that have a known disposal category (substances without an SDS are excluded) | Users with access to SDS compliance and disposal data | Disposal Classification |
| **SDS Quality** | % of checked SDSs that passed (passed + conditional pass) | Users with SDS Quality access, not on Free plan, when at least one SDS has been checked | SDS Quality |
| **PPE Review Progress** | % of PPE suggestions accepted or rejected | When PPE suggestions exist | PPE Approval |
| **Work Procedures** | % of job procedures approved (not draft) | Users with job procedure access, when procedures exist | Job procedures |
| **APB Approval Rate** | % of APBs approved | Danish organizations with APB | APB |

How the overall score is calculated: all "done" items divided by all items across the visible metrics (a weighted score, so a metric with 1,000 SDSs counts more than one with 30 procedures). A metric shows 100% only when it is truly complete (99.6% is shown as 99%). Colours: green at 80% or more, orange 50–79%, red below 50%. Each bar's tooltip explains the criteria, why it matters and how to improve.

### Inspection Readiness panel (United States)

For Owners and Admins of US organizations. Title **Inspection Readiness**, text "See your OSHA compliance snapshot and what an inspector would ask for", and a readiness percentage. Clicking anywhere opens the full Inspection Readiness page. The dashboard figure is a simplified preview and can differ from the score on the full page (for example, the written HazCom program is only scored on the full page).

### Review Queue

A single list of everything that needs a human. The header shows "{count} items need attention". Only rows with a count above zero appear; the panel disappears entirely when nothing is pending. Each row shows a count, a progress bar and a severity colour (red = high, orange = medium, grey = low); hover for an explanation, click to open the right page with a filter already applied.

| Row | Sub-text | Opens | Shown to |
|---|---|---|---|
| **SDS with newer versions available** | Upgrade to the latest supplier revision | SDS where newer version exists | Owner/Admin |
| **SDS to check for quality** | Run Gemini AI quality evaluation | SDS Quality | Owner/Admin, not trial/Free |
| **SDS Quality Issues** | "{checked} of {total} SDS checked" | SDS Quality, filtered to failed | Owner/Admin, not trial/Free |
| **PPE Suggestions** | Pending approval | PPE Approval | Owner/Admin |
| **Disposal Classification** | Needs human review | Disposal Classification | Owner/Admin |
| **Risk Assessments — Pending Review** | Revised, awaiting approval | Risk assessments filtered to revision drafts | Not Read only / No Access |
| **Risk Assessments — Draft** | Not yet submitted | Risk assessments filtered to drafts | Not Read only / No Access |
| **APB drafts pending approval** | Arbejdspladsbrugsanvisning review queue | APB | Danish organizations with APB |
| **Work Procedures** | "{approved} of {total} approved" | Job procedures filtered to drafts | Not Read only / No Access |
| **Products awaiting SDS** | Products we're actively sourcing an SDS for | Tasks > Products Awaiting SDS | Owner/Admin |
| **SDS requests** | Requests submitted — waiting for supplier response | Tasks > SDS requests | Owner/Admin |
| **Pending my approval** | SDS submissions assigned to you for review | Tasks > Pending my approval | Owner/Admin |

If your plan lacks the feature behind a row, clicking shows the upgrade popup.

### Search & Import section

Tabs for adding SDSs to your library (details in **Adding and importing SDSs**):

| Tab | Notes |
|---|---|
| **Search SDS Database** | Always present; default tab |
| **Scan Barcode** | Always present; scan with your phone (QR code to open the scanner on your phone) or with this device's camera |
| **Scan Paper Binder** | Photograph the first page of each paper SDS; requires the picture feature on your plan (otherwise upgrade popup) |
| **Import Product List** | Only for users allowed to import product lists; upgrade popup if the plan lacks it |
| **Import SDS Files** | Upload PDFs or a ZIP (folder structure becomes locations) |
| **Migrate from other system** | Only on the trial dashboard, for trial owners who said their SDSs are in another SDS system |

**Scan Paper Binder**, **Import Product List**, **Import SDS Files** and **Migrate from other system** can be hidden with their **×** ("Hide this tab from the bar. It's not deleted — you can bring it back any time from the three-dot menu (⋮) at the top right."). Restore them from the **⋮** menu. The last tab you used is remembered.

### Key Metrics

Four headline counts; click a card to open the related page.

| Card | Sub-text | Opens | Shown to |
|---|---|---|---|
| **Total SDS** | in library | All my SDSs | Everyone |
| **Locations** | departments | Sites & Locations / My locations | Everyone |
| **Active Users** | registered | User management | Owner/Admin |
| **QR Access** | shop floor users | Employee Access | Owner/Admin |

### Disposal Categories

For Owners and Admins. Shows "{classified} / {total} substances classified" and one bar per category: **D5 Hazardous waste**, **D3 Environmentally hazardous**, **D2 Special Disposal**, **D1 Normal disposal**, plus a **not yet computed** count if some substances are still unprocessed. Clicking a category opens Disposal Classification with that category expanded. The panel is hidden when no category has data.

### Guides & Help

Links: **Getting Started Guide** ("Step-by-step guide to building your first library", opens the help center), **Video Tutorials** ("Short video guides for every feature", opens a "Getting started with SDS Manager" window with tutorials and guides), **FAQ** ("Answers to the most common setup questions", opens the help center at faq.sdsmanager.com), **Release Notes** ("See what's new in SDS Manager"), and "Can't find what you need?" with a **Contact Us** button that opens the contact form.

## Trial Dashboard

Shown while the organization is on a free trial. Top to bottom:

1. **Hidden panels** strip.
2. **Talk to our experts** banner (trial Owners, not Free plan): "Discover how to set up SDS Manager for your organization" with **Book a Demo**, which opens a booking calendar ("Select a date and time"). Closing it with × hides it permanently for the organization.
3. **Welcome row**: "Hey {first name} 👋", "Follow the steps below to set up your SDS library." and "You're on a free trial — if you get stuck, our team can help for free." plus a **Need help?** button.
4. **Refresh** button.
5. **Setup Progress** (Owner only).
6. **Search & Import** tabs (always shown on trial; cannot be hidden).
7. **Review Queue**, only when there is real work pending (outdated SDSs, PPE, procedures, SDS tasks, approvals or risk drafts). SDS Quality and APB rows never appear on trial.
8. **How the different setup methods work**, **Intro Video** and **Guides & Help**.
9. On phones, a floating **Quick actions** button with **Search SDS** and **Scan Barcode**.

### Need help? dialog

Title "If you get stuck, we're here to help — free". Options:
- **We'll find the Safety Data Sheets for you**: "Send us your list of chemicals and we'll find the Safety Data Sheets for you. Email your spreadsheet to support@sdsmanager.com" (the **Our Promise** popup in search results uses product_list_import_support@mail.sdsmanager.com for the same service; confirm the preferred address with SDS Manager), or **Contact us about this** (opens the contact form pre-filled "Please find SDSs for my product list").
- **We'll visit your site in person**: an agent can visit and do a full chemical inventory (photograph every label, find the matching SDS); **Contact us about this**.
- **Book a free demo**: **Pick a time on our calendar**.

### Setup Progress (6 steps)

Shows "{completed} of 6 complete" and six step pills. Click a pill to open its detail; **✓ Mark done** / **↩ Undo done** records progress (saved to your account). The panel can be hidden with ×.

| Pill | Detail title | What it covers | Action button |
|---|---|---|---|
| 1 **Create Locations** | Step 1: Organise Your SDS Library | "Do you want to organise SDS by locations where chemicals are stored or used?" Yes (multiple sites or many chemicals) / No (a single list). Enter **SDS Library Name (typically your company name)** and, for Yes, a **Location Name (e.g. Site, Department, or Building)**. **Save & Continue** renames your organization/library and top location and marks step 1 done. "The name will show on QR posters you generate." | — |
| 2 **Add Products** | Step 2: Add Your Products | Methods: Scan product barcodes, Photograph your paper binder, Upload a spreadsheet, Upload existing SDS PDF files, Just exploring (search the database), Migrating from another SDS system | Method buttons |
| 3 **Find SDS for Products** | Step 3: Match SDS to Your Products | Work through products without a matched SDS; "{count} products are currently awaiting an SDS."; explains why not all SDSs are linked automatically | **View List →** (Tasks) |
| 4 **Employee Access & QR Posters** | Step 4: Set Up Employee Access with QR Posters | Three options: one poster for the whole organisation, one per site (recommended), several per site (not advised); **Preview Employee View**; invite team members | **Print QR Posters** (Employee Access) |
| 5 **Go Live** | Step 5: Let Your Employees Know | Send the info email so employees know to scan the QR poster; tip: send it to yourself first and forward it from your own email | **Preview & Edit Info Email** |
| 6 **Start Subscription** | Step 6: Start Your Subscription | Monthly or annual subscription; "No lock-in, no strings attached."; start with a smaller tier and upgrade later (pro-rated difference) | **View Plans & Pricing** (Subscription) |

Rules: step 6 cannot be marked done manually during the trial (tooltip "Available after you start a paid subscription"); it completes when you actually subscribe. Step 1 is marked done automatically when you save names. Only Owners and Admins can save step 1.

**Coverage tags**: if your welcome-wizard answer was "another SDS management system", "XLS files" or "PDF files", a coloured tag explains that a migration covers steps 1–3, a product-list import covers steps 1–2, or an SDS-file import covers steps 1–3 (hover on desktop, tap on phone).

### How the different setup methods work

A card with method descriptions, marked **Personalized** when you answered the welcome wizard; the method matching your answer is first and tagged **Recommended**: binder answer → **Photograph your paper binder**; PDF answer → **Upload your SDS files**; XLS answer → **Import your product list**; other system → **Migrate from your current system** (**Contact Us About Migration**); no overview / unknown / no answer → **Scan barcodes — match the SDS later**. Two cards always follow: **Scan a barcode → find the product → link the SDS** and **Why do I have to confirm each barcode match?**.

### Intro Video

"4 min intro" — **Watch: how to set up SDS Manager**, "A 4-minute walkthrough showing the fastest way to build your SDS library from scratch."

## Trial welcome wizard

The first time a trial Owner opens the Dashboard, a window "Welcome to your free trial." appears ("You have full access to SDS Manager for 30 days."). It lists highlights (18M+ SDS database (other screens say 16 million+; confirm the current figure with SDS Manager), mobile barcode scanning, compliance reports, employee QR access without login, auto-translate safety info, GHS labels) and asks "What best describes your status of Safety Data Sheets in your organization?":

- We use a paper-based SDS-binder
- We have our SDS-PDF files on a file share or SharePoint
- We have XLS lists of the chemicals we are using
- We are currently storing our SDS in another SDS management system
- I have no overview of chemicals in use
- I do not know about the status of our Safety Data Sheets

**Continue →** saves the answer to the organization and personalizes the dashboard (default add-SDS tab, recommended method, coverage tag; PDF and migration answers start with the binder tab hidden). **Skip for now** or **✕** closes it; it can reappear after 7 days if still unanswered. The wizard is not shown to organizations that started from the print-label offer or with the SafetyCulture integration, or when setup information was already provided.

## Hiding and restoring Dashboard panels

- Click **×** on a panel. Tooltip: "Hide this panel from your dashboard. It's not deleted — you can bring it back any time from the 'Hidden panels' bar at the top of the dashboard."
- The page scrolls to the top and the **Hidden panels:** strip briefly highlights. Click a panel name (with +) to restore it, or **Show all** (when two or more are hidden).
- Restorable panel names: Compliance Health Score, Inspection Readiness, Review Queue, Disposal Categories, Key Metrics, Guides & Help, Setup Progress, How Setup Methods Work, Intro Video, Weekly Webinar Banner.
- Hidden panels are remembered per user and organization in the browser you used; on another browser, or after you log out, they show again.

## Weekly webinar banner

The app contains a banner "Webinar: Join our weekly webinar to learn how to get started with SDS Manager" with **Reserve Your Seat Now**, intended for trial and Free-plan users on the Dashboard; it can be hidden like a panel. In the current version it may not be displayed. If a customer asks for the webinar, offer **Book a Demo** / **Contact Us** or the help center.

## New Features Just Released popup

After sign-in, Owners and Admins may see one or more announcements ("New Features Just Released" or a product announcement). With several, dots show progress and **Next** / **Done** step through them. Closing marks all of them as seen on your account so they do not return. For release-note announcements a message follows: "You can always revisit these updates anytime under the Release notes link on your Dashboard." Which announcements trial accounts see is decided by SDS Manager.

## Other notices after sign-in

- **SDS waiting for your approval** (Owner/Admin, approval workflow on): "There are {count} Safety Data Sheets pending approval. Review them so they can appear in the library." with **Review pending**. It is skipped when the new-features popup is showing, and after you close it, it only returns when the number grows noticeably.
- **Your subscription plan is about to expire**: shown once (per browser) to the Owner when the plan ends within 15 days.

## Inspection Readiness page (United States)

"A snapshot of what an OSHA inspector typically asks for — mapped against what you already track. Green = good, yellow = needs attention, red = action required, dash = not tracked in the system yet." Available to Owners and Admins of US organizations; others are sent to the start page.

**Overall Readiness**: each check scores 2 (good), 1 (needs attention) or 0 (failing); "not tracked" checks are excluded. Score = points earned ÷ maximum points. The summary reads "{n} checks evaluated — {good} passing, {warn} needs attention, {fail} failing".

| Section | Check | Status rule | Action |
|---|---|---|---|
| Hazard Communication (29 CFR 1910.1200) | **Chemical inventory list** | Good if the library has SDSs, else failing | **Export SDS library (CSV)** (Owner/Admin) |
| | **SDS accessibility for workers** | Good if QR poster users exist; needs attention if only regular user accounts; failing if none | **Manage QR access** |
| | **Written HazCom program** | Good if a document is uploaded, else failing | **Upload** / **Download** / **Replace** / **Remove** |
| | **Work procedure coverage** | 90%+ approved good, 60%+ attention, else failing; not tracked if no procedures | **Review procedures** |
| | **Secondary container labeling** | Always "not tracked" (label printing per location is not audited yet) | — |
| | **SDS currency** | 95%+ on latest good, 80%+ attention, else failing | **Upgrade SDS** |
| Personal Protective Equipment (29 CFR 1910.132) | **PPE hazard assessment** | 90%+ reviewed good, 60%+ attention | **Approve PPE** |
| Waste & Disposal (RCRA) | **Waste disposal classification** | 90%+ classified good, 60%+ attention (substances without an SDS excluded) | **Classify disposal** |
| SDS Quality (Internal) | **SDS quality (AI evaluation)** | Needs attention if never run; 90%+ passed good, 70%+ attention. Not shown on trial or Free plan | **Review quality** |

**Written HazCom program**: only the Owner can upload, replace or remove; accepted files are PDF, DOC, DOCX and ODT up to 10 MB. Once uploaded the row reads "Uploaded {file} on {date} by {name}." The page suggests asking an AI chat assistant to draft a program, then reviewing and uploading it.

**Export**: the page notes the CSV is "the #1 document an OSHA inspector asks for" and is "Available on Pro and Enterprise plans"; a one-click inspector package is described as "coming in a future release".

## Go live checklist

Page title "GO-live checklist." (from **More** or the profile menu). Links open in a new tab:

1. **Check** that your SDSs are on latest version (opens SDS where newer version exists).
2. **Check the QR code** (opens the employee view in a small window; shown only if your plan includes QR poster printing).
3. Add a link to your SDS library from your intranet.
4. **Start** your SDS Manager subscription (Owner only, not sub-accounts).
5. **Print QR code posters** and post them where chemicals are used.
6. **Send info email** to your employees.

It is a reference list; ticks are not saved.

## Naming your SDS library when adding the first SDS

If no SDS has been added yet and no library name exists, adding the first SDS from a search result opens a short setup: "Before we add the first SDS, Let's name your SDS library." You choose whether to organize by locations ("This is recommended if you manage chemicals across multiple sites...") and enter **SDS Library Name (typically your company name)** and optionally a location name. The same choice is step 1 of the trial Setup Progress.

## Mobile app and offline access

- The **SDS Manager** app is on the Apple App Store and Google Play.
- On **All my SDSs** pages the top bar shows "Scan barcodes & Off-line access" with download buttons when the organization has enabled offline app access. The tooltip says users can access SDSs offline after installing the app and scanning the QR poster or logging in; the app downloads the library for offline use; users can scan product barcodes; barcodes should be linked for the products you use ("Link barcode to Safety Data Sheet"); and anyone with access to your QR poster can download your library, so offline access can be disabled in settings.
- The public page `/download-app` shows "Redirecting to app store..." and sends iPhone/iPad users to the App Store and other devices to Google Play.

## Help and support channels in the app

| Channel | Where |
|---|---|
| **Guides & Help** panel | Dashboard: Getting Started Guide, Video Tutorials, FAQ, Release Notes, Contact Us |
| Help center | faq.sdsmanager.com (FAQ, guides, release notes) |
| **Contact Us** form | Guides & Help panel, Need help? dialog, migration tab; fields **Subject**, a message box ("Help us understand how we can help you?") and **Upload file**; on success "Message is sent" |
| **Need help?** dialog | Trial dashboard |
| **Talk to our experts** / **Book a Demo** | Trial dashboard (booking calendar) |
| Email | support@sdsmanager.com (shown in the trial help dialog and the accessibility statement) |
| Live chat | A chat bubble on selected pages: Sites & Locations, SDS compliance, Risk assessment, Job procedures and one SDS Distribution page |
| "Click here to read more about this feature" | Inside the upgrade popup, links to the help-center article for that feature |
| **Report Incorrect SDS Data** | Warning-triangle icon on an SDS's detail view: choose **Report an Incorrect SDS PDF File** or **Report Incorrectly Extracted Data**, describe the issue; success "Report submitted successfully". See the topic **SDS library: substances list, SDS details, stock, archive and export** |
| AI assistant for an SDS | An "Ask about {product}" icon on SDS rows in the library (English interface, SDS with a PDF). It warns "This AI may not be 100% accurate. Please verify critical information." See the topic **SDS library: substances list, SDS details, stock, archive and export** |
| Accessibility feedback | support@sdsmanager.com, per the accessibility statement |

## Supported languages

- The interface is available in **32 languages**: Chinese, Czech, Danish, Dutch, English, Estonian, Finnish, French, German, Greek, Hindi, Hungarian, Icelandic, Indonesian, Italian, Japanese, Korean, Latvian, Lithuanian, Maltese, Norwegian, Polish, Portuguese, Romanian, Russian, Slovak, Slovenian, Spanish, Swedish, Turkish, Ukrainian, Vietnamese.
- Eight more languages (Albanian, Arabic, Bosnian, Bulgarian, Croatian, Malay, Serbian, Thai) are known as **SDS document languages** (an SDS can be written in them) but are not interface languages.
- **Change your language**: avatar > **Language** dropdown. The choice is saved to your user profile and the app switches immediately. QR-code logins have no language selector in the profile menu; the setup texts note that QR codes can be created for different languages for multilingual workplaces (see the topic **Locations, QR codes and employee access to SDS**).
- **Which language a page uses**: a language in the page address (if supported) → your saved user language → your browser language (Norwegian Bokmål/Nynorsk map to Norwegian) → English. Untranslated text falls back to English.
- **Local terminology**: translations follow local regulatory wording, for example German "SDB" and "Gefahrstoffverzeichnis", French "FDS" and "Registre des FDS", Norwegian "Sikkerhetsdatablad" and "Stoffkartotek", Swedish "Kemikalieförteckning", Danish "Kemikaliefortegnelse". "SDS Manager" is never translated.

## Regions and countries

- **Regulatory regions** available in account settings and SDS search filters: EU, UK, US, CA, NZ, AU, BR, MY, CN, MX, ZA.
- **Countries**: organization and user profiles use a country list (including entries such as "European Union", "Catalonia" and "Galicia").
- Country affects, among other things: the default emergency agency and phone shown to employees, the Inspection Readiness page (United States), APB and 7-point labels (Denmark) and COSHH labels (United Kingdom). See the topic **Login & Account Security, Users, Roles & Permissions, and Organization Settings**.

## Rules, limits and edge cases

- **Unknown addresses** redirect to the start page (there is no "page not found" screen).
- **Pages you are not allowed to open** redirect to the start page; if your plan lacks the feature, the upgrade popup appears.
- **Menu items that move**: several items live in **More** until your library has 5 products/SDSs or your plan qualifies, then move to the main menu. **SDS Updates**, **SDS Filter** and **SDS compliance** are always in the main menu for the roles that may use them; while fewer than 2 products are in use they also appear in **More** as an extra shortcut (see "Left menu: every item and who sees it" and "The More menu").
- **Expired subscription**: the left menu is hidden and "Your subscription plan has expired" appears. Owners are taken to **Subscription**; other users see "Subscription expired. Please contact the owner to extend." and are signed out after about 5 seconds; QR-code logins and Owners of sub-accounts see the **Service unavailable** page.
- **Hidden panels, hidden Search & Import tabs and the last-used tab** are remembered in your browser until you log out. The **pinned menu** choice is remembered per user in the browser and survives logging out.
- The trial **Talk to our experts** banner, once closed, is hidden for the whole organization.
- **Inspection Readiness** is US-only; other organizations are redirected.
- **Health score** and **Inspection Readiness** never show a score from partial data; they wait or hide when an input fails.
- **Badges** cap at "99+".
- **Plans and prices** are not specified in the application; confirm with SDS Manager support/sales.

## Messages and errors users may see

| Message (exact text) | Meaning | What to do |
|---|---|---|
| This feature is not available on your current subscription plan. / ...on your current trial plan. | Your plan does not include this feature | Owner: **Show upgrade options** / **Show options**. Others: "Contact the administrator to upgrade your subscription plan" |
| You need to upgrade to {plan} plan to use this feature. | The lowest plan that includes it | Upgrade or contact sales |
| Menu has been pinned | You pinned the menu | Click the back arrow to unpin |
| Something went wrong. | A panel or export failed | Click **Retry** or try again later |
| Failed to load disposal statistics | Disposal Categories panel failed | **Retry** |
| This may take a moment. The page will update automatically when done. | Dashboard figures are being calculated | Wait |
| Update in progress. Please wait, this might take a while. | Figures are still being prepared | Wait, then use **Refresh** |
| Available after you start a paid subscription | Step 6 of Setup Progress is locked during trial | Subscribe |
| Library name cannot be empty / Location name cannot be empty | Step 1 fields missing | Fill in the names |
| Failed to save changes. Please try again. | Step 1 save failed | Try again |
| Only PDF, DOC, DOCX, and ODT files are accepted. / File too large. Maximum size is 10 MB. | Invalid HazCom upload | Use an accepted file under 10 MB |
| HazCom program uploaded. / HazCom program removed. | Upload/removal succeeded | — |
| Please describe the problem | Contact form sent without subject or message | Fill in both |
| Message is sent | Contact form delivered | Wait for a reply |
| Your subscription plan is about to expire | Ends within 15 days (Owner) | Renew on **Subscription** |
| Your subscription plan has expired | Plan has ended | Owner renews on **Subscription** |
| Subscription expired. Please contact the owner to extend. | Non-owner user of an expired account | Contact the account Owner |
| Service unavailable — Your company does not have an active subscription for this service. For further information, please contact {owner email}. | Expired account (QR login or sub-account) | Contact the email shown; "Return to log in page." |
| No Internet connection / No internet connection, please turn on your internet connection and reload page | You are offline | Reconnect and reload |
| You're back online. Please reload the page to get the latest updates. | Connection restored | Click **RELOAD** |
| A new version is available | SDS Manager was updated while you were working | Click **Update** |
| Oops! Something went wrong. Cannot reach the server. Please try again later. | Server unreachable | Try again later |
| Server currently under maintenance, please try again later | No response from server | Try again later |
| Request timed out | The server took too long | Try again |
| Too many requests. Please try again later. / Too many attempts. Try again in {time} | Rate limit reached | Wait and retry |
| Our system is currently experiencing high demand. Please try again in a few moments. | Temporary overload | Retry shortly |
| Oh no, there seems to be a problem, we're working on it... | Unexpected loading error | Reload; contact support if it persists |

## Frequently asked questions

Q: What is SDS Manager?
A: SDS Manager is an online system for building and maintaining your organization's Safety Data Sheet library and chemical inventory, organized by location. You can find SDSs in a database of 18 million+ sheets (other screens say 16 million+; confirm the current figure with SDS Manager), give employees access through QR posters, links or an offline app, keep SDSs up to date, and use compliance tools such as risk assessments, job procedures, PPE approval, disposal classification and reports.

Q: Why does my menu look different from my colleague's?
A: The menu depends on your role (Owner, Admin, Admin Light, Staff, Read only, No Access or QR-code login), your organization's plan or trial, your country and how many SDSs are in the library. For example, PPE Approval and Employee Access are only for Owners and Admins, and some items sit in **More** until the library has 5 SDSs.

Q: I can't find Risk assessment / Job procedures / Exposures / Substitutions in the menu. Where are they?
A: Check **More** (the "…" item). On lower plans or small libraries these items are listed there instead of the main menu. If the item opens "This feature is not available on your current subscription plan.", your plan does not include it; the Owner can choose **Show upgrade options**.

Q: What does the Compliance Health Score mean?
A: It is a weighted percentage across metrics such as SDS Currency, Disposal Classification, SDS Quality, PPE Review Progress, Work Procedures and APB Approval Rate. Each metric appears only when it has data and is above 0%. Green means 80% or more, orange 50–79%, red below 50%. Hover a bar for the criteria and tips, and click it to open the page where you can improve it.

Q: Why don't I see the Compliance Health Score or the Review Queue?
A: The health score is hidden when no metric has data yet, while data is loading, or if an input failed. The Review Queue disappears when nothing needs attention. Either may also have been hidden with ×; restore it from the **Hidden panels** bar at the top of the Dashboard.

Q: I hid a Dashboard panel by mistake. How do I get it back?
A: At the top of the Dashboard, the **Hidden panels:** bar lists every hidden panel. Click the panel name (with +) to restore it, or **Show all**. Hidden panels are remembered in the browser you used, so another browser shows all panels.

Q: Why is my Dashboard different from the one in the demo?
A: Trial accounts get a setup-focused Dashboard (welcome, Setup Progress with 6 steps, add-SDS tabs, setup methods and intro video). Free and paid accounts get the compliance Dashboard (health score, Review Queue, Key Metrics, Disposal Categories). The layout switches automatically when the trial ends or you subscribe.

Q: How do I mark a setup step as done during my trial?
A: On the trial Dashboard, click a step pill in **Setup Progress** and then **✓ Mark done** (use **↩ Undo done** to reverse). Step 1 is marked done automatically when you save your library and location names. Step 6, **Start Subscription**, cannot be ticked manually; it completes when you start a paid subscription.

Q: What is Inspection Readiness and why can't I see it?
A: It is an OSHA-aligned checklist for United States organizations showing what an inspector typically asks for (chemical inventory, worker access to SDSs, written HazCom program, procedures, SDS currency, PPE, disposal and SDS quality), with an overall score. It is only available to Owners and Admins of organizations whose country is the United States.

Q: How long is the free trial and what happens when it ends?
A: The app's trial texts say a free trial gives full access for 30 days and that you can contact SDS Manager to extend it. When a subscription expires, the Owner is taken to the Subscription page and other users are signed out with "Subscription expired. Please contact the owner to extend." Prices and plan contents are not specified in the application; confirm with SDS Manager sales.

Q: How do employees access SDSs without an account?
A: Owners and Admins print QR posters from **Employee Access**. Employees scan the poster with their phone and land on **All my SDSs** for their location, with no app, password or training needed. Employees can also use intranet links, a tablet/kiosk, the offline app or a printed SDS Binder.

Q: How do I change the language of SDS Manager?
A: Click your avatar (top right) and choose a language in the **Language** dropdown. It is saved to your profile and the interface switches immediately. The interface supports 32 languages; untranslated text shows in English.

Q: Which languages are supported?
A: Chinese, Czech, Danish, Dutch, English, Estonian, Finnish, French, German, Greek, Hindi, Hungarian, Icelandic, Indonesian, Italian, Japanese, Korean, Latvian, Lithuanian, Maltese, Norwegian, Polish, Portuguese, Romanian, Russian, Slovak, Slovenian, Spanish, Swedish, Turkish, Ukrainian and Vietnamese. Albanian, Arabic, Bosnian, Bulgarian, Croatian, Malay, Serbian and Thai are recognized as SDS document languages but are not interface languages.

Q: How do I contact SDS Manager support?
A: Use **Contact Us** in the **Guides & Help** panel on the Dashboard (subject, message, optional file), email support@sdsmanager.com, use the help center at faq.sdsmanager.com, or use the live chat bubble on pages such as Sites & Locations, SDS compliance, Risk assessment and Job procedures. Trial users also have **Need help?** and **Book a Demo** on their Dashboard.

Q: Can SDS Manager find SDSs or set up the library for us?
A: The trial help dialog offers: send your chemical list to support@sdsmanager.com (the **Our Promise** popup uses product_list_import_support@mail.sdsmanager.com for the same service) and SDS Manager will find the SDSs; an on-site visit where an agent photographs every product label and finds the matching SDS; migration from another SDS system (the app's texts say both "typically completed within one business day" and "within 5–7 business days", so confirm the timeline with SDS Manager); and a free demo. Use **Contact us about this** to request one.

Q: What is the Go live checklist?
A: A short list (from **More** or your profile menu) of what to do before rolling out: check SDSs are on the latest version, check the QR code, add a link to your library on your intranet, start your subscription, print and post QR posters, and send the info email to employees. Ticks are not saved; it is a reference list.

Q: Where do I download the mobile app?
A: The SDS Manager app is on the Apple App Store and Google Play. If your organization has enabled offline app access, the download buttons appear in the top bar on **All my SDSs** pages, and the address /download-app sends a phone to the right store.

Q: Why does my menu say "COSHH assessments" or "7-point risk assessment" instead of "Job procedures"?
A: The label adapts to the organization's country. UK organizations see **COSHH assessments**, Danish organizations see **7-point risk assessment**, and everyone else sees **Job procedures**. It is the same module.

Q: What are the numbers on the icons in the top bar?
A: The task counter shows open SDS tasks (products awaiting SDS, SDS requests, pending approvals), the envelope shows new messages from vendors, and the bell (Owners and Admins) shows SDSs with a newer version available. Click an icon to open the related list. Counts above 99 show as "99+".

Q: I saw a "New Features Just Released" popup. Can I see it again?
A: Once closed, announcements are marked as seen and do not return. Release notes stay available through **Release Notes** in the Guides & Help panel on the Dashboard.

Q: Is the SDS Manager web app accessible?
A: The accessibility statement (footer link **Accessibility**) says the app targets WCAG 2.2 Level AA and is currently "partially conformant", lists known limitations (for example regulated hazard label colours and some third-party components) and asks for feedback at support@sdsmanager.com.

## Related topics

- **Plans, Free Trial, Sign-up, Billing and Subscription** — plans, trial, subscription, expiry
- **Login & Account Security, Users, Roles & Permissions, and Organization Settings** — roles, invites, organization profile, settings, SSO
- **Adding, finding and importing SDS (getting SDS into the library)** — search, barcode, binder, product list, ZIP/PDF import, Pending Tasks
- **SDS library: substances list, SDS details, stock, archive and export** — All my SDSs, Manage SDS Library, SDS Filter, Archive, Report a problem with an SDS
- **Locations, QR codes and employee access to SDS** — posters, info email, offline app, SDS Binder
- **Labels, labelling compliance, kits and usage tracking** — labels, Labelling compliance, Kit Management
- **Chemical risk assessment, PPE approval, disposal classification and substitution** — Risk assessment, PPE Approval, Disposal Classification, Substitutions
- **Job procedures (job hazard analysis, COSHH assessments, 7-point risk assessments) and chemical work instructions** — Job procedures, COSHH assessments, 7-point risk assessments
- **Exposure register, reports (incl. Tier II) and Danish APB** — Exposures, Reports, APB
- **Keeping SDS up to date: newer versions, SDS update requests to vendors, vendor inbox and SDS Quality** — SDS updates and vendor requests, SDS Quality
- **SDS Distribution for suppliers (eCommerce / DirectSDS), the customer SDS portal, and integrations** — SDS Distribution (eCommerce), SDS Portal, Integrations, SafetyCulture, MCP Server Access
- **Glossary, GHS hazard reference data and accessibility in SDS Manager** — terms, GHS pictograms and statements, accessibility
