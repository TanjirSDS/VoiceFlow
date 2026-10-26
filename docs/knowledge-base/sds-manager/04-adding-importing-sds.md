# Adding, finding and importing SDS (getting SDS into the library)

> Summary: This topic covers every way a Safety Data Sheet (SDS) or product gets into an SDS Manager account: searching SDS Manager's global SDS database and adding results to a location, uploading SDS PDF files (single files, several files, ZIP/RAR archives, multi-SDS "binder" PDFs, or a web link), photographing product labels or SDS binder pages, scanning barcodes, entering a product manually, and importing a product list from Excel/CSV. It also explains what happens afterwards: file processing, the **Import status** page for failed files, products waiting for an SDS (**Products Awaiting SDS**), SDS requests, matching an SDS to a product, close-match approval and the SDS approval queue. It is written for account Owners and Admins who build the library, and for employees who need to request a missing SDS. Getting SDS in quickly and correctly is the foundation for everything else in SDS Manager (labels, QR access, compliance reports).

## Where to find it

| What you want to do | Where |
|---|---|
| Search the global SDS database and add SDS | **More → Global SDS Search** (`/global-sds-search`); the **Search SDS Database** tab on the **Dashboard**; **Add Safety Data Sheet** on a location in **Manage SDS Library**. Employees who log in with a QR code see **Global SDS Search** directly in their menu. |
| Add SDS to one specific location | **Manage SDS Library** → open the location → **Add Safety Data Sheet** |
| Upload SDS PDF / ZIP / RAR files | The upload zone on **Global SDS Search** and on the Dashboard's **Import SDS Files** tab; **Show other methods to add Safety Data Sheets to location** in the location's add dialog; **More → Import ZIP Files** |
| Import a product list (Excel/CSV) | **More → Import product list** (`/administration/import-product-list/`), the profile menu item **Import product lists**, or the Dashboard tab **Import Product List** |
| Photograph product labels | **More → Shoot pictures of labels of your chemicals** (page **Add products by picture**), or the **Take pictures** button next to the SDS search box |
| Scan barcodes | The **Barcode search** button next to the SDS search box, or the Dashboard tab **Scan Barcode**. The **Scan barcode** icon in the page header looks a code up in your own library. |
| Photograph a paper SDS binder | Dashboard tab **Scan Paper Binder** (its QR code / **Open Binder Scanner** opens the **Scan SDS Binder** page) |
| See how uploaded files were processed | **More → Import status** or **Manage SDS Library → Import status** (`/location-management/import-status/`). The menu item only appears once the account has imported files. |
| Products without an SDS, SDS requests, approvals | **Pending Tasks** menu: **Products Awaiting SDS**, **SDS requests**, **Pending my approval**, **SDS Awaiting Approval** (all on the page **SDS Tasks**, `/unmatched-substances/`). On-screen messages refer to this as "Tasks → Products Awaiting SDS". These items only appear when there is something to show. |
| Approve SDS that SDS Manager's team proposed as a close match | **Manage SDS Library → Close match approval** (`/close-match-approval`), shown only when matches are waiting |
| Find the SDS for one product | The **Find SDS** page, opened with **Find SDS** on a product in **Products Awaiting SDS** / **SDS requests** |

## Plan and permission requirements

Which features an account has is controlled by its subscription plan, and what each user may do is controlled by their role (account roles: Owner, Admin, Admin Light, Staff, Read only, No Access; on a location a user can also be **Admin with approval**). The exact plan-to-feature mapping is set by SDS Manager's servers and is not listed in the application; confirm with SDS Manager support/sales. When a plan does not include a feature, the app shows an upgrade prompt ("This action is not available on your current subscription plan" or a "feature not available" dialog).

| Feature | Who can use it (as shown in the application) |
|---|---|
| Open **Global SDS Search** and search | Any signed-in user can open the page; the menu item requires the account's global-search feature. |
| Add an SDS from search results (+) | Users whose plan and role allow adding SDS from the global database. Otherwise: "You need an admin role to add SDS to library". |
| Upload area, Google-search help panel, "Select action" dialog in search | Owner and Admin only. |
| **Add Safety Data Sheet** on a location | Users with the add-SDS right on that location (and a plan that includes adding substances). |
| Request an SDS instead of adding it | Users who cannot add, when the Owner has enabled **Allow employees to request Safety Data Sheets to be added to Safety Data Sheets library**; QR-code users additionally need **Allow SDS Request creation**. |
| **Import ZIP Files** page / **Shoot pictures of labels of your chemicals** page | Owner and Admin (not QR-code logins). Label pictures also require the plan's picture feature. |
| **Import product list** | Users with the product-list import permission; the **More** menu entry is shown to Owners and Admins. |
| **Import status** | Users with access to the import status page; the menu item appears once the account has imported files. |
| **SDS Tasks** (Products Awaiting SDS, SDS requests, approvals) and **Close match approval** menu | Users with access to the missing-SDS page; the **Pending Tasks** menu group is shown to Owners and Admins. |
| **Find SDS** on a task, edit request details | Admin, Admin with approval or Owner role on the product's location. |
| Add/approve an SDS for a request on the **Find SDS** page | Owner, or an Admin with the **Admin with approval** role on that location. |
| **This product does not have an SDS**, **Delete permanently** on tasks | Owner and Admin. |
| **Confirm to match** / **Confirm match** for uploaded-file suggestions | Account Owner only. |
| Approve/reject in **SDS Awaiting Approval** | Only the approvers configured for the current step. |
| "Our Promise" free SDS-finding service | The UI states it is for paid plans (Premium, Pro or Enterprise); the promise box is shown to Free and trial accounts. |
| ZIP size warnings | Free trial: a maximum number of SDS applies; paid plans: the remaining SDS allowance of the plan. |

## Ways to get SDS into your library (overview)

| Method | Best when | Result |
|---|---|---|
| **Global SDS Search** | You know the product name, supplier, code or CAS number | The SDS from SDS Manager's database is added to the location(s) you choose |
| Upload PDF files | You already have SDS as PDF files | Content is extracted automatically; the SDS is added to the chosen location(s) |
| Upload a ZIP/RAR | You have many PDF files, possibly in folders | All files are imported; folders can become locations |
| Upload an SDS binder PDF | One PDF contains many SDS | The PDF is split into separate SDS |
| **UPLOAD FROM URL** | The SDS is online | SDS Manager downloads and imports it |
| **Scan Paper Binder** | You have printed SDS | Photo of each first page → the matching digital SDS is added |
| Barcode scanning | You are walking around the site | SDS found by barcode, or the product is saved to find the SDS later |
| Label photos | Containers without a usable barcode | Product saved (optionally detected automatically) to find the SDS later |
| **MANUALLY ENTER PRODUCT** / **Add SDS request** | You have no SDS file yet | Product recorded as an SDS request |
| **Import product list** | You have a spreadsheet of chemicals | Products created; exact matches get their SDS automatically, the rest wait in **Products Awaiting SDS** |
| **Click to request us to find it for you** | You cannot find the SDS | The SDS Manager team looks for it ("We'll add it to your library within 24 hours.") |
| **Migrate from other system** | You use another SDS system | SDS Manager's team moves your library and locations |
| Employee request | You are not allowed to add SDS | An administrator reviews and adds the SDS |

## Global SDS Search: searching the SDS Manager database

**Global SDS Search** lets you search SDS Manager's global repository of Safety Data Sheets and add the ones you need to your own SDS library. The page header reads "Search for Safety Data Sheet in our Global Repository of 16 million+ Safety Data Sheets." (The dashboard's **Search SDS Database** tab describes the database as "18 million+ Safety Data Sheets". The app uses both figures; confirm the current number with SDS Manager.)

How to run a simple search:
1. Open **Global SDS Search** (main menu, under **More** for regular users).
2. Type in the search box. The placeholder shows what you can search for: "Product, Supplier, CAS#, UFI#, EU No."
3. Press Enter or click the search icon (tooltip **Search for SDS**).

Rules for the search text:
- A simple search must contain at least 3 characters, otherwise you see "Search must contain at least 3 characters".
- In **Advanced search**, at least one of Product Name, Supplier Name or Product Code must have 3 or more characters, or the ingredient (CAS) field must have at least 4 characters.

**Advanced search** (toggle **Advanced search** / **Simple search** next to the filters) splits the search into separate fields:

| Field | What to enter |
|---|---|
| **Product Name** | The product's trade name |
| **Product Code** (placeholder "Product Code, EAN, UPC, UFI#, CAS#") | Article number, barcode number (EAN/UPC), UFI or CAS number |
| **Supplier Name** | Manufacturer or supplier |
| **Ingredients** | One or more CAS numbers of ingredients; you can enter several. Results then show "Contains:" (the searched ingredients) and "Also contains:" (other listed ingredients) as chips under each result. |

The browser remembers whether you last used simple or advanced search, and your language, region and revision-year choices, so they are pre-filled next time on the same device.

## Global SDS Search: filters (language, region, revision year, database, location)

Filters appear as chips under the search box (simple search) or as selectors in the advanced panel.

| Filter | Options | Default |
|---|---|---|
| **Language** | **All** or any SDS language | Your user language. A language chip is only shown when it differs from your own language; removing it resets to your language. |
| **Region** (regulation area) | **Any region**, EU, UK, US, CA, NZ, AU, BR, MY, CN, MX, ZA (multi-select) | Your account's region. If your region is UK, EU is pre-selected too. |
| **Minimum Revision Year** | **All**, or the current year and the five years before it | All. When set, the chip shows "≥ <year>". |
| **Database** | **Global** or **Only in use by <your organisation>** | Global. "Only in use by" limits the search to SDS already in your library. |
| **Location** chip | The location(s) where the next SDS will be added | Shown only when you have chosen default "add-to" locations (see "Adding an SDS from search results"). Hover text: "The next Safety Data Sheet you add will be assigned to the location shown here. To change it, click the "x" - you'll be prompted to select a new location when adding your next SDS." |

If a selected region has no SDS in the chosen language, the region chip is shown struck through with the tooltip "Not applied: no SDS in the selected language exist in this region. Remove this filter or change the language."

If filters hide matches for a suggestion you clicked, an info box says "Your filters are limiting results for <keyword>".

## Global SDS Search: reading the search results

After a search, **Global SDS Search** shows the heading **Exact match search results:** (for a barcode search: "<number> Safety Data Sheet found"). Results are paged, 10 rows per page by default. If the database holds more matches than the first answer returned, a **Show more results (<number>)** link appears.

Result columns (on phones the same information is shown as cards):

| Column | Meaning |
|---|---|
| (+) add icon | Adds the SDS to your library (see "Adding an SDS from search results"). Who sees it depends on role and settings. |
| PDF icon (**Open PDF**) | Opens the SDS PDF in a new browser tab. If no file exists: "This product does not have a SDS file". |
| **Name** | Product name |
| **Product Code** | Article number(s) |
| **Supplier** | Manufacturer/supplier |
| **EC/CAS** | EC and CAS numbers |
| **Revision date** | Revision date printed on the SDS |
| **Regulation area** | The regulatory region of the SDS (for example EU, US) |
| **Language** | SDS language |
| Location icon (**Locations using the SDS**) | Lists which of your locations already use this SDS |
| Locations | Names of your locations that use the SDS; click a name to open that location |
| **Actions** | Further actions for the SDS |

Colour coding and labels:
- "Blue rows indicate Safety Data Sheets already in your library." Such rows also show the label **Already in Your SDS Library**.
- When you search from inside a location, rows already on that location are highlighted in a different colour.
- Clicking a row opens the SDS detail view. The detail view has an **Add to SDS library** button for users allowed to add SDS.

Similar results:
- If there are no exact matches, SDS Manager looks for similar products. The list is titled **Similar results:** (or **Similar results with partial match:**, or **Similar results to "<keyword>":** after a barcode search).
- When exact results exist, similar results are collapsed behind the link **Show similar results** (or **Show similar results with partial match**).
- If SDS Manager thinks you misspelled the search it asks "Did you mean: <suggestion> ?" with **Yes** (search the suggestion) and **No**.
- If even the similar search finds nothing: "Sorry, the <keyword> did not match any SDS in our database, please try a different keyword".

When there is no exact match the page shows "No exact SDS match found for <keyword>" followed by "Try these suggestions:" — "Explore similar results below.", "Use the built-in Google SDS search found below.", "Search again with simpler or fewer words.", "Let us find the SDS for you (see bottom of page)". When you searched only among SDS in use by your organisation, the message is instead ""<keyword>" did not match any SDS in your library".

Guides: the first time an Owner or Admin gets search results, a short guide pops up ("Add Safety Data Sheets to your library" — "Click (+) to add the Safety Data Sheet to your library.", "Blue rows indicate Safety Data Sheets already in your library.", "Click on row to view Safety Data Sheet.", button **Got it**). After repeated searches with no results, a second guide explains the Google route ("Not finding a Safety Data Sheet for your product?" — "Click Search on Google button to redo your search on Google.", "Download the SDS File to your device.", "Drag and drop the file to SDS Manager.", "The Safety Data Sheet is added to your library with no typing required.").

Before you search, the page shows your **Recently added** SDS and (for Owners/Admins) the upload area "Already have the PDF-file of the Safety Data Sheet you want to add to your library?" — "You can also add the Safety Data Sheet to your library by simply uploading the PDF-file."

## Supplier site (live) results

For some suppliers, SDS Manager can also look up SDS directly on the supplier's own website while you search. This happens only when your search names a supplier SDS Manager has a connector for, and there is still a product name or code left to look up (at least 3 characters besides the supplier name).

- If the database already has an exact match, the supplier is not asked automatically; a link **Search the supplier's site for more results** lets you run it.
- If not, the lookup starts automatically. While it runs: "Searching supplier site for additional results…" (when database results are shown) or "Searching the supplier's site…".
- If the language you chose is used in several markets (for example French for France or Canada), you are asked "<language> safety data sheets exist for several markets. Search the supplier for:" with one chip per market; your choice is remembered for the next search in that language.
- Outcomes: "No additional products found on the supplier's site." / "No products found on the supplier's site." / "Supplier sites are currently unavailable" / "The supplier's site is taking longer than expected. Please try again in a moment." / "The supplier's site could not be searched by product name right now — try a product code."
- Supplier rows are labelled **Supplier site (live)** or **Possible match from supplier**. Clicking such a row or its PDF icon opens the supplier's document; if it cannot be opened: "Could not open the document from the supplier's site. Please try again."

Adding a supplier (live) result:
1. Click its add icon (tooltip **Add SDS from supplier site**).
2. In the dialog "Download "<product>" from the supplier's website and add it to the selected location. The SDS will be imported and processed automatically.", pick a location under **Select location** and click **Add**. Note: "The download and processing can take several minutes."
3. While it runs you see "Importing from the supplier's site…". You can click **Continue in background**: "The import continues in the background — the SDS will appear in the selected location when ready."
4. If the server takes too long to answer: "This is taking longer than expected. The import continues in the background — check the selected location in a few minutes."
5. If it fails: "Could not import the SDS from the supplier site". Closing the dialog does not cancel an import that has started.

## Adding an SDS from search results to your library

What the (+) icon on a search result does depends on who you are and how your library is set up:

| Situation | What (+) does |
|---|---|
| You may add SDS and your library has a single location (no sub-locations) | Tooltip **Add to SDS library**. One click adds the SDS to that location. |
| You may add SDS, very first SDS of the account (no library name yet) | Opens the first-SDS setup dialog (see "Adding your first SDS: naming your SDS library") and then adds the SDS. |
| You may add SDS and have chosen default "add-to" locations | Tooltip "Add Safety Data Sheet to: <locations>". One click adds the SDS to those locations. |
| You may add SDS, several locations, no default chosen | Tooltip **Add Safety Data Sheet to my library**. Opens the **Select location to add Safety Data Sheet** dialog. |
| You may not add SDS, but your organisation lets employees request SDS | Tooltip **Request Safety Data Sheet to be added to company library**. Opens an SDS request form pre-filled with the product, supplier, product code, revision date and language. |
| Neither | No (+) icon. |

Steps in the **Select location to add Safety Data Sheet** dialog:
1. Tick one or more locations in the location tree. An add-location icon (**Add location**) lets you create a location on the spot if you are allowed to.
2. Optional: under "Adding multiple Safety Data Sheets?" tick **Set the selected location as the default to streamline adding SDSs**. The next SDS you add then goes straight to those locations, and a **Location:** chip shows them above the results. Click the chip's "x" to stop using the default.
3. If your organisation requires an ERP number, fill in **Our ERP ID (required information)**. Without it you get "Please enter our ERP ID".
4. Click **Add** (disabled until at least one location is selected).

What you see afterwards:
- The result row expands with "Added to <location>" (green) or an error line.
- A results dialog **Add SDS results** lists each location: "SDS <name> added successfully to <location>", "SDS <name> from <supplier> added successfully to <location>", "SDS <name> has already existed on location <location>", or "Error when adding SDS <name> to location <location>". If the SDS replaced an older one: "Previous SDS is moved to **Archive**". If a newer revision exists, an update icon appears with the tooltip "SDS where a newer version exists. Click here to review".
- If an archived copy of the same SDS is already on the location: "An archived instance of SDS <name> already exist on location <location>" with an **Add anyway** button. **Add anyway** asks for confirmation: "An archived instance of this SDS already exist on this location. Try to unarchive it instead." / "Are you sure you want to add it again?" — buttons **Do it** or cancel.
- If the SDS approval flow is switched on, the dialog is titled "Saved — pending approval" with the banner "The SDS below are awaiting approval. They will appear at their locations once approved." Each line reads "awaiting approval for <location> (step <x> of <y>)" with the **Approval flow** name and **Approvers**, and a **View SDS** button opens the approval queue.
- If adding takes longer than the app waits for: "Adding the SDS is still in progress. It may already be in your library." The search re-runs; the SDS usually appears without a duplicate.

Permission messages when clicking (+):
- "This action is not available on your current subscription plan" — your plan does not include adding SDS from the global database.
- "You need an admin role to add SDS to library" — your role does not allow it.

You can also add from the SDS detail view: open a result and click **Add to SDS library**. If you administer only one location the SDS is added there directly; otherwise the location selector opens.

## Adding SDS from a location: the Add Safety Data Sheet dialog

In **Manage SDS Library**, open a location and click **Add Safety Data Sheet**. (Users who may not add SDS but are allowed to request them see **Request Safety Data Sheet to be added to company library** instead.)

The dialog is titled "Add Safety Data Sheet to <location name>" and contains the same database search as **Global SDS Search** ("Search for Safety Data Sheet in our Global Repository of 16 million+ Safety Data Sheets."; other screens say 18 million+, so confirm the current figure with SDS Manager), with filters for language, region and "Search only among SDS in use by <organisation>".

- Click (+) on a result to add it to the current location. If you administer more than one location, hovering or clicking (+) offers two choices: "Add <SDS> to <location>" or **Add to other locations** (opens the location selector).
- Each result shows its revision date, language and region; **View locations** shows where it is already used.
- Below the results, **Show other methods to add Safety Data Sheets to location** expands these options:

| Option | Description shown |
|---|---|
| **Create Kit** | "Kits are used when a single product actually consists of several components that belong together (for example, Part A + Part B), where each component has its own Safety Data Sheet (SDS)." Opens Kit Management. |
| **UPLOAD FROM URL** | "I know the URL where the Safety Data Sheet can be downloaded from the internet." |
| **MANUALLY ENTER PRODUCT** | "I cannot find any Safety Data Sheet file for my product. Until I get the Safety Data Sheet file, I want to store all the product information I know. The Safety Data Sheet file can be added later." |
| **IMPORT SDS-BINDER** | "I have a PDF-SDS Binder with all Safety Data Sheets I want to import to this location." |
| **IMPORT ZIP-FILE** | "I have all Safety data sheet files for this location in a folder on my PC. I have compressed the folder to a zip file and want to import them to this location." |

The **Add Safety Data Sheet** button itself is blocked with an upgrade prompt when the account's plan does not include adding substances.

When you search the library of a location (or **All my SDSs**) and nothing matches, the page can show "Similar results with partial match in your SDS library" and "Similar results found in our Global SDS Repository", so you can add or request the right SDS directly from there.

## When the SDS is not in the database: Google search, upload, or ask SDS Manager

If your search finds nothing useful, **Global SDS Search** offers three routes (Owners and Admins see all of them):

1. **Search with Google.** "Is your SDS not listed here?" / "Use our integrated Google search to find the SDS." Click **Search Google for "<keyword>"** (or **Search using Google**). Google opens in a new browser tab with a search for the safety data sheet of your product. The steps shown: "Click the Search button to rerun your search on Google (opens in new browser tab).", "Download Safety Data Sheet you find to your device.", "Switch back to this tab and drag & drop the file to your library."
2. **Upload the PDF.** Drag the file into the drop zone ("Drop your PDF, ZIP or RAR files here" / **Browse File**; on phones **Click here to browse files**). See "Uploading SDS files (PDF, ZIP, RAR)".
3. **Ask SDS Manager to find it.** "If you can't find the Safety Data Sheet for the product you're looking for, our team is here to assist. We'll add it to your library within 24 hours." Click **Click to request us to find it for you** (or **Ask SDS Manager to help**). Owners/Admins are first shown "Please search for the SDS on Google before requesting help from SDS Manager." with the Google button and the request button. The request form is titled **Request assistance from the SDS Manager team**.

After you return from Google, the page asks "Did you find the Safety Data Sheet through Google?"
- **Yes** → **Click here to browse files** and upload the PDF. "If you locate the SDS, download the PDF file to your device and upload it. Our system will automatically extract data from the PDF file, eliminating the need for any manual typing of data."
- **No** → "I did not find it. What should I do now?" expands "Here are your following options":
  1. "Save product information for "<keyword>" and find SDS later" — opens the manual product form (an SDS request). If requests containing the same keyword already exist, you first see "SDS requests with "<keyword>"" with up to 5 matches, **See more** and **Create new**.
  2. "Email distributor to get SDS — Click to send Email" — prepares an email to the vendor ("To (Use email address of vendor where you bought the product)"), copying you (and the account owner). If no location is known you first pick one ("Select location to save SDS request"). On success: "Your message was sent to the distributor. You can check it later via SDS Request page."
  3. **Request assistance from the SDS Manager team**.
  4. "Continue searching" — back to the search.

On the Free plan and during the free trial, the first "no exact match" also shows: "Our Promise: As a paying subscriber, you're guaranteed assistance - we'll locate the Safety Data Sheet for your product even if it's not yet in our database – at no extra cost. Read more". **Read more** opens "Let Us Find Your SDS – At No Extra Cost": "If you're on paid plan (Premium, Pro or Enterprise), we offer a personalized SDS-finding service — completely free of charge." Under "Send Us Your Product List": send an XLS file listing your products (the **send us** link opens an email to product_list_import_support@mail.sdsmanager.com; the trial Dashboard instead says to email your spreadsheet to support@sdsmanager.com, so confirm the preferred address with SDS Manager); the team will "Search for the corresponding Safety Data Sheets (SDS)", "Add the SDSs directly to your SDS library" and "Look for updated revision going forward".

## The Dashboard's add-SDS tabs

The **Dashboard** has a tabbed panel with every way to build the library. The last tab you used is remembered. On the regular (paid) dashboard the panel is shown to users allowed to add SDS from the global database; on the trial dashboard it is always shown. Tabs:

| Tab | What it says / does |
|---|---|
| **Search SDS Database** | "Search our database of 18 million+ Safety Data Sheets. Find your product, pick the right SDS, and it's added to your library instantly." (Other screens say 16 million+; confirm the current figure with SDS Manager.) Contains the global search bar with the **Take pictures** and **Barcode search** buttons. |
| **Scan Barcode** | "The fastest way to build your product list. Scan the barcode on each chemical container with your phone — SDS Manager records the product and finds the matching safety sheet automatically. Most teams add 100+ products in under an hour." Shows a QR code to open SDS Manager on your phone ("no app download needed"; it opens the **Add products by picture** page, available to Owners and Admins) and a **Start Camera Scanner** button for laptops/tablets with a camera. Tip: "No instant match? Just tap Save and keep scanning. You can review unmatched products later from your desktop and select the closest SDS — no need to stop your workflow." A scanned code is searched in the **Search SDS Database** tab. |
| **Scan Paper Binder** | Photograph the first page of each printed SDS; SDS Manager reads product and supplier, finds the matching SDS and "adds the most current version to your library automatically. If the sheet in your binder is outdated, we'll replace it with the latest revision". QR code for the phone, or **Open Binder Scanner** on a device with a camera. Tip: "Only the first page of each SDS is needed — that's where the product name and supplier are shown." |
| **Import Product List** | Upload a spreadsheet of your chemicals. "Where the product name and supplier match our database, the SDS is added automatically. Anything we can't match goes into your Tasks > Products Awaiting SDS list". Minimum requirements: at least product name and supplier columns ("The column names and order don't matter"). Only shown to users allowed to import product lists. |
| **Import SDS Files** | Upload PDF copies of your SDS (for example from SharePoint or a file server). "If we have a newer version in our database, you'll be prompted to upgrade". "Any files that can't be read are listed in Tasks > Products Awaiting SDS". Folder tip: zip the whole folder and SDS Manager recreates the folders as locations. "After uploading, you'll choose which location to assign the SDS sheets to." Includes an **Import SDS files overview** video. |
| **Migrate from other system** | Only shown to trial customers who said in the onboarding wizard that they use another SDS system. See "Migrating from another SDS system". |

You can hide the **Scan Paper Binder**, **Import Product List**, **Import SDS Files** and **Migrate from other system** tabs with the "×" on the tab (the search and barcode tabs cannot be hidden) ("Hide this tab from the bar. It's not deleted — you can bring it back any time from the three-dot menu (⋮) at the top right."). Opening **Import Product List** or **Scan Paper Binder** shows an upgrade prompt if your plan does not include product-list import or picture capture.

## Adding your first SDS: naming your SDS library

The first time anyone in a new account adds an SDS from **Global SDS Search** (and the library has not been named yet), SDS Manager first asks you to name the library:
- On the Free and Basic plans: "Before we add the first SDS, Let's name your SDS library." with the field **Name of SDS Library** ("Typically, your company name, site name, or department. The name will show on QR posters you generate").
- On other plans: "Do you want to organize SDS by locations where chemicals are stored or used?" ("With SDS Manager you can organize your SDS by sites/locations — This is recommended if you manage chemicals across multiple sites, as it simplifies maintenance of your SDS library."). Choose **Yes** ("I manage chemicals at multiple sites/locations.") to enter **SDS Library Name (typically your company name)** and **Location Name (e.g., Site, Department, or Building)**, or **No** ("I have a small number of chemicals and need a single list.") to enter only the library name.
- The button reads "Add <product> to SDS library". Errors: "Name of SDS Library can't be empty" and "Location name can't be empty".

## Uploading SDS files (PDF, ZIP, RAR)

If you already have SDS as PDF files, upload them and SDS Manager reads ("extracts") the content automatically, so no typing is needed: "Upload your SDS PDFs to SDS Manager; we'll automatically index them during import."

Where to upload (Owners and Admins):
- **Global SDS Search**: the drop zone "Drop your PDF, ZIP or RAR files here" / **Browse File** (on phones **Click here to browse files**).
- Dashboard tab **Import SDS Files**: **Browse Files** — "After uploading, you'll choose which location to assign the SDS sheets to."
- **More → Import ZIP Files** (page **Import your SDS files**).
- A location's **Add Safety Data Sheet** dialog → **Show other methods to add Safety Data Sheets to location** → **IMPORT SDS-BINDER** or **IMPORT ZIP-FILE** (both open the same file picker).
- A location's "…" menu → **Import SDS files** ("If you already have SDS files for chemicals, zip the files and import the files to SDS Manager").

What you can upload:

| Rule | Value |
|---|---|
| File types | PDF, ZIP or RAR |
| Mixing | PDFs and ZIP/RAR archives cannot be mixed in one upload ("Only one filetype is allowed for same upload."). Several PDFs, or several archives, are fine. |
| Files per upload | Up to 20 ("Maximum 20 files uploaded") |
| Size per file | Depends on the size (SDS allowance) of your plan: plans up to 400 SDS — under 25 MB ("File size limit exceeded (25MB)"); 401–9,999 SDS — under 500 MB ("File size limit exceeded (500MB)"); 10,000 SDS or more — under 5 GB ("File size limit exceeded (5GB)") |
| A PDF containing many SDS ("SDS binder") | Allowed; SDS Manager splits it into separate SDS |

Step by step:
1. Drop or browse the file(s).
2. The confirm dialog opens:
   - **Confirm upload** when the location is already known (you are on a location, or you administer only one location).
   - Otherwise **Select location(s) to add SDS**: tick the location(s) (shown: "<n> selected locations"; **Add location** creates one). PDFs can go to several locations at once; ZIP files to one location.
   - For a ZIP you can tick **Create new location(s) at the root level of the location hierarchy for files and folders in the zip-file**. "If the SDS files are organized in folders within your zip file, the import process will create sub-locations with the same name and hierarchy. The SDS will then be added to the corresponding location."
   - The box "I certify that I have read and accepted the Terms of Use and Privacy Statement regarding use of this service" is ticked by default; **Upload** is disabled if you untick it.
   - **Advanced options** (see "Upload options: private import, KIT SET, page range, searchable label").
3. Click **Upload**. The **Upload Status** window shows the upload percentage, then "Uploading and Analyzing": ZIP files first show "Decompressing <n>%", then each file gets a progress bar and a **SUCCESS** or **FAILED** chip. A file that already exists on the location also counts as success.
4. You can click **Close window and continue import in background**: "Import running in the background. Once completed, the SDS will be added to the SDS Library. Review any issues in Tasks → Products Awaiting SDS." (When you are replacing an existing SDS the window must stay open: "WARNING: Do not close this window while upload is processing".)
5. At 100% you get **Close** and **Show details**, or **Open import status page** if any file failed.

The results window (title **SDS Import Completed Successfully** for a single success, otherwise **File import status**) summarises:
- "<n> SDS was successfully added to your SDS library" — list **Successfully Added** ("SDS <name> [from <supplier>] added successfully to <location>"; "Previous SDS is moved to Archive" if it replaced one).
- "<n> SDS already existed in the library and was not imported." — list **SDS already existed on the location**.
- "<n> PDF was not imported successfully." — list **Failed** with **Fix failed imports** and "See details on the Import status page".
- "For some of the imported Safety Data Sheets we have newer versions in our database. Click here to see which SDS have newer version." For a single SDS that is not the latest, SDS Manager offers the newer version straight away ("We have a more recent version of this SDS in our database.").

How long processing takes is not stated in the application; large ZIP or binder files can be left to finish in the background and checked on the **Import status** page.

If an uploaded file was found through a barcode search, you are also offered **Yes - Link barcode to this SDS**.

## Upload options: private import, KIT SET, page range, searchable label

The **Advanced options** section of the upload confirm dialog:

| Option | What it does |
|---|---|
| **Private import** | "Imported SDS files will be marked as private for your organization's account and will not be included in our global selection of SDSs." The default can be set in **Settings** (**Default imported PDF files to Private**). |
| **Upload as KIT SET (SDS Binder)** | "Upload the SDS document as a KIT SET within one binder. Only available for single PDF file uploads." Adds **KIT name** ("Give this KIT SET (SDS Binder) a name so it can be identified and found in search.", max 500 characters). Not available for ZIP files, several files, or a page range. |
| **All pages** / **Pages** <from>–<to> | Import the whole PDF or only a page range (single location only). |
| **Searchable label** | "Enter a label to help find SDS after upload". "Used if you import a zip of chemicals for a car manufacturer. You can enter the car manufacturer here, and the SDS will then become searchable by the name entered also for OEM products where the car manufacturer name is not mentioned in the SDS file." |
| **Import files with tagged filename** | Imports using information in the file names (single location only; not with Private import). |
| **Special case import** / **Re-use previous uploaded files** | Marked "for SDS Manager internal use only" — leave unticked. |

## Importing a ZIP file with folders (Import ZIP Files)

**More → Import ZIP Files** (Owners and Admins) opens **Import your SDS files**: "The SDS Manager offers a distinctive feature that allows you to easily populate your online library with Safety Data Sheets by directly importing PDF files (electronic versions of Safety Data Sheets). This eliminates the need for manual typing."

"If your SDS files are organized in a folder hierarchy, you can compress the entire folder structure into a ZIP file. We will then automatically establish a location structure that mirrors your folder arrangement, adding the SDS to each location in a manner consistent with how they are stored on your file server." (This paragraph and the how-to video are not shown on the Free plan.)

1. Zip your SDS folder.
2. Drop it on "Drop your PDF, ZIP or RAR files here" or click **Browse File** ("In next step you will select the location you want to add the Safety Data Sheets to").
3. Choose the target location, or tick **Create new location(s) at the root level of the location hierarchy for files and folders in the zip-file**, then **Upload**.

The page lists **File recently added** (the 3 latest imports with location, file, product name, error and status); **Click here** to see all imported files on **Import status**.

Plan limits on ZIP files: if a ZIP holds more files than your plan has room for, the row shows "This ZIP file contains <n> files. However, your current plan permits adding only <m> more SDSs to your library. Click here to view upgrade options." On the free trial: "This ZIP file contains <n> files. Please note that the Free Trial plan allows a maximum of <m> SDS. To upload this entire ZIP file, please activate a paid plan".

## Importing an SDS from a web link (URL)

Use **UPLOAD FROM URL** ("I know the URL where the Safety Data Sheet can be downloaded from the internet.") in a location's add dialog (or **I have URL to SDS-PDF file** when replacing an SDS).
1. In **Import SDS from URL** — "Paste the Link/URL of the SDS you want to add to this location" — paste the address into **Link/URL**.
2. Click **Add**. Empty field: "Link/URL of the SDS can't be empty".
3. Processing shows in the **Upload Status** window. If it runs long: "This is taking longer than expected. The import continues in the background — check the selected location in a few minutes."

URL imports skip the confirm dialog, so there are no private/KIT/page options. In a product list import, the **Link to SDS** column serves the same purpose.

## When an uploaded file fails

A failed file shows one of: "FAILED", "Unable to split the file." (binder could not be split), "No text detected" (a scanned image without text), "Number of SDS in use exceed subscription plan size." (plan full — a link "Maximum SDS reached for current plan" leads to upgrade options), or "An archived SDS with this file already exist on this location" (with **Import anyway** in some upload screens, which asks "An archived instance of this SDS already exist on this location. Try to unarchive it instead." / "Are you sure you want to add it again?" → **Do it**). Every failed row links to "Learn more about solutions for handling PDF Import Failures" (SDS Manager's help centre).

For a single failed file the window explains "The file you uploaded was not a proper Safety Data Sheet file." and, if it could read the first page, "We identified this file:" (**Product**, **Supplier**, **Code**, **Rev**). If similar SDS are already in your library: "Matching SDS in your library:" with tags **Identical SDS** / **Newest version** / **Same date**, **View**, **Use this version** (puts that library SDS on the location instead), **See <n> other matches**, **No good match?**. Then **Options:**
- **Open file**
- **Ignore this file**
- **Retry import using OCR on file** (for scanned PDFs)
- **Add SDS to library with manually entered product information**
- **Request assistance from the SDS Manager team** (or **Cancel SDS request** / **Open SDS request** once requested)

If you uploaded the file after a Google search, the options are instead "Search Google again for a better file." and "Save "<product>" to Tasks -> Products awaiting SDS and find SDS later".

For several failed files: "One or more files had issues with import. See details on Import status page", and **Fix failed imports** steps through them ("File <x> of <y>", **Previous**/**Next**; resolved files show "This file has been resolved").

If your plan's SDS limit is reached during upload, a dialog says "You have reached the limit of Safety Data Sheets in your current subscription." / "Current plan is limited to <n> Safety Data Sheets". The account Owner sees **Show upgrade options**; others see "Contact the administrator to upgrade your subscription plan". When you are one SDS from the limit, or at it, a **Notice** says "You can now add one more SDS until you reach the SDS limit on your plan." or "You have now reached your SDS limit on your current plan. You must increase your plan size to add additional SDS to your SDS library."

On a location that had failed uploads, a banner reads "We discovered issues with one or more files during import. See details one the Import status page" with **Open import status page**.

## Import status page: tracking and fixing uploaded files

**Import status** (**Manage SDS Library → Import status** or **More → Import status**) lists every uploaded file and its outcome. The link "Learn more about solutions for handling PDF Import Failures" sits next to the title.

By default the page shows only files that need attention (in progress, failed, OCR in progress/failed, SDS request in progress). If there are none: "All files have been successfully imported" — **Show successfully imported files**.

Filters: **Filter by file name** (then **Include replaced/replacing**), **Location Filter**, **Select resolution**, **SDS status**, and **View files with IGNORE status**.

Columns: **Location**, **File** (opens the uploaded file), **No. of SDS** (SDS found in the file; expand a binder row to see each one), **Error**, **OCR Status**, **Uploaded date**, **Status**, **Actions**, **Resolution**, a comment icon (**Comment** → "Comment saved successfully") and **View linked SDS details**. Clicking a file with no SDS: "File is not linked to any SDS".

Statuses (**SDS status** filter):

| Status | Meaning |
|---|---|
| **In Progress** | Still being processed |
| **Successfully Imported** | SDS added to the library |
| **Replaced** | The file replaced, or was replaced by, another file |
| **Exists already** | The SDS was already on the location |
| **Import failed** | Could not be imported — see actions below |
| **Force Inserted By User** | Added with manually entered product information |
| **Imported using filename tags** | Imported from information in the file name |
| **OCR in progress** / **OCR failed** / **OCR complete** | Text recognition on a scanned PDF |
| **SDS request in progress** / **SDS request imported** | The file was turned into an SDS request |

The (i) on a failed status explains: "When SDS Manager fails to import the PDF file you uploaded you have the following options: 1. Delete the file and try to import the file again 2. If the file is a scan of a SDS (i.e., file is a picture of the SDS and does not contain the actual text) you can try the "Retry using OCR" option 3. Get a newer version of the SDS from your supplier or by searching the internet and upload that file instead. 4. If none of the above succeed, and you still need to add the file to your SDS library, you can click on the icon "Manually enter product information" and enter key information from the SDS manually."

Row actions on failed files:

| Action | What it does |
|---|---|
| **Retry using OCR** | Re-reads a scanned PDF with text recognition (Owner/Admin). Too many tries: "Too many attempts. Try again in …". |
| **Add SDS to library with manually entered product information** | Opens a form with **Product Name**, **Supplier Name** (both required, pre-filled where possible), **Revision date** and, if required, **Our ERP ID (required information)**; button **Add SDS to location "<location>"** → "Substance added successfully"; status becomes **Force Inserted By User**. A red dot means "We found a matching SDS in the SDS library. You can use it, or add the SDS to the library with manually entered product information." (**Use this SDS**) |
| **Replace with new SDS** | Find a better SDS in the database or upload a new file (Owner/Admin). Disabled with "This file is being used to replace another one." |
| **Add request for SDS** | Turns the file into an SDS request. Disabled with "This file has already been used for an existing SDS request, so it cannot be used to create a new one." |
| **Delete file** | "Confirm delete file" → **Delete** |

**Resolution** (track what you decided): **Unknown reason - investigate more**, **Need to find newer version**, **Need to contact supplier for new SDS**, **Waiting on supplier to provide new SDS**, **Ignore - imported new SDS covering this product**, **Ignore - Product no longer in use**, **Ignore - File is not an SDS**, **Need more information on how to resolve this**, **Waiting for someone to find a solution**, **The SDS has an outdated format**, **Other**. The three "Ignore - …" values are what **View files with IGNORE status** shows.

Bulk buttons:
- **Download all pdf files** (checked rows, or all filtered files) — "PDF files are downloading" → "Download complete" / "Download failed".
- With status filter **Import failed** or **OCR failed**: **Download failed files (Excel)**, **Retry all using OCR**, **Retry extraction**, and **Bulk Add SDS (Manual)** ("Insert multiple SDS by manually entering product information, bypassing automated extraction. Only SDS with detectable product and supplier names are supported." → "Bulk import completed: <x> of <y> files imported successfully." / "<n> files failed to import." / "No files to import with current filters.").
- With status filter **In Progress**: **Rerun files**.

## Scanning a paper SDS binder with your phone

If you have printed SDS, photograph the first page of each and SDS Manager adds the digital version. Open the Dashboard tab **Scan Paper Binder** (on a computer, scan its QR code with your phone, or use **Open Binder Scanner** on a device with a camera); this opens **Scan SDS Binder**: "If you already have printed copies of some or all of your Safety Data Sheets, getting started is easy. Simply use SDS Manager on your phone to take a photo of the first page of each SDS in your binder." — "SDS Manager will automatically recognize the product and retrieve the correct digital version from our database. If a newer revision is available, the most up-to-date version will be added to your SDS library."

1. Tap **Scan Safety Data Sheet** and photograph the first page.
2. **Product detected** — "Following product was detected:" (**Product Name**, **Supplier**, **Product Code**, **Language**). Under "Possible SDS detected:" you are asked "Is this the correct SDS?" (**Yes** / **No**); if none: "No matching SDS found for this binder."
3. Pick the **Location**, then **Save & Capture Next**, **Skip & Capture Next** or **Save & Done** ("Use "Save & Done" and start again to select another location.").
4. A confirmed SDS is added to the location ("Add substance successfully"). If no SDS was confirmed, the product is saved as a pending SDS request (Type **SDS-Binder**) and listed under **Pending SDS requests** on the same page (with **Find SDS** and **Delete**) and in **SDS Tasks**.

Errors: "Could not extract product information from the image. Please try again with a clearer photo of the SDS first page.", "Request too large. Please reduce the file size and try again.", "Error when processing image. Please try again.". Plans without the picture feature get an upgrade prompt on the Dashboard tab.

## Adding products by barcode scanning

You can scan the barcode (EAN or UPC) on a chemical container with a phone, tablet or laptop camera and let SDS Manager look it up. No app download is needed; the scanner runs in the browser.

Where to scan:
- **Barcode search** button next to the search box in **Global SDS Search** and the Dashboard's **Search SDS Database** tab. Tooltip: "Scan the barcode on your product and we'll look it up in our SDS database — often we find it directly. Not found? Once you manually pick the right Safety Data Sheet, we link the barcode to that SDS so your employees can later find it by scanning the barcode."
- Dashboard tab **Scan Barcode**: **Start Camera Scanner** on the device you are using, or (on wider screens) a QR code under **Open on your phone** ("Point your phone camera at this code"). The QR code signs your phone in as you and opens the **Add products by picture** page, which only Owners and Admins can use.
- Typing a valid EAN/UPC number into the search box is also treated as a barcode search.

How the scanner works: a full-screen **Barcode Scanner** opens (back camera preferred). Hold the barcode inside the highlighted area; a code is accepted once it has been read steadily. If nothing is read within about 5 seconds, the scanner offers "Can't scan the barcode?" — **Take a photo of the product instead** (**Take photo**), which switches to the label-photo flow. Supported formats: EAN-13, EAN-8, UPC-A and UPC-E.

What happens after a scan in the SDS search:
- Matches: "<n> Safety Data Sheet found" and the result list; add the right SDS with (+).
- When you add an SDS after a barcode search, a dialog **Adding SDS** asks "Do you want to link this SDS to the barcode you just scanned (<code>)?" — **Yes - Link barcode to this SDS**, **No - Add SDS without linking to this barcode**, or **Not sure? Scan barcode again** (if the rescan reads the same code: "The scanned barcode matched the original barcode"). Linking stores the code on the product (as UPC for US/Canada accounts with a valid UPC, otherwise as EAN), so employees can later find it by scanning.
- Barcode unknown: "Barcode not recognized" — "Please try searching for the Safety Data Sheet (SDS) by entering the product name in the search bar above. Once you find the correct SDS, you can link it to the scanned barcode for future reference." A box offers **Take pictures of product** ("The product and manufacturer will be detected from the image.").
- Barcode known but no SDS match: "No Match for scanned Barcode"; SDS Manager searches by the product name it knows for that barcode and shows "Below are the closest matching Safety Data Sheets." / "If none of these are correct, take a picture of the product."
- Results but none right: "If none of the above Safety Data Sheets match your product, please take a photo of the product".
- Nothing at all: "No good results found".
- To save the product and continue: **Save product and find SDS later** (or **Save & Scan Next** when a product name is known). The product is saved without an SDS to the current location (or you are asked "Choose where this product is used" in **Select location**) and you see "Product saved to Tasks → Products Awaiting SDS". The barcode is stored with it. Dashboard tip: "No instant match? Just tap Save and keep scanning. You can review unmatched products later from your desktop and select the closest SDS — no need to stop your workflow."

## Scanning a barcode to find a product already in your library

The **Scan barcode** icon in the page header (and a round **Scan barcode** button on SDS library pages) looks the code up in your own inventory rather than the global database:
- One match: the **Manage Stock** dialog opens for that product. (Scanning a container/lot QR label created in SDS Manager opens **Manage Stock** directly.)
- Several matches: "Multiple matches found — This barcode matches multiple substances in your inventory. Select the one you want:" (**Scan again**, **Cancel**).
- No match: "Product not found — No substance in your inventory matches this barcode." with **Search manually** (searches the global database or your library with the code), **Register barcode to existing substance**, **Scan again**, **Close**.
- **Register barcode to existing substance**: "Select a substance in your inventory to link with the scanned barcode:" — search "Search by product name or supplier" (products already carrying a code show "Current code: <code>"; no hits: "No substances found"), pick one, then "Link barcode <barcode> to "<product>"?" ("Existing code <code> will be replaced." if it had one) → **Confirm** → "Barcode registered to substance" (or "Failed to register barcode. Please try again.").
- Errors: "Invalid barcode format", "Error looking up barcode. Please try again."

Other ways to attach a barcode to a product in the library:
- When a library search for a barcode finds nothing, the library shows closest matches; on the right SDS click **Link barcode to this SDS**. You must confirm the product name ("To ensure accurate product identification, please confirm that the product name exactly matches the name on this Safety Data Sheet (SDS), then rescan the barcode to complete the verification.") and rescan the same code → "This barcode is now linked to this Safety Data Sheet". Available to users who can edit SDS on the location, and to QR-code users if the Owner has turned on **Allow QR users to add Barcodes to SDS in library** (User management).
- A product's more-actions menu: **Add EAN code** / **Edit EAN code** / **Add UPC code** / **Edit UPC code** ("You can add multiple codes separated by comma"; the scanner opens automatically) → "Substance edited successfully", or "Invalid EAN-code" / "Invalid UPC-code".

Barcode rules: an EAN must have 8–13 digits and a UPC exactly 12 digits, each with a valid check digit.

## Adding products by photographing the label

Photographing product labels is a fast way to inventory a site: "snap a photo of the product label, type in a portion of the product name, hit "Save," and move on to the next item. This efficient method enables you to rapidly catalog hundreds of products in SDS Manager within an hour or less." There are two photo flows.

**1. Take pictures (with automatic product detection)** — the **Take pictures** button next to the search box in **Global SDS Search** / the Dashboard search tab, **Take pictures of product** after a failed barcode search, or **Take photo** in the scanner.
1. The dialog **Take pictures of product** opens the camera (gallery, shutter and switch-camera buttons). Take up to 3 photos ("You can only add 3 pictures."; after a first attempt: "Add up to 3 photos for better detection").
2. Click **Done**: "Image processing in progress". SDS Manager reads the product name, supplier and barcode from the photos and runs an SDS search with them.
   - Nothing read: "We could not detect the product name from the picture." — "Please type in the product name above and click search icon."
   - Similar results only: "Below are the closest matching Safety Data Sheets." plus a save button.
   - Exact results: "Not ready to decide on the Safety Data Sheet now?" plus a save button.
   - Processing failed: "Failed to process product label".
3. Or click **Save & Scan Next** (also offered if processing takes long): the photos are saved as a product right away and detection continues in the background — "Processing in background. Check progress in Tasks → Products Awaiting SDS." The camera resets for the next product.

**2. Add products by picture page** — **More → Shoot pictures of labels of your chemicals** (Owners and Admins).
- Step 1: "Add products to library by taking pictures of labels" — "Use your phone to add your products to SDS Manager. Simply take a picture of product labels, type in the product name and hit Save". Button **Take picture of the product label**.
- On a computer the page also shows a QR code: "Scan the QR code to open SDS Manager on your phone to take a picture" (shown under the heading "No camera detected on device" on any wide screen). Scanning it opens the page on your phone, signed in as you.
- The button opens the product form with the camera running and your default location filled in: up to 3 label photos, **Product Name** (required), **Supplier Name** (optional when a photo is attached), location (required) and the other request fields. **Save** → "Substance added successfully". On this page you type the name yourself.
- Step 2: "Find safety data sheets for photographed products" lists them (**Name**, **Supplier Name**, **Picture**) with **Find SDS** (opens the **Find SDS** page) and **Delete** ("Confirm delete SDS <name> permanently" → "Successfully deleted SDS <name> permanently"). Empty list: "Here you will find products you have photographed". **Show All** opens **SDS Tasks**.

Photographed products are products without an SDS; they appear in **Pending Tasks → Products Awaiting SDS** with **Type** **Picture**, where you (or SDS Manager, on request) find the SDS.

Camera and image messages:

| Message | Meaning / what to do |
|---|---|
| "Requested device not found" | No camera found by the barcode scanner. Use a device with a camera. |
| "Can't access your camera" | Camera permission denied. Allow camera access for the site in your browser settings. |
| "Device does not have camera" | No camera; the file picker opens so you can choose a photo instead. |
| "No access to camera device" | Camera permission denied; you can choose an existing photo instead. |
| "Device has only one camera" / "Switch to camera <n>" | Shown when pressing switch-camera. |
| "Uploaded file is not a valid image. Only JPG, PNG and GIF files are allowed" | Choose a JPG, PNG or GIF image. |
| "Failed to process product label" | Detection failed; retake the photos or type the name. |

## Importing a product list from Excel or CSV

If you already have a spreadsheet of the chemicals you use, you can import it as a product list. Each row becomes a product in your library; SDS Manager then looks for the matching SDS. Products it can match are linked to an SDS; the rest wait in **Tasks → Products Awaiting SDS** for you (or SDS Manager) to find the SDS.

Where to start:
- **More → Import product list** (Owners and Admins), the avatar/profile menu item **Import product lists**, the Dashboard tab **Import Product List**, or the onboarding checklist ("I already have an XLS list of the chemicals we are using" → **Import XLS File**).
- The page is titled **Import product lists**: "With SDS Manager you can import lists of chemicals in xls or csv format and later find the corresponding Safety Data Sheets for the chemicals." The link **Template file for product list** (after "See an example of a product file here:") opens an example in SDS Manager's help centre.
- Tips on the page: "If you have multiple departments in your company, e-mail the product list template to your department managers, and ask them to fill in information about chemicals used in their department." "You can include information about the location of the chemical in the product list to ensure that the chemical is linked to the location where the chemical is used." "You can import multiple lists."

Step by step:
1. **Prepare Product list file** — "Make sure that all the rows in the file has at least the product- and supplier name present". Click **Continue**.
2. Click **Import product lists** to open the import wizard.
3. **Upload Product list** — drop or **Select file**: "Upload .xlsx, .xls or .csv file". The step lists "Data we expect to receive:" (the fields below). If reading fails: "Upload failed".
4. For a workbook with several sheets, choose the sheet to import (the screen is titled "Select the Safety Data Sheet to be used", but it means the worksheet). Only one sheet is imported per run.
5. **Select header row** — click the row that holds your column names.
6. **Match Columns** — for each of your columns (**Your table**) choose what it **Will become**, or leave it as **Column ignored**. Columns with familiar names are matched automatically. Each target can only be used once ("Another column unselected" / "Cannot duplicate columns"). If a required field is not matched: "Not all columns matched — There are required columns that are not selected or ignored:".
7. **Validate data** — shows **Total Rows:** and highlights errors. Use **Show only rows with errors** and **Discard selected rows** to clean up. Rows with errors cannot be imported: "There are still some rows containing errors." Click **Confirm**.
8. If some rows have no Location, choose one: "Select the location you want to add the SDS to" → **Submit**. (If you administer exactly one location it is used automatically.) Closing this dialog cancels the import.
9. Answer "Do you want us to automatically add Safety Data Sheets to your library when we find a SDS with identical product name and supplier name?" — **Yes** or **No**.
10. The list appears in the table on the page and is processed in the background.

Leaving the wizard asks "Exit import flow — Are you sure? Your current information will not be saved." (**Exit flow**).

Fields you can map in **Match Columns**:

| Field | Notes |
|---|---|
| **Supplier Name** | Required ("Supplier name is required") |
| **Product Name** | Required ("Product name is required") |
| **Vendor Email** | "Email of company you buy this product from". Only one vendor email per supplier in a file: "Supplier <name> has multiple vendor emails. Only one email can be used per supplier." |
| **Product Code** | Article number |
| **CAS no.** | CAS number |
| **Amount** | Must be numeric ("The value must be numeric."); a decimal comma is accepted |
| **Measurement unit** | Unit of the amount |
| **Location** | Links the product to a location (for example "Room A"). Rows without it get the location you pick in step 8. |
| **Link to SDS** | "Here you add the URL to the SDS if you know it" |
| **SKU** | "For use by ecommerce solutions" |
| **External system Id** | "Use this field for your ERP system internal id used for the product" |
| **EAN** | One or more EAN codes, comma-separated; each 8–13 digits with a valid check digit, else "Invalid EAN-code: <codes>" |
| **UPC** | One or more UPC codes, comma-separated; each 12 digits with a valid check digit, else "Invalid UPC-code: <codes>" |
| **Require SDS** | Y/N — whether the product needs an SDS |
| **[CF] <name>** | Your account's custom fields |

Custom fields and dates:
- **Add custom field** (on the Match Columns step) opens **Select more columns → Custom Fields**. Users allowed to manage custom fields can create one there (**Create new custom field**: **Field name**, **Field type** Text/Numeric/Date/Enumerated type, enum values). Errors: "Field name can't be empty", "Field type can't be empty", "Please enter at least one value of enumerated type".
- If you have Date custom fields, **Date Format** lets you pick the format used in your file ("Select the date format used in your Excel file."): YYYY-MM-DD (default), MM-DD-YYYY, DD-MM-YYYY, YY-MM-DD, MM-DD-YY, DD-MM-YY, or the same with "/". A wrong value gives "Invalid date format or value.Expected format: <format>." Use a four-digit year: with a two-digit year format, years other than "00" are saved as 19xx.

After the import:
- Warnings may appear above the table: **Some location paths were skipped** ("…location path(s) are deeper than the maximum location depth, so they were not created. The products under them were imported without a location — please set it manually.") and **Some locations were not used** ("…you do not have access to <n> location(s) in the file, so they were not used. The products under them were imported without a location — ask an administrator for access, or set the location manually.").
- The imported-lists table shows **File name** (click to download the original file), **Number of products**, **Number of unmatched products** (a link that opens **Products Awaiting SDS** filtered to this file), **Number of matched products**, progress (spinner while processing, **Import failed** if it failed), and action icons. Rows refresh automatically while processing.
- **Find SDS for imported chemicals** opens **SDS Tasks** (Products Awaiting SDS) in a new tab.
- Delete a list with the bin icon: "Confirm delete <name> permanently" → **OK** → "File deleted successfully". What happens to products already created from the list is not described in the application.

When a list import fails or stalls, the info icon explains why:

| Message | Meaning / what to do |
|---|---|
| "Still queueing <x> of <y> import batches. Please wait — they are being queued in the background." | Still in progress; wait. |
| "<x> of <y> import batches were not queued because the server was busy. Retry to queue them." | Click **Retry import**. |
| "<x> of <y> import batches could not be queued. A retry may fail the same way — contact support if it does." | Retry once; contact support if it fails again. |
| "<x> of <y> import batches were not queued." | Retry. |
| "A retry is already running. Try again in <n> s." | Wait the shown seconds. |
| "This import can no longer be retried. Please import the file again into the same location." | Re-import the file. |
| "All remaining import batches were queued." / "Queued <x> import batches. <y> still pending — retry again to continue." | Retry results. |

## Uploading SDS PDFs for an imported product list

If you have SDS files for the products in an imported list, you can upload them against the list and let SDS Manager pair each file with a product.

1. In the imported-lists table, click the upload icon on the list (shown while it has unmatched products). Tooltip: "Upload SDS PDFs (or a ZIP of PDFs) for the products in this list. Each file is automatically matched to a product, then you review and confirm the suggested matches."
2. In **Upload SDS files for product list**, drop files ("Drag & drop files here, or click to select" — "Accepted: PDF files or a ZIP of PDFs").
3. Wait while "Processing <x> of <y> files…" runs.
4. Review: "<x> of <y> files matched to a product." The table shows **Product name**, **Supplier**, **Location**, **Suggested SDS**, **Revision date**, **Action**. AI-made matches carry the chip **AI suggestion**; files that matched nothing show "No match found".
5. For each row click **Confirm to match** (account Owner only) or **Not match**. Confirmed links: "<n> SDS linked successfully."
6. Undecided suggestions remain; the list's **Review SDS suggestions** icon (with a count badge) reopens the review. When none are left: "There are no suggestions left to review."

The same suggestion also appears on the product's **Find SDS** page as "Suggested SDS from a previous upload" with **Rule-based match** or **AI suggestion**, the **Match score**, and **Confirm match** (Owner only).

## Products without an SDS: SDS requests and Products Awaiting SDS

A product can be in your library before its SDS is. Such a product is called an **SDS request** (other names in the app: "substance with missing SDS", "task", "product awaiting SDS"). It is created when you:
- enter a product manually (**MANUALLY ENTER PRODUCT** / **Add SDS request**),
- save a scanned barcode or label photo that did not find an SDS (**Save product and find SDS later** / **Save & Scan Next**),
- import a product list where a row could not be matched,
- turn a failed upload into a request (**Add request for SDS** on **Import status**; the Dashboard also says "Any files that can't be read are listed in Tasks > Products Awaiting SDS"), or
- an employee requests an SDS (**Request Safety Data Sheet to be added to company library**).

All of them are handled on the **SDS Tasks** page (menu **Pending Tasks**; the page heading is **Tasks**). On-screen messages call it "Tasks → Products Awaiting SDS".

Tabs (each with a count badge):

| Tab | Tooltip / content |
|---|---|
| **Products Awaiting SDS** | "SDS requests imported from XLS or added via barcode/picture that have not yet been matched with an existing SDS." |
| **SDS requests** | "SDS Requests created using the "Add request for Safety Data Sheet" dialog, with or without a linked SDS." |
| **Pending my approval** | "Tasks assigned to you that require your review or approval." (the **Assigned user** filter is fixed to you) |
| **SDS Awaiting Approval** | "SDS files in the approval flow. Items here are visible only to configured approvers until every step is signed off." |
| **Completed tasks** | Opens **Completed SDS requests** (columns **Requested Product**, **Matched SDS**, **Date**, **Matched By**, **Actions**; actions **Un-match SDS** and **Report error**). |

Without a tab in the address, the page opens the tab with the most items.

Filters: search box "Search for Tasks", **Location Filter**, **Import File** (pick one imported product list, or **All**), **Task status**, **Vendor reply status** (**All** / **With replies from vendors** / **Without replies from vendors**), **Assigned user**.

Columns on the request tabs: **Product Name**, **Supplier Name**, **Locations**, **Type**, **Revision request**, **Task status** (changeable in the row; "SDS request status is successfully saved"), **Due Date**, **Assigned to**, label photos, **Comment**, actions.

**Type** shows how the request was created: **Barcode**, **Picture**, **Search**, **XLS import**, **Request** (employee/QR request) or **SDS-Binder**.

Row actions:

| Icon | Meaning | Shown when |
|---|---|---|
| **Find SDS** | Opens the **Find SDS** page to match an SDS | Status is not Needs review; active only for Admin, Admin with approval or Owner on that location |
| **Manage SDS request** | Review an employee request | Status is Needs review |
| Request-assistance icon (greyed) | Hint: "To request assistance, first click Find SDS. If not found, use Google Search. You can then request help from the SDS Manager team." | Not yet sent to SDS Manager |
| **Cancel SDS request** | Withdraws the request to the SDS Manager team ("Cancel assistance request from the SDS Manager team successfully") | Already sent to the team |
| **Vendor Email** | Vendor messages for the product | A vendor email exists |
| **View request details** | Opens and edits the request (title **SDS Request**) | Always |
| **Message from the administrator** | Shows a message on the request | When there is one |
| **This product does not have an SDS** | Adds the product to the library without an SDS | Owner/Admin, no SDS linked |
| **Delete permanently** | Deletes the request | Owner/Admin |

**Bulk Action** (select rows first; otherwise "You must select at least 1 checkbox from the list below"): Owners/Admins get **Request assistance from the SDS Manager team**, **Cancel SDS request** and **Delete permanently**; Admin Light gets the first two; on **SDS Awaiting Approval** the only bulk action is **Approve**.

Task statuses:

| Status | Notes |
|---|---|
| **New** | Default for new requests |
| **Request for product approval** | |
| **Requested from supplier** | |
| **Needs review** | Default for employee requests; opens **Manage SDS request** |
| **Approved**, **Pending**, **Available on (date)** | Can be set when editing |
| **Processing image**, **Ready to find SDS**, **Failed to process image** | Label-photo processing states |
| **SDS Binder** | Created from an SDS binder import |
| **Declined**, **Completed**, **SDS not available**, **Confirmed on location**, **Unable to match** | Closed states (not in the default status filter) |
| **Reported as a mismatch** | |
| **Rejected by customer** | Set automatically when you reject a close match; cannot be chosen manually |

When an automatically closed request needs another try (no SDS arrived from the supplier), open **Archive → Archived SDS Requests** and click **Reopen request**: "This request was closed because no SDS was received. Add the details the supplier was missing — supplier name, product code, EAN/UPC or a photo of the product label — and we will ask again." → "The SDS request was reopened."

## Entering a product manually (Add request for Safety Data Sheet)

Use this when you have no SDS file yet but want the product recorded. Open it with **MANUALLY ENTER PRODUCT**, **Add SDS request** on **SDS Tasks**, or "Save product information for "<keyword>" and find SDS later" after a Google search.

The dialog **Add request for Safety Data Sheet** has:
- a product-label photo area (**Take pictures of product**, up to 3 photos) and **Attach SDS file**,
- **Product Name** (required), **Place of purchase**, **Supplier Name** (required unless you add a label photo), **Product Code**, language, **Location** (required),
- **Show more options**: **Purchase Year**, **EAN code** and **UPC (barcode)** (each with a barcode-scanner icon), **URL to the distributors product page where the product can be ordered** ("If an online product page is not available, please provide the distributor's website URL."), **SDS Request status** (**New**, **Request for product approval**, **Requested from supplier**, **Needs review**), **Due Date**, **Comment**.
- **Save** → "Substance added successfully".

Validation messages: "Please select a location where the product is used", "Product name can't be empty", "Supplier name can't be empty", "Invalid EAN-code", "Invalid UPC-code".

Help text in the request details: "This approach is employed to provide details about a product for which you currently do not have the SDS file. Please reach out to your supplier to obtain the SDS. Once you receive the PDF file from your supplier, go to our page for SDS Requests and upload the received SDS file."

**This product does not have an SDS**: "Select this option if no Safety Data Sheet is available for the product. When added to the library, employees searching for it will see the message: "This product does not have a Safety Data Sheet"." Available to Owners/Admins from the task row, the **Find SDS** page and **Manage SDS request**. Confirm adds the product ("Add substance successfully"; failure "Failed to add substance"); the change log records "Added products to the library (without SDS)." For a library product that has no SDS, the more-actions menu offers **Find SDS for product**.

## Requesting help from SDS Manager to find an SDS

"If you can't find the Safety Data Sheet for the product you're looking for, our team is here to assist. We'll add it to your library within 24 hours."

1. Search first. Owners/Admins clicking **Click to request us to find it for you** are shown **Select action** — "Please search for the SDS on Google before requesting help from SDS Manager." — with **Search using Google** and **Ask SDS Manager to help** / **Click to request us to find it for you**.
2. The form **Request assistance from the SDS Manager team** requires product name, **Place of purchase**, **Purchase Year** and location ("Place of purchase can't be empty", "Purchase year can't be empty"). Help text: "To assist you in finding SDS for this product you must as a minimum enter Product name, Distributor name and approximate year of purchase of product" (the distributor is the **Place of purchase** field).
3. Confirmation: "Product saved to Tasks → Products Awaiting SDS".

For products already in **SDS Tasks**, select them and use Bulk Action → **Request assistance from the SDS Manager team** (confirm with **OK** → "Update successful"). Cancel with **Cancel SDS request**. Request assistance is not offered per row until you have tried **Find SDS** and Google.

## Employees requesting an SDS to be added

If the account Owner has switched on the setting **Allow employees to request Safety Data Sheets to be added to Safety Data Sheets library** (in **Settings**), users who cannot add SDS themselves can still ask for one:
- In **Global SDS Search**, the (+) on a result reads **Request Safety Data Sheet to be added to company library** and opens a request pre-filled from that SDS (**Product Name**, **Supplier Name**, **Product Code**, language, plus **Place of purchase**, **Location**, **Reason behind requesting this SDS**). **Submit request** → "SDS Request submitted". The request gets status **Needs review**.
- On a location page they see a button **Request Safety Data Sheet to be added to company library** instead of **Add Safety Data Sheet**.
- Employees who log in with a QR code get a menu item **SDS requests** (short label **Requests**), but only if their QR user also has **Allow SDS Request creation** (set by an Owner/Admin in User management).
- Users without access to location management (for example Read only) must also give **My email address** and **Place of purchase** ("Email cannot be empty", "You have entered an invalid email address", "Place of purchase can't be empty"), and can choose only locations where they are Read only or Staff.

The admin then handles the request in **SDS Tasks** (**Manage SDS request**): review the product, **Find SDS** or **Match** an SDS, then **Add to SDS library** (optionally ticking "Notify <email> SDS is added to library").

## Finding and matching an SDS for a product (Find SDS page)

The **Find SDS** page (heading **Match SDS**) opens when you click **Find SDS** on a task or **Find SDS for product** on a library product.

1. The product card shows what is known: **Location**, **Product**, **Product Code**, **Supplier Name**, **Place of purchase**, CAS no., **Purchase year**, **Type**, **SDS Request status**, **Comment**, **Created**, **EAN code**, **UPC (barcode)**, **Link to SDS**, **Vendor Email**, **Require SDS**, custom fields, label photos and comments.
2. If an SDS was suggested from an upload, a banner "Suggested SDS from a previous upload" offers **Confirm match** (Owner only). If the requester attached a file, it is listed under "SDS File has been attached to this SDS Request".
3. Use the built-in global search (**Exact match search results:**, **Show similar results**), or the upload, URL, **Search using Google** and request-assistance options below it.
4. On the right SDS click **Add to SDS library** ("When clicking this button, this Safety Data Sheet will be added to the library and linked to the substance you are searching for. You confirm adding the safety data sheet in the next step"). With the approval flow on, the button is **Register my approval**; for employee requests and attached files it is **Match**.
5. In **Select data to link**, choose per field whether to keep **Info from SDS request** or **Info from SDS** (**Use this data**), fill **Our ERP ID (required information)** if your account requires it, optionally tick "Notify <email> SDS is added to library", then click **Add SDS to "<location>"**. If the same product is requested at several locations (and approval flow is off) you can click **Add SDS to all <N> locations where this product is used**. For an update of an existing SDS the dialog is titled **Replace current SDS with new SDS** (**Current SDS info** / **New SDS info**).
6. If the SDS is already on that location: archived → **Undo Archive** ("Successfully Unarchived SDS for <name>"); active → "Already in the SDS library at <location> as <product>" with **Complete request using existing SDS** ("Close this SDS Request against the substance already on this location. No new substance is created.") → "Request confirmed against the substance already on the location."

Permissions: adding/registering approval needs the Owner, or an Admin who has the **Admin with approval** role on the location; otherwise the button says "Contact the user who has Admin with approval role for the location". If the product cannot be opened: "We could not load this product. It may have been deleted, archived, or you may no longer have access to its location." (**Go back**). The page header also offers **This product does not have an SDS** (Owner/Admin).

## Close match approval

When SDS Manager's sourcing team finds an SDS that is a close (not exact) match for one of your requests, it is proposed to you on **Close match approval** (menu **Manage SDS Library**, visible only while proposals are waiting).

Each item shows two rows: **Request** (your product name, supplier, product code, purchase year, location) and **Propose** (the proposed SDS, with **View PDF**), with differences highlighted. Columns: **Product Name**, **Supplier Name**, **Product Code**, **Revision date** (shows the purchase year on the Request row), **Location**.

Actions:
- **Approve** — links the proposed SDS: "Approved successfully".
- **Reject** — "The SDS will be unlinked and sent back to our sourcing team." You must answer "Why was this SDS rejected?" ("Please explain why this SDS was rejected."). Result: "SDS was rejected and returned to our sourcing team." and the request status becomes **Rejected by customer**.
- **Upload PDF** — use your own SDS file instead, then choose the data to link.
- Comments and **View change log** (log entry "SDS match pending approval").

## SDS approval queue (SDS Awaiting Approval)

If your organisation has switched on the **SDS approval flow** (in **Settings → SDS Approval Flow**), new SDS do not appear in the library straight away: "When approval flow is enabled, every SDS added to a location is held as pending and must move through the steps below in order. At each step, any one of the assigned users can approve to advance the SDS to the next step. After the final step is approved, the SDS becomes active at the location." The flow can be the same for all locations or differ per location.

Held SDS are listed under **Pending Tasks → SDS Awaiting Approval** with **Waiting for** ("Step <x> of <y>", step name, **Approvers:**). Owners/Admins get a login reminder "SDS waiting for your approval — There are <n> Safety Data Sheets pending approval. Review them so they can appear in the library." (**Review pending**).

- **Approve** — shows **Approval history** and **Comment (optional)**; on the last step the button is **Approve and add SDS to library**. Results: "Approval step completed" or "SDS fully approved". If you approve every step of a flow you may be asked "Approve all steps at once?" (**Approve all steps** / **Approve current step only**).
- **Reject SDS** — "This will reject the SDS and remove it from the approval queue. The requester will be notified." → "SDS rejected".
- **See approval flow details** — shows the flow that applies.
- Bulk Action → **Approve**: "The following <n> item(s) will be approved:" → "<a> fully approved, <b> advanced to next step, <c> skipped." If none qualify: "None of the selected SDS can be approved by you at their current step."
- Not your step: "You are not eligible to approve this step".
- If approval is later turned off, held items stay: "SDS approval is turned off, so new SDS skip approval. The SDS listed here were held before it was turned off — approve one to release it into the SDS library, or reject it to remove it from the approval queue."

When you add an SDS while the flow is on, the add-result dialog is titled "Saved — pending approval".

## Migrating from another SDS system

Customers coming from another SDS system can have SDS Manager move the library, including the location structure. On the dashboard's **Migrate from other system** tab: "Already using another SDS management system? Our team will move your SDS library — including location structures — into SDS Manager for you. Typically completed within one business day."
1. "Share a link to your SDS library with us. Our migration team uses it to read your current data; you don't need to export anything yourself." Button: **Send access link to SDS Manager** (opens a contact form).
2. "Our team will migrate your SDSs, including location structures, to your new SDS Manager account within 5–7 business days."
3. "You'll receive an email confirmation once your data has been imported into your SDS Manager account."
4. "If you're satisfied, start your subscription. If not, we'll part ways as friends — no hard feelings!"

Note the two timings shown on that tab (one business day in the intro, 5–7 business days in step 2); confirm the expected time with SDS Manager support.

## Rules, limits and edge cases

- **Search length**: a simple search needs at least 3 characters; in advanced search at least one of product name, supplier name or product code needs 3 characters, or the ingredient field 4.
- **Search language and region** default to your own language and region (UK accounts also get EU); choices are remembered in your browser.
- **Upload file types**: PDF, ZIP or RAR only; do not mix PDFs and archives in one upload. Other file types are not accepted by the upload zone.
- **Upload count and size**: max 20 files per upload; per-file size limit 25 MB, 500 MB or 5 GB depending on your plan's SDS allowance (up to 400, 401–9,999, 10,000+). The trial Dashboard's **Import SDS Files** window says "Files up to 200 MB each"; the upload itself applies the plan-based limits above, so confirm with SDS Manager if a file is rejected.
- **ZIP uploads** go to one location (or to new root-level locations built from the ZIP's folders). PDFs can go to several locations at once.
- **KIT SET** uploads only work for a single PDF with all pages.
- **Plan SDS limits**: uploads and additions stop when the plan's SDS allowance is reached ("Number of SDS in use exceed subscription plan size."). Exact allowances per plan are not listed in the application; see your subscription page or ask SDS Manager.
- **Duplicates**: a file or SDS that already exists on the location is reported as "already existed" and not imported again. If only an archived copy exists, you are warned and can still add it (**Add anyway** / **Import anyway** → **Do it**); unarchiving the old one is suggested instead.
- **Newer versions**: if SDS Manager's database has a newer revision than the file you uploaded, you are told and offered the newer version.
- **Approval flow**: when **SDS approval flow** is on, every SDS added by any method is held under **SDS Awaiting Approval** until approved; it is not visible in the library before that.
- **ERP ID**: if your organisation requires an ERP ID, every add-to-location dialog asks for **Our ERP ID (required information)** ("Please enter our ERP ID").
- **Label photos**: up to 3 photos per product; JPG, PNG or GIF when picking a file. A label photo makes the supplier name optional when saving a product.
- **Barcodes**: EAN 8–13 digits, UPC 12 digits, valid check digit required; several codes can be stored, comma-separated.
- **Product list import**: .xlsx, .xls or .csv; product name and supplier name required on every row; rows with errors must be fixed or discarded; one sheet per import; one vendor email per supplier; locations deeper than the maximum depth, or locations you cannot access, are not used. Use four-digit years for date custom fields.
- **Product list SDS upload**: confirming a suggested match is for the account Owner only.
- **Supplier (live) search** only works for suppliers SDS Manager has a connection to, and needs the supplier name plus a product name or code in the search.
- **Free SDS-finding service**: the UI says it is offered on paid plans (Premium, Pro or Enterprise); "We'll add it to your library within 24 hours" is the time stated for assistance requests. Other processing times (PDF/ZIP extraction) are not stated; supplier-site imports "can take several minutes".
- **Migration timing**: the Dashboard shows both "Typically completed within one business day" and "within 5–7 business days"; confirm with SDS Manager.
- **Internal tools**: the "SDS splitter" page, the "Import translations" page and upload options marked "for SDS Manager internal use only" are SDS Manager staff tools and not for customers.

## Messages and errors users may see

| Message (exact text) | Meaning | What to do |
|---|---|---|
| "Search must contain at least 3 characters" | Search text too short | Type at least 3 characters |
| "No exact SDS match found for <keyword>" | No exact hit in the database | Check similar results, try fewer words, use Google, or request help |
| "Not applied: no SDS in the selected language exist in this region. Remove this filter or change the language." | Region filter ignored | Remove the region or change language |
| "This action is not available on your current subscription plan" | Plan lacks the feature | Upgrade or contact your account Owner |
| "You need an admin role to add SDS to library" | Your role cannot add SDS | Ask an Admin, or use **Request Safety Data Sheet to be added to company library** |
| "Please enter our ERP ID" | ERP ID is mandatory in your account | Fill in **Our ERP ID (required information)** |
| "Adding the SDS is still in progress. It may already be in your library." | The add took longer than the app waited | Check the location in a moment; it is not duplicated |
| "An archived instance of SDS <name> already exist on location <location>" | An archived copy exists | Unarchive it, or **Add anyway** |
| "Error when adding SDS <name> to location <location>" | Adding failed for that location | Retry; contact support if it persists |
| "Supplier sites are currently unavailable" / "The supplier's site is taking longer than expected. Please try again in a moment." | Live supplier lookup failed or timed out | Try again later; database results still work |
| "Could not import the SDS from the supplier site" | Supplier-site import failed | Retry or download the PDF and upload it |
| "Only one filetype is allowed for same upload." | PDFs mixed with ZIP/RAR | Upload PDFs and archives separately |
| "Maximum 20 files uploaded" | More than 20 files dropped | Upload in batches or use a ZIP |
| "File size limit exceeded (25MB)" / "(500MB)" / "(5GB)" | File too big for your plan | Split the file or zip/compress; larger plans allow larger files |
| "File is uploading" | You tried to close during upload | Wait for the upload to finish |
| "Unable to split the file." | Binder PDF could not be split | Upload the SDS as separate PDFs |
| "No text detected" / "No text detected in this PDF. The file seems to be a scan of a Safety Data Sheet." | Scanned PDF | **Retry using OCR**, or get a text PDF from the supplier |
| "The file you uploaded was not a proper Safety Data Sheet file." | Extraction failed | Use a matching library SDS, OCR, manual entry, or request assistance |
| "Number of SDS in use exceed subscription plan size." / "Maximum SDS reached for current plan" | Plan full | Upgrade (Owner) or archive unused SDS |
| "This ZIP file contains <n> files. However, your current plan permits adding only <m> more SDSs to your library." | ZIP bigger than remaining allowance | Upgrade or import fewer files |
| "Import running in the background. Once completed, the SDS will be added to the SDS Library. Review any issues in Tasks → Products Awaiting SDS." | You closed the upload window | Nothing; check **Import status** later |
| "Link/URL of the SDS can't be empty" | No URL entered | Paste the SDS link |
| "This is taking longer than expected. The import continues in the background — check the selected location in a few minutes." | URL/supplier import still running | Check the location later |
| "Too many attempts. Try again in …" | OCR retry limit | Wait for the countdown |
| "File is not linked to any SDS" | Import-status row without an SDS | Use the failed-file actions |
| "Barcode not recognized" | Unknown barcode | Search by name, take label pictures, or save the product |
| "No Match for scanned Barcode" | Barcode known, no SDS matched | Choose from the closest matches or take pictures |
| "Product not found — No substance in your inventory matches this barcode." | Header scan found nothing in your library | **Search manually** or **Register barcode to existing substance** |
| "Invalid barcode format" / "Invalid EAN-code" / "Invalid UPC-code" | Code fails format/check-digit rules | Rescan or correct the number |
| "Requested device not found" / "Can't access your camera" / "Device does not have camera" / "No access to camera device" | Camera missing or blocked | Allow camera access in the browser, or use another device |
| "Uploaded file is not a valid image. Only JPG, PNG and GIF files are allowed" | Wrong image file | Choose a JPG, PNG or GIF |
| "Failed to process product label" / "We could not detect the product name from the picture." | Label detection failed | Retake clearer photos or type the name |
| "Could not extract product information from the image. Please try again with a clearer photo of the SDS first page." | Binder photo unreadable | Retake the photo of the SDS first page |
| "Product saved to Tasks → Products Awaiting SDS" | Product saved without SDS | Find the SDS later in **SDS Tasks** |
| "Processing in background. Check progress in Tasks → Products Awaiting SDS." | Label detection continues | Check **Products Awaiting SDS** later |
| "Please select a location where the product is used" | No location chosen | Pick a location |
| "Product name can't be empty" / "Supplier name can't be empty" / "Place of purchase can't be empty" / "Purchase year can't be empty" | Required field missing | Fill in the field |
| "Upload failed" (product list) | The spreadsheet could not be read | Check it is .xlsx, .xls or .csv |
| "There are still some rows containing errors." | Product list has invalid rows | Fix or discard the rows |
| "Some location paths were skipped" / "Some locations were not used" | Product list locations too deep or not accessible | Set those products' locations manually |
| "This import can no longer be retried. Please import the file again into the same location." | Product-list retry window expired | Re-import the file |
| "We could not load this product. It may have been deleted, archived, or you may no longer have access to its location." | **Find SDS** cannot open the product | Go back; check archive or your location access |
| "Contact the user who has Admin with approval role for the location" | You cannot add/approve on this location | Ask that user |
| "You are not eligible to approve this step" | Not an approver for the current step | Wait for the configured approver |
| "Please explain why this SDS was rejected." | Close-match rejection without reason | Enter a reason |

## Frequently asked questions

Q: How do I add an SDS that is already in SDS Manager's database?
A: Open **Global SDS Search** (under **More**), or a location in **Manage SDS Library** and click **Add Safety Data Sheet**. Search by product name, supplier, product code, CAS, UFI or EU number (at least 3 characters), then click the (+) on the right result. If you have several locations you pick the location(s) in **Select location to add Safety Data Sheet** and click **Add**.

Q: How big is the SDS database?
A: The **Global SDS Search** page describes it as a global repository of "16 million+" Safety Data Sheets; the Dashboard's search tab says "18 million+". Use the figure on the screen you are looking at, or ask SDS Manager for the current number.

Q: Can I add the same SDS to several locations at once?
A: Yes. When you click (+) and choose locations, tick all the locations you need. You can also tick **Set the selected location as the default to streamline adding SDSs** so the next SDS you add goes to the same locations with one click; remove the **Location** chip to stop.

Q: What file types can I upload, and how large can they be?
A: PDF, ZIP or RAR files, up to 20 files per upload, and you cannot mix PDFs and archives in one upload. The per-file limit depends on your plan's SDS allowance: under 25 MB (plans up to 400 SDS), 500 MB (401–9,999 SDS) or 5 GB (10,000 SDS or more).

Q: I have all my SDS in folders on a file server. How do I import them?
A: Zip the whole folder and upload it via **More → Import ZIP Files** (or the Dashboard's **Import SDS Files** tab). Tick **Create new location(s) at the root level of the location hierarchy for files and folders in the zip-file** to have the folders recreated as locations, or choose an existing location. SDS Manager extracts the content of each PDF automatically.

Q: Why did my uploaded PDF fail to import?
A: Common reasons are a scanned PDF with no text ("No text detected"), a binder that could not be split, a file that is not an SDS, or a full plan. Open **Import status**, filter on **Import failed**, and use **Retry using OCR** for scans, **Replace with new SDS**, **Add SDS to library with manually entered product information**, or **Add request for SDS**. The (i) next to the status lists the options.

Q: How long does importing take?
A: The application does not state a processing time for PDF or ZIP imports. You can close the upload window and let it continue in the background; results appear on **Import status**. Supplier-site imports "can take several minutes", and assistance requests to the SDS Manager team state "We'll add it to your library within 24 hours."

Q: What does "Private import" mean?
A: Files uploaded with **Private import** ticked are "marked as private for your organization's account and will not be included in our global selection of SDSs." The account can make this the default with the setting **Default imported PDF files to Private**.

Q: Can I scan barcodes to build my library?
A: Yes. Use **Barcode search** next to the search box, or the Dashboard's **Scan Barcode** tab (**Start Camera Scanner**, or scan the QR code with your phone). Matching SDS are shown; if there is no match, save the product with **Save product and find SDS later** / **Save & Scan Next** and it waits in **Products Awaiting SDS**. When you add an SDS after a barcode scan you can link the barcode to it.

Q: Do I need to install an app to scan barcodes or photograph labels?
A: No. The Dashboard says the scanner opens "in your browser — no app download needed." On a computer, scan the shown QR code with your phone to continue there, signed in as you.

Q: How does adding products by photo work?
A: Use **Take pictures** next to the search box (up to 3 photos; click **Done** and SDS Manager detects the product name, supplier and barcode and searches for the SDS) or **More → Shoot pictures of labels of your chemicals** (type the name yourself and **Save**). Photographed products appear in **Products Awaiting SDS**, where you click **Find SDS** to match them.

Q: I have a printed SDS binder. Do I have to type everything in?
A: No. Use the Dashboard's **Scan Paper Binder** tab: photograph the first page of each SDS with your phone. SDS Manager recognises the product, suggests the digital SDS ("Is this the correct SDS?") and adds the most current version to the location you choose. Unmatched sheets are saved as pending SDS requests.

Q: How do I import my Excel list of chemicals?
A: Go to **More → Import product list**, click **Continue** and **Import product lists**, upload an .xlsx, .xls or .csv file, choose the header row, match your columns (at least **Product Name** and **Supplier Name**), fix any errors and **Confirm**. Choose a location for rows without one and answer whether SDS with identical product and supplier names should be added automatically. Unmatched products go to **Products Awaiting SDS**.

Q: Is there a template for the product list?
A: Yes. The import page links to **Template file for product list** in SDS Manager's help centre. Only product name and supplier name are required; the column names and order don't matter because you map the columns in the wizard.

Q: What happens to products I add without an SDS?
A: They become SDS requests and are listed under **Pending Tasks** (**Products Awaiting SDS** or **SDS requests**). From there click **Find SDS** to search and link an SDS, request help from SDS Manager, email the distributor, or mark **This product does not have an SDS** so employees see that no SDS exists.

Q: Can SDS Manager find the SDS for me?
A: Yes. After searching (and trying Google), click **Click to request us to find it for you** / **Ask SDS Manager to help** and fill in **Request assistance from the SDS Manager team** with product name, place of purchase, purchase year and location. The screen states "We'll add it to your library within 24 hours." For several products, use Bulk Action → **Request assistance from the SDS Manager team** in **SDS Tasks**. The free SDS-finding service for whole product lists is described for paid plans (Premium, Pro or Enterprise).

Q: What is "Close match approval"?
A: When SDS Manager's team finds an SDS that is close to, but not exactly, the product you requested, it appears under **Manage SDS Library → Close match approval**. Compare the **Request** and **Propose** rows, then **Approve** to link it or **Reject** with a reason to send it back to the sourcing team. You can also **Upload PDF** of your own.

Q: I added an SDS but it is not in the library. Why?
A: If your organisation uses the **SDS approval flow**, new SDS are held under **Pending Tasks → SDS Awaiting Approval** and only appear at the location after the last approval step ("Saved — pending approval"). Otherwise check **Import status** for uploads still in progress or failed, or the add-result dialog for errors such as an archived copy on the location.

Q: Our employees are not admins. Can they still get an SDS added?
A: Yes, if the account Owner turns on **Allow employees to request Safety Data Sheets to be added to Safety Data Sheets library** in **Settings**. Employees then see **Request Safety Data Sheet to be added to company library** on search results and location pages (QR-code users via the **SDS requests** menu item if allowed). The request appears in **SDS Tasks** with status **Needs review** for an admin to handle.

Q: Can I import SDS directly from a supplier's website?
A: For some suppliers, yes. When your search includes a supported supplier name and a product name or code, SDS Manager also looks on the supplier's site and labels those rows **Supplier site (live)** or **Possible match from supplier**. Click (+) (**Add SDS from supplier site**), choose a location and **Add**; the download and processing can take several minutes. For other sites, use **UPLOAD FROM URL** with the PDF link.

Q: We use another SDS system. Can SDS Manager move our data?
A: Yes. On the Dashboard's **Migrate from other system** tab, click **Send access link to SDS Manager** and share a link to your current library. SDS Manager's team migrates your SDS including location structures and emails you when done. The tab mentions both "within one business day" and "within 5–7 business days", so confirm the timeline with SDS Manager.

Q: Why can't I see the upload area or "Import ZIP Files"?
A: In the application these upload areas and the **Import ZIP Files**, **Import product list** and **Shoot pictures of labels of your chemicals** menu items are shown to the account Owner and users with the Admin role. Admin Light, Staff and Read only users do not see them. Some features also depend on your plan; an upgrade prompt appears if your plan lacks one.

## Related topics

- **SDS library: substances list, SDS details, stock, archive and export** — managing SDS already in the library: archiving, replacing, SDS details
- **Keeping SDS up to date: newer versions, SDS update requests to vendors, vendor inbox and SDS Quality** — newer versions, requesting updated SDS from vendors, the vendor inbox
- **Locations, QR codes and employee access to SDS** — creating locations and the location structure; QR-code access for employees
- **Login & Account Security, Users, Roles & Permissions, and Organization Settings** — location roles; Settings: SDS approval flow, employee SDS requests, private import default
- **Plans, Free Trial, Sign-up, Billing and Subscription** — plans and subscription limits
