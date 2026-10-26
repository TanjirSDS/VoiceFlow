# Labels, labelling compliance, kits and usage tracking

> Summary: SDS Manager prints GHS labels for chemicals in your SDS library: secondary container labels (for bottles and containers you decant into) and transport labels, one at a time or in bulk on Avery, Brady or DuraLabel sheets or plain paper. You choose the size, what appears on the label (GHS pictograms, signal word, hazard and precautionary statements, PPE icons, QR codes, supplier details and more) and can save layouts for reuse. **Labelling compliance** checks your SDS library for documents that still use the old pre-CLP labelling (orange danger symbols, R- and S-phrases) so you can request updated SDSs. **Kit Management** groups SDSs that belong to one product (for example Part A + Part B) into a Kit and tracks its stock, and tracking usage labels put a QR code on a container that opens stock tracking for that batch.

## Where to find it

| What | Where in the app | Who sees it |
|---|---|---|
| Print one label | **Print Label** action on an SDS row (location SDS lists, and the ⋮ actions menu of SDS library tables). Opens the **Print Single SDS Label** dialog. | All signed-in users whose plan includes label printing. QR-code users only if the Owner allows it. |
| Print many labels | Click the **Add to print Avery/Brady label** icon on each SDS row in a location's SDS list. A **Print Avery/Brady label** button with a counter appears at the top of the list. Click it to open **Print Multiple SDS Labels**. | Desktop only. The icon is shown only for rows that have an SDS file. |
| NFPA / HMIS labels | ⋮ actions menu of an SDS row: **Print NFPA label**, **Print HMIS label** | Customers in the US or Canada only |
| Labelling compliance | Sidebar: **SDS compliance** > **Labelling compliance** (path `/hazardous-substances/labelling`) | Only customers the system has enabled for the check (see the plan section) |
| Kit Management | Sidebar: **More** > **Kit Management** (path `/kit-management`) | Not shown to Staff users or QR-code users |
| Kits view of a location's SDS list | **Kits** switch above a location's SDS list | Desktop only. Shown only when your company has KIT SETs. |
| Tracking usage labels | **Print Tracking Usage Label** button in the **Manage Stock** dialog of an SDS, and the QR-code icon on Kit rows in **Kit Management** | Users who can manage stock / kits |
| Public label generator | A label link that opens without signing in | Anyone with a valid link |

## Plan and permission requirements

**Label printing (secondary container and transport labels)**
- Printing labels is a plan feature. The subscription page lists "GHS labels included" and "Secondary container labelling (GHS) with QR Code" under the **Basic** plan, and higher plans include everything in Basic. If your plan does not include it, clicking **Print Label** opens the upgrade popup ("This feature is not available on your current subscription plan." / "...current trial plan."). The system decides which plans and trials include it; ask SDS Manager sales if you are unsure.
- QR-code users (employees who sign in by scanning a QR code) can print labels only if the Owner turned on **Allow QR users to print labels**. If not, they see "This action is not allowed. Please contact your administrator.", and the icon tooltip says "Permission for this action has not been granted to QR users by the Owner".
- The Owner can also limit what QR users can change in the label dialog. See "QR users and label printing".
- **Attachment QR on Label** can only be switched on or off by the Owner, Admin and Admin Light roles.
- Making a saved layout the **default for the organization** is Owner-only.
- Changes that are saved to the SDS record (PPE icons, GHS pictograms, NFPA/HMIS values, the stored information message) need a signed-in user. QR-code users can never make them.

**Labelling compliance**
- The system decides access per customer. SDS Manager enables the check when your role may use **SDS compliance** and your company is on a paid **Pro** or **Enterprise** plan in a country that uses the EU CLP regulation. SDS Manager can also switch it on for an account.
- Customers who qualify by role but not by plan see **SDS compliance** with the upgrade popup instead of the page. Customers who don't qualify see the old single **SDS compliance** link with no **Labelling compliance** entry.
- The **SDS compliance** menu is hidden for the Read only, No Access and Staff roles. QR-code users cannot open the page.
- **Request Updated SDS** on a row: the account Owner, or a user with the Owner, Admin or Admin with approval role on that row's location. Admin Light sees the results, the evidence and the export but not this button.
- **Upgrade to new version** / **Show differences between the two SDS** on a row: Owner or Admin.
- **Request updated SDSs from suppliers** link: Owner or Admin, on plans that include SDS update tracking.

**Kit Management**
- The app hides **Kit Management** from Staff users and QR-code users. The app does not show a plan limit for it. What other roles may change is decided by SDS Manager.
- The **Rename KIT SET** pencil appears only for accounts that have the SDS-binder import feature.

## Printing a single SDS label

The **Print Single SDS Label** dialog shows a live preview on the left and the settings on the right.

How to print a label:
1. Find the SDS in a location's SDS list or in an SDS library table.
2. Click **Print Label** (label icon, or ⋮ > **Print Label**). If the SDS is used in more than one location, choose the location first.
3. Choose the **Label type**: **Secondary Container Label** or **Transport Label**.
4. Choose a **Print format** (size). You can also pick one of **My saved layouts** or **＋ Create new custom label**.
5. Turn content on or off under **Content display**, and set **Hazard statements**, **Icon size**, **Font size** and **QR size**.
6. The preview updates by itself after each change, with a short delay while you type.
7. Print or download from the preview. To save the settings for next time, click **Save label layout settings**.

Notes:
- When the dialog opens, it applies your **last-used layout** (the format and content you last printed or closed the dialog with). If you have none, it applies your organization/user **default layout**, if one exists. Otherwise it starts with a Secondary Container Label in A6.
- The label is printed in the language of the SDS. To print a label in another language, use an SDS in that language.
- Metric or US size names follow your measurement-system setting. US users see inch sizes.
- On a mobile device, the dialog shows a **Download PDF** button and a page-by-page preview instead of the embedded preview.

## Label types: Secondary Container Label and Transport Label

| Label type (on screen) | Use | Default size when selected | Notes |
|---|---|---|---|
| **Secondary Container Label** | GHS label for containers and bottles you fill from the original package | A6 (105x148 mm / 4"x6") | Full set of content options. Can be printed on Avery/Brady/DuraLabel sheets. |
| **Transport Label** | GHS shipping/transport label that includes transport data from SDS Section 14 (UN number, proper shipping name, transport hazard class) | 52x105 mm (2"x4") | Has its own options: transport method, GHS pictograms, shipped product information (fill weight, lot number, etc.). Avery/Brady sheets are not offered in the single-label dialog for this type. |

Switching the label type clears the selected saved layout and rebuilds the preview. Saved layouts are kept per label type, so only layouts of the current type are listed.

## Label sizes and print formats

**Standard sizes** (in the **Print format** list):

| Metric name | US name | Hazard statements available | Ingredients available |
|---|---|---|---|
| A4 (210x297mm) | A4 (8.5"x11") | Yes | Yes |
| A5 (148x210mm) | A5 (5.5"x8.5") | Yes | Yes |
| A6 (105x148mm) | A6 (4"x6") | Yes | Yes |
| A7 (74x105mm) | A7 (3"x4") | Yes | No |
| 52x105mm | 2"x4" | Yes | No |
| 50x105mm | (metric only) | Yes | No |
| A8 (52x74mm) | A8 (2"x3") | Yes | No |
| 50x74mm | (metric only) | Yes | No |
| A9 (37x52mm) | A9 (1.5"x2") | No | No |
| 26x52mm | 1"x2" | No | No |
| A10 (26x37mm) | A10 (1"x1.5") | No | No |
| 74x52mm | 3"x2" | Yes | No |

Sizes marked "metric only" are not listed for users with US measurement settings. On sizes too small for hazard statements, the **Hazard statements** buttons are greyed out with the note "Hazard statements do not fit a label this size." **Ingredients on Label** can only be switched on for A4, A5, A6 and custom sizes.

**Avery / Brady / DuraLabel sheets** (group **Brady & Avery label** in the single-label dialog, **Avery / Brady / DuraLabel** in the bulk dialog):

| Sheet | Label size | Labels per sheet | Hazard statements | Rotate (landscape) |
|---|---|---|---|---|
| Avery 5164 / 5264 | 4" x 3 1/3" (101.6 x 84.7 mm) | 6 | Yes | Yes |
| Avery 6573 | 8 1/8" x 5" (206.4 x 127 mm) | 2 | Yes | No |
| Avery 5255 | 8 1/2" x 11" (215.9 x 279.4 mm) | 1 | Yes | Yes |
| Avery 5292 | 4" x 6" (101.6 x 152.4 mm) | 1 | Yes | Yes |
| Avery 5163 / 8163 / 60505 | 4" x 2" (101.6 x 50.8 mm) | 10 | Yes | Yes |
| Avery 5160 | 2 5/8" x 1" (66.7 x 25.4 mm) | 30 | No | No |
| Avery 60506 | 2" x 2" (50.8 x 50.8 mm) | 12 | Yes | No |
| Avery 60503 | 3 1/2" x 5" (88.9 x 127 mm) | 4 | Yes | Yes |
| Avery 60517 | 2 1/2" x 1" (63.5 x 25.4 mm) | 24 | No | No |
| DuraLabel Pro 300 | 6" x 3" (152.4 x 76.2 mm) | 1 | Yes | No |
| Brady BBP31 | 6" x 4" (152.4 x 101.6 mm) | 1 | Yes | No |
| Avery L7173 / B7173 (A4 sheet) | 99.1 x 57 mm | 10 | Yes | No |
| Avery L7913 / B3427 (A4 sheet) | 99.1 x 67.7 mm | 8 | Yes | No |
| Avery L7912 (A4 sheet) | 99.1 x 42.3 mm | 12 | No | No |
| Avery L7911 (A4 sheet) | 45.7 x 21.2 mm | 48 | No | No |

The L-series sheets are European A4 label stock. They print on an A4 page with the exact sheet margins, and they cannot be rotated. On the 24- and 30-per-sheet sheets (Avery 60517 and 5160), icon captions are switched off automatically because there is no room for them.

**Custom size**: choose **＋ Create new custom label** to set your own size (see "Creating a custom-size label").

## Creating a custom-size label

1. In **Print format**, choose **＋ Create new custom label**.
2. Enter **Label width** and **Label height**. Switch the unit between **mm** and **in**. The default unit follows your measurement setting, and the starting size is 50 x 100 mm.
3. Set **Margin (mm)**. The default is 2 mm.
4. Choose an **Overflow mode**:
   - **Fit to label**: the whole label content is scaled down evenly so it fits on one label.
   - **Allow multipage**: your font size is kept, and long hazard text continues onto extra label pages.
5. Choose the content and sizes as usual. Hazard statements and ingredients can be used at any custom size.
6. Click **Save label layout settings** to keep it as a named layout. The dropdown then shows it as "Name (W×H unit)".

Width and height must be positive numbers, and the margin must be zero or more. An invalid entry goes back to the previous value when you leave the field.

## What can go on a secondary container label (Content display)

The product name and company name are always on the label. Everything else is controlled by a switch, and the tooltip on each switch says "Show component" or "Hide component".

| Option (on screen) | Default | What it does |
|---|---|---|
| **Company logo** | Off | Prints your company logo. |
| **PPE symbols** | On | Prints the SDS's PPE/ISO icons. If none are set, an **Add PPE icons** picker appears. A signed-in user's icon edits are saved to the SDS record. |
| **Icon captions** | On | Text under the pictograms and PPE icons. Forced off on 24- and 30-per-sheet Avery sheets. |
| **NFPA** / **HMIS** | On when the SDS has values | US and Canada customers only. A pencil (**Edit NFPA information** / **Edit HMIS information**) edits the hazard levels. The switch turns off by itself if there are no values. |
| **SDS QR on Label** | On | A QR code that opens the SDS. |
| **Ingredients on Label** | On (where the size allows) | The ingredient list. Only for A4, A5, A6 and custom sizes. Not available on Avery/Brady sheets. |
| **Attachment QR on Label** | Off | A QR code that opens the product's attachments without login. See "Attachment QR on Label". |
| **Custom information message** | On if the SDS has a message | Prints an information message. You can set it as a one-time message for this label only or edit the stored one. Switching it on with no message opens the editor. |
| **Pictograms** | On | GHS hazard pictograms. |
| **Signal word** | On | "Danger" / "Warning" from the SDS. |
| **Supplier name** | On | Supplier name. |
| **Address** | On | Supplier address. |
| **Emergency phone** | On | Emergency telephone number. |
| **Emergency contact** | On | Emergency contact. |
| **UFI number** | Off | The UFI from SDS Section 2, printed only if the SDS has one. |
| **REACH registration number** | Off | Printed only if the SDS has one. |
| **Supplemental information (EUH)** | Off | EUH supplemental statements, printed only if the SDS has them. |
| **Top color bar** | On | A colored band at the top of the label. The pencil (**Edit top color bar**) lets you pick a **Primary color** and **Secondary color** with a color picker or a 6-digit hex code, then **Apply**. Default colors are yellow (ffc93c) and blue-violet (626df9). |

The switches from **Pictograms** to **Top color bar** apply to labels that SDS Manager generates for you (standard, custom and saved layouts). They are hidden when you print on an Avery/Brady sheet from the single-label dialog.

## Hazard statements on labels

The **Hazard statements** control has three choices:
- **Standard** (tooltip "Use standard statement description"): uses the standard wording of the hazard and precautionary statements.
- **From Pdf**: uses the statement text as written in the SDS. The pencil next to it ("You can click edit pencil to edit hazard description text. SDS Detail page will open where you can click on the text you want to edit.") opens SDS Section 2 so you can correct the text. It is active only when **From Pdf** is selected.
- **Hide**: no statements on the label.

On sizes too small for statements the control is disabled and shows "Hazard statements do not fit a label this size." If you switch back to a bigger size, your previous choice is restored.

## Icon size, font size and QR size

- **Icon size** (pictograms and PPE icons): 0.5x, 0.75x, 1x, 1.25x, 1.5x, 2x.
- **Font size**: 0.5x, 0.75x, 1x, 1.25x, 1.5x, 1.75x, 2x.
- **QR size**: 0.5x, 0.75x, 1x, 1.25x, 1.5x, 1.75x, 2x.

In the bulk dialog the icon size is set with **Change size of icons (Pictograms & PPE)**. The choices are Small (75%), Medium (100%), Large (125%) or Custom, and a custom value below 8 gives "Custom size must be at least 8 pixels". The bulk text size is set with the **Aa** list.

## Expiration date on secondary container labels

Below **Content display** there is an **Expiration Date** row with a date field and a switch. It is hidden by default. Turn the switch on and pick a date to print it on the label. The date is shown in your regional format (US/Canada month/day order).

## Supplier Identification (choosing the company printed on the label)

The **Supplier Identification** button, available when the label is opened from an SDS in your library, lets you choose which company details appear on the label:
- The company from the SDS appears first, under **From Safety Data Sheet**. You can edit it, which opens the SDS company information.
- Your saved suppliers are grouped by country. You can **Add** a supplier or edit one. Two default buttons control which address is applied automatically: **Set default address for all Countries** (star) and **Set default address by country** (building icon).
- Click an entry to use it on the label. The preview refreshes.

## Custom information message

**Custom information message** prints a short highlighted message on the label, such as handling instructions. You can edit it from the label dialog. The editor can apply it as a one-time message (this label only), or change the message stored on the SDS. A one-time message is remembered in a saved layout.

## Attachment QR on Label

**Attachment QR on Label** prints a QR code that opens all attachments of the product, for example extra instructions or certificates, with no login.
1. Switch it on. A confirmation asks **Make attachments publicly accessible?**: "Turning this on makes all attachments of "<product>" accessible to anyone who scans the QR code or has the link — no login required. You can turn this off at any time to deactivate the link."
2. Confirm. The preview then includes the QR code.
3. Switching it off removes public access straight away. The message "Public access to attachments has been turned off. QR codes on previously printed labels will no longer work." is shown.

Rules:
- Only the Owner, Admin and Admin Light roles see this switch.
- It is saved per product, not per layout. Saved layouts do not turn it on or off.
- If the product has no attachments, the switch is disabled ("This product has no attachments"). A product that is already public can always be switched off.
- If the current status cannot be loaded, the switch stays disabled with "Could not load the current status — reopen this dialog to try again".

## Transport labels

When **Label type** is **Transport Label**:
- **Transport method** lists the transport methods found in SDS Section 14. The pencil opens Section 14 for editing. If the SDS has no data for the method in a saved layout, the list shows "No data available for ...".
- If the SDS has no clear transport details, a **Missing Transport Information** popup explains: "This Safety Data Sheet (SDS) doesn't include clear transport details. Please review Section 14 - Transport information of the SDS and provide the required information below." You can then:
  - click **Not Regulated as Dangerous Goods** if the product is not dangerous goods, or
  - click **Edit Transport Information (Use only on this label)** and fill in **UN Number**, **Proper Shipping Name** and **Transport Hazard Class(es)**, then **Submit**. These values are used only on this label, or
  - click **Edit Section 14** to correct the SDS itself.
- **Content display** for transport labels: **Company logo**, **SDS QR on Label**, **Ingredients on Label** (A4–A6 and custom only), **Attachment QR on Label**, and **GHS pictograms**. A signed-in user's pictogram changes are saved to the SDS.
- **Shipped product information**: optional fields **Fill Weight**, **Gross Weight**, **Expiration Date**, **Lot Number**, **Fill Date**, **P/N** and **Misc**. "Only fields you fill in will be visible on label." Fill them in and click **Save** to put them on the label. The bin icon clears a field. Dates print in your regional date format.
- **Supplier Identification** is available as for secondary labels.

## Saved label layouts (templates) and defaults

A saved layout stores the label setup, so you or your colleagues can print the same label again in one click.

How to save a layout:
1. Set up the label: type, size, content, sizes, colors, expiration-date visibility, supplier and (for transport) transport method.
2. Click **Save label layout settings**. The button only appears after you change something compared with the loaded layout.
3. Enter a **Name**.
4. Optionally tick **Share layout within our organization** so everyone in your company can use it.
5. Optionally tick **Make this layout default for our organization**. This is available only to the account Owner and only for a shared layout. Others see "Only account owner can set this label as default".
6. Click **Save**.

Using and managing layouts:
- Saved layouts appear in **Print format** under **My saved layouts**, shown as "Name (size)". Only layouts of the current label type are listed. The default layout has a pin icon with the tooltip "Default layout".
- Choose a layout to apply all its settings.
- The bin icon next to a layout deletes it. It is shown only for layouts you are allowed to edit.
- When the dialog opens, your last-used layout wins. If you have none, the default layout is applied.
- QR-code users and the public label generator cannot save layouts.
- Saved layouts can also be used in the bulk dialog when they fit the sheet (see "Printing labels for many SDSs at once").

## Printing on Avery, Brady or DuraLabel sheets from the single-label dialog

1. In **Print format**, choose a sheet under **Brady & Avery label**. This group appears only for Secondary Container Labels opened from an SDS in your library, on a desktop browser.
2. Choose **Copies**: 1–10, or **Fill Page** to fill the whole sheet. The tooltip explains: "Set the number of times the selected label is printed on the same sheet. If the sheet is partly used, you can select the cell below to match where to start printing."
3. Click the cell where printing should start, if part of the sheet is already used.
4. For sheets that support it, use the **Switch layout** icon to rotate the labels (portrait/landscape).
5. Click **Print Label**. The browser's print dialog opens. Make sure your printer's paper size matches the sheet.

The sheet is drawn in the browser, so the extra content switches (pictograms, signal word, supplier, address, emergency details, UFI/REACH/EUH, color bar) and the ingredient list are not available in this mode.

## Printing, downloading and the PNG option

- Standard, custom and saved-layout labels are generated as a PDF. Use the preview's print or download controls. On a phone, use **Download PDF**.
- Below the preview: "Is this PDF not compatible with your printer?" **Click to generate .png file instead of .pdf** downloads the label as PNG image(s), one file per page. The file name starts with Secondary_Label or Transport_Label. For Avery/Brady sheets, the PNG is a snapshot of the sheet.
- If the images cannot be made: "Error fetching label images. Please try again later."
- Closing the dialog or downloading the PNG saves your current setup as your last-used layout.

## Printing labels for many SDSs at once (Print Multiple SDS Labels)

How to collect SDSs and open the dialog:
1. In a location's SDS list, click the **Add to print Avery/Brady label** icon on each SDS you want. A red dot marks the selected rows.
2. A **Print Avery/Brady label** button with a counter appears. Click it to open **Print Multiple SDS Labels**. The **X** next to it clears the selection.

Settings in the dialog:
- **Label type**: **Secondary Container Label** or **Transport Label**.
- **Print format**: an **Avery / Brady / DuraLabel** sheet (default Avery 5164/5264) or **Plain paper** in any standard size (A4 … A10 and the mm sizes).
- **Copies**: how many labels per SDS, from 1 to 100.
- **Change size of icons (Pictograms & PPE)** and text size (**Aa**).
- **Switch layout** (rotate labels): Avery/Brady sheets that support landscape, Secondary labels only.
- **Rotate page**: plain paper only. Turns the page from portrait to landscape.
- **Label layout**: choose a saved layout, or **Standard label** for no saved layout.
  - On a sheet, only saved layouts that fit inside one label cell are listed (±0.5 mm). If none fit: "No saved layouts fit this sheet size". Two extra options appear here:
    - **Set as my default** (needs a selected layout) remembers the sheet and layout for this label type, so they are preselected next time.
    - **Scale label to fill the cell** enlarges the layout to fill each cell instead of printing it at its real size.
  - On plain paper, any saved layout that fits the page can be used and is tiled in a grid. The tip says: "Tip: You can design your own label (custom size + content) in the single-label print view, save it as a layout there, and it will appear here to reuse on multi-label sheets — as long as it fits the sheet's cell size." Plain paper also has **Page margin (mm)**, **Gap between labels (mm)** and **Show label border** (a cutting guide). These three settings are remembered in your browser per label type.
- "Click a cell to choose where printing starts" lets you reuse a partly used sheet.
- **Print Label** prints. Where possible, plain paper and the European A4 sheets are printed through a fixed-size PDF that opens in a new tab, so browser margins cannot shift the labels. Otherwise the browser print dialog is used.
- "Is this PDF not compatible with your printer?" **Click to generate .png file instead of .pdf** downloads images instead.

What the standard bulk label shows (Secondary, on a sheet, no saved layout): product name, supplier name, signal word, pictograms and PPE icons, hazard statements, a QR code to the SDS, the information message and NFPA/HMIS where available.

Transport labels in bulk: the transport data (UN number, shipping name, hazard class) is filled in automatically for each SDS. The dialog warns: "Transport data (UN number, shipping name, hazard class) is auto-resolved per SDS and not reviewed individually — verify each label before printing."

Limits: at most 500 labels per print (number of SDSs × copies). Above that: "Too many labels to print at once (max 500). Reduce the number of copies or selected SDS." If some label images could not be rendered, printing is blocked and a **Retry** button appears next to "Error fetching label images. Please try again later."

## Printing NFPA and HMIS labels (US and Canada)

For customers in the US or Canada, the ⋮ actions menu of an SDS has **Print NFPA label** and **Print HMIS label**:
1. In **Set Hazard Levels**, set the levels:
   - NFPA: **Health Hazard Level**, **Flammability Hazard Level**, **Instability Hazard Level**, **Special Hazard**.
   - HMIS: health, flammability, **Physical Hazard Level**, **Personal Protection**.
2. Click **Continue**.
3. Optionally **Write a description**.
4. Click **Print Label**, or **Go back** to change the levels. The levels you print with are saved on the SDS.

The NFPA and HMIS values also appear as options on the secondary container label.

## Public label generator (labels without signing in)

SDS Manager can give out label links that open the **Print Single SDS Label** dialog without a login. The link is validated against the customer's subscription. In this public view:
- A **US / Metric** switch in the **Print format** list changes the size names. The default follows the customer's country.
- A **Language** selector sets the dialog language. Its tooltip says: "Language is auto-detected. Change it here if incorrect. This setting affects only this window, not the label's language, which matches the corresponding SDS. To create a label in another language, use an SDS in that language."
- PPE icons and pictograms can be changed for the printed label only. Nothing is saved to the SDS.
- Saved layouts, **Save label layout settings**, **Supplier Identification**, Avery/Brady sheets and **Attachment QR on Label** are not available.
- If the link's data cannot be loaded: "Error fetching label generator info".

Where these links are given out is not specified in the application.

## QR users and label printing

QR-code users sign in by scanning a location QR code. Their label printing is controlled by the account Owner in user management:
- **Allow QR users to print labels** turns label printing on or off for all QR users.
- **QR user access to label Content Display & Expiration Date** sets each label field to one of:
  - **Disable**: the field is greyed out and never printed. "QR users cannot see the Content Display and Expiration Date sections when printing labels".
  - **Show/hide only**: QR users can switch the field on or off but cannot change its value.
  - **Editable**: QR users can also change the value. Only fields with a value QR users can edit offer this: **Custom information message** (as a one-time message), **Top color bar** colors and **Expiration Date**.
- Changes saved to the SDS record (PPE icons, GHS pictograms, NFPA/HMIS) are never allowed for QR users, whatever the setting.
- QR users cannot save label layouts.
- Only the Owner can change these settings. Admins see "You do not have permission to perform this action. Only the owner can change this setting."

## Labelling compliance (pre-CLP labelling check)

**Labelling compliance** finds SDSs in your library whose hazard labelling still uses the system from before the EU CLP regulation: orange danger symbols and R- and S-phrases. These SDSs are outdated, and you should ask the supplier for a CLP version. The page subtitle reads: "Find SDSs that still use pre-CLP hazard labelling: orange danger symbols and R- and S-phrases."

**Opening it**: sidebar **SDS compliance** > **Labelling compliance**. When the feature is enabled, **SDS compliance** becomes a group with two entries: **Hazardous substances** (the existing list) and **Labelling compliance**.

### Running the check

1. Click **Run check**. While it runs, the button reads **Checking…** and is disabled.
2. A progress bar shows "Checked {processed} of {total} SDS documents" and a percentage. While the run waits to start: "The check is queued and will start shortly."
3. When it finishes: "The labelling check is complete." The cards and the table refresh.
- **Last run: <date>** (or **Last run: never**) is shown next to the button.
- Before the first run: "Run the check to find SDSs that still use pre-CLP labelling. SDSs added afterwards are checked automatically."
- The check runs on SDS Manager's servers. You can leave the page; the progress is picked up again when you come back.
- SDSs added after the first run are checked automatically in the background. While that happens: "Newly added SDSs are being checked automatically. Results appear as they finish."
- Some documents may fail for a moment. "SDS documents not checked yet: {count}. They will be retried automatically."

### Results by labelling status (the four cards)

| Status | Color | Meaning |
|---|---|---|
| **Outdated** | Red | The SDS still uses pre-CLP labelling (old danger symbols and/or R-/S-phrases). Request an updated SDS. |
| **Needs review** | Amber | The automatic check could not reach a clear result. Open the SDS and check it yourself, for example when the file could not be read or is too large. |
| **OK** | Green | No pre-CLP labelling problem was found. |
| **Not yet checked** | Grey | The SDS has no result yet. Run the check. |

- Each card shows a count. Clicking a card filters the list to that status, and clicking it again shows all statuses.
- "Counts cover all SDSs in the selected location. Search and the newer-version filter only narrow the list."
- The cards count SDS rows in your library (the SDSs in use in the selected location). The progress bar counts distinct SDS documents. The two numbers can therefore differ.

### Filters, search and export

- **Labelling status** filter: tick any combination of Outdated, Needs review, OK and Not yet checked (**All statuses** = no filter). It is applied when the menu closes.
- **Locations**: one location, or **All Locations**. The cards follow this filter.
- **Only SDSs with a newer version**: shows only SDSs for which a newer version already exists, so you can upgrade them directly.
- **Search for SDS**: free-text search.
- **Export to Excel**: exports the list as filtered (status, location, search, newer-version), including the labelling result. The export runs in the background with a progress window and downloads as labelling-compliance.xlsx.
- **Request updated SDSs from suppliers** link: opens the **Request Updated SDS** page (Owner/Admin).
- When the background check finds new results while you are on the page, the list is not reloaded under you. Instead you see "New results are available." with a **Show new results** button, which refreshes the list and keeps your page.

### The table

Columns: **Product Name**, **Supplier Name**, **Revision date**, **Legacy labelling**, **GHS**, **Locations**, and row actions. Click a row to open the SDS details.

The **Legacy labelling** column shows a colored chip with the status. Hover or focus the chip to see the evidence:
- "Old symbols: …": the pre-CLP danger symbols found.
- "Old phrases: …": the R- and S-phrases found.
- "Found in section: …": the SDS sections where they were found.
- "Checked: <date>".
- "AI note: …": a free-text remark from the automatic check, which is not translated.
- A standard explanation, when one applies:

| Note | Meaning |
|---|---|
| "The automatic check could not read this SDS — please review it manually." | Shown with Needs review |
| "This SDS file is too large for the automatic check — please review it manually." | Shown with Needs review |
| "This SDS is written for a market outside the EU CLP regulation." | Shown with OK |
| "Revised after June 2015 and labelled with CLP hazard statements." | Shown with OK |
| "The product as a whole is not classified as hazardous; any old codes shown belong to its ingredients." | Shown with OK |

Row actions for **Outdated** and **Needs review** rows:
- **Request Updated SDS**: opens the supplier email for requesting a new SDS for this product. It is shown to the Owner and to Owners, Admins and Admins with approval of the row's location. After you send it, the row shows an **Update requested** chip instead.
- **Upgrade to new version** (or **Approve to new version** if you are the assigned reviewer): appears when a newer version of the SDS exists. You see the changes before you confirm. **Show differences between the two SDS** appears when an upgrade was dismissed earlier. Both are for the Owner or Admin.

### Run messages

| Message | Meaning / what to do |
|---|---|
| "A labelling check is already running. Its progress is shown here." | Someone (or the automatic check) already started a run. Wait for it. |
| "The labelling check has stopped making progress. Run it again to continue." | The run stalled. **Run check** becomes available again and takes the run over. |
| "Nothing to check right now: every SDS in your library has a result or is waiting for an automatic retry." | No new run was needed. |
| "The labelling check could not be completed. Please try again later." | The run failed. Try later. Contact support if it keeps happening. |
| "The labelling check could not be started. Please try again in a few minutes." | Starting failed for a moment. Wait a few minutes and retry. |
| "The labelling check is complete." | Done. The results have been refreshed. |

## Kit Management

A **Kit** is one product made of several components that each have their own SDS, for example Part A + Part B of a two-component adhesive. On screen: "Kits are used when a single product actually consists of several components that belong together (for example, Part A + Part B), where each component has its own Safety Data Sheet (SDS). With the Kit feature you can link the SDS of every individual part directly to the Kit record. This keeps everything organised and compliant while still allowing users to search for both the Kit and its separate components. When users search for a Kit, the system clearly shows that it contains multiple parts."

**Kit Management** (sidebar **More** > **Kit Management**) has a **Create Kit** button and two tabs: **My Kits** and **Available KIT SETs (n)**.

### My Kits tab

- **Search kits**: search by kit name.
- Table columns: **Product Name**, **Supplier Name**, **Location**, **Actions**. Each kit row shows the kit name, and the arrow expands it to show each component SDS with its product name, supplier and location.
- Actions on a kit row: **Edit Kit** (pencil) and **Delete**. For kits tracked as one unit, the kit row also has **Track Usage** and **Print Tracking Usage Label** (QR icon). For kits tracked by component, those two actions are on each component row instead.
- "No KITs have been found" is shown when the list is empty.

### Creating a Kit

1. Click **Create Kit**. The **Chemical Kit Usage Tracking** popup opens.
2. Enter the **Name** (required: "Kit name is required").
3. Optionally enter numbers under **Define Catalog Number / Product Number / Article Number**. Type a number and press Enter to add several ("Press Enter to save multiple number").
4. Choose the tracking method:
   - **Track as Kit**: "Treat and manage the entire kit as one unit."
   - **Track Components**: "Track and manage each part separately."
5. Click **Save**. The **Add Substances to Kit** popup opens.
6. Search your SDS library and tick the component SDSs. The table shows **Product Name**, **Supplier Name**, **Product Code**, **Revision date** and **Location**, and the chosen ones are listed under **Selected SDSs**. At least one is required ("Please select at least one substance").
7. If a ticked SDS belongs to a known kit, a **Suggested SDS Kit** icon appears. It shows the other SDSs of that kit. You can add them to your selection, or add an SDS that is **Not in your library** to a location with **Add to SDS library** ("SDS added to library successfully").
8. Click **Save**: "Kit created successfully".
9. The **Manage Stock** popup then opens to record the initial stock (see "Recording initial stock for a Kit"). You can also do this later with **Track Usage**.

### Recording initial stock for a Kit

The **Manage Stock** popup is titled "<kit name> - Track as Kit" or "<kit name> - Track Components". It has a **Manage SDSs** button to change the components.
- **Type of change**: **Initial amount**.
- **Select stock type**: **Container Stock** or **Batch stock** (the default).
- Fields:
  - **Batch number**: required for Batch stock.
  - **Container Type**: required. Use **Add New Container Type** to add your own.
  - **Measurement Type**: **Volume** or **Weight**.
  - **Measurement unit**.
  - **Container Size** (required) and **Quantity** (required).
  - **Expiry date**: Batch stock only.
- **Total Amount** is calculated as container size × quantity.
- With **Track Components**, these fields are filled in for each component SDS. Error messages then name the component.
- **Save** gives "Kit updated successfully". **Show change log** opens the history.

### Tracking usage of a Kit

Click **Track Usage** on the kit row, or on the component row for component-tracked kits. If the kit has no stock yet, the initial-stock popup opens instead.
1. The header shows **Product**, **Tracking Method** and **Amount**.
2. Choose the **Type of change**: **New arrival**, **Usage** or **Disposal** (**Record disposal**).
3. Select the stock (lot). For **New arrival** you can also create a new **Container Stock** or **Batch stock** lot.
4. Enter the change:
   - **By Weight** / **By Volume** / **By Amount**: an **Amount** ("Amount to add" / "Amount to use"), or
   - **By <container type>**: a **Quantity** ("Quantity to add" / "Quantity to use").
   **Max** fills in the full current amount.
5. Optionally add a **Comment** (up to 1,000 characters).
6. Click **Save**: "Kit updated successfully".
- The selected lot shows its **Batch number**, container and **Current Amount**.
- "Measurement type is locked because this substance already has amount data. New lots must use the same measurement system."
- **Print Tracking Usage Label** prints a QR label for a lot (see "Tracking usage labels").

### Kit change log

**Show change log** opens **Change Log** with **Quantity Change** and **Container Usage** views. It can be filtered by **Start date** / **End date** (**Filter the change log**), columns can be shown or hidden (**Toggle columns**), and **Export CSV** downloads it. Columns include **No.**, **Date of receipt**, **First and last name**, **Action Type** (Initial, New arrival, Usage, Disposal), **Previous balance**, **New balance**, **Batch number** and **Comment**.

### Editing and deleting a Kit

- **Edit Kit** changes the **Name** and the catalog/product/article numbers, and **Manage SDSs** changes the components listed under **SDSs**. The tracking method cannot be changed after creation.
- Changing the SDSs of an existing kit shows a warning: "Changing the Safety Data Sheets in this component kit will permanently erase all existing Safety Data Sheet-related data for the kit. This action cannot be undone." Click **Continue** to go ahead or **Cancel**.
- **Delete** asks: "Are you sure you want to delete "<name>"?" Then: "Kit deleted successfully".

## Available KIT SETs

**KIT SETs** are chemical kits that SDS Manager recognised in SDS booklets uploaded for your company. On screen: "KIT SETs are chemical kits recognised in the SDS booklets uploaded for your company. Add one to create a Kit from the components you already have in the Location you choose."

- **Search KIT SETs** searches the list. Columns: **Product Name**, **Supplier Name**, **Product Code**, **Components**, **Actions**. Expand a KIT SET to see its member SDSs, each with a **View PDF** link.
- Member SDSs that need attention have a chip:
  - "Your company has this SDS, but not in a location you have access to"
  - "Your company has this SDS, but it is archived or not yet approved"
  - "Not in your library — add it to a location"
  - Members already in your library have no chip.
- A KIT SET without a name is shown as **Unnamed KIT SET**.
- **Rename KIT SET** (pencil) sets the **KIT SET name** ("Enter a name for this KIT SET" if empty, "KIT SET renamed" when done). "This does not rename the kit you already created from this KIT SET."

How to add a KIT SET as a Kit:
1. Click **Add** on the KIT SET.
2. **Select the Location where this kit is stored**, then **Continue**.
3. Review the components:
   - **Components found in this Location** will be included.
   - **Components that cannot be added** were not found in that location and are left out. Members you own elsewhere are marked "In your SDS Library, but not in this Location". If nothing was found: "None of the components of this KIT SET were found in the selected Location. Choose another Location, or add the SDS to your SDS Library first."
4. **Continue** to the create-kit popup. The kit name is prefilled from the KIT SET, and you can edit it. Then confirm the components and save.
5. For **Track as Kit**, the initial-stock popup follows. Component-tracked kits get their stock per component from the Kit Management row.

Once a KIT SET has been added, its row shows **Added** and an **Open Kit** button. **Open Kit** jumps to that kit in **My Kits** with the note "Showing one kit — the one this KIT SET was added as." and a **Show all kits** link.

## Kits in a location's SDS list (Kits switch)

If your company has KIT SETs, a **Kits** switch appears above a location's SDS list on desktop. Turning it on shows two groups instead of the normal list:
- **My Kits (n)**: your kits that have at least one component in this location. Kits made from a KIT SET are marked "from KIT SET", with the count "SDS in this kit".
- **KIT SETs (n)**: KIT SETs with members in this location, showing "SDS in this kit" and "in this location". Members not in your library offer **Add to library**.

Empty states: "No kits found", "No kit sets found".

## Kits in Manage Stock

In an SDS's **Manage Stock** dialog, choosing a **New arrival** offers **Kit - product with multiple products**. Here you can **Add to Existing Kit** (**Select Kit**) or **Create New Kit** (name and catalog numbers). This links the arrival to a kit lot. Existing kit lots appear under **Kit Stock** in the stock list. This option is disabled for custom measurement types: "Not available for custom measurement types". See "Stock and amount tracking (Track Usage)" in the topic **SDS library: substances list, SDS details, stock, archive and export** for the rest of Manage Stock.

## Tracking usage labels (QR labels for stock and kits)

A **tracking usage label** is a small label with a QR code that you stick on a container. Scanning it opens stock tracking for that product or batch, so users can record usage quickly.

Where to print one:
- **Manage Stock** dialog of an SDS > **Print Tracking Usage Label**. In **Select stock to print**, choose **General Stock**, one batch/lot, a kit lot, or **Print multiple lots**.
- **Kit Management** > QR icon (**Print Tracking Usage Label**) on a kit (or component) row > **Select stock to print** > choose the lot ("No lots available" if there is none) > **Confirm**. If the kit has no stock yet, the initial-stock popup opens instead.

What is on the label: the product name, **LOT:** the batch number (if any), **EXP:** the expiry date (if any), and a QR code.

What the QR code opens:
- For a substance's stock: the app opens **Manage Stock** for that product, preselecting the lot if the label was for a lot.
- For a kit lot: **Kit Management** opens with **Track Usage** for that kit and lot.
- The person scanning must be able to sign in to SDS Manager.

The **Print Tracking Usage Label** dialog:
- **Print format**: DYMO 30336 (1" × 2-1/8", the default), DYMO 30334 (2-1/4" × 1-1/4"), A4, A5, A6, A7, A8, A9, A10, 74 × 52 mm, 59 × 102 mm, 52 × 105 mm, 50 × 105 mm, 50 × 74 mm, 26 × 52 mm. Your choice is remembered. "Tip: Ensure your printer paper size settings match the selected format."
- **Manual Adjustments**: **Text Size** and **QR Code Size**, each 50–150% in 5% steps, with a reset button.
- Preview tools: **Zoom In**, **Zoom Out**, **Fit Width**, **Fit to Screen & Reset**, **Rotate View**. "Generating Preview..." is shown while the preview is built.
- When printing several lots: **Select lots to print** (**Select all** / **Deselect all**), then **Print {count} labels**. Otherwise **Print Label**. While printing, the button reads **Printing...**.

A standalone page at `/tracking-usage-label` ("Tracking usage label generator") exists but is not linked from any menu. Customers should print tracking usage labels from Manage Stock or Kit Management.

## Batch and lot information on labels

- **Transport labels**: **Lot Number**, **Fill Date**, **Expiration Date**, **Fill Weight**, **Gross Weight**, **P/N** and **Misc** can be added under **Shipped product information**.
- **Secondary container labels**: an **Expiration Date** can be added (date + switch). There is no lot-number field on secondary labels.
- **Tracking usage labels**: the batch number (LOT) and expiry date (EXP) of the selected lot are printed automatically.
- **Kits**: a batch number is required for **Batch stock** lots of a kit ("Batch number must not be blank"). Container Stock lots do not use a batch number.

## Rules, limits and edge cases

- Single-label copies on Avery/Brady sheets: 1–10 or **Fill Page**.
- Bulk: up to 100 copies per SDS and at most 500 labels per print.
- Avery/Brady sheets in the single-label dialog: only for Secondary Container Labels opened from an SDS in your library, on desktop.
- Bulk printing: the SDS selection is made from location SDS lists. The add icon is hidden on mobile and for rows without an SDS file.
- Hazard statements: not on A9, 26x52 mm, A10, Avery 5160, Avery 60517, Avery L7912 or Avery L7911.
- Ingredients: A4, A5, A6 and custom sizes only.
- Icon captions are forced off on 24- and 30-per-sheet Avery sheets.
- In bulk on a sheet, a saved layout must fit inside one cell (±0.5 mm tolerance). On plain paper it must fit the page minus the margins, otherwise "This label is larger than the page (minus margins). Pick a bigger page size or a smaller label." is shown.
- UFI, REACH registration number and EUH statements print only if the SDS contains them. They are off by default, and older saved layouts keep them off.
- **Attachment QR on Label** is a per-product public link, not a layout setting. Turning it off breaks QR codes on labels already printed.
- Labels are printed in the SDS's language. The language selector in the public view changes only the dialog text.
- Labelling compliance counts SDS rows in the selected location. Search and the newer-version toggle do not change the cards.
- Labelling compliance only covers SDSs in use (not archived) that have an SDS document. **Not yet checked** means no result yet.
- A Kit's tracking method (**Track as Kit** / **Track Components**) cannot be changed in **Edit Kit**.
- Kit stock does not support custom measurement types (count-based units). Only volume and weight units are used.

## Messages and errors users may see

| Message (exact text) | Meaning | What to do |
|---|---|---|
| This feature is not available on your current subscription plan. | Your plan does not include label printing (or Labelling compliance). | Upgrade, or contact SDS Manager sales. |
| This action is not allowed. Please contact your administrator. | A QR-code user tried to print a label but the Owner has not allowed it. | Ask the Owner to turn on **Allow QR users to print labels**. |
| Hazard statements do not fit a label this size. | The chosen size is too small for statements. | Pick a larger size or a custom size. |
| Error fetching label images. Please try again later. | PNG images (or bulk layout images) could not be generated. | Retry. In bulk, click **Retry**. |
| Error fetching label generator info | A public label link could not be loaded. | Check the link, or ask the sender for a new one. |
| Too many labels to print at once (max 500). Reduce the number of copies or selected SDS. | Bulk print limit reached. | Lower the copies or the number of selected SDSs. |
| No saved layouts fit this sheet size | No saved layout is small enough for the sheet's cells. | Use **Standard label**, or design a smaller custom layout. |
| This label is larger than the page (minus margins). Pick a bigger page size or a smaller label. | The plain-paper layout doesn't fit. | Choose a bigger page, smaller margins, or a smaller layout. |
| Select a saved layout to tile on plain paper | No layout chosen for plain paper yet. | Choose a page size / layout. |
| Select a saved transport label layout to print transport labels. | Transport bulk printing needs a layout. | Choose a layout or page size. |
| Custom size must be at least 8 pixels | The custom icon size is too small. | Enter a larger value. |
| This product has no attachments | **Attachment QR on Label** cannot be turned on. | Add attachments to the product first. |
| Could not load the current status — reopen this dialog to try again | The attachment-QR status failed to load. | Close and reopen the dialog. |
| Public access to attachments has been turned off. QR codes on previously printed labels will no longer work. | Attachment QR was switched off. | Reprint labels if you turn it on again later. |
| Missing Transport Information | The SDS has no usable Section 14 data. | Choose Not Regulated, enter label-only transport data, or edit Section 14. |
| Kit name is required | No name was entered. | Enter a kit name. |
| Please select at least one substance | No SDS selected for the kit. | Tick at least one SDS. |
| Batch number must not be blank / Container type must not be blank / Container size must not be blank / Quantity must not be blank | A required stock field is empty (for component kits, the component is named in brackets). | Fill in the field. |
| Please select a lot | No lot was chosen for usage. | Select the stock/lot. |
| Usage amount is required / Usage quantity is required | No amount was entered. | Enter the amount or quantity. |
| Amount cannot be negative / Quantity cannot be negative | A negative number was entered. | Enter a positive number. |
| Error creating kit / Error initializing kit lot | The server could not save. | Retry. Contact support if it persists. |
| Enter a name for this KIT SET | Rename with an empty name. | Enter a name. |
| None of the components of this KIT SET were found in the selected Location. ... | The chosen location has none of the kit's SDSs. | Choose another location or add the SDSs first. |
| Labelling compliance run messages | See "Run messages" in the Labelling compliance section. | — |

## Frequently asked questions

Q: How do I print a GHS label for a bottle I filled from the original container?
A: Open the SDS in your location's SDS list and click **Print Label**. Keep **Label type** on **Secondary Container Label**, choose a size in **Print format** (A6 is the default), adjust **Content display** if needed, then print or download from the preview. Click **Save label layout settings** if you want to reuse the setup.

Q: What information is printed on a secondary container label?
A: Always the product name and company name. By default it also shows the GHS pictograms, signal word, hazard and precautionary statements (if the size allows), PPE icons with captions, a QR code to the SDS, the ingredients (A4–A6 and custom sizes), supplier name and address, emergency phone and contact, and a colored top bar. Company logo, UFI, REACH registration number, EUH statements, expiration date and attachment QR are optional and off by default.

Q: Can I make a label in my own size?
A: Yes. In **Print format**, choose **＋ Create new custom label** and enter the width, height (mm or in) and margin. Choose **Fit to label** to shrink everything onto one label, or **Allow multipage** to keep the font size and continue long text on extra labels. Save it as a layout to reuse it.

Q: Which Avery or Brady label sheets are supported?
A: Avery 5164/5264, 6573, 5255, 5292, 5163/8163/60505, 5160, 60506, 60503 and 60517, DuraLabel Pro 300 and Brady BBP31. The European A4 sheets Avery L7173/B7173, L7913/B3427, L7912 and L7911 are also supported. The smallest sheets (5160, 60517, L7912, L7911) have no room for hazard statements.

Q: How do I print labels for many products at once?
A: In a location's SDS list, click the **Add to print Avery/Brady label** icon on each SDS. Then click the **Print Avery/Brady label** button that appears with a counter. In **Print Multiple SDS Labels**, choose the label type, a sheet or plain-paper size, copies and optionally a saved layout, then **Print Label**. Up to 500 labels can be printed in one go.

Q: My label sheet is half used. Can I start printing further down?
A: Yes. In both the single-label sheet mode and the bulk dialog, click the cell where printing should start ("Click a cell to choose where printing starts"). Labels are then placed from that cell onwards.

Q: The PDF doesn't print correctly on my label printer. What can I do?
A: Make sure the printer's paper size matches the label format. If it still fails, click **Click to generate .png file instead of .pdf** under the preview ("Is this PDF not compatible with your printer?") and print the PNG image(s) instead.

Q: How do I make one label layout the default for everyone?
A: The account Owner sets up the label, clicks **Save label layout settings**, ticks **Share layout within our organization** and **Make this layout default for our organization**, then saves. Each user's own last-used layout still comes first when they reopen the dialog. The default applies when they have none.

Q: Why does the hazard statement option look greyed out?
A: The chosen label size is too small for statements ("Hazard statements do not fit a label this size."). This applies to A9, A10, 26x52 mm and the smallest Avery sheets. Choose a larger size or a custom size, and your previous choice is restored.

Q: Can the label show the hazard statements exactly as written in the SDS?
A: Yes. Choose **From Pdf** under **Hazard statements**. **Standard** uses the standard statement wording instead, and **Hide** leaves statements off. With **From Pdf** selected, the pencil opens SDS Section 2 so you can correct the text.

Q: What is a Transport Label and what if the SDS has no transport data?
A: A Transport Label is a GHS shipping label with transport data from SDS Section 14 (UN number, proper shipping name, hazard class), plus optional shipped-product details such as lot number and fill weight. If Section 14 has no clear data, a popup lets you mark the product **Not Regulated as Dangerous Goods**, enter transport data for this label only, or edit Section 14.

Q: What does "Attachment QR on Label" do and is it safe?
A: It prints a QR code that opens all the product's attachments without login. Turning it on makes those attachments public to anyone with the code or link, so you must confirm first. You can turn it off at any time, but QR codes already printed then stop working. Only the Owner, Admin and Admin Light roles can change it.

Q: Can QR-code users print labels?
A: Only if the Owner has turned on **Allow QR users to print labels**. The Owner can also set each label field to Disable, Show/hide only or Editable for QR users. QR users can never change data stored on the SDS (PPE icons, pictograms, NFPA/HMIS) and cannot save layouts.

Q: What does Labelling compliance check?
A: It looks for SDSs that still use pre-CLP hazard labelling: the old orange danger symbols and R- and S-phrases. Each SDS gets a status: **Outdated**, **Needs review**, **OK** or **Not yet checked**. Hover the status to see which symbols and phrases were found and in which section. Outdated SDSs should be replaced with a CLP version from the supplier.

Q: Why can't I see Labelling compliance in my menu?
A: The system enables it per customer. It requires a role that may use SDS compliance and a paid Pro or Enterprise plan in a country that uses EU CLP; SDS Manager can also enable it. On other plans you get the upgrade popup. Read only, No Access, Staff and QR-code users never see it. Contact SDS Manager support or sales if you believe you should have access.

Q: I clicked Run check and left the page. Did it stop?
A: No. The check runs on SDS Manager's servers and continues while you are away. When you return, the page shows the progress again. SDSs added later are also checked automatically.

Q: Why do the progress numbers differ from the card counts?
A: The progress counts distinct SDS documents. The cards count SDS rows in your library for the selected location, so one document used in several places counts once in the progress but several times in the cards. The cards also ignore search and the newer-version filter.

Q: How do I fix an Outdated SDS?
A: If a newer version exists, use **Upgrade to new version** on the row (Owner/Admin). Otherwise click **Request Updated SDS** to email the supplier. The row then shows **Update requested**. The **Only SDSs with a newer version** filter shows the ones you can upgrade straight away.

Q: What is the difference between a Kit and a KIT SET?
A: A Kit is your own record that groups the SDSs of one multi-part product and tracks its stock. A KIT SET is a kit that SDS Manager recognised in SDS booklets uploaded for your company. You can turn a KIT SET into a Kit with **Add**, choosing the location where the kit is stored.

Q: Should I choose Track as Kit or Track Components?
A: Choose **Track as Kit** if you use and count the kit as one unit. Stock and usage are then recorded on the kit row. Choose **Track Components** if the parts are used separately. Each component then has its own stock, usage and QR label. The choice cannot be changed later in **Edit Kit**.

Q: How do I print a QR label for a kit or a batch so staff can record usage?
A: For a kit, click the QR icon (**Print Tracking Usage Label**) on the kit or component row in **Kit Management**, then choose the lot. For a single chemical, open **Manage Stock** and click **Print Tracking Usage Label**. The label shows the product name, LOT and EXP, and scanning it opens stock tracking for that lot (sign-in required).

Q: Can I put a batch or lot number on a GHS label?
A: On a **Transport Label**, yes: fill in **Lot Number** (and optionally fill date, expiration date and weights) under **Shipped product information**, then click **Save**. Secondary container labels have an **Expiration Date** option but no lot-number field. Tracking usage labels print the lot number automatically.

Q: Can I print NFPA or HMIS labels?
A: Yes, for customers in the US or Canada. Use ⋮ > **Print NFPA label** or **Print HMIS label**, set the hazard levels, click **Continue**, optionally add a description, then **Print Label**. NFPA/HMIS can also be added to the secondary container label.

## Related topics

- **SDS library: substances list, SDS details, stock, archive and export** — SDS details, SDS compliance / Hazardous substances, stock, batches/lots and usage logging, product attachments
- **Glossary, GHS hazard reference data and accessibility in SDS Manager** — Section 2 hazard data, pictograms, PPE icons, HMIS/NFPA
- **Locations, QR codes and employee access to SDS** — locations and location SDS lists, QR posters and QR-code users
- **Login & Account Security, Users, Roles & Permissions, and Organization Settings** — QR-code user settings in User management
- **Keeping SDS up to date: newer versions, SDS update requests to vendors, vendor inbox and SDS Quality** — newer SDS versions and **Request Updated SDS** (supplier emails)
- **Adding, finding and importing SDS (getting SDS into the library)** — uploading SDS binders/booklets (source of KIT SETs)
- **Plans, Free Trial, Sign-up, Billing and Subscription** — subscription plans and upgrades
