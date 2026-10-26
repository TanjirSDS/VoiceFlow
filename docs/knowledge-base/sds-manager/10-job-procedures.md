# Job procedures (job hazard analysis, COSHH assessments, 7-point risk assessments) and chemical work instructions

> Summary: A **Job procedure** in SDS Manager is a task-level risk assessment (a Job Hazard Analysis) that describes one work activity: the steps, the SDSs and chemicals used, chemical and non-chemical hazards, PPE and controls, where the work happens, who does it, and the residual risk after controls. It is sometimes also called a "work procedure"; on screen it is called **Job procedure**. UK customers see it as a **COSHH assessment** and Danish customers as a **Risk assessment** / **7-point risk assessment**. Safety managers and admins create, rate, approve and revise job procedures, then print them as a full report. Employees assigned to a job procedure see it under **My job procedures** and confirm electronically that they have read it, so the company can prove that workers were instructed.

## Where to find it

| What | Where (menu / page) | URL path | Who sees it |
|---|---|---|---|
| List of all job procedures | Sidebar **Job procedures** (UK: **COSHH assessments**, Denmark: **7-point risk assessment**) | /work-procedures | Users whose role and plan allow job procedures (see "Plan and permission requirements"). It is always hidden for the **Read only** and **No Access** roles. |
| A single job procedure (edit view) | Click a row in the list, or the pencil (**Edit**) icon | /work-procedures/<id> or /work-procedures/<id>/revision/<revision id> | Same as the list |
| Printable report / assessment pack | Eye (**View**) icon in the list, or a row in **My job procedures** | /work-procedures/<id>/report | Signed-in users assigned to the procedure, and admins who manage job procedures (SDS Manager checks access) |
| Chemical job instruction summary | SDS action menu **Open chemical job instruction** | /work-procedures/<id>/summary | Users with job procedure access (the SDS menu item also needs risk assessment access) |
| Employee's own list | Sidebar **My job procedures** (UK: **My COSHH assessments**, Denmark: **My 7-point risk assessments**) | /my-work-procedures | Assigned users on Pro or Enterprise plans |
| Per-SDS chemical instruction | SDS action menu **Open chemical instruction**, or **Open chemical instructions** on the summary page | (opened from the SDS) | See the chemical instruction section |

The sidebar shows a tooltip for **Job procedures**: "In SDS Manager, you can create Job Hazard Analysis (Job procedure) according to OSHA REACH and COSHH. A Job Hazard Analysis is typically used to describe a work procedure involving chemicals, but it is also possible to create work procedures that do not include any chemicals and only use non-substance-related hazards, e.g. Electrical hazards. Employees can be assigned to the Job Hazard Analysis and can be asked to electronically confirm that they have read and understood the assigned Job Hazard Analysis."

Where the menu entry appears depends on the plan and on the number of SDSs in the library:
- **Pro** and **Enterprise** customers with 5 or more SDSs see **Job procedures** directly in the main sidebar.
- **Pro** and **Enterprise** customers with fewer than 5 SDSs, and **Premium** customers, find it under **More** in the sidebar.

The dashboard can also show two job procedure tiles: **My job procedures** (a count, with a **Show my procedures** button) and **Approved Job procedures** (approved/total, with a percentage; users with risk assessment access also get a **Review** button that opens the list).

## Plan and permission requirements

Plans (what the application shows):
- The **Job procedures** menu entry is only built for the **Pro**, **Enterprise** and **Premium** plans. **Pro** and **Enterprise** customers with 5 or more SDSs see it in the main sidebar; **Premium** customers, and **Pro**/**Enterprise** customers with fewer than 5 SDSs, see it under **More**. It is not offered in the menu on the **Free** or **Basic** plans.
- Whether a plan can actually *use* job procedures is decided by SDS Manager's server through feature permissions. If the plan does not include the feature, clicking the menu item can show a "feature not available" upgrade message instead of opening the page. The exact plan matrix (for example, whether Premium includes full job procedure use, or what free trials include) is not specified in the application; confirm with SDS Manager support/sales.
- **My job procedures** appears only for **Pro** and **Enterprise** customers. The user must also have been given access to that page by SDS Manager. QR-code login users can open it when the company's plan allows it.
- The **Exposure** tab inside a job procedure only works on the **Enterprise** plan. On other plans, clicking it shows the "feature not available" message.

Roles (what the application shows):

| Action | Who can do it |
|---|---|
| See the **Job procedures** menu and list | Any role except **Read only** and **No Access**, provided the account has the job-procedure permission. SDS Manager sets that permission from the role and plan. |
| Create a job procedure (the **Add Job hazard Analysis** / **Create COSHH assessment** / **Create risk assessment** button) | Only users with the company role **Owner** or **Admin** |
| Archive / un-archive from the list (desktop) | **Owner** or **Admin** |
| Approve a revision | See "Approval workflow". In short: the **Owner**, or a user with **Admin with approval** on a linked location. If no location is linked, the company **Owner** or **Admin**. |
| Change the company-wide review interval | **Owner** only |
| View the report of a job procedure | Users assigned to it, and admins. Unassigned users get "You do not have access to this Job procedure. Ask your manager to assign you to it." |
| See the list of assigned users on the on-screen report | **Owner** and **Admin** only. The printed copy never shows names. |
| Confirm reading | Any user assigned to the job procedure |

SDS Manager enforces these permissions. The rules in this table describe what the screens show or hide.

## What a job procedure is (and how it differs from an SDS risk assessment)

SDS Manager has two levels of chemical risk documentation:
- **SDS risk assessment (also called Risk Evaluation)**: substance-level. One per SDS, reusable across every job that uses the chemical. It records the inherent hazards, recommended controls and PPE for that product. This is covered in the topic **Chemical risk assessment, PPE approval, disposal classification and substitution**.
- **Job procedure**: activity-level. One per job or task. It combines the relevant SDSs (and their risk assessments) with the work itself: job steps, the people exposed, frequency and duration, the actual controls in place, non-chemical hazards, training and emergency response. It produces the residual risk after controls.

In-app guidance puts it this way: "Build your Risk Evaluations once per substance. Create a COSHH Assessment for each job that uses those substances. The COSHH Assessment automatically pulls hazard data and control suggestions from the linked Risk Evaluations, so you do not duplicate work."

A job procedure can also be created with no chemicals at all and only non-substance hazards (for example Electrical, Fall hazards or Confined space).

## Country-specific names and compliance guides

The same feature is labelled differently depending on the customer's country:

| Customer country | List / menu name | Single item | Create button | Report title | My list |
|---|---|---|---|---|---|
| Most countries | **Job procedures** | **Job procedure** | **Add Job hazard Analysis** | **Job hazard analysis report** | **My job procedures** |
| United Kingdom | **COSHH assessments** | **COSHH assessment** | **Create COSHH assessment** | **COSHH risk assessment** | **My COSHH assessments** |
| Denmark | **7-point risk assessment** (menu); **Risk assessments** (page) | **Risk assessment** | **Create risk assessment** | **7-point risk assessment** | **My 7-point risk assessments** |

Other Denmark-specific differences:
- The tab is named **Risk Assessment (7-point)**. Its sections are numbered 3 to 8, following the Danish AT-vejledning C.0.1 seven-point structure. Points 1 and 2 (chemicals and hazardous properties) are covered by the linked SDSs and the hazards tab.
- On the report, the job steps, hazards and controls narratives are placed inside the matching numbered sections instead of a shared three-column panel.

UK-specific differences: the compliance section is named **COSHH compliance** and its questions refer to COSHH Regulations 7, 10 and 11.

**Compliance guide panels.** Customers in the **UK**, **Denmark** and **Australia** see an expandable legal guide:
- At the top of the job procedure list: "COSHH Assessment compliance — UK", "Chemical risk assessment — Denmark (AT-vejledning C.0.1)" or "WHS chemical risk-assessment compliance — Australia".
- At the top of the on-screen report: "How this report meets COSHH — UK", "How this report meets AT-vejledning C.0.1" or "How this report meets WHS Reg 358 — Australia". This panel shows a short intro paragraph with a **Read more** link and is hidden on print.

The guides explain how the feature maps to:
- UK: COSHH Regulations 6–13.
- Denmark: the 7 points of AT-vejledning C.0.1, including a note on APB, which was repealed in 2019.
- Australia: Model WHS Regulations 36, 38, 344/346, 354, 358, 359, 368–378 and GHS Rev 7.

Each guide ends with a disclaimer that it is a reference summary only. Customers in other countries do not see these panels.

## The Job procedures list page

The page lists job procedure revisions in a table. Each row is one revision of a job procedure.

Controls above the table:
- The create button (**Add Job hazard Analysis** / **Create COSHH assessment** / **Create risk assessment**). Owner and Admin only.
- Filters: **All Locations**, **All Substances**, **All Authors**, **All Statuses**. Each is a multi-select. The status filter defaults to **Approved**, **Draft** and **Revision draft**, so **Archived** and **Replaced by newer version** rows are hidden until you select them. On phones, a single **Filter** button opens the same filters in a dialog.

Table columns:

| Column | What it shows |
|---|---|
| **Job procedure** (UK: **COSHH assessment**; DK: **Risk assessment**) | Name of the job procedure |
| **Locations** | Locations where the procedure is performed. The first two are shown, the rest behind **View locations**. |
| **Risk rating** | Highest inherent risk, as H (Health), S (Safety) and E (Environment) values |
| **Risk rating after controls** | Highest H / S / E risk after PPE and controls |
| **Storage risk after controls** | Highest storage risk S / E across the procedure's locations |
| **Actions** | **View** (eye icon, opens the report), **Edit** (pencil, opens the detail page), **Archive** / **Un-archive** (Owner/Admin only) |
| (icon) | An exposure icon (tooltip **Exposure**) when exposures are linked |
| **Document status** | **Draft**, **Revision draft**, **Approved**, **Replaced by newer version** or **Archived** |
| **Created By** | Author |
| **Read receipt** | Number of assigned users who have confirmed reading, out of the total assigned (for example 3/5) |
| **Approved** | Approver name and approval date |

Clicking a row opens the detail (edit) page for that revision. Pagination offers 10, 20, 50 or 100 rows per page. On phones each procedure is a card with **View**, **Edit** and the archive icon.

## Creating a job procedure

Only the company **Owner** or an **Admin** sees the create button.

1. Open **Job procedures** in the sidebar (or under **More**).
2. Click **Add Job hazard Analysis** (UK: **Create COSHH assessment**; Denmark: **Create risk assessment**).
3. The **Add new Job procedure** dialog opens. Fill in:
   - **Name**: required, up to 255 characters.
   - **Frequency**: required. Choose from **Annually**, **Bi-annually**, **Monthly**, **Weekly**, **Daily**, **Constant or hourly**.
   - **Description**: required, up to 1000 characters.
4. Click **Create**.
5. SDS Manager opens the new job procedure's detail page on its first revision. Its status is **Draft**.

Validation messages: "Job procedure name required", "Description is required", "Frequency can't be empty".

Next steps after creating:
1. On the **General** tab, set the duration and fill in the job steps, hazards and controls descriptions.
2. On **Locations & Users**, add the locations and the employees who perform the job.
3. On **SDS**, link the products used.
4. On **Chemical hazards**, rate the hazards and add PPE and controls.
5. On **Risk Assessment**, fill in the task-level points.
6. Approve the revision.

## The job procedure detail page

The detail page header contains:
- **Back** to the list. The button is labelled with the list name, for example **Job procedures**.
- **Title**: "Job procedure: <name>" (or "COSHH assessment: …" / "Risk assessment: …"). A pencil icon lets you rename it. The name is locked, with no pencil, on an **Approved** or **Replaced by newer version** revision; to change it, create a new revision.
- **Revision selector**: a dropdown of all revisions of this procedure. Hover a revision to see the change description entered when it was approved. Revisions without one show "No change description recorded for this revision." Choosing a revision loads it.
- **Approve** button: shown on **Draft** and **Revision draft** revisions. See "Approval workflow".
- A yellow warning triangle, with the tooltip "Click to see more details", appears next to **Approve** when information is still missing. Clicking it opens a list of the missing items, which SDS Manager works out for you. **Approve** stays disabled until the list is empty.
- **Create new revision** button: shown on **Approved** and **Archived** revisions when no revision draft already exists.

Under the header, a risk summary panel shows four blocks:
- **Risk rating**: inherent H / S / E.
- **Risk rating after controls**: H / S / E.
- **Storage risk**: S / E, the highest value entered on the procedure's locations.
- **PPE/Controls**: up to 8 icons. When there are more, a link icon ("Click to show all PPE/Controls Icons") opens a **PPE/Controls** popup with all of them.

Hovering a rating shows which hazards contribute to it, with the highest one in bold.

The page has these tabs (count badges show how many items each holds):
1. **General**
2. **Locations & Users** (green badge = locations, orange badge = users)
3. **SDS**
4. **Chemical hazards**: contains both chemical hazards and non-substance safety hazards
5. **Risk Assessment** (Denmark: **Risk Assessment (7-point)**)
6. **Exposure** (Enterprise only)
7. **Change log**

**Edit lock.** When the selected revision is **Approved** or **Replaced by newer version**, the procedure's content is read-only:
- Radio buttons and text boxes are disabled.
- The add, delete and edit buttons on the SDS and hazard tabs are hidden.
- The location rows cannot be opened for editing.

A few "event" fields on the Risk Assessment tab stay editable (see that section). To change anything else, click **Create new revision**.

## General tab — frequency, duration and descriptions

The **General** tab holds the basic task information. Every change saves straight away to the selected revision.

- **Frequency of job procedure**: radio buttons **Annually**, **Bi-annually**, **Monthly**, **Weekly**, **Daily**, **Constant or hourly**.
- **Classification of duration**: radio buttons **< 15 min**, **15 min to 2 hours**, **2 hours to 4 hours**, **4 hours to 8 hours**, **Above 8 hours**. SDS Manager can replace these labels with your company's own wording if it has been set up for your account.
- Four free-text boxes, each up to 1000 characters:
  - **Description of Job procedure** (UK: "Description of COSHH assessment"; DK: "Description of Risk assessment")
  - **Description of Job steps**
  - **Description of Hazards**
  - **Description of Controls**

How to save a text box: type, then press **Enter**. Each heading says "(Press enter to save)". Use **Shift+Enter** for a new line inside the text.

## Frequency and duration choices

Frequency (how often the job is done):

| Value | Label |
|---|---|
| 1 | Annually |
| 2 | Bi-annually |
| 3 | Monthly |
| 4 | Weekly |
| 5 | Daily |
| 6 | Constant or hourly |

Duration (how long each time):

| Value | Label |
|---|---|
| 1 | < 15 min |
| 2 | 15 min to 2 hours |
| 3 | 2 hours to 4 hours |
| 4 | 4 hours to 8 hours |
| 5 | Above 8 hours |

Frequency is set when the procedure is created and can be changed on the **General** tab. Both values print in the report header. They are inputs to SDS Manager's risk calculation, which SDS Manager carries out automatically. See the topic **Chemical risk assessment, PPE approval, disposal classification and substitution** for the method.

## Locations & Users tab — locations

The heading **The location where the job procedure is performed** lists the locations linked to the procedure.

Location table columns:
- **Location**
- **Start date**
- **End date**
- **Responsible**
- **Storage risk**: two clickable S and E badges
- A delete (bin) icon

To add a location:
1. Click the **+** icon next to the heading.
2. The **Add Job procedure to location** dialog opens:
   - **Location**: search and pick a location. Required.
   - **Responsible**: a user. Optional.
   - **Start date**: required. Defaults to today.
   - **End date**: optional.
   - **Storage risk — Safety (1-5)** and **Storage risk — Environment (1-5)**: optional. Choose "—" (not assessed) or 1–5: 1 Not Dangerous, 2 Slightly Dangerous, 3 Dangerous, 4 Very Dangerous, 5 Extremely Dangerous.
3. Click **Save**.

Validation messages: "Please select a location", "Please choose start date", "Invalid start date", "Invalid end date", "Start date must be before end date".

To edit a location, click its row. This opens **Edit Job procedure on location**; the location itself cannot be changed. This is not available on approved revisions.

To set the storage risk quickly, click the S or E badge in the row and pick "—" or 1–5. Tooltips explain the two values:
- **Storage risk (Safety)**: "your evaluation of the total safety risk of storing the chemicals with SDSs linked to this procedure on this location".
- **Storage risk (Environment)**: "risk of an environmental event — unintended release of chemicals from the site into the environment".

Storage risk is entered by hand per location; it is not calculated. The **Storage risk** shown in the page header and the list is the highest value entered across the procedure's locations. Locations left at "—" are not counted.

To remove a location, click the bin icon and confirm "Confirm to delete location" with **OK**.

## Locations & Users tab — users and read confirmations

The heading **Users performing the job procedure** lists the assigned employees.

User table columns:
- **Full name**: avatar and name. A **QR login** chip marks QR-code users.
- **Read date**: when the user confirmed reading.
- A delete (bin) icon.

To assign users:
1. Click the **+** icon next to the heading.
2. The **Add user to job procedure** dialog opens. Pick one or more users in **User**. Users already assigned are not offered. QR-poster accounts with QR login switched off are also not offered, because they could never open the procedure.
3. Click **Add**.

Messages after adding:
- If the revision is still **Draft** or **Revision draft**: "User has been added successfully. Email will be sent after Job procedure approval."
- If the revision is already approved: "Email has been sent to <email addresses>".
- For QR users: "QR user added successfully. No email is sent to QR users — they will see this job procedure after logging in with their QR code."

If you get "Please choose user", select at least one user before clicking **Add**.

To remove a user, click the bin icon and confirm "Confirm to delete user" with **OK**.

If you are yourself assigned and have not confirmed yet, a **Confirm I have read the job procedure** button appears under the users table.

## SDS tab — linking SDSs to a job procedure

The **SDS** tab (**SDS in the job procedure**) lists the products used in the job.

**Inherent risk from linked SDSs.** The top of the tab shows the combined inherent H / S / E values and a **Rating source** label:
- **From SDSs**: every linked SDS has its own approved risk assessment, so the procedure's H / S / E ratings are rolled up from each SDS.
- **Procedure-level**: at least one linked SDS is not individually risk-assessed, or a procedure-level hazard is attached. The H / S / E ratings then come from the hazards you rate on the **Chemical hazards** tab. To switch back to the per-SDS rollup, risk-assess every linked SDS.

To add an SDS (not on locked revisions):
1. Type at least 2 characters in "Search SDSs by product or supplier name".
2. Each result shows the product, supplier, a **Risk-assessed** or **Not risk-assessed** badge, and inherent H / S / E values.
3. Click the **+** icon on a result. Clicking the result row itself does nothing.
4. What happens next depends on the SDS:
   - **Risk-assessed SDS**: an **Include risk-assessment info?** dialog asks you to choose:
     - **Full** (the default): brings the substance's risk-assessment text and PPE/controls into this procedure. This covers What is the substance used for?, How should the substance be used?, Storage requirements, How should the substance be disposed of?, Precautions for safe handling, Hazard and precautionary statements, and PPE and controls. It is shown on the procedure view, the report and the PDF, and contributes to the procedure-level rollup.
     - **Basic**: uses only the name, supplier, signal word, GHS pictograms and H / S / E ratings. The risk-assessment text and PPE icons are excluded from the procedure, the report and the PDF. Use this when the procedure's own hazard analysis already covers how the product is used.
     
     Confirm with **Add SDS**.
   - **SDS without a risk assessment**: a warning, **Add SDS without a risk assessment?**, explains that once it is linked, the procedure-level chemical hazards and controls on the Hazards tab become the source of truth for the H / S / E rating, and per-SDS risk values won't apply. You can still risk-assess the SDS later. Click **Add anyway** or **Cancel**.

Each linked SDS row can show:
- **Risk-assessed** / **Not risk-assessed** badge, with a tooltip explaining what that means for the rating.
- Signal word (Danger / Warning).
- **CMR** badge: carcinogenic / mutagenic / reprotoxic. Stricter substitution and surveillance rules apply.
- **Resp. sensitiser** badge: H334. Health surveillance is often required.
- **Skin sensitiser** badge: H317. Dermal-contact controls are required.
- Physical form, for example Liquid.
- **SDS stale** badge with the issue month: the SDS is older than 5 years. Ask the supplier for an updated version.
- GHS pictograms and PPE icons. For **Basic** rows the PPE icons are dimmed because they do not count toward the procedure.
- H / S / E values: risk after controls for risk-assessed SDSs; inherent values derived from hazard statements for raw SDSs.
- A **Full** / **Basic** pill.
- **Open SDS PDF** and **Open SDS details**. Details are only shown when the SDS is in your library.
- A pencil, "Change which info is shown for this SDS", to switch between Full and Basic. Risk-assessed rows only.
- A bin icon to remove the SDS from the procedure.

The CMR and sensitiser badges are derived automatically from the SDS hazard statements. The compliance guides note that these flags make health-surveillance triggers visible.

## How risk feeds into a job procedure

SDS Manager calculates a job procedure's risk ratings automatically. The page displays them; it does not calculate them. The overall flow:
- Every rating uses three axes: **H** = Health, **S** = Safety, **E** = Environment, each on a 1–5 scale.
- **Risk rating** is the inherent (before controls) value. **Risk rating after controls** is the residual value after PPE, controls and emergency controls.
- The source of the H / S / E ratings depends on the linked SDSs (see **Rating source** on the SDS tab):
  - If all linked SDSs have their own risk assessment, the procedure rolls up their values. Only SDSs included as **Full** contribute their details and PPE.
  - If any linked SDS is raw (no risk assessment), or a procedure-level hazard exists, the hazards you rate on the **Chemical hazards** tab drive the rating.
- Non-substance safety hazards add their own ratings and PPE/controls.
- **Storage risk** is not calculated. It is the highest manually entered per-location value.
- On the report, values are shown as coloured bands: 1 = **Low**, 2–3 = **Medium**, 4 = **High**, 5 = **Extreme**. Missing values show as **Not rated** / "N/A", **No hazard** (the SDS is not classified for that axis) or **Not available** (no processed classification data).

The rating scales and the method itself (inherent risk, likelihood/exposure classes, effect of controls, how the categories combine) are explained in the topic **Chemical risk assessment, PPE approval, disposal classification and substitution**.

## Chemical hazards tab — chemical hazards

The **Chemical hazards** tab has two parts. The first is the procedure's own chemical hazard assessment.

To add a chemical hazard (not on locked revisions):
1. Click **Add chemical hazard**.
2. Pick a hazard type. Each type can be added once per revision; types already added disappear from the menu. When all types are used, the button is disabled.

Hazard types and the axis they rate:

| Axis | Hazard types |
|---|---|
| Health (H) | Eyes, Skin, Ingestion/Oral, Inhalation/Respiration, Health hazardous, Corrosive, Toxic, Noise, Radiation, Virus/Bacteria, Bio hazard |
| Safety (S) | Flammable, Explosive, Temperature hazard, Pressurized, Nuclear |
| Environment (E) | Environment |

Each hazard appears as a collapsed card. The banner shows:
- The hazard name.
- An outlined badge with the inherent risk and an angled badge with the risk after controls.
- The PPE/control icons added to the hazard.

The banner turns green once both the inherent risk and the risk after controls have values. Click the banner to expand the card. A bin icon on the banner deletes the hazard immediately, without a confirmation.

Inside an expanded card:
- **Description of Hazard**: free text. Saved when you leave the field.
- Three radio groups. The labels depend on the axis:

| Axis | Group 1 | Group 2 | Group 3 |
|---|---|---|---|
| Health hazards | **Inherent health hazards** (1 No Hazard … 5 Extremely Hazardous/Deadly) | **Inherent likelihood / exposure** | **Controls effect on exposure** |
| Safety / Environment hazards | **Safety risk of hazard** (1 Not Dangerous … 5 Extremely Dangerous) | **Likelihood of accidental event w/o Controls** (1 Very unlikely … 5 Extremely likely) | **Effect of Controls** |

  Group 3 includes an extra option, **No controls needed**. The effect scale runs 1 Very low … 5 Very high. Option labels can come from customer-specific settings.
- **Protection and controls**: chips for the PPE, controls and emergency controls on this hazard, with **+ PPE**, **+ Ctrl** and **+ Emrg** buttons. See "Adding PPE, controls and emergency controls". If nothing is added, it shows "no protection added".

Each radio change saves immediately. SDS Manager then recalculates the hazard's risk category and the risk after controls.

Error messages: "Failed to add hazard", "Failed to remove hazard", "Failed to save hazard". If a save fails, the change is reverted.

## Chemical hazards tab — non-substance safety hazards

The second part of the tab covers hazards that do not come from a chemical.

To add one (not on locked revisions):
1. Click **Add non-substance related safety hazard**.
2. A **Hazards** dialog titled "Non-substance related safety hazards" lists the types not yet added: Unsafe tools equipment, Fall hazards, Entrapment, Mechanical, Slip trip hazards, Obstructions, Animal droppings, Lighting, Electrical, Mold, Sharp objects, Asbestos, Extreme heat cold, Awkward postures or lifting, Working alone, Confined space.
3. Click a type to add it.

Each non-substance hazard block has:
- **Safety risk of hazard** (1 Not Dangerous … 5 Extremely Dangerous)
- **Likelihood of accidental event w/o Controls** (1 Very unlikely … 5 Extremely likely)
- **Effect of Controls**, including **No controls needed**
- **Description of Hazard**: saves automatically shortly after you stop typing
- **Protection and controls** chips with **+ PPE**, **+ Ctrl** and **+ Emrg**

Rule: until at least one PPE item or control (**+ PPE** or **+ Ctrl**) has been added to that hazard, the only **Effect of Controls** option you can choose is **No controls needed**. Emergency controls alone do not count. The message is "You must add Personal Protective Equipment or Controls before you can set effect of the equipment". Add PPE or a control first, then set the effect.

To delete a non-substance hazard, click its bin icon and confirm "Confirm to delete hazard" with **OK**.

## Adding PPE, controls and emergency controls

PPE and controls are attached to individual hazards, both chemical and non-substance. The procedure's **PPE/Controls** strip and the report collect them from all the hazards.

1. On a hazard, click **+ PPE** (personal protective equipment), **+ Ctrl** (controls in place) or **+ Emrg** (emergency controls).
2. A dialog titled **Personal protective equipment**, **Controls in place** or **Emergency Controls in place** opens.
3. Search the list. Items are grouped by category, for example Eyes Protection, Face Protection, Gloves, Body Protection, Foot Protection, Respirators, Hygiene, Avoid, Ventilation, Disposal, Information, Storage, Emergency spillage, Emergency medical, Emergency fire, Other. Each item shows its icon and description.
4. Selecting an item fills **Comment** with the item's standard description. Edit the comment to name the specific equipment, for example a glove type or goggle model.
5. Click **Save**.

Messages: "Please choose PPE" when no item is selected. "Comment can't be empty" when the comment is blank.

To change or remove an item, click its chip. The **Edit PPE** dialog lets you change the comment (**Save**) or remove the item (**Delete**). The custom comment is used as the item's label on the chips and in the report.

**PPE in the risk assessment narrative.** The **Risk Assessment** tab also has a free-text field, "PPE (narrative — icons managed on the hazards tab)". It is a written description only; the icons are managed on the hazards tab.

## Risk Assessment tab (task-level points, compliance checks and review cadence)

This tab holds the narrative parts of a task-level risk assessment. Most customers see the intro "Task-level risk-assessment notes." Danish customers see "Danish 7-point chemical risk assessment (AT-vejledning C.0.1). Points 1 and 2 are covered by the procedure's linked SDSs and hazards tab." and numbered sections.

How saving works:
- Text boxes save on **Enter**. A "Saved" message confirms the save.
- Yes/No answers save on click.
- Dates save when you leave the field.

Sections (the numbers are shown for Denmark only):

| # (DK) | Section | Fields |
|---|---|---|
| 3 | **Exposure** | One text: how, where and when employees may be exposed (routes, quantities, frequency, measured data) |
| 4 | **Substitution** | "Has substitution been considered?" Yes/No, plus "Alternatives evaluated and reasoning" |
| 5 | **Prevention & controls** | "Technical controls (ventilation, enclosure, tools)", "Organizational controls (procedures, signage, restrictions)", "PPE (narrative — icons managed on the hazards tab)" |
| 6 | **Instruction & training** | "Training required before performing this task", "Instruction / training material reference (URL or document)", "Most recent training — who was trained", "Most recent training — date" |
| 7 | **First aid, fire & accidents** | "First aid measures", "Fire-fighting measures", "Accident / spill procedures". The help text points to SDS sections 4, 5 and 6 for chemical-specific detail. |
| 8 | **Compliance checks** (UK: **COSHH compliance**) | Three Yes/No questions, each with notes: "Is exposure adequately controlled?", "Is health surveillance required?", "Is exposure monitoring required?" (UK wording: "Adequate control of exposure (COSHH Reg 7)?", "Health surveillance required (COSHH Reg 11)?", "Exposure monitoring required (COSHH Reg 10)?") |

**Review cadence** (periodic review). The help text says: "Approving a new revision auto-records a review. Use "Mark as reviewed today" for periodic checks where nothing has changed but you have confirmed the assessment is still accurate."
- **Customer review policy (months)**: a company-wide interval, for example 24. Only the company **Owner** can edit it, and the value is limited to 1–120 months. Other users see "Only the customer owner can edit this. Ask your owner to set the company-wide review cadence." Changing it applies to every job procedure.
- **Next review due (effective)**: read-only. It is the date that applies, either the per-procedure override or the customer policy.
- **Last reviewed on**: a date.
- **Periodic review** → **Mark as reviewed today**: opens a dialog asking for an optional note (e.g. "checked, no change needed"). Click **Confirm**. A "Review recorded" message appears.
- **Per-procedure override (optional)**: a date that overrides the customer policy, for example for high-hazard procedures. Leave it blank to inherit the policy.
- **Review history**: a list of past reviews with date, reviewer and note.

Locking on approved revisions:
- Most fields on this tab are locked when the revision is approved.
- These stay editable because they record events, not the specification: "Most recent training — who was trained", "Most recent training — date", **Last reviewed on** and **Mark as reviewed today**.
- The **Per-procedure override** date is locked on approved revisions.

## Exposure tab

The **Exposure** tab links a job procedure to exposure records. It is available on the **Enterprise** plan only; on other plans, clicking the tab shows the "feature not available" message.

- **Add exposures**: link existing exposure records.
- **Create exposure**: create a new exposure record from the procedure.
- A table lists the linked exposures. The tab badge shows how many are linked.

Linked exposures appear in the report pack as **Exposure records**, and the list page shows an exposure icon on the row. How exposures are recorded is covered in the topic **Exposure register, reports (incl. Tier II) and Danish APB**.

## Change log tab

The **Change log** tab is the audit trail of a job procedure:
- Table columns: **When** (date and time), **Who** and **What changed**.
- A refresh icon (**Refresh**) reloads the log.
- Pagination offers 25, 50 or 100 entries; the default is 50.

What is logged:
- Changes to the job procedure, its revisions, non-substance hazards and their PPE, chemical hazards and their PPE, locations, user assignments and linked exposures.
- Actions: added, removed, linked, unlinked, assigned, **confirmed read**, **marked as reviewed** (with note), "SDS linked", "SDS unlinked", "SDS inclusion toggled", "Raw SDS linked", "Raw SDS unlinked", deleted, updated.
- Field changes show the old and new values. Examples: Name, descriptions, Frequency, Status, Comment, Approved by, ratings, Start/End date, Responsible, PPE, all Risk Assessment tab fields, and the customer review interval.

Messages: "No changes have been logged for this Job procedure yet." when the log is empty. "Failed to load the change log. Please try again." when it cannot load.

## Approval workflow

A job procedure is approved one revision at a time.

1. Open the job procedure on a **Draft** or **Revision draft** revision.
2. Complete everything the warning list asks for. If a yellow triangle is shown next to **Approve**, click it to see what is missing. **Approve** is disabled until nothing is missing.
3. Click **Approve**.
4. In the **Describe main changes from previous revision** dialog:
   - Type a description in the comment box. It becomes the hover text for this revision in the revision selector.
   - Tick **Send notifications to users linked to this Job Procedure** if assigned users should be emailed.
   - Click **Approve**.
5. If emails were sent, a message lists them: "Email has been sent to the following recipients: …".
6. The revision becomes **Approved** and is locked for editing.

Who sees an enabled **Approve** button:
- **No location linked**: the company **Owner** or a company **Admin**.
- **One or more locations linked**:
  - The **Owner**, or a user with the **Admin with approval** role on at least one of those locations: enabled.
  - A user who is only **Admin** on a linked location: the button is greyed out with the tooltip 'Only users with the role "Admin with approval" can approve'.
  - Anyone else: no button.

## Document statuses

| Status (on screen) | Meaning | Editable? |
|---|---|---|
| **Draft** | The first version of a new job procedure, not yet approved | Yes |
| **Revision draft** | A new revision being prepared from an approved (or archived) one | Yes |
| **Approved** | Signed off; this is the version employees read and confirm | No (create a new revision to change it) |
| **Replaced by newer version** | An older revision superseded by a newer approved revision | No |
| **Archived** | Taken out of use from the list's archive action | Can be un-archived. A new revision can be created from it. |

In the list, Draft and Revision draft show in amber, Approved and Replaced by newer version in green, and Archived in red. The list's status filter defaults to Approved, Draft and Revision draft.

## Revisions and versioning

- Every job procedure has one or more revisions. The detail page's revision dropdown lets you open any of them. Choosing one loads that revision's data on every tab.
- To change an approved job procedure, open it and click **Create new revision**. SDS Manager creates a **Revision draft** from the selected revision and opens it. Edit it, then approve it with a change description.
- **Create new revision** is only shown on **Approved** or **Archived** revisions, and only when the procedure does not already have a revision draft. Finish or approve the existing draft first.
- The change description typed at approval appears as the hover text on that revision in the dropdown.
- Each revision has its own SDS links, hazards, PPE and Risk Assessment fields. The change log records changes across all revisions.
- **Read confirmations and emails** follow approval. Users added while the revision is a draft are told "Email will be sent after Job procedure approval."

## Archiving and un-archiving

- On the list page, Owners and Admins can click the archive icon on a row. A **Confirm archive** dialog says "Confirm to archive job procedure '<name>'". Click **Confirm** or **Cancel**.
- Archived rows show the status **Archived**. To find them, add **Archived** in the **All Statuses** filter.
- Click the un-archive icon to restore a row. The icon is not offered on an archived row that was a revision draft when the procedure already has another revision draft.
- An archived procedure can be used as the base for a new revision with **Create new revision**.

## The job procedure report (assessment pack) and printing

Open the report with the eye (**View**) icon in the list, or by clicking a row in **My job procedures**. The report shows the revision you clicked.

The title depends on the customer's country: **Job hazard analysis report**, **COSHH risk assessment** (UK) or **7-point risk assessment** (Denmark). The page has a **Back** button and a printer button.

The on-screen report and the printout contain the same "assessment pack", in this order:
1. **Contents**: a table of the parts. On screen, clicking a part scrolls to it. In print it lists **Part**, **Product name** and **Page**.
2. **Assessment**: the job procedure itself:
   - **Header**:
     - Name.
     - **Last revised** date and **Approved by**.
     - A review status pill: "Next review: <date>", "Review due soon — <date>" (within 30 days) or "Review overdue — <date>" (past due). If only a review date exists, it shows "Last reviewed on: <date>".
     - **Locations**, **Frequency** and **Duration**.
     - **Users** (on screen, admins only).
     - **Risk rating after controls** for Health, Safety and Environment, shown as a 5-cell coloured bar with the inherent value and the after-controls value.
     - **Storage risk** (Safety, Environment).
     - **PPE/Controls** icons.
   - **Description of the procedure** and the **Description of Hazards**, **Description of Controls** and **Description of Job steps** narratives. Denmark places these inside the numbered sections.
   - **SDS and chemical hazard details**:
     - SDS cards for each linked SDS. Risk-assessed SDSs included as **Full** show their usage, storage, disposal, handling and hazard/precaution text and PPE with custom labels. **Basic** and raw SDSs show a compact row.
     - Chemical hazards, ordered Health → Safety → Environment, and non-substance safety hazards. Each has its rating badges and PPE.
   - **Risk Assessment tab content**: Exposure, Substitution, Prevention & controls, Instruction & training, First aid/fire/accidents, and Compliance checks. A section that was left empty is not printed. Danish customers get numbered sections 1–7.
   - **Last reviewed by** <name> on <date>.
   - **Storage risk per location**: locations with an entered storage value.
3. **Locations**: start/end date, responsible person and storage risk per location. Only if locations are linked.
4. **PPE & controls**: only if any exist.
5. **Exposure records**: name, exposure date, category, status and users. Only if exposures are linked.
6. **Chemical risk assessment — <product>**: the full per-SDS chemical instruction for each linked risk-assessed SDS. If some could not load, the contents page says "<n> chemical risk assessment(s) could not be loaded and are missing from this document."
7. **SDS index**: one row per SDS with supplier and a QR code labelled **Open SDS**, which opens the public view of the SDS.

While the extra parts load, the screen shows "Loading the rest of the assessment pack…".

To print or save as PDF:
1. Click the printer button. It shows a spinner until the document is ready.
2. Your browser's print dialog opens. Choose a printer, or "Save as PDF" to get a PDF.

Differences in the printed copy:
- Each part starts on a new page, with the contents on page 1.
- Every page has a footer with **Last revised** date, **Approved by** and **Printed date**.
- The printout **never** lists the assigned employees' names.
- The compliance guide panel is not printed.

The application has no separate export button (such as Excel or Word) for job procedures. PDF is created through the browser's print dialog.

**Confirm read on the report.** When the viewer is assigned, has not confirmed yet and the revision is **Approved**, the report shows a **Confirm I have read the job procedure** button.

**Access errors.**
- "You do not have access to this Job procedure. Ask your manager to assign you to it." means the user is not assigned. Ask an admin to add them on the **Locations & Users** tab.
- "This Job procedure could not be opened." means the report failed to load.

In both cases a **Back** button returns the user to the list: **Job procedures** for admins, **My job procedures** for others.

## Chemical job instruction summary

The **Chemical job instruction summary** is a short, printable overview of a job procedure aimed at the workplace.

How to open it: in the SDS library or on a location, open an SDS's action menu and choose **Open chemical job instruction**. This option appears when the SDS is used in at least one job procedure. If it is used in several, a **Select a work procedure** dialog lets you pick one.

Contents:
- **Name**, **Description** and **Approved Date** (or "Not approved").
- The procedure's highest risks **Without controls** and **With controls**, with the PPE icons.
- One card per substance with:
  - **Hazards pictograms**
  - **Hazard statements**
  - **PPE and Controls**
  - **Emergency controls**
  - Two links with QR codes: **Open chemical instructions** (the per-SDS chemical instruction) and **Open SDS**

The printer button prints the summary. The **Back** button returns admins to **Job procedures** and other users to **My job procedures**. The same access errors as on the report apply.

## Chemical instruction (per SDS)

The **Chemical instruction & risk assessment** page is a per-product work instruction built from an SDS's approved risk assessment.

How to open it:
- In the SDS action menu, **Open chemical instruction** appears when the SDS has exactly one approved risk assessment. It needs the location permission to open chemical instructions.
- From **Open chemical instructions** (or its QR code) on the job instruction summary.
- Inside a job procedure report, as the **Chemical risk assessment** parts.

It shows:
- **Product Name** and **Manufacturer Name**.
- Substitution status.
- **Persons at risk** (User of the substance / Employees in general / Public).
- **Substance form**.
- Hazard pictograms.
- Risk categories with and without controls, plus PPE/controls.
- Detailed information: what the substance is used for, how it should be used, storage, transport and disposal requirements, hazard and precautionary statements.
- **Hazards and controls**.
- The **Approved Date**.

If the instruction covers several SDSs for the same product, the linked SDSs are listed as well.

To print it:
1. Click the printer button.
2. In the print preview you can open **Settings** (**Section Settings**). For each of the four sections — **General Information**, **Risk categories and PPE Controls**, **Detailed information**, **Hazards and controls** — you can show or hide it (**Show section**) and set a **Font scale**. Click **Apply**.
3. Optionally drag and drop the sections to reorder them ("Drag and drop to rearrange sections"). **Reset** restores the default layout.
4. Print. The printout carries the title **Chemical instruction & risk assessment**, the product name, "SDS Manager - Inventory Management" and the **Printed date**.

A public, read-only version of this page can be opened from a shared link, such as the QR codes on the summary, without signing in. It has no Back button. How these links are generated is not specified in the application.

How the per-SDS risk assessment is created and approved is covered in the topic **Chemical risk assessment, PPE approval, disposal classification and substitution**.

## My job procedures (what employees see)

**My job procedures** (UK: **My COSHH assessments**; Denmark: **My 7-point risk assessments**) is the employee's personal list. It contains the job procedures the user is assigned to; SDS Manager limits the list to the user's own assignments.

Columns:
- **Job procedure** (name)
- **Locations**
- **Risk rating**
- **Risk rating after controls**
- **Read date**: the date the user confirmed reading, or a **Confirm read** button if not yet confirmed
- **Created By**

How employees use it:
1. Open **My job procedures** from the sidebar, or from the dashboard tile **My job procedures** → **Show my procedures**.
2. Click a row to open the report (read-only) for that job procedure.
3. Read it and click **Confirm I have read the job procedure** on the report, or **Confirm read** in the list. The read date is saved and the procedure's **Read receipt** count goes up.

Pagination offers 10, 20, 50 or 100 rows. On phones, the list shows as cards; tapping a card opens the report.

QR-code login users (shared poster accounts with QR login enabled) can be assigned to job procedures. They see the procedure after logging in with their QR code; they do not get emails.

## Read receipts and notifications

- The **Read receipt** column on the list shows confirmed / assigned users, for example 4/6.
- Each user's **Read date** is listed on the **Locations & Users** tab.
- Users confirm with **Confirm I have read the job procedure** (on the report or the users tab) or **Confirm read** (in My job procedures). The report only shows the confirm button on an **Approved** revision.
- Confirmations are recorded in the **Change log** as "confirmed read".
- Emails:
  - When a revision is approved, assigned users are notified if **Send notifications to users linked to this Job Procedure** was ticked. The app then lists the recipients.
  - Users added to an already-approved procedure are emailed immediately.
  - Users added to a draft are told the email will follow approval.
  - QR users never get emails.

## When an SDS is upgraded to a newer version

When an SDS that has a risk assessment is moved to a newer SDS version and its risk assessment is copied, the upgrade dialog lists the job procedures that use it:
- The dialog title reads, for example, "1 Job procedure uses this risk assessment".
- It explains: "Transfer them to the new risk assessment so their reports show the new SDS version's hazard data. Any you leave unchecked keep using the old version."
- Each procedure shows whether it "Shows full risk assessment info" or "Shows as a basic row".

If you choose not to copy the risk assessment, this section is not shown. SDS upgrades are covered in the topic **Keeping SDS up to date: newer versions, SDS update requests to vendors, vendor inbox and SDS Quality**.

## Rules, limits and edge cases

- Name: max 255 characters. Description fields: max 1000 characters each.
- **Name**, **Frequency** and **Description** are required to create a job procedure.
- Only the company **Owner** and **Admin** can create job procedures or archive them from the list.
- **Read only** and **No Access** users never see the Job procedures menu.
- Approved and **Replaced by newer version** revisions are locked. Use **Create new revision**. Only one revision draft can exist at a time.
- **Approve** is disabled while the missing-information list is not empty.
- When locations are linked, approval follows the user's role on those locations. Plain **Admin** on the location is not enough; **Admin with approval** (or Owner) is needed.
- Each chemical hazard type and each non-substance hazard type can be added once per revision.
- On a non-substance hazard, **Effect of Controls** can only be set to **No controls needed** until PPE or a control is added to it.
- Deleting a chemical hazard happens immediately, with no confirmation. Deleting a non-substance hazard, a location or a user asks for confirmation.
- Linking an SDS without a risk assessment switches the procedure's **Rating source** to **Procedure-level**. The H / S / E rating then depends on what you rate on the hazards tab.
- **Basic** inclusion of a risk-assessed SDS excludes its text and PPE from the procedure, the rollup and the report.
- Storage risk is entered by hand per location (1–5 or "—"). The header shows the highest value. Unrated locations do not count and are left out of "Storage risk per location" on the report.
- **SDS stale** is shown when the SDS issue date is more than 5 years ago.
- SDS search on the SDS tab needs at least 2 characters.
- The customer review interval is Owner-only and limited to 1–120 months. A **Review due soon** warning starts 30 days before the due date.
- The **Exposure** tab requires the Enterprise plan.
- The printed report never shows assigned users' names. The on-screen user list is visible to Owners and Admins only.
- The compliance guide panels appear only for UK, Danish and Australian customers.
- There is no Excel/Word export for job procedures. Use the browser print dialog to save a PDF.
- The list shows revisions. A procedure may appear more than once if several of its revisions match the status filter.

## Messages and errors users may see

| Message (exact text) | What it means | What to do |
|---|---|---|
| Job procedure name required | Name left empty when creating | Enter a name |
| Description is required | Description left empty when creating | Enter a description |
| Frequency can't be empty | No frequency chosen when creating | Pick a frequency |
| Please select a location | No location chosen in Add Job procedure to location | Search and select a location |
| Please choose start date | Start date missing | Enter a start date |
| Invalid start date / Invalid end date | Date not valid | Correct the date |
| Start date must be before end date | End date is earlier than start date | Fix the dates |
| Please choose user | No user selected in Add user to job procedure | Select at least one user |
| User has been added successfully. Email will be sent after Job procedure approval. | User assigned to a draft | Approve the revision to send the email |
| Email has been sent to … | User assigned to an approved procedure; email sent | None |
| QR user added successfully. No email is sent to QR users — they will see this job procedure after logging in with their QR code. | A QR poster account was assigned | Make sure the QR login is available at the workplace |
| Email has been sent to the following recipients: … | Notifications sent on approval | None |
| Only users with the role "Admin with approval" can approve | Tooltip on a greyed-out Approve button | Ask a user with Admin with approval on the location, or the Owner, to approve |
| Click to see more details (yellow triangle) | Information is missing, so Approve is disabled | Click it, complete the listed items |
| Add SDS without a risk assessment? | You are linking an SDS with no risk assessment | Click **Add anyway**, or risk-assess the SDS first |
| Failed to link SDS / Failed to update SDS / Failed to unlink SDS | The SDS change did not save | Try again; contact support if it persists |
| Failed to add hazard / Failed to remove hazard / Failed to save hazard | The hazard change did not save (it is reverted) | Try again |
| You must add Personal Protective Equipment or Controls before you can set effect of the equipment | Effect of Controls set on a hazard with no PPE/controls | Add PPE or a control first |
| Please choose PPE | No PPE/control item selected | Pick an item |
| Comment can't be empty | PPE comment blank | Enter a comment (it pre-fills with the item description) |
| Saved | A Risk Assessment tab field was saved | None |
| Review recorded | Mark as reviewed today succeeded | None |
| Only the customer owner can edit this. Ask your owner to set the company-wide review cadence. | Non-owner hovering the review interval | Ask the Owner |
| No changes have been logged for this Job procedure yet. | Empty change log | None |
| Failed to load the change log. Please try again. | The change log could not load | Click **Refresh** |
| You do not have access to this Job procedure. Ask your manager to assign you to it. | Opening a report/summary you are not assigned to | Ask an admin to assign you on **Locations & Users** |
| This Job procedure could not be opened. | Report/summary failed to load | Try again; contact support |
| <n> chemical risk assessment(s) could not be loaded and are missing from this document. | Some per-SDS instructions failed to load in the pack | Reload the report before printing |
| Loading the rest of the assessment pack… | Extra report parts still loading | Wait before printing (the print button waits automatically) |
| Confirm to archive job procedure '<name>' | Archive confirmation | Click **Confirm** or **Cancel** |
| Confirm to delete location / Confirm to delete user / Confirm to delete hazard | Delete confirmation | Click **OK** or **Cancel** |

(In UK and Danish accounts, "Job procedure" in these messages is replaced by "COSHH assessment" or "Risk assessment" where the message uses the procedure label.)

## Frequently asked questions

Q: What is a job procedure in SDS Manager?
A: A job procedure is a Job Hazard Analysis for one work task. It records the job steps, the SDSs and chemicals used, chemical and non-chemical hazards, PPE and controls, where the work is done and who does it, and gives a risk rating before and after controls. Some screens (for example dashboard counters) call it a "work procedure", but its main on-screen name is **Job procedure** (UK: **COSHH assessment**; Denmark: **Risk assessment** / **7-point risk assessment**).

Q: What is the difference between a job procedure and an SDS risk assessment?
A: An SDS risk assessment (Risk Evaluation) is done once per product and describes that chemical's hazards, recommended controls and PPE. A job procedure is done once per task. It links the products used, adds the task's own exposure, controls, people, training and emergency information, and gives the residual risk for the task. Job procedures reuse the SDS risk assessments, so you don't repeat work.

Q: Can I create a job procedure that has no chemicals?
A: Yes. You can create a job procedure without linking any SDS and use only non-substance hazards such as Electrical, Fall hazards, Confined space or Working alone. Add them on the **Chemical hazards** tab with **Add non-substance related safety hazard**.

Q: Why can't I see the "Add Job hazard Analysis" button?
A: Only the company **Owner** or a user with the company role **Admin** can create job procedures. Other roles can view the list (if their permissions allow) but not create. In the UK the button is **Create COSHH assessment** and in Denmark **Create risk assessment**.

Q: Which plans include job procedures?
A: The menu entry is shown in the main sidebar on the **Pro** and **Enterprise** plans once the library has 5 or more SDSs. It is under **More** on **Premium**, and on Pro and Enterprise while the library has fewer than 5 SDSs. It is not shown on Free or Basic. Whether a plan can fully use the feature is controlled by SDS Manager, and you may see a "feature not available" upgrade message instead. For the exact plan contents, confirm with SDS Manager support/sales. **My job procedures** is shown on Pro and Enterprise, and the **Exposure** tab needs Enterprise.

Q: I can't find Job procedures in my sidebar. Why?
A: Check these in order:
- **Read only** and **No Access** users never see it.
- On Pro and Enterprise with fewer than 5 SDSs in the library, and on Premium, it is under **More**.
- On Free and Basic it is not offered.
- Your account also needs the job-procedure permission, which SDS Manager sets.

Q: How do I add employees to a job procedure and get them to confirm they've read it?
A: Open the job procedure, go to **Locations & Users**, click **+** next to **Users performing the job procedure**, select the users and click **Add**. After the revision is approved, they see it in **My job procedures**. They open it and click **Confirm I have read the job procedure** (or **Confirm read** in the list). You can track progress in the **Read receipt** column (e.g. 3/5) and the **Read date** per user.

Q: When do assigned employees get an email?
A: There are three cases:
- If you add users while the revision is a draft, the app says the email will be sent after approval. When approving, tick **Send notifications to users linked to this Job Procedure** to notify assigned users.
- If you add users to an already approved procedure, the email is sent right away and the app lists the recipients.
- QR-code users never receive emails; they see the procedure after logging in with their QR code.

Q: Who can approve a job procedure?
A: If no location is linked, the company **Owner** or an **Admin** can approve. If locations are linked, you need the **Admin with approval** role on at least one of those locations, or be the Owner. A plain **Admin** on the location sees a greyed-out **Approve** button with "Only users with the role "Admin with approval" can approve".

Q: Why is the Approve button disabled?
A: Either information is still missing, or your role does not allow approval. When information is missing, a yellow warning triangle appears next to the button; click it to see what still needs to be completed. If there is no triangle and the button is greyed out with a tooltip, approval needs the **Admin with approval** role on a linked location.

Q: How do I change a job procedure that is already approved?
A: Approved revisions are locked. Open the procedure and click **Create new revision**. SDS Manager creates a **Revision draft** copy that you can edit. When done, click **Approve** and describe the main changes. The new revision becomes Approved, and the older one shows as **Replaced by newer version**. You can view any earlier revision from the revision dropdown at the top of the page.

Q: Why is the "Create new revision" button missing?
A: It only appears on **Approved** or **Archived** revisions, and only if the procedure does not already have a revision draft. If a draft exists, open it from the revision dropdown and finish or approve it first.

Q: What do the statuses mean?
A:
- **Draft**: a new, unapproved procedure.
- **Revision draft**: a new version being prepared.
- **Approved**: the signed-off version employees use.
- **Replaced by newer version**: an older approved version that has been superseded.
- **Archived**: taken out of use.

The list shows Approved, Draft and Revision draft by default; add the others in **All Statuses**.

Q: What do H, S and E mean, and what is "Risk rating after controls"?
A: H is Health, S is Safety and E is Environment, each rated 1–5. **Risk rating** is the inherent risk before controls. **Risk rating after controls** is the residual risk once PPE, controls and emergency controls are taken into account. On the report, 1 shows as Low, 2–3 as Medium, 4 as High and 5 as Extreme. The calculation method is described in the topic **Chemical risk assessment, PPE approval, disposal classification and substitution**.

Q: Why does the SDS tab say "Rating source: Procedure-level"?
A: At least one linked SDS has no risk assessment of its own (or a procedure-level hazard is attached). The procedure's H / S / E ratings then come from the hazards you rate on the **Chemical hazards** tab instead of being rolled up from each SDS. If every linked SDS is risk-assessed, the source switches to **From SDSs**.

Q: What is the difference between "Full" and "Basic" when adding a risk-assessed SDS?
A: **Full** brings the SDS's risk-assessment text (use, storage, disposal, handling, hazard statements) and its PPE/controls into the procedure, its rollup and its report. **Basic** only shows the SDS name, supplier, signal word, GHS pictograms and H / S / E ratings, and excludes the text and PPE. You can switch later with the pencil on the SDS row (not on locked revisions).

Q: How is storage risk calculated?
A: It is not calculated; you enter it. For each location on the **Locations & Users** tab, set **Storage risk — Safety** and **Storage risk — Environment** from 1 (Not Dangerous) to 5 (Extremely Dangerous), or leave "—". The header and list show the highest value across the procedure's locations.

Q: How do I print a job procedure or save it as a PDF?
A: Click the eye (**View**) icon in the list to open the report, then click the printer button. Your browser's print dialog opens, where you can print or choose "Save as PDF". The printout includes a contents page, the assessment, locations, PPE & controls, exposure records, a chemical risk assessment per linked risk-assessed SDS, and an SDS index with QR codes. Every page has a footer with the revision date, approver and printed date. Assigned employees' names are never printed.

Q: Can employees edit a job procedure from My job procedures?
A: No. Clicking a row in **My job procedures** opens the read-only report. Employees can read it, print it and confirm reading. Editing is done by admins from the **Job procedures** list.

Q: What is the Chemical job instruction summary?
A: It is a short printable overview of a job procedure: name, description, approval date, the highest risks with and without controls, and per substance the hazard pictograms, hazard statements, PPE and controls and emergency controls. Each substance card has QR codes to open the chemical instruction and the SDS. Open it from an SDS's action menu with **Open chemical job instruction**.

Q: How do I set up periodic reviews of job procedures?
A: The company **Owner** sets **Customer review policy (months)** on any job procedure's **Risk Assessment** tab (1–120 months); it applies to all job procedures. Each procedure can override the due date with **Per-procedure override (optional)**. Use **Mark as reviewed today** for periodic checks where nothing changed; approving a new revision also records a review. The report header then shows "Next review", "Review due soon" (within 30 days) or "Review overdue".

Q: Is there a history of who changed what?
A: Yes. The **Change log** tab records every change with **When**, **Who** and **What changed**. This includes edits to fields, hazards, PPE, SDS links, locations, user assignments, exposures, approvals, read confirmations and periodic reviews.

Q: Does SDS Manager support UK COSHH or the Danish 7-point risk assessment?
A: Yes, the same feature adapts its labels.
- UK accounts see **COSHH assessments**, a **COSHH compliance** section (Regs 7, 10, 11) and a guide mapping the report to COSHH Regulations 6–13.
- Danish accounts see the **7-point risk assessment** with numbered sections following AT-vejledning C.0.1.
- Australian accounts see a WHS compliance guide.

The guides are reference summaries only, so always check current official guidance.

Q: What happens to my job procedures when an SDS is upgraded to a newer version?
A: If you copy the risk assessment to the new SDS version, the upgrade dialog lists the job procedures that use it. Ticked procedures are moved to the new risk assessment so their reports show the new version's hazard data. Unticked procedures keep using the old version.

## Related topics

- **Chemical risk assessment, PPE approval, disposal classification and substitution** — risk evaluations of SDSs and the risk rating method (H/S/E scales, likelihood, effect of controls)
- **Exposure register, reports (incl. Tier II) and Danish APB** — exposures and exposure records (the Exposure tab works on Enterprise only)
- **SDS library: substances list, SDS details, stock, archive and export** — SDS action menus
- **Keeping SDS up to date: newer versions, SDS update requests to vendors, vendor inbox and SDS Quality** — upgrading to newer SDS versions
- **Login & Account Security, Users, Roles & Permissions, and Organization Settings** — location roles (Admin with approval, Admin, Staff, Read only), users and QR-code login users
- **Plans, Free Trial, Sign-up, Billing and Subscription** — subscription plans and feature availability
- **SDS Manager: product overview, navigation, Dashboard and getting started** — Dashboard (key information tiles)
