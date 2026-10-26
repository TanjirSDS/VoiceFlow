# Exposure register, reports (incl. Tier II) and Danish APB

> Summary: This section covers three related compliance tools in SDS Manager. The **Exposure register** (menu **Exposures**) lets companies record which employees were exposed to chemicals, asbestos, biological agents, radiation or mining conditions, when, for how long and at what concentration; employees see and confirm their own records under **My Exposures**. The **Reports** menu holds the **Use & disposal** report (amounts stored, used and disposed per product and location, exportable to Excel) and two library exports for Owners and Admins, and SDS lists can flag a **Tier II Report** threshold alert. The **APB** module (Danish "arbejdspladsbrugsanvisning", workplace chemical instruction) is for Danish customers: it generates a workplace instruction for every chemical, lets an Owner or Admin add local notes and approve it, and makes approved APBs available to employees. Together these tools help safety managers document exposure, track chemical consumption and meet workplace-instruction obligations.

## Where to find it

| What | Menu path / where it appears | URL path | Who sees it |
|---|---|---|---|
| Exposure register (list) | Sidebar **Exposures** (on some plans under **More** → **Exposures**) | `/exposures` | Users with the Exposures permission whose plan includes exposures. The menu item is in the main sidebar on Enterprise and under **More** on Premium and Pro (see "Plan and permission requirements") |
| Create an exposure | **Exposures** → **Create exposure** button; or **Register exposure** in the ⋮ menu of an SDS row | `/exposures/create` | Users with the Exposures permission |
| Exposure details | Click an exposure row, or **Open** on a registration | `/exposures/<id>` | Exposure managers and the employee the exposure is registered for |
| My Exposures | Sidebar **My Exposures** | `/my-exposures` | Employees the system has given access to their own exposures |
| Exposure settings (categories, statement codes, asbestos and radiation types) | Sidebar **Settings** → section **Exposure** | Settings page | Users with the Exposures permission who can open Settings |
| Exposures on a job procedure | A job procedure's **Exposure** tab | — | Enterprise plan |
| Reports group | Sidebar **Reports** (on some plans under **More** → **Reports**) | — | Users with the Reports permission; never QR-code login users |
| Use & disposal report | **Reports** → **Use & disposal** | `/reports` | Users with access to the Use & disposal page |
| SDS library export | **Reports** → **Export SDS library** | — | Owners and Admins |
| GHS classification export | **Reports** → **Classification and Labeling Report (GHS)** | — | Owners and Admins |
| Tier II Report | Orange warning icon next to a product name in SDS lists | — | Any user viewing the list, when the system has flagged that SDS |
| APB Management | Sidebar **APB** | `/apb-management` | Danish accounts only; Owner or Admin |
| Open / Create APB | ⋮ menu of an SDS row: **Open APB** or **Create APB** | — | Danish accounts |
| Public APB page | Opened from a link/QR code, no login needed | `/apb/<code>` | Anyone with the link |

Browser tab titles: the create page is titled **Register exposure** and the detail page **Exposure details**. On the page itself the create screen heading is **Create exposure** and the list heading is **Exposure**.

## Plan and permission requirements

SDS Manager decides permissions on its server. Each user role gets a set of permissions, and each subscription plan unlocks a set of features. The app then shows or hides menu items based on that. The table in this section lists only what the application shows. Which roles hold the Exposures or Reports permission by default is set by SDS Manager and is not specified in the application. Confirm with SDS Manager support if a customer needs the exact mapping.

| Feature | Plan rules visible in the app | Role / permission rules visible in the app |
|---|---|---|
| **Exposures** menu item | Shown in the main sidebar only on the **Enterprise** plan. On **Premium** and **Pro** it appears under **More**. On Free and Basic it is not shown. A job procedure's **Exposure** tab opens only on Enterprise. On other plans the app shows "This feature is not available on your current subscription plan." | Needs the Exposures permission. Only users with this permission see **Create exposure**, **Duplicate**, **Archive**, **Un-archive**, **Un-link** and the finish controls. |
| **My Exposures** | The app shows no plan rule for this menu item. | The item appears only when SDS Manager grants the user access to the My Exposures page. The page lists exposures where the user is the executor (the person exposed). |
| Exposure settings (**Settings** → **Exposure**) | Follows the Exposures entitlement. | Needs the Exposures permission and access to the Settings page. |
| **Reports** menu group | In the main sidebar on **Premium** (when the account has 5 or more products in use), **Pro** and **Enterprise**. On **Free**, **Basic**, and Premium accounts with fewer than 5 products in use, it is listed under **More**. Hidden for QR-code login users. | Needs the Reports permission. |
| **Use & disposal** | Same as the Reports group. If the plan does not include it, the app shows the upgrade message. | Needs access to the Use & disposal page. Hidden for QR-code login users. |
| **Export SDS library** and **Classification and Labeling Report (GHS)** | Inside the Reports group. | **Owner** and **Admin** only. Not Admin Light, Staff or Read only. |
| **Tier II Report** icon | Shown when the system has flagged the SDS. No plan restriction is shown in the app. | Anyone who can see the SDS list. |
| **APB** (APB Management) | The company's country must be **Denmark**, and the plan must include APB. If the plan caps approvals, a banner shows the limit. The UI says "Upgrade to Pro or Enterprise for unlimited approvals." | **Owner** or **Admin** only. Admin Light, Staff, Read only and No Access cannot open the page. |
| **Open APB** (SDS ⋮ menu) | Danish accounts. | Shown when the SDS has an approved APB. |
| **Create APB** (SDS ⋮ menu) | Danish accounts. | Shown to Owner, Admin and Admin Light when the SDS has no approved APB. Only Owners and Admins can actually open the APB Management page. |
| Public APB page | — | No login required. |

When a user opens a feature their plan does not include, they see a popup: "This feature is not available on your current subscription plan." (on a trial: "This feature is not available on your current trial plan."). It also says "Your current plan is …" and, where known, "You need to upgrade to … plan to use this feature."

## Exposure register: key concepts

An **exposure** in SDS Manager is a record that one or more employees were exposed to a hazard during work. Each exposure has:

- **Name**: a short description ("Give the exposure a brief description").
- **Category**: a company-defined classification chosen from categories an administrator creates under **Settings** → **Exposure** → **Exposure categories**. The UI explains: "Create your own categories that can be applied to classify work operations and individual exposures. These categories can be utilized for generating reports, allowing for organized extraction of information." A category is required to create an exposure.
- **Exposure kind** ("What about the exposure?"): **Chemical**, **Asbestos**, **Biological**, **Radiation** or **Mining**. Exposures created from a job procedure are a sixth kind, **Job procedure**, and can combine several of these.
- **Executor(s)**: the employee or employees who were exposed. By default this is the person registering. Turn on **Register exposure for other employees** to choose others.
- **Types of exposure / substances**: what the person was exposed to, such as SDSs from the library, asbestos types, radiation sources or biological agents.
- **Concentration**: measured (number plus unit) or assessed (Low / Medium / High / Unknown).
- **Date and duration**, or a **repetition** plan for exposures that recur over a period.
- Optional **Personal protective equipment** (PPE) and, for asbestos and mining, a **Health examination**.

**Single vs repeated exposures.** A single exposure is one event with an exposure date and a duration in minutes. A repeated exposure covers a period. The system creates **registrations** (one per date, one per period, or as many as the employee adds) that the employee confirms over time. An exposure moves through the statuses **In Progress** → **Finished**, and can be **Archived** at any time.

## Exposures list page

Open **Exposures** in the sidebar. The page heading is **Exposure**.

**Filter bar**
- Search box "Search by exposure name".
- **Status** dropdown: **In Progress** (default), **Finished**, **Archived**. The list always shows one status at a time.
- **Create exposure** button (only for users with the Exposures permission).
- Under the bar: a result count ("{n} found"), chips for active filters ("Search: …", "Status: …", each removable with ×), and **Clear filters**, which resets to In Progress with an empty search.

**Columns (desktop)**

| Column | What it shows |
|---|---|
| **User** | The exposed employee's name. If the exposure has 2 or more registrations, it shows "{n} users" with an expand arrow. Clicking the row expands it to show each registration. |
| **Name** | Exposure name. |
| **Period / deadline** | The exposure date, or "start date – end date" for repeated exposures. |
| **Category** | The company category. |
| **Type** | **Substance** (chemical), **Asbestos**, **Biological**, **Radiation** or **Mining**. For job-procedure exposures, the list of kinds it covers. |
| **Status** | A chip: **In Progress**, **Finished** or **Archived**. For exposures with registrations, a progress bar and "checked/total" count (registrations no longer pending ÷ all registrations). |
| (unlabelled chip) | Repetition type: **Single** (green), **Per date** (blue), **Per period** (red), **Unknown date** (yellow). |
| **Exposure type** | **Job procedure** if linked to a job procedure, **Repeated exposure** if it has registrations, blank for a single exposure. |
| Red alert icon | Appears when the exposure period is over but the exposure is not finished (managers only). |
| ⋮ menu | **Duplicate**, **Archive** or **Un-archive**, and **Un-link** when viewed inside a job procedure (managers only). |

Rows per page default to 10. Pagination shows "{from}–{to} of {count}". On a phone the list shows as cards with icon buttons. Single exposures and individual registrations get a view (eye) icon.

**Opening an exposure.** Click a single exposure to open its detail page. For an exposure with several registrations, click the row to expand it. The expanded panel is titled **Exposure status** with the hint "Edit status in table row or open exposure to see more details on exposure." Its columns are **Exposure date** (or **Period**), **Person** (name and email), **Status** and **See detail**. **See detail** holds an **Open** button, or a delete icon for future (**Scheduled**) registrations.

**Empty and error states**
- Loading: skeleton rows.
- "Could not load exposures" / "The list could not be loaded. Check your connection and try again." with **Retry**.
- With a search or non-default status: "No exposures match your filters" / "Try a different status, or clear the search term." with **Clear filters**.
- Default view with nothing in it: "No exposures yet" and "No exposures with status “In Progress”." with a **Create exposure** button for managers.

## How to register (create) an exposure

1. Go to **Exposures** and click **Create exposure**. Alternatively, open the ⋮ menu on an SDS row and choose **Register exposure** (see "Registering an exposure from an SDS row").
2. Under **Category**, click one of your company's categories. The first category is preselected. If none exist, a warning says "A category is required when creating exposure. Categories can added by administrators on the settings page." with an **Open setting page** button.
3. Under **What about the exposure?**, choose **Chemical** (default), **Asbestos**, **Biological**, **Radiation** or **Mining**. The form below changes to match.
4. Enter a **Name** (required).
5. Optional: turn on **Register exposure for other employees** ("Switch on to register exposure for other employees") and click **Add employee**. Pick one or more employees in the **Employee** field and click **Add**. If the switch is off, the exposure is registered for you.
6. Fill in **Working conditions** and the **Exposure** section for the chosen kind. The table in "Fields by exposure kind" lists the fields.
7. Optional: turn on "Turn on if you want to add personal protective equipment" to add PPE.
8. Choose single or repeated:
   - Single: fill in **Scope** with **Enter exposure date*** (defaults to today and cannot be in the future) and **Enter duration in minutes***.
   - Repeated: turn on "Turn on if you want repeated exposure" and set up the repetition (see "Repeated exposures").
9. For **Asbestos** and **Mining**, fill in **Health examination**: **Date of examination*** and **Name of doctor**.
10. Click **Save**. Save stays disabled until you change something and a category is selected. On success you return to the **Exposures** list. **Cancel** returns to the list without saving.

Exposures cannot be edited after creation. The application has no edit function for the exposure itself. To make a similar or corrected record, use **Duplicate**. To take a wrong record out of use, use **Archive**. The employee can still update each registration of a repeated exposure (see "Registering what was done").

## Fields by exposure kind

| Field (on screen) | Chemical | Asbestos | Biological | Radiation | Mining |
|---|---|---|---|---|---|
| **Name*** | ✓ | ✓ | ✓ | ✓ | ✓ |
| **Workplace / Address*** | ✓ | – | – | ✓ | ✓ |
| **Describe the nature of the work*** | ✓ | ✓ | ✓ | – | ✓ |
| **Date of registration*** | – | ✓ | – | ✓ | – |
| **Current job*** | – | – | – | ✓ | – |
| **Type of exposure** | Chemical product categories (multi-select, required) | Asbestos types (required) | Biological agents (required) | Radiation types (required) | Toggles **Chemical** / **Asbestos** / **Radiation**, each with its own type list; at least one required |
| **Substance** (SDS from your library) | ✓ required | – | – | – | ✓ when Chemical is on |
| **Describe exposure*** | – | – | ✓ | – | – |
| Concentration | ✓ | ✓ | – (none) | ✓ | ✓ per enabled kind |
| **Substance exposure routes** | ✓ required | – | – | – | ✓ for the Chemical part |
| **Enter exposure date*** (single) | ✓ | ✓ | ✓ | ✓ | ✓ |
| **Enter duration in minutes*** | ✓ | ✓ | – | ✓ | ✓ |
| **Health examination**: **Date of examination***, **Name of doctor** | – | ✓ | – | – | ✓ |
| PPE (optional) | ✓ | ✓ | ✓ | ✓ | ✓ |
| Repeated exposure (optional) | ✓ | ✓ | ✓ | ✓ | ✓ |

Fields marked * are required. The form will not save while they are empty, and the field shows "Required". A duration of 0 counts as empty.

## Substances, types of exposure, concentration and units

**Adding substances (Chemical and Mining).** In the **Substance** area click **Add**. The **Select SDS to add** window lists SDSs in your library with **Product Name**, **Supplier Name**, **Revision date**, **Location**, **Language** and a link to open the SDS. Search, tick one or more SDSs and click **Add**. Each added SDS appears as a row with a delete icon. A flare icon with the tooltip **Require exposure register** marks substances that require exposure registration. Which hazard and safety statement codes trigger this requirement is configured in **Settings** → **Exposure** → **Chemical**.

**Adding types (Asbestos, Radiation, Biological).** Click **Add** to open **Select type of exposure**. It shows a tree of built-in types, for example:
- Asbestos: Amphibole Asbestos, Crocidolite, Chrysotile Asbestos, Amosite, and asbestos-containing materials such as Ceiling tiles, Cement sheets, Insulation, Vinyl tiles, Brake pads.
- Radiation: Alpha particle radiation (α), Radon-222, Beta particles (β-), Gamma rays (γ), X-rays, Ultraviolet radiation, Infrared radiation, Radio frequency radiation. Each is shown as **Ionizing** or **Non-ionizing** under **Type of radiation**.
- Biological: virus families and agents such as Hepatitis B virus, Coronavirus SARS-CoV-2, Influenza virus types A, B and C, with **Infection risk group** and **Market** columns.

For radiation and biological, a switch "Show only substances with exposure register requirements" narrows the tree. At the bottom, **Add new type of exposure** lets you type a custom type with a **Name**. For radiation you also pick **Ionizing** or **Non-ionizing**. For biological you enter **Group** and **Market**. Click **Add** to apply. Your company's own asbestos and radiation types (from Settings) appear in the same tree.

**Concentration.** For every kind except Biological you enter a concentration. Choose **Measured concentration** (a number greater than 0 plus a unit) or **Assessed concentration** (**Low**, **Medium**, **High** or **Unknown - None of the above**). By default one concentration applies to all added substances or types. Turn on "Turn on if you want to register separate concentrations for substances that have been added." to enter a separate "Concentration for "<name>"" for each one. You must add at least one substance or type before you can turn this on.

**Measured-concentration units offered**

| Exposure kind | Units |
|---|---|
| Chemical | µg/m³, mg/m³, ppb, ppm (default µg/m³) |
| Asbestos | fiber/cm³ |
| Radiation | Bq/m³, mSV (default Bq/m³) |

A concentration value is required ("Concentration can not be empty").

## Chemical exposure categories and exposure routes

For **Chemical** (and the chemical part of **Mining**), **Type of exposure** lets you tick one or more of these product categories (at least one required):

- Carcinogenic, mutagenic, reproductive toxic and other chemical products
- Preparation of auramine
- Polycyclic aromatic hydrocarbons (PAHs) that occurs in soot, tar or pitch
- Dust, fumes or mist developed during roasting and electrolytic refining of nickel raw stone
- Preparation of 2-propanol by strongly acidic process
- Dust from hard woods
- Work with lead and lead compounds

**Substance exposure routes** are chips you click to select: **Skin and eyes**, **Inhalation**, **Swallow**. By default the routes apply to all substances. Turn on "Turn on if you want to register separate exposure routes." to set routes per substance. Every substance must have at least one route ("Exposure routes can not be empty for all substances that have been added.").

The application does not explain the legal basis for these categories. For regulatory questions, confirm with SDS Manager support.

## Personal protective equipment on an exposure

Turn on "Turn on if you want to add personal protective equipment". The **Personal protective equipment** section offers two buttons:
- **Add PPE** opens "Select PPE to reduce exposure". It shows SDS Manager's PPE symbols grouped by category (for example Eyes Protection, Gloves, Respirators, Body Protection, Foot Protection, Face Protection). Tick and **Save**.
- **Describe with text** opens "Describe PPE with text" for free-text PPE with **Name** and **Description**. Click **Add**.

On the exposure detail page, PPE is listed per exposure kind under **Personal protective equipment**.

## Repeated exposures

Turn on "Turn on if you want repeated exposure". Under **Exposure settings**, choose how the exposed employee will confirm exposure:

| Option on screen | Tag | Meaning (UI text) |
|---|---|---|
| **Individual parts of the period** | **Per date** | "Confirm or deny if you have been exposed. It is possible to change information about individual exposures during the period." One registration per scheduled date. |
| **The whole period together** | **Per period** | "Confirm or deny if you have been exposed. It is only possible to change information collectively for all exposures during the period." |
| **Optional number of registrations during the period** | **Unknown date** | "Record as many exposures as you want within the period defined in the work operation." The employee adds dates as they happen. |

Then, under **Select the period for when the work operation is to be valid**:
- **Start date*** (defaults to today).
- For **Unknown date**: **End date*** (must be after the start date; defaults to the next day).
- For **Per date** and **Per period**: **Repetition*** with **Daily**, **Weekly** or **Monthly**. Choosing one opens the **Repetition** window:
  - **Repeat every** N **days** / **weeks** / **months**.
  - Weekly: **Repeat on** weekday buttons M, T, W, Th, F, S, Su. At least one is needed to save.
  - Monthly: **Repeat on** specific day numbers (1–31), or **Repeat at** an occurrence (**First**, **Second**, **Third**, **Fourth**, **Last**) of a weekday.
  - **The repetition ends**: **After** N **Occurence(s)**, or on an **End date**.
  - **Save** or **Remove**. A summary of the schedule then appears on the form and can be clicked to edit.

Instead of **Scope**, a repeated exposure has a **Duration** section (**Enter duration in minutes***, not for Biological) and a section **What should be assigned in terms of customization options?**. These switches decide what the employee may change when confirming each registration:
- **Change concentration** (not for Biological)
- **Change duration** (not for Biological)
- **Change exposure date**: shown only for **Per date** and **Unknown date**. For Unknown date it is switched on automatically, because employees add their own dates. For Per date it starts switched off. Depending on the exposure kind, the switch may be locked in its default position. For example, on Chemical exposures it cannot be switched on for Per date, and on the other kinds it cannot be switched off for Unknown date.

Validation messages: "Please choose type of repeated exposure" if no option is chosen or no repetition is configured. For **Unknown date**, both the start date and end date are required. An error appears if either is missing.

## Exposure details and registering what was done

The detail page shows:
- Heading: the exposure name, and a subtitle such as "Single exposure • <Category> • Substance", "Repeated exposure • …" or "Job procedure • …".
- Info fields where filled in: **Workplace / Address**, **Description of the nature of the work**, **Date of registration**, **Date of examination**, **Current job**.
- **Exposure details** panel: the substances or types, **Type of exposure** (chemical categories), the concentration ("Concentration for …" or "Concentration"), **Exposure date**, **Duration** (in Minutes) and **Period**.
- **Personal protective equipment** panel when PPE was added.

For a registration of a repeated exposure, the left side also holds a form:
- **Exposure status**: the status of this registration. For **Per date** it can be set to **Completed** or **Not completed**.
- **Exposure dates** (Per period and Unknown date): a table of the dates in the period with **Exposure date**, **User**, **Duration** (Unknown date only) and **Status**. Statuses can be edited in the row. For **Unknown date**, an **Add** button opens a date picker limited to the period, so the employee can add each day they were exposed. Clicking a row loads that date into the form below. Future (scheduled) dates have a delete icon.
- **What has been done?**: **Enter exposure date*** (limited to the period; editable only if **Change exposure date** was allowed), **Enter duration in minutes*** (editable only if **Change duration** was allowed), and the concentration per type (editable only if **Change concentration** was allowed).
- **Comment**: **Add comment**.
- Buttons: **Cancel**; **Save and close** (Per date and Per period) or **Save** (Unknown date, which keeps you on the page and shows "Saved successfully"). **Finish and close** appears for Per period and Unknown date once the exposure period is over. It marks the registration completed and closed. It is disabled with the tooltip "You have to update all 'Pending' registration before confirm 'Finish and close Exposure'" while registrations are still pending.

The form is editable only while the exposure is **In Progress** and the registration is not closed or scheduled. Saving a date that is already registered shows "Exposure date registration existed".

## Registration statuses

| Status shown | Meaning |
|---|---|
| **Pending** | A Per date registration that has not been confirmed yet. |
| **In Progress** | A Per period or Unknown date registration still open (yellow). |
| **Completed** | The employee confirmed the exposure. |
| **Not completed** | The employee confirmed they were not exposed / it did not happen. |
| **Scheduled** | A future registration. It cannot be opened yet, but it can be deleted. |
| **Finished and Closed Exposure** | The registration was finished and is locked. |

Exposure-level statuses: **In Progress**, **Finished**, **Archived**.

## Finishing, archiving, duplicating and deleting

**Finish exposure** (managers with the Exposures permission). When an exposure's period is over, a red alert icon appears in the list row. The tooltip reads "This exposure period is done. Click to check and finish your exposures." If registrations are still pending, the icon is grey and reads "You have to update all 'Pending' registration before confirm 'Finish and close Exposure'". The expanded row also shows "Exposure period is over" / "Finish to finalize exposures" with a **Finish exposure** button. The confirmation says: "Once exposures are marked as finished, they will be locked and cannot be edited or modified. 'Completed' exposures will be automatically registered using the provided information." Click **OK** to finish. The exposure then moves to the **Finished** status filter.

**Archive / Un-archive** (⋮ menu, managers). The **Archive exposure** popup says "When you archive an exposure it will not be recorded as an exposure in the system. (You can still un-archive it)". **Un-archive exposure** says "When you un-archive an exposure it will be recorded back in the system." Archived exposures are found with **Status** = **Archived**.

**Duplicate** (⋮ menu, managers) opens **Create exposure** prefilled from the selected exposure. Review it and **Save** to create a new exposure. Job-procedure exposures can only be duplicated from inside the job procedure.

**Delete a scheduled registration.** In the expanded row or the **Exposure dates** table, future registrations have a delete icon. The **Delete exposure** popup says "When you delete an exposure it will not be recorded as an exposure in the system." Whole exposures cannot be deleted in the application. Archive them instead.

## My Exposures (employee view)

**My Exposures** is the employee's personal list. It shows exposures where the user is the executor, the person registered as exposed. The empty state says "Nothing assigned to you". The menu item appears only when the system has given the user access to this page.

- The same search box and **Status** filter (**In Progress**, **Finished**, **Archived**) as the main list. Archived assignments remain visible under **Archived** as the employee's own history.
- No **Create exposure** button, no ⋮ menu and no finish controls. Those require the full Exposures permission.
- Employees can expand repeated exposures and set **Per date** registrations to **Completed** or **Not completed** directly in the row. They can click **Open** to fill in **What has been done?** (date, duration and concentration where allowed, plus a comment) and save. For Per period and Unknown date they can use **Finish and close** when the period is over.
- Employees can delete their own future (scheduled) registrations.

## Registering an exposure from an SDS row

Users with the Exposures permission see **Register exposure** in the ⋮ menu of an SDS row, in **SDS Filter** (its web address calls it All Our SDS) and in SDS lists for locations. The SDS must have an SDS file. If the product is used in more than one location, the app first asks which location. It then opens **Create exposure** as a **Chemical** exposure with that SDS added under **Substance** and **Workplace / Address** prefilled with the location name. The first category is preselected. Complete the remaining fields and **Save**.

## Exposure settings (categories, statement codes, asbestos and radiation types)

Go to **Settings** and expand the **Exposure** section. It needs the Exposures permission. It contains four panels:

| Panel | Description on screen | What you can do |
|---|---|---|
| **Exposure categories** | "Create your own categories that can be applied to classify work operations and individual exposures. These categories can be utilized for generating reports, allowing for organized extraction of information." | Add categories with **Name** (required) and **Description**. Edit or delete your own. These are the **Category** buttons on the create form. |
| **Chemical** | "Hazard and safety statements that trigger requirements for registration of exposure" | Click **Code** to open **Add statement code**, enter a **Code** and **Add**. Edit (**Update statement code**) or delete codes. Hovering a code shows its statement text. |
| **Asbestos** | "Add your own categories that can be selected when exposure to asbestos is registered." | A tree of asbestos types. Use + on any node to add a sub-type (the popup shows **Parent category**). Edit or delete your own entries. |
| **Radiation** | "You can categorize the list of radiation exposure. This list can be applied to all configs" | Same tree. New entries also take **Ionizing** / **Non-ionizing**. |

Popups and messages: **Create category** → "Category created successfully". **Edit category** → "Category updated successfully". Deleting asks **Confirm delete** ("Confirm to delete exposure category <name>" or "Confirm to delete <name> of exposure category <category>") → "Category deleted successfully". Statement codes: "Statement code added successfully", "Exposure statement code updated successfully", "Confirm to delete exposure statement code <code>", "Exposure statement code deleted successfully". Only company-created entries can be edited or deleted. Built-in entries cannot.

## Exposures linked to job procedures

Each job procedure has an **Exposure** tab, and it works only on the Enterprise plan (on other plans clicking it opens the upgrade popup). Some countries see a different name for job procedures, such as COSHH assessments in the UK. The tab shows the same exposure table filtered to that job procedure, with two buttons:
- **Add exposures**: link existing exposures to the job procedure ("Link exposures to job procedure"; success: "Link exposure successfully").
- **Create exposure**: a job-procedure exposure form. Under **What does it apply to?** you switch on **Chemical**, **Asbestos**, **Radiation** and/or **Biological**, each with its own types and PPE. There is an extra switch "Turn on if it is related to mining." Duration and repetition settings are required. If no job procedure is selected, the message is "Work procedure is required".

The ⋮ menu inside a job procedure also offers **Un-link**. See the topic **Job procedures (job hazard analysis, COSHH assessments, 7-point risk assessments) and chemical work instructions** for the rest of that page.

## Reports menu overview

The **Reports** sidebar group expands to show:

| Item | What it produces | Format | Who |
|---|---|---|---|
| **Use & disposal** | On-screen report "Report for product use and disposal": amounts stored at the start and end of a period, used and disposed, per product and location | On screen; **Excel Report** exports .xlsx | Users with Use & disposal access (not QR-code users) |
| **Export SDS library** | A file export of the SDS library | CSV (file name sds-library.csv) | Owner, Admin |
| **Classification and Labeling Report (GHS)** | A GHS classification and labelling export of the library | CSV (file name ghs-report.csv) | Owner, Admin |

The exact columns inside the two CSV exports are produced by SDS Manager's server and are not specified in the application. Confirm with SDS Manager support if a customer needs the column list. A separate **Tier II Report** alert appears on individual SDSs (see "Tier II Report").

## Use & disposal report (Report for product use and disposal)

Open **Reports** → **Use & disposal**. The page heading is **Report for product use and disposal**. The report uses the amounts recorded on products in your locations: stored amount, amount used and amount disposed.

**Table columns**

| Column | Meaning |
|---|---|
| **Location** | Location where the product is stored |
| **Product Name** | Product name |
| **Supplier Name** | Supplier |
| **Measurement scale** | Unit of the amounts, for example kg, l, ml, gals, or a custom unit |
| **Amount stored start of period** | Stored amount at the start of the chosen period |
| **Amount stored end of period** | Stored amount at the end of the chosen period |
| **Amount used** | Amount used in the period |
| **Amount disposed of period** | Amount disposed in the period |
| **Substance environmental hazard** | Environmental hazard rating shown as E1–E5 |

Amounts are rounded to 3 decimals, or 3 significant digits for values below 1.

**Grouping.** **Group by substance** is on by default. Each product then gets its own block titled "Substance: <name>", with one row per location and **Sum** rows per unit adding up the amounts. With grouping off, all rows show in one table. Pagination offers 10, 20, 50 or 100 rows per page. When grouping is on, it pages through groups.

**Filters.** Click the filter icon button. A badge shows how many filters are active, and grouping counts as one. The **Filter** window has:
- **Locations** (multi-select) and **Substance environmental hazard** (multi-select: Not Dangerous, Slightly Dangerous, Dangerous, Very Dangerous, Extremely Dangerous).
- **Start date** and **End date**, plus the **Group by substance** checkbox.
- **Custom Fields**: choose one of your custom fields and a value to match.
- **Substances**: search your SDSs and add specific products. A selected-substances list lets you review and remove them.
- Buttons **Reset** (clears everything back to defaults) and **Apply**. Invalid dates show "Invalid start date" or "Invalid end date".

If nothing matches: "No substances have been found".

**Excel export.** Click **Excel Report**. The export uses the same filters and grouping as the screen. The file is built in the background. An **Export status** window shows a progress bar and downloads report_for_substance_use_and_disposal.xlsx when ready. The button stays disabled while an export is being prepared. Clicking again while a run is still going reconnects to the same run instead of starting a second one.

## Export status messages (all report exports)

The **Export status** window is used by **Excel Report**, **Export SDS library** and **Classification and Labeling Report (GHS)**:

| Message | Meaning / what to do |
|---|---|
| "Export completed. Your file has been downloaded." | Done. Check your downloads folder. |
| "Export completed. Your download has started in your browser." | Done. The browser is downloading the file. |
| "Export completed, but the download link could not be opened. Please try again." | The file was built but could not be opened. Run the export again. |
| "The export could not be generated. Please try again." | The server could not build the file. Retry, and contact support if it repeats. |
| "This export has expired. Please try again." | The prepared file is no longer available, or preparation took too long. Run it again. |
| "The download was interrupted. Please try again." | Network interruption. Retry. |
| "Something went wrong." | The export could not be started. Retry. |

## Tier II Report

SDS Manager can flag an SDS whose stored amount has exceeded a reporting threshold. Flagged SDSs show an orange warning-triangle icon next to the product name in SDS lists, with the tooltip **Tier II Report**. Click the icon to open the **Tier II Report** window:

- Each alert line reads "<date and time>: Amount <amount unit> exceeded the threshold for this SDS."
- If there are no alerts: "No threshold alerts found."
- A **Re-compute report** button (circular arrow) asks the system to recalculate the alerts for that SDS.
- Close with ×.

The thresholds, the calculation and which accounts get Tier II checks are decided by SDS Manager's server and are not described in the application. The window only shows alerts and does not file anything with authorities. Confirm details with SDS Manager support.

## Danish APB (arbejdspladsbrugsanvisning): what it is

The **APB** module is only available to customers whose company country is Denmark. The menu tooltip explains: "Danish law requires a workplace chemical instruction (APB) for every hazardous chemical used at your workplace. Each APB must be approved by a named user, is valid for 3 years, and includes workplace-specific local notes on handling, storage, disposal and other precautions. Use this page to review, edit and approve APBs for your chemicals. Approved APBs are available via QR codes on chemical labels and from the SDS three-dot menu."

An APB in SDS Manager is generated from the extracted SDS data. It has ten sections and is titled **ARBEJDSPLADSBRUGSANVISNING**:

| APB section | Content source |
|---|---|
| **1. Product identification** | **Product name**, **Supplier**, **MAL-kode**, **CAS-no**, **UFI** |
| **2. Hazard identification** | GHS pictograms, **Signal word**, **H-statements**, **EUH-statements**, **P-statements** |
| **3. First aid measures** | SDS section 4 text |
| **4. Firefighting** | SDS section 5 text |
| **5. Spill precautions** | SDS section 6 text |
| **6. Handling and storage** | SDS section 7 text + your **Local handling instructions** and **Local storage instructions** |
| **7. Exposure control / Personal protective equipment** | SDS section 8 text + PPE symbols |
| **8. Disposal** | SDS section 13 text + your **Local disposal instructions** and **Other notes** |
| **9. Emergency contact** | Emergency agency and phone, and **Fire** phone where available |
| **10. Approval** | **Approved by**, **Date**, **Next review**, or "Awaiting approval" |

## APB Management page

Open **APB** in the sidebar (Danish accounts, Owner or Admin). The page is titled **APB Management** and works as a review queue you flip through one APB at a time.

**First visit.** If your company has no APBs yet, the system creates one for each of your substances. The page shows "Generating APBs, this may take a moment..." and "We are setting up an APB for each of your substances. The page will refresh automatically when the work is done." The page checks about every 3 seconds. If setup does not finish within about 2 minutes, it shows "We could not finish setting up your APBs. Please try again." with **Retry**.

**Header and filters**
- Position in the queue ("{current} of {total}") and a progress bar "{percentage}% approved".
- Status buttons with counts: **All**, **Pending**, **Approved**, **Needs update**, **Overdue**.
- **MAL-kode** dropdown: **All**, **Has MAL-kode**, **Missing MAL-kode**.
- **Approved for over** dropdown: **All**, **1 year ago**, **2 years ago**, **30 months ago**, **35 months ago**. Use it to find approvals nearing their 3-year validity.
- Search box "Search product...".
- **Approve {n} non-hazardous** button, shown when pending APBs exist for products without hazard classification (see "Bulk approving non-hazardous products").

**Navigation.** Use the left and right arrow buttons, or the keyboard ← and → keys when not typing in a field. The page remembers your last position in this browser. The queue loads up to 100 APBs for the current filter. Use the status buttons, dropdowns or search to reach others. If nothing matches: "No APBs match your filter" with **Clear filters**.

**Layout.** The left panel is the APB preview with editable section text. The right panel is the edit panel with status, local notes and approval.

## APB statuses and risk indicator

| Status (filter / chip) | Meaning |
|---|---|
| **Pending** / "Awaiting review" | Generated, not yet approved |
| **Approved** | Approved by a named user; locked for editing |
| **Needs update** / "SDS updated — needs review" | The underlying SDS changed. A box "SDS updated — review changes:" lists each changed field as "Before: …" / "Now: …", or added (+ code) and removed (- code) statements. |
| **Overdue** / "Overdue — needs review" | The APB needs to be reviewed again (past its review deadline) |

The edit panel also shows a risk chip, "<label> (<score>)". The score is the sum of the SDS health, safety and environment risk values: **High risk** (10 or more), **Medium risk** (5–9), **Low risk** (1–4), **No classification** (0).

## Reviewing and editing an APB

**Section text (left panel).** Sections 3–8 show text extracted from the SDS.
- Click a text, or the pencil icon ("Edit text"), to edit it. Edited text is highlighted. Use the swap icon to toggle "Show original" / "Show edited version".
- **Shorten text using AI** next to a section heading rewrites that section shorter ("Section shortened", or "AI call failed for this section").
- **Shorten all sections using AI** at the top does every section and shows progress ("Shortening all sections (done/total)"). The result is "All sections shortened", or "Shortened {done}/{total} sections. Failed: {failed}".
- Shortened text becomes an edit you can review or revert. Nothing is stored until you click **Save** (top of the preview). The confirmation is "Changes saved".
- **Save** is disabled when nothing changed or the APB is approved. The tooltip then says "Remove approval before editing this APB".
- If the SDS has no extracted data: "No extracted data available for this SDS."

**Edit panel (right).**
- Read-only fields with a check mark: **Product identification** (Product name, Supplier, MAL-kode, CAS-no), **Hazard identification** (Signal word, H-statements, P-statements), **Protective equipment (PPE)**.
- Local notes, all marked with * and shown in red while empty:
  - **Handling & storage — local addition *** ("Add local handling instructions...")
  - **Storage — local addition *** ("Add local storage instructions...")
  - **Disposal — local addition *** ("Add local disposal instructions...")
  - **Other notes *** ("Other workplace-specific notes...")
- **Apply template...** fills the four notes from a saved template ('Template "<name>" applied').
- **Save as template** stores the current four notes under a **Template name...** ('Template "<name>" saved'). The button needs at least one note filled in. Templates store only the local notes, not section edits.
- **Similar product found** banner: when another of your products is similar, it says "Similar product found: <name> (CAS: …) — click Copy to use the same notes." **Copy** fills in that product's notes ('Copied from "<name>"').
- **Emergency contact**: agency and phone, or "Emergency contact not configured" in red. Where to configure it is not specified in this screen; ask SDS Manager support.
- **Locations with this SDS**: every location using the SDS. The current one is marked with →.
- When the APB is approved, a banner says "APB is approved and locked. Remove approval to edit local notes."

## Approving an APB and removing approval

1. Review the sections and fill in the four local notes.
2. Optional: tick **Use same APB for all locations** to approve all APBs of this SDS in other locations with the same content.
3. Click **Approve APB**. The app saves your changes first, then approves ("APB approved"), and moves to the next APB in the queue. If the current filter excludes approved APBs, the approved one leaves the list.
4. If **Use same APB for all locations** is ticked and other locations exist, a confirmation appears: **Approve and apply to all locations?** "Approving with «Use same APB for all locations» will also approve {count} other APB(s) sharing this SDS, overwriting their handling, storage, disposal and other notes — and any section edits — with the values from this APB. Already-approved APBs are not affected." Click **Approve all** or **Cancel**.

The approval records **Approved by** (your name), **Date** and **Next review** in section 10.

**Skip** moves to the next APB without approving. **Remove approval** (shown on approved APBs) unlocks the APB for editing ("Approval removed").

## Bulk approving non-hazardous products

When pending APBs exist for products without hazard classification (no H-statements), the filter bar shows **Approve {n} non-hazardous**. The dialog **Approve non-hazardous products** says "This will approve {n} APBs for products without hazard classification (no H-statements) with standard text:"
- **Handling:** No special precautions required beyond regular good hygiene.
- **Storage:** Store in original packaging at room temperature. Keep away from direct sunlight.
- **Disposal:** Dispose according to local regulations. Packaging disposed as regular waste.
- **Other notes:** No additional remarks.

Click **Approve {n} APBs**. The button shows "Approving..." while it runs. Afterwards: "{n} non-hazardous APBs approved with standard text". The bulk approval respects the current search, **MAL-kode** and **Approved for over** filters, so only the counted APBs are approved.

## APB approval limit

If your plan caps how many APBs can be approved, a banner at the top of APB Management shows it:
- Info: "Your plan allows up to {limit} approved APBs ({used}/{limit} used). Upgrade to Pro or Enterprise for unlimited approvals."
- Warning when reached: "You have reached your plan's limit of {limit} approved APBs. Upgrade to Pro or Enterprise for unlimited approvals."
- **Upgrade** opens the Subscription page.

The limit number comes from SDS Manager's server. The application does not state a fixed number per plan.

## Opening, creating and printing an APB from the SDS menu

In Danish accounts the ⋮ menu of an SDS row (**SDS Filter**, location SDS lists) shows:
- **Open APB**, when the SDS has an approved APB. It opens a window with the product name, the full APB, **Open in APB management** and **Print / Save as PDF**. Unapproved APBs show an "Awaiting review" or "Needs update" chip on screen. If the APB cannot be loaded: "Could not load APB."
- **Create APB**, when the SDS has no approved APB (Owner, Admin, Admin Light). It opens APB Management, creating the APB for that product if needed, and jumps straight to it. The search is set to the product name and other filters are reset.

**Print / Save as PDF** uses the browser's print dialog. The print layout hides the app around it and puts sections 3–8 in two columns, so a full APB fits on one A4 page. Choose "Save as PDF" in the print dialog to get a PDF.

## Public APB page (QR code / link)

An APB can be opened without logging in through its public link, the **Workplace instruction** page. According to the APB menu tooltip, approved APBs are available via QR codes on chemical labels. The public page shows the same APB content with **Print / Save as PDF**, but no link to the management page. Possible messages: "No token provided", "APB not found", "Could not load APB", and "No APB available for this product."

## Rules, limits and edge cases

- **Exposures need a category.** Without at least one category in **Settings** → **Exposure** → **Exposure categories**, Save stays disabled and the create page shows the category warning.
- **No editing after creation.** Exposures cannot be edited or deleted as a whole. Use **Duplicate** for a corrected copy and **Archive** to remove the original from records. Only individual registrations are updated afterwards.
- **Single exposure date** cannot be in the future. Registration dates must lie within the repetition period.
- **Duration** is in minutes and must be more than 0.
- **Biological** exposures have no concentration and no duration.
- **Chemical** exposures need at least one chemical product category, at least one substance, a concentration and at least one exposure route per substance.
- **Mining** needs at least one of Chemical / Asbestos / Radiation switched on, plus a health examination date.
- **Asbestos** and **Radiation** need a **Date of registration**. Asbestos and Mining need a **Date of examination**.
- **Finish exposure** is only possible after the period is over and when no registrations are pending. After finishing, registrations are locked.
- **Archived** exposures disappear from **In Progress** and **Finished**. Find them under **Status** = **Archived**.
- **My Exposures** users cannot create, duplicate, archive, finish or unlink exposures.
- **Register exposure** from an SDS row needs an SDS file on that row and the Exposures permission.
- **Reports** are never shown to QR-code login users. **Export SDS library** and **Classification and Labeling Report (GHS)** are only for Owners and Admins.
- **Excel Report** applies exactly the filters and grouping on screen.
- **APB** is shown only when the company country is Denmark. Admin Light users may see **Create APB** in the SDS menu, but APB Management opens only for Owners and Admins. Other users are sent back to the start page.
- **Approved APBs are locked.** Section edits, AI shortening, notes and templates are disabled until **Remove approval**.
- **Use same APB for all locations** overwrites notes and section edits of the other unapproved APBs of the same SDS. Already-approved ones are not changed.
- The APB queue holds up to 100 APBs per filter. Narrow with filters or search to reach the rest.
- APB AI shortening fills an edit only when every item in the section comes back successfully. Otherwise nothing changes and "AI call failed for this section" appears.

## Messages and errors users may see

| Message (exact text) | What it means | What to do |
|---|---|---|
| A category is required when creating exposure. Categories can added by administrators on the settings page. | No exposure categories exist | Click **Open setting page** and add a category under **Exposure categories** |
| Exposure date is required | Single exposure has no date | Enter **Enter exposure date** |
| Date of examination is required | Asbestos or Mining without examination date | Fill **Date of examination** |
| Date of registration is required | Asbestos or Radiation without registration date | Fill **Date of registration** |
| Must select at least 1 type of exposure | No type, category or kind chosen | Add a type, or tick a chemical product category |
| Must select at least 1 substance | Chemical exposure without an SDS | **Add** an SDS under **Substance** |
| Concentration can not be empty | Missing concentration value | Enter a measured value or pick an assessed level |
| Exposure routes can not be empty for all substances that have been added. | A substance has no route | Select **Skin and eyes**, **Inhalation** and/or **Swallow** |
| Must select at least one executor for the exposure | "Register for other employees" is on but nobody was added | **Add employee**, or switch it off |
| Please choose type of repeated exposure | Repetition on but not configured | Choose an **Exposure settings** option and a **Repetition** |
| (Error about a missing start or end date) | Unknown-date repetition without a period | Fill **Start date** / **End date** |
| (Error about a missing concentration unit) | A measured concentration has no unit | Pick a unit chip next to the value |
| Required | A required text field is empty | Fill in the field |
| Exposure date registration existed | That date is already registered for this exposure | Choose another date or open the existing registration |
| You have to update all 'Pending' registration before confirm 'Finish and close Exposure' | Pending registrations remain | Set each pending registration to Completed or Not completed first |
| This exposure period is done. Click to check and finish your exposures. | Period over, ready to finish | Click the icon and confirm **Finish exposure** |
| Could not load exposures | List failed to load | Check the connection and click **Retry** |
| No exposures match your filters | Search or status gives no results | Change the status or **Clear filters** |
| Nothing assigned to you | No exposures registered for you (My Exposures) | Nothing to do. Ask your safety manager if you expected exposures |
| Saved successfully | Unknown-date registration saved | — |
| Work procedure is required | Job-procedure exposure without a job procedure | Create it from a job procedure's **Exposure** tab |
| No substances have been found | Use & disposal report has no matching rows | Widen filters or **Reset** |
| Invalid start date / Invalid end date | Date entered in the report filter is not valid | Correct the date |
| No threshold alerts found. | Tier II window has no alerts for that SDS | Optionally click **Re-compute report** |
| This feature is not available on your current subscription plan. | Plan does not include the feature | Upgrade, or contact your administrator / SDS Manager |
| Generating APBs, this may take a moment... | First-time APB setup running | Wait. The page refreshes itself |
| We could not finish setting up your APBs. Please try again. | APB setup did not finish in time | Click **Retry**. Contact support if it repeats |
| No APBs match your filter | Filters exclude everything | **Clear filters** |
| You have reached your plan's limit of {limit} approved APBs. Upgrade to Pro or Enterprise for unlimited approvals. | Approval cap reached | **Upgrade**, or remove approval from APBs you no longer need |
| Remove approval before editing this APB | Tooltip on Save for an approved APB | Click **Remove approval** first |
| APB is approved and locked. Remove approval to edit local notes. | Approved APB | Same as above |
| Emergency contact not configured | No emergency number found for this APB | Contact SDS Manager support to set it up |
| AI call failed for this section | AI shortening failed | Try again or edit the text manually |
| Could not load APB. | APB could not be opened from the SDS menu | Retry later, or open it from APB Management |
| APB not found / No APB available for this product. | Public link has no APB behind it | Ask the workplace to approve the APB or reprint the label |

## Frequently asked questions

Q: Where do I register that an employee was exposed to a chemical?
A: Go to **Exposures** → **Create exposure**, pick a **Category**, choose **Chemical**, and fill in the name, workplace, nature of the work, chemical product category, the SDS(s), concentration, exposure routes, date and duration. Then click **Save**. You can also start from an SDS row's ⋮ menu → **Register exposure**, which prefills the SDS and the location.

Q: Why can't I see the Exposures menu?
A: On Enterprise, **Exposures** appears in the main sidebar for users with the Exposures permission. On Premium and Pro it is listed under **More**; whether it opens depends on whether your plan includes exposures (if not, the upgrade message appears). On Free and Basic it is not shown. Only the **Exposure** tab inside a job procedure is strictly Enterprise-only. Employees without the permission may still see **My Exposures** if exposures are registered for them.

Q: What is the difference between Exposures and My Exposures?
A: **Exposures** is the manager's register of all exposures. There you can create, duplicate, archive and finish them. **My Exposures** shows only exposures where you are the exposed employee. There you confirm your registrations (Completed / Not completed), add dates, durations and comments, but cannot create or archive exposures.

Q: Can I record an exposure for colleagues?
A: Yes. Turn on **Register exposure for other employees** on the create form, click **Add employee**, and choose one or more employees. If you leave it off, the exposure is registered for you.

Q: How do I record carcinogenic (CMR) exposure?
A: In a **Chemical** exposure, under **Type of exposure**, tick "Carcinogenic, mutagenic, reproductive toxic and other chemical products" or one of the other listed categories (auramine, PAHs, nickel refining dust/fumes, 2-propanol, hard-wood dust, lead). Then add the SDSs involved under **Substance**.

Q: What concentration units can I use?
A: Chemical: µg/m³, mg/m³, ppb or ppm. Asbestos: fiber/cm³. Radiation: Bq/m³ or mSV. If you have no measurement, choose **Assessed concentration** and pick **Low**, **Medium**, **High** or **Unknown - None of the above**. Biological exposures have no concentration.

Q: How do repeated exposures work?
A: Turn on "Turn on if you want repeated exposure". Choose **Individual parts of the period** (Per date: one registration per scheduled day), **The whole period together** (Per period), or **Optional number of registrations during the period** (Unknown date: the employee adds dates). Set the start date and a Daily/Weekly/Monthly repetition, or an end date. The employee then confirms each registration from **My Exposures**.

Q: Can I edit an exposure after saving it?
A: No, the exposure itself cannot be edited in the application. Use **Duplicate** from the ⋮ menu to create a corrected copy, and **Archive** the wrong one. Registrations of repeated exposures can still be updated by the employee while the exposure is In Progress, within the options you allowed (**Change concentration**, **Change duration**, **Change exposure date**).

Q: How do I close an exposure when the period has ended?
A: When the period is over, a red alert icon appears on the row. First make sure no registrations are still **Pending**. Then click the icon (or **Finish exposure** in the expanded row) and confirm. Finished exposures are locked, and 'Completed' registrations are recorded with the information provided.

Q: Can I delete an exposure?
A: Not the whole exposure. Use **Archive**, which stops it being recorded as an exposure and can be undone with **Un-archive**. Future (Scheduled) registrations of a repeated exposure can be deleted with the delete icon.

Q: Where do I create exposure categories or my own asbestos/radiation types?
A: Go to **Settings** → **Exposure**. Use **Exposure categories** for your company's categories, **Asbestos** and **Radiation** for your own types (added as sub-entries in the tree), and **Chemical** for the hazard/safety statement codes that trigger an exposure-register requirement.

Q: What does the Use & disposal report show?
A: For each product and location: the amount stored at the start and end of the period, the amount used, the amount disposed, the unit, and the environmental hazard rating (E1–E5). With **Group by substance** on, each product gets sum rows per unit. Filter by locations, environmental hazard, date range, custom field and specific substances.

Q: How do I export the Use & disposal report to Excel?
A: Set your filters, then click **Excel Report**. The file is prepared in the background, an **Export status** window shows progress, and report_for_substance_use_and_disposal.xlsx downloads when ready. It contains the same filtered data as the screen.

Q: Why can't I see Export SDS library or the GHS report under Reports?
A: These two exports are shown only to Owners and Admins. Admin Light, Staff and Read only users see only **Use & disposal** (if they have access). QR-code login users never see Reports.

Q: What is the orange warning icon next to a product name?
A: It is the **Tier II Report** alert. The system has recorded that the stored amount for that SDS exceeded a reporting threshold. Click it to see when and by how much ("Amount … exceeded the threshold for this SDS."), and use **Re-compute report** to recalculate. Threshold rules are set by SDS Manager; contact support for details.

Q: What is an APB and who needs it?
A: APB (arbejdspladsbrugsanvisning) is a Danish workplace chemical instruction. (The Country setting tooltip spells APB out as "Accident Prevention Book"; it is the same feature.) The app's tooltip states that Danish law requires one for every hazardous chemical used at the workplace, approved by a named user and valid for 3 years. SDS Manager shows the **APB** menu only for companies registered in Denmark, to Owners and Admins.

Q: How do I approve an APB?
A: Open **APB**, review the preview, and fill in the four local notes (handling, storage, disposal, other). Optionally use a template or copy notes from a similar product. Click **Approve APB**. Your edits are saved first, the approval records your name, the date and the next review date, and the queue moves to the next APB.

Q: Can I approve many simple products at once?
A: Yes, for products without hazard classification (no H-statements). Click **Approve {n} non-hazardous** in the filter bar, review the standard handling, storage, disposal and other-notes text, and confirm. Only APBs matching your current search and filters are approved.

Q: What does "Needs update" mean on an APB?
A: The SDS behind the APB was updated. The APB shows "SDS updated — review changes:" with before/now values and added or removed statements. Review the changes, adjust the notes if needed, and approve again.

Q: How do employees see the APB?
A: Once the APB is approved, users in a Danish account who can open an SDS row's ⋮ menu see **Open APB** there, and print it with **Print / Save as PDF**. The APB tooltip also says approved APBs are available via QR codes on chemical labels, which open a public **Workplace instruction** page without login.

Q: I edited an approved APB but Save is greyed out. Why?
A: Approved APBs are locked. Click **Remove approval**, make your changes, click **Save**, and approve again.

Q: Is there a limit on how many APBs I can approve?
A: On some plans, yes. A banner shows "Your plan allows up to {limit} approved APBs" and, when reached, a warning. The UI says Pro and Enterprise have unlimited approvals. The exact limit is set by SDS Manager; click **Upgrade** or contact sales.

Q: What happens if I tick "Use same APB for all locations"?
A: When you approve, all other unapproved APBs for the same SDS in other locations are also approved. Their notes and section edits are overwritten with this APB's content. You are asked to confirm first. APBs that were already approved are not changed.

## Related topics

- **Job procedures (job hazard analysis, COSHH assessments, 7-point risk assessments) and chemical work instructions** — Exposure tab, linking exposures, COSHH / 7-point naming by country
- **Chemical risk assessment, PPE approval, disposal classification and substitution** — chemical risk classification, exposure classification in risk calculations
- **Login & Account Security, Users, Roles & Permissions, and Organization Settings** — Settings page (other settings blocks), user roles and permissions
- **SDS library: substances list, SDS details, stock, archive and export** — stored, used and disposed amounts that feed the Use & disposal report; SDS ⋮ menu actions such as Register exposure, Open APB, Create APB
- **Labels, labelling compliance, kits and usage tracking** — secondary container labels and QR codes
- **Plans, Free Trial, Sign-up, Billing and Subscription** — subscription plans and upgrading
