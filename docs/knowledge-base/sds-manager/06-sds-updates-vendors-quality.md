# Keeping SDS up to date: newer versions, SDS update requests to vendors, vendor inbox and SDS Quality

> Summary: Safety Data Sheets (SDS) are revised by manufacturers over time, and regulations expect you to work from current versions. SDS Manager helps in four ways: it flags SDS in your library for which its database holds a more recent version (**SDS where newer version exists**) and lets you compare and upgrade them; it lets you email the vendors you buy from to request updated SDS and collects their replies (**Vendor Contacts**, **Request Updated SDS**, **Sent Requests**, **Inbox (from vendors)**, **Unverified SDS**); it gives you a dedicated inbound email address so suppliers can send SDS straight into SDS Manager; and it runs an AI-assisted **SDS Quality** check that scores each SDS against the rules for your country. These tools are aimed at account Owners and Admins who maintain the SDS library.

## Where to find it

All of these tools live in the left sidebar (menu). Exact visibility depends on role and plan (see "Plan and permission requirements").

| What | Menu path | URL path |
|---|---|---|
| SDS that have a newer version | **SDS Updates** > **SDS where newer version exists** (also listed under **Pending Tasks**) | `/sds-with-newer-version/` |
| Compare current and newer version | Click **Upgrade to new version** (or **Show differences between the two SDS**) on a row of the page above | `/sds-with-newer-version/diff/<id>` |
| Vendor email addresses and URLs | **SDS Updates** > **Vendor Contacts** (page heading: **Vendor Contact Management**) | `/manage-sds-updates/vendor-emails/` |
| Send update requests to vendors | **SDS Updates** > **Request Updated SDS** | `/manage-sds-updates/request-updated-sds/` |
| Requests already sent | **SDS Updates** > **Sent Requests** (page heading: **Sent Vendor Requests**) | `/manage-sds-updates/sent-request/` |
| Replies and files from vendors | **SDS Updates** > **Inbox (from vendors)** (also listed under **Pending Tasks**) | `/manage-sds-updates/vendor-responses/` |
| SDS needing vendor/purchase information | **SDS Updates** > **Unverified SDS** (page heading: **Unverified SDS management**) — only shown when you have unverified SDS | `/manage-sds-updates/unverified-sds/` |
| Inbound email address for SDS | **Settings** page > section **Email address for Safety Data Sheets Updates** | — |
| Automatic upgrades on/off | **Settings** page > **Automatically update SDS to new versions** (also as a switch on the **SDS where newer version exists** page, Owner only) | — |
| Email alerts about vendor messages and new revisions | **Account settings** > **Email notifications** | `/account` |
| Pending work overview | **Pending Tasks** (page heading: **Tasks**) | `/unmatched-substances/` |
| AI quality check of your SDS | **SDS Quality** (short name in collapsed menu: **Quality**) | `/sds-quality` |

The **SDS Updates** menu item shows a badge with the number of SDS that have a newer version. Its tooltip reads: "**SDS Updates** – Access all tools related to tracking, reviewing, and managing updated or revised Safety Data Sheets in your library. Stay compliant by keeping your SDSs up to date." In the collapsed sidebar the item is called **Updates**. While the library has fewer than two SDS in use, **SDS Updates** may appear under the **More** menu instead.

## Plan and permission requirements

What the application shows and checks (SDS Manager's servers may apply further plan rules that are not visible in the app):

| Feature | Roles that see it | Plan rules visible in the app |
|---|---|---|
| **SDS where newer version exists** page | Account **Owner** and **Admin** only (not Admin Light, Staff, Read only, No Access, nor QR-code login users). Your role must also include access to newer-version data. | Visible on all plans, but on **trial and Free** the list shows only 5 rows, paging is disabled, and upgrading is blocked with the message "Upgrade to latest version is only available on Premium, Pro and Enterprise paid plans". |
| Upgrading / dismissing a specific SDS (buttons in the comparison view) | Account Owner or Admin who also has the **Owner**, **Admin** or **Admin with approval** role on that SDS's location. | Upgrade blocked on trial/Free (same message as above). |
| **Upgrade all SDS to the latest version** button | Owner and Admin | Blocked on trial/Free. |
| **Automatically update SDS to new versions** switch | On the newer-version page: **Owner** only. On the **Settings** page: users who can open Settings. | On the newer-version page it is blocked on trial/Free. On the Settings page, turning it on shows a "feature not available"/upgrade popup if your subscription does not include newer-version data. |
| **Vendor Contacts**, **Request Updated SDS**, **Sent Requests**, **Inbox (from vendors)**, **Unverified SDS** | Owner and Admin only (not QR-code login users) | Hidden from the menu on **trial and Free** plans. |
| **Pending Tasks** menu group | Owner and Admin (other users with access to SDS requests can open the task list from the task counter icon in the top header) | Not plan-gated in the menu. |
| **SDS Quality** | Owner, Admin and Admin Light, provided their role includes SDS Quality access (granted by SDS Manager per role). Always hidden for **Staff**, **Read only** and **No Access**; if they open the page they see "You do not have permission to access this page." | **Hidden for trial and Free plans** (menu item hidden and the page redirects to the start page). The on-screen text says the **Premium** plan includes quality checks for up to 5 SDSs, and **Pro** allows checks on all SDS. Enterprise limits are not stated in the app; confirm with SDS Manager sales. |
| SDS Quality settings (company SDS age limit, accepted languages, accepted emergency prefixes) | Editable only where the app allows it; otherwise the value is shown with "(Only account owner can change this setting)". | — |

Plan prices and any limits not shown above are not specified in the application; confirm with SDS Manager support/sales.

## How SDS Manager tells you a newer SDS version exists

SDS Manager compares the SDS in your library with its own SDS database. When the database holds a more recent version of an SDS you use, that SDS is flagged as having a newer version. (The matching itself runs on SDS Manager's servers and is not described in the application.) You see this in several places:

- The badge on **SDS Updates** and the item **SDS where newer version exists** (count of flagged SDS).
- On an SDS detail view, Owners and Admins see a warning: "A newer version of this SDS exist. Click here to move to new version". Clicking it opens the upgrade dialog.
- On location SDS lists there is a **Newer Version** column and a filter **Only show SDS with new revisions**.
- When you add or import an SDS that is already outdated, SDS Manager asks whether to upgrade (see "Newer version prompts when you add or import SDS").
- Email: if enabled in **Account settings** > **Email notifications**, you can receive **New revision of an SDS** and **SDS has automatically been upgraded to new version** emails.

Your library is not upgraded automatically unless you turn on **Automatically update SDS to new versions**. An information banner on the newer-version page links to "Learn how revision updates work." (an SDS Manager FAQ article); you can close the banner.

## SDS where newer version exists page

This page lists every SDS in your library for which a newer version exists. Page heading: **SDS where newer version exists**.

**Top of page**

- **Upgrade all SDS to the latest version** button (Owner/Admin) with an info icon (see "Upgrading all SDS at once").
- **Automatically update SDS to new versions** switch (Owner only).
- Info banner "Learn how revision updates work."

**Filters**

| Filter | Options / effect |
|---|---|
| **SDS status** | "Only list SDS in use" (default) or "Only list SDS not in use". |
| **Only list SDSs with requested new version** | Shows only SDS for which a new version has been requested from the vendor. |
| **Only list SDS with dismissed upgrade notifications** | Shows only SDS whose upgrade notification you dismissed. |
| **Only list SDSs that need my review for the new version.** | Shows only SDS where you are the assigned upgrade reviewer. |
| Location filter button | Limit the list to selected locations. |

Ticking one of the three checkboxes clears the other two (they are mutually exclusive).

**Columns**

| Column | Meaning |
|---|---|
| **Product Name** | Product name of the SDS in your library. |
| **Product Code** | Product code. |
| **Revision date** | Revision date of the version you have. |
| **Revision date newer version** | Revision date of the newer version in SDS Manager's database. |
| **Different dates** | Other dates that changed between versions, shown as old → new (for example **Date of Issue**, **Publish date**, **Printed date**). |
| **Locations** | Locations where the SDS is used. |
| Upgrade reviewer (no header text) | Avatar of the assigned reviewer, or a field **Assign upgrade reviewer**. |
| Actions | **Upgrade to new version** (or **Approve to new version** if you are the assigned reviewer); **Show differences between the two SDS** for dismissed rows; **Upgrade to requested SDS** when the row has a vendor email request. |

Hovering **Upgrade to new version** shows: "You confirm upgrade in next step after you see changes between new and current SDS". Nothing is changed until you confirm in the next dialog.

## Reviewing the difference between two SDS versions (comparison view)

Clicking **Upgrade to new version**, **Approve to new version** or **Show differences between the two SDS** opens the comparison view for that SDS.

What it shows:

1. Header: product name, supplier, and the location path (for example Site > Building > Room).
2. A row of controls (only for Owners/Admins with admin rights on that location):
   - **Assign upgrade reviewer** field and a **Comments** button (opens the SDS comments).
   - **Upgrade to new version** (or **Approve to new version** for the assigned reviewer).
   - **Dismiss upgrade notification** (red), or **Cancel dismiss upgrade notification** (grey) if already dismissed. For a dismissed SDS, the dismissal reason is shown as "Reason: …".
3. An info message "The SDS has connected data" when the SDS has data you added (for example risk assessments, information messages, edits or attachments).
4. **Changed values** table with two columns, **Current version** and **Newer Version**, showing only fields that differ. GHS pictograms are shown as images; components show EC, CAS and concentration. PDF icons at the top of each column open the SDS PDF of that version ("This version does not have a SDS file" if no PDF exists).
5. A print icon (desktop) that prints the comparison titled "Different between 2 versions of SDS" with your company logo, printed date, product, supplier and location.

If the comparison cannot be loaded you see "No matched PDF".

## Upgrading one SDS to the newer version

Steps:

1. Open **SDS Updates** > **SDS where newer version exists**.
2. Click **Upgrade to new version** on the row (or click the warning on the SDS detail view).
3. Review the comparison, then click **Upgrade to new version**.
4. The **Move to newer version** dialog opens. Review and choose options (below).
5. Click **Move to newer version**. When SDS Manager offers the all-locations option, the dialog instead shows two buttons: **Only change SDS on current location to new version** and **Update the version of this SDS across all locations.**
6. Confirm any follow-up dialog. On success a confirmation appears and the newer-version count updates.

**Review table in the dialog** lists Product Name, Supplier Name, Revision date, Date of Issue, Publish date, Printed date, Signal word, GHS pictograms, EUH-statements, Hazard statements, Precautionary statements, Locations using the SDS, Risk assessment, SDS Components and CAS# of components, with columns **Original value current SDS**, **Edited value** (only when you edited data) and **Original value new SDS**. The dialog also shows your information message, NFPA label, HMIS label and **List of attachments** if they exist.

**Copy options (checkboxes)** — each is disabled when the data does not exist; the first three are pre-ticked when the data exists (NFPA/HMIS is not pre-ticked):

| Option | Effect |
|---|---|
| **Copy edited SDS Information to newer version** | Your manual edits to SDS data are carried over. |
| **Copy attachments to newer version** | Your attachments are carried over. |
| **Copy information message to newer version** | Your information message is carried over. |
| **Copy NFPA/HMIS to newer version** | Only shown for US and Canadian customers. Carries over NFPA/HMIS label values. |

**Risk assessments** — if the current SDS has approved risk assessment(s), a card says "This SDS has an approved risk assessment" (or "This SDS has N approved risk assessments") and "The new SDS version may contain updated hazard data. Choose how to handle the risk assessment:"

| Choice | Effect |
|---|---|
| **Create draft (recommended)** | Default. A draft risk assessment is created for the new version for you to review. |
| **Copy as approved** | Copied as approved. If the newer SDS already has an approved risk assessment, the label reads "Copy as approved (Replaced existed approved version)". |
| **Don't copy** | No risk assessment is carried over. |

If you copy a risk assessment and job procedures use it, a second card appears ("1 job procedure uses this risk assessment" / "N … use this risk assessment"). The procedure name depends on your country: UK customers see "COSHH assessment", Danish customers "Risk assessment", others "Job procedure". Each linked procedure is listed with a checkbox (all ticked by default): "Transfer them to the new risk assessment so their reports show the new SDS version's hazard data. Any you leave unchecked keep using the old version." After the upgrade you may see "Transferred N … to the new risk assessment" or, if something failed, "Some … could not be transferred to the new risk assessment. Please check their reports."

**Follow-up confirmations**

- If the newer version already exists on the same location and you chose to copy data: "The upgrading version of SDS has already existed on same location. This action will overwrite the existing data!" followed by "These data will be moved to new SDS - based on your selection from the last step:" (Edited data, List of attachments, Information message). Click **Submit** to proceed.
- If you chose **Update the version of this SDS across all locations.**: "These data will be moved to SDS with no edited data and no attachments only. You have to upgrade SDS with edited data or attachments one by one." Click **Submit**.

**Chained versions** — if the version you upgraded to is still not the latest, you see "The version you just upgraded to is not the latest version" and the dialog reloads so you can upgrade again; a summary of the new SDS (**Original value new SDS**) may be shown.

## Upgrade reviewers: assigning someone to approve an upgrade

Owners and Admins can assign an **Upgrade reviewer** to an SDS that has a newer version, either in the reviewer column of the list or with **Assign upgrade reviewer** in the comparison view.

- The list of selectable users contains active users whose role on that SDS's location allows upgrading SDS to a newer version.
- After saving: "Set upgrade reviewer successfully".
- The assigned reviewer sees **Approve to new version** instead of **Upgrade to new version**, and can filter the list with **Only list SDSs that need my review for the new version.**
- In the comparison view the reviewer field is locked while the upgrade notification is dismissed.

## Dismissing an upgrade notification

Use this when you do not want to upgrade (for example the "newer" SDS is wrong, or you must keep the current version).

1. Open the comparison view and click **Dismiss upgrade notification**.
2. In **Please give us the reason**, choose:
   - **Report as incorrect newer version** — comment required (tells SDS Manager the match is wrong).
   - **Keep using the current version of SDS and skip the upgrade** — no comment needed.
   - **Other reason** — comment required.
3. Click **Confirm**. Message: "Dismiss notification successfully".

If a required comment is empty you see "Comment can't be empty". Dismissed SDS can be listed with **Only list SDS with dismissed upgrade notifications**; their action button becomes **Show differences between the two SDS**.

**To undo:** open the comparison view, click **Cancel dismiss upgrade notification**, and confirm "Are you sure you want to cancel the dismissal of the newer version upgrade notification for this SDS?". Message: "Cancel dismiss notification successfully".

## Upgrading all SDS at once

The **Upgrade all SDS to the latest version** button (Owner/Admin) upgrades every SDS that has a newer version.

1. Click **Upgrade all SDS to the latest version**.
2. In **Confirm that you want to upgrade all SDS to the latest version**:
   - If no SDS has connected data: "Are you sure to upgrade all SDS to the latest version" — click **OK**.
   - If some SDS have connected data ("Some of the SDS has connected data (e.g. Risk Assessment, Info Messages, Edits & Attachments)"), choose **Update all SDS to new verion and copy over connected data** or **Only update N SDS without any connected data**, then **OK**.
3. An **Update status** window shows a progress bar: "Update in progress. Please wait, this might take a while." You can close it; "The updating process will run in the background".
4. Result: "All SDSs upgraded to latest SDS", or "No SDS were upgraded.", or "All SDS with newer versions have connected data — switch to 'upgrade all and copy data' to include them.", or "The upgrade could not be completed. Please try again."

If an upgrade-all is already running: "A previous upgrade is still running. Please try again later."

The info icon next to the button says that **Upgrade all** and **Automatically Update SDS to New Versions** will not automatically update SDSs modified by users — where data has been edited, attachments added, a risk assessment added, NFPA/HMIS information added or an information message added — and that such SDSs should be updated manually one by one. When in doubt, upgrade modified SDS individually so you can review the copy options.

## Automatically update SDS to new versions (setting)

Setting text: "Automatically replaces an SDS in your library with the latest version when SDS Manager has a new version available. Enable to keep your SDS library current without manual checking. Disable if you need to review and approve new versions before they replace existing ones (e.g., to re-evaluate risk assessments). When ON, outdated SDSs are automatically upgraded. When OFF, you receive notifications about new versions but must manually update."

- Where: **Settings** page, and as a switch on **SDS where newer version exists** (Owner only).
- Saving shows "Information saved successfully".
- On trial/Free plans the switch on the newer-version page is blocked with "Upgrade to latest version is only available on Premium, Pro and Enterprise paid plans"; on the Settings page an upgrade popup appears if your subscription does not include this feature.
- Per the info tooltip, SDS you have modified (edits, attachments, risk assessment, NFPA/HMIS, information message) are not upgraded automatically.
- Optional email: **SDS has automatically been upgraded to new version** (Account settings > Email notifications).

## Newer version prompts when you add or import SDS

When you add or import an SDS for which SDS Manager already has a newer version:

- A dialog titled "We have a more recent version of this SDS in our database." asks "Would you like to upgrade SDS to the newer version now, or keep the version you imported and do the upgrade later?" with **Upgrade to new version now** and **I will decide on the upgrade later**.
- Import results may say "For some of the imported Safety Data Sheets we have newer versions in our database. Click here to see which SDS have newer version." or "SDS where a newer version exists. Click here to review", linking to the newer-version page.

## Refresh all cached SDS values (not a version upgrade)

At the bottom of the **Settings** page is the button **Refresh all cached SDS values**. Its tooltip explains: SDS Manager sometimes re-runs the extraction of SDS to gather information not extracted before; your library does not update automatically; clicking the button brings in the more recent data **for the same version** of each SDS and does **not** upgrade your library to newer versions. Progress appears in **Update status** ("Update in progress…", then "All cached SDS values were updated to latest extracted version successfully"). Closing early: "The updating process will run in the background".

## Requesting updated SDS from suppliers: the workflow

Suppliers are legally required to provide updated SDS on request. SDS Manager helps you contact the vendor where you purchased the product (not necessarily the manufacturer). The workflow:

1. **Vendor Contacts** — add the email address (and optionally a website URL) of each vendor.
2. **Request Updated SDS** — choose vendors and the SDS to request, preview the emails and click **Send All**.
3. **Sent Requests** — see what was sent and the history per vendor.
4. **Inbox (from vendors)** — review replies and the SDS files vendors sent, then add them to your library or upgrade.
5. Optionally give vendors your **inbound email address** so they can send updated SDS directly.
6. **Unverified SDS** — supply missing vendor/purchase information for SDS that SDS Manager could not verify.

A step-by-step FAQ link "Step-by-step guide: How to request updated SDSs from suppliers" appears on the **Vendor Contacts** page (closable). Tip from the app: products that are no longer for sale typically do not get updated SDS — mark them with **Mark product as discontinued** (an SDS action in the library) to avoid sending requests for them.

## Vendor Contacts page

Page heading: **Vendor Contact Management**. Menu tooltip: "Manage your list of suppliers and request updated SDSs directly via email. SDS Manager helps you contact the vendor where you purchased the product (not the manufacturer). Suppliers are legally required to provide updated SDSs upon request."

**Filters**

| Filter | Effect |
|---|---|
| **Filter by Vendor Name** | Search by vendor name. |
| **Revision Date Threshold** (year) | "Only vendors with SDS with revision date older than this date will be listed below." Default: the current year minus 3. Must be a 4-digit year from 1980 to the current year. Click the search icon to apply. Clearing the field resets it to the current year. |
| **Language** | Filter vendors by language. |
| **Email status** | All / **Has email** / **No email**. |
| **URL status** | All / **Has URL** / **No URL**. |
| **System status** | All / **In system** / **Out of system**. |

**Columns**

| Column | Meaning / how to use |
|---|---|
| **Supplier** | Vendor name. An **Out of system** chip means "No vendor record in the system. The name comes from the supplier name on the SDS or the SDS request." |
| **Vendor Email** | Editable. Type the address, then click the check icon to save ("Email updated!") or the X icon to cancel. Invalid addresses show "Invalid Email Format". |
| **Vendor URL for SDS** | Editable. Tooltip: "If your vendor provides all Safety Data Sheets (SDSs) on their website, they typically will not email them to you. Instead, you can provide the URL of the webpage where the SDSs are hosted. Our crawlers will then retrieve the SDSs and add them to our database for easy access." Accepts addresses like `example.com`, `www.example.com/path` or with `http(s)://`; rejects IP addresses, localhost, query strings and spaces ("Invalid URL format"). Saved: "URL updated!". |
| **Ignore** | Tick to mark a vendor as ignored (for vendors you do not want to contact). A **Comment** dialog asks why (**Confirm** is enabled once you type a comment). A speech-bubble icon shows the comment. If the vendor's email is disabled on the vendor list, the box is locked with the tooltip "Email disabled for this vendor on the vendor list". |
| **Date of Last Update Request** | When you last requested updates from this vendor. |
| **SDS Count** | Number of SDS from this vendor (default sort, highest first). |
| **Language** | Vendor language. |

Columns **Supplier**, **Vendor Email**, **Vendor URL for SDS**, **Ignore** and **SDS Count** are sortable. Rows per page: 10, 20 or 50.

Vendor emails can also come from a product-list import (column **Vendor Email**: "Email of company you buy this product from"). In an import, one supplier may only have one vendor email: "Supplier X has multiple vendor emails. Only one email can be used per supplier."

## Request Updated SDS page

Menu tooltip: "Once vendor contact emails are added, you can send SDS update requests directly from SDS Manager. Suppliers are legally obligated to provide the most recent SDS upon request." Info icon on the page: "Please note that products that are no longer for sale typically do not get any updated SDS. For such expired products, you can set status 'Mark product as discontinued' to avoid sending requests for such products."

**Filters:** **Filter by Vendor Name**, **Revision Date Threshold** (default current year minus 3), **Language**, **Email status** (default **Has email**).

**Columns**

| Column | Meaning |
|---|---|
| Checkbox | Select vendors to email. Only vendors with an email address can be selected; the header checkbox selects all such vendors on the page. |
| **Supplier** | Vendor name. |
| **Vendor Email** | First email address (full value in tooltip). Tooltip on the header: "Add the email address of the vendor you purchased the product from, as they are required by law to provide you with updated SDS." |
| **Request SDS Count** | "selected/total", e.g. 4/6 = 4 of 6 SDS will be requested. Click the open icon to edit the selection. |
| **Revision date** | Revision date of the oldest SDS from this vendor. |
| **Updated date** | Date of the last update request to this vendor. |
| **Language** | Vendor language. |

**Choosing which SDS to request (SDS List dialog)** — clicking the open icon in **Request SDS Count** lists the vendor's SDS older than the threshold with **Product Name** (with a view-details icon), **Revision date** and **Previously requested** (check mark; such rows are greyed). Tick or untick SDS ("Check/uncheck to include/exclude SDS from the vendor's email request list"), then click **Confirm All**. Message: "Selection Updated". **Confirm All** is disabled until you change something.

**Sending the requests**

1. Tick one or more vendors.
2. Click **Preview Messages**. One email per vendor is generated (with the list of products and revision dates).
3. For each email, check or edit **To**, **Subject** and the message body (editable). Use **Previous** / **Next**; "Message 1 of N" shows your position.
4. Click **Send All**.
5. Result: "Sent N requests successfully" (", N failed" is appended if some could not be sent). If none could be sent: "Failed to send email". The list refreshes.

If no vendor has been selected: "No vendors selected". If no previews exist: "No emails to send".

When the table has no rows, the page shows: "Before you can send requests you need to visit the Vendor Contacts page to fill in email address to the vendors where you bought the products" (with a link to **Vendor Contacts**).

## Sent Requests page

Page heading: **Sent Vendor Requests**. Filters: **Filter by Vendor Name**, **Language**.

| Column | Meaning |
|---|---|
| **Supplier** | Vendor. |
| **Vendor Email** | Address the request went to. |
| **Request SDS Count** | Number of SDS requested. |
| **Sent at** | Date sent. |
| **Language** | Vendor language. |
| **Messages** | Eye icon opens the message history for that vendor. |

## Message history and moving SDS back to the request list

The eye icon in **Sent Requests** or in the **Responses** tab of the inbox opens **Message History for <vendor>**.

| Column | Content |
|---|---|
| **Sent/Received Messages** | A button "Requested N SDS on <date>" opens the sent email (To, Subject, body, **Attachments**). Vendor replies appear below as "Reply message on <date>". |
| **Requested/Updated SDS** | Table **Requested SDS** → **Updated SDS**: each requested product (with revision date) and, once a newer SDS has replaced it, the updated product and revision date. For out-of-system vendors the table is **Requested SDS** → **Matched SDS**, showing "Not matched yet" until an SDS is matched. Click a product to open its details. |
| **Actions** | Move-back icon. |

**Moving SDS back:** click the move-back icon on a sent message and confirm "Move these SDS items back to the request list so they can be resent later from the Request Updated SDS page." Message: "SDS returned successfully." The icon then shows "These SDS have been moved back." Moved-back messages are hidden unless you tick **Show moved-back messages**.

## Inbox (from vendors)

Menu tooltip: "**Inbox (from vendors)** – View and manage replies from your suppliers. Review the SDS files they've provided and update your library with the latest versions to stay compliant." The page has three tabs.

### Files tab

Tooltip: "View all Safety Data Sheets (SDSs) received from incoming sources. Files are automatically extracted and listed here, where you can review extraction status, open the original PDF, re-run extraction if it failed, and add documents to the appropriate location in your library."

Each received file is a parent row; expand it (arrow) to see the SDS found in it ("N SDS(s) found").

**Filters:** **Status** and **Language**.

| Status (filter) | Meaning |
|---|---|
| All | Everything. |
| **Extracting** | Still processing. Tooltip: "The system is processing the file. If it remains in this state for more than 24 hours, you can click the retry icon to try again." |
| **Ready** | Tooltip: "This SDS has been received but is not yet in your SDS Library. Click the "+" icon to add it." (A file whose SDS are ready shows **Processed**.) |
| **Added to library** | Tooltip: "All files in the message have been processed". (A completed file shows **Completed**.) |
| **Extraction failed** | Processing failed; use re-run. |
| **Archived** | Files/SDS you archived in the inbox. |

**Columns:** **From** (sender email), **File name**, **Received** (date and time), **Status**, **Location** (where the SDS is now used), **Product Name**, **Supplier Name**, **Product Code**, **Language**, **SDS Type**, **Message Subject** (click to read the email), **Actions**.

**SDS Type** values: **New SDS**, **New version** (a newer version of an SDS you have), **Outdated SDS**, **Duplicate SDS**, **Unknown PDF type**.

**Actions**

| On | Action |
|---|---|
| File (in progress or failed) | **View extraction progress** (shows steps such as File received, Pre-processing file..., Splitting document..., Extracting SDS content..., Saving extracted data..., SDS ready / Extraction failed; **Run in background** to close) and **Re-run extraction** ("Extraction has been restarted successfully."). |
| File | **Archive** / **Un-archive**. |
| SDS | **View PDF**. |
| SDS with status Ready | **View details**, **Add Safety Data Sheet to my library** (choose locations in **Select location to add Safety Data Sheet**, then **Add**; if your account requires an ERP ID you must enter it: "Please enter our ERP ID"). |
| SDS already added | **View details** (of the library entry) and **Add Safety Data Sheet to my library** (add to more locations). |
| SDS | **Archive** / **Un-archive**. |

If progress information has expired: "The extraction process is completed (successfully or not), but the status information is no longer available."

### Responses tab

Tooltip: "View all responses received from vendors regarding SDS requests. When you request a newer or specific version of an SDS, vendor replies will appear here for review." Filters: **Filter by Vendor Name**, **Language**. Columns: **Supplier**, **From**, **SDS Count**, **Received**, **Language**, **Messages** (opens the message history).

### Direct Messages tab

Tooltip: "Vendor-initiated messages only." (emails vendors sent without a request). Search: **Search by subject or sender**. Columns: **Supplier** (with sender email), **Subject** (with number of messages), **Location**, **Status** (**PDF processing** or **Done**), counts **SDS Count New SDS**, **SDS Count New version**, **SDS Count Outdated**, **SDS Count Duplicate**, **Count Unrecognized PDF**, **SDS Count Total**, **Received**, and **Actions** (view the message).

## Inbound email address for SDS updates

Section **Email address for Safety Data Sheets Updates** on the **Settings** page, under **Automated SDS Ingestion**: "Tell your vendors to email to the below email address and you will receive any updated Safety Data Sheets directly in SDS Manager. SDS manager will automatically import the received PDF files and update your current SDS with the new version automatically if you have configured automatic updates."

How to set it up:

1. Under **Define your inbound email address**, type a company identifier. The preview shows "Your address will be: sds-<identifier>@sds.sdsmanager.com".
2. Use only lowercase letters, numbers, periods (.) and hyphens (-); spaces cannot be typed.
3. Optional: **For Multi-site: Allow dedicated email address for site** — each location gets its own address (the main address with the location number added); you can see it on the **Location management** page for each site as "Email to this location".
4. Optional (only when multi-site is on): **Automatically add Safety Data Sheets received to location email** — SDS files sent to a location's address are added to that location automatically.
5. Optional: **Send daily email summary for messages received to main email address** — enter one or more recipients separated by commas. This summary covers the main address only; location addresses have their own summary setting in each location's configuration.
6. Click **Save Configuration**. Message: "Successfully".

**Important:** "Once saved, this email address cannot be changed. Please double-check the spelling before proceeding." After saving, the identifier field is locked.

Validation messages: "Please enter a company identifier.", "Please use only letters, numbers, periods (.), and hyphens (-) in your email address.", "Invalid email address: <email>" (summary recipients).

Files arriving at these addresses appear in **Inbox (from vendors)**.

## Unverified SDS page

Page heading: **Unverified SDS management**. The menu item appears only when your account has unverified SDS (and not on trial/Free). The page lists SDS in your library that SDS Manager has marked as unverified (not yet confirmed to be the current version; which SDS appear is decided by SDS Manager and not described in the app), and asks you for information that helps obtain an updated SDS.

**Filters:** **Search for SDS** (product name), revision date range (from/to), region, supplier.

| Column | What to do |
|---|---|
| **Product** | Product name. |
| **Supplier** | Supplier on the SDS. |
| **Vendor Email** | Editable: the vendor you buy from. Invalid input: "Invalid Email Format". |
| **Revision date** | Revision date of your SDS (default sort: newest first). |
| **Region** | Region of the SDS. |
| **Year of purchase** | Editable: a year from 1900 to the current year ("Invalid year of purchase" otherwise). |
| **Actions** | **No longer for sale** checkbox. Tooltip: "For products that are no longer for sale there are no new SDS issued". |

Each change saves immediately ("Updated").

When finished, click **Please click here when you are done and let us know any comments you want to share**. A dialog shows the message to the SDS Manager team: subject **Validation updated**, **List of products with added information** (products that have both vendor email and year of purchase, or are marked no longer for sale; otherwise "No product with complete information"), and a **Comments** box. Click **Send**. Success: "Sent 1 requests successfully". Failure: "Failed to send: No emails sent successfully".

## Email notifications related to SDS updates

In **Account settings** > **Email notifications** (for Owner, Admin and Admin Light):

| Switch | Use |
|---|---|
| **Message from vendor** | Email when a vendor message arrives. |
| **New revision of an SDS** | Email when a new SDS revision is available. |
| **SDS has automatically been upgraded to new version** | Email when automatic upgrading replaced an SDS. |

Other switches in the same block (New SDS Request, Message from SDS Manager, SDS File Import Complete, etc.) are described in "Email notifications" in the topic **Login & Account Security, Users, Roles & Permissions, and Organization Settings**.

## Pending Tasks

**Pending Tasks** (short name **Tasks**) is a sidebar group for Owners and Admins that collects work waiting for action. Its badge shows the count of open SDS requests (products still waiting for an SDS). When you expand it on desktop, SDS Manager jumps to the first sub-item with a non-zero count. A task counter icon in the top header ("Tasks: Product awaiting SDS, SDS Requests and Pending approval") opens the same list for users with access.

| Sub-item / tab | What it lists |
|---|---|
| **Products Awaiting SDS** | "SDS requests imported from XLS or added via barcode/picture that have not yet been matched with an existing SDS." |
| **SDS requests** | "SDS Requests created using the "Add request for Safety Data Sheet" dialog, with or without a linked SDS." |
| **Pending my approval** | "Tasks assigned to you that require your review or approval." |
| **SDS Awaiting Approval** | "SDS files in the approval flow. Items here are visible only to configured approvers until every step is signed off." Shown only when items are waiting. If the approval workflow has been turned off, a notice says the listed SDS were held before it was turned off and must be approved or rejected. |
| **Completed tasks** | Completed SDS requests (tab on the Tasks page). |
| **Inbox (from vendors)** | Shortcut to the vendor inbox (hidden on trial/Free). |
| **SDS where newer version exists** | Shortcut to the newer-version list. |
| **Activate subscription** | Shown to the account Owner during a trial. |

The SDS-request sub-items (**Products Awaiting SDS**, **SDS requests**, **Pending my approval**) appear only when there are open or completed SDS requests. The **Tasks** page opens on the tab with the most items unless a tab is specified.

On the **Tasks** page you can **Search for Tasks**, filter (for example by **Assigned user** and request status), use **Bulk Action**, and click **Add SDS request**. Working with SDS requests themselves (matching, statuses, assistance requests) is covered in the topic **Adding, finding and importing SDS (getting SDS into the library)**.

## SDS Quality

**SDS Quality** (menu tooltip "SDS Quality Validation") is an AI-assisted check of how well each SDS in your library meets the requirements of your compliance region. The page states: "AI-assisted quality assessment — does not replace professional regulatory review".

### Compliance region and settings at the top of the page

- "Compliance check for <country> — <region>", with a **Change country** link (to Account settings). Regions used: Australia → Safe Work Australia (GHS Rev 7); New Zealand → EPA NZ / HSNO (GHS Rev 7); USA → OSHA HazCom 2012; Canada → WHMIS 2015; United Kingdom → UK REACH / GB CLP; EU/EEA countries plus Norway, Iceland, Liechtenstein and Switzerland → EU REACH / CLP; all others → UN GHS.
- **SDS age limit**: if your country has a firm rule, the page shows "<country> requires SDS review every N years (<regulation>)". Otherwise: **Company SDS age limit (years)** — "Your country does not have a strict SDS age limit. You can set a limit based on your company practice or industry standards. 5 years is commonly used." Enter 1–20 and click **Save**. Default 5.
- **Accepted SDS languages**: "SDS in these languages will not be penalized for language requirements. Leave empty to keep the default behaviour." Select languages and **Save**.
- **Accepted emergency number prefixes**: "Emergency numbers starting with these prefixes are accepted as valid (e.g. +49, +33 for cross-border poison centres). Leave empty to keep the default behaviour." Type a prefix, click **Add**, then **Save**. Must be 1–6 digits, optionally starting with + ("Enter 1–6 digits, optionally starting with +").
- If you cannot edit these settings you see the values with "(Only account owner can change this setting)", or "None configured".
- Saving any of these settings re-reads the table so scores reflect the change.

### Summary cards (click to filter)

| Card | Meaning |
|---|---|
| **Total SDSs** | Total unique Safety Data Sheets in your active library. |
| **Checked** | SDSs evaluated by the AI quality check — includes passed, conditional, failed, and errors. |
| **Passed** | Score 8 or above — SDS meets regulatory requirements for your compliance region with no critical issues. |
| **Conditional** | Score 5 to 7 — usable but has issues that should be addressed (missing details, incomplete sections). |
| **Failed** | Score below 5 — critical compliance gaps that make it unsuitable for your region (wrong framework, missing mandatory sections). |
| **Errors** | The check could not complete — typically the PDF could not be retrieved or the AI service was unavailable. |

Click a card again to clear the filter. There is also a search box ("Search by product name or supplier...") and a location filter.

### Running quality checks

- **Run Quality Check** runs the check on the next 10 unchecked SDS. The arrow next to it offers **Run on 1 SDSs** (runs immediately and reports "Quality check complete: <product> — passed / conditional pass / failed / error."), **Run on 10 SDSs**, **Run on 100 SDSs**, **Run on all SDSs**, and **Re-run failed checks**.
- Runs pick up SDS that have never been checked. **Re-run failed checks** retries SDS stuck on Error: "Re-running N failed check(s). The AI re-evaluates each SDS, so a score may change." If none qualify: "No failed checks are eligible for a re-run."
- While running, a progress bar shows "Checking X of Y SDSs..."; buttons are disabled. Leaving and returning to the page resumes the progress display.
- If no unchecked SDS remain: "No unchecked SDSs found."
- Per row, a play icon (**Run quality check on this SDS**) appears for unchecked or Error rows.
- **Refresh** reloads data; **Export Report** builds a downloadable report of the (location-filtered) list in the background.

### Table columns

| Column | Meaning |
|---|---|
| **Product / SDS** | Product name; compliance flag chips may appear: **Wrong Country**, **Wrong Emergency #**, **SDS Expired**, **Requires Manual Review**. |
| **Supplier** | SDS supplier or manufacturer. |
| **Score** | AI quality score 0–10 (green 8+, orange 5–7, red below 5). "(age)" or "(emergency)" under the score means it was capped. |
| **Status** | Pass (compliant), Conditional Pass (minor issues), Fail (critical issues), or Error. |
| **Checked** | Date/time of the last check. |
| **GHS Ver.** | GHS revision claimed in the SDS. |
| **SDS Age** | Years since last revision; red warning when it exceeds your limit. |
| Country-specific columns | See below. |
| **Issues** | Number of critical and high-priority issues ("2 critical, 1 high"). |
| **Actions** | Run check (unchecked/Error rows) and **Find a better SDS for this product** (flagged rows). |

Country-specific columns depend on your account country:

| Country | Extra columns |
|---|---|
| Australia, New Zealand | **Emergency Number**, **SWA WES** (Safe Work Australia Workplace Exposure Standards citation), **AICIS** (inventory status) |
| United States | **Emergency Number**, **OSHA PEL** (OSHA PEL / ACGIH TLV / NIOSH REL citation), **TSCA**, **Prop 65** |
| Canada | **Emergency Number**, **Bilingual** (English/French requirement), **DSL/NDSL**, **Provincial OEL** |
| EU/EEA, Norway, Iceland, Switzerland, Liechtenstein | **Country** (detected target country), **Emergency Number**, **National OEL**, **UFI**, **SVHC** |
| Other countries (including the UK in this table) | **Country**, **Emergency Number**, **OEL** |

The **Emergency Number** shows a warning when it "does not match your country — may not be reachable locally".

### Score caps and status overrides

- SDS older than your age limit: score capped. Tooltip: "Content score: X | SDS is N years old (limit: L years) — score capped".
- Emergency number from another country: "Content score: X — Emergency number … detected as … does not match your country (…); score capped at 4.0".
- In both cases the status is shown as **Fail**, with a tooltip such as "Originally Pass — failed due to SDS age", "… — failed due to emergency number mismatch" or "… — failed due to SDS age & emergency number mismatch".
- Adding accepted languages or emergency prefixes removes the related penalty.

### Detail panel (click a row)

Shows **Executive Summary**, **Regulatory Verdict**, **SDS Metadata** (Product, Type, Supplier, Revision, Language), **Targeting & Region Detection** (Target Region, Target Country, Regulatory Framework, Region Confidence, Country Confidence), **Check Scores** (each check with Score and Note), **Critical Deficiencies**, **Recommendations** (Priority, Check, Action), **Technical Observations**, **Error Details**, and the disclaimer: "This AI-generated quality assessment is for informational purposes only. It does not constitute a legal opinion and does not substitute professional regulatory review. Always consult a qualified regulatory specialist before making compliance decisions." If content is being translated: "Content is being translated to <language>. Reload the page in a moment to see the translated content."

Error reasons on Error rows: **PDF not available**, **PDF download link is broken**, **Could not process SDS content**, **Language not supported**, **Requires Manual Review**, or **Check failed**.

### Find better SDS

On rows that Failed, Conditionally passed, or were capped for age or emergency number, the **Find a better SDS for this product** icon opens **Find better SDS**:

- **Current SDS** (product, supplier, revision date, score).
- **Better options in our database**, already ranked; the top one may be marked **Recommended**. Each shows revision date, language, score and an emergency-number chip (**Emergency # matches your country**, **Emergency # does not match your country**, or **Emergency # unknown**), with **View details**, **View PDF** and **Use this SDS**.
- **Use this SDS** opens the standard replace confirmation, which archives the current SDS and replaces it. Afterwards, if the score could not be refreshed: "SDS replaced. The quality score could not be refreshed — run a quality check on the new SDS."
- None found: "No better SDS found — We have no other SDS for this product that scores better than the one you already use." with **Search all SDS** (opens Global SDS Search for the product).
- Many candidates: "Too many candidates to rank them all, so no single SDS is recommended. Compare the options below."

### Limits

- Premium: "{used} of {limit} quality checks used on your Premium plan". When used up: "Your Premium plan includes quality checks for up to 5 SDSs. Upgrade to Pro to run quality checks on all SDSs in your library. AI quality checks use advanced language models which carry token costs." Run buttons are then disabled.
- Unlimited plans see no counter.

## SDS validator (internal)

The SDS validator/splitter screens are internal SDS Manager tools and are not part of the customer product.

## Rules, limits and edge cases

- Only account **Owner** and **Admin** can use the newer-version and vendor tools; **Admin Light** cannot (but can use SDS Quality).
- To upgrade or dismiss a specific SDS you also need **Owner**, **Admin** or **Admin with approval** rights on that SDS's location.
- Trial/Free: the newer-version list shows 5 rows only ("Full list of Safety Data Sheets that has newer version are only available on Premium, Pro and Enterprise paid plans"), upgrading and auto-upgrade are blocked, vendor pages and SDS Quality are hidden.
- The app's message says upgrading is for Premium, Pro and Enterprise; Basic-plan availability is controlled by the subscription and is not specified in the app — confirm with sales.
- Upgrading never happens without confirmation unless **Automatically update SDS to new versions** is on.
- Upgrade-all and auto-upgrade skip modified SDS per the info tooltip; upgrade those one by one.
- Updating "across all locations" only moves your copied data to instances with no edited data and no attachments.
- Dismissing requires a comment for **Report as incorrect newer version** and **Other reason**.
- The inbound email address can be set only once.
- Vendor requests can only go to vendors with an email address (vendors without one cannot be ticked on **Request Updated SDS**).
- Revision Date Threshold accepts years 1980–current year.
- The newer-version count, vendor lists and quality results are refreshed by SDS Manager's servers; delays are possible.
- **Refresh all cached SDS values** refreshes extracted data only and never changes SDS versions.
- SDS Quality scores are AI-generated, may change on re-run, and are not legal advice.
- In risk evaluation, editing usage data for an SDS used on several locations asks "Do you want to set same value for this SDS on all locations?" — **Yes** applies to all locations, **No** to the current one only.

## Messages and errors users may see

| Message | Meaning | What to do |
|---|---|---|
| "Upgrade to latest version is only available on Premium, Pro and Enterprise paid plans" | Trial/Free plan tried to upgrade. | Upgrade the subscription. |
| "Full list of Safety Data Sheets that has newer version are only available on Premium, Pro and Enterprise paid plans" | Trial/Free list limited to 5 rows. | Upgrade the subscription. |
| "A previous upgrade is still running. Please try again later." | Upgrade-all already in progress. | Wait and retry. |
| "The upgrade could not be completed. Please try again." | Upgrade-all failed. | Retry; contact support if repeated. |
| "No SDS were upgraded." | Nothing qualified. | Check connected data; upgrade one by one. |
| "All SDS with newer versions have connected data — switch to 'upgrade all and copy data' to include them." | You chose to upgrade only SDS without connected data. | Run again with the copy option, or upgrade individually. |
| "The updating process will run in the background" | You closed the progress window. | Check back later. |
| "Could not move to the newer version. Please try again." | Single upgrade failed. | Retry. |
| "Could not load the version comparison. Please try again." | Comparison data failed to load. | Retry. |
| "No matched PDF" | Comparison view could not load. | Retry or contact support. |
| "The version you just upgraded to is not the latest version" | A still newer version exists. | Upgrade again in the reopened dialog. |
| "The upgrading version of SDS has already existed on same location. This action will overwrite the existing data!" | Newer version already at the location. | Confirm only if overwriting is intended. |
| "Comment can't be empty" | Required dismiss comment missing. | Add a comment. |
| "Dismiss notification successfully" / "Cancel dismiss notification successfully" | Dismissal saved / undone. | — |
| "Set upgrade reviewer successfully" | Reviewer saved. | — |
| "Email updated!" / "Failed to update email" | Vendor email save result. | Retry on failure. |
| "Invalid Email Format" / "Invalid URL format" | Bad vendor email/URL. | Correct the value. |
| "Year must be 1980 or later" / "Year must be <current year> or earlier" / "Please enter a valid 4-digit year" | Bad Revision Date Threshold. | Enter a valid year. |
| "Before you can send requests you need to visit the Vendor Contacts page…" | No vendors listed. | Add vendor emails or relax filters. |
| "No vendors selected" | Preview clicked without selection. | Tick vendors. |
| "Sent N requests successfully" | Emails sent. | Track in **Sent Requests**. |
| "Failed to send email" | No email could be sent. | Check addresses; retry. |
| "Failed to fetch vendors" / "Failed to fetch email messages" | Loading failed. | Reload. |
| "Selection Updated" | SDS selection for a vendor saved. | — |
| "SDS returned successfully." | SDS moved back to the request list. | Resend from **Request Updated SDS**. |
| "Extraction has been restarted successfully." / "Failed to restart extraction: …" | Re-run result. | Wait / retry. |
| "Extraction progress is not available for this file yet." | No progress data. | Check later. |
| "Please enter a company identifier." / "Please use only letters, numbers, periods (.), and hyphens (-) in your email address." | Inbound email setup validation. | Fix the identifier. |
| "Invalid year of purchase" | Unverified SDS year outside 1900–current year. | Correct it. |
| "You do not have permission to access this page." | Staff/Read only/No Access on SDS Quality. | Ask an Owner/Admin. |
| "Your Premium plan includes quality checks for up to 5 SDSs…" | Quality check limit reached. | Upgrade to Pro. |
| "N SDS were skipped due to service-level issues (AI provider rate limits or outage, missing PDF, or unexpected error). These results were not saved — please re-run the quality check to retry." | Temporary failures during a run. | Run again later. |
| "The quality check was accepted but never started, so no SDS was checked. The problem has been reported automatically — please try again in a few minutes." | Run did not start. | Retry in a few minutes. |
| "Single quality check failed. Please try again." | One-row check failed. | Retry. |
| "Could not load replacement suggestions. Please try again." | Find better SDS failed. | Retry. |
| "We couldn't deliver our email" | SDS Manager's welcome email to your own address bounced (or was reported as spam). Reasons: "This email address doesn't exist…", "This mailbox is full…". | Enter a corrected address and click **Update email** ("Email updated. We've sent a new welcome message to the corrected address."). Not related to vendor emails. |

## Frequently asked questions

Q: How do I know if a newer version of one of my SDS is available?
A: Open **SDS Updates** > **SDS where newer version exists**. The badge on **SDS Updates** shows how many SDS have a newer version in SDS Manager's database. You can also see a warning on the SDS detail view and enable the **New revision of an SDS** email in **Account settings** > **Email notifications**.

Q: Can I see what changed before I upgrade?
A: Yes. Click **Upgrade to new version** on the row; this opens a comparison of **Current version** and **Newer Version** showing only changed values (hazard statements, pictograms, components, dates, etc.) with links to both PDFs. Nothing changes until you confirm in the **Move to newer version** dialog. You can also print the comparison.

Q: Will I lose my risk assessments, attachments or edits when I upgrade?
A: No, if you choose to keep them. The upgrade dialog has checkboxes to copy edited information, attachments, the information message and (US/Canada) NFPA/HMIS values, and lets you **Create draft (recommended)**, **Copy as approved** or **Don't copy** your risk assessment. Job procedures (COSHH assessments in the UK) linked to the risk assessment can be transferred too.

Q: The SDS is used on several locations. Do I have to upgrade each one?
A: Not necessarily. When the upgrade dialog offers it, choose **Update the version of this SDS across all locations.** Copied data then only goes to instances that have no edited data and no attachments; instances with edits or attachments must be upgraded one by one. Choose **Only change SDS on current location to new version** to upgrade a single location.

Q: Can SDS Manager upgrade my SDS automatically?
A: Yes. Turn on **Automatically update SDS to new versions** on the **Settings** page (or, for the Owner, on the newer-version page). SDS you have modified (edited data, attachments, risk assessment, NFPA/HMIS, information message) are not upgraded automatically and must be upgraded manually. Not available on trial or Free plans.

Q: The "newer version" SDS Manager suggests is the wrong product. What do I do?
A: Open the comparison view, click **Dismiss upgrade notification**, choose **Report as incorrect newer version** and describe the problem in the comment. The SDS stays on your current version and the notification is dismissed. You can undo it later with **Cancel dismiss upgrade notification**.

Q: We must keep the current SDS version. How do I stop the upgrade reminder?
A: Dismiss it with the reason **Keep using the current version of SDS and skip the upgrade** (no comment needed). Dismissed items can be listed with **Only list SDS with dismissed upgrade notifications**.

Q: Can someone else approve the upgrade?
A: Yes. An Owner or Admin can assign an **Upgrade reviewer** for the SDS. The reviewer sees **Approve to new version** and can filter the list with **Only list SDSs that need my review for the new version.**

Q: How do I request updated SDS from my suppliers?
A: Add vendor email addresses in **SDS Updates** > **Vendor Contacts**, then go to **Request Updated SDS**, tick the vendors, adjust which SDS to request with the open icon in **Request SDS Count**, click **Preview Messages**, review/edit each email and click **Send All**. Replies appear in **Inbox (from vendors)**.

Q: Which SDS are included in an update request?
A: SDS from that vendor whose revision date is older than the **Revision Date Threshold** (default: current year minus 3). You can exclude individual SDS in the **SDS List** dialog; SDS already requested are marked **Previously requested**.

Q: Where do vendor replies and attached SDS show up?
A: In **Inbox (from vendors)**. The **Files** tab lists every received PDF with extraction status and SDS type (New SDS, New version, Outdated SDS, Duplicate SDS); use the + icon to add a Ready SDS to your library. The **Responses** tab groups replies to your requests, and **Direct Messages** shows emails vendors sent on their own.

Q: Can suppliers email SDS directly to SDS Manager?
A: Yes. Set an inbound address in **Settings** > **Email address for Safety Data Sheets Updates** (format sds-<identifier>@sds.sdsmanager.com). Received PDFs are imported automatically. Multi-site customers can enable a dedicated address per location and have received SDS added to that location automatically. The address cannot be changed after saving.

Q: My vendor publishes SDS on its website instead of emailing them. Can SDS Manager use that?
A: Yes. Enter the webpage in **Vendor URL for SDS** on **Vendor Contacts**. SDS Manager's crawlers retrieve the SDS from that page and add them to its database.

Q: I sent a request but want to send it again later. How?
A: Open the vendor's message history (eye icon in **Sent Requests**), click the move-back icon on the message and confirm. The SDS return to the request list so you can resend them from **Request Updated SDS**.

Q: What is the Unverified SDS page?
A: It lists SDS that SDS Manager could not verify as current. Add the vendor email and year of purchase, or tick **No longer for sale** for discontinued products, then click the button at the bottom to send the information to the SDS Manager team.

Q: Why don't I see the vendor pages or SDS Quality?
A: They are hidden on trial and Free plans, and they require the Owner or Admin role (SDS Quality also allows Admin Light). Staff, Read only and No Access users do not see them.

Q: What does the SDS Quality score mean?
A: It is an AI score from 0 to 10 for how well the SDS meets your country's requirements: 8+ Pass, 5–7 Conditional Pass, below 5 Fail. Scores are capped (and status set to Fail) when the SDS is older than your age limit or its emergency number is from another country. It is not legal advice.

Q: How many SDS can I quality-check?
A: The app states that Premium includes quality checks for up to 5 SDSs and Pro allows checks on all SDS; a counter shows usage on limited plans. Trial and Free plans have no quality checks. For other plan details, confirm with SDS Manager sales.

Q: A quality check shows Error. What now?
A: The reason is shown under the status (for example **PDF not available** or **Language not supported**). Use **Re-run failed checks** from the run menu or the row's play icon. If the language is acceptable for you, add it under **Accepted SDS languages**.

Q: Our emergency number is a cross-border poison centre and gets flagged. Can we accept it?
A: Yes, if you can edit SDS Quality settings: add the number's prefix (e.g. +49) under **Accepted emergency number prefixes** and click **Save**. Numbers with that prefix are then accepted and the cap is removed.

Q: How do I replace a low-scoring SDS?
A: Click **Find a better SDS for this product** on a flagged row. SDS Manager lists better-scoring SDS for the same product; click **Use this SDS** and confirm the replacement (the current SDS is archived). Then run a quality check on the new SDS if prompted.

Q: What does "Refresh all cached SDS values" do? Does it upgrade my SDS?
A: No. It re-loads newly extracted data for the same SDS version from SDS Manager's database. It does not move you to newer versions; use **SDS where newer version exists** for that.

## Related topics

- **SDS library: substances list, SDS details, stock, archive and export** — Manage SDS Library, SDS Filter, archive, replace, mark product as discontinued
- **Adding, finding and importing SDS (getting SDS into the library)** — uploads, product-list import, Global SDS Search, SDS requests and Pending Tasks details (matching, statuses, assistance from the SDS Manager team, SDS approval queue)
- **Chemical risk assessment, PPE approval, disposal classification and substitution** — risk evaluation when a newer SDS version arrives
- **Job procedures (job hazard analysis, COSHH assessments, 7-point risk assessments) and chemical work instructions** — job procedures / COSHH assessments
- **Login & Account Security, Users, Roles & Permissions, and Organization Settings** — Account settings and email notifications; Settings page
- **Locations, QR codes and employee access to SDS** — locations and location management (location email addresses)
- **Plans, Free Trial, Sign-up, Billing and Subscription** — subscription plans and upgrades
