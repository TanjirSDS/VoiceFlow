# SDS library: substances list, SDS details, stock, archive and export

> Summary: This topic covers everything you can do with Safety Data Sheets (SDSs) and products that are already in your SDS Manager account: browsing them in **All my SDSs**, **Manage SDS Library**, **SDS Filter** and **Hazardous substances**; opening the SDS details page; tracking stock amounts and usage; archiving, hiding, discontinuing and deleting SDSs; exporting the library; and reporting problems with an SDS. It is for administrators who maintain the library and for employees who look up safety information. These screens are where day-to-day compliance work happens: finding the right SDS fast, seeing hazards at a glance, keeping amounts and records up to date, and producing exports for audits.

## Where to find it

| Screen (on-screen name) | How to open it | URL path | Who normally sees it |
|---|---|---|---|
| **All my SDSs** (short name **My SDS**) | Left menu → **All my SDSs** | `/my-sds` | Everyone with a login, and employees who scan a QR code poster. Users without access to **Manage SDS Library** see it with their location tree underneath. For admins it appears in the main menu once 5 or more SDSs are in use (before that it sits under the **More** menu). |
| **Manage SDS Library** (short name **SDS Admin**) | Left menu → **Manage SDS Library** → pick a location | `/location-management` | Users allowed to manage the library (admins). The location tree itself is described in the topic **Locations, QR codes and employee access to SDS**. |
| **SDS Filter** (also called **All Our SDS**) | Left menu → **SDS Filter** | `/all-our-sds` | Hidden for the **Read only**, **No Access** and **Staff** roles. |
| **Hazardous substances** | Left menu → **SDS compliance** (when the account also has Labelling compliance, **SDS compliance** opens a submenu with **Hazardous substances** and **Labelling compliance**) | `/hazardous-substances` | Hidden for **Staff**, **Read only**, **No Access** and QR-code logins. |
| **Archive** | Left menu → **Archive** | `/archived` | Shown only when the account has archived or deleted SDSs (or archived locations the user may see). |
| SDS details page | Click **View details** on a row, the product name in **SDS Filter**, the open icon in **Hazardous substances**, or a row in **Archive** | `/sds-detail/<id>` (standalone) | Anyone who can see the SDS. |
| **Reports** → **Use & disposal**, **Export SDS library**, **Classification and Labeling Report (GHS)** | Left menu → **Reports** | `/reports` (Use & disposal) | See "Plan and permission requirements". |
| **Private restricted list** | **Administration** → **Settings** → **Private restricted list** | `/administration/setting-function` | Users with access to Settings, on plans that include Hazardous substances. |
| **Regulatory lists to check ingredients to** | Account settings | `/account` | Owner, Admin and Admin Light. |

The older **Substances on Location** page (`/substances-on-location`) has been retired; its job is now done by **All my SDSs**. Opening the old address no longer shows a page.

An internal SDS Manager staff page for exporting interface translations also exists; it is not the customer SDS library export. The "public substance detail" page is likewise an internal, read-only staff view.

## Plan and permission requirements

SDS Manager decides what you can do from two things: what your subscription plan includes, and what your role allows (overall and per location). When your plan does not include a feature you click, you see **"This feature is not available on your current subscription plan."** (or **"This feature is not available on your current trial plan."**) together with the plan you would need. When a stock action is not in the plan you see **"This action is not available on your current subscription plan"**; when your role does not allow it you see **"This action is not available for your current role"**.

### Rules the application applies by role

User roles are Owner, Admin, Admin Light, Staff, Read only and No Access. "Admin with approval" is a role a user can hold on a specific location.

| Feature | Owner | Admin | Admin Light | Staff | Read only | No Access / QR login |
|---|---|---|---|---|---|---|
| See **SDS Filter** in the menu | Yes | Yes | If their permissions include it | No | No | No |
| See **Hazardous substances** | Yes* | Yes* | If their permissions include it* | No | No | No |
| SDS Filter bulk actions **Move SDS to another location**, **Copy SDS to another location**, **Move to archive** | Yes | Yes | No | — | — | — |
| SDS Filter bulk actions **Show differences between the two SDS** and **Set custom field** | Yes | Yes | Yes (if they can open SDS Filter) | — | — | — |
| **Move SDS** in the SDS Filter row menu | Yes | Yes | No | — | — | — |
| **Delete permanently** (Archive page) | Yes | Yes | No | No | No | No |
| **Un-archive** button on the SDS details page | Yes | Yes | No | No | No | No |
| **Export SDS library** and **Classification and Labeling Report (GHS)** (Reports menu) | Yes | Yes | No | No | No | No |
| **View change log** (history of edits to an SDS) | Yes | Yes | Yes | No | No | No |
| **Show locations product is used** link on the SDS details page | Yes | Yes | No | No | No | No |
| **Edit risk ratings** on the SDS details page | Yes | Yes | No | No | No | No |
| Add, rename or delete custom **Measurement Types** | Yes | Yes | No | No | No | No |
| Save the **Safety information summary** section selection for the whole company | Yes | Yes | Yes | No | No | No |
| Choose **Regulatory lists to check ingredients to** | Yes | Yes | Yes | No | No | No |

\* Requires a plan that includes Hazardous substances (SDS compliance).

**Approving an SDS** (when SDS approval is switched on for the company) is only possible for the account **Owner** (who has every right on every location) and for users who hold the **Admin with approval** role on that SDS's location. Others see the button disabled with "Only users with the role "Admin with approval" can approve".

### Rules that depend on your role on each location

These actions appear on an SDS only when your role on that SDS's location grants the matching permission: **Edit SDS information**, **Add EAN code** / **Add UPC code**, **Add attachment**, **Archive SDS** / **Un-archive**, **Move SDS**, **Replace with new SDS**, **Hide from Non-admin** / **Show for all roles**, **Log presence of product**, **Safety information summary**, **Open chemical instruction**, and recording amounts (**Track Usage**). The exact mapping between roles and these permissions is managed by SDS Manager; it is not specified in the application. Confirm with SDS Manager support if a user is missing an action.

### Plan-related rules visible in the application

| Feature | Plan rule shown by the application |
|---|---|
| **Reports** menu (Use & disposal, Export SDS library, GHS report) | In the main menu on Pro and Enterprise, and on Premium once 5 or more SDSs are in use. On Free, Basic and smaller Premium libraries it sits under **More**. Hidden for QR-code logins. If the plan does not include reports, the item is hidden or opens the "not available" popup. |
| **Export to XLSX**, **Export SDS information to Excel file** | Requires the export feature in your plan; otherwise the "not available" popup appears. |
| **Personalized view** (custom-field columns) | Requires the custom fields feature in your plan. Creating and editing custom fields needs the custom-field management permission. |
| Amount / stock tracking | Requires amount tracking to be included in your plan. |
| **Generate SDS Binder** | Requires the SDS binder printing feature; hidden otherwise. |
| **Translate** button on SDS sections | Paid Pro and Enterprise plans (including eCommerce Pro/Enterprise). On trials it is hidden or disabled with **"Autotranslation is only available on paid Pro/Enterprise plans"**. |
| **Mark product as discontinued**, **Log presence of product** | May appear greyed out on a trial even if the plan normally includes them. |

Exact prices and plan limits are not specified in the application; confirm with SDS Manager sales. The pricing text in the app states that pricing is based on the number of active SDSs, that SDSs moved to the archive are not counted as active, and that an SDS used at several locations is counted once per location.

## The library views at a glance

| View | What it lists | Best for |
|---|---|---|
| **All my SDSs** | Every SDS on the locations you have access to, one row per SDS per location. Can be narrowed to one location from the location tree. | Employees looking up an SDS; mobile and QR-poster access. |
| **Manage SDS Library** | The SDSs on the selected location (optionally including sub-locations). Same list layout as All my SDSs plus admin tools (add SDS, binder, export, location settings). | Administrators maintaining a location. |
| **SDS Filter** | Your whole library, one row per SDS, with the list of locations where it is used. Over 10 filters, saved filters, bulk actions and Excel export. | Compliance reviews, bulk changes, inventory analysis. |
| **Hazardous substances** | Only SDSs with ingredients found on the regulatory or private restricted lists you track. | Restricted-substance compliance and substitution. |
| **Archive** | Archived SDSs, SDSs replaced by newer versions, archived SDS requests and archived locations. | Restoring or permanently deleting old SDSs. |

## All my SDSs and Manage SDS Library: the location SDS list

**All my SDSs** is "where your employees find SDS for products they are using". When employees scan your QR code poster or click your SDS link on the intranet, this page opens. It is fully mobile friendly and gives one-click access to First aid, Firefighting and Accidental release information. **Manage SDS Library** uses the same list for the location you select, with extra admin tools.

### List views (tabs)

At the top of the list you choose a list view. On a small screen or inside a location the tabs collapse into a drop-down.

| Tab | Columns shown |
|---|---|
| **General** | Product Name, Supplier Name, Signal word, Amount, Pictograms & Controls, Substance hazard |
| **Hazard** | Product Name, Supplier Name, Location, Signal word, Name of the chemical, Listed in, Hazard statements, Hazard category abbreviation, PPE/Controls |
| **Revision** | Product Name, Supplier name, Location, Signal word, Amount, Revision date, Newer Version, Previous version, Updated date, Logged presence |
| **Risk** | Product Name, Supplier name, Location, Signal word, Substance hazard, Risk rating, Risk rating after controls, Storage risk after controls, Pictograms, Last evaluated, PPE/Controls |
| **Personalized view** | Product Name, Supplier name, Location, plus every column you selected with **Add more columns** (custom fields and extra SDS data). Requires the custom fields feature. |

On mobile some columns (Location, Pictograms, Substance hazard) are added to the tabs automatically.

**Substance hazard** shows five ratings: **H\*** (health risk excluding oral/ingestion hazards), **H** (health risk including all hazards), **S** (safety), **E** (environment) and **D** (disposal rating). The tooltip explains: "Substance hazards are automatically generated from pictograms, hazard statements, precautionary statements, and EUH statements in the Safety Data Sheet (SDS). Note that health hazards may be overstated... Always consult the SDS for accurate and complete hazard information." Click H, S or E to sort.

### Searching and filtering the location list

- Search box: type a product name, supplier, CAS#, UFI# or EU number (placeholder **Product, Supplier, CAS#, UFI#, EU No.**).
- **Add Filter** opens these options:

| Option | What it does |
|---|---|
| **Show archived SDS** | Include archived SDSs in the list. |
| **Only show SDS with new revisions** | Only SDSs where a newer revision exists. |
| **Only show SDS without EAN/UPC code** | Only SDSs that have no barcode number registered. |
| **Only show SDS without presence logged last [N] months** | Enter a number of months. Shows SDSs whose presence has not been logged in that period. If you tick it without a number you are asked to "Please enter the number of months". |
| **Only products without SDS** | Products saved without an SDS file. |
| **All Suppliers** | Pick one or more suppliers. |
| **All Revision Dates** | Pick one or more revision years. |
| **Regulation** | Only SDSs with ingredients on the selected regulatory or private lists (shown only if your plan includes Hazardous substances). |
| **Filter by CAS# in components** | Ingredient CAS number search. |
| **Add custom field** | Filter on a custom field value. |

- **Kits** toggle: switches the list to kits (see "Kit Management" in the topic **Labels, labelling compliance, kits and usage tracking**).

### Row icons on the location list

| Icon / label | What it does | When it is shown |
|---|---|---|
| **Ask AI assistant** ("Ask about <product>") | Opens the AI chat about this SDS. | SDS has a PDF and the interface language is English. |
| **View PDF** | Opens the SDS PDF in a new browser tab. | SDS has a PDF. |
| **View details** | Opens the SDS details page. | Always. |
| **Print Label** | Opens label printing (see the topic **Labels, labelling compliance, kits and usage tracking**). If the company has not allowed QR-code users to print labels, QR users see "Permission for this action has not been granted to QR users by the Owner" and "This action is not allowed. Please contact your administrator." | Always. |
| **Add to print Avery/Brady label** | Adds the SDS to a sheet-label print batch. | Desktop, SDS has a PDF. |
| **Track Usage** | Opens the stock popup (**Manage Stock**). Users who may only view amounts see **Show change log** instead. | User may record amounts at the location, or the company lets view-only users see the amount and change log. |
| **Share PDF** | Copies a shareable public link to the SDS PDF to your clipboard (**"URL for PDF view is copied to clipboard"**). | SDS has a PDF. |
| Attachment indicator (**SDS has files attached**) | Lists attachments; click one to open it. | SDS has attachments. |
| **First aid**, **Firefighting**, **Accidental release** | Opens the SDS details at section 4, 5 or 6. | The SDS has extracted data for that section. |
| **Link barcode to this SDS** | Links a scanned barcode to this SDS. | After a barcode search, for users who may edit the SDS (or QR users if the company allows it). |

### The row "more" menu (⋮)

The menu shows only the actions you are allowed to use for that SDS. If the SDS is used on more than one location, actions that change it first ask you to **Select one specific location** or **Select all locations** ("Apply to all available locations").

| Menu item | What it does |
|---|---|
| **Version Update Subscriptions** | Only for accounts with eCommerce settings enabled, for admins. |
| **Safety information summary** | Opens a printable summary of selected SDS sections (see the SDS details section). |
| **Open APB** / **Create APB** | APB documents (see the topic **Exposure register, reports (incl. Tier II) and Danish APB**). |
| **Log presence of product** | Records that the SDS for this product is present at the location ("Presence of product logged"). If the SDS is on several locations you pick the location first. |
| **Open chemical instruction**, **Open chemical job instruction**, **Create risk evaluation**, **Open risk evaluation**, **Edit draft risk evaluation** | Risk assessment features (see the topic **Chemical risk assessment, PPE approval, disposal classification and substitution**). |
| **Register Exposure** | Exposure register (see the topic **Exposure register, reports (incl. Tier II) and Danish APB**). |
| **Evaluate Substitution** / **Edit substitution** | Substitution feature. |
| **Copy SDS** | Adds the same SDS to other locations. You can tick **"Move all updated data from the current SDS to the copied version in the destination location"** (attachments, edited information, EAN/UPC numbers, information message and Risk Evaluations). |
| **Move SDS** | Moves the SDS to another location (**Move substance to location**). |
| **Replace with new SDS** | Replaces this SDS with another SDS (see the topic **Keeping SDS up to date: newer versions, SDS update requests to vendors, vendor inbox and SDS Quality**). |
| **Mark product as discontinued** / **Un-mark product as discontinued** | Flags that the product is no longer made. **Product is discontinued** (greyed out) appears when SDS Manager has recorded the product as discontinued. |
| **Archive SDS** / **Un-archive** | Moves the SDS to or from the archive. |
| **Delete SDS** | Explains how deletion works (archive first, then delete permanently from the Archive page). |
| **Print NFPA label** / **Print HMIS label** | US and Canadian customers only. |
| **Edit SDS information** | Opens the SDS details page in edit mode. |
| **Add EAN code** / **Edit EAN code**, **Add UPC code** / **Edit UPC code** | Registers barcode numbers. You can add multiple codes separated by comma. |
| **Add attachment** | Attaches a file to the SDS on this location. |
| **Hide from Non-admin** / **Show for all roles** | Hides the SDS from non-admin users, or shows it again. |
| **View details (English version)** | Opens an English version of the SDS details, when available. |
| **Show PDF English version** | Opens an English PDF, when available. |
| **Move amount to other location** | Moves part of the stored amount (shown when an amount above 0 is registered; not for QR logins). |
| **View change log** | History of edits to this SDS (Owner, Admin, Admin Light). |
| **Find SDS for product** | For a product saved without an SDS, opens the SDS search to match one. |

## SDS Filter (All Our SDS)

**SDS Filter** — "Use this view for advanced filtering and sorting of your entire SDS library. With over 10 filters, including an ingredient search, it's ideal for compliance reviews, bulk actions, and in-depth inventory analysis." The page heading is **SDS Filter**; older text and the address call it **All Our SDS**.

### Columns

| Column | Meaning |
|---|---|
| (checkbox) + **Product Name** | Select rows for bulk actions. Click the name to open the SDS details. |
| **Supplier Name** | Supplier of the SDS. |
| **Product Code** | Product code from the SDS. |
| **Custom Fields** | Shown only while you filter on a custom field (and not in Personalized view). Lists the custom field values. |
| **Revision date** | SDS revision date. |
| **GHS** | GHS pictograms. |
| **Conc.** | Concentration of the ingredient you searched for. Shown only when you use **Filter by CAS# in components**. |
| **Substance hazard** | H\*, H, S, E and D ratings (sortable by H, S, E). |
| **Last evaluated** | Date of the latest risk evaluation. |
| **Locations** | Every location where the SDS is used; **View locations** shows the full list. |
| **Approval Status** | Shown only when SDS approval is switched on for your company: Approved, Pending approval, Not allowed for use or No approval info. |
| (actions) | The ⋮ menu for the row. |

The SDS Filter ⋮ menu offers the same actions as the location list, plus **View PDF**, **Open SDS request** (when an update request exists), **Upgrade to new version** (when a newer version exists) and **Show PDF English version**. **Move SDS** is offered only to Owner and Admin.

### Search

- **Search for SDS** – product name and other identifiers among SDSs in use. The ⋮ **Advanced search** menu has a checkbox for **"Free-text search throughout the entire SDS. Matches found in headings and literals are not included."**
- **Filter by CAS# in components** – finds SDSs containing an ingredient. Suggestions appear after 4 characters ("Search must contain at least 4 characters").
- **All Locations** – pick one or more locations, or all.

### Filters

Click **Add Filter** to add a filter chip. Use **Search filters...** to find one and **Clear all** to remove all chips. Filters are grouped:

| Group | Filter | Options |
|---|---|---|
| **Status & Approval** | **SDS status** | **Only list SDS in use** (default), **Only list SDS not in use**, **Only list SDS with manually entered product information**, **Only products without SDS** |
| | **Approval Status** (only when SDS approval is on) | All, Approved, Pending approval, Not allowed for use, No approval info |
| | **Risk assessment** | All, With risk assessment, Need risk assessment, Risk assessment not needed |
| **Product Info** | **Supplier** | One or more suppliers |
| | **Revision date** | One or more revision years |
| | **Language** | SDS language |
| | **Presence of Product** (shown only when presence data is enabled for your company) | **Presence recorded after** / **No presence recorded after** a date |
| | **Only show SDS without EAN/UPC code** | On/off |
| | **Amount stored** | **Amount stored more than** a number, in a weight or volume unit |
| **Hazards & Compliance** | **Regulation** (plans with Hazardous substances) | Regulatory and private restricted lists |
| | **Hazard statements** | Hazard, precautionary and EUH statements, with an **AND/OR** switch: AND = SDS must match all selected statements; OR = any of them |
| | **GHS pictograms** | GHS01 to GHS09 |
| **Other** | **Custom Fields** | Pick a custom field and a value, or tick **Is empty**. Date fields use a From/To range; enumerated fields let you pick values. |
| | **Updated By** | User who last updated the SDS |
| | **External System Id Presence** | All, SDS with external system id, SDS with missing external system id |

On a phone the filters open in a filter dialog instead of chips.

### Saved filters

- **Save this filter** (shown when at least one filter is active): give the filter a name and optionally tick **Share layout within our organization**.
- **Saved filters** lists your filters and filters shared by colleagues. You can search, **Apply** a filter, rename it, switch **Shared** on or off and **Delete Filter**. Only the user who created a filter can rename, share/unshare or delete it.

### Bulk actions

Tick rows, then choose from **Bulk Action** ("You must select at least 1 checkbox from the list below").

| Bulk action | Who | Notes |
|---|---|---|
| **Move SDS to another location** | Owner, Admin | Only while SDS status is **Only list SDS in use**. Shows how many rows are in scope and how many will be skipped ("{n} row(s) will be skipped"), then "Moved {n} row(s). {n} skipped." |
| **Copy SDS to another location** | Owner, Admin | Only while SDS status is in use. Rows already at the destination are skipped: "Nothing was copied: every selected SDS already exists at the destination or is not accessible." |
| **Move to archive** | Owner, Admin | "This action will transfer all SDSs listed below from their current locations to the archive folder." |
| **Show differences between the two SDS** | Everyone with the page | Select exactly 2 SDSs ("Select 2 SDS to compare"). Opens **Difference between two SDS** with changed values highlighted. |
| **Set custom field** | Everyone with the page | Sets a custom field value on all selected SDSs. For checkbox-style values: click once to select, click again to deselect. |
| **Set SDS to approved** | When SDS approval is on | Approves the selected SDSs (approval rules apply). |

### Export to XLSX

**Export to XLSX** exports the rows that match your current search and filters to an Excel file. The file is prepared in the background; an **Export status** window follows progress and downloads the file when ready ("Export completed. Your file has been downloaded.").

## Hazardous substances (SDS compliance)

**SDS Compliance** — "Identify Safety Data Sheets containing substances flagged on regulatory or restricted chemical lists. Use this tool to support compliance and substitution efforts." The page heading is **Hazardous substances** with the subtitle **SDS with components listed on restricted substance lists**.

### Columns

| Column | Meaning |
|---|---|
| **PRODUCT NAME** | Product name with its revision date underneath and an open icon that opens the SDS details. |
| **SUPPLIER NAME** | Supplier. |
| **GHS** | GHS pictograms. |
| **LOCATIONS** | Where the SDS is used. |
| **EC/CAS** | EC and CAS numbers of the listed ingredients. |
| **NAME OF THE CHEMICAL** | Name of each listed ingredient. |
| **APPROVAL STATUS** | Checkbox to approve the SDS (only when SDS approval is on). |
| **CONC.** | Concentration of each listed ingredient. |
| **LISTED IN** | The lists where the ingredient appears. Click a list to see details: Applicability, Supplier Guidance, Formulation Limit, Effective date, Action required, Generic examples, Reporting threshold (0.1% unless otherwise stated), Source, Reason Code, First added, Last revised. |
| **REASON** | Short reason from the list entry. CAS numbers recently added to a list are highlighted. |
| **RISK** | **Create risk evaluation** or open the existing risk assessment. |

### Filters and actions

- **Locations**, **Regulation** (which lists), **SDS status** (in use / not in use / products without SDS), **Approval Status**, **Risk assessment** (All, With risk assessment, Without risk assessment), **Date Added to Restricted List** ("When selecting a date, only SDSs containing ingredients with CAS numbers added to the restricted list after this date will be displayed."), and a product search.
- **Personalized view** adds your selected custom columns.
- **Export to XLSX** opens a small dialog with **Report Date Range** and **Export All SDS Reports**, then exports in the background like the SDS Filter export. Personalized view columns are included when Personalized view is on.

### Which lists are checked

- Public regulatory lists: chosen per company under Account settings → **Regulatory lists to check ingredients to** (Owner, Admin, Admin Light). The pencil icon next to the **Regulation** filter leads you there: "Use filter to only show SDSs that contain any ingredients mentioned in the selected chemical regulations."
- Private lists: see "Private restricted list (your own banned-chemical lists)".

## Private restricted list (your own banned-chemical lists)

Location: **Administration** → **Settings** → **Private restricted list**. "Use this section to manage your company's private restricted substance list. If your organization prohibits certain chemicals — identified by their CAS numbers — you can add them here. Once added, any SDS in your library containing ingredients on your private list will be flagged on the Hazardous Substances list."

The section has two tabs, **List** and **Listed substances**.

**Create a list**
1. On **List**, click **Create** → enter **Name** and **Short name** → **Save**.
2. To edit, use **Edit Restricted List**; to delete, confirm "Confirm delete list <name> and <n> listed substances".

**Add substances one by one**
1. On **Listed substances**, click **Create** (**Create listed substance**).
2. Choose the **List**, then enter **CAS no.** and/or **EC no.** (format 000-000-0) and a **Description** → **Save**. At least one of CAS or EC is required ("CAS no. or EC no. must be filled in").
3. Filter the table with **Filter by CAS or EC No.** or **All lists**.

**Import a list from a file**
1. Click **Download example file** to get the template.
2. Fill in three columns: **CAS#**, **EC#**, **Description**. "Each row needs a CAS# or an EC# — you don't need both."
3. Click **Import File**, choose an Excel (.xlsx/.xls) or CSV file, then **Select restricted list** (or **Create restricted list**) → **OK**.
4. The **Import Result** window shows "Successfully imported {n} row(s)", "{n} existing row(s) updated with an EC number", **Reformatted values** and **Skipped Rows** with the reason. **Download XLSX** saves the result.

## Custom fields and the column chooser

"Custom fields are text fields associated with the SDS on a location. You can create multiple custom fields. An example can be a custom field named 'NFPA rating' where you can add your own NFPA rating for SDS that are missing this information. Custom fields will be shown on the SDS detail page and can be shown on the custom fields tab of the sds list page if user decide to show this data."

### Add more columns (column chooser)

In **Personalized view**, click **Add more columns** (the + in the last column header) to open **Select more columns**:
- Search by **Column name**.
- Tick columns to show: your company's custom fields, extra SDS data fields extracted from the SDS, and built-in extras **Language**, **Physical state**, **pH from**, **pH to**, **External System Id**, **External System Url**.
- **Select all** / **Deselect all**, **Reset to default**, then **Select**.
- Your column selection is stored in your user settings.

### Create and manage custom fields

Requires the custom-field management permission (otherwise the "not available" popup appears).
1. In the column chooser click **Create custom fields**.
2. Enter **Field name** and pick **Field type**: **Text**, **Numeric**, **Date** or **Enumerated type**. For enumerated, enter at least one value ("Please enter at least one value of enumerated type").
3. **Save**. Existing fields can be edited (**Edit custom field**), archived (**Archive tag**, "The tag has been archived"), un-archived (**Unarchive tag**) or deleted.

Filling in values: on the SDS details page (**Modify custom field**), with the **Set custom field** bulk action on SDS Filter, or in Personalized view. Administrators can also restrict users to SDSs with certain values of an enumerated custom field (see **Advanced access** for QR posters in the topic **Locations, QR codes and employee access to SDS**).

## SDS details page

The SDS details page shows the data SDS Manager extracted from the SDS PDF, organised like the SDS itself. It opens as a full page or as a panel over the list.

### Header

- Product name and supplier (editable for users who may edit the SDS), and the signal word (**Danger** or **Warning**, highlighted).
- **Update** – appears when SDS Manager has newer extracted data for this document: "Update SDS to latest extracted data". Confirming shows "This will update {n} SDS in your inventory that use this document." SDSs in locations you cannot access are not updated.
- PDF icon – opens the SDS PDF ("This version does not have a SDS file" if none).
- **Report Incorrect SDS Data** (warning icon) – see "Report a problem with an SDS".
- **Un-archive** – for archived SDSs (Owner/Admin): "Are you sure you want to un-archive this SDS? It will be restored to active status."
- Approval button – when SDS approval is on (see "Approval, information message, comments, custom fields").
- **Show replaced SDS** – when this SDS replaced an older one; opens the old one in the Archive.
- **View change log** – edit history (Owner, Admin, Admin Light), when changes exist.
- **Show locations product is used** – opens SDS Filter searching for this product (Owner/Admin).
- Substitution notes: "This product is substituted by <product>" or "Replacement chemical. Replaced <product>".
- Alerts: "A newer version of this SDS exist. Click here to move to new version" (Owner/Admin); "Click here to update amount (log in required)" when opened from a public scan link.

### Safety summary card

| Item | Meaning |
|---|---|
| GHS pictograms | Editable by users who may edit the SDS (**Edit**). |
| **Health risk rating**, **Health risk (handling)**, **Safety risk rating**, **Environmental risk rating** | Colour-coded ratings on five levels. Health is "Based on pictograms/signal word"; safety "Based on pictograms/physical hazards"; environment "Based on pictograms/environmental hazards". Health risk (handling) "Excludes oral/ingestion hazards". Owners and Admins can **Edit risk ratings**. |
| NFPA and HMIS labels | US and Canadian customers only, when NFPA/HMIS hazard levels exist. Users who may edit the SDS can click to edit them. |
| **Disposal** | D1 Normal disposal, D2 Special disposal required, D3 Environmentally hazardous, D5 Hazardous waste. The tooltip lists the H-codes that triggered it (for example H400/H410/H420/EUH059 for hazardous waste; H401/H402/H411/H412/H413 for environmentally hazardous). |
| **Risk rating after controls**, **Storage risk after controls** | Shown when an approved risk assessment exists. |
| PPE | PPE icons from the SDS or the risk assessment. |
| **Show rows where SDS has no information** | Shows empty fields too. |
| **Compare with PDF** | Shows the PDF text next to the extracted data. |
| **Apply the edits on this SDS to all instances of same SDS** | Shown when the SDS is used on more than one location. When on, your edits are copied to every location using the same SDS: "Once synchronized, all edited data is applied permanently to all instances of the Safety Data Sheets. This action cannot be undone." |

### Approval, information message, comments, custom fields

- **Approval** (when SDS approval is on): **Approve**, **Mark Approval in process**, **Mark Not allowed for use**, **Remove approval status**. "Only users with the role 'Admin with approval' can approve." If the SDS is on several locations you choose **Only this location** or **All Locations**. You can add a comment.
- **Information message**: "When you add an information message, an information box is shown in the SDS list and on labels." Choose type Info, Warning or Danger, enter the text, then **Save to SDS** (or **Use only on this label** when printing a label: "Information is only used on label this time, and will not be stored for future use").
- **Comments**: view or add comments on the SDS.
- **Modify custom field**: enter custom field values.

### Data sections

| Section | Contents |
|---|---|
| **General Information** | Product Name, Product name from SDS request, Original product name, Chemical Name, Substance Name, Trade Name, Chemical Name Synonyms, Product Identifier, Material Name, Product group, Chemical formula, Chemical family, Product code, CAS №, EC №, SDS №, REACH reg. №, EINECS №, UFI №, Revision date, Published date, Printed date, Issued date, Intended use, Uses advised against, Version, Revision, Previous version, Newer version, Icons in PDF, External System Id, External System Url |
| **Company Information** | Supplier of SDS, Distributor Name, Company Name, Manufacturer Name, Address, Company website, Email, Telephone, Emergency telephone number |
| **GHS Information** | Signal word, Hazard category abbreviations |
| **Hazard statements**, **Precautionary statements**, **EUH-statements** | Code + statement tables. Editors can add, edit and remove codes; invalid codes are rejected ("Invalid H code", "Invalid P code", "Invalid EUH code", "It is a duplicate code"). |
| Sections 2 to 16 | The SDS sections with the headings used in the SDS. Section 3 adds **CAS# of components** (with **Search similar products** to find products with the same ingredients) and an **SDS Components** table (Component name, CAS no., EC no., REACH no., Concentration). Section 8 adds **Personal protective equipment** icons. Section 14 adds an editable **Transport Information Table**. |

Section 1 data appears in General and Company Information. Edited values are highlighted. Editors can add extra fields to sections with the + icon.

**Translate**: on paid Pro/Enterprise plans a **Translate** button on sections 2, 4–13, 15 and 16 translates the section into your interface language; **Show original text** reverts. The automated translation is for information only and is not certified.

### Safety information summary

From the row menu or the SDS: **Safety information summary** shows a printable PDF summary. Use **Select to print** to choose General Information, Company Information, PPE, Custom Fields, GHS Information, Hazard statements, Precautionary statements, EUH-statements and sections 2, 4, 5, 6, 7 and 8; **Select custom field to print**; then download the PDF. When an Owner, Admin or Admin Light changes the selection, it is saved for the company: "Any changes you make will apply company-wide."

### GHS pictograms reference

| Code | Meaning |
|---|---|
| GHS01 | Explosive |
| GHS02 | Flammable |
| GHS03 | Oxidiser |
| GHS04 | Gases under pressure |
| GHS05 | Corrosive |
| GHS06 | Toxic |
| GHS07 | Irritant, sensitising, harmful |
| GHS08 | Long-term health hazard |
| GHS09 | Hazardous to the aquatic environment |

## Sharing an SDS and public pages

- **Share PDF** copies the SDS's shareable link to your clipboard ("URL for PDF view is copied to clipboard"). If the SDS has no such link: "This SDS does not have a shareable link". Whether a recipient must sign in to open that link is not specified in the application; test the link before sending it outside the company.
- **View PDF** opens the SDS PDF in a new tab. The in-app PDF viewer pages (single SDS and SDS binder) show the PDF with a download button; in practice these viewer pages are shown to signed-in users.
- Pages that work without signing in are opened from QR codes on labels and posters: the **Safety information summary** for a product (printed with the company's saved section selection, with a language selector) and **Product attachments** (list of the product's attachments with **Download**). Messages on the attachments page: "No attachments are available for this link. The link may have been deactivated.", "This product has no attachments", "This file type cannot be shown here" / "Download it to open the file on your device", "Could not load attachments. Please try again later."
- Employee QR access to the whole library is covered in the topic **Locations, QR codes and employee access to SDS**.

## SDS binders (PDF booklets)

"An SDS Binder is a PDF file that contain all SDSs." Use **Generate SDS Binder** on a location (or from **All my SDSs** for everything you can access).
1. Select the location. To include sub-locations, switch **Include sub-locations** on; otherwise you are reminded: "To include SDSs on sub locations in the SDS binder, set 'Include sub-locations' to the 'On' position".
2. The binder opens in a new tab. Large binders are generated in the background: "Your binder is being generated in the background. We'll email you a download link when it's ready — feel free to close this tab."
3. Statuses: "Queued — your binder will start generating shortly.", "Generating your binder — this may take a few minutes.", "Your binder is already being prepared from a previous request.", "Your previous binder is still ready for download." Use **Open binder** or **Regenerate binder**.
4. If the link has expired: "This binder link has expired. Please regenerate the binder." If filters could not be applied: "The selected filters could not be read, so this binder covers your full SDS library."

The binder viewer page shows the PDF with a download button. Requires the binder printing feature in your plan.

## Attachments

- **Add attachment** (row menu) uploads one file at a time ("Only one file can be added at a time."), maximum 5 MB ("File size limit exceeded (5MB)").
- Allowed types: PDF, DOC, DOCX, JPG, JPEG, PNG, MSG, TXT, XLS, XLSX, XML ("Invalid attachment file type" otherwise).
- If the SDS is on several locations you choose to attach to all occurrences or **Only this one**. Removing works the same way.
- Attachments show as an icon on the row; employees can open them, and label QR codes can link to a public attachments page.

## Stock and amount tracking (Track Usage)

Click **Track Usage** (or the amount value) to open **Manage Stock** for the SDS on that location. It shows Product and Location.

### First registration

The first time, the type of change is **Initial amount** (**Record new arrival** is disabled until an initial amount exists). Choose how to hold the stock:
- **General Stock** – one running amount. "On General Stock the Batch number and Expiry date are just informational. Use Batch Stock if you need to track and report on Batches."
- **Batch stock** – a lot with its own batch number, expiry date and quantity.
- **Container Stock** – stock counted by container type and size.

### Type of change (after the first registration)

| Type | Use it for |
|---|---|
| **New arrival** | Stock received. |
| **Usage** (default) | Amount used. You can link the usage to a **Job procedure** when approved job procedures exist. |
| **Disposal** | Amount disposed of. |
| **Adjustment** | Corrections. Requires a **Reason**: Damaged/Spoiled, Expired Removal, Spill/Leak, Counting Error, Transfer Not Recorded, Received Quantity Mismatch, Returned to Supplier, Sample/Testing, Other (comment required for Other). Enter + to increase or − to decrease. **Reconciliation Mode** lets you enter a **Physical Count**; the app shows **Expected (System)** and the **Variance**. |

### Fields

| Field | Notes |
|---|---|
| **Select stock** | Choose **General Stock**, an existing batch/container lot (shown with batch, size, type, quantity, amount, expiry; expired lots are flagged) or create **Batch stock** / **Container Stock**. |
| **Measurement Type** | **Weight**, **Volume**, **Other** or a company-defined type. Once an SDS has amount data, new lots must use the same measurement system ("Measurement type is locked because this substance already has amount data."). |
| Unit | Weight: μg, mg, g, kg, oz, lbs. Volume: μl, ml, l, cc, m3, fl oz, pt, qt, gals, cu ft. Custom types use their own units. |
| **Amount**, **Max** | Amount of the change; **Max** fills the full current amount. |
| **New stored volume/amount on location** | Resulting balance. |
| **Standard packing/container size** | Under **Advanced Options**. |
| **Batch number**, **Expiry date**, **PO number** | For lots. Batch number can be left empty until the chemical arrives ("Awaiting batch number"). |
| **Container Type**, **Container Size**, **Quantity**, **Total Amount** | For batch/container stock. **Add New Container Type** creates a new container type. |
| **Input Mode** | When using a lot: **By Amount** (By Weight / By Volume) or **By <container type>** (by container quantity). |
| **Comment** | Free text. |

### Managing lots

- **Edit batch / PO number**: "The change is recorded in the change log against your name and the current time." A verified batch number cannot be cleared. "Container Stock" is reserved and cannot be used as a batch number. If a label was printed earlier: "Batch number set. The printed label still shows the old value." (**Reprint label**).
- **Delete stock**: "Delete stock <name> with a remaining amount of <amount>? This amount will be removed from the product total. Contact support if you need the stock restored."
- **Print Tracking Usage Label** / **Print QR code for lot tracking**: "Scan this QR code to record usage for this lot."
- **Manage Measurement Types** (Owner/Admin): add a type with a name and comma-separated units ("At least one unit is required"), rename or delete types and units. Deleting a type still in use warns "Still used by existing stock records. Deleting anyway will detach them."

### View-only amount access

The **Amount visibility** setting ("Amount visibility for users who cannot change it") on the QR code management page (**Employee Access**) decides what users who cannot change the amount see (including container-QR scanners): **Off** (nothing), **Amount only** (current balance, read-only) or **Amount and change log** (also the read-only change log). Users without permission see: "You do not have permission to change the amount at this location. Contact your administrator to register usage."

## Amount change log

Open with **Show change log** in the stock popup (or the amount icon for view-only users). Columns: **No.**, **Job procedure** (hidden by default), **Date of receipt**, **Change type** (Initial, New arrival, Usage, Disposal, Adjustment, Deleted, Restored, Identifier change), **Stock type**, **Batch number**, **PO number**, **Expiry date**, **Previous balance**, **Quantity change**, **Container Usage**, **New balance**, **Reason**, **Comment** (hidden by default), **First and last name**.

- **Filter the change log** by **Start date** and **End date**.
- **Toggle columns** to show or hide columns.
- **Export CSV** exports all records matching the date filter and current sort, with the visible columns.
- View-only users get a simplified log without the toolbar, the user name or comments, and may see "Showing the {n} most recent changes."

## Moving an amount to another location

Row menu → **Move amount to other location** (shown when an amount above 0 is registered).
1. Choose **Move to other location** (not the current location).
2. Pick the measurement unit and enter **Amount move**. The **Remaining stored amount** updates.
3. Enter a **Comment** (required) and click **Move**: "Successfully moved product amount".

Errors: "Please select a location", "You cannot select the current location as a destination", "Amount can't be empty", "Amount can't be less than 0", "Moved amount cannot be greater than current stored amount", "Comment can't be empty".

## Use & disposal report

**Reports** → **Use & disposal** opens **Report for product use and disposal**.
- Filters: **Locations**, **Substances**, **Substance environmental hazard**, **Start date**, **End date**, **Group by substance**, **Custom Fields**, then **Apply**.
- Columns: Location, Product Name, Supplier Name, Measurement scale, **Amount stored start of period**, **Amount stored end of period**, **Amount used**, **Amount disposed of period**, **Substance environmental hazard**, with sums.
- **Excel Report** exports the report.

## Archiving, un-archiving and deleting SDSs

### Archive an SDS

1. Row menu → **Archive SDS** (or bulk **Move to archive** on SDS Filter).
2. If the SDS is on several locations, choose one location or all.
3. Confirm: "Confirm to move SDS for <product> on <location> to archive folder" → **OK**.

Archived SDSs leave the active lists (use **Show archived SDS** to see them on a location) and do not count as active SDSs for pricing.

### Un-archive

- Row menu → **Un-archive**, or **Undo Archive** on the Archive page: "Confirm to move SDS <product> from archive to location <location>".
- Bulk **Undo Archive** shows "Restored {applied} of {requested}" with reasons for refusals: "This SDS is already in use in this location.", "The location is archived.", "This request was closed automatically. Use 'Reopen request' instead."
- If an archived copy already exists when you add the same SDS again: "An archived instance of this SDS already exist on this location. Try to unarchive it instead."

### Delete permanently

"To delete an SDS, you must first archive it by selecting 'Archive SDS' from the menu. Then, to permanently remove it from your account, open the Archive page, select the Archived SDS tab, and choose 'Delete permanently.'" Only Owner and Admin can **Delete permanently** ("Confirm delete SDS <product> permanently"). There is no undo in the app.

## Archive page

| Tab | Contents and actions |
|---|---|
| **Archived locations** | Archived locations (shown to users who may see them). **View SDSs** opens that location's archived SDSs. |
| **Archived SDSs** | Archived SDSs. Columns: Product Name, Supplier Name, Product Code, Revision date, GHS, Locations, Replaced by SDS, Replaced by, Replaced date. Search **Product, supplier name**; filter **Locations status** (All, Active locations, Archived locations) and location. Row actions **Undo Archive** (not for archived locations) and **Delete permanently** (Owner/Admin). |
| **Replaced by newer version** | Old versions replaced during SDS updates; **Delete permanently** (Owner/Admin). |
| **Archived SDS Requests** | Archived SDS requests with **Reopen request**, **Undo Archive** and **Delete permanently** (see the topic **Adding, finding and importing SDS (getting SDS into the library)**). |

Bulk actions: **Undo Archive** (only with **Active locations** selected) and **Delete permanently** (Owner/Admin).

## Hide from non-admin

Row menu → **Hide from Non-admin** hides the SDS from users without an admin role; **Show for all roles** shows it again. Confirm: "Are you sure to hide substance <product> on <location> from non-admins?" If some locations cannot be changed because you lack permission there: "Not changed in {count} location(s): you don't have permission there."

## Mark product as discontinued

Row menu → **Mark product as discontinued**: "Confirm to mark SDS <product> as discontinued" → "Successfully mark SDS <product> as discontinued". Reverse with **Un-mark product as discontinued**. If SDS Manager has recorded the product as discontinued, the menu shows **Product is discontinued** (greyed out). How a discontinued mark affects update checks is not specified in the application.

## Moving or copying SDSs between locations

- **Move SDS** (row) or **Move SDS to another location** (bulk): moves the SDS; "Move SDS successfully".
- **Copy SDS** (row) or **Copy SDS to another location** (bulk): adds the SDS to more locations. "Copied successfully" / "Copied {n} SDS. {n} skipped." Your company may require an external system ID when adding to a location.

## Comparing two SDSs

Select exactly two SDSs on SDS Filter → **Show differences between the two SDS**. The **Difference between two SDS** window lists **Changed values** field by field.

## Exporting your SDS library

| Export | Where | Format | Who |
|---|---|---|---|
| Filtered library | **SDS Filter** → **Export to XLSX** | Excel | Users of SDS Filter, plan with export |
| Whole library | **Reports** → **Export SDS library** | CSV | Owner, Admin |
| GHS classification | **Reports** → **Classification and Labeling Report (GHS)** | CSV | Owner, Admin |
| One location | Location ⋮ → **Export SDS information to Excel file** ("Any columns you choose to display on the Custom Fields tab will be included in the exported file") | Excel | Plan with export |
| Hazardous substances | **Hazardous substances** → **Export to XLSX** | Excel | Hazardous substances users |
| Use & disposal | **Reports** → **Use & disposal** → **Excel Report** | Excel | Reports users |
| Amount change log | Change log → **Export CSV** | CSV | Users who can change amounts |

All large exports run in the background. The **Export status** window checks progress about every 5 seconds for up to one hour. Messages: "Export completed. Your file has been downloaded.", "Export completed. Your download has started in your browser.", "Export failed. Please try again.", "The download was interrupted. Please try again.", "This export has expired. Please try again.", "The export could not be generated. Please try again.", "Export completed, but the download link could not be opened. Please try again."

## Report a problem with an SDS

1. Open the SDS details and click the warning icon **Report Incorrect SDS Data**.
2. Choose **Type**: **Report an Incorrect SDS PDF File** or **Report Incorrectly Extracted Data**.
3. For an incorrect PDF you can drop or **Browse File** to upload the correct PDF ("Having the correct file would be very helpful to us.").
4. Describe the issue (**Please help us by describing the issue you are facing.**). Type and description are required.
5. **Submit** → "Report submitted successfully".

For other problems use **Contact Us** (dashboard help panel): **Subject**, a description, optional files, then send ("Message is sent"). Empty subject or message: "Please describe the problem".

## Supplier & Manufacturer Listing

When printing labels, the supplier identification can be picked from a **Supplier & Manufacturer Listing** (**Add Supplier**, **Add Manufacturer**, with Street, Postcode, City, State). You can set a default address per country and a default address for all countries; "A default address for all countries is required." Details are in the topic **Labels, labelling compliance, kits and usage tracking**.

## Rules, limits and edge cases

- One row per SDS per location in **All my SDSs** and **Manage SDS Library**; one row per SDS (with all its locations) in **SDS Filter**.
- Actions on an SDS used on several locations ask you to pick one location or all.
- SDS Filter **Move**/**Copy** bulk actions only appear with SDS status **Only list SDS in use**.
- **Show differences** needs exactly 2 selected SDSs.
- **Conc.** appears only during an ingredient (CAS) search; **Custom Fields** column only while filtering on a custom field.
- CAS search suggestions need at least 4 characters.
- Attachments: 1 file per upload, max 5 MB, listed file types only.
- Stock: **New arrival** is blocked until an initial amount exists; the measurement system is locked once amount data exists; "Container Stock" is reserved; adjustments that would make stock negative are rejected ("Adjustment would result in negative stock").
- Undo Archive is not offered for SDSs on archived locations or for requests closed automatically (use **Reopen request**).
- Deleting requires archiving first and is Owner/Admin only.
- Edits with **Apply the edits on this SDS to all instances of same SDS** switched on cannot be undone.
- **Update SDS to latest extracted data** only updates SDSs on locations you can access.
- AI assistant icon appears only in English.
- Hazardous substances depends on the lists selected in Account settings and on private lists.

## Messages and errors users may see

| Message | Meaning | What to do |
|---|---|---|
| This feature is not available on your current subscription plan. | Plan does not include it. | Upgrade or contact sales. |
| This action is not available on your current subscription plan | Amount tracking not in plan. | Upgrade. |
| This action is not available for your current role | Role lacks permission. | Ask an admin. |
| This product does not have a SDS file | No PDF linked. | Find or upload the SDS. |
| This SDS does not have a shareable link | No public link. | Contact support. |
| URL for PDF view is copied to clipboard | Share link copied. | Paste it. |
| Search must contain at least 4 characters | CAS search too short. | Type more. |
| You must select at least 1 checkbox from the list below | No rows selected. | Tick rows. |
| Select 2 SDS to compare | Wrong number selected. | Select exactly 2. |
| Nothing was copied: every selected SDS already exists at the destination or is not accessible. | All skipped. | Choose another location. |
| Not changed in {count} location(s): you don't have permission there. | Partial hide/show. | Ask an admin for those locations. |
| An archived instance of this SDS already exist on this location. Try to unarchive it instead. | Duplicate in archive. | Undo Archive. |
| This SDS is already in use in this location. | Unarchive refused. | Use the active copy. |
| The location is archived. | Unarchive refused. | Restore the location first. |
| This request was closed automatically. Use "Reopen request" instead. | Auto-closed request. | Reopen it. |
| File size limit exceeded (5MB) / Invalid attachment file type / Only one file can be added at a time. | Attachment rejected. | Fix the file. |
| Measurement type is locked because this substance already has amount data. | Unit system fixed. | Use the same system. |
| Please select a reason for adjustment / Comment is required when reason is 'Other' | Missing adjustment data. | Complete the fields. |
| Adjustment would result in negative stock | Too large decrease. | Check the amount. |
| Moved amount cannot be greater than current stored amount | Too much moved. | Lower the amount. |
| You do not have permission to change the amount at this location... | View-only access. | Ask an admin. |
| Invalid H code / Invalid P code / Invalid EUH code / It is a duplicate code | Statement edit rejected. | Correct the code. |
| Autotranslation is only available on paid Pro/Enterprise plans | Translate on lower plan/trial. | Upgrade. |
| Report submitted successfully | SDS report sent. | None. |
| Export failed / expired / interrupted messages | Background export problem. | Try again. |
| This binder link has expired. Please regenerate the binder. | Old binder link. | Regenerate. |

## Frequently asked questions

Q: What is the difference between All my SDSs, Manage SDS Library and SDS Filter?
A: **All my SDSs** is the employee view of the SDSs on the locations you can access, also opened by QR posters. **Manage SDS Library** is the admin workspace for one location, with tools to add SDSs, print binders and export. **SDS Filter** lists your whole library once per SDS with advanced filters, saved filters, bulk actions and Excel export.

Q: Why can't I see SDS Filter or Hazardous substances in my menu?
A: SDS Filter is hidden for the Staff, Read only and No Access roles. Hazardous substances is hidden for Staff, Read only, No Access and QR logins, and requires a plan that includes SDS compliance. Ask your administrator to change your role, or contact SDS Manager sales about the plan.

Q: How do I find all SDSs that contain a specific chemical?
A: In **SDS Filter**, type the CAS number in **Filter by CAS# in components** (at least 4 characters) and pick a suggestion; each suggestion shows a name with its CAS number. The **Conc.** column then shows the concentration in each SDS. In a location list you can use **Add Filter** → **Filter by CAS# in components**.

Q: How do I export my SDS list to Excel?
A: In **SDS Filter**, set the filters you want and click **Export to XLSX**; the file is prepared in the background and downloads when ready. Owners and Admins can also use **Reports** → **Export SDS library** for the whole library (CSV), and a location can be exported with **Export SDS information to Excel file**.

Q: How do I delete an SDS?
A: First archive it (⋮ → **Archive SDS**). Then an Owner or Admin opens **Archive** → **Archived SDSs** and clicks **Delete permanently**. Deletion cannot be undone in the app.

Q: I archived an SDS by mistake. Can I get it back?
A: Yes. Open **Archive** → **Archived SDSs** and click **Undo Archive**, or use **Un-archive** in the row menu or on the SDS details page. It cannot be restored if its location is archived or the same SDS is already active on that location.

Q: Do archived SDSs count towards my subscription?
A: The pricing text in SDS Manager says pricing is based on active SDSs and that SDSs moved to the archive are not counted as active. An SDS used on several locations counts once per location. Confirm exact terms with SDS Manager sales.

Q: How do I record usage of a chemical?
A: Click **Track Usage** on the row to open **Manage Stock**. Register an **Initial amount** the first time, then record **New arrival**, **Usage**, **Disposal** or **Adjustment** with the amount and an optional comment. Every change is saved in the change log.

Q: What is the difference between General Stock, Batch stock and Container Stock?
A: **General Stock** is one running amount; batch number and expiry date are informational only. **Batch stock** tracks each lot separately with its own batch number, expiry date and quantity, so you can report on batches. **Container Stock** tracks stock by container type and size.

Q: Can employees who only scan QR codes see the amount?
A: Yes, if an administrator sets **Amount visibility** on the QR code management page (**Employee Access**) to **Amount only** or **Amount and change log**. With **Off** they see nothing. Changing the amount always requires permission.

Q: How do I see who changed an amount?
A: Open **Track Usage** → **Show change log**. The log shows date, change type, balances, reason and the user's name; filter by dates, toggle columns and **Export CSV**.

Q: How do I add my own data fields to SDSs?
A: Open **Personalized view**, click **Add more columns** → **Create custom fields**, give the field a name and type (Text, Numeric, Date or Enumerated type). Fill values on the SDS details page or with the **Set custom field** bulk action on SDS Filter. This needs the custom fields feature in your plan.

Q: How do I flag SDSs with chemicals my company has banned?
A: Go to **Administration** → **Settings** → **Private restricted list**, create a list and add CAS/EC numbers (or import an Excel/CSV file with columns CAS#, EC#, Description). SDSs containing those ingredients appear on **Hazardous substances**.

Q: Which regulatory lists does Hazardous substances check?
A: The public lists your company selected under Account settings → **Regulatory lists to check ingredients to** (Owner, Admin, Admin Light), plus your private restricted lists. Use the **Regulation** filter to narrow to specific lists and **Date Added to Restricted List** to see newly listed ingredients.

Q: How do I share an SDS with someone outside the company?
A: Click **Share PDF** on the row; the SDS's shareable link is copied to your clipboard ("URL for PDF view is copied to clipboard") and you can paste it into an email. If the SDS has no shareable link you see "This SDS does not have a shareable link". The application does not state whether recipients must sign in, so check the link before sharing it externally.

Q: How do I hide an SDS from employees?
A: Use ⋮ → **Hide from Non-admin**. Non-admin users no longer see it; **Show for all roles** reverses this.

Q: The extracted data on an SDS is wrong. What can I do?
A: If you may edit the SDS, correct the field on the SDS details page (edited values are highlighted). You can also report it: click **Report Incorrect SDS Data**, choose **Report Incorrectly Extracted Data** or **Report an Incorrect SDS PDF File**, describe the issue and submit.

Q: I edited an SDS on one location. Will other locations update?
A: Only if **Apply the edits on this SDS to all instances of same SDS** is switched on (shown when the SDS is used on several locations). That synchronisation is permanent and cannot be undone.

Q: What does the Update button on the SDS details page do?
A: It appears when SDS Manager has newer extracted data for the same SDS document. Confirming updates the SDSs in your inventory that use this document, but only on locations you can access.

Q: Can I compare two versions of an SDS?
A: Yes. In **SDS Filter**, tick exactly two SDSs and choose **Show differences between the two SDS** in **Bulk Action**. The window lists changed values field by field.

Q: How do I print all SDSs for a location as one PDF?
A: Use **Generate SDS Binder** on the location (switch **Include sub-locations** on if needed). Large binders are built in the background and a download link is emailed to you. This requires the SDS binder feature in your plan.

Q: Can I save my filter set-up?
A: Yes. In **SDS Filter**, once a filter is active click **Save this filter**, name it and optionally share it with your organisation. Reopen it from **Saved filters**; only the creator can edit or delete it.

Q: What do H*, H, S, E and D mean?
A: They are automatically generated ratings: H\* health risk excluding oral/ingestion hazards, H health risk including all hazards, S safety, E environment, and D disposal rating (D1 normal to D5 hazardous waste). They are based on the SDS pictograms and statements and may overstate health risk, so always check the SDS.

Q: Can I translate an SDS section into my language?
A: On paid Pro and Enterprise plans, the **Translate** button on SDS sections translates them into your interface language; **Show original text** reverts. It is an automated, uncertified translation.

## Related topics

- **Adding, finding and importing SDS (getting SDS into the library)** — global search, upload, binders and ZIP import, SDS requests, SDS approval queue
- **Keeping SDS up to date: newer versions, SDS update requests to vendors, vendor inbox and SDS Quality** — newer versions and SDS update requests
- **Locations, QR codes and employee access to SDS** — Sites & Locations and the location tree, QR codes, QR posters and Amount visibility
- **Labels, labelling compliance, kits and usage tracking** — secondary container labels, Avery/Brady, NFPA/HMIS, Kit Management
- **Chemical risk assessment, PPE approval, disposal classification and substitution** — risk assessments and chemical instructions
- **Job procedures (job hazard analysis, COSHH assessments, 7-point risk assessments) and chemical work instructions** — job procedures
- **Login & Account Security, Users, Roles & Permissions, and Organization Settings** — SDS approval flow settings, user management and roles
- **Plans, Free Trial, Sign-up, Billing and Subscription** — subscription plans and billing
