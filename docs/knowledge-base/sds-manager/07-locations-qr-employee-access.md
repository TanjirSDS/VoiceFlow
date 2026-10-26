# Locations, QR codes and employee access to SDS

> Summary: SDS Manager organises a company's Safety Data Sheet (SDS) library in a location tree (sites, buildings, floors, departments, storage areas), where every location can have any number of sub-locations. Administrators use the **Sites & Locations** page and the **Manage SDS Library** workspace to create, rename, move, archive, restore and delete locations, and to copy or move SDSs and stock amounts between them. Employees who only need to read SDSs do not need user accounts: the **Employee Access** page creates QR posters (and matching intranet links) that open a read-only, mobile-friendly view of the SDSs for one location, several locations or the whole library. Getting locations and QR posters right is what lets workers find the right SDS in seconds during handling, training or an emergency.

## Where to find it

| What | Where in the app | Who sees it |
|---|---|---|
| Location tree page | Left menu **Sites & Locations** (URL path `/locations`). Users who are not Owner or Admin see the same page titled **My locations**. | On Free and Basic plans it is not in the main left menu (it is listed under **More**). On other plans it is in the main menu, except when the account is set up as single-location and has only one location with no sub-locations; then it is also listed under **More**. |
| Location workspace (SDS list per location) | Left menu **Manage SDS Library** → pick a location in the location tree that opens under the menu item. A location's page is at `/location-management/location-detail/<id>`. | Users with access to the Manage SDS Library page. |
| Read-only SDS view per location | Left menu **All my SDSs** (URL path `/my-sds`); picking a location opens `/my-sds/location-detail/<id>`. | Everyone with access, including employees who scanned a QR poster. |
| Add a location from the menu | **Manage SDS Library** → **Add location** (at the bottom of the location tree). | Users allowed to add locations. |
| Archived locations | **Manage SDS Library** → **Archive** → tab **Archived locations**; or **Sites & Locations** → tick **Show archived locations**. | Users allowed to see location filters; the Archive menu item only shows when there is something archived. |
| QR posters / employee access | Left menu **Employee Access** (URL path `/administration/qr-code-management`). On phones it is also a button in the bottom navigation bar. Page heading: **Manage Employee Access**. | Owner and Admin only. |
| Shortcut from a location | On a location's page, the **⋯** (more) button → **Manage QR code access**. | Owner and Admin. |
| SDS binder (PDF) for a location | On a location's page: **Generate SDS Binder** button, or **⋯** → **Generate SDS Binder**. Opens a new tab titled "Location SDS binder". | Users with the binder permission. |
| Related settings | **Settings** page (account menu → **Settings**): "App access for QR users", "Allow employees to request Safety Data Sheets to be added to Safety Data Sheets library", "Employee SDS search". | Owner/Admin (settings page access). |

The **Employee Access** menu item has a tooltip explaining the ways employees can reach SDSs: QR posters, intranet or website links, tablets and kiosks with a bookmarked SDS Manager page, offline access through the app, and the SDS Binder (PDF).

## Plan and permission requirements

**Plans (what the application shows):**

- The **Subscription** page lists "Organize SDS by location", "Access SDS library by scanning QR-code" and "Printing of SDS-binders" among the **Premium** plan features, and "Mobile access for all users" among the **Basic** plan features. The **Free** plan card lists "Employee access" (the Free plan does not allow employee access through QR codes; see "The Free plan" in the topic **Plans, Free Trial, Sign-up, Billing and Subscription**).
- The **Sites & Locations** menu item is hidden from the main menu on Free and Basic plans (it stays reachable under **More**).
- Adding a location is checked against the plan first. If the plan does not include it, the user sees "This action is not available on your current subscription plan". If the plan includes it but the user's role does not, the user sees "This action is not available for your current role".
- QR poster printing, viewing and previewing depend on the account's QR code permission. If the plan does not include it, the **View QR poster** and **Preview** columns are hidden, and some actions open an upgrade ("feature not available") popup instead.
- **Automatic SDS Translation** for QR posters is labelled "(Pro & Enterprise Plans)". On a trial, ticking it shows "Autotranslation is only available on paid Pro/Enterprise plans"; on a plan without it, an upgrade popup opens.
- **IP restrictions** for QR posters are a separate add-on ("IP Restriction" extension). Without it, the IP restrictions action opens a popup with a **Contact Us** button.
- Exact plan limits (for example the number of locations or QR posters allowed) are not specified in the application; confirm with SDS Manager support/sales.

**Roles (what the application enforces in the interface):**

| Action | Who can do it |
|---|---|
| See **Employee Access** in the menu | Owner and Admin (global role). Admin Light, Staff, Read only and No Access users do not get the menu item. |
| Create a QR poster (**Create QR poster** button) | Users with permission to create users (normally Owner/Admin). |
| Choose "Access to all SDSs" vs "Customize access" when creating or editing a QR poster | Owner only. A poster created by an Admin always starts with custom access, and the Admin is taken straight to the location access page. |
| QR User Settings toggles "Allow QR users to print labels", "Allow QR users to add Barcodes to SDS in library", "App access for QR users" | Owner. Admins see them but they are disabled with the tooltip "You do not have permission to perform this action. Only the owner can change this setting." |
| "Amount visibility for users who cannot change it" and "QR user access to label Content Display & Expiration Date" | Owner only (gear button disabled for everyone else). |
| Upload the company logo for the QR poster | Owner only ("Upload your company logo - will show on QR Poster (Owner Only)"). Others see "Please contact the owner to set your company logo." |
| **Permanent Delete** of a QR poster | Owner only. |
| **Add location** button and **Add sub-location** (+) icons on **Sites & Locations** | Owner and Admin. |
| **Move to archive** icon on **Sites & Locations** | Owner and Admin. |
| **Edit location settings** on a location page | Users whose role on that location allows editing the location. |
| **Move location to Archive** and **Add new admin user** on a location page | Owner and Admin who also have that permission on the location. |
| **Archive location** / **Un-archive location** buttons inside **Edit location** | Owner and Admin. |
| **Move SDS** | Users whose role on the location allows moving SDSs. |
| **Copy SDS** | Users allowed to add SDSs that are already in use in the company; only locations where the user is Admin, Admin with approval or Owner are offered (the Owner sees all locations). |
| **Move amount to other location** | Users allowed to store amounts on that location; destinations require an admin role (Admin, Admin with approval or Owner). Not available to QR users. |

Location-level roles (No Access, Staff, Admin Light, Admin, Admin with approval, Read Only for QR posters) are assigned per user on the user's location access page; see the topic **Login & Account Security, Users, Roles & Permissions, and Organization Settings** for the full matrix. Which exact permissions each role has is decided by the system; the interface only shows or hides actions accordingly.

## Location concepts

- **Location**: any place where chemicals are stored or used: a site, building, floor, department, lab, cabinet or storage area. SDSs in the library are always linked to at least one location.
- **Sub-location (child location)**: a location placed under another (the parent). "A location can have any number of sub-locations, so you can create a tree-structure that matches your department and building structure."
- **Top-level location**: a location with **No parent**.
- **Location path**: the full chain of names from the top, shown with slashes, for example `Main site/Building A/Lab 2`. Location search matches any part of this path.
- **SDS count**: the number in brackets after each location name in the trees.
- **Favorite locations / My Location List**: locations you have marked with the heart icon; they get their own **Favorite locations** section in the sidebar tree.
- **Default location**: your personal starting location (yellow star). **Manage SDS Library** opens your default location directly.
- **Archived location**: a location taken out of use. It no longer appears in the active tree but can be restored or permanently deleted.

The on-screen guidance on the **Sites & Locations** page (Owner/Admin) says: "SDS Manager lets you organize Safety Data Sheets to match your organization's structure. You can link SDSs to specific sites, departments, or storage areas and assign admin roles accordingly. For large single-site operations, we recommend creating sub-locations based on where chemicals are stored to make maintenance easier. Employees access SDSs by scanning QR code posters. You can use one QR code for all locations or generate separate codes for specific areas. Employees don't need to know how SDSs are linked—our search makes it easy to find what they need."

## The Sites & Locations page (location tree)

The **Sites & Locations** page (titled **My locations** for users who are not Owner or Admin) shows the whole location tree.

**Header controls**

| Control | What it does |
|---|---|
| Search box ("Search Location") | Type part of any location name or path; pick a result to open that location. |
| Expand/Collapse button (tooltips **Expand** / **Collapse**) | Opens or closes every branch at once. Refused for very large trees (more than 500 rows) with the message "This tree is too large to expand all at once ({count} locations). Open the branches you need instead." |
| **Add location** button | Opens **Create a location** (Owner/Admin only). |

**Columns (desktop)**: location name with SDS count in brackets; **Admin users** (initials of the users with admin roles on that location; hover to see full names); and, for accounts with webshop (eCommerce) settings enabled, a **Webshop** column.

**Icons on each location row (desktop; on phones they are in a ⋮ menu)**

| Icon | Tooltip | Who sees it | What it does |
|---|---|---|---|
| Person with + | **Add new admin user** | Users with an admin role (Admin, Admin with approval, Owner) on that location | Opens the new-user form preset to the Admin role and "Access to location "<name>"". |
| Star | **Set this location as my default** | Shown only on locations in your favorites | Makes it your default location (filled yellow star). |
| Heart | **Add location to 'My Location List'** / **Remove location from 'My Location List'** | Everyone | Adds or removes the location from your favorites. |
| + | **Add sub-location** | Owner and Admin | Opens **Create a location** with this location pre-filled as parent. |
| Archive box | **Move to archive** | Owner and Admin | Asks "Confirm archive location" (OK / Cancel) and archives the location. |
| Checkbox in **Webshop** column | Webshop search status (see below) | Owner/Admin with eCommerce settings, on locations where they have an admin role | Controls whether webshop customers can search the SDSs of the location. |

On phones, the ⋮ menu also shows the admin users' initials (tap to open **List of admin user**) and the webshop setting.

**Clicking a location name** opens it: Owners and Admins go to the location in **Manage SDS Library**; other users go to the location in **All my SDSs**.

**Large trees**: the page first shows 20 top-level locations; a "... Load more (N)" link adds 10 more at a time. Inside a location with many children, the first 100 sub-locations are shown and "... Load more (N)" shows the next 100. A sub-location you have just created always appears, even if it would otherwise be beyond the current page.

**Webshop column (eCommerce accounts)**: tooltips explain each state: "Not set yet — customers can still search this location. Click to set as "Not searchable"." / "Not published — customers cannot search this location. Click to publish." / "Search enabled — customers can search this location. Click to disable search." / "Search disabled — customers cannot search this location. Click to enable search." On desktop, Shift + click applies the change to all sub-locations. See the topic **SDS Distribution for suppliers (eCommerce / DirectSDS), the customer SDS portal, and integrations** for details.

**Archived locations on this page**: when archived locations exist (and you may see location filters), a **Show archived locations** checkbox appears under the tree. Ticking it lists the archived locations with restore and delete icons (see "Archiving, restoring and permanently deleting locations").

If no location exists yet the page says "No locations yet."

## Creating a location or sub-location

1. Open **Sites & Locations** and click **Add location**, or click the **+** (**Add sub-location**) icon on the parent location's row. You can also use **Manage SDS Library** → **Add location** in the sidebar (the location you are currently in is pre-filled as parent), or the **+** next to a location in the sidebar tree.
2. The **Create a location** popup opens.
3. Enter the **Name** (required, up to 255 characters).
4. In **Parent location** ("Search parent location"), choose the parent location, or choose **No parent** to create a top-level location. The **Create** button stays disabled until a parent (or **No parent**) is selected.
5. Optional fields that only appear for some accounts: **SafetyCulture Folder** (when the SafetyCulture integration is set up) and "Make SDS on this location searchable on webshop search" (eCommerce accounts).
6. Click **Create**. You will see "Location added successfully" and the tree refreshes.

Notes:
- If the name is empty you get "Location name can't be empty".
- A new sub-location automatically gets the same user access as its parent location; there is no extra confirmation step.
- If a user (other than the Owner) has access to no location at all, the SDS list shows a warning instead. Users allowed to add locations see: "There are no active locations. To add an SDS, you must add a location where your chemicals are stored. Under Location management, click the "+" icon to add your first location. A location can have any number of sub-locations, so you can create a tree-structure that matches your department and building structure." Users who cannot add locations instead see "Your location list is empty. Try creating a location or contact your Admin for more access."
- When a new account adds its first SDS, a setup popup asks "Do you want to organize SDS by locations where chemicals are stored or used?" with the answers "Yes – I manage chemicals at multiple sites/locations." or "No – I have a small number of chemicals and need a single list." Answering Yes asks for a **Location Name (e.g., Site, Department, or Building)** in addition to the **SDS Library Name (typically your company name)**. The library name "will show on QR posters you generate".

## Editing a location (Edit location settings)

1. Open the location (from **Sites & Locations**, the sidebar tree, or **Manage SDS Library**).
2. Click the **⋯** (more) button at the top right of the location's SDS list and choose **Edit location settings**.
3. The **Edit location** popup opens. Change what you need and click **Save**. Success message: "Information saved successfully".

**Fields in Edit location**

| Field | What it does |
|---|---|
| **Location Name** | The location's name (required, max 255 characters). Empty name gives "Location name can't be empty". |
| **Parent location** | Moves the location (with its sub-locations) under another parent; choose **No parent** to make it top-level. |
| **Responsible** | One or more users responsible for the location, or "No responsible person". You cannot mix "No responsible person" with named users. Responsible persons appear as avatars at the top of the location's page. |
| **SafetyCulture Folder** (+ sync icon) | Only with the SafetyCulture integration. The sync icon asks "Confirm to synchronize all SDSs from this location to the selected SafetyCulture folder?" and reports "Synced successfully" or "Synced failed". |
| **Display contact information for each responsible person** | When ticked, clicking a responsible person's avatar on the location page opens their contact card. |
| **Notify on any changes or new attachments to email addresses:** | Sends change notifications by email. When ticked you can set "All changes will be summarized and sent to emails after: [n] minute(s)" (1–180 minutes, default 5) and, if the location has sub-locations, an **Include sub-locations** switch. |
| **Receive daily summary** | Sends a daily summary email of changes. |
| Email address field | Appears when either option above is ticked. Its label reads "Send change notifications to:", "Send daily summary to:" or "Send change notifications and daily summary to:". Enter email addresses separated by commas. Required ("Email is required"); invalid addresses give "You have entered an invalid email address". |
| **Make SDS on this location searchable on webshop search** | eCommerce accounts only. |

Buttons at the bottom: **Archive location** (or **Un-archive location** for an archived location), visible to Owner and Admin, and **Save**.

## Moving a location in the tree

There is no drag-and-drop in the location tree. To move a location (and everything under it) to a new parent:

1. Open the location and choose **⋯** → **Edit location settings**.
2. In **Parent location**, search for and pick the new parent, or pick **No parent** to make it a top-level location.
3. Click **Save**.

## Favorite locations and your default location

- Click the heart icon (**Add location to 'My Location List'**) on any location in **Sites & Locations** or the sidebar tree to add it to your favorites. Click again (**Remove location from 'My Location List'**) to remove it.
- When you have favorites, the location tree under **Manage SDS Library** / **All my SDSs** in the sidebar is split into two collapsible sections: **Favorite locations** and **All Locations**.
- In your favorites, click the star (**Set this location as my default**) to make a location your default. The default location shows a filled yellow star and is listed first among favorites. On **Sites & Locations** the star icon only appears on favorite locations.
- When you click **Manage SDS Library** in the sidebar from another part of the app, it opens your default location directly (if you have one); otherwise it opens the whole library. Opening **Manage SDS Library** without a location also jumps to your default location when you are Admin, Admin with approval or Staff on it.
- Favorites and the default location are personal to each user.
- Separately, when adding several SDSs, the location picker offers "Set the selected location as the default to streamline adding SDSs" under the heading "Adding multiple Safety Data Sheets?". That remembers where new SDSs are added ("The next Safety Data Sheet you add will be assigned to the location shown here. To change it, click the "x" - you'll be prompted to select a new location when adding your next SDS.") and is a different setting from the starred default location.

## Navigating locations in the sidebar

- Expanding **Manage SDS Library** (for administrators) or **All my SDSs** shows the location tree inside the sidebar, with SDS counts. The currently open location is highlighted and its branch is expanded automatically.
- Hover over a location to see its full name, the **Add sub-location** (+) icon (administrators) and the heart (favorites) icon.
- Location names in the sidebar tree are real links: right-click → "Open in new tab", Ctrl/Cmd + click, Shift + click or middle-click opens the location in a new browser tab. A normal click opens it in the same tab. The same works for main sidebar menu items that lead straight to a page (not for items that only expand a sub-menu).
- At the bottom of the **Manage SDS Library** tree are extra items: **Add location**, **Import status** (only after an import), **SDS Tasks** (when there are open tasks), **Close match approval** (when there are items) and **Archive** (when there is something archived).

## The location page (SDS list for one location)

When you open a location you see the SDS list for that location (the list itself, its columns and filters are covered in the topic **SDS library: substances list, SDS details, stock, archive and export**). Location-specific elements:

- **Breadcrumb** at the top left: "SDS Library for <company name>" › top-level location › … › parent › current location. Click any earlier crumb to jump to that location. When the path is long, the middle is collapsed into "..." (button "Show more locations"). A button next to the breadcrumb ("Show sub-locations") opens a small tree of the current location's sub-locations so you can jump down. On the all-locations view, the company logo is shown instead when one has been uploaded.
- **Include sub-locations** switch: only shown when the location has sub-locations. When on, the list also shows SDSs on all sub-locations; when off, only SDSs linked directly to this location.
- **Responsible persons**: avatars of the location's responsible users. If "Display contact information for each responsible person" is ticked, clicking an avatar opens the person's contact card.
- **Child locations**: if the location has no SDSs of its own but has sub-locations, a **Child locations** list is shown with each sub-location's name and SDS count; click one to open it.
- **Email to this location**: for accounts with dedicated site emails enabled, Owners/Admins see an email address for the location. The tooltip says vendors can email updated SDSs to it and SDS Manager imports them automatically (see the topic **Keeping SDS up to date: newer versions, SDS update requests to vendors, vendor inbox and SDS Quality**).
- A dismissible tip "See our guide on how to perform maintenance and management of your SDS library" links to the help center.
- If the location is empty and you can add SDSs, an **Add Safety Data Sheet** button is shown. If you cannot add SDSs but SDS requests are allowed, a **Request Safety Data Sheet to be added to company library** button is shown instead. If neither applies: "You currently do not have access to any SDS".

**The ⋯ (more) menu on a location page**

| Menu item | Tooltip / notes |
|---|---|
| **Edit location settings** | Tooltip "Edit location". Opens the **Edit location** popup. |
| **Manage QR code access** | Opens the **Employee Access** page. Owner/Admin only. |
| **Generate SDS Binder** | Tooltip "An SDS Binder is a PDF file that contain all SDSs". See "SDS binder for a location". |
| **Export SDS information to Excel file** | Tooltip "Any columns you choose to display on the Custom Fields tab will be included in the exported file". Prepared in the background; a progress popup lets you download the Excel file when ready. Disabled while an export is still being built. |
| **Import SDS files** | Tooltip "If you already have SDS files for chemicals, zip the files and import the files to SDS Manager". Owner/Admin. See the topic **Adding, finding and importing SDS (getting SDS into the library)**. |
| **Move location to Archive** | Asks "Confirm archive location". Hidden if the location is already archived. Owner/Admin. |
| **Add new admin user** | Opens the new-user form preset to this location. Owner/Admin. |

On the **All my SDSs** view (no specific location selected), the ⋯ menu only offers the items that make sense for the whole library (for example **Manage QR code access**, **Generate SDS Binder** for the whole library, and **Import SDS files**).

If you open a location you do not have a role on, you are sent back to the overview. If you open an archived location, you see "This location has been archived" with an **OK** button that takes you back to **Manage SDS Library**.

## Archiving, restoring and permanently deleting locations

**Archive a location** (Owner/Admin):
- **Sites & Locations** → archive icon (**Move to archive**) on the row → **OK**; or
- Location page → **⋯** → **Move location to Archive** → **OK**; or
- **Edit location** → **Archive location** → **OK**.
The confirmation title is "Confirm archive location" and the success message is "Location archived successfully".

**Restore (un-archive) a location**:
- **Sites & Locations** → tick **Show archived locations** → click the restore icon (tooltip **Un-archive location**) → confirm "Confirm un-archive location" → **OK**; or
- **Manage SDS Library** → **Archive** → tab **Archived locations** → restore icon; or
- Open the archived location's **Edit location** popup → **Un-archive location**.
Success message: "Un-archive location successfully".

**Permanently delete a location**:
1. The location must be archived first. The delete icon only appears on archived locations that have no sub-locations.
2. Click the delete (bin) icon. Its tooltip warns: "Permanently delete location and SDS on the location. If the same SDS is in use on any other locations, they will remain on the other location."
3. Confirm the first popup **Confirm delete location**: "Confirm that you will permanently delete location and SDS linked to the location" → **OK**.
4. A second confirmation appears: "This process cannot be undone. Confirm one more time that you want to delete the location" → **OK**.
5. Success message: "Successfully".

**Archive page, Archived locations tab**: lists archived locations with their SDS counts (the count is omitted when zero). Each row has delete (when no sub-locations), restore and, when there are archived SDSs, a **View SDSs** icon that switches to the **Archived SDSs** tab filtered to that location. If nothing is archived: "No locations are archived". The other tabs on the Archive page (**Archived SDSs**, **Replaced by newer version**, **Archived SDS Requests**) are described in "Archive page" in the topic **SDS library: substances list, SDS details, stock, archive and export**.

## Copying and moving SDSs between locations

Both actions are in the **⋯** menu on an SDS row in a location's SDS list (and in the SDS list views covered by the topic **SDS library: substances list, SDS details, stock, archive and export**). They are only offered for SDS rows that have an SDS document.

**Copy SDS** (the same SDS used in more locations):
1. On the SDS row, open the row menu and choose **Copy SDS**.
2. In **Select location to add Safety Data Sheet**, tick one or more locations. You can search, and tick **Apply to all sub-locations** to include all children of a ticked location. Only locations where you are Admin, Admin with approval or Owner are listed (the Owner sees all locations).
3. Optional: tick "Move all updated data from the current SDS to the copied version in the destination location. (This includes attachments, edited information, EAN/UPC numbers, information message, and Risk Evaluations.)"
4. If your account requires an external system ID, you must fill it ("Please enter our ERP ID" if missing).
5. Click **Add**. A result popup lists which locations succeeded and which failed.

**Move SDS** (take an SDS away from one location and put it on another):
1. On the SDS row, choose **Move SDS**. If the same product is used on several locations in the current view, first choose which one in the **Select location** list.
2. The **Move substance to location** popup shows the **Product** and current **Location**. Search for and pick the destination location.
3. Click **Move**. Success message: "Move SDS successfully". If no destination was chosen: "Please select a location where the product is used".

Bulk copy and bulk move of many SDSs at once are available from the bulk-action options in the SDS list views (see the topic **SDS library: substances list, SDS details, stock, archive and export**).

## Moving an amount (quantity) to another location

For accounts that track amounts (inventory), part of the stored amount of a product can be moved to another location:

1. On the SDS row, choose **Move amount to other location** (only shown when the product has a stored amount greater than 0; not shown to QR users). If the product is used on several locations, first pick which one.
2. The **Move amount to other location** popup shows **Product**, **Location** and the **Remaining stored amount**.
3. Under **Move to other location**, pick the destination in the location tree. Only locations where you have an admin role can be picked; others show "This location requires admin privileges".
4. Choose the **Measurement Type** (Weight / Volume) and **Measurement unit**, enter **Amount move**, and write a **Comment** (required).
5. Click **Move**. Success: "Successfully moved product amount". **Show change log** opens the amount history.

Validation messages: "Please select a location", "You cannot select the current location as a destination", "Amount can't be empty", "Amount can't be less than 0", "Moved amount cannot be greater than current stored amount", "Comment can't be empty". If the plan does not include amounts: "This action is not available on your current subscription plan"; if your role does not: "This action is not available for your current role".

## SDS binder for a location

An SDS binder is a single PDF containing the SDSs of a location (or the whole library).

1. Open the location and click **Generate SDS Binder** (or **⋯** → **Generate SDS Binder**). On **All my SDSs** without a location, the binder covers your whole library.
2. If the location has sub-locations and **Include sub-locations** is off, a popup explains: "To include SDSs on sub locations in the SDS binder, set "Include sub-locations" to the "On" position". Choose **Go back** to change the switch or **Continue** to make a binder of this location only.
3. A new tab "Print binder" opens. The binder follows the filters currently applied to the SDS list. If those filters cannot be read: "The selected filters could not be read, so this binder covers your full SDS library. Reopen it from the SDS list to apply filters."
4. Small binders show a progress bar (%) and then the PDF (on phones, an **Open PDF** button).
5. Large binders are built in the background: "Your binder is being generated in the background. We'll email you a download link when it's ready — feel free to close this tab." Status lines: "Queued — your binder will start generating shortly." / "Generating your binder — this may take a few minutes."
6. If the same binder was already being built: "Your binder is already being prepared from a previous request." If a recent binder is still available: "Your previous binder is still ready for download." with **Open binder** and **Regenerate binder** buttons.
7. Errors: "Generate binder fail" (with a **Refresh** button to retry) and "This binder link has expired. Please regenerate the binder."

## Location roles and access (overview)

- Every user (except the Owner, who has access to all locations) has a role per location: **No Access**, **Staff**, **Admin Light**, **Admin** or **Admin with approval**. QR poster users only have **Read Only** or **No Access** per location.
- Roles are set on the user's location access page (**User management** → user → **Edit location access**). Giving a location a role also gives the same role on all its sub-locations. Setting a location to **No Access** does not overwrite roles you granted individually on its sub-locations.
- The **Admin users** column on **Sites & Locations** shows who administers each location, and **Add new admin user** (on a location row or in a location's ⋯ menu) creates a user with an admin role on that location.
- See the topic **Login & Account Security, Users, Roles & Permissions, and Organization Settings** for what each role can do.

## Employee Access page (QR code management)

**Employee Access** (heading **Manage Employee Access**) is where Owners and Admins give employees password-free, read-only access to the SDS library. Each QR poster is a shared, password-less "QR-login user". Anyone who scans the poster or opens its link gets read-only access to the SDSs that poster is allowed to show.

The page explains (section **Mobile Access to Safety Data Sheets Using QR Codes**): "QR codes provide chemical users with immediate, read-only access to Safety Data Sheets (SDSs) by scanning with any mobile phone or clicking a link from your organization's intranet. … They can find SDSs by searching for parts of the product name and/or supplier name. You can create multiple "QR code users"—for example, one per location—or use a single QR code that grants access to all SDSs in your company's SDS library." It also recommends posting QR posters in all areas where chemicals are used.

**Table of QR posters** (search box "Search for QR poster", filter **User Status**: All / Active / Deactivated, default Active, 10 rows per page):

| Column | Meaning |
|---|---|
| **Name** | The poster's name (the text printed under the QR code). |
| **Language** | The poster's language (also the interface language for people who scan it). |
| **Access to all SDSs** | Green = the poster gives access to all SDSs; otherwise it uses custom (location-limited) access. |
| **View QR poster** | QR icon: click to open the poster. Tooltip **Enabled**; a red icon (tooltip **Disabled**) means QR sign-in is off for that user and clicking offers to allow it. |
| **Preview** | Eye icon: "Click on this icon to see how your employees will see your Safety Data Sheet library." Opens the employee view in a small window. |
| **Status** | **Active** or **Deactivated**. |

Clicking a row opens the poster. A dismissible info box says: "Click the QR poster below to print QR poster, get URL to add to your corporate intranet or see a suggested go-live email you can send to your organization." Rows show the tooltip "Click to print a QR code, or to get the URL to access the SDS library from your intranet". Clicking a deactivated row shows "User has been deactivated".

**Settings panel** (right side on desktop; at the top on phones) contains: **QR User Settings** toggles (see "QR User Settings"), **Company logo on the QR poster** (only until a logo is uploaded), **Adding Admin Users**, **Multi-Site Support**, **Add SDS Library Link to Your Intranet**, **Email Access Link to Employees**, and expandable sections **Multi-Language Workplaces**, **Automatic SDS Translation (Pro & Enterprise Plans)**, **IP restrictions** and **Single Sign-On (SSO)**.

Guidance shown in the panel:
- **Adding Admin Users**: admin users are added from **User management**. "While it's also possible to add read-only users, we generally recommend using QR code access for read-only access to Safety Data Sheets. However, if you're using the inventory tracking module, individual user accounts are required for employees who log chemical receipt, usage, or disposal."
- **Multi-Site Support**: "If your organization operates across multiple locations, you can generate a unique QR poster for each site. Each poster can be configured to only show Safety Data Sheets (SDSs) relevant to that location."
- **Single Sign-On (SSO)**: SDS Manager supports SSO; some customers restrict QR access to devices authenticated via their domain/Active Directory, which is more secure but more restrictive. Usually only administrators need individual accounts; with inventory tracking, every employee recording arrival, usage or disposal needs an account, and SSO creates accounts automatically at first login. "Contact us to set up SSO for your organization."

## Creating a QR poster

1. Go to **Employee Access** and click **Create QR poster**.
2. The **Add QR-login user** popup opens:
   - **Name**: pre-filled with "All Our SDS" in the chosen language; change it to describe the poster (for example the site or department). Empty name gives "Full name cannot be empty".
   - **Language**: the poster language and the interface language for people who scan it.
   - **Measurement system**: US or Metric.
   - **Allow SDS Request creation**: only shown when the account setting for employee SDS requests is on (it is then switched on by default). Lets people using this poster request missing SDSs.
   - Access radio buttons (Owner only): **Access to all SDSs** ("This option will give the QR code access to all active SDS on all locations in your library.") or **Customize access** ("Use this option if you have multiple locations and only want this QR code to give access to one or a few of them."). If the account has more than one location the Owner must pick one ("Please select user access to SDSs"); with a single location it defaults to all SDSs.
3. Click **Create**. Message: "New QR-login user created successfully".
4. With **Access to all SDSs** the poster is ready and appears in the table. With **Customize access** (or when an Admin creates the poster) you are taken to the **User location access** page to pick the locations (see "Choosing which SDSs a QR poster shows").

**Edit a poster**: row menu → **Edit QR poster** opens **Edit QR-login user** with Name, Language, Measurement system and (Owner only) the access radio buttons → **OK**. Message: "Edit QR-login user successfully". The SDS-request permission is not edited here; use **Allow SDS Request creation** in QR User Settings.

## The QR poster popup (Login QR Code): printing and sharing

Open it from **View QR poster** (row menu), by clicking the row or the QR icon, or from a location's ⋯ → **Manage QR code access**. The popup title is **Login QR Code**.

**Two designs** are shown side by side; click one to select it (the poster is selected by default):
- **Card**: company logo (or the SDS Manager logo), "Scan QR code to access SDS Library", the QR code, the poster name and "Printed date".
- **Poster**: "SCAN TO ACCESS SAFETY DATA SHEETS", the QR code with the poster name and company logo, "SAFETY INFO" and "Printed date".

The printed date uses MM/dd/yyyy for US and Canadian accounts and dd/MM/yyyy otherwise. All poster text is printed in the poster's language.

When **App access for QR users** is on, both designs also carry a small QR code in the lower-left corner labelled "DOWNLOAD THE APP" with Google Play and App Store badges. That small code opens a page that sends the phone to the right app store ("Redirecting to app store...").

Under the selected design:
- **Print QR poster** prints it.
- **Preview SDS library for this code** opens the employee view in a small window.

**Settings in the popup** (scroll down; an arrow button scrolls for you):
- **Poster Label**: the name or description printed on the poster (saved automatically). "Specify the name or description that appears on the QR poster (e.g., your organization's name or the specific site/department). This helps employees easily identify the SDS library they are accessing."
- **Company logo on the QR poster**: upload (Owner only); shown only while no logo is set.
- **Multi-Site Support**: shows "Current access setting: Access to all SDSs" or "Custom access" with an **Edit location access** link (hidden on accounts set up as single-location).
- **Add SDS Library Link to Your Intranet**: "Click here to copy the access URL to your clipboard." → "URL for intranet access copied".
- **Email Access Link to Employees**: "Click to preview and send email" opens a pre-written email (see "Intranet link and go-live email").
- **Multi-Language Workplaces**: "Current language setting:" with a language picker that changes this poster's language. Only languages fully supported by the interface are offered.
- **Automatic SDS Translation (Pro & Enterprise Plans)**: checkbox **Enable automatic translation for this QR poster**.
- **IP restrictions**: information and "Contact us about pricing for using such IP limitations."

**Print without opening the popup**: row menu → **Print QR poster** opens the popup and starts printing the poster design automatically.

**Shortcut pages**: the link "print QR poster" in the info box opens a page (titled "QR poster") that asks you to **Select QR code** and then opens the poster popup. With only one poster it opens directly; with none it says "No QR-codes are created." with "Click here to create QR code". A similar page opens the suggested go-live email.

## Choosing which SDSs a QR poster shows

A QR poster can show either all active SDSs in the library or only those on selected locations.

1. On **Employee Access**, open the row menu → **Edit location access** (or **Edit location access** in the QR poster popup).
2. The **User location access** page shows "Define which Safety Data Sheets this QR code will give access to. You can create multiple QR codes if you have organized your Safety Data Sheets by locations."
3. For a QR poster you can set:
   - **Language** and **Measurement system** for the poster.
   - **Access setting** (Owner only): **Access to all SDSs** or **Customize access**.
   - **Only access SDS with selected language**: show only SDSs in the poster's language. Without it, SDSs in all available languages are shown.
   - **Advanced access** (only with Customize access): "Enhance the QR code feature to allow users to access SDS that match selected custom field values." Custom fields must first be set up under **Manage SDS Library > Personalized View**. The button shows how many custom-field rules are set.
   - The location tree: for each location choose **Read Only** or **No Access**. A role given to a location also applies to its sub-locations.
4. Click **Save**. Message: "Access changed successfully". You return to **Employee Access** and the poster popup opens so you can print it.

**Hiding individual SDSs**: if only a few SDSs are sensitive, use **Hide from Non-admin** in the SDS row menu instead of restricting the whole library (the IP-restriction tip recommends this). **Show for all roles** reverses it.

## Row actions on the Employee Access page

| Action | When shown | What it does |
|---|---|---|
| **View QR poster** | Active posters | Opens the Login QR Code popup. |
| **Edit QR poster** | Posters | Edit name, language, measurement system, access (Owner). |
| **Print QR poster** | Active posters | Opens the popup and prints the poster design. |
| **URL for intranet access** | Active posters | Copies the poster's access link ("URL for intranet access copied"). |
| **IP restrictions** | Active posters | Opens **Set IP Restriction** (requires the IP Restriction add-on). |
| **Edit location access** | Active posters | Opens the User location access page. |
| **Show go-live email suggestion** | Active posters | Opens the pre-written email to employees. |
| **Deactivate QR poster** / **Activate QR poster** | Owner/Admin | Turns the poster's access off or back on ("Confirm to deactivate user" / "Confirm Activate"). Messages "User successfully deactivated" / "User activated successfully". |
| **Permanent Delete** | Owner only | "Are you sure you want to permanently delete this user? This action cannot be undone." → "User permanently deleted". |
| **Revert to regular user** | Only users that were converted from a regular account | See "Converting a regular user to QR login and back". |

Actions are available to Owners and Admins (some Owner-only as noted). Some actions also need the account's QR code permission; if the plan lacks it, an upgrade popup opens.

## QR User Settings

These account-wide settings are in the **Settings** panel on **Employee Access** under **QR User Settings**. Changes save immediately ("Enabled" / "Disabled").

| Setting | What it does | Who can change |
|---|---|---|
| **Allow QR users to print labels** | Lets people using a QR poster print labels. When off, the print-label button is greyed out with "Permission for this action has not been granted to QR users by the Owner", and clicking shows "This action is not allowed. Please contact your administrator." Default on. | Owner |
| **Allow QR users to add Barcodes to SDS in library** | Lets QR users link EAN/UPC barcodes to SDSs in the library. Default off. | Owner |
| **App access for QR users** | "By default, anyone with access to your QR code poster can scan it and use the app to download all SDSs linked to that QR code. If you prefer to keep the list of chemicals your company uses confidential, you can disable this access. When disabled, only users who log in with their email and password can access SDSs via the app." Also controls whether the small "DOWNLOAD THE APP" code is printed on posters. Same setting as on the **Settings** page. | Owner |
| **Amount visibility for users who cannot change it** | Off / Amount only / Amount and change log (see "Amount visibility setting"). Current value shown next to a gear button. | Owner only |
| **QR user access to label Content Display & Expiration Date** | Per-label-field access for QR users (see "QR user label access setting"). Gear button. | Owner only |
| **Allow SDS Request creation** | Gear button opening a list of QR posters to grant or remove SDS-request permission. Only shown when employee SDS requests are allowed in **Settings**. | Owner/Admin |

## Amount visibility setting

Dialog title **Amount visibility**. "Applies to every user who may view a substance amount but not change it, including users who scan a container QR code. Editing the amount always stays with users who have permission to change it."

| Option | Meaning |
|---|---|
| **Off** | No amount and no change log. |
| **Amount only** | Current balance, read-only. |
| **Amount and change log** | Also lets them open the amount change log, read-only. |

Save shows "Amount visibility updated". Users with permission to change amounts on a location always see and edit amounts there. A read-only viewer of the change log sees "Showing the {count} most recent changes." when the log is shortened.

## QR user label access setting

Dialog title **QR user access to label Content Display & Expiration Date**. For each label field you choose:
- **Disable**: "QR users cannot see the Content Display and Expiration Date sections when printing labels".
- **Show/hide only**: "QR users can show or hide fields and fill in the expiration date, but cannot edit field values".
- **Editable**: "QR users have full access to edit the Content Display and Expiration Date settings".

Fields listed: Company logo, PPE symbols, Icon captions, NFPA, HMIS, SDS QR on Label, Ingredients on Label, Custom information message, Pictograms, Signal word, Supplier name, Address, Emergency phone, Emergency contact, UFI number, REACH registration number, Supplemental information (EUH), Top color bar, GHS pictograms, Expiration Date. **Editable** is only offered for Custom information message, Top color bar and Expiration Date. Fields the Owner has never configured keep the most open option available for that field (Editable where offered, otherwise Show/hide only). Save shows "QR user label access setting updated". Label printing itself is covered in the topic **Labels, labelling compliance, kits and usage tracking**.

## Allowing employees to request missing SDSs

Two settings must both be on for people using a QR poster to request SDSs:

1. **Account setting** (Settings page): "Allow employees to request Safety Data Sheets to be added to Safety Data Sheets library". Its description: "Lets anyone who scans a QR code poster request that a Safety Data Sheet be added to your company library. No login is required — the person simply enters their email address to identify themselves. … When ON, a "Request SDS" option appears after scanning a QR poster, and a plus sign appears on global search results, allowing anyone to submit a request with their email. When OFF, only logged-in users with the appropriate role can add SDSs."
2. **Per poster**: **Allow SDS Request creation**, set when creating the poster or later via QR User Settings → **Allow SDS Request creation** (gear). The popup lists posters under **Enabled** and **Disabled** with a search box; click to move a poster between them ("SDS Request permission updated" / "Failed to update SDS Request permission"; "No QR users available" if there are none).

For regular users (not QR posters) only the account setting applies.

When both are on, people using the poster see **SDS requests** in the sidebar, and after a search with no match: "Not finding the SDS in above list?" with **Request Safety Data Sheet for this product to be added to our SDS Library**. The request form ("Add request for Safety Data Sheet") asks for **Product Name**, **Place of purchase**, **My email address**, the SDS language and the **Location** (all marked required; the location field is hidden when the poster only covers one location), plus optional supplier name, product code, purchase year and EAN/UPC codes. Handling requests is covered in the topic **Adding, finding and importing SDS (getting SDS into the library)**.

The related setting "Employee SDS search: Show search result from global database if SDS is not found in Company SDS library" lets employees see matches from SDS Manager's global database alongside the company library; with requests on, they can click the plus sign on a global result to request it.

## IP restrictions for QR posters

"SDS Manager allows you to restrict access to your SDS library based on IP addresses or IP ranges. This means that only users connected to your organization's network (or approved networks) will be able to view the Safety Data Sheets." The app warns that this "can make it harder for employees to access safety information when they are off-site or using mobile data."

1. Row menu → **IP restrictions** (Owner/Admin). The **Set IP Restriction** button inside the poster's QR code popup works only for the Owner; other users see it disabled with the tooltip "Contact owner". Without the IP Restriction add-on, a popup with **Contact Us** opens instead.
2. In **Set IP Restriction**, add **Allowed IPs**: "Enter the IP address in IPv4 format (x.x.x.x or x.x.x.x/y) or IPv6 format (x:x:x:x:x:x:x:x or x:x:x:x:x:x:x:x/y)". Each address becomes a chip you can remove.
3. Click **Enable IP Restriction**, **Disable IP Restriction** or **Save**. Success: "Successfully set IP Restriction for QR-login user."
4. **View change log** shows the **IP Restriction Change Log** (updated by, previous IPs, new IPs, date) or "No change logs".

Errors: "Allowed IPs cannot be empty", "You have entered an invalid IP address or an invalid IP network", "<ip> has already been added."

## Automatic SDS translation for QR posters

"Enable automatic translation of SDS content for users who access the SDS in a different language than the original document. For example, if a user scans a Spanish QR poster and views an English SDS, SDS Manager can automatically translate key sections like First Aid, Firefighting Measures, and Accidental Release Measures into Spanish."

- Turn it on per poster in the QR poster popup: **Enable automatic translation for this QR poster**.
- Paid Pro and Enterprise plans only. On a trial: "Autotranslation is only available on paid Pro/Enterprise plans". On other plans an upgrade popup opens.
- Disclaimer shown in the app: "This is an automated translation provided for informational purposes only. It is not a certified or regulatory-approved translation. No safety decisions or risk assessments should be made based solely on the translated content."
- Limitation shown in the app: it "cannot be used to translate SDSs into your own country's primary language" (for example a Spanish company cannot rely on it to translate English SDSs into Spanish); it is meant for employees who need language support.

## Converting a regular user to QR login and back

**Convert** (User Management, for active users with the Staff role):
1. On **User management**, open the Staff user's row menu → **Allow user to sign in using a QR code** (or click the grey QR icon in the **QR login** column).
2. The popup "Allow user to sign in using QR code" lists what happens: all location access of this user is reduced to "Read only"; the user can no longer get "Admin" access on locations; "The user will move from User management to Employee Access."; "A passwordless login link and QR poster will be created. Anyone who has them can sign in as this user."; "You can turn the user back into a regular user later in Employee Access with "Revert to regular user". Their location roles will stay Read only."
3. Click **OK**. The QR poster popup opens.

**Revert** (Employee Access, Owner/Admin, only for converted users; posters created as QR posters cannot be reverted):
1. Row menu → **Revert to regular user**.
2. The popup "Revert to regular user?" explains: "The user moves back to User management with the "Access to all SDSs" setting they had before. Location roles are not restored: they stay Read only, so set the roles the user needs afterwards." / "Every QR code, poster and login link for this user stops working." / "Every device signed in with this user's QR code is signed out. Their other sessions are not affected." / "The user must sign in with their own email and password." / "Old QR codes and links cannot be reactivated. Turning on QR login again creates new ones."
3. Confirm with **Revert to regular user**. Message: "The user is a regular user again. Set their location roles in User management."

## Intranet link and go-live email

- **Intranet link**: every poster has an access URL that works exactly like scanning the poster. Copy it with the row action **URL for intranet access** or "Click here to copy the access URL to your clipboard." in the poster popup, and put it on your intranet, a website, or a bookmarked tablet/kiosk. Anyone who opens the link gets the poster's read-only access.
- **Go-live email**: **Show go-live email suggestion** (row menu) or "Click to preview and send email" opens **Preview info email** with a pre-written subject and message about how to access the SDS library. Add recipients (To and Cc), edit the text and click **Send** ("Message is sent"). The app recommends: "We recommend sending the email to yourself first, then forwarding it to your team to avoid spam filtering issues." During a free trial **Send** is disabled with "This function is not available in the free trial".

## What employees see when they scan a QR poster

1. The employee scans the large QR code with any phone camera (or opens the intranet link). No app, password or account is needed ("No app or password needed.").
2. SDS Manager signs them in as the poster's read-only QR user and opens **All my SDSs** (the page title shows "SDS Library for <company name>").
3. They see only the SDSs the poster allows (all, or the poster's locations; optionally only the poster's language; never SDSs hidden from non-admins). They can search by part of the product name and/or supplier name, browse by location in the sidebar tree, and open each SDS, its safety information and PDF. The admin guidance describes the page as "fully mobile friendly" with one-click access to First Aid, Fire and Accidental release information.
4. The interface is shown in the poster's language. Amounts follow the poster's measurement system and the account's amount-visibility setting.
5. The footer shows the emergency agency name and a tap-to-call phone number (the account's emergency number or the country's emergency agency).
6. The menu is reduced: no dashboard and no administration pages; the account menu only offers **Logout**. Depending on settings they may see **SDS requests**, **Global SDS Search**, label printing and barcode linking.
7. An **Admin** item at the bottom of the sidebar explains: "This is a read-only account. To perform administrative tasks, please log out (click here or top right corner) and sign in with an Admin account". Clicking it opens "Read-only account reminder" with **Logout**.

**How the sign-in works**: newer posters contain a short code (easier to scan at small print sizes); older posters contain a longer link, and both keep working. Scanning creates a temporary session (about one day long; the length is not shown on screen); when it ends, scanning the poster again starts a new one. If the browser is already signed in with a regular account, that sign-in is kept and the QR session is used in the current browser session. If the library cannot be loaded for a moment the employee sees "Could not load your SDS library right now. Please try again, or re-scan the QR code." instead of being logged out.

**When a poster no longer works**, the employee lands on the login page with a reason, for example "This QR code is no longer valid. Ask your administrator for a new QR code." (deactivated, reverted or invalid poster), "This account has been deactivated. Please contact support for assistance.", "Too many requests. Please try again later." or "Oops! Something went wrong. Cannot reach the server. Please try again later."

**Preview before printing**: administrators can see exactly what employees will see with **Preview** (eye icon) or **Preview SDS library for this code**.

## Mobile app and offline access

- Using the app is optional: "Use of the SDS Manager app is optional - employees can access the SDSs directly via the browser without installing any app."
- Posters carry a small QR code in the lower-left corner that sends the phone to the App Store or Google Play (printed only when **App access for QR users** is on). "If the app is installed, scanning the large QR code with the app will download the linked SDSs to the user's device for offline access."
- To keep your chemical list confidential, turn **App access for QR users** off (Employee Access → QR User Settings, or the **Settings** page). Then only users who log in with email and password can access SDSs via the app.
- A separate **Scan QR code to log in** page in the web app opens the device camera and only accepts SDS Manager poster codes ("QR code rejected: only same-origin login URLs are allowed." otherwise).
- Store links and offline download from **All my SDSs** are described in "Mobile app and offline access" in the topic **SDS Manager: product overview, navigation, Dashboard and getting started**.

## Public pages opened from QR codes

Besides poster QR codes, SDS Manager QR codes and links can open these pages:

- **Safety information summary** (from QR codes on secondary-container labels): opens without login. Title "Safety information summary" with a language selector. It shows the sections the company saved for its summaries (for example General Information, GHS Information, Hazard statements, Precautionary statements, EUH-statements, SDS sections 2, 4, 5, 6, 7 and 8, Company Information and Personal protective equipment). Viewers cannot save changes; on phones a **PDF** download button is shown. Content is described in "SDS details page" in the topic **SDS library: substances list, SDS details, stock, archive and export**.
- **SDS document viewer** (title "Safety data sheet"): shows an SDS PDF. On phones and iPads the pages are shown one below the other with a download button at the top; on computers the PDF is shown in a built-in viewer.

## Rules, limits and edge cases

- Location names can be up to 255 characters and cannot be empty.
- A new location must have a parent or explicitly **No parent**.
- Moving a location = changing its **Parent location** in **Edit location**; its sub-locations move with it.
- Only archived locations without sub-locations can be permanently deleted, after two confirmations. SDSs that are also used on other locations stay on those locations.
- Archived locations cannot be opened ("This location has been archived").
- The Owner has access to every location. Other users need a role on a location to open it.
- New sub-locations automatically inherit the parent's user access.
- Favorites and the default location are personal. The default star only shows on favorites on **Sites & Locations**.
- Expand-all is refused above 500 rows. Top-level locations load 20 at a time (+10 per "Load more"); sub-locations 100 at a time.
- **Copy SDS** destinations are limited to locations where you are Admin, Admin with approval or Owner.
- **Move amount** destinations must be locations where you have an admin role; you cannot move to the current location or more than the stored amount; a comment is required. QR users cannot move amounts.
- The binder respects **Include sub-locations** and the current SDS list filters.
- Location changes (create, archive, restore, delete) refresh the trees immediately.
- QR posters: per-location roles are only **Read Only** or **No Access**.
- Only the Owner can choose **Access to all SDSs** for a poster; Admins always configure location access.
- QR User Settings toggles are Owner-only; Admins see them disabled.
- SDS requests from QR users need both the account setting and the per-poster permission.
- Reverting a converted QR user keeps location roles at Read only; old QR codes and links stop working permanently.
- Posters created directly as QR posters cannot be reverted to regular users.
- Old printed posters (long-link format) keep working; deactivating a poster stops it from working until it is activated again.
- Anyone who has a poster or its link can view what the poster allows. To limit exposure: give per-location posters, hide sensitive SDSs from non-admins, use IP restrictions (add-on), turn off app access, or use SSO.
- Free-trial accounts cannot send the go-live email from the app.
- Maximum number of locations, posters, or nesting depth: not specified in the application; confirm with SDS Manager support/sales.

## Messages and errors users may see

| Message (exact text) | Meaning | What to do |
|---|---|---|
| Location added successfully | New location created. | — |
| Location name can't be empty | Name field empty when creating or editing. | Enter a name. |
| Information saved successfully | Edit location saved. | — |
| Email is required | Notification or daily summary ticked but no email given. | Enter one or more emails separated by commas. |
| You have entered an invalid email address | An address in the notification field is invalid. | Correct the address list. |
| Location archived successfully | Location archived. | Restore it from **Show archived locations** or **Archive** if needed. |
| Un-archive location successfully | Location restored. | — |
| Successfully | Location permanently deleted (also other generic successes). | — |
| This location has been archived | You opened an archived location. | Click **OK**; restore the location if you need it. |
| This tree is too large to expand all at once ({count} locations). Open the branches you need instead. | Expand-all refused. | Expand branches one by one or use search. |
| This action is not available on your current subscription plan | Plan doesn't include the action (e.g. adding locations, amounts). | Upgrade or contact the Owner/sales. |
| This action is not available for your current role | Your role doesn't allow it. | Ask an Owner/Admin. |
| Oops, something went wrong. / Something went wrong. | Request failed. | Retry; contact support if it persists. |
| Move SDS successfully | SDS moved. | — |
| Please select a location where the product is used | Move SDS without destination. | Pick a destination. |
| Successfully moved product amount | Amount moved. | — |
| Please select a location / You cannot select the current location as a destination / Amount can't be empty / Amount can't be less than 0 / Moved amount cannot be greater than current stored amount / Comment can't be empty | Move amount validation. | Fix the field mentioned. |
| This location requires admin privileges | Move-amount destination where you are not admin. | Pick another location or ask for a role. |
| Generate binder fail | Binder could not be generated or opened. | Click **Refresh**; contact support if it repeats. |
| Your binder is being generated in the background. We'll email you a download link when it's ready — feel free to close this tab. | Large binder in progress. | Wait for the email. |
| This binder link has expired. Please regenerate the binder. | Old binder file no longer available. | Click **Regenerate binder**. |
| The selected filters could not be read, so this binder covers your full SDS library. Reopen it from the SDS list to apply filters. | Filters lost. | Reopen the binder from the SDS list. |
| New QR-login user created successfully | Poster created. | Print it or set location access. |
| Please select user access to SDSs | Owner didn't choose an access option. | Pick **Access to all SDSs** or **Customize access**. |
| Full name cannot be empty | Poster name empty. | Enter a name. |
| URL for intranet access copied | Access link copied. | Paste it into your intranet. |
| You do not have permission to perform this action. Only the owner can change this setting. | Admin tried an Owner-only setting. | Ask the Owner. |
| Amount visibility updated / QR user label access setting updated | Owner setting saved. | — |
| Permission for this action has not been granted to QR users by the Owner | QR user printing disabled. | Owner turns on "Allow QR users to print labels". |
| This action is not allowed. Please contact your administrator. | QR user tried a blocked action. | Contact an administrator. |
| Autotranslation is only available on paid Pro/Enterprise plans | Trial tried to enable poster auto-translation. | Upgrade to a paid Pro/Enterprise plan. |
| Allowed IPs cannot be empty / You have entered an invalid IP address or an invalid IP network / <ip> has already been added. | IP restriction input errors. | Fix the IP list. |
| This function is not available in the free trial | Sending the go-live email on a trial. | Send it after subscribing, or copy the text manually. |
| User has been deactivated | Clicked a deactivated poster row. | Activate it first. |
| The user is a regular user again. Set their location roles in User management. | Revert completed. | Set the user's roles. |
| This QR code is no longer valid. Ask your administrator for a new QR code. | Scanned poster is deactivated, reverted or invalid. | Administrator prints a new or reactivated poster. |
| This account has been deactivated. Please contact support for assistance. | Account behind the poster is deactivated. | Contact SDS Manager support. |
| Could not load your SDS library right now. Please try again, or re-scan the QR code. | Temporary problem during a QR session. | Retry or scan again. |
| QR code rejected: only same-origin login URLs are allowed. | Scanned a non-SDS Manager code on the scan-to-log-in page. | Scan an SDS Manager poster. |
| No QR-codes are created. | No poster exists yet. | Click "Click here to create QR code". |
| You currently do not have access to any SDS | Empty view and no right to add SDSs. | Ask an administrator for access. |

## Frequently asked questions

Q: How do I create a new site or department in SDS Manager?
A: Go to **Sites & Locations** and click **Add location**, or click the **+** (**Add sub-location**) icon on the location that should be its parent. Enter a **Name**, choose the **Parent location** (or **No parent** for a top-level site) and click **Create**. You need to be Owner or Admin and your plan must allow adding locations.

Q: How do I move a location under a different parent?
A: Open the location, click the **⋯** button and choose **Edit location settings**. Change **Parent location** to the new parent (or **No parent**) and click **Save**. The location's sub-locations move with it. There is no drag-and-drop in the tree.

Q: How do I rename a location?
A: Open the location, choose **⋯** → **Edit location settings**, change **Location Name** and click **Save**. Names can be up to 255 characters and cannot be empty.

Q: Can I delete a location?
A: First archive it (**Move to archive** on **Sites & Locations**, or **⋯** → **Move location to Archive**). Then, under **Show archived locations** or **Archive** → **Archived locations**, click the delete icon and confirm twice. Only archived locations without sub-locations can be deleted. Deleting removes the location and its SDSs, but SDSs that are also used on other locations remain there. This cannot be undone.

Q: I archived a location by mistake. How do I get it back?
A: On **Sites & Locations** tick **Show archived locations** (or go to **Manage SDS Library** → **Archive** → **Archived locations**) and click the restore icon (**Un-archive location**), then **OK**. You will see "Un-archive location successfully".

Q: How do I move an SDS from one location to another?
A: In the location's SDS list, open the SDS row menu and choose **Move SDS**, pick the destination location and click **Move**. If the product is used on several locations in the view, you first choose which location's entry to move. You need permission to move SDSs on that location.

Q: How do I use the same SDS in several locations?
A: Use **Copy SDS** in the SDS row menu, tick the destination locations (optionally **Apply to all sub-locations**) and click **Add**. You can tick "Move all updated data…" to bring attachments, edited information, EAN/UPC numbers, information message and risk evaluations to the copies. Only locations where you have an admin role are listed.

Q: Can I move part of my stock of a chemical to another storage area?
A: Yes, if your account tracks amounts. Use **Move amount to other location** in the SDS row menu, pick the destination (you need an admin role there), enter the amount and a comment, and click **Move**. You cannot move more than the stored amount or move to the same location.

Q: Why don't I see "Sites & Locations" in my menu?
A: On Free and Basic plans it is not in the main menu (look under **More**). It also moves to **More** when the account is set up as single-location and has only one location without sub-locations. Users who are not Owner or Admin see it as **My locations**.

Q: What are favorite locations and the default location?
A: Click the heart icon on a location to add it to your **Favorite locations** list in the sidebar. Among favorites, click the star (**Set this location as my default**) to make it your default; clicking **Manage SDS Library** from elsewhere in the app then opens that location directly. These are personal settings and do not affect other users.

Q: How do employees access SDSs without a user account?
A: Create a QR poster on **Employee Access** (**Create QR poster**), print it and put it up where chemicals are used. Employees scan it with any phone camera and get read-only access to the SDSs the poster allows, with no app, account or password. You can also copy the poster's link (**URL for intranet access**) for your intranet, website or a shared tablet.

Q: Should we have one QR poster for the whole company or one per site?
A: Both work. One poster for the whole organisation is simplest. One poster per site is recommended in the app, because employees then see only the chemicals relevant to their location. Several posters at one site is possible but not advised, since employees may scan the wrong one.

Q: How do I limit a QR poster to certain locations?
A: Create the poster with **Customize access** (Owner) or open the row menu → **Edit location access**. Set the wanted locations to **Read Only** and the rest to **No Access**, then **Save**. You can also tick **Only access SDS with selected language**, and use **Advanced access** to limit by custom-field values.

Q: Can people who are not our employees scan the poster?
A: Yes. Anyone who has the poster or its link gets the poster's read-only access. To reduce exposure you can use per-location posters, hide sensitive SDSs with **Hide from Non-admin**, add IP restrictions (paid add-on), turn off **App access for QR users**, or use SSO.

Q: Can employees request an SDS that is missing?
A: Yes, if the Owner/Admin turns on "Allow employees to request Safety Data Sheets to be added to Safety Data Sheets library" in **Settings** and the poster has **Allow SDS Request creation** switched on. Employees then see **SDS requests** in the menu and a request button after an unsuccessful search. They identify themselves with their email address; no login is needed.

Q: Can employees who scan the poster see stock amounts?
A: That depends on the Owner's **Amount visibility** setting on **Employee Access**: **Off** (nothing), **Amount only** (current balance, read-only) or **Amount and change log** (also the read-only change log). The setting applies to every user who can view but not change amounts.

Q: Can QR users print labels?
A: Yes, when the Owner leaves **Allow QR users to print labels** on (it is on by default). The Owner can also control, per label field, whether QR users can see, show/hide or edit content with **QR user access to label Content Display & Expiration Date**.

Q: Do employees need the SDS Manager app?
A: No. The poster works in any phone browser. The app is optional and lets employees download the poster's SDSs for offline use when **App access for QR users** is on. The poster's small "DOWNLOAD THE APP" code (printed only when app access is on) sends phones to the App Store or Google Play.

Q: How do I change the language of a QR poster?
A: Open the poster (**View QR poster**), expand **Multi-Language Workplaces** and change **Current language setting**, or use **Edit QR poster**. The language controls the poster text and the interface employees see. For multi-language workplaces, create one poster per language.

Q: How do I put our logo on the QR poster?
A: The Owner uploads it via **Company logo on the QR poster** ("Upload your company logo - will show on QR Poster (Owner Only)") on **Employee Access** or in the poster popup. Without a logo, the SDS Manager logo is printed. Other users see "Please contact the owner to set your company logo."

Q: A QR poster stopped working. What happened?
A: The poster may have been deactivated, permanently deleted or (for a converted user) reverted to a regular user. Employees then see a message such as "This QR code is no longer valid. Ask your administrator for a new QR code." Check the poster's **Status** on **Employee Access** (filter **Deactivated**) and use **Activate QR poster**, or print a new poster.

Q: Do posters we printed a long time ago still work?
A: Yes. Newer posters use a short code that scans better at small sizes, but older posters with the longer link keep working as long as the poster user is active.

Q: How do I turn an existing staff user into a QR login, and back?
A: On **User management**, use **Allow user to sign in using a QR code** on an active Staff user; their location roles become Read only and they move to **Employee Access**. To undo, use **Revert to regular user** on **Employee Access**. Their roles stay Read only, all their QR codes and links stop working, and they must sign in with email and password.

Q: How do I see what my employees will see?
A: On **Employee Access**, click the eye icon in the **Preview** column, or open the poster and click **Preview SDS library for this code**. A small window opens with the employee view of that poster.

Q: How long does an employee stay signed in after scanning?
A: Scanning creates a temporary sign-in session. If it has ended, the employee simply scans the poster or opens the link again. The session lasts about one day; the length is not shown on screen, so confirm with SDS Manager support if it matters.

## Related topics

- **Login & Account Security, Users, Roles & Permissions, and Organization Settings** — location roles matrix, User management, user location access, Settings page, Single Sign-On (SSO)
- **SDS library: substances list, SDS details, stock, archive and export** — Manage SDS Library, All my SDSs, SDS list columns, filters, bulk actions, Hide from non-admin, SDS details and Safety information summary, the Archive page
- **Adding, finding and importing SDS (getting SDS into the library)** — Import SDS files, Import status, adding SDS to locations, SDS requests and tasks
- **Labels, labelling compliance, kits and usage tracking** — label printing, label QR codes, kits
- **Keeping SDS up to date: newer versions, SDS update requests to vendors, vendor inbox and SDS Quality** — SDS updates and vendor emails (Email to this location)
- **Plans, Free Trial, Sign-up, Billing and Subscription** — subscription plans and add-ons (IP Restriction)
- **SDS Manager: product overview, navigation, Dashboard and getting started** — mobile app and offline access
- **SDS Distribution for suppliers (eCommerce / DirectSDS), the customer SDS portal, and integrations** — Webshop search per location, SafetyCulture integration
