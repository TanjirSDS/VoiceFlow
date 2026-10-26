# Chemical risk assessment, PPE approval, disposal classification and substitution

> Summary: SDS Manager includes a chemical **Risk assessment** module (shown on some screens as "Risk Evaluation") where you assess one Safety Data Sheet (SDS) at a time. You describe how the product is used, rate each hazard for Health, Safety and Environment, record PPE and controls, and get a calculated risk category before and after controls. A user with the right location role then approves it, and the app produces a printable **Chemical instruction & risk assessment** document. Around this module sit three related tools: **PPE Approval**, where admins review PPE icons suggested automatically from the SDS text; **Disposal Classification**, which sorts your chemicals into waste-disposal categories; and **Substitutions**, which tracks replacing or eliminating hazardous products. These tools are for EHS managers, safety officers and administrators who need documented, auditable chemical risk control.

## Where to find it

| Feature | Where in the menu | URL path | Who sees the menu item |
|---|---|---|---|
| Risk assessment list | Sidebar **Risk assessment** (short label **Risk**). Hover tooltip: "**Risk Evaluation** – Use SDS Manager's Risk Evaluation module to create detailed Chemical Instruction & Risk Evaluation documents…" | `/risk-assessments/` | Users whose role and plan include risk assessment. It is never shown to **Read only** or **No Access** users. See "Plan and permission requirements". |
| One risk assessment | Click a row in the list, or use **Create risk evaluation** / **Open risk evaluation** on an SDS | `/risk-evaluations/<id>` | Same as above |
| Risk calculation diagram | **▸ Show risk calculation method diagram** inside a hazard | `/risk-evaluations/<id>/hazard/<hazard id>/diagram` | Same as above |
| Chemical instruction & risk assessment | The document icon in the list (**Open chemical instruction & risk assessment**), or **Open chemical instruction** on an SDS | `/risk-evaluations/<id>/instructions` | Anyone the system lets open it. On the SDS menu the item needs the location permission to open chemical instructions. |
| PPE Approval | Sidebar **PPE Approval** (short label **PPE**). Page title **PPE Suggestions Review** | `/ppe-approval` | **Owner** and **Admin** only. Not available to QR-code logins. |
| Disposal Classification | Sidebar **Disposal Classification** (short label **Disposal**) | `/disposal` | **Owner** and **Admin** only. Not available to QR-code logins. |
| Use & disposal report | Sidebar **Reports** → **Use & disposal**. Page title "Report for product use and disposal" | `/reports` | Users with the reports and use & disposal permissions. Hidden for QR-code logins. |
| Substitutions | Sidebar **Substitutions**, or the **More** menu on some plans | `/substitutions`, `/substitutions/create`, `/substitutions/edit/<id>` | Users with the substitution permission (see "Plan and permission requirements") |
| Risk Analysis / re-analysis | **Settings** → **Risk Analysis** section | `/administration/setting-function` | The account **Owner**, and users SDS Manager treats as account administrators |
| AI on/off switch | **Settings** → **AI functions on risk assessment** | same | Users who can open Settings |

## Plan and permission requirements

**How access is decided.** SDS Manager's servers send each user two things: the features their subscription plan includes, and the actions their role allows. The app hides or blocks screens using both. Exact plan contents are set by SDS Manager. Where a plan does not include a feature but the account is allowed to see upgrade prompts, the user sees "This feature is not available on your current subscription plan." (or "...on your current trial plan.") with an upgrade option.

**Risk assessment menu placement by plan** (as the left menu shows it):

| Plan | Where **Risk assessment** appears |
|---|---|
| Free, Basic | Not in the main sidebar. It can appear in the **More** menu, where clicking it shows the "feature not available" upgrade message if your plan lacks it. |
| Premium | In the **More** menu until the account has 5 or more SDS, then in the main sidebar |
| Pro, Enterprise | Main sidebar |

Exactly which plans include risk assessment is not listed in the app. Confirm with SDS Manager support or sales.

**Substitutions menu placement:** main sidebar on **Enterprise**; in the **More** menu on **Premium** and **Pro**; not shown on Free or Basic. The user also needs the substitution permission.

**PPE Approval and Disposal Classification:** the account's plan must include the hazardous-substances features, and the user must be the account **Owner** or have the **Admin** role. **Admin Light**, **Staff**, **Read only** and **No Access** users, and QR-code logins, cannot open these pages. If they try, the app sends them to the start page.

**Role rules inside a risk assessment:**

| Action | Who can do it |
|---|---|
| Open the Risk assessment list and pages | Users with the risk assessment permission. Never **Read only** or **No Access**. |
| Edit a Draft or Revision draft | Users who can open it. Editing is locked once the assessment is **Approved** or **Replaced by newer version**. |
| **Approve** | The account **Owner**, or a user with the location role **Admin with approval** on at least one location where the assessed SDS is used. A user who is only **Admin** on those locations sees a greyed-out **Approve** button with the tooltip "Only users with the role "Admin with approval" can approve". Users with neither role see no Approve button. |
| **Create new revision** (on an approved assessment) | Account **Owner** or **Admin** |
| **Move to archive** / **Un-archive risk assessment** (list page, desktop) | Account **Owner** or **Admin** |
| Delete a draft | Shown on Draft and Revision draft assessments that are not locked |
| **Edit risk ratings** on an SDS (inherent ratings and disposal) | Account **Owner** or **Admin** |
| **Risk Analysis** section in Settings | Account **Owner**, and users SDS Manager treats as account administrators |

**Settings set per account:**
- **AI functions on risk assessment.** An on/off switch in Settings, on by default. Turning it on requires the risk assessment feature.
- **Risk ranking matrix.** There is no switch in the app; it appears only when enabled for your account. Ask SDS Manager support.
- **Customised 6-level risk matrix.** An account-level configuration, not a user setting.
- **Import legacy risk assessments.** Appears only for accounts where SDS Manager has enabled it.

## Key concepts: risk evaluation, inherent hazard and risk category

- **One risk assessment per SDS.** A risk assessment (risk evaluation) is substance-level: it evaluates one SDS and can be reused by every job that uses the chemical. Job procedures (called **COSHH assessments** for UK accounts) are activity-level and pull hazard data from approved risk assessments. The UI says: "To add a product to a job procedure, you must first create a risk assessment of the SDS of the product. After the risk assessment is approved, you can add the product to the job procedure." Job procedures are covered in the topic **Job procedures (job hazard analysis, COSHH assessments, 7-point risk assessments) and chemical work instructions**.
- **H / S / E.** Every rating is shown for **H**ealth, **S**afety and **E**nvironment.
- **Inherent hazard (1–5).** The built-in hazard level of the product, derived from its classification (H-codes). It does not depend on how you use the product. The page header shows it as **Inherent hazards**.
- **Risk rating** (square badge) is the result **without** controls. **Risk rating after controls** (star badge) is the result **with** PPE and controls. **Storage risk after controls** covers Safety and Environment risk while the product is stored at each location.
- **Risk category (1–5)** is the final outcome of the calculation for each hazard, both excluding and including PPE/controls.

## Risk assessment list page

**Risk assessment** opens the list of all risk assessments you can access.

**Controls at the top:**
- **Add risk evaluation**: starts a new assessment (see "Creating a risk assessment").
- **Import legacy risk assessments**: only on accounts where SDS Manager has enabled it.
- **Also show Risk Evaluation for SDS on archived locations**: a checkbox, off by default.
- **Filter by Product name**: a search box.
- Location picker with an **All Locations** option.
- **All Authors**: filter by who created the assessment.
- **All Statuses**: filter by status. The default is **Approved** + **Draft**.
- For UK, Denmark and Australia accounts only, a collapsible country compliance guide explains how a substance-level Risk Evaluation relates to COSHH (UK), the Danish rules, or the Australian WHS Regulations.

**Columns:**

| Column | What it shows |
|---|---|
| **Product Name** | Product name, with the supplier underneath |
| **Job procedure** | Job procedures that use this assessment |
| **Location** | Locations where the SDS is used. Grey entries with the tooltip "Location of linked SDS" are locations of other SDS linked to the same assessment. |
| **Revision date** | SDS revision date |
| **Risk rating** | H, S and E square badges: the highest risk category without controls |
| **Risk rating after controls** | H, S and E star badges: the highest risk category with PPE/controls |
| **Storage risk after controls** | S and E star badges |
| **Document status** | Coloured status label (see Statuses) |
| **Approved** | Approval date. On mobile: "by <name> at <date>". |
| **Created By** | Author |
| **Action** | **Open chemical instruction & risk assessment** (document icon), plus **Move to archive** or **Un-archive risk assessment** for Owner/Admin |

Click a row to open the assessment. Rows per page: 10, 20, 50 or 100. Your filters, page and search are remembered while you navigate back and forth in the same browser tab.

## Creating a risk assessment

**From the Risk assessment page:**
1. Click **Add risk evaluation**. The **Add risk evaluations** popup opens.
2. Search your SDS library by "Product, Supplier, CAS#, UFI#, EU No." The search covers SDS that are in use.
3. Click the **+** icon on the SDS you want. "Risk evaluation added successfully" confirms it. The popup stays open, so you can add several.
4. Close the popup. The list refreshes and the new assessments appear as **Draft**.

**From the SDS library or a location's chemical list** (the "more actions" menu of an SDS):
- **Create risk evaluation**: creates a draft and opens it. Shown when the SDS has no risk assessment yet.
- **Open risk evaluation** or **Edit draft risk evaluation**: opens the existing one.
- **Open chemical instruction**: opens the approved assessment's instruction document. Needs the location permission to open chemical instructions.
- If the SDS already has an **approved** risk assessment and no draft, creating another is blocked. A popup says: SDS "<product>" has already linked to an approved Risk assessment: <name>. "You have to unlink it before creating a new one."

The SDS library also has a risk assessment status filter: **With risk assessment**, **Need risk assessment**, **Risk assessment not needed**, **Without risk assessment**. A status column shows values such as "Risk must be evaluated" (with the locations still missing an evaluation) or "Need approval". Clicking it creates or opens the evaluation.

## The risk assessment page: header and actions

The page has a header and three numbered sections: **1 Your Usage**, **2 SDS Information** and **3 Risk assessment**.

**Header contents:**
- Back arrow. If you have unsaved changes you get "You have unsaved changes, please save".
- **Open SDS detail in new tab** and **Open PDF in new tab** icons.
- Delete icon (red bin): shown only on Draft and Revision draft. It asks "Are you sure you want to permanently delete this draft risk assessment? This cannot be undone."
- Product name, **Revision date**, **Signal word**, and **Inherent hazards** (H/S/E levels from the SDS classification).
- A version dropdown that lists the other revisions of this assessment, so you can switch between them.
- **Approve**: on drafts (see Approving).
- **Create new revision**: on Approved assessments, for Owner/Admin.
- The AI panel "Ready for AI hazard assessment" with **AI Suggest**: on editable drafts when AI is enabled, once at least two of the Your Usage fields are filled (see AI Suggest).

**Saving.** Text and choices save automatically about a second after you stop typing. The page shows "Saving...", then "✓ Saved". While edits are pending it shows "Changes will be saved automatically". Hazard descriptions are saved when you press Enter ("Press enter to save").

## Section 1 – Your Usage

Subtitle: "Describe how you use this substance". These fields drive the exposure part of the calculation:

| Field | Options / notes |
|---|---|
| **What is the substance used for?** | Free text, up to 1,000 characters |
| **How should the substance be used?** | Free text, up to 1,000 characters |
| **Substance form** | Multi-select: Aerosol, Foam, Gas, Gel, Granular/Beads, Liquefied Gas, Liquid, Lotion/Cream, Paste, Powder, Semi-Solid, Solid, Suspension/Emulsion, Tablet/Pellet, Wax. The app may show "Suggested form: …" based on the product, with **Apply** or **Ignore**. |
| **Persons at risk** | Multi-select: **User of the substance**, **Employees in general**, **Public** |
| **Classification of duration** | 1 < 15 min · 2 15 min to 2 hours · 3 2 hours to 4 hours · 4 4 hours to 8 hours · 5 Above 8 hours. Labels can be localised by the system. |
| **Frequency** | 1 Annually · 2 Bi-annually · 3 Monthly · 4 Weekly · 5 Daily, plus 6 Constant or hourly where your account's classification includes a sixth level |
| **Amount used** | A number plus a unit grouped under **Weight** and **Volume**, with metric and US units. Saved when you leave the field or change the unit. |
| **Substitution** | **N/A**, **Evaluated**, or **Need to be substituted**. This is a note on the assessment. The separate Substitutions module tracks actual substitution projects. |

**Required before rating hazards.** Duration and Frequency must be set before you can set hazard ratings. Otherwise you see "Please fill in Duration, Frequency, and Amount in the 'Your Usage' section before setting risk parameters." For inhalation: "Before you can define this parameter, set the Classification of duration and Frequency of use first." Safety and environmental hazards also need the **Amount**: "Set the Amount in 'Your Usage' to enable risk category calculation for safety and environmental hazards."

## Voice input (AI)

When **AI functions on risk assessment** is on and the assessment is an editable draft, Section 1 shows "Save time with voice input". If usage is already filled in, a microphone icon appears instead.
1. Click the microphone. The **Voice input — describe your usage** dialog opens.
2. Click **Start recording** and describe what the product is used for, how it is applied, how often, how long each time, how much, its physical form, who is at risk, and whether substitution is needed.
3. Click **Stop recording**. The app transcribes your speech ("Transcribing and extracting fields…") and shows **What we heard**, which you can edit, plus **Extracted fields**.
4. Click **Apply**. The fields are filled in and saved ("Voice input applied to form fields").

Voice input needs a microphone, browser support, and a secure (HTTPS) connection. See Messages for its error texts.

## Locations using the SDS (location table and storage risk)

Between Section 1 and Section 2 is a table with one row per location where this SDS is used:

| Column | Meaning |
|---|---|
| **Location** | The location. A warning icon and highlight mean "SDS Request is under review". |
| **Amount** | Amount stored at that location, with an edit pencil. Tooltip: "Amount stored on location must be set for risk calculation". |
| **Safety risk** | Inherent safety level (selectable) |
| **Likelihood of accidental Safety event during storage** | 1–5 |
| **Environment risk** | Inherent environmental level (selectable) |
| **Likelihood of Environmental release during storage accident** | 1–5 |
| **Risk category Safety - Storage** | Calculated storage risk (S) |
| **Risk category Environment - Storage** | Calculated storage risk (E) |
| **Ignore** checkbox | "Ignore is used to allow you to create separate assessments for different locations e.g. due to different storage conditions." |

- If the SDS is on more than one location and you change a value, the app asks "Do you want to set same value for this SDS on all locations?" (**Yes** applies it everywhere, **No** only to this row).
- **Sync location** refreshes the locations and quantities from your inventory. Tooltip: "Refresh the locations for this substance on this risk assessment, including quantities by location." Success message: "Sync location successfully".
- The UI guidance on storage risk: "If you store large quantities of this chemical with safety or environmental risks, you should also evaluate the storage risk below. For small amounts, a storage risk evaluation is normally not required."

A hazardous components block follows, listing **EC/CAS**, **Name of the chemical**, **Concentration** and **Listed in** (regulatory lists).

## Section 2 – SDS Information

Subtitle: "Pre-filled from the Safety Data Sheet". These text fields come pre-filled from the SDS and are editable on drafts:
- **Hazard and precautionary statements**
- **Precautions for safe handling**
- **Storage requirements**
- **How should the substance be disposed of?**
- **Restriction on use of substance**
- **Transportation requirements**

## Section 3 – Risk assessment: overview

Section 3 starts with a summary:
- **Risk rating**: H, S and E chips without controls.
- **Risk rating after controls**: chips such as "H4→2", meaning 4 without controls and 2 with controls. Tooltip: "Health rating 4 without controls, 2 with controls (band: Medium)".
- **Storage risk after controls**: S and E.
- **PPE/Controls**: the icons of all PPE and controls added. A "Click to show all PPE/Controls Icons" link appears when there are many.
- The **Risk ranking** block, if enabled for your account.

**Band labels on the chips:** 1 = **Low** (green), 2–3 = **Medium** (yellow), 4 = **High** (orange), 5 = **Extreme** (red). An empty chip shows:
- **No hazard**: "This SDS is not classified for <axis> hazards, so there is nothing to rate — no action needed."
- **Not available**: "This SDS has no processed classification data yet…"
- **Not rated**: "…rating not set yet — open the hazard blocks below and set a rating."

**Not hazardous checkbox:** "Substance has no need for controls as it is not hazardous to either health, safety or the environment". You can tick it only when no hazards are added ("All hazards must be deleted before this option can be checked"). While it is ticked, hazards cannot be added ("Cannot add hazards to a non hazardous product").

## Types of hazards: adding and rating hazards

Under **Types of hazards**, click **Add** to open the **Hazards** picker:

| Group | Hazard types |
|---|---|
| **Routes of exposure** | Eyes, Ingestion/Oral, Skin, Inhalation/Respiration |
| **Other Health** | Health hazardous, Corrosive, Toxic, Noise, Radiation, Virus/Bacteria, Bio hazard |
| **Environment** | Environment |
| **Safety** | Flammable, Explosive, Temperature hazard, Pressurized, Nuclear |

Each hazard type can be added once. Hazard types can be pre-activated from the SDS; the hazard then shows "Hazard type is activated due to '<statement>' found in SDS". Delete a hazard with the bin icon ("Confirm to delete hazard").

Each hazard is a collapsible block. The header shows the risk category without controls (square) and with controls (star), plus the icons of its PPE/controls. The header turns green when both are calculated.

**Health hazards** (routes of exposure and other health) have three ratings:
1. **Inherent health hazards**: 1 No Hazard · 2 Slightly Hazardous · 3 Hazardous · 4 Very Hazardous · 5 Extremely Hazardous/Deadly. Tooltip: "Select the hazard level of this substance for the selected hazard type."
2. **Inherent Likelihood / Exposure (without Controls)**. For inhalation it is labelled **Class. exposure Inhalation wo/ PPE**. Options: 1 Very low · 2 Low · 3 Medium · 4 High · 5 Very high. Tooltip: "Estimate how likely the exposure or incident is to occur without any PPE or safety measures in place."
3. **Controls effect on exposure**. For inhalation it is labelled **PPE effect on Inhalation Exposure**. Options: 1 Very low to 5 Very high, plus **0 - No controls needed**. You must add PPE or controls first ("You must add Personal Protective Equipment or Controls before you can set the effect of the equipment").

**Safety hazards and Environment** have:
1. **Inherent safety hazards of the substance** (or **Environmental hazard potential of the substance**): 1 Not Dangerous · 2 Slightly Dangerous · 3 Dangerous · 4 Very Dangerous · 5 Extremely Dangerous.
2. **Likelihood of accidental event w/o Controls**: 1 Very unlikely · 2 Low likelihood · 3 Likely · 4 Very likely · 5 Extremely likely.
3. **Effect of Controls**: 1–5 or 0 - No controls needed. For Environment, PPE, controls **or emergency controls** must be added first. For safety hazards, PPE or controls must be added first.

Each block also has a **Description of Hazard** field, and once both categories are calculated, a link **▸ Show risk calculation method diagram**.

## Protection and controls (PPE, Controls in place, Emergency Controls)

Inside each hazard, **Protection and controls** lists chips for everything added ("no protection added" if empty), colour-coded by type. Three buttons add items:
- **PPE**: **Personal protective equipment**
- **Ctrl**: **Controls in place**
- **Emrg**: **Emergency Controls in place**

The add dialog lists items grouped by category: Eyes Protection, Foot Protection, Body Protection, Face Protection, Respirators, Gloves, Hygiene, Avoid, Ventilation, Disposal, Information, Storage, Emergency spillage, Emergency medical, Emergency fire, Other.

A **Comment** is required ("Comment can't be empty"); it is pre-filled with the item's description. Click a chip to edit its comment or **Delete** it (**Edit PPE** dialog). Without at least one item, the "effect of controls" rating cannot be set.

## Inhalation with measured exposure data

The **Inhalation/Respiration** hazard has a checkbox **Based on measured exposure data**. When ticked, you enter:
- **Measured in**: mg/m3, ppm or fibres ml−1
- **Occupational exposure limit OEL**
- **Short-term Occupational exposure limit OEL**
- **Length of workday**
- **Sum exposure time one workday**
- **Maximum length of one exposure**
- **Measured substance concentration level**
- **Measured substance concentration level w/ PPE**

The app shows **Equivalent exposure for the workday** (and **w/ PPE**). This equals concentration × exposure time ÷ length of workday, shown as a worked formula. It also shows the resulting **Inhalation Quant. OEL wo/ PPE** and **Inhalation Quant. stOEL wo/ PPE** ratings, each with a **With PPE** value.

## How risk is calculated – health hazards

SDS Manager calculates the risk category on its servers. The **risk calculation method diagram** shows the method step by step, with your values highlighted. The dark path is without PPE and the purple path is with PPE. The standard 5-level method:

**Step 1 – Exposure including PPE.** Your exposure/likelihood class (1–5) is combined with the PPE/controls effect (1–5). Rule: result = exposure − (effect − 1), never below 1.

| PPE effect \ Exposure | 1 | 2 | 3 | 4 | 5 |
|---|---|---|---|---|---|
| 5 | 1 | 1 | 1 | 1 | 1 |
| 4 | 1 | 1 | 1 | 1 | 2 |
| 3 | 1 | 1 | 1 | 2 | 3 |
| 2 | 1 | 1 | 2 | 3 | 4 |
| 1 | 1 | 2 | 3 | 4 | 5 |

**Step 2 – Exposure level (inhalation only).** Duration class (1–5) × exposure class (1–5) gives an exposure level from 1 to 25. This is done both without and with PPE.

**Step 3 – Exposure category.** The exposure level is grouped into 1–5: 1–2 → 1, 3–6 → 2, 7–12 → 3, 13–19 → 4, 20–25 → 5. For non-inhalation hazards, the exposure class from Step 1 is used directly. The group is multiplied by the **Frequency** class (1–5), giving 1–25.

**Step 4 – Risk.** The exposure category is grouped again into 1–5 using the same bands. The diagram labels the groups as % of max: 0–9%, 10–25%, 26–50%, 51–75%, >75%. The group is multiplied by the **Substance risk** (the inherent health hazard, 1–5), giving a risk value of 1–25. Matrix colours: 1–5 green, 6–10 yellow, 11–19 orange, 20–25 red.

**Step 5 – Risk category.**

| Risk value | Fraction of max | Risk category | Description |
|---|---|---|---|
| 19–25 | 0.75 – 1 | 5 | Measures must be implemented to reduce risk |
| 11–18 | 0.45 – 0.74 | 4 | Measures must be implemented to reduce risk |
| 6–10 | 0.25 – 0.44 | 3 | Measures must be considered |
| 4–5 | 0.16 – 0.24 | 2 | Measures should be considered |
| 1–3 | < 0.15 | 1 | Measures can be considered |

The diagram ends with "Risk Category [excl. PPE] = X" and "Risk Category [incl. PPE] = Y".

## How risk is calculated – safety and environmental hazards

**Step 1 – Classification of amount (1–5).** Based on the amount you entered in Your Usage. The level descriptions come from the system's classification table.

**Step 2 – Amount risk.** Global risk (the inherent safety or environmental level, 1–5) × amount class (1–5) gives 1–25.

**Step 3 – Likelihood including controls.** The likelihood of an accidental event (1–5) is combined with the effect of controls (1–5). This uses the same matrix as health Step 1.

**Step 4 – Risk.** The amount risk is grouped into 1–5: 1–2 → 1, 3–5 → 2, 6–10 → 3, 11–15 → 4, 16 and above → 5. The group is multiplied by the accidental-event class, without and with controls, giving 1–25. Colours are the same as for health.

**Step 5 – Risk category.**

| Risk value | Risk (fraction) | Category | Description |
|---|---|---|---|
| 20–25 | above 0.7 | 5 | Measures must be implemented to reduce risk |
| 12–19 | 0.5 – 0.7 | 4 | Measures must be implemented to reduce risk |
| 7–11 | 0.3 – <0.5 | 3 | Measures must be considered |
| 5–6 | 0.2 – <0.3 | 2 | Measures must be considered |
| 1–4 | below 0.2 | 1 | Measures must be considered |

**Storage risk** per location (**Risk category Safety - Storage** and **Risk category Environment - Storage**) is calculated from the stored amount at that location, the inherent safety/environment level, and the storage likelihoods you enter in the location table.

## Customised 6-level risk matrix

Some accounts are configured with a 6-level risk method instead of the standard 5-level one. The diagram then has four steps:
- The Step 1 matrix is 6×6.
- The duration step multiplies to 1–36.
- Exposure groups are 1–2, 3–8, 9–17, 18–23, 24–32 and 33–36 (0–9% up to >90% of max).
- The result is shown as a letter band instead of a number:

| Exposure category \ Substance risk | 1 | 2 | 3 | 4 | 5 | 6 |
|---|---|---|---|---|---|---|
| 6 | L | H | VH | VH | VH | VH |
| 5 | L | M+ | H | VH | VH | VH |
| 4 | L | M | M+ | H | VH | VH |
| 3 | VL | L | M | M+ | H | VH |
| 2 | VL | VL | L | M | H | H |
| 1 | VL | VL | L | L | M+ | H |

Note shown under the diagram: Level 1 = VL = Very Low, 2 = L = Low, 3 = M = Medium, 4 = M+ = Medium with harmful consequences, 5 = H = High, 6 = VH = Very High. "For example, L on Health Risk means H2 - Health Risk level 2." On these accounts, badges show the letters instead of H/S/E numbers.

## Risk ranking matrix (Probability × Severity)

If enabled for your account, Section 3 shows **Risk ranking**:
- **Probability of Event**: Very Unlikely (1), Unlikely (2), May Happen (4), Likely (6), Very Likely (8), Certain or Imminent (10).
- **Severity of Harm**: Delay (1), Minor Injury (2), Multiple Minor Injuries (4), Major Injury (6), Single Death (8), Multiple Deaths (10). Tooltips explain them, for example "Recordable Incident, Lost Time Injury / Illness or Multiple Minor Injuries".
- **Risk ranking** = Probability × Severity:

| Probability × Severity | Ranking | Colour |
|---|---|---|
| below 4 | VL | Green |
| 4–9 | L | Green |
| 10–19 | M | Yellow |
| 20–39 | M+ | Yellow |
| 40–59 | H | Red |
| 60 and above | VH | Red |

On-screen note: "VL - Very Low, L - Low, M - Medium (with harmful consequences), H - High, VH - Very High … the numbers in the matrix just provide relative risk, which in turn helps set the priority for the implementation and resource allocation."

## Risk levels, labels and colours (quick reference)

| Where | 1 | 2 | 3 | 4 | 5 |
|---|---|---|---|---|---|
| Numeric badges (H/S/E squares and stars) | Green | Green | Yellow | Dark orange | Red |
| Band chips (Risk rating panels) | Low (green) | Medium (yellow) | Medium (yellow) | High (orange) | Extreme (red) |

- An empty badge shows "-".
- A **square** badge means without controls (inherent or before controls). A **star** badge means after controls.
- Letter bands (6-level accounts and risk ranking): VL bright green, L green, M yellow, M+ orange, H red, VH dark red.

## AI Suggest (AI-generated hazard evaluation)

When **AI functions on risk assessment** is enabled (the default), on a **Draft** or **Revision draft**:
1. Fill in Your Usage. The **AI Suggest** button stays disabled until **Used for**, **Duration**, **Frequency**, **Substance form**, **Amount** (with unit) and **Persons at risk** are all set. Hover over it to see what is missing ("Fill in usage details first").
2. Click **AI Suggest** (it shows "Generating..."). The AI uses the SDS data.
3. The suggestion is applied automatically. It **deletes all existing hazards**, rewrites the Section 2 texts, creates the suggested hazards, adds PPE/controls/emergency controls, and sets the ratings.
4. You see "AI suggestion applied. Review and save." If some steps fail, you see "AI applied with N error(s)."
5. A warning panel appears: "AI-generated — verification required … must be reviewed and verified by a qualified HSE professional before approval."
6. **View raw AI response** shows the AI's raw output.

To switch AI off for the whole organisation, turn off **AI functions on risk assessment** in Settings. Tooltip: "When enabled, users can use AI-powered features on risk assessments: voice input for describing usage and AI-generated hazard suggestions."

## Statuses and approval workflow

| Status (as shown) | Colour | Meaning | Editable? |
|---|---|---|---|
| **Draft** | Amber | New assessment being worked on | Yes |
| **Revision draft** | Amber | A new revision created from an approved assessment | Yes |
| **Approved** | Green | Approved and in force | No (read-only) |
| **Replaced by newer version** | Green | An earlier approved version superseded by a newer one | No (read-only) |
| **Archived** | Red outline | Archived. Hidden by the default list filter. | — |

The typical flow is: Draft → **Approve** → Approved → **Create new revision** → Revision draft → Approve → the new version becomes Approved and the older one shows as Replaced by newer version.

## Approving a risk assessment

The **Approve** button is enabled only when the system confirms the assessment can be approved. Otherwise, hovering shows "Please fill in all required fields:" followed by what is missing:
- **Classification of duration**, **Frequency**, **Amount used**
- "Add hazard or mark substance as not hazardous". You need either at least one hazard, or the not-hazardous box ticked (not both).
- "<Hazard> — incomplete" for any hazard missing its risk category without or with controls.

If nothing specific is listed: "This risk assessment can't be approved".

**One approved risk assessment per SDS.** If the SDS is already covered by another approved assessment, approval is refused with a popup: SDS "<product>" has already linked to an approved Risk assessment: <link>. "Please make sure that 1 SDS is only applied on 1 approved risk assessment".

## Revisions, deleting drafts and archiving

- **Create new revision** (Owner/Admin, on Approved) makes an editable copy and opens it. Save pending edits first.
- **Delete** (bin icon) removes a Draft or Revision draft permanently.
- **Move to archive** (list, Owner/Admin) asks "Confirm to archive risk assessment <product>". Archived assessments can be restored with **Un-archive risk assessment**.
- To see archived ones, add **Archived** in the status filter. Assessments for SDS on archived locations need the checkbox **Also show Risk Evaluation for SDS on archived locations**.

## Linking other SDS to the same risk assessment

Below the hazards, **Other SDS linked to the same risk assessment** lists additional SDS covered by this assessment (**Product Name**, **Supplier**, **Revision date**, **Substance hazard**). Tooltip on the **+** icon: "Add more SDS to this assessment. Use this option when there are multiple SDS for a similar product that can be assessed in the same evaluation. It's commonly employed for assessments of products like Diesel fuel…"

1. Click **+**. The popup is titled **Find other SDS to link to same risk assessment <product>**.
2. Search and click **+** on an SDS ("SDS added successfully").
3. If that SDS already has its own approved assessment, a popup names it instead.

Rows highlighted red have their own risk assessment. Click the warning icon for details, or use **Remove** to unlink.

When the chemical instruction is opened for a linked SDS, it shows **Linked SDS** with "The risk assessment details below describe the main SDS, not this linked SDS."

## When a newer SDS version arrives

When you move an SDS to its newer version and it has approved risk assessments, the dialog says "This SDS has an approved risk assessment" (or "…{count} approved risk assessments"). It continues: "The new SDS version may contain updated hazard data. Choose how to handle the risk assessment:"
- **Create draft (recommended)** (the default)
- **Copy as approved**. If the new version already has one, the label is **Copy as approved (Replaced existed approved version)**.
- **Don't copy**

If job procedures (COSHH assessments in the UK) use the old assessment, the dialog lists them ("{count} … use this risk assessment") with checkboxes, all ticked by default. It explains: "Transfer them to the new risk assessment so their reports show the new SDS version's hazard data. Any you leave unchecked keep using the old version." Afterwards: "Transferred {count} … to the new risk assessment", or "Some … could not be transferred to the new risk assessment. Please check their reports." This choice is hidden when you pick **Don't copy**.

## Chemical instruction & risk assessment document (view and print)

**Chemical instruction & risk assessment** is the readable output of an assessment: substance information, hazard pictograms, highest Health/Safety/Environment risk with and without controls, PPE/controls and the hazards with their controls. It also shows **Approved Date** or "Not approved".

Open it from the list's **Action** column or from an SDS's **Open chemical instruction**.

**Printing:**
1. Click the printer icon.
2. In the print preview, drag sections to reorder them ("Drag and drop to rearrange sections"). Keyboard move up/down also works. The sections are **General Information**, **Risk categories and PPE Controls**, **Detailed information** and **Hazards and controls**.
3. **Settings** opens **Section Settings**. For each section, choose **Show section** and a **Font scale** from 0.5x to 2x.
4. **Reset** restores defaults. **Print** prints. On mobile a separate print window opens ("Preparing print preview, please wait...").

The printout carries your company logo if one is set, "SDS Manager - Inventory Management", and the **Printed date**.

## Importing legacy risk assessments (selected accounts only)

If enabled for your account, **Import legacy risk assessments** lets you upload old risk assessment PDFs. The on-screen description: "Each file is read automatically, matched to an SDS in your library, and turned into a draft risk assessment for you to review and approve. The original file is attached to the matched SDS."

Results per file: **Imported - open draft**, **No matching SDS found** (choose one with **Select SDS**), **Risk assessment already exists**, **Failed**, or **Could not read file**. **Previous imports** lists earlier runs.

## Editing inherent risk ratings and disposal on an SDS

On an SDS's detail view, Owner and Admin users see a pencil (**Edit risk ratings**) on the risk rating table. It opens **Edit inherent risk rating** with:
- **Health risk rating** (H)
- **Health risk (handling)** (H*): health risk excluding oral/ingestion hazards
- **Safety risk rating** (S)
- **Environmental risk rating** (E), each 1–5 with the level labels
- **Disposal**: D1 Normal disposal, D2 Special disposal required, D3 Environmentally hazardous, D5 Hazardous waste

Only changed values are saved.

**How inherent ratings are derived.** Ratings come from the SDS's H-codes. Tooltips show which codes contributed, for example "H331 (level 4)". Examples of the mapping:

| Rating | Example codes |
|---|---|
| Health 5 | H300, H310, H330, H334, H340, H350, H360, H370 |
| Health 4 | H301, H311, H317, H331, H341, H351, H361, H362, H371–H373 |
| Health 3 | H302, H304, H312, H318, H332 |
| Health 2 | H315, H319, H335, H336 |
| Safety 5 | H200–H205, H240, H241, H290 |
| Safety 4 | H220, H222, H224, H229, H242, H250, H260, H270–H272, H280, H281 |
| Safety 3 | H221, H223, H225, H228, H251, H252, H261 |
| Safety 2 | H226, H227 |
| Environment 5 | H410, H420 |
| Environment 4 | H400, H411 |
| Environment 3 | H412, H413 |

The handling health risk (H*) excludes oral codes H300–H305.

## Risk Analysis in Settings (re-analyse all SDS)

The account Owner (and users SDS Manager treats as account administrators) have a **Risk Analysis** section in **Settings**:
- **Update Risk & Safety Data**: "Re-analyses all SDS in your library to update risk ratings, suggested PPE, safety controls, and disposal classification." It shows "Updating..." while running. Afterwards you see either "Risk data updated for {count} products:" with a table (**Product Name**, **Field**, **Old**, **New**, **Reason**), or "Everything is up to date — no risk ratings were changed."
- **Risk Analysis History** (**View History**): "See which products had risk ratings or safety data updated in the last analysis run." The summary reads "Total: {total}, SDS with PPE suggestions: {flagged}". Use **Show Changes Only** or **Show All Computed** to switch views.
- **Disposal Classification** (**View Disposal Overview**): category counts. Click a category to list its products with **Triggered by** codes.

A separate internal text-analysis test tool exists only on SDS Manager's internal test sites.

## PPE Approval (PPE Suggestions Review)

**What it is.** SDS Manager analyses each SDS's hazard statements, precautionary codes and text, and suggests PPE icons and safety control (prohibition) signs. "Review and approve PPE icons suggested by the text risk analysis. Approved icons will be shown to users on the SDS detail page."

**Advisory** (always shown): the suggestions are automatically derived and "not infallible … should be treated as guidance only. A qualified person … must verify the appropriate PPE and safety controls … Approved selections on this page do not replace a formal risk assessment."

**How it works:**
1. When you open the page, the app first analyses your inventory ("Analysing substances for PPE requirements…"). This usually takes seconds. The result is reused until you reload the page or sign out. "Last updated: … ago" shows its age, and the refresh button re-runs it.
2. Counters: **{count} pending**, **{count} reviewed**, **{count} total with suggestions**, and **{count} analyzed**. Hint for analyzed: "Counts every copy of an SDS, so it is not the sum of the chips to the left."
3. Filters: location filter, **Search product name...**, and a status selector (**Pending only** by default, **Reviewed**, **All**).
4. Review each row:

| Column | Meaning |
|---|---|
| Checkbox | Select for bulk actions |
| **Product name** | Click to open the SDS details |
| **Signal word** | Danger in red, Warning in orange |
| **Risk ratings** | H* (Health handling, "Excludes oral / ingestion hazards"), H, S, E. Tooltips list the contributing H-codes. "Based on pictograms / signal word" appears when no codes apply. |
| **Already has PPE** (from extraction) | PPE already read from the SDS (read-only) |
| **Suggested new PPE** | "click icons to approve / hover for trigger". Each icon is a toggle. Hovering shows what triggered it (e.g. Found: "…"). |
| **Suggested controls** | **ISO prohibition signs**, toggled the same way |
| **Status** | **Pending** or **Reviewed** |
| **Actions** | **Accept all** or **Reject all** for the row |

5. Bulk: select rows, then **Accept all for selected**, **Reject all for selected** or **Clear selection** ("{count} selected").
6. **Show details about data behind the detection** opens a table per product: Signal Word, Pictograms, H-codes (extracted), Additional H-codes (text inferred), PPE (extracted), PPE (derived), PPE (new), Changes.

When nothing is left: "All done!" and "No PPE suggestions to review for the current filter." Pagination: "Showing {from}–{to} of {total}", **← Previous**, **Next →**.

## PPE and safety sign icon library

The icons used for PPE and controls cover these groups:
- Personal protective equipment, such as gloves, eye/face protection and respirators
- **Controls** (instruction signs): chemical cabinet, chemical safe, communication, barrier cream, dispose safely, keep locked away, read instructions, ventilation and ventilation system
- **Prohibition signs**: do not eat or drink, do not leave waste, do not pour in drain, do not touch, keep away from children, no open flame, no pedestrians, no smoking, not drinking water
- **Emergency/first-aid signs**: give oxygen, irrigate eyes, get medical advice or attention, remove from exposure, remove victim, rinse mouth, rinse with water, spill kit
- **Fire signs**: activate alarm, call fire department, fire equipment, fire extinguisher

## Disposal Classification

**What it is.** "Chemical disposal categories based on environmental hazard codes and SDS disposal instructions."

**Categories:**

| Category | Badge | Rule shown on screen |
|---|---|---|
| **Hazardous Waste** | D5 (red) | "Contains highly toxic environmental H-codes (H400, H410, H420). Requires certified hazardous waste disposal." EUH059 also triggers this category. |
| **Environmentally Hazardous** | D3 (orange) | "Contains lower-severity aquatic toxicity H-codes (H401–H413). Requires environmentally safe disposal." |
| **Special Disposal** | D2 (yellow) | "SDS contains P501/P502/P503 disposal instructions. Follow the instructions on the SDS." |
| **Normal Disposal** | D1 (green) | "No special disposal requirements identified. Can be disposed of via normal waste stream." |
| **Not yet computed** | grey | "Substances missing the data needed to classify disposal — typically no H-codes or no parseable disposal section in the SDS. Review each row and set the category manually." Shown only if any exist. |

Health hazard codes do not affect disposal; only environmental codes and the SDS disposal instructions do.

**Using the page:**
1. On opening, the app analyses substances ("Analysing substances... This may take a moment. The page will update automatically when done."). "Last updated: … ago" and refresh behave as on PPE Approval.
2. Filter by location. The advisory notice says the categories are "guidance only" and you must verify disposal before acting.
3. Click a count card or expand a category to list products. Each row shows **Product Name**, **Triggering codes** (hover for the code text), and the **SDS Section 13 — Disposal** text. Use **Load more** for more rows ("Showing {shown} of {total}").
4. **Override** a category: click the pencil (**Override category**) and choose another category under **Select category...**. Overridden rows get an **Overridden** chip with the tooltip "Manually set by {user} on {date}. Algorithm suggested: {category}". **Revert to computed ({category})** undoes the override.
5. **Export to CSV** downloads the classification for the current location filter.

Disposal badges (D1–D5) also appear in the SDS library columns and on SDS details. A **Disposal categories** panel appears on the dashboard (see Dashboard).

## Use & disposal report

**Reports** → **Use & disposal** opens "Report for product use and disposal". It lists amounts per product for a period.

**Filters:** Locations, Substance environmental hazard (1 Not Dangerous to 5 Extremely Dangerous), Start date and End date, **Group by substance**, custom fields, and Substances. Click **Apply** to run the report.

**Columns:** Location, Product Name, Supplier Name, Measurement scale, Amount stored start of period, Amount stored end of period, Amount used, Amount disposed of period, Substance environmental hazard, plus sums.

**Excel Report** exports the result.

## Substitutions (replacing or eliminating hazardous products)

**What it is.** A register of substitution cases. Each case records the product to be replaced at a location, the approved alternative (or elimination), the responsible person, a deadline and a status.

**List page (Substitutions):**
- **Create new substitution** button.
- **Search** box.
- Filter buttons: **Show assigned to me**, **Show created by me**, **Show All** (default). On mobile these are a dropdown.
- Columns: **Substituted product**, **Location**, **Approved alternative**, **Responsible**, **Status**, **To be completed within**.
- Click a row to open **Edit substitution**.

**Creating a substitution:**
1. Click **Create new substitution**, or on an SDS choose **Evaluate Substitution** from its actions menu. If the SDS is on several locations, you pick the location first. If that location already has a substitution, it opens instead.
2. **Substituted product**: pick the product on a location (search non-archived products; the popup is titled **Select substituted product**).
3. **Select substitution type**: **Eliminate** (remove the product) or **Substitution** (replace it). For Substitution you can tick **No substituted product** if no alternative is chosen yet. Otherwise choose the **Approved alternative** (**Select product for substitution**).
4. **Information**:
   - **Archive SDS being substituted**, ticked by default. For an alternative, the tooltip reads "…automatically archive the substituted product's SDS after an approved alternative is specified and the status is set to "Assessment completed"". For Eliminate, the tooltip says the SDS is archived "once the product is marked as eliminated and the status is set to "Assessment completed"".
   - **Status**: **In Progress**, **Consult**, **Assessment completed**.
   - **Responsible** (a user).
   - **To be completed within** (date).
   - **Comment**.
5. Click **Save** ("Substitution created successfully").

All of these are required: substituted product, alternative (unless Eliminate or No substituted product), responsible user, date and status.

**Editing:** the **Edit substitution** dialog has two tabs.
- **Details**: the products are read-only. You can change Archive SDS being substituted, Status, Responsible, date and Comment. Once the status is **Assessment completed**, the other statuses can no longer be selected.
- **Change log**: Date, User and Changes for each event ("Created the substitution", "Edited the substitution", "Deleted the substitution"), with the field values before and after. If empty: "No changes recorded yet."

## Rules, limits and edge cases

- **One approved assessment per SDS.** An SDS can be covered by only one approved risk assessment. Unlink or archive before approving or creating another.
- Approved and Replaced-by-newer-version assessments are read-only. Use **Create new revision** to change them.
- Hazard ratings cannot be set until Duration and Frequency are set. Safety and environmental categories also need an Amount. The "effect of controls" rating needs at least one PPE/control (for Environment, emergency controls also count).
- Ticking "not hazardous" requires zero hazards. With it ticked, no hazards can be added.
- **AI Suggest replaces all existing hazards** on the draft. It is only available on drafts.
- Voice input and AI Suggest disappear when **AI functions on risk assessment** is off.
- PPE Approval and Disposal analysis results are reused until you reload the page or sign out. Use the refresh button to re-run.
- Disposal and PPE suggestions are automatic and advisory. Always verify against the SDS.
- Exact plan contents and limits (e.g. number of assessments) are enforced by SDS Manager's servers and are not listed in the app. Confirm with SDS Manager support or sales.
- Banners such as "Staging Environment" or "Development Environment" appear only on SDS Manager's internal test sites, never in the live product.

## Messages and errors users may see

| Message | Meaning / what to do |
|---|---|
| Only users with the role "Admin with approval" can approve | You are Admin, not Admin with approval, on the SDS's locations. Ask the Owner to grant that role. |
| Please fill in all required fields: … | Complete the listed usage fields or hazards before approving |
| This risk assessment can't be approved | The system refused approval. Check that hazards are complete or contact support. |
| SDS "…" has already linked to an approved Risk assessment … / You have to unlink it before creating a new one. / Please make sure that 1 SDS is only applied on 1 approved risk assessment | The SDS is already covered. Open the linked assessment, or unlink/archive it first. |
| You have unsaved changes, please save | Wait for the auto-save to finish, then try again |
| Please fill in Duration, Frequency, and Amount in the 'Your Usage' section before setting risk parameters. | Fill in Section 1 first |
| Before you can define this parameter, set the Classification of duration and Frequency of use first. | Inhalation needs Duration and Frequency |
| Set the Amount in 'Your Usage' to enable risk category calculation for safety and environmental hazards. | Enter Amount used with a unit |
| You must add Personal Protective Equipment or Controls before you can set the effect of the equipment | Add PPE/controls to the hazard first |
| You must add Personal Protective Equipment, Controls or Emergency Controls before you can set the effect of the equipment | Same, for Environment |
| All hazards must be deleted before this option can be checked | Remove hazards before marking the product not hazardous |
| Cannot add hazards to a non hazardous product | Untick the not-hazardous box first |
| Comment can't be empty / Please choose PPE | Fill both in the add-PPE dialog |
| Failed to load risk assessment. Please try again. | Reload. If it persists, contact support. |
| AI suggestion failed. Please try again. / AI applied with N error(s). | Retry, or review and fix the hazards manually |
| Microphone access denied… / No microphone was found… / Your microphone is in use or unavailable… / Voice recording requires a secure (HTTPS) connection… / Voice recording is not supported in this browser. / No audio was recorded. / Could not extract any fields from the transcript… | Fix the microphone or browser and retry, or type the fields instead |
| Could not load suggestions / The server could not be reached… | PPE Approval could not load. Click **Retry**. |
| Failed to save PPE approval / Failed to save controls approval | Your click was not saved. Try again. |
| Failed to load substances / Failed to load disposal statistics / Failed to save override / Export failed | Retry. If it persists, contact support. |
| No disposal classifications found. Make sure substances have been analysed. | Wait for the analysis, or run **Update Risk & Safety Data** in Settings |
| Substituted product is required / Substance for substitution is required / Responsible user is required / To be completed within is required / Status is required | Complete the substitution form |
| This feature is not available on your current subscription plan. | Your plan does not include this module. Upgrade or contact sales. |

## Frequently asked questions

Q: How does SDS Manager calculate chemical risk?
A: Each hazard combines the inherent hazard level (1–5), your exposure or likelihood (1–5), the effect of your PPE/controls, and for health hazards the frequency of use (plus duration for inhalation). For safety and environmental hazards it also uses the amount. The result is a risk value from 1 to 25, mapped to a risk category from 1 to 5, both without and with controls. Click **Show risk calculation method diagram** on any hazard to see each step with your values.

Q: What is the difference between "Risk rating" and "Risk rating after controls"?
A: **Risk rating** (square badges) is the highest risk category for Health, Safety and Environment without controls. **Risk rating after controls** (star badges) is the same after your PPE and controls are applied. A chip like "H4→2" means health risk 4 without controls and 2 with controls.

Q: What do the colours mean?
A: On numeric badges, 1–2 are green, 3 yellow, 4 dark orange and 5 red. On band chips, 1 = Low (green), 2–3 = Medium (yellow), 4 = High (orange), 5 = Extreme (red). Accounts on the 6-level matrix see letter bands from VL (very low) to VH (very high).

Q: Who can approve a risk assessment?
A: The account Owner, or a user with the location role **Admin with approval** on a location where the SDS is used. A regular Admin sees the Approve button greyed out. All required fields must be complete and every hazard must have its risk categories calculated.

Q: Why is the Approve button greyed out?
A: Hover over it. Either you lack the Admin with approval role, or the tooltip lists what is missing: duration, frequency, amount used, at least one hazard (or the not-hazardous box), or an incomplete hazard.

Q: Can I edit an approved risk assessment?
A: No, approved assessments are locked. An Owner or Admin can click **Create new revision** to make an editable **Revision draft**. Approving it makes it the current version, and the older one is shown as Replaced by newer version.

Q: Can one SDS have several risk assessments?
A: Only one approved risk assessment can cover an SDS. You can link several similar SDS (for example diesel from different suppliers) to one assessment using **Other SDS linked to the same risk assessment**. For different storage conditions per location, the location table's **Ignore** option lets you assess locations separately.

Q: What does AI Suggest do, and is it safe to rely on?
A: It reads the SDS and your usage details, then fills in hazards, PPE/controls and ratings on a draft. It replaces any hazards already there. The output is marked "AI-generated — verification required" and must be checked by a qualified HSE professional before approval. Admins can switch AI off under **Settings → AI functions on risk assessment**.

Q: Why can't I see the AI Suggest or microphone button?
A: They appear only on editable drafts and only if AI functions are enabled for your organisation. AI Suggest also stays disabled until Used for, Duration, Frequency, Substance form, Amount and Persons at risk are filled in.

Q: How do I print the chemical instruction and risk assessment?
A: Open it from the list's document icon (or **Open chemical instruction** on the SDS) and click the printer icon. In the preview you can drag the four sections into any order, hide sections or change font size under **Settings**, then click **Print**.

Q: What happens to my risk assessment when the SDS is updated to a newer version?
A: The update dialog asks whether to **Create draft (recommended)**, **Copy as approved**, or **Don't copy**. You can also transfer the job procedures (COSHH assessments) that use the old assessment to the new one, so their reports show the new hazard data.

Q: What is the PPE Approval page for?
A: SDS Manager automatically suggests extra PPE icons and prohibition signs from each SDS's hazard codes and text. On **PPE Approval** an Owner or Admin accepts or rejects them per product or in bulk. Approved icons are shown on the SDS detail page. Suggestions are guidance only and do not replace a risk assessment.

Q: How are chemicals classified for disposal?
A: Products with H400, H410 or H420 (or EUH059) are Hazardous Waste (D5). Lower aquatic toxicity codes H401–H413 make them Environmentally Hazardous (D3). SDS with disposal instructions P501–P503 are Special Disposal (D2). Everything else is Normal Disposal (D1). Products without enough data appear as "Not yet computed" for manual classification.

Q: Can I change a disposal category the system chose?
A: Yes. On **Disposal Classification**, an Owner or Admin clicks the pencil on a product and picks another category. The row shows **Overridden**, with who changed it and what the algorithm suggested, and you can **Revert to computed** at any time.

Q: How do I refresh risk ratings after many SDS were updated?
A: The account Owner can go to **Settings → Risk Analysis** and click **Update Risk & Safety Data**. This re-analyses all SDS for risk ratings, suggested PPE, safety controls and disposal. **View History** shows what changed in the last run.

Q: How do I track replacing a hazardous chemical with a safer one?
A: Use **Substitutions** → **Create new substitution**, or **Evaluate Substitution** on the SDS. Choose the product and location, then Eliminate or Substitution with an approved alternative. Set a responsible person, deadline and status. When the status becomes **Assessment completed**, the old SDS can be archived automatically if **Archive SDS being substituted** is ticked.

Q: Why can't I find Substitutions in my menu?
A: Substitutions is in the main sidebar on Enterprise and in the **More** menu on Premium and Pro. It is not available on Free or Basic, and your role must include the substitution permission.

Q: What is the Risk ranking (probability × severity) box?
A: It is an optional matrix enabled per account. You choose a Probability of Event and a Severity of Harm (each 1–10), and their product gives VL, L, M, M+, H or VH. There is no switch for it in Settings; contact SDS Manager to enable it.

Q: What does "Ignore" mean in the locations table of a risk assessment?
A: It excludes that location from this assessment. The UI says it is used to "create separate assessments for different locations e.g. due to different storage conditions".

Q: Do I need a storage risk evaluation?
A: The app's guidance is to evaluate storage risk if you store large quantities of a chemical with safety or environmental risks. For small amounts it is normally not required. Storage risk is set per location in the locations table.

## Related topics

- **Job procedures (job hazard analysis, COSHH assessments, 7-point risk assessments) and chemical work instructions** — activity-level assessments that use approved risk assessments
- **Exposure register, reports (incl. Tier II) and Danish APB** — exposure registration and measurement; Use & disposal report
- **SDS library: substances list, SDS details, stock, archive and export** — risk assessment status column, SDS actions menu, PPE icons, GHS classification report
- **Glossary, GHS hazard reference data and accessibility in SDS Manager** — inherent risk ratings (H/S/E) and disposal rating
- **Login & Account Security, Users, Roles & Permissions, and Organization Settings** — roles (Owner, Admin, Admin with approval, Admin Light, Staff, Read only, No Access); Settings: AI functions on risk assessment, Risk Analysis
- **Plans, Free Trial, Sign-up, Billing and Subscription** — subscription plans and upgrades
- **SDS Manager: product overview, navigation, Dashboard and getting started** — Dashboard (Disposal categories panel)
