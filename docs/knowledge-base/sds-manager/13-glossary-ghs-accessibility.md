# Glossary, GHS hazard reference data and accessibility in SDS Manager

> Summary: This section explains the words customers hear in SDS Manager (the web application is called SDS Manager Inventory Manager), from regulatory terms such as SDS, GHS, CLP, H-statements and UFI to product terms such as **Substances on Location**, KIT SET, close match and QR poster. It also documents the hazard reference data built into the app: the nine GHS pictograms, signal words, H/P/EUH statement handling, the 1–5 Health/Safety/Environment risk ratings derived from hazard statements, disposal badges, HMIS and NFPA labels, the safety-sign icon sets, units of measure and substance forms. Finally it covers the public accessibility statement (WCAG 2.2 Level AA target, partial conformance, known limitations, how to report a barrier) and the keyboard and screen-reader support in the app. It is for anyone answering "what does this term mean in SDS Manager?", "how does the app show hazards?" or "is SDS Manager accessible?".

## Where to find it

| What | Where in the app | Who sees it |
|---|---|---|
| GHS pictograms, PPE icons, risk ratings, disposal badge, HMIS/NFPA labels | The safety summary at the top of the **SDS details** view (open any SDS from **All my SDSs**, **SDS Filter**, **Substances on Location** etc.) | Anyone who can open the SDS. HMIS/NFPA only for organisations whose country is the US or Canada. |
| Signal word, hazard category abbreviations, H-, P- and EUH-statements | **GHS Information** section and the **Hazard statements**, **Precautionary statements** and **EUH-statements** tables in the SDS details | Anyone who can open the SDS; editing needs permission to edit SDS information on that location |
| **Icons in PDF** (safety signs found in the SDS PDF) | **General Information** section of the SDS details | Same as above |
| Units of measure | Amount and stock popups (**Update Substance Volume**, lots/batches), risk evaluation amount fields, exposure forms | Users who record amounts |
| Measurement system (US or Metric), **Regulatory region**, Country | **Account settings** (general information) | Each signed-in user |
| Substance form, persons at risk, hazard categories | Risk evaluation (**Chemical instruction & risk assessment**) forms | Users who create risk evaluations |
| Accessibility statement | **Accessibility** link in the footer of every signed-in page and below the sign-in box on log-in pages; direct URL path `/accessibility` | Everyone, including people who are not signed in |

## Plan and permission requirements

- The glossary concepts and the GHS reference data are part of every SDS view; no plan restriction applies to *seeing* pictograms, signal words or statements on an SDS you can open.
- **HMIS & NFPA hazard labels** are "displayed only for US and Canada" (Country setting tooltip). The app shows them only when the organisation's country is the United States or Canada.
- Editing GHS data on an SDS (pictograms, signal word, hazard category abbreviations, H/P/EUH statements, **Icons in PDF**) is only offered to users who have permission to edit SDS information on the SDS's location. Which roles carry that permission is decided by SDS Manager's role settings and is not listed in the application.
- **Edit risk ratings** (the pencil next to the inherent Health/Safety/Environment ratings) is shown to users whose account role is **Owner** or **Admin**. Users with permission to edit SDS information on the SDS's location can also open the same editor by clicking the rating cells.
- Clicking an HMIS or NFPA label to edit it requires permission to edit SDS information on that location.
- Country-dependent features named in the Country tooltip: **APB** "available only for Denmark", **Inspection Readiness** "OSHA/RCRA compliance page available only for US", HMIS & NFPA "only for US and Canada".
- The accessibility statement at `/accessibility` is public: no account, plan or role is needed.

## Core concepts: SDS, product, substance, SDS Library and location

These five words cause most confusion. In SDS Manager they mean:

| Term (as on screen) | Meaning in SDS Manager |
|---|---|
| **SDS** / Safety Data Sheet | The supplier's safety data sheet document (usually a PDF) plus the data SDS Manager extracted from it (product name, supplier, revision date, pictograms, statements, components, etc.). The older name MSDS (Material Safety Data Sheet) refers to the same kind of document. |
| **Product** | The commercial item you buy and use (for example a cleaning agent with a product name and supplier). A product normally has one SDS; a product can also exist in your library **without an SDS** ("This product does not have an SDS"). |
| **Substance** | The word the app uses for a product/SDS *placed on a location* in your library. **Substances on Location** lists everything stored at a location; the dashboard counts "Number of chemicals on locations". The same SDS placed on three locations gives three substance records. In regulatory language a "substance" is a single chemical element or compound, as opposed to a "mixture" — SDS Manager's on-screen word is broader and simply means "a chemical product record on a location". |
| **SDS Library** | Your organisation's register of SDSs (in Norway "Stoffkartotek", Sweden "Kemikalieförteckning", Germany "Gefahrstoffverzeichnis", Denmark "Kemikaliefortegnelse"). Managed under **Manage SDS Library**. |
| **Location** | A named physical place in your hierarchy (site → building → floor → room → shelf), not a GPS position. Admins and Owners see the menu as **Sites & Locations**; other users see **My locations**. |

## Glossary A–C

**7-point risk assessment** — The menu name Danish organisations see for **Job procedures** (short name "7-pkt"; "My 7-point risk assessments" for the personal list). Same feature as Job procedures, presented in Danish 7-point framing.

**Admin** — User role "for users who will manage your SDS library, with the ability to add or remove SDS documents. You can assign admin rights to specific locations while providing staff (read-only) or no access to others."

**Admin Light** — User role that "includes all Admin functions except the ability to add or remove SDS documents. It's ideal for organizations with a multi-step SDS approval process, where the first approver should not add SDS to the library."

**Admin with approval** — User role with all Admin permissions that "can also approve SDS and risk assessments" and other approval-required content. Users without this role see the tooltip "Only users with the role "Admin with approval" can approve" on the approval control.

**AICIS** — Australian Industrial Chemicals Introduction Scheme. Shown as an inventory-status check on the **SDS Quality** page for Australia.

**All Our SDS** — The default name the app suggests for a new QR code user (in the language chosen for that user); you can change it. The **SDS Filter** page is also called All Our SDS in its web address and some older text.

**All my SDSs** — The menu item where employees "instantly access Safety Data Sheets (SDSs) for the chemicals they use. It's the default view when scanning a QR code".

**APB** — In SDS Manager: "APB (Arbejdspladsbrugsanvisning)", the Danish workplace chemical instruction. "Danish law requires a workplace chemical instruction (APB) for every hazardous chemical used at your workplace. Each APB must be approved by a named user, is valid for 3 years". Available only to organisations in Denmark. Note: the Country setting tooltip expands the abbreviation as "APB (Accident Prevention Book)"; the APB page itself uses Arbejdspladsbrugsanvisning.

**Approval / Approved / Not allowed for use** — SDS approval statuses set by the account Owner or by users with the **Admin with approval** role ("Approve", "Mark Approval in process", "Mark Not allowed for use", "Remove Approval"). Organisations can also configure a multi-step **SDS Approval Flow**.

**Archive** — Moving an SDS "to archive folder" removes it from the active library without deleting it; it can be un-archived ("It will be restored to active status"). Archived items can be permanently deleted from the archive.

**Attachments** — Extra files linked to a product (for example local instructions). A public **Product attachments** page can be reached from a link/QR on a secondary container label.

**Barcode (EAN/UPC)** — Product barcode. A scanned barcode can be registered to an existing substance ("Register barcode to existing substance").

**Batch / Lot / Batch stock / Container Stock** — Stock-tracking terms. A lot (batch) has a **Batch number**/**Lot Number** and optional **Lot expiry date**. "Container Stock" is a reserved name for container-level stock and cannot be used as a batch number ("\"Container Stock\" is reserved. Use a different batch number.").

**Binder** — Several meanings: (1) **SDS Binder** — a single indexed PDF of all your SDSs for offline use, archiving or distribution; **Location SDS binder** — the same for one location. (2) A paper-based SDS binder you can digitise with **Scan SDS binder** by photographing the first page of each sheet. (3) An uploaded multi-SDS PDF ("SDS-binders") that can be uploaded "as KIT SET (SDS Binder)".

**CAS number (CAS#, CAS no.)** — Chemical Abstracts Service registry number, a unique numeric identifier for a chemical substance (format digits-digits-digit, e.g. 7732-18-5). SDS Manager lists **CAS# of components** for each SDS, lets you search by CAS# ("Product, Supplier, CAS#, UFI#, EU No."), filter by CAS# in components, and match SDSs against restricted lists by CAS#.

**CHEMTREC / CANUTEC** — Examples of emergency agencies the app uses as defaults for US and Canada ("default emergency agency and phone number shown on labels and in the app").

**Chemical instruction & risk assessment** — The per-SDS risk evaluation document (sidebar **Risk assessment**; tooltip "Risk Evaluation"). Also called **Chemical instructions** on some pages.

**Close match / Close match approval** — When SDS Manager's sourcing team finds an SDS for one of your SDS requests that is a close (not exact) match, it appears on **Close match approval** for you to approve or reject. Rejecting needs a comment ("Why was this SDS rejected?"); "The SDS will be unlinked and sent back to our sourcing team." Pending matches show "The SDS below are awaiting approval. They will appear at their locations once approved." The menu item only appears when at least one match is waiting.

**CLP** — EU Regulation (EC) No 1272/2008 on Classification, Labelling and Packaging, the EU's implementation of GHS. CLP adds EUH statements and replaced the old orange danger symbols and R/S phrases. SDS Manager's **Labelling compliance** check finds SDSs "that still use pre-CLP hazard labelling". GB CLP is the UK equivalent.

**CMR** — Carcinogenic, Mutagenic or toxic for Reproduction. Shown as a "CMR" badge on SDSs in job procedures: "Carcinogenic / Mutagenic / Reprotoxic substance — stricter substitution and surveillance rules apply."

**Component** — An ingredient listed in Section 3 of the SDS. The **SDS Components** table shows Component name, CAS no., EC no., REACH no. and concentration; unidentified rows show "Unknown chemical component".

**COSHH** — UK Control of Substances Hazardous to Health Regulations. UK organisations see **Job procedures** as **COSHH assessments** ("My COSHH assessments"), with COSHH Regulation 7, 10 and 11 questions.

**Custom field** — "Custom fields are text fields associated with the SDS on a location." Shown on the SDS detail page and optionally as columns.

## Glossary D–G

**Danger / Warning** — The two GHS signal words (see the signal words section). Not to be confused with the Info / Warning / Danger *types* of a custom **Information message**.

**Department** — A location level you can use for organisational units (the location hierarchy is described as "site, building, floor, department, or storage area").

**Discontinued** — "Mark product as discontinued" flags products no longer for sale so you stop requesting updated SDSs for them ("products that are no longer for sale typically do not get any updated SDS").

**Disposal Classification / Disposal rating** — SDS Manager's guidance categories for disposal (D1 Normal disposal, D2 Special disposal required, D3 Environmentally hazardous, D5 Hazardous waste). Advisory only: "These categories should be treated as guidance only."

**DNEL/PNEC** — Derived No-Effect Level / Predicted No-Effect Concentration, EU REACH values shown as a check on the **SDS Quality** page.

**DSL/NDSL** — Canada's Domestic/Non-Domestic Substances List ("Domestic/Non-Domestic Substances List inventory status (Canada)").

**EC number (EC no., EU No.)** — European Community number for a substance, format 000-000-0. Restricted lists accept CAS# or EC#; an invalid EC number shows "EC number is not valid, expected the format 000-000-0".

**Emergency agency / Emergency number** — The emergency contact shown on labels and in the app; defaults follow your country. The **SDS Quality** check flags an SDS whose emergency number does not match your country ("Wrong Emergency #").

**Employee Access** — Menu for the ways employees reach SDSs without their own account: QR posters, intranet links, tablets/kiosks, offline app, SDS Binder PDF.

**Engineering measures** — Controls (and PPE) you define with a name, category, symbol and short description, used in risk evaluations.

**EUH statements** — Supplemental hazard statements added by EU CLP (codes beginning "EUH", e.g. EUH066). Shown in the **EUH-statements** table and printable on labels as "Supplemental information (EUH)".

**Exposure / Exposure register** — Records of employee exposure (chemical, biological, mining, asbestos, radiation). **Require exposure register** is an icon marking SDSs or categories where exposure must be registered; a filter "Show only substances with exposure register requirements" exists when choosing what to register.

**External System Id / External System Url** — Your own ERP/system reference stored on an SDS.

**Extracted data** — The data SDS Manager reads out of the SDS PDF. You can **Compare with PDF**, **Review Data**, and **Update SDS to latest extracted data** when SDS Manager has re-run extraction.

**GHS** — The UN Globally Harmonized System of Classification and Labelling of Chemicals: common rules for classifying hazards and communicating them through pictograms, signal words, hazard (H) and precautionary (P) statements and the 16-section SDS. The **SDS Quality** page shows the "GHS revision version claimed in the SDS" (**GHS Ver.**). Australian compliance text notes GHS Rev 7 "has been mandatory in Australia since 1 January 2025".

**Global SDS Search** — Search of SDS Manager's central SDS database to add SDSs to your library. UI text describes the database as "16+ million SDSs" (Account settings) and "18M+ SDS sheets" (trial dashboard); the Global SDS Search page says "16 million+" and the Dashboard search tab "18 million+". Confirm the current figure with SDS Manager. Results are filtered to your regulatory region.

## Glossary H–L

**H-statements (Hazard statements)** — Standard GHS phrases describing the nature and severity of a hazard, each with a code: H2xx physical hazards, H3xx health hazards, H4xx environmental hazards (e.g. H225 "Highly flammable liquid and vapour"). Shown in the **Hazard statements** table.

**Hazard category abbreviations** — Short codes for the hazard class and category as written in the SDS (for example "Flam. Liq. 2"). Shown in **GHS Information**.

**Hazardous substances** — Page listing SDSs whose ingredients appear on restricted substance lists ("SDS with components listed on restricted substance lists").

**Health / Safety / Environmental risk rating (H/S/E)** — SDS Manager's 1–5 inherent ratings derived from the SDS hazards. See the risk ratings section.

**HMIS** — Hazardous Materials Identification System, a US colour-bar label (Health, Flammability, Physical Hazard, Personal Protection). Shown for US and Canadian organisations.

**Icons in PDF** — Safety signs (ISO 7010 style pictograms, PPE signs) found in the SDS PDF and listed in **General Information**; editable.

**Import status** — Page showing the progress and result of SDS file imports.

**Information message** — A custom message (type Info, Warning or Danger) you attach to an SDS: "an information box is shown in the SDS list and on labels".

**Inherent hazards / inherent risk** — The hazard level of the substance itself, before controls ("regardless of use conditions or safety measures"). Compared with **Risk rating after controls**.

**Inspection Readiness** — US-only page/panel ("OSHA/RCRA compliance page available only for US").

**Job procedure** — On-screen name for a work activity description involving hazards (Job Hazard Analysis). Some screens (for example dashboard counters) call it a **work procedure** — same thing. "A Job Hazard Analysis is typically used to describe a work procedure involving chemicals, but it is also possible to create work procedures that do not include any chemicals". Employees can be assigned and asked to confirm they have read it. UK: **COSHH assessments**; Denmark: **7-point risk assessment**.

**Kit / KIT SET** — A **Kit** is used "when a single product actually consists of several components that belong together (for example, Part A + Part B), where each component has its own Safety Data Sheet (SDS)." A **KIT SET** is a chemical kit recognised in an uploaded SDS booklet ("KIT SETs are chemical kits recognised in the SDS booklets uploaded for your company"); you create a Kit from a KIT SET at a location. A kit can be tracked as one unit (**Track as Kit**) or per part (**Track Components**).

**Labelling compliance / Legacy labelling** — A check that finds SDSs still using pre-CLP labelling ("orange danger symbols and R- and S-phrases"). Statuses: **Outdated**, **Needs review**, **OK**, **Not yet checked**.

**Label** — Printable labels: **Secondary Container Label** (GHS label for decanted containers, optionally with QR codes), **Transport Label**, usage tracking label, HMIS/NFPA labels.

**Location roles** — Roles can be set per location: Owner, Admin, Admin with approval, Admin Light, Staff, Read only, No Access.

## Glossary M–R

**Manage SDS Library** — "Add new SDSs, update existing ones, and organize your chemical inventory. This is your main workspace for building and maintaining your SDS library."

**Measurement system / Measurement scale / Unit** — US or Metric preference, Weight/Volume/custom measurement types, and units such as kg or gals. See the units section.

**Newer version** — SDS Manager has a later revision of an SDS in your library. Listed under **SDS where newer version exists**; use **Move to newer version** or **Upgrade all SDS to the latest version**.

**NFPA** — US National Fire Protection Association 704 "fire diamond" (Health, Flammability, Instability, Special Hazard). Shown for US and Canadian organisations.

**No Access** — Role "For users who should no longer have any access to the system."

**OEL / OSHA PEL / TLV / REL** — Occupational exposure limits. The **SDS Quality** page checks "OSHA Permissible Exposure Limit / ACGIH TLV / NIOSH REL citation status" (US), "Provincial Occupational Exposure Limit" (Canada), "National Occupational Exposure Limit", and "Safe Work Australia Workplace Exposure Standards" (SWA WES).

**Owner** — The role of the account owner, listed as "Owner" in user and location roles. Several admin-only screens are available to "Owner" and "Admin" alike.

**P-statements (Precautionary statements)** — Standard GHS phrases recommending measures to prevent or respond to exposure (P1xx general, P2xx prevention, P3xx response, P4xx storage, P5xx disposal; e.g. P280). Shown in the **Precautionary statements** table.

**Pictogram** — GHS hazard pictogram (red-bordered diamond, GHS01–GHS09). See the GHS pictograms section.

**PPE (Personal protective equipment)** — Protective equipment icons (blue mandatory signs, ISO 7010 "M" codes) shown with an SDS. **PPE Approval** ("PPE Suggestions Review") lets you "Review and approve PPE icons suggested by the text risk analysis. Approved icons will be shown to users on the SDS detail page."

**Prop 65** — California Proposition 65 warning status, a US check on the **SDS Quality** page.

**QR code user** — A shared, read-only login behind a QR code. "You can create multiple "QR code users" – e.g., one for each of your locations, or a single "QR code user" that gives access to all the SDSs".

**QR poster** — A printable poster to hang where chemicals are used. It has "a small one in the lower-left corner that allows employees to optionally download the SDS Manager app ... and a larger QR code that provides access to the SDS library directly." Scanning gives read-only access; "No app or password needed."

**REACH** — EU Regulation (EC) No 1907/2006 on Registration, Evaluation, Authorisation and Restriction of Chemicals; it sets the EU SDS format requirements. **REACH no.** is a substance's REACH registration number (shown in components and printable on labels as "REACH registration number").

**Read only** — Location role giving view-only access. The Staff role is also described as "Staff Role (Read-Only)".

**Regulatory region** — Your region setting (EU, UK, US, CA, AU, NZ, BR, MY, CN, MX, ZA) that "determines which chemical safety framework is used across the system".

**Restricted list** — A list of CAS/EC numbers (regulatory lists or your own **private restricted list**, imported from Excel/CSV with columns CAS#, EC# and Description). SDSs with ingredients on a list appear under **Hazardous substances** / **SDS compliance**.

**Revision / Revision date / Version** — The SDS's own version identifiers and revision date as printed by the supplier. **SDS Age** on the Quality page is "Years since last SDS revision".

**Risk assessment / Risk evaluation** — Evaluation of hazards, exposure and controls for a chemical; produces the **Chemical instruction & risk assessment** document.

**R-phrases / S-phrases** — Pre-GHS EU risk and safety phrases (e.g. R11, S16), replaced by H- and P-statements under CLP. Flagged by **Labelling compliance**.

## Glossary S

**SDS (local terms)** — SDS Manager uses each country's own word or abbreviation for SDS: Sikkerhetsdatablad (Norwegian), Säkerhetsdatablad (Swedish), Sikkerhedsdatablad (Danish), Käyttöturvallisuustiedote (Finnish), FDS (French, Spanish, Portuguese, Romanian), SDB (German), VIB (Dutch), KCh (Polish), BL (Czech), BA (Hungarian), ПБ (Russian, Ukrainian); English "SDS" in Italian, Greek, Japanese, Chinese, Korean and others. "SDS Manager" is never translated.

**SDS compliance** — Menu group to "Identify Safety Data Sheets containing substances flagged on regulatory or restricted chemical lists."

**SDS Filter** — "Use this view for advanced filtering and sorting of your entire SDS library. With over 10 filters, including an ingredient search".

**SDS Quality** — AI quality check of SDSs against your region's framework. Score 0–10: **Pass** (8+), **Conditional** (5–7), **Fail** (below 5), **Error** (check could not complete).

**SDS request / Substances with missing SDS** — A product added without an SDS, for which you or SDS Manager's team look for the SDS. Statuses include New, Requested from supplier, Needs review, Completed, SDS not available, Unable to match and "Rejected by customer" (a rejected close match).

**SDS Updates / Vendor Contacts / Inbox (from vendors) / Request Updated SDS** — Tools to keep SDSs current, including emailing the vendor you bought from ("Suppliers are legally obligated to provide the most recent SDS upon request").

**Section 2** — The SDS section "Hazards identification" (classification, label elements). Signal word, pictograms and statements come from here.

**Show / hide substance** — A substance can be hidden "from non-admins" (only admin roles then see it) and shown again "for all roles".

**Signal word** — "Danger" or "Warning" on a GHS label (see the signal words section).

**Sites & Locations / My locations** — "Organize and manage your SDS library by site, building, floor, department, or storage area."

**Staff** — Role for employees; "Individual Staff Role accounts are only recommended if you intend to use the chemical tracking feature." Most employees use a QR code or intranet link instead.

**Substitution** — Process to replace a hazardous product with a safer **Substitute product** (or eliminate it). Statuses include In Progress and Assessment completed; the substituted SDS can be archived automatically.

**SVHC** — Substance of Very High Concern: "Substance of Very High Concern status under EU REACH" (an **SDS Quality** check).

## Glossary T–Z

**Tier II Report** — US EPCRA Tier II hazardous chemical inventory reporting. In SDS Manager a **Tier II Report** icon can appear on an SDS in the SDS list. It opens a list of threshold alerts (each dated: "Amount … exceeded the threshold for this SDS", with a **Report now** button) and a recompute option; with no alerts it shows "No threshold alerts found." The thresholds themselves are not specified in the application.

**Transport information** — Dangerous-goods data from SDS Section 14: **UN Number**, **Proper Shipping Name**, **Transport Hazard Class(es)**, **Transport Code**. If a product is not dangerous goods, choose **Not Regulated as Dangerous Goods** when printing a transport label.

**TSCA** — US Toxic Substances Control Act inventory status (an **SDS Quality** check).

**UFI** — Unique Formula Identifier, a 16-character code required on the label of hazardous mixtures placed on the EU market for poison-centre notification ("Unique Formula Identifier — required for EU/NI mixtures"). You can search by UFI#, print the **UFI number** on labels, and the SDS Quality check looks for it.

**UN number** — Four-digit UN identification number for dangerous goods in transport (e.g. UN 1993).

**Unverified SDS** — A page under **SDS Updates** (Owners and Admins, not on trial/free plans, shown only when there are such SDSs) listing SDSs flagged as unverified, with Product, Supplier, Vendor Email, Revision date, Region and Year of purchase; you can add the vendor email and year of purchase or mark "No longer for sale". What makes an SDS "unverified" is decided by SDS Manager and is not described in the application.

**Usage tracking label** — A label with a QR code for chemical usage tracking on containers ("Show chemical tracking QR codes on secondary container labels").

**WHMIS** — Canada's Workplace Hazardous Materials Information System (WHMIS 2015, GHS-based). Framework used for Canadian SDS quality checks; Canadian SDSs also need to be bilingual ("Bilingual (English/French) SDS requirement for Canada").

**Work procedure** — Alias for **Job procedure** used on some screens, such as dashboard counters (see the glossary entry **Job procedure**).

## GHS pictograms in SDS Manager

SDS Manager supports exactly the nine GHS hazard pictograms. On screen each pictogram's tooltip and screen-reader text is its name below.

| Code | On-screen name | Symbol (standard GHS) | Typical meaning |
|---|---|---|---|
| GHS01 | Explosive (GHS01) | Exploding bomb | Explosives, self-reactives, organic peroxides |
| GHS02 | Flammable (GHS02) | Flame | Flammable gases, aerosols, liquids, solids; self-heating; emits flammable gas with water |
| GHS03 | Oxidiser (GHS03) | Flame over circle | Oxidising gases, liquids, solids |
| GHS04 | Gases under pressure (GHS04) | Gas cylinder | Compressed, liquefied, refrigerated or dissolved gases |
| GHS05 | Corrosive (GHS05) | Corrosion | Skin corrosion, serious eye damage, corrosive to metals |
| GHS06 | Toxic (GHS06) | Skull and crossbones | Acute toxicity (fatal or toxic) |
| GHS07 | Irritant, sensitising, harmful (GHS07) | Exclamation mark | Irritation, skin sensitisation, harmful, narcotic effects, ozone hazard |
| GHS08 | Long-term health hazard (GHS08) | Health hazard | Carcinogen, mutagen, reproductive toxicity, respiratory sensitiser, organ toxicity, aspiration |
| GHS09 | Hazardous to the aquatic environment (GHS09) | Environment | Acute/chronic aquatic toxicity |

How pictograms are shown:

1. **SDS details safety summary** — the pictograms appear in the left column (40 px images) with PPE icons underneath. Hovering a pictogram shows its name.
2. **Editing** — users allowed to edit the SDS see a pencil when hovering the pictograms. Clicking it opens a multi-select list of GHS01–GHS09 (each with its image); pick the pictograms and click the save icon. Only these nine codes can be chosen.
3. **Labels** — the **Pictograms** option prints the pictograms on secondary container labels; **Change size of icons (Pictograms & PPE)** scales them.
4. **Comparisons** — **Move to newer version** shows the **GHS pictograms** of the current and newer SDS side by side.
5. **Integrations** — the SDS library export/API returns pictograms with code, title and image.

## Signal words

A GHS signal word tells the reader how severe the hazard is: **Danger** for the more severe categories and **Warning** for the less severe ones. A label carries at most one signal word; some hazardous products have none.

In SDS Manager:

- The signal word is extracted from Section 2.2 of the SDS and shown as **Signal word** in the **GHS Information** section. Users with edit permission can correct it.
- Labels can include it via the **Signal word** option.
- When a Health risk rating cannot be explained by mapped hazard statements, its tooltip says "Based on pictograms/signal word".
- The API export returns the signal word as a code plus translated text.
- Do not confuse it with the **Info / Warning / Danger** type of a custom **Information message**, which is your own message styling.

## Hazard statements (H), precautionary statements (P) and EUH statements

Each SDS has three statement tables in the SDS details: **Hazard statements**, **Precautionary statements** and **EUH-statements**. Each table has two columns, **Code** and **Statements**.

How statements are handled:

- Statements are extracted from the SDS. The statement text is the wording in the SDS; the API export notes "All hazard statement texts ... are returned in the language of the SDS". In risk-rating tooltips the app shows a translated description where one is available.
- The **Regulatory region** setting affects "Hazard statement display — GHS hazard and precautionary statements are shown according to your region's classification."
- Users with edit permission can add or remove codes:
  1. Open the SDS details and find the relevant statement table.
  2. Add a new code. Hazard statement codes must start with **H**, precautionary codes with **P**, and EUH codes with **E** or **A**.
  3. Save. A duplicate code is refused ("It is a duplicate code"); an empty code is refused ("Code can not be empty").
  4. Removing a row shows "Removed successfully".
- If **Apply the edits on this SDS to all instances of same SDS** is switched on, edits apply to every copy of that SDS in your library: "Once synchronized, all edited data is applied permanently to all instances of the Safety Data Sheets. This action cannot be undone."
- Labels can show statements ("Display Hazard and Precautionary statements on label") and EUH statements ("Supplemental information (EUH)").
- H-codes drive the inherent risk ratings and the disposal badge (see the sections on those).

The app's built-in English H-code descriptions cover H200–H205, H220–H231, H240–H242, H250–H252, H260–H261, H270–H272, H280–H281, H290, H300–H373 (including H350i and the H360/H361 variants D, F, FD, Fd, dF, d, f), H400–H402, H410–H413 and H420. The built-in P-code descriptions cover P201 through P503.

## Health, Safety and Environment risk ratings (H/S/E)

Every SDS gets inherent ratings on a 1–5 scale for three categories. They appear in the SDS details safety summary as **Health risk rating**, **Health risk (handling)**, **Safety risk rating** and **Environmental risk rating**, each as a row of five coloured cells (green, yellow, amber, orange, red) with the active level numbered. In SDS lists they appear as H, S and E values.

| Level | Health label | Safety / Environment label |
|---|---|---|
| 1 | No Hazard | Not Dangerous |
| 2 | Slightly Hazardous | Slightly Dangerous |
| 3 | Hazardous | Dangerous |
| 4 | Very Hazardous | Very Dangerous |
| 5 | Extremely Hazardous/Deadly | Extremely Dangerous |

**How the rating is explained.** Hovering a rating shows the hazard statements on that SDS that contribute to it, with each code's level, highest first. If none of the SDS's codes are in the reference table, the tooltip says "Based on pictograms/signal word" (Health), "Based on pictograms/physical hazards" (Safety) or "Based on pictograms/environmental hazards" (Environment). The rating itself is calculated by SDS Manager; the table below is the reference the app uses to list contributing codes.

| Category | Level 5 | Level 4 | Level 3 | Level 2 |
|---|---|---|---|---|
| Health (H) | H300, H310, H330, H334, H340, H350, H350i, H360 (and H360D, H360F, H360FD, H360Fd, H360dF), H370 | H301, H311, H317, H331, H341, H351, H361 (and H361d, H361f), H362, H371, H372, H373 | H302, H304, H312, H318, H332 | H315, H319, H335, H336 |
| Safety (S) | H200, H201, H202, H203, H204, H205, H240, H241, H290 | H220, H222, H224, H229, H242, H250, H260, H270, H271, H272, H280, H281 | H221, H223, H225, H228, H251, H252, H261 | H226, H227 |
| Environment (E) | H410, H420 | H400, H411 | H412, H413 | — |

**Health risk (handling)** is the health rating "excluding oral/ingestion hazards" (it ignores H300, H301, H302, H303, H304 and H305). It reflects that "a chemical could be highly hazardous when ingested but pose minimal risk in typical workplace applications." In the Health tooltip, oral codes are marked "(Oral)".

**Editing the ratings.** Owners and Admins see an **Edit risk ratings** pencil; users with permission to edit SDS information on that location can also click the rating cells. It opens **Edit inherent risk rating** with Health risk rating, Health risk (handling), Safety risk rating, Environmental risk rating (each 1–5 with the labels above) and Disposal.

**After controls.** When an approved risk assessment exists, the summary also shows **Risk rating after controls** (H, S, E including PPE) and **Storage risk after controls** (S, E).

**Advisory note shown in the app:** "Substance hazards are automatically generated from pictograms, hazard statements, precautionary statements, and EUH statements in the Safety Data Sheet (SDS). Note that health hazards may be overstated ... Always consult the SDS for accurate and complete hazard information."

## Disposal rating badge (D1–D5)

The safety summary shows a **Disposal** badge derived from H-codes and the SDS's disposal section (Section 13).

| Badge | Name | Colour | Triggered by |
|---|---|---|---|
| D1 | Normal disposal | Green | "No special disposal requirements identified" |
| D2 | Special disposal required | Yellow | "SDS contains P501/P502/P503 disposal instructions" |
| D3 | Environmentally hazardous | Orange | "lower-severity aquatic toxicity H-codes (H401–H413)" — H401, H402, H411, H412, H413 |
| D5 | Hazardous waste | Red | "highly toxic environmental H-codes (H400, H410, H420)"; EUH059 also counts |

There is no D4. Health codes do not drive disposal. Hovering the badge shows the category and the triggering codes. If data is missing the badge reads "Disposal: Not yet computed". The **Disposal Classification** page lets you override the category. The app warns: "This method is not infallible ... You are responsible for verifying the correct disposal method for each substance before disposing of any material".

## HMIS and NFPA labels (US and Canada)

For organisations whose country is the United States or Canada, the SDS details safety summary shows an HMIS label and an NFPA label when values exist (from your saved values, or read from the SDS PDF).

| Label | Fields (on screen) | Values |
|---|---|---|
| HMIS | Health Hazard Level, Flammability Hazard Level, Physical Hazard Level, Personal Protection | Levels 0–4 or blank; Personal Protection: None, A–K or X |
| NFPA | Health Hazard Level, Flammability Hazard Level, Instability Hazard Level, Special Hazard | Levels 0–4 or blank; Special Hazard: None, Acid, ALK, COR, COR+OX, COR+OXY, CRY, OX, OXY, SA, W, W+OX, RAX |

- Users with permission to edit SDS information on that location can click a label to open **Set Hazard Levels** and change it. Each field can be set to **Show on label** or **Hide from label**.
- **Print NFPA label** / **Print HMIS label** print them; **Copy NFPA/HMIS to newer version** carries the values over when you upgrade an SDS.
- Customers can also store their own rating in a custom field (the app's own example is a custom field named "NFPA rating").
- HMIS and NFPA colours follow those standards, which is a known accessibility limitation (see the accessibility statement section).

## Hazard, PPE and safety-sign icon sets

SDS Manager ships the following icon sets with the application. Icon descriptions shown in the app come from SDS Manager's icon catalogue, in your language where available.

| Set | Count | What it contains |
|---|---|---|
| GHS pictograms | 9 (+1 combined Explosive+Flammable image) | GHS01–GHS09 |
| Hazard icons | 21 | Health: health hazard, ingestion, inhalation, skin, eye, corrosive, toxic, noise, radiation, virus/bacteria. Safety: flammable, explosion, oxidising, temperature, pressurised, nuclear. Environment: environmental, bio hazard. Plus low risk, warning and danger markers. These match the hazard categories used in risk evaluations. |
| PPE and control icons | 50 | 18 numbered blue PPE signs; controls (cabinet, chemical safe, communication, barrier cream, dispose safely, keep locked away, read instructions, ventilation, ventilation system); prohibitions (do not eat or drink, do not leave waste, do not pour in drain, do not touch, keep away from children, no open flame, no pedestrians, no smoking, not drinking water); first aid/emergency (give oxygen, irrigate eyes, medical advice, medical attention, remove from exposure, remove victim, rinse mouth, rinse with water, spill kit); fire (activate alarm, call fire department, fire equipment, fire extinguisher) |
| ISO 7010 safety signs | 337 images | E — safe condition/emergency (66), F — fire equipment (19), M — mandatory action incl. PPE (60), P — prohibition (70), W — warning (78), T — transport dangerous-goods labels (32), the 9 GHS pictograms, and 3 additional uncoded signs (two green first-aid signs and one blue head-covering mandatory sign). Files are named by sign code (e.g. M009), not by human-readable names. |

Where the icons appear:

- **Icons in PDF** on the SDS details: the signs found in the SDS PDF. Users with edit permission can open a searchable picker to add or remove signs.
- **PPE icons** in the safety summary: PPE from an approved risk assessment, plus PPE derived from the SDS. Each has a tooltip description.
- **APB** documents show GHS pictograms and ISO signs.
- **Labels** can print pictograms and PPE icons, with optional **Icon captions**.
- The API export returns "PPE mandatory action icons (M-codes)".

## Units of measure and measurement systems

**Measurement system.** Each user chooses **US** or **Metric** under **Measurement system** in **Account settings**. The country default is imperial (US) for the United States and metric elsewhere. QR code users also have their own measurement system setting.

**Built-in units (16):**

| Type | Metric units | US units |
|---|---|---|
| Weight | μg (micrograms), mg (milligram), g (gram), kg (kilogram) | oz (ounce), lbs (pounds) |
| Volume | μl (microliter), ml (milliliter), l (liter), cc (cubic centimeter), m3 (cubic metre) | fl oz (fluid ounce), pt (pint), qt (quart), gals (gallons), cu ft (cubic foot) |

- In the amount popups, units are listed as e.g. "kg (kilogram)". Units of the other measurement system are shown but greyed out and cannot be selected.
- **Measurement scale / Measurement Type** can be **Weight**, **Volume**, or a customer-defined type. Owners and Admins can use **Manage Measurement Types** (in the amount popup) to add custom types with their own units ("Units (comma separated)"), for example a count unit such as "Each". Custom types cannot be used for kits ("Not available for custom measurement types").
- Once a substance has amount data its measurement type is locked: "Measurement type is locked because this substance already has amount data. New lots must use the same measurement system."
- In risk evaluations the default unit is litres/gallons for liquid-type forms and kilograms/pounds otherwise. Units of your own system are listed first.
- **Exposure concentration units** (exposure forms): chemical — µg/m³, mg/m³, ppb, ppm; asbestos — fiber/cm³; radiation — Bq/m³, mSV.

## Substance forms and other reference lists

**Substance form** (risk evaluation field, multi-select): Aerosol, Foam, Gas, Gel, Granular/Beads, Liquefied Gas, Liquid, Lotion/Cream, Paste, Powder, Semi-Solid, Solid, Suspension/Emulsion, Tablet/Pellet, Wax.

- The app suggests a form from the SDS's product form or product name ("Suggested form: …") in many languages. Click apply to accept, or ignore the suggestion.
- Liquid, Gel, Lotion/Cream, Suspension/Emulsion and Foam count as liquid forms, so the amount defaults to a volume unit. All other forms default to weight. This only happens if no amount has been entered yet.

**Persons at risk:** User of the substance, Employees in general, Public.

**Routes of exposure:** Eye contact, Ingestion, Skin contact, Inhalation (hazard blocks Eyes, Ingestion/Oral, Skin, Inhalation/Respiration).

**Hazard categories in risk evaluations:**
- Other health: Health hazardous, Corrosive, Toxic, Noise, Radiation, Virus/Bacteria, Bio hazard.
- Safety: Flammable, Explosive, Temperature hazard, Pressurized, Nuclear.
- Environment.

**Non-substance hazards** (for job procedures without chemicals): Unsafe tools equipment, Fall hazards, Entrapment, Mechanical, Slip trip hazards, Obstructions, Animal droppings, Lighting, Electrical, Mold, Sharp objects, Asbestos, Extreme heat cold, Awkward postures or lifting, Working alone, Confined space.

**Severity of Harm** (scores 1, 2, 4, 6, 8, 10): Delay (No First Aid Required); Minor Injury (First Aid Case) or Minor Damage; Recordable Incident, Lost Time Injury / Illness or Multiple Minor Injuries; Major Injury, Disabling Illness / Injury, Major Damage or Multiple Recoverable Injuries; Single Death; Multiple Deaths.

**Probability of Event** (scores 1, 2, 4, 6, 8, 10): Very Unlikely, Unlikely, May Happen, Likely, Very Likely, Certain or Imminent.

**Effect of PPE classification:** Very low, Low, Medium, High, Very high (plus "No controls needed").

**Regulatory regions:** AU, BR, CA, CN, EU, MX, MY, NZ, UK, US, ZA. Used for **Regulatory region** in Account settings and the **Region** filter on SDS lists and Global SDS Search.

## Regulatory frameworks referenced in the app

The **Regulatory region** tooltip lists the frameworks SDSs are validated against: "EU REACH/CLP, OSHA HazCom 2012, WHMIS 2015, UK REACH/GB CLP, Safe Work Australia GHS Rev 7, or UN GHS". The region also controls:

- which SDSs Global SDS Search shows;
- language-region validation;
- how statements are displayed;
- which restricted substance lists apply;
- quality flags for SDSs written for another region.

The **Country** setting controls emergency contact defaults, date format (MM/DD/YYYY for US and Canada, DD/MM/YYYY elsewhere), default language, APB (Denmark), Inspection Readiness (US), HMIS & NFPA (US and Canada), the measurement default and the label language.

SDS Manager presents these as features that support compliance. The application does not state that using it alone makes an organisation legally compliant.

## Accessibility statement

SDS Manager publishes an **Accessibility statement for SDS Manager Inventory Manager** at the **Accessibility** footer link (URL path `/accessibility`). It opens without signing in. The statement says:

- **Our commitment:** "SDS Manager is committed to making the Inventory Manager application usable by as many people as possible, including people who use screen readers, keyboard-only navigation, magnification or other assistive technology. Accessibility work is part of our ongoing development, not a one-off project."
- **Standard targeted:** "The standard we measure ourselves against is the Web Content Accessibility Guidelines (WCAG) version 2.2, Level AA."
- **Conformance status:** "SDS Manager Inventory Manager is partially conformant with WCAG 2.2 Level AA. "Partially conformant" means that some parts of the application do not yet fully conform to the standard."
- **Known limitations** (as of 2026-09-09):
  1. "HMIS and NFPA hazard label colours reproduce regulated labelling standards. The colours are prescribed by those standards, so some combinations may fall below the WCAG contrast thresholds. The same information is always available as text."
  2. "A few third-party components, in particular the PDF viewer and the spreadsheet import, may have accessibility limitations that we do not control directly."
  3. "Some tooltips that explain why a control is disabled are attached to the element wrapping the control rather than to the control itself, so a screen reader may not announce the explanation."
  4. "Links that open in a new window are not always announced as doing so."
- **Feedback and contact:** if you meet a barrier, or need information from the application in an alternative format, contact **support@sdsmanager.com**. Include the web address (URL) of the page, "a short description of what you were trying to do and what happened", and "the browser, operating system and any assistive technology you were using". "Every accessibility report is read by a person and routed to the development team. We will confirm that we have received your report and tell you what we intend to do about it."
- **Enforcement:** Norway — Tilsynet for universell utforming av IKT (Norwegian Authority for Universal Design of ICT). EU — the European Accessibility Act applies; contact your country's national enforcement body. United States — the ADA applies; "There is no formal complaint body you need to go through before contacting us".
- **Technical information:** relies on HTML, WAI-ARIA, CSS and JavaScript (React).
- **Assessment method:** self-evaluation combining automated tooling (axe-core and eslint-plugin-jsx-a11y) with "manual testing using keyboard-only navigation and screen readers".
- **Dates:** created 2026-09-09; last reviewed 2026-09-09.

## Keyboard and assistive technology support

These features are in the application today:

- **Skip to main content** — the first item you reach with Tab on every page. It jumps past the header and sidebar to the page content.
- **Focus follows navigation** — after you move to another page, keyboard focus goes to the new page's main content. This does not happen while a dialog is open, so the dialog keeps focus.
- **Page titles and headings** — every page has a descriptive browser-tab title (e.g. "SDS details", "Safety data sheet", "QR poster") and one main heading for screen readers.
- **Landmarks** — main navigation, main content and (on mobile) a **Quick navigation** bottom bar are labelled for screen readers.
- **Named icons and buttons** — icon-only buttons have spoken names such as "Open safety data sheet", "Download PDF", "More options for …", "Expand …/Collapse …", "Clear search". GHS pictograms are read by their hazard name, e.g. "Flammable (GHS02)".
- **Search suggestions** — Arrow Down/Arrow Up move through suggestions, Enter picks the highlighted one (or runs the typed search), Escape closes the list.
- **Inline editing** — in SDS detail fields, Escape cancels an edit. Save buttons such as the pictogram save icon are real buttons reachable by keyboard.
- **Reordering without dragging** — wherever a list can be reordered by drag-and-drop (for example hazards in chemical instructions), each item also has **Move up** / **Move down** buttons. The new position is announced ("Moved to position X of Y").
- **Text alternatives** — the risk calculation flow diagram has a full text description, and coloured status dots on the SDS distribution overview have spoken text ("Status: OK", "Status: needs attention", "Status: problem").
- **Reflow** — the accessibility statement page is readable at 320 px width.

There are no custom global keyboard shortcuts.

## Rules, limits and edge cases

- Only GHS01–GHS09 can be selected as pictograms. Other symbols (old orange EU symbols, transport labels, ISO signs) are handled as **Icons in PDF** or by **Labelling compliance**.
- Statement codes are checked only by their first letter (H, P, or E/A for EUH) and for duplicates. The app does not check that a code exists in GHS.
- Edits to GHS data on one copy of an SDS stay local unless you switch on **Apply the edits on this SDS to all instances of same SDS**. That sync cannot be undone.
- **Update SDS to latest extracted data** overwrites the data with SDS Manager's latest extraction. It updates only SDSs on locations you can access ("N SDS in locations you cannot access were not updated").
- The H/S/E tooltip lists only codes in the reference table. Codes such as H314, H303, H305, H313, H316, H320, H333, H401 and H402 are not listed there, even if present on the SDS (H401/H402 still count for disposal). The rating itself comes from SDS Manager's calculation, which also uses pictograms and the signal word.
- Health risk (handling) ignores oral codes H300–H305. A product can rate high on Health but lower on Health risk (handling).
- Disposal and risk ratings are automated guidance. The app tells users to consult the SDS or a qualified professional.
- HMIS/NFPA are hidden for organisations outside the US and Canada, even if the SDS PDF contains such a label. Such customers can use a custom field.
- The measurement type of a substance is locked once it has amount data. Units from the other measurement system are greyed out.
- A region filter that conflicts with the chosen language is not applied (see messages).
- The SDS database size is given as "16+ million" in one place and "18M+" in another. For an exact current figure, confirm with SDS Manager support/sales.
- Accessibility conformance is "partial" by the company's own statement. No third-party audit or certificate is claimed.

## Messages and errors users may see

| Exact text | Meaning | What to do |
|---|---|---|
| Code can not be empty | You tried to add a statement without a code | Type a code (e.g. H225) |
| Invalid H code | A hazard statement code must start with H | Correct the code |
| Invalid P code | A precautionary code must start with P | Correct the code |
| Invalid EUH code | An EUH-table code must start with E (or A) | Correct the code |
| It is a duplicate code | The code is already in the table | Nothing to add |
| Removed successfully | The statement was removed | — |
| Disposal: Not yet computed | Missing data (no H-codes or no parseable disposal section) | Review and set the category on **Disposal Classification** |
| Risk must be evaluated | The SDS has no risk evaluation yet | Create a risk evaluation |
| Measurement type is locked because this substance already has amount data. New lots must use the same measurement system. | Unit type fixed by existing stock data | Use a unit of the same type |
| "Container Stock" is reserved. Use a different batch number. | Reserved batch name | Choose another batch number |
| Not applied: no SDS in the selected language exist in this region. Remove this filter or change the language. | Region and language filters conflict | Remove the region filter or change the language |
| Only users with the role "Admin with approval" can approve (tooltip) | Your role cannot approve SDSs, risk assessments or job procedures | Ask an Admin with approval |
| Confirm to update SDS to latest extracted data | Confirmation before overwriting with re-extracted data | Confirm only if you want SDS Manager's latest data |
| Once synchronized, all edited data is applied permanently to all instances of the Safety Data Sheets. This action cannot be undone | Warning before syncing edits to all copies | Confirm or cancel |
| EC number is not valid, expected the format 000-000-0 | Restricted-list EC number format | Use the 000-000-0 format |

## Frequently asked questions

Q: What is the difference between an SDS, a product and a substance in SDS Manager?
A: The SDS is the supplier's safety data sheet document and its extracted data. The product is the commercial item it describes. A substance is the app's word for that product/SDS placed on one of your locations, so one SDS on three locations appears as three substances. A product can also be in your library without an SDS.

Q: Which GHS pictograms does SDS Manager support?
A: All nine GHS pictograms: GHS01 Explosive, GHS02 Flammable, GHS03 Oxidiser, GHS04 Gases under pressure, GHS05 Corrosive, GHS06 Toxic, GHS07 Irritant/sensitising/harmful, GHS08 Long-term health hazard and GHS09 Hazardous to the aquatic environment. They are extracted from the SDS and shown in the SDS details summary. Users with edit permission can correct them.

Q: The pictograms on an SDS are wrong. Can I fix them?
A: Yes, if you have permission to edit SDS information on that location. Open the SDS details, hover the pictograms, click the pencil, select the correct GHS codes and click save. To apply the change to every copy of the same SDS, switch on "Apply the edits on this SDS to all instances of same SDS"; that sync cannot be undone.

Q: What does the signal word mean?
A: It is the GHS word that shows hazard severity: "Danger" for more severe hazards, "Warning" for less severe. SDS Manager reads it from Section 2 of the SDS, shows it under GHS Information and can print it on labels.

Q: What are H-, P- and EUH-statements?
A: H-statements describe the hazard (e.g. H225 Highly flammable liquid and vapour). P-statements give precautions (e.g. P280). EUH-statements are extra EU CLP phrases. SDS Manager shows each in its own table with Code and Statements columns, and you can add or remove codes if you may edit the SDS.

Q: How are the Health, Safety and Environment risk ratings calculated?
A: SDS Manager rates each SDS 1–5 for Health, Safety and Environment from its hazard statements, pictograms and signal word. Hovering a rating lists the contributing H-codes and their levels; for example H300 counts as Health 5 and H225 as Safety 3. The ratings are automated guidance; Owners/Admins (and users allowed to edit the SDS) can change them in "Edit inherent risk rating".

Q: Why is "Health risk (handling)" lower than "Health risk rating"?
A: Health risk (handling) excludes oral/ingestion hazards (H300–H305). A chemical that is dangerous if swallowed may pose less risk in normal workplace handling. The full Health risk rating includes all hazards.

Q: What do D1, D2, D3 and D5 mean?
A: They are disposal guidance badges. D1 Normal disposal, D2 Special disposal required (SDS has P501/P502/P503 instructions), D3 Environmentally hazardous (H401–H413), D5 Hazardous waste (H400, H410, H420). There is no D4. Always verify disposal against the SDS.

Q: Why don't I see HMIS or NFPA labels?
A: They are shown only for organisations whose country is the United States or Canada, and only when values exist. Elsewhere you can record your own rating in a custom field, for example one named "NFPA rating".

Q: What is a UFI and where do I find it?
A: The Unique Formula Identifier is a 16-character code required on labels of hazardous mixtures sold in the EU and Northern Ireland, linking the product to poison-centre information. You can search your library by UFI#, print the UFI number on labels, and the SDS Quality check looks for it.

Q: Which units can I record amounts in?
A: Weight: μg, mg, g, kg, oz, lbs. Volume: μl, ml, l, cc, m3, fl oz, pt, qt, gals, cu ft. Your Measurement system setting (US or Metric) decides which units can be selected; the others are greyed out. Owners and Admins can also add custom measurement types such as counts.

Q: How do I switch between US and metric units?
A: Open Account settings and use the Measurement system switch (US / Metric). The default is US units for the United States and metric elsewhere.

Q: What is a "job procedure" — is it the same as a work procedure?
A: Yes. "Job procedure" is the on-screen name and "work procedure" is used in some places for the same thing: a Job Hazard Analysis describing a work activity, its hazards and controls. UK organisations see it as "COSHH assessments" and Danish organisations as "7-point risk assessment".

Q: What is a close match?
A: When SDS Manager's team finds an SDS for your request that is close but not identical to what you asked for, it appears on Close match approval. Approve it to place it at its locations, or reject it with a reason so it goes back to the sourcing team.

Q: What is the difference between a Kit and a KIT SET?
A: A Kit is a product made of several parts that each have their own SDS (e.g. Part A + Part B), linked under one record. A KIT SET is a kit recognised in an SDS booklet you uploaded; you use it to create a Kit at a location from components you already have.

Q: What is a QR poster?
A: A printable poster with a large QR code giving employees read-only access to the SDSs for that area, plus a small QR code to download the SDS Manager app. No app or password is needed.

Q: Is SDS Manager accessible / WCAG compliant?
A: SDS Manager targets WCAG 2.2 Level AA and states that the Inventory Manager application is "partially conformant". Known gaps: HMIS/NFPA colour contrast, some third-party components (PDF viewer, spreadsheet import), some disabled-control tooltips not announced, and links opening in new windows not always announced. The full statement is at the Accessibility link in the footer.

Q: How do I report an accessibility problem?
A: Email support@sdsmanager.com with the page URL, what you tried and what happened, and your browser, operating system and assistive technology. A person reads every report, routes it to the development team, confirms receipt and tells you what will be done.

Q: Can I use SDS Manager with only a keyboard?
A: The app supports keyboard use. Every page starts with a "Skip to main content" link, focus moves to the new page after navigation, icon buttons have spoken names, search suggestions work with arrow keys/Enter/Escape, and drag-and-drop lists have Move up/Move down buttons. The company's statement lists remaining known limitations.

Q: Can I read the accessibility statement without an account?
A: Yes. The statement page is public and linked from the sign-in pages as well as from the footer of the signed-in application.

Q: Does SDS Manager make us legally compliant with REACH, CLP or OSHA HazCom?
A: The application presents its features as support for compliance, for example validating SDSs against your region's framework and flagging outdated labelling. It does not claim that using it alone makes you compliant. Responsibility for compliance remains with the organisation; confirm specific legal questions with SDS Manager support/sales or your own advisor.

## Related topics

- **SDS library: substances list, SDS details, stock, archive and export** — SDS details, editing SDS data, Hazardous substances, restricted lists, stock and amounts
- **Keeping SDS up to date: newer versions, SDS update requests to vendors, vendor inbox and SDS Quality** — newer versions, SDS Quality
- **Chemical risk assessment, PPE approval, disposal classification and substitution** — risk evaluations, Disposal Classification and PPE Approval
- **Job procedures (job hazard analysis, COSHH assessments, 7-point risk assessments) and chemical work instructions** — COSHH assessments, 7-point risk assessments
- **Labels, labelling compliance, kits and usage tracking** — secondary container, transport and HMIS/NFPA labels, Labelling compliance, lots and kits
- **Locations, QR codes and employee access to SDS** — QR posters, QR code users, offline app
- **Login & Account Security, Users, Roles & Permissions, and Organization Settings** — Account settings: country, regulatory region, measurement system; roles and permissions
