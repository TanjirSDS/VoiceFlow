# SDS Manager Knowledge Base: index and answering rules

> Summary: This is the product knowledge base for SDS Manager. It was written from the SDS Manager web application (the "SDS Inventory Manager") as it stood on 23 October 2026. It has 13 topic documents that together cover every customer-facing screen, feature, setting, status and message in the app. Read this index first. It tells you which topic answers which kind of question, the rules for answering accurately, and the few facts the app states inconsistently.

## What SDS Manager is

SDS Manager is a web application, with companion mobile apps, for building and maintaining an organization's Safety Data Sheet (SDS) library and chemical inventory. It gives employees instant access to SDSs through QR-code posters, links and an offline app.

Around the SDS library sit compliance tools:
- SDS update tracking and update requests to vendors
- restricted-substance checks
- chemical risk assessments, job procedures (COSHH assessments in the UK) and an exposure register
- substitution, PPE approval and disposal classification
- GHS labels and labelling compliance
- kits, reports and the Danish APB

For chemical suppliers there is a separate **SDS Distribution** module (eCommerce / DirectSDS) with a customer SDS portal.

## Topic index: which document answers what

| # | Topic | Use it for questions about |
|---|---|---|
| 01 | SDS Manager: product overview, navigation, Dashboard and getting started | What the product is, the modules, every menu item and where it is, the Dashboard, trial setup progress, Go live checklist, Inspection Readiness, mobile app, help and support channels, languages and regions |
| 02 | Plans, Free Trial, Sign-up, Billing and Subscription | Plans and what each unlocks (feature-gating matrix), the free trial, buying, upgrading, downgrading, stopping renewal, card vs invoice payment, VAT, SDS package size, billing messages |
| 03 | Login & Account Security, Users, Roles & Permissions, and Organization Settings | Every sign-in method (password, login link, login code, SSO, Google, 2FA, QR posters), password reset, account deletion, sign-in errors and cooldowns, inviting users, organization and location roles (role matrix), ownership transfer, every Settings switch |
| 04 | Adding, finding and importing SDS (getting SDS into the library) | Global SDS search, uploading PDFs/ZIPs/binders/links, photographing labels, barcodes, manual entry, product-list import (Excel/CSV), Import status, products awaiting SDS, Find SDS, close-match approval, upload limits |
| 05 | SDS library: substances list, SDS details, stock, archive and export | Library views and columns, filters, the SDS details page, statements and pictograms, stock and usage tracking, archive/hide/discontinue/delete, export, reporting a problem with an SDS |
| 06 | Keeping SDS up to date: newer versions, SDS update requests to vendors, vendor inbox and SDS Quality | Newer-version detection, compare and upgrade, dismiss reasons, vendor contacts and update requests, vendor inbox, the inbound SDS email address, Unverified SDS, Pending Tasks, SDS Quality scores |
| 07 | Locations, QR codes and employee access to SDS | Location tree, creating/moving/archiving locations, copying or moving SDS between locations, location roles in practice, QR posters and intranet links, what employees see when they scan, QR users, SDS requests from employees |
| 08 | Labels, labelling compliance, kits and usage tracking | Secondary container and transport labels, sizes and label sheets, label content options, saved layouts, bulk printing, NFPA/HMIS, Labelling compliance (old pre-CLP labels), kits and KIT SETs, tracking-usage labels, lots/batches |
| 09 | Chemical risk assessment, PPE approval, disposal classification and substitution | Risk assessment workflow and calculation method, health/safety/environment ratings, risk categories and colours, approval and revisions, AI Suggest, printing, PPE Approval, Disposal Classification, Substitutions |
| 10 | Job procedures (job hazard analysis, COSHH assessments, 7-point risk assessments) and chemical work instructions | Creating job procedures, steps, substances, PPE, locations and people, risk before and after controls, approval rules, revisions, review intervals, reports and summaries, My job procedures |
| 11 | Exposure register, reports (incl. Tier II) and Danish APB | Recording exposures (chemical, asbestos, biological, radiation, mining), measurements and units, My Exposures, the Reports menu, Use & disposal report, Tier II alerts, Danish APB workplace instructions |
| 12 | SDS Distribution for suppliers (eCommerce / DirectSDS), the customer SDS portal, and integrations | Supplier SDS distribution via API, end customers, sent emails, version-update subscriptions, coverage gaps, SKU conflicts, website search widget, customer SDS portal, eCommerce API key, SafetyCulture integration, MCP Server Access |
| 13 | Glossary, GHS hazard reference data and accessibility in SDS Manager | Definitions of ~110 terms (SDS, GHS, CLP, H/P/EUH statements, CAS, UFI, REACH, KIT SET, close match…), GHS pictograms and signal words, H/S/E 1–5 ratings, disposal badges, HMIS/NFPA, safety-sign icons, units, the accessibility statement (WCAG 2.2 AA) |

If a question spans topics, for example "can a Staff user approve a risk assessment on the Premium plan?", combine the feature topic with topic 02 (plans) and topic 03 (roles).

## Rules for answering with this knowledge base

1. **Use the on-screen names.** Bold names in these documents are exactly what users see, such as **Manage SDS Library**, **Employee Access** and **Sites & Locations**. Use them when directing someone to a screen.
2. **Never state prices.** Prices, discounts and quotes are not in the app's screens; they are calculated by SDS Manager at checkout. Point pricing questions to the subscription page in the app or to sales at sales@mail.sdsmanager.com.
3. **Plans and roles change answers.** Many features depend on the customer's plan (Free, trial, Basic, Premium, Pro, Enterprise, or an eCommerce plan) and on their role at organization and location level. If the answer depends on these and you don't know them, ask, or explain how it differs per plan or role.
4. **Respect the hedges.** Where a document says "Not specified in the application; confirm with SDS Manager support/sales", the fact is decided by SDS Manager's servers or commercial terms and is not visible in the app. Say so plainly and offer the support route. Do not fill the gap with a guess.
5. **No legal advice.** SDS Manager helps organizations organise SDSs and run compliance tasks. Describe what the product does; do not tell a customer they are legally compliant.
6. **Support channels.** General support: support@sdsmanager.com, the in-app **Guides & Help** panel on the Dashboard, the live chat bubble shown on some pages, and the help center at faq.sdsmanager.com. Sales and payment-method changes: sales@mail.sdsmanager.com. Accessibility barriers: support@sdsmanager.com.
7. **Internal tools are out of scope.** Some pages exist only for SDS Manager staff. Customers cannot use them, and this knowledge base does not describe them.

## Facts the app states inconsistently (answer with both values)

These are genuine inconsistencies in the application text. Until SDS Manager resolves them, give the answer as written here.

- **Size of the global SDS database.** The Global SDS Search page says "16 million+" and the Dashboard search says "18 million+". Answer: "more than 16 million SDSs (some screens say 18 million+)".
- **Migration of an existing SDS library from another system.** The Dashboard says both "typically completed within one business day" and "within 5–7 business days". Say that the app quotes both figures and that SDS Manager confirms the timeline for each migration.
- **Meaning of APB.** In Danish, APB is *arbejdspladsbrugsanvisning* (workplace instruction). One tooltip in the app expands it as "Accident Prevention Book", which is a wording error. Use *arbejdspladsbrugsanvisning*.
- **Trial length.** Trial screens say 30 days, and a trial reset offers "another 7 days". The actual trial length for an account is set by SDS Manager and can differ.

## Source and scope of this knowledge base

- Written from the SDS Manager web application source as of 23 October 2026, by reading every screen, menu, popup, message and permission check. The repository was only read, never modified.
- What it cannot cover: prices, exact plan entitlements, and rules enforced only on SDS Manager's servers (for example, some limits and permissions). Those are hedged in the topic documents.
- Feature plans and design documents were used only as hints. A feature is described here only if it exists in the shipped application.
