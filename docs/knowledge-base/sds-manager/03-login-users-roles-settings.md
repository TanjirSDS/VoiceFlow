# Login & Account Security, Users, Roles & Permissions, and Organization Settings

> Summary: This section covers how people get into SDS Manager (password, emailed login link, emailed 6-digit login code, Enterprise SSO, Google, two-factor authentication, QR posters for employees), how passwords are reset and accounts deleted, and every sign-in error and cooldown. It also covers how an organization manages its people: inviting users, the organization-level roles (Owner, Admin, Admin Light, Staff, No Access) and the per-location roles (Admin with approval, Admin, Admin Light, Staff, Read only, No Access), deactivating and deleting users, and transferring ownership. Finally it explains the personal **Account settings** page, the **Organization profile** page and the organization-wide **Settings** page, including what every switch does. It is written for customers, prospects and SDS Manager staff who need accurate answers about access and security.

## Where to find it

| What | How to get there | Who sees it |
|---|---|---|
| **Sign in** page | The login page of the web app (URL path `/login`). Shown automatically when you are not signed in. | Everyone |
| **Account settings** (your own profile, password, 2FA, notifications) | Click your avatar (top-right corner) → **Manage account**. Page title: **Account settings** (URL path `/account`). | Every signed-in user except QR-poster (employee) sessions |
| **User management** | Sidebar **More** → **User management**, or avatar menu → **User management** (URL path `/administration/user-management`). The page heading reads **Manage Location Access**. | Owner and Admin only |
| **Invite members** | Sidebar **More** → **Invite members**, or avatar menu → **Invite members**. Opens the **Invite colleague** popup. | Owner and Admin only |
| Per-user location access | Click a user row in **User management**, or row menu → **Edit location access**. Page title: **User location access**; heading **Manage Location Access**. | Owner and Admin |
| **Organization profile** | Sidebar **More** → **Organization profile**, or avatar menu → **Organization profile** (URL path `/administration/organization`). | Owner only |
| **Settings** (organization-wide switches, SSO, approval flow, inbound SDS email, integrations) | Sidebar **More** → **Settings**, or avatar menu → **Settings** (URL path `/administration/setting-function`). | Users whose role grants access to the Settings page; never shown in a QR-poster session |
| **Employee Access** (QR posters, intranet link) | Sidebar → **Employee Access**. Covered in the topic **Locations, QR codes and employee access to SDS**. | Owner and Admin |
| **Delete Account** page | Reached by URL (path `/delete-account`); there is no menu link to it inside the web app. | Anyone with an account email |
| **Logout** | Avatar menu → **Logout**. | Everyone |

The avatar menu also contains **Subscription**, **Go live checklist**, **Import product lists**, a **Language** selector, and (only when you have no password yet) **Set Password**.

## Plan and permission requirements

How access is decided in the application:

- Every user has one **organization role** (Owner, Admin, Admin Light, Staff, No Access; "Read only" also exists in the system) and, separately, a **role per location** (Admin with approval, Admin, Admin Light, Staff, Read only, No Access).
- The exact list of permissions attached to each role, and the list of features included in each subscription plan, is sent to the app by SDS Manager's servers. The app then shows or hides menus and buttons. The tables in this section reflect what the app's screens enforce. Anything not listed here is "Not specified in the application; confirm with SDS Manager support/sales."
- When a feature is not in your plan, clicking it usually opens an upgrade popup: "This feature is not available on your current subscription plan." (or "...on your current trial plan."), with "You need to upgrade to <plan> plan to use this feature."

Plan or add-on dependent items in this topic:

| Feature | Requirement shown in the app |
|---|---|
| Two Factor Authentication switch | Visible to Owner, Admin and Admin Light. Turning it on needs the plan feature for two-factor authentication. Without it, the upgrade popup appears. |
| Enterprise SSO (Single Sign-On settings, "Require SSO login only") | Needs the SSO add-on on your account. Without it, the **Single Sign-On (SSO)** section does not appear in Settings. At sign-in the error is "Your SSO subscription is missing, expired, or inactive." |
| IP restrictions for QR-login users | IP Restriction add-on (see the topic **Locations, QR codes and employee access to SDS**). |
| MCP Server Access / Chat AI Agent | Needs the plan feature for the AI agent. Otherwise the upgrade popup appears. |
| **Integrations** (API key) in Settings | Owner only, and only on Inventory **Pro** or **Enterprise** plans (or accounts with SDS Distribution/eCommerce enabled). On other plans the section is simply not shown. |
| **Automatically update SDS to new versions** | Turning it on needs the plan feature for newer-version data; otherwise the upgrade popup appears. |
| **AI functions on risk assessment** | Turning it on needs the Risk assessment feature. |
| **Private restricted list** and **Exposure** sections in Settings | Shown only if your plan includes Hazardous substances and Exposures, respectively. |
| QR login column / "Allow user to sign in using a QR code" | Needs the plan feature for printing QR codes. |
| Automatic SDS Translation | Add-on switched on only by SDS Manager (shown read-only in Settings). On a trial, translation buttons show "Autotranslation is only available on paid Pro/Enterprise plans". |
| Billing block on Organization profile | Trial/free accounts see a billing-address form; paid accounts see billing information. Covered in the topic **Plans, Free Trial, Sign-up, Billing and Subscription**. |

Who can open the administration pages (from the app's menu rules):

| Page | Owner | Admin | Admin Light | Staff | Read only / No Access |
|---|---|---|---|---|---|
| Account settings | Yes | Yes | Yes | Yes | Yes |
| User management, Invite members | Yes | Yes | No | No | No |
| Employee Access | Yes | Yes | No | No | No |
| Organization profile | Yes | No | No | No | No |
| Subscription (sidebar) | Yes (not on child accounts managed by a parent organization) | No | No | No | No |
| Settings | Shown if your role includes Settings access. Which roles have it is not specified in the application. Changes to organization-wide switches are saved for the Owner (see the Settings section). | | | | |

## Signing in: overview of all login methods

The **Sign in** page ("Welcome to SDS Manager") offers:

1. **Email address** + **Password** → **Sign in with email**. A **Forgot your password?** link sits under the password field. The eye icon shows or hides the password.
2. "Or", then **Email me a login link** (magic link, no password).
3. **Email me a login code** (6-digit code, no password).
4. **Sign in with Enterprise SSO** (your company's identity provider, for example Microsoft Azure AD).
5. **Sign in with Google**.
6. "Don't have an account? **Create an account**". This opens the SDS Manager website sign-up. New trial accounts are set up through the website and the dashboard onboarding, not through a separate in-app form.

Other ways in:

- **Two-factor authentication**: if it is on for the account, a 6-digit code is emailed after the password step.
- **QR posters (employees)**: scanning an Employee Access poster opens a read-only session without a password. Covered in "QR code sign-in for employees (QR posters)" in this topic and in the topic **Locations, QR codes and employee access to SDS**.
- **Invitation / registration links** from emails sign the user in directly.

The **Sign in with email** button stays disabled until both fields are filled in. If you are already signed in and open the login page, you are taken straight to the app (or to the page you were trying to reach).

## Sign in with email and password

Steps:
1. Enter your **Email address** and **Password**. The email is not case-sensitive (it is lower-cased before sending).
2. Click **Sign in with email**.
3. What happens next:
   - If two-factor authentication is on, a code is emailed and you go to the code page (see "Two-factor authentication (2FA) at sign-in").
   - If your organization has no SDS Manager Inventory subscription, you see "No Inventory subscription found".
   - If the subscription has expired, the **Owner** is signed in and taken to the **Subscription** page to renew. Everyone else sees "Could not log in due to expired subscription. Please contact your administrator for renewal."
   - Otherwise you land on the dashboard, or on the page you originally requested.

A wrong password, a locked account and similar refusals show the server's own message under the form. The app shows that text exactly as received. If the account was deactivated by an administrator, the message is "Your account has been deactivated. Please contact your administrator."

A user created by invitation or login link may not have a password yet. For such users the avatar menu shows **Set Password**, and a "Set password here" hint can appear on the dashboard. Users who signed up with Google do not see the hint.

## Email me a login link (magic link)

Use this when you do not know or do not want to use your password.

1. On **Sign in**, click **Email me a login link**. The email you typed is carried over.
2. The page says "We will send you an email with a login link that will log you in right away."
3. Click **Send link**.
4. Confirmation: "Check your email to log in", "We sent your login link to <your email>", and "For your security, this link expires in 15 minutes." Click **OK** to return to the sign-in page.
5. Open the email and click the link. The **Signing in** page logs you in and opens the app.

Notes:
- If the link has expired, a popup titled **Confirm registration link** says "This link has expired. Redirecting to login page in 5 seconds." It also has a **Go to Login page** link. Request a new link.
- If the link is broken or incomplete, the message is "The login link has expired. You now have to log in using your email and password. Press "Recover" to set password." Use **Forgot your password?** to set a password.
- Requesting too many links in a short time triggers a cooldown: "Too many requests. Please try again later." with "Too many attempts. Try again in MM:SS", and the **Send link** button stays disabled until the timer ends. Changing the email address clears the message.

## Email me a login code (one-time code)

1. On **Sign in**, click **Email me a login code**.
2. The page says "We will send you an email with a 6-digit login code that you can use to sign in." Click **Send code**.
3. If the email belongs to an account, you go to **Verify login code**: "We sent a 6-digit code to <masked email>. Enter it below to confirm your account." If no account exists, the page stays put and says "If an account exists, a code was sent to your email". The app never reveals whether an email is registered.
4. Type the 6 digits. The code submits automatically when all 6 digits are entered, or you can click **Verify**.
5. A countdown "Code expires in MM:SS" shows the remaining validity (normally 5 minutes). When it reaches zero the text changes to "Code has expired".
6. "Didn't receive it? **Resend code**" sends a new code ("A new code has been sent to you"). After a resend you must wait at least 60 seconds before the next one; the remaining time shows in brackets.

The same subscription checks as password login apply after a correct code. Too many requests show "Too many requests. Please try again later." A wrong or stale code shows the server's message. If the request is no longer valid, you are sent back to the sign-in page.

## Sign in with Enterprise SSO

For organizations that have the SSO add-on and have configured their identity provider (see "Single Sign-On (SSO) configuration" under Settings).

1. On **Sign in**, click **Sign in with Enterprise SSO**.
2. The **Sign in with Enterprise SSO** page says "Enter your work email. We'll check if your organization uses single sign-on and redirect you."
3. Enter your work email and click **Continue with SSO**.
4. You are redirected to your company's sign-in page (for example Microsoft). After a successful login you come back signed in to SDS Manager.
5. If your account does not exist yet and your Owner enabled "Automatically create new users with role", an account is created on first SSO login with the configured role.

Messages on the request page:
- "This account doesn't use single sign-on (SSO)." The email is not set up for SSO. Use password, link or code instead.
- Some accounts get a server message asking them to set a password, plus a link **Click here to set your password.** Clicking it emails a password-reset link. A popup **Check your email** says "We've sent a password reset link to <email>. Please check your inbox and follow the instructions to set a new password." (button **Got it**).
- If password-reset requests are throttled, a countdown "Too many attempts. Try again in MM:SS" appears.

If SSO fails on the way back, the page shows **SSO Login Failed** with a reason and a **Go to Sign in** button. All reasons are listed in "Messages and errors users may see". A link that was already used shows "This sign-in link has expired or has already been used. Please sign in again." Each SSO return link works only once.

## Sign in with Google

Click **Sign in with Google** and choose your Google account. If you cancel or Google refuses, the sign-in page shows "Google Login Denied". The Google button sends you through SDS Manager's sign-up/sign-in process on the website. Whether a new Google user gets an account automatically is not specified in the application; confirm with SDS Manager support/sales.

## Two-factor authentication (2FA) at sign-in

What it is: an extra email check at every login. The account settings tooltip says: "When enabled, you will receive a verification code via email each time you log in. You must enter this code to complete the login process. Note: this method uses email-based verification — the code is sent to your registered email address."

At sign-in:
1. Enter email and password and click **Sign in with email**.
2. A 6-digit code is emailed automatically and the **Verify code** page opens: "We sent a 6-digit code to <masked email>…"
3. Enter the code. It submits automatically, or click **Verify**. The code is valid for about 5 minutes ("Code expires in MM:SS").
4. **Resend code** sends a new one; wait at least 60 seconds between resends.

If the code could not be sent (resend cap reached, too many requests from your network), you stay on the sign-in page with the reason and a countdown. The resend cap counts per account: if you switch to another email address the countdown clears. The cap documented in the application is 5 codes per 5 minutes, 15 per hour and 50 per day. The server enforces it and may change it.

How to turn 2FA on or off is described under "Security" in "Account settings page (Manage account)".

## QR code sign-in for employees (QR posters)

Employees who only need to read SDSs do not need personal accounts. An Owner or Admin creates a QR poster (a "QR-login user") on **Employee Access**. Anyone scanning it gets read-only access to the SDSs that poster allows. That setup is covered in the topic **Locations, QR codes and employee access to SDS**. The sign-in behaviour:

- Scanning the poster opens SDS Manager and exchanges the poster for a session that lasts about 1 day (the length is not shown on screen), then opens **All my SDSs**. When the session expires, scan the poster again.
- A QR session cannot open the dashboard, Account settings, Settings or other admin pages. The sidebar shows an **Admin** item. Clicking it opens "Read-only account reminder": "This is a read-only account. To perform administrative tasks, please log out (below) and sign in with an Admin account."
- If the poster was revoked or deleted: "This QR code is no longer valid. Ask your administrator for a new QR code."
- If the organization's account is deactivated: "This account has been deactivated. Please contact support for assistance."
- If the organization's subscription expired, QR users are sent to a **Service unavailable** page: "Your company does not have an active subscription for this service."
- The in-app scanner page (**Scan QR code to log in**) only accepts SDS Manager login QR codes. Any other code shows "QR code rejected: only same-origin login URLs are allowed."
- If the library cannot load during a QR session: "Could not load your SDS library right now. Please try again, or re-scan the QR code."

## Continuing on your phone (QR handoff from the desktop)

Some desktop features (for example adding a product by taking a picture, or scanning an SDS binder) show a QR code you scan with your phone to continue there while signed in. If that one-time link is too old, the login page says "Your sign-in link has expired. Please scan the QR code again." If the server is temporarily unreachable: "Oops! Something went wrong. Cannot reach the server. Please try again later." If the desktop cannot create the link: "Error getting session URL".

## Forgot password, reset password and set password

Reset a forgotten password:
1. On **Sign in**, click **Forgot your password?**
2. **Reset Password** page: "Enter you email address, and we'll send you a link to change your password". Enter your email and click **Request password reset**.
3. The page then says "You will receive an email if this email is found in our system". Button: **Okay, take me back**. For privacy, the same message appears whether or not the email exists.
4. Open the email and click the link. The **Set new password** page opens with a **Password** field and the password requirements list. Click **Set Password**. The page also shows the Terms of Service and Privacy Policy links.
5. If the link includes your email, you are signed in automatically after setting the password. Otherwise you are sent to the sign-in page.

Notes:
- Repeated reset requests can be throttled: "Too many attempts. Try again in MM:SS".
- An invalid or expired reset link shows the server's error. A malformed link shows "URL is incorrect".
- If the new password does not meet the rules: "Ensure that new password meets all the listed requirements". The failing rules turn red and shake.

Change or set a password while signed in: see "Security" in "Account settings page (Manage account)".

## Password requirements

Shown on **Set new password** and in **Account settings → Security** under **Password requirements** (toggle **Show password requirements** / **Hide password requirements**):

| Rule | Text on screen |
|---|---|
| Length | At least **10 characters** |
| Upper case | At least **one uppercase letter (A-Z)** |
| Lower case | At least **one lowercase letter (a-z)** |
| Digit | At least **one number (0-9)** |
| Special character | At least **one special character (!@#$%^&*)** |

Each rule turns green when met. Leading and trailing spaces are trimmed. Password expiry or reuse rules are not specified in the application.

## Invitation, registration and account-migration links

- **New user invitation**: when an Owner or Admin adds a user, SDS Manager emails an invitation ("Invitation sent successfully"). The link signs the user in directly. A user with no password yet is prompted later to set one (**Set Password** in the avatar menu).
- **Expired invitation / registration link**: popup **Confirm registration link**, "This link has expired. Redirecting to login page in 5 seconds.", with **Go to Login page**.
- **User already registered in another organization**: the invite becomes an account-migration invitation. The inviter sees "This user is already registered under another account. A migration invitation has been sent — the recipient will be asked to confirm migrating to your organization." The recipient opens **Account migration invitation**: "You've been invited to join <company>", **Invited by**, **Organization**, **Role**, and the warning "By accepting this invitation, your current account under <old company> will be deactivated and you will be transferred to the new organization. If your current organization has no other users, it will be archived." Buttons **Accept Invitation** / **Decline**. Accepting continues to a set-password step. Declining shows "Invitation Declined — No changes were made to your account." Expired: "Invitation Expired — This invitation has expired or is no longer valid. Please contact the person who invited you to request a new invitation."

## Sign-in cooldowns and rate limits

SDS Manager limits repeated sign-in attempts. Where the limits apply and what users see:

| Situation | What the user sees | Scope |
|---|---|---|
| Too many password sign-ins | "Too many requests. Please try again later." plus "Too many attempts. Try again in MM:SS". **Sign in with email** stays disabled until the countdown ends. | Counted per network address, so it holds even if you change the email |
| Code resend cap reached (2FA or login code) | "Too many codes have been requested. Please wait before requesting a new code." plus a countdown (5 minutes if the server gives no time) | Counted per account; typing another email clears it |
| Too many login-link requests | "Too many requests. Please try again later." plus "Too many attempts. Try again in MM:SS"; **Send link** disabled | Clears when you change the email |
| Too many login-code requests | "Too many requests. Please try again later." | |
| Resending a code | At least 60 seconds between resends | |
| Too many password-reset requests | "Too many attempts. Try again in MM:SS" | |
| Turning 2FA on/off too often | Switch disabled and "Time remaining MM:SS" under it | |
| General throttling anywhere in the app | Snackbar "Too many attempts. Try again in MM:SS" or "Too many requests. Please try again later." | |
| Rate-limited while the app is starting | A blocking screen with the countdown that reloads by itself | |

Countdowns show as MM:SS, or HH:MM:SS for longer waits. What to do: wait for the countdown. Do not keep clicking; repeated attempts can extend the block.

## Subscription checks at sign-in and during a session

- No Inventory subscription on the organization: "No Inventory subscription found".
- Subscription expired:
  - Owner: signed in and redirected to **Subscription** with "Your subscription plan has expired".
  - Other users: "Could not log in due to expired subscription. Please contact your administrator for renewal." If they are already signed in: "Subscription expired. Please contact the owner to extend.", and they are signed out.
  - QR-poster users and child accounts managed by a parent organization: sent to **Service unavailable**.
- Subscription expiring within 15 days: the Owner sees "Your subscription plan is about to expire" once.
- Session refresh fails: "We could not refresh your session. Please sign in again."

How long a normal (non-QR) session lasts before you must sign in again is not specified in the application; confirm with SDS Manager support.

## Account deletion (Delete Account page)

A user can request deletion of their own account:
1. Open the **Delete Account** page (URL path `/delete-account`; there is no menu link inside the web app).
2. "Enter your email address, and we'll send you a link to delete your account." Enter the email and click **Request Deletion**.
3. Confirmation: "We've sent you an email to confirm your account deletion. Please check your inbox!"
4. Click the link in the email. The page confirms: "Your account has been scheduled for deletion in 7 days. You will not be able to access the app during this period."
5. "If you've changed your mind, please contact our support team at www.sdsmanager.com."

Errors: "This link has expired." or "Invalid URL." Request a new email. Server errors are shown as received.

Removing *another* user from your organization is different. See "Deactivating, reactivating and permanently deleting users".

## Bounced email address ("We couldn't deliver our email")

If SDS Manager's welcome email to your address bounced, or was reported as spam, a popup appears after you sign in. It cannot be dismissed until you fix the address.

- Title: "We couldn't deliver our email".
- Body: "Our welcome email to <address> bounced back. Please double-check the address or enter a different one so we can reach you." For a spam report: "...was reported as spam. Please enter a different address so we can reach you."
- Reason line (bounces only):
  - "This email address doesn't exist. Please check for typos and enter a valid address."
  - "This mailbox is full. Please use a different address."
  - "We couldn't deliver our email to this address. Please enter a different one."
- Enter **Corrected email address** and click **Update email**. Success: "Email updated. We've sent a new welcome message to the corrected address." Your sign-in email changes to the new address.
- Errors: "Please enter an email address.", "That doesn't look like a valid email address.", "Please enter a different address than the one that bounced.", "That email is already in use. Please use a different address."

## Account settings page (Manage account)

Open via avatar → **Manage account**. The page has collapsible sections. Which ones you see depends on your role.

### General Information

| Field | Notes |
|---|---|
| Profile picture | Upload or remove an avatar image. |
| **First name**, **Last name** | Required. |
| **Phone number** | Optional. |
| **Country** | Required. Tooltip: it controls the default emergency contact on labels (e.g. CHEMTREC for US, CANUTEC for Canada), date format (US and Canada MM/DD/YYYY, others DD/MM/YYYY), default language, APB (Denmark only; the Country tooltip spells APB out as "Accident Prevention Book", while the APB module itself uses the Danish term Arbejdspladsbrugsanvisning, a workplace chemical instruction), Inspection Readiness (US only), HMIS & NFPA labels (US and Canada only), default measurement system (US imperial, others metric), and default label language for PDF labels and QR posters. |
| **Regulatory region** | Options: EU, UK, US, CA, NZ, AU, BR, MY, CN, MX, ZA. Tooltip: it decides which framework SDS quality checks use (EU REACH/CLP, OSHA HazCom 2012, WHMIS 2015, UK REACH/GB CLP, Safe Work Australia GHS Rev 7, or UN GHS). It also filters global SDS search to your region, controls hazard statement display and applicable restricted-substance lists, and flags SDSs targeting another region. |
| **Email address** | Read-only. You cannot change your login email here. The only in-app way to change it is the bounced-email popup; otherwise contact support. |
| **Measurement system** | Switch **US** / **Metric**. |

Click **Save**. It is enabled only after a change. Success: "Your changes have been saved" (the page reloads).

Your interface **Language** is changed from the avatar menu (**Language** selector), not on this page.

### Security

Hidden for users who must log in with SSO only (when the organization has SSO).

- **Change Password**: **Old Password** + **New Password** + requirements list → **Save**. Success: "Password changed successfully".
- **Set Password**: shown instead when your account has no password yet (for example created via invite or login link). Only **New Password** is asked.
- **Two Factor Authentication** switch (Owner, Admin and Admin Light only):
  - Turning it on checks your plan. If the plan lacks it, an upgrade popup appears.
  - Depending on your account state, a **Verify your email** popup may ask for a 6-digit code sent to your email, with **Submit** and **Go back**, the same expiry countdown and **Resend code**.
  - Success: "Update successful". A wrong code shows "The OTP code is invalid". Too many attempts disable the switch and show "Time remaining MM:SS".

### Email notifications

Shown to Owner, Admin and Admin Light. Users who are approvers in an SDS approval flow also see this section, but only with the "SDS waiting for my approval" switch.

| Switch | What it emails you about |
|---|---|
| **New SDS Request** | A new SDS request was made |
| **Message from SDS Manager** | Messages from SDS Manager |
| **Message from vendor** | Messages received from vendors |
| **New revision of an SDS** | A newer revision of an SDS in your library exists |
| **SDS has automatically been upgraded to new version** | An SDS was auto-upgraded |
| **SDS File Import Complete** | An SDS file import finished |
| **SDS request closed without an SDS** | "Email me when an SDS request is closed automatically because the supplier never provided the SDS." |
| **SDS waiting for my approval** (approvers only) | "Email me when a safety data sheet reaches an approval step where I am an approver." |
| **Enable alternative notification email** + email field | "If enabled, notifications will be sent to this email instead of your account email." The field is required when enabled and must be a valid email ("You have entered an invalid email address", "Email is required"). |

Click **Save settings**. Success: "Information saved successfully".

### Regulatory lists to check ingredients to

Shown to Owner, Admin and Admin Light. A list of regulatory restricted-substance lists, grouped by region, each with a switch. A switch next to a region heading turns the whole group on or off. Your organization's private restricted lists (created in Settings) also appear here. Ingredients of your SDSs are checked against the lists you turn on, and matches feed the Hazardous substances views. Click **Save**; it is enabled only after a change. Success: "Information saved successfully".

### MCP Server Access

Shown when your plan includes the AI agent and you are the Owner or have been given access. It lets an AI assistant (Claude, ChatGPT, Cursor or any MCP-compatible client) work with your SDS library.

- If not yet activated: "Activate user access to the Chat AI Agent" (or "Enable user access to the Chat AI Agent") with **OK**.
- When active, the page explains the capabilities: searching 16+ million SDSs in the global database (other screens say 18 million+; confirm the current figure with SDS Manager), adding SDSs from the database, PDFs or URLs, organizing by location, tracking hazardous substances. Setup text: "add the MCP server URL (https://sds-mcp.sdsmanager.com/support/mcp) to your AI client with "Streamable HTTP" transport, then use the API key below to authenticate."
- The **API Key** field is masked. Use the copy button ("Copy API key successfully"). The link "Learn more about setting up the MCP server" opens the FAQ.

## Roles overview: organization role vs location role

SDS Manager uses two layers of roles.

**1. Organization role** (set when the user is invited, changeable later):

| Role | On-screen description |
|---|---|
| **Owner** | One per organization. Full control, including Organization profile, Subscription, ownership transfer and permanently deleting users. Has every right on every location automatically. Transfer ownership on Organization profile; you cannot pick Owner from the role dropdown. |
| **Admin** | "This role is for users who will manage your SDS library, with the ability to add or remove SDS documents. You can assign admin rights to specific locations while providing staff (read-only) or no access to others." |
| **Admin Light** | "This role includes all Admin functions except the ability to add or remove SDS documents. It's ideal for organizations with a multi-step SDS approval process, where the first approver should not add SDS to the library." |
| **Staff** (Staff Role, read-only) | "Employees generally don't require individual user accounts in SDS Manager, as they can access the SDS library in read-only mode via a QR code or an intranet link. Individual Staff Role accounts are only recommended if you intend to use the chemical tracking feature." |
| **No Access** | "For users who should no longer have any access to the system." |
| Read only | Exists in the system but cannot be chosen when inviting or changing a role. The related **Read Only** location role is what QR-poster (employee) accounts get. |

**2. Location role** (set per location on **Manage Location Access**):

| Location role | Meaning |
|---|---|
| **Admin with approval** | "Same access as role Admin but can also approve SDS and risk assessments." Full tooltip: it includes all Admin permissions and can approve SDSs, Risk Assessments and other approval-required content. |
| **Admin** | Manage the SDS library at that location, including adding and removing SDSs. |
| **Admin Light** | Admin functions at that location except adding or removing SDSs. |
| **Staff** | Read-only access to the location's SDSs, plus chemical tracking. |
| **Read Only** | Used only for QR-login (employee poster) accounts. |
| **No Access** | The location is not visible to the user. |

"Admin with approval" exists only as a location role. To make someone an approver: give them the organization role **Admin**, then set **Admin with approval** on the locations where they should approve.

Which location roles you can assign depends on the user's organization role:

| User's organization role | Location roles available |
|---|---|
| Admin | No Access, Staff, Admin Light, Admin, Admin with approval |
| Admin Light | No Access, Staff, Admin Light |
| Staff | No Access, Staff |
| No Access | None (the location tree is greyed out) |
| QR-login user (poster) | No Access, Read Only |

You can only grant **Admin with approval** on a location where you yourself are Admin with approval. The Owner can always grant it.

## Role and permission matrix

The tables below reflect what the application's screens enforce. Plan limits apply on top. A "Yes" means the role is not blocked by the app; the feature may still need the right plan.

### Organization-level capabilities

| Capability | Owner | Admin | Admin Light | Staff | Read only | No Access |
|---|---|---|---|---|---|---|
| Account settings: General Information, password | Yes | Yes | Yes | Yes | Yes | Yes |
| Two Factor Authentication switch | Yes | Yes | Yes | No | No | No |
| Email notifications section | Yes | Yes | Yes | Approvers only (approval switch) | Approvers only | Approvers only |
| Regulatory lists to check ingredients to | Yes | Yes | Yes | No | No | No |
| User management, Invite members, Employee Access | Yes | Yes | No | No | No | No |
| Invite users with role Admin or Admin Light | Yes | Yes | No | No | No | No |
| Invite users with role Staff or No Access | Yes | Yes | No | No | No | No |
| Give a user "Access to all SDSs" (or change **Access setting**) | Yes | No (always Customize access) | No | No | No | No |
| Change another user's organization role | Yes | Yes | No | No | No | No |
| Edit another user's location access | Yes (all locations) | Yes (only locations where they are Admin/Admin with approval) | No | No | No | No |
| Deactivate / Activate users | Yes | Yes | No | No | No | No |
| **Permanent Delete** users | Yes | No | No | No | No | No |
| Require SSO login only (per user) | Yes (with SSO add-on) | No | No | No | No | No |
| Organization profile, ownership transfer | Yes | No | No | No | No | No |
| Subscription page | Yes | No | No | No | No | No |
| Integrations (API key) in Settings | Yes (Pro/Enterprise) | No | No | No | No | No |
| Owner-only Employee Access switches (QR users print labels, add barcodes, app access, amount visibility, label config) | Yes | Shown but disabled: "You do not have permission to perform this action. Only the owner can change this setting." | No access to page | No | No | No |
| Sidebar: SDS Updates, PPE Approval, Disposal Classification, Inbox (from vendors) | Yes | Yes | No | No | No | No |
| Sidebar (More): Import product list, Import ZIP Files, Shoot pictures of labels of your chemicals | Yes | Yes | No | No | No | No |
| Sidebar: SDS Filter, Hazardous substances, SDS Quality | Yes | Yes | Yes | No | No | No |
| Sidebar: Risk assessment, Job procedures (shown as "COSHH assessments" for UK and the 7-point label for Denmark) | Yes | Yes | Yes | Yes | No | No |
| View SDS change log | Yes | Yes | Yes | No | No | No |
| Bulk actions on the SDS requests list | All | All | All except the bulk delete action (request matching SDS and cancel request remain) | n/a | n/a | n/a |

SDS Quality is also hidden on trial and free plans. Risk assessment and Job procedures also depend on plan and library size. Exact plan rules are in the topic **Plans, Free Trial, Sign-up, Billing and Subscription**.

### Location-level capabilities

| Capability at a location | Owner | Admin with approval | Admin | Admin Light | Staff | Read Only (QR) | No Access |
|---|---|---|---|---|---|---|---|
| See the location and its SDSs | Yes | Yes | Yes | Yes | Yes | Yes | No |
| Add SDS to the library / upload SDS files to the location | Yes | Yes | Yes | No | No | No | No |
| "Add new admin user" for the location | Yes | Yes | Yes | No | No | No | No |
| Approve SDS (approval queue), risk assessments, job procedures linked to the location | Yes | Yes | No. **Approve** is disabled with "Only users with the role "Admin with approval" can approve" | No | No | No | No |
| Grant "Admin with approval" to others on the location | Yes | Yes | No | No | No | No | No |
| Choose this location when submitting an SDS request | Yes | Yes | Yes | Yes | Yes | Yes | No |

Job procedures linked to no location can be approved by the Owner or an Admin.

### The approval workflow ("Admin with approval")

- On **Settings**, the **SDS Approval functionality** switch (tooltip): "Requires designated approvers to review and approve Safety Data Sheets before they become active in your library... When ON, admins cannot directly add SDSs — they submit requests that must be approved by users with the "Admin w/ approval" role. When OFF, any admin can add SDSs directly."
- Approvers are users with **Admin with approval** on the location. In the configurable **SDS approval flow** (Settings), approvers are the users assigned to each step.
- Approvers can receive "SDS waiting for my approval" emails (Account settings → Email notifications).
- How SDSs move through the approval queue is described in "SDS approval queue (SDS Awaiting Approval)" in the topic **Adding, finding and importing SDS (getting SDS into the library)**.

## User management page

Open **More → User management**. The heading reads **Manage Location Access**. This page lists personal user accounts. QR-poster accounts are listed on **Employee Access** instead.

- An info box explains: "For most organizations, it's only necessary to create personal user accounts for those who require access to administer the SDS Library. If your company has multiple sites or departments (locations), you can add users with admin roles to manage the SDS library at their specific location(s)." It then points read-only employees to QR codes or an intranet link and suggests read-only accounts or SSO if company policy forbids QR access. The box can be closed.
- **Search for user** field.
- **User Status** filter: **All**, **Active** (default), **Deactivated**.
- **Add user** button (Owner and Admin).

Table columns:

| Column | Content |
|---|---|
| **Name** | Avatar + full name |
| **Email address** | Login email |
| **Role** | Owner, Admin, Admin Light, Staff, No Access (or Read Only) |
| **Language** | The user's interface language |
| **Access to all SDSs** | Indicator: on = the user sees every location; off = custom location access |
| **QR login** | For Staff users only, if your plan includes QR codes. Icon to enable QR login, or shows Enabled/Disabled. |
| **Status** | **Active** or **Deactivated** (blank for the Owner) |

Clicking a row opens that user's location access. The exceptions:
- The Owner's row and your own row do nothing.
- A deactivated user shows "User has been deactivated".

Row action menu (three dots), depending on your role and the user:

| Action | Shown when |
|---|---|
| **Edit location access** | Active user who is not the Owner or yourself |
| **\*Deactivate user** / **Activate user** | User is not the Owner or yourself; you are Owner or Admin |
| **Permanent Delete** | User is not the Owner or yourself; you are the Owner |
| **Allow user to sign in using a QR code** | Active Staff user without QR login; you are Owner or Admin; plan includes QR codes |
| **Activate / Enable / Disable user access to the Chat AI Agent** | Active user; you are Owner or Admin; plan includes the AI agent. Disabling is always allowed, even after a plan change. |

The table is paginated. On phones it becomes cards with a "more" menu.

## Adding (inviting) users

Three entry points:
- **User management → Add user**: popup **Create new user**.
- **Invite members** (sidebar More or avatar menu): popup **Invite colleague**. Same form, followed by a location-access step inside the popup.
- On a location: **Add new admin user** (location menu or the icon in the location tree). The user is created with access to that location.

Steps:
1. Fill in **Full name** (required; first word = first name, rest = last name), **Email address** (required, valid format) and **Phone** (optional).
2. Choose **Role**: **No Access**, **Staff**, **Admin**, **Admin Light**. Admin and Admin Light can only be chosen by an Owner or Admin. No Access is not offered when adding from a location. The help icon explains every role.
3. Owner with SSO add-on only: **Require SSO login only** checkbox (ticked by default). The gear icon opens SSO settings ("Go to SSO settings to configure SSO options for your organization.").
4. Owner only: choose **Access to all SDSs** ("This option will give the QR code access to all active SDS on all locations in your library.") or **Customize access** ("Use this option if you have multiple locations and only want this QR code to give access to one or a few of them."). If the organization has one location or none, **Access to all SDSs** is preselected. Admins always get Customize access. When adding from a location, the first option reads **Access to location "<name>"**.
5. Click **SEND INVITATION**. Success: "Invitation sent successfully". The user receives an email invitation.
6. With **Customize access**, you continue to **Manage Location Access** for the new user to choose roles per location. In the Invite colleague popup this is step 2; from User management you are taken to the user's page.

Validation messages: "Full name cannot be empty", "Email cannot be empty", "You have entered an invalid email address", "User role cannot be empty", "Please select user access to SDSs".

If the email already belongs to a user in another SDS Manager organization, an account-migration invitation is sent instead (see "Invitation, registration and account-migration links").

Limits on the number of users per plan are not specified in the application; confirm with SDS Manager sales.

## Managing a user's location access

Page **User location access** (heading **Manage Location Access**). Opened from a user row or **Edit location access**. Use the back arrow ("Back to user management") to return.

Top controls (regular users):
- **Role** (change the organization role; see next section).
- **Access setting** (Owner only, not for No Access users): **Access to all SDSs** or **Customize access**. With Access to all SDSs, the location tree is locked because the user sees everything. Saved immediately ("Successfully").
- **Require SSO login only** (Owner with SSO add-on): "When enabled, this user must log in using your organization's Single Sign-On (SSO) and cannot use a username or password. Please note that only email addresses belonging to your organization can be used to log in."
- **Select user**: switch to another user without leaving the page (the Owner and you are not listed).

Location tree:
- Each location shows radio buttons for the allowed location roles. Column headers show tooltips with role descriptions.
- Setting a role on a parent location applies the same role to all its sub-locations and locks them. Setting **No Access** on a parent does not overwrite roles already given on sub-locations.
- The Owner sees every location. An Admin sees only the locations where they are Admin or Admin with approval.
- **Save** (enabled only after a change): "Access changed successfully". **Collapse location tree** / **Expand location tree** toggles the tree.
- Empty tree message: "Your location list is empty. Try creating a location or contact your Admin for more access."

For QR-login accounts this page shows different controls: Language, Measurement system, "Only access SDS with selected language", **Advanced access** (custom-field filters), and the role choices Read Only / No Access. These are covered in the topic **Locations, QR codes and employee access to SDS**.

## Changing a user's role

On the user's **Manage Location Access** page, use **Change user role** / **Role**: **Admin**, **Admin Light**, **Staff**, **No Access**. The change is saved immediately ("User role changed successfully") and the tree refreshes so only roles valid for the new organization role remain available. Owner and Admin can change roles. You cannot change the Owner's role here; use ownership transfer.

## Deactivating, reactivating and permanently deleting users

- **Deactivate**: row menu → **\*Deactivate user** → popup "Confirm to deactivate user" with the user's name → **OK**. Success: "User successfully deactivated". The user can no longer sign in ("Your account has been deactivated. Please contact your administrator."). Their history stays in the system.
- **Reactivate**: set **User Status** to **Deactivated** or **All**, then row menu → **Activate user** → "Confirm Activate" / "Confirm to activate user <name>" → **OK**. Success: "User activated successfully".
- **Permanent Delete** (Owner only): row menu → **Permanent Delete** → "Confirm permanent delete": "Are you sure you want to permanently delete this user? This action cannot be undone." → **Permanent Delete**. Success: "User permanently deleted".
- You cannot deactivate or delete the Owner or yourself. To remove the Owner, first transfer ownership.
- Setting a user's role to **No Access** is another way to remove all access while keeping the account active.

## Converting a Staff user to QR login

Row menu → **Allow user to sign in using a QR code** (Staff users only). Confirmation popup "Allow user to sign in using QR code" lists what happens:
- "All location access of this user will be reduced to "Read only"."
- "User can not assign "Admin" access on location anymore."
- "The user will move from User management to Employee Access."
- "A passwordless login link and QR poster will be created. Anyone who has them can sign in as this user."
- "You can turn the user back into a regular user later in Employee Access with "Revert to regular user". Their location roles will stay Read only."

After reverting ("The user is a regular user again. Set their location roles in User management."), set their location roles again.

## Chat AI Agent (MCP) access per user

Owners and Admins can give individual users access to the Chat AI Agent / MCP server from the user's row menu. The label depends on the state: **Activate user access to the Chat AI Agent** (no key yet), **Enable user access to the Chat AI Agent** (key exists but access off), or **Disable user access to the Chat AI Agent**. A confirmation popup with **OK** / **Cancel** follows. Enabling needs the AI agent in your plan. The user then finds the key under **Account settings → MCP Server Access**.

## Organization profile

Owner only. **More → Organization profile**. Two blocks:

**Organization information**
- Company logo: upload or remove.
- **Company name**: required. Empty shows "Organization name cannot be empty".
- **Owner**: choose another user to transfer ownership. QR-login accounts are not listed.
- **Country**: the organization's country. If billing has no separate billing country on a paid plan, the current country is kept as the billing country when you change it.
- **Save** (enabled after a change). Success: "Organization information saved successfully". The page reloads.

**Billing Information**: see the topic **Plans, Free Trial, Sign-up, Billing and Subscription**.

### Transferring ownership

1. On **Organization profile**, pick the new person in **Owner** and click **Save**.
2. Popup **Confirm change owner**: "Confirm that you want to change the owner of this account. Note that you will lose owner access after confirmation".
3. Under **Choose your role after the transfer**, select:
   - **Keep as Admin (all locations)**: "You will retain Admin access to all locations".
   - **Remove all access**: "You will lose all access to this account".
4. **OK** (enabled only after choosing) completes the transfer and returns you to the home page.

## Settings page (organization settings)

**More → Settings**. The page has collapsible sections. Each switch saves immediately and shows "Setting updated". If saving fails, the switch flips back and shows "Failed to save settings". While one switch is saving, the others are briefly locked. Organization-wide settings are saved by the Owner account: SDS Manager only accepts changes to them from the Owner. If you are not the Owner and a switch flips back, ask your Owner.

### Settings section: every switch

Each switch has an info icon with the tooltip text summarized here.

| Switch (exact label) | ON | OFF |
|---|---|---|
| **SDS Approval functionality** | Admins cannot add SDSs directly; they submit requests that users with Admin with approval must approve. For quality control or regulatory oversight. | Any admin can add SDSs directly. |
| **Show chemical tracking QR codes on secondary container labels** | Secondary container labels include a QR code employees scan to log chemical usage at the location. Separate per-bottle tracking labels can also be generated. | Labels print without the tracking QR code. |
| **Automatically update SDS to new versions** | Outdated SDSs are automatically replaced with the latest version when SDS Manager has one. | You get notifications about new versions and update manually, for example to re-evaluate risk assessments first. Needs a plan with newer-version data to switch on. |
| **Employee SDS search: Show search result from global database if SDS is not found in Company SDS library** | Employees' searches also show matches from the global SDS Manager database alongside your library. | Employees only see SDSs your organization has added. |
| **Allow employees to request Safety Data Sheets to be added to Safety Data Sheets library** | Anyone who scans a QR poster sees a "Request SDS" option, and a plus sign on global search results, to request an SDS by entering their email. No login needed. Often used with Employee SDS search. | Only logged-in users with the right role can add SDSs. |
| **Default imported PDF files to Private** | All future uploads default to Private: other customers cannot find them in searches. | Uploaded SDS files are added to the global SDS database by default. Anyone can find the SDS, but it is not visible that your organization uploaded it. |
| **Require External System Id to be added on all Safety Data Sheets added to library** | Users must enter the External System ID (ERP/SAP product code) before an SDS can be saved. Useful for ERP synchronisation. | The field is optional. |
| **App access for QR users** | Anyone with the QR poster can scan it in the app and download all SDSs linked to that poster (default). | Only users who log in with email and password can access SDSs via the app. Keeps your chemical list confidential. |
| **AI functions on risk assessment** | Users can use AI features on risk assessments: voice input for describing usage and AI-generated hazard suggestions. ON by default. | AI use on risk assessments is restricted. Needs the Risk assessment feature to switch on. |
| **Automatic SDS Translation** (read-only switch) | Key SDS sections (First Aid Measures, Fire Fighting, Accidental Release) are auto-translated into the QR poster's language for multilingual workforces. A caption shows "From: … → To: …", or "Language pair not configured. Contact support@sdsmanager.com to set up." | Not active. You cannot change it yourself ("Contact SDS Manager to enable or configure this feature."). Billing note: "We charge based on number of translated in-use SDS per year." |

### Custom emergency agency

"When you specify a custom emergency contact number, this number overrides your country's default emergency number and is shown to users in the applications and on labels." Two fields: **Emergency agency** (name) and **Phone**. They save automatically shortly after you stop typing ("Setting updated"). Use the clear (x) button to remove a value and go back to the country default.

### SafetyCulture integration

Shown only if SafetyCulture integration is enabled for your account. You enter the SafetyCulture API key and can switch **Inject link to print secondary container labels to SDS PDF files**. Turning it on or off asks to update all PDFs in SafetyCulture: "Adds links to all PDF files" / "Removes links from all PDF files". See "SafetyCulture integration" in the topic **SDS Distribution for suppliers (eCommerce / DirectSDS), the customer SDS portal, and integrations**.

### SDS approval flow

Section **SDS Approval Flow**: build a default and per-location approval flow with named steps and approvers per step, optionally requiring a different approver per step. "When approval flow is enabled, every SDS added to a location is held as pending and must move through the steps below in order." How held SDSs are reviewed is described in "SDS approval queue (SDS Awaiting Approval)" in the topic **Adding, finding and importing SDS (getting SDS into the library)**.

### Email address for Safety Data Sheets Updates

"Automated SDS Ingestion": tell your vendors to email updated SDSs to a dedicated inbound address, and SDS Manager imports the PDFs automatically.
- You define the identifier part. The address becomes `sds-<identifier>@sds.sdsmanager.com`.
- Only lowercase letters, numbers, periods and hyphens: "Please use only letters, numbers, periods (.), and hyphens (-) in your email address." Empty: "Please enter a company identifier."
- Important: "Once saved, this email address cannot be changed."
- Options: **For Multi-site: Allow dedicated email address for site** (each location gets its own address with a location number added), **Automatically add Safety Data Sheets received to location email**, **Send daily email summary for messages received to main email address** (recipients comma-separated; invalid: "Invalid email address: <email>").

### Single Sign-On (SSO) configuration

Section **Single Sign-On (SSO)**, shown only with the SSO add-on. Heading "Single Sign-on Configuration for SDS Manager", with a **Help** button that opens the guide for Microsoft Azure.

| Field | Meaning |
|---|---|
| **Federation metadata document** | Choose **Federation metadata URL** (paste the URL) or **XML file** (**Choose file** → upload). Only .xml is accepted: "Only XML files are allowed.", "Please upload an XML metadata file.". **View current XML** / **Hide current XML** shows what is stored. Uploading a new file replaces it ("Upload new XML file to replace current metadata"). |
| **Application (client) ID** | The app ID from your identity provider. Required. |
| **Email attribute mapping** | "SSO attribute name that maps to the user email (e.g., "emailAddress", "email", etc.)". Required. |
| **SSO Login URL** | Generated by SDS Manager. Copy it ("SSO Login URL is copied to clipboard") to share or add to your portal. |
| **Enable for users** | Turns SSO login on for your users. |
| **Automatically create new users with role** + role (Admin, Admin Light, Staff, No Access; default Admin) | "If someone signs in with their work email and doesn't have an account yet, a new user will be created automatically with the selected role." |
| **Assign role from identity provider** + **Role attribute name (optional)** | Take the role from your identity provider. Leave the attribute blank to auto-detect (role, roles, group, groups) from standard Azure AD and Okta claims. "If no value matches a system role, the selected default role is used." |

Buttons:
- **Save Configuration**: "Configuration updated successfully." Missing fields: "Please fill in all required fields".
- **Test**: enabled when SSO is on and a login URL exists. Opens a test login in a new window: **SSO Test Successful**, "Logged in as <email>". If the account does not exist: "This account does not exist in your system." / "In test mode, no new users are created. In a real SSO login, an account would be created automatically with the following details:" (Email, First name, Last name, Role). A failure shows **SSO Test Failed** with the reason and **Close Window**.

**Email Attribute Mapping Issue** popup: if SDS Manager detects the email arrives under a different attribute than configured, a popup shows "We detected that the SSO email attribute mapping may not be correct.", **Expected key** / **Found key**, and "Would you like to update the mapping now?" with **Keep Current Settings** / **Update Mapping**. Only the Owner can update it, or the person running the SSO **Test** window. Others see "This action is not allowed. Please contact the Owner to update this setting." Afterwards it shows **Email Attribute Mapping Updated** with the saved configuration.

Per-user "Require SSO login only" is set when inviting or on the user's location access page. SSO-only users do not see the Security section or **Set Password**.

### Other Settings sections (brief)

- **Private restricted list** (plans with Hazardous substances): your own list of prohibited substances by CAS/EC number. SDSs containing them are flagged in Hazardous substances. Import from Excel/CSV with columns CAS#, EC#, Description.
- **Exposure** (plans with Exposures): manage exposure categories and statement codes.
- **Risk Analysis** (shown to the Owner): **Update Risk & Safety Data** re-analyses all SDSs to update risk ratings, suggested PPE, safety controls and disposal classification, with a history view.
- **Integrations** (Owner, Pro/Enterprise or SDS Distribution): **Generate API Key** / **Regenerate API Key** / **Revoke API Key**.
  - "API key generated successfully. Copy it now — it will not be shown again."
  - Regenerating "will invalidate the current API key."
  - Revoking "will permanently delete the API key."
  - The listed endpoints need an active eCommerce (SDS Distribution) subscription. See the topic **SDS Distribution for suppliers (eCommerce / DirectSDS), the customer SDS portal, and integrations**.
- **Refresh all cached SDS values** button (bottom of the page): re-pulls newly extracted data for the same SDS versions in your library. It does not upgrade SDSs to newer versions.

## Rules, limits and edge cases

- There is exactly one Owner. The Owner cannot be deactivated, deleted or have location access edited. Transfer ownership first.
- You cannot deactivate, delete or edit the location access of your own account from User management.
- Admins can only manage locations where they themselves are Admin or Admin with approval, and cannot give anyone "Access to all SDSs".
- "Admin with approval" is a location role only. The user's organization role must be Admin to be eligible.
- Changing a user's organization role narrows the location roles allowed. For example, after a downgrade to Staff only No Access/Staff remain selectable.
- A parent location's role (other than No Access) cascades to and locks its sub-locations.
- Login links expire after 15 minutes. Login and 2FA codes are 6 digits and normally valid for 5 minutes. Resends need at least 60 seconds between them.
- QR-poster sessions last about 1 day and cannot access admin pages.
- Users with "Require SSO login only" cannot use a password, login link or code. Only email addresses belonging to your organization can log in via SSO.
- Your sign-in email cannot be edited on Account settings. The bounced-email popup is the only in-app way to change it; otherwise contact support.
- Account deletion is scheduled 7 days after confirming the emailed link, and you cannot use the app during that time.
- Expired subscription: only the Owner can still sign in (to renew).
- The inbound SDS update email address cannot be changed once saved.
- The number of users allowed per plan, session length for regular logins, password expiry and account lockout thresholds are not specified in the application; confirm with SDS Manager support/sales.

## Messages and errors users may see

| Exact text | What it means | What to do |
|---|---|---|
| Password cannot be empty | Submitted without a password | Enter your password |
| No Inventory subscription found | Your organization has no SDS Manager Inventory subscription | Contact your Owner or SDS Manager sales |
| Could not log in due to expired subscription. Please contact your administrator for renewal. | Company subscription expired; you are not the Owner | Ask your Owner to renew |
| Subscription expired. Please contact the owner to extend. | Subscription expired while you were signed in | Ask the Owner to renew |
| Your subscription plan has expired | Shown to the Owner, who is taken to Subscription | Renew on the Subscription page |
| Your account has been deactivated. Please contact your administrator. | An Owner or Admin deactivated you | Ask your administrator to reactivate you |
| Too many requests. Please try again later. | Too many requests from you or your network | Wait a few minutes |
| Too many attempts. Try again in MM:SS | Temporary block with countdown | Wait until the countdown ends |
| Too many codes have been requested. Please wait before requesting a new code. | Code resend cap reached for this account | Wait (about 5 minutes or as shown), then resend once |
| If an account exists, a code was sent to your email | Neutral reply to a login-code request | Check your inbox and spam folder; make sure the email is right |
| Code has expired | The 6-digit code is too old | Click **Resend code** |
| A new code has been sent to you | Resend worked | Use the newest code |
| The OTP code is invalid | Wrong code while turning 2FA on/off | Re-enter or resend the code |
| Update successful | 2FA setting changed | — |
| Google Login Denied | Google sign-in was cancelled or refused | Try again or use email sign-in |
| The login link has expired. You now have to log in using your email and password. Press "Recover" to set password. | The login link is invalid or incomplete | Use **Forgot your password?** |
| This link has expired. Redirecting to login page in {count} seconds. | Login or invitation link expired | Request a new link or sign in |
| Your sign-in link has expired. Please scan the QR code again. | The desktop-to-phone link is too old | Scan the QR code on the desktop again |
| This QR code is no longer valid. Ask your administrator for a new QR code. | Poster revoked or invalid | Ask an Owner/Admin for a new poster |
| This account has been deactivated. Please contact support for assistance. | The organization behind the QR poster is deactivated | Contact SDS Manager support |
| QR code rejected: only same-origin login URLs are allowed. | The scanned code is not an SDS Manager login QR | Scan an official SDS Manager poster |
| Could not load your SDS library right now. Please try again, or re-scan the QR code. | QR session problem | Retry or re-scan |
| This account doesn't use single sign-on (SSO). | Email not configured for SSO | Use password, link or code |
| This sign-in link has expired or has already been used. Please sign in again. | SSO return link reused or expired | Start SSO sign-in again |
| Missing SAML response from the identity provider. | Identity provider sent nothing | Retry; ask IT to check the SSO setup |
| Invalid SAML response received. | Identity provider response could not be read | Ask IT to check metadata and certificate |
| User identity information is missing in the SSO response. | No user identity in the response | Ask IT to check claims |
| Unable to extract email address from the user identity. | Email attribute mapping is wrong | Owner: fix **Email attribute mapping** |
| User not found in the system. | No SDS Manager user for that email, and auto-create is off | Ask an admin to invite you or enable auto-create |
| Missing application ID in the request. / The specified SSO application could not be found. | SSO configuration incomplete | Owner: check **Application (client) ID** and the SSO Login URL |
| SSO is not enabled for this application. | **Enable for users** is off | Owner: turn it on |
| SDS Inventory subscription is not active. | Company subscription inactive | Renew the subscription |
| Your SSO subscription is missing, expired, or inactive. Please contact us at support_en@mail.sdsmanager.com for assistance. | SSO add-on missing or expired | Contact SDS Manager |
| Configuration updated successfully. / SSO Login URL is copied to clipboard / Metadata XML file uploaded successfully. | SSO settings saved/copied | — |
| Only XML files are allowed. / Please upload an XML metadata file. | Wrong or missing metadata file | Upload the .xml metadata |
| You will receive an email if this email is found in our system | Password reset requested | Check inbox and spam |
| URL is incorrect | The set-password link is malformed | Request a new reset email |
| Ensure that new password meets all the listed requirements | Password too weak | Meet all five rules |
| Password changed successfully | — | — |
| This link has expired. / Invalid URL. | Account-deletion link invalid | Request deletion again |
| Your account has been scheduled for deletion in 7 days... | Deletion confirmed | Contact support to cancel |
| We couldn't deliver our email (and reason lines) | Your email bounced or was marked spam | Enter a corrected address |
| That email is already in use. Please use a different address. | Corrected email belongs to another account | Use another address |
| Invitation sent successfully | User invited | — |
| This user is already registered under another account. A migration invitation has been sent… | Invitee belongs to another organization | Wait for them to accept |
| Full name cannot be empty / Email cannot be empty / You have entered an invalid email address / User role cannot be empty / Please select user access to SDSs | Invite form incomplete | Fill in the field |
| User successfully deactivated / User activated successfully / User permanently deleted | Status changed | — |
| User has been deactivated | You clicked a deactivated user | Activate them first |
| User role changed successfully / Access changed successfully | — | — |
| You do not have permission to perform this action. Only the owner can change this setting. | Owner-only switch | Ask the Owner |
| This action is not allowed. Please contact the Owner to update this setting. | Owner-only SSO mapping fix | Ask the Owner |
| This action is not available for your current role | Your role lacks this action | Ask an Owner/Admin to change your role |
| This location requires admin privileges | You chose a location where you are not an admin | Pick a location where you are Admin |
| You need an admin role to add SDS to library | Read-only users cannot add SDSs | Request the SDS or ask an admin |
| This action is not available on your current subscription plan | Plan does not include it | Upgrade the plan |
| This feature is not available on your current subscription plan. / ...trial plan. | Upgrade popup | Upgrade or contact sales |
| Setting updated / Information saved successfully / Your changes have been saved | Saved | — |
| Failed to save settings | Save rejected or failed | Retry; if you are not the Owner, ask the Owner |
| Organization name cannot be empty | Company name blank | Enter a name |
| Organization information saved successfully | — | — |
| Please fill in all required fields | SSO form incomplete | Fill metadata, App ID, email mapping |
| We could not refresh your session. Please sign in again. | Session expired | Sign in again |
| Your company does not have an active subscription for this service. | Service unavailable page | Contact your Owner/administrator |
| Oops! Something went wrong. Cannot reach the server. Please try again later. | Temporary connection problem | Retry later |
| Something went wrong. | Generic failure | Retry; contact support if it persists |

## Frequently asked questions

Q: What are all the ways I can log in to SDS Manager?
A: You can sign in with email and password, ask for an emailed login link (valid 15 minutes), ask for an emailed 6-digit login code, use **Sign in with Enterprise SSO** if your company has SSO, or use **Sign in with Google**. If two-factor authentication is on, you also enter an emailed 6-digit code after your password. Employees without accounts can use QR posters for read-only access.

Q: I forgot my password. How do I reset it?
A: On the sign-in page click **Forgot your password?**, enter your email and click **Request password reset**. If the email is registered you receive a link. Open it, choose a new password that meets the five rules (10+ characters, upper case, lower case, number, special character) and click **Set Password**. Check your spam folder if nothing arrives within a few minutes.

Q: Why does it say "Too many attempts. Try again in 04:59"?
A: SDS Manager temporarily blocks repeated sign-in, code or link requests to protect your account. Wait until the countdown ends and the button becomes active again. Password sign-in limits count per network, so switching email does not help. The code-resend cap counts per account.

Q: My login code expired before I typed it. What now?
A: Codes are 6 digits and normally valid for about 5 minutes ("Code expires in MM:SS"). Click **Resend code** for a new one. You must wait at least 60 seconds between resends. Always use the newest code.

Q: How do I turn on two-factor authentication?
A: Go to avatar → **Manage account** → **Security** and switch on **Two Factor Authentication**. You may be asked to confirm with a 6-digit code sent to your email. After that, every login asks for an emailed code. The switch is available to Owner, Admin and Admin Light, and your plan must include two-factor authentication.

Q: What is the difference between Admin, Admin Light and Admin with approval?
A: Admin manages the SDS library, including adding and removing SDSs. Admin Light can do the Admin functions except adding or removing SDSs. It suits multi-step approval where the first approver should not add SDSs. Admin with approval is a location role with all Admin rights plus approving SDSs, risk assessments and other approval-required content. Give the user the organization role Admin, then set Admin with approval on the relevant locations.

Q: Do all my employees need user accounts?
A: No. SDS Manager recommends personal accounts only for people who administer the SDS library. Employees who only read SDSs can use QR posters or an intranet link from **Employee Access**. Individual Staff accounts are recommended only if you use chemical tracking.

Q: How do I invite a colleague?
A: As an Owner or Admin, use **More → Invite members** or **User management → Add user**. Enter full name, email, optional phone and role, choose the SDS access (Owners only), and click **SEND INVITATION**. If you chose **Customize access**, set their role per location in the next step. They receive an email invitation.

Q: Why can't I choose "Access to all SDSs" when adding a user?
A: Only the Owner can grant access to all SDSs. Admins always create users with **Customize access** and assign locations where the Admin is an admin. Ask your Owner to change the user's **Access setting** if needed.

Q: Why can't I give someone "Admin with approval" on a location?
A: Two conditions apply. The user's organization role must be Admin, and you must yourself be Admin with approval on that location (the Owner always can). Admin Light and Staff users cannot be given admin location roles.

Q: How do I remove a user who left the company?
A: In **User management**, open the user's row menu and choose **\*Deactivate user**, then confirm. They can no longer sign in and their history stays. The Owner can instead choose **Permanent Delete**, which cannot be undone. You can also set their role to **No Access**.

Q: Can I reactivate a deactivated user?
A: Yes. Set **User Status** to **Deactivated** (or **All**), open the user's row menu, choose **Activate user** and confirm. Their account becomes Active again.

Q: How do I transfer ownership of our SDS Manager account?
A: The current Owner opens **Organization profile**, selects the new Owner in the **Owner** field and clicks **Save**. In **Confirm change owner**, choose **Keep as Admin (all locations)** or **Remove all access**, then click **OK**. Ownership moves immediately and the previous Owner loses owner rights.

Q: Can I change the email address I log in with?
A: Not on the Account settings page; the email field is read-only there. The only in-app exception is the "We couldn't deliver our email" popup, which appears if your welcome email bounced. Otherwise contact SDS Manager support.

Q: How do we set up Single Sign-On (SSO)?
A: SSO needs the SSO add-on. Then go to **Settings → Single Sign-On (SSO)** and enter the federation metadata (URL or XML file), the **Application (client) ID** and the **Email attribute mapping**. Tick **Enable for users** and click **Save Configuration**. Use **Test** to check it and share the **SSO Login URL**. Optionally auto-create new users with a default role or take roles from your identity provider. Users then sign in with **Sign in with Enterprise SSO**.

Q: Can new employees get an account automatically through SSO?
A: Yes, if the Owner turns on **Automatically create new users with role** in the SSO settings. A user who signs in with their work email and has no account gets one with the selected role, or the role from the identity provider if **Assign role from identity provider** is on. Test mode never creates users.

Q: What does "Require SSO login only" do?
A: That user must sign in through your company's SSO and cannot use a password, login link or login code. The Owner sets it per user (when inviting or on the user's location access page), and it is ticked by default for new invites when SSO is active. Such users do not see the password section in Account settings.

Q: Why do my employees see "This QR code is no longer valid"?
A: The QR poster they scanned has been revoked, deleted or its QR login was turned off. Ask an Owner or Admin to create or re-enable a poster in **Employee Access** and print the new one. QR sessions also expire after a day, so re-scanning is normal.

Q: How do I delete my own SDS Manager account?
A: Open the **Delete Account** page, enter your email and click **Request Deletion**, then confirm via the link in the email. Deletion is scheduled 7 days later and you cannot use the app in that period. If you change your mind, contact support through www.sdsmanager.com.

Q: Which settings can only the Owner change?
A: Organization profile (name, logo, country, ownership), Subscription, permanent user deletion, "Access to all SDSs" for users, "Require SSO login only", the API key under Integrations, several Employee Access switches, and fixing the SSO email mapping. Organization-wide switches on the Settings page are also saved only for the Owner. If you are an Admin and a switch reverts with "Failed to save settings", ask the Owner.

Q: What does "Automatically update SDS to new versions" do?
A: When on, any SDS in your library is replaced automatically with the newest version once SDS Manager has it. When off, you are notified about new versions and update them yourself. That is useful if you want to re-check risk assessments first. Turning it on needs a plan that includes newer-version data.

Q: Can I get notifications at a different email address?
A: Yes. In **Account settings → Email notifications**, switch on **Enable alternative notification email**, enter the address and click **Save settings**. Notifications then go there instead of your login email. This section is available to Owner, Admin and Admin Light.

Q: What does the "No Access" role do?
A: It is meant for users who should no longer have any access to the system. A No Access user cannot be given any location role (the location tree is greyed out). It is an alternative to deactivating when you want to keep the account active.

## Related topics

- **Locations, QR codes and employee access to SDS** — creating QR-login users, posters, IP restrictions, intranet links; Sites & Locations management
- **Plans, Free Trial, Sign-up, Billing and Subscription** — plan features, Subscription page, Billing Information
- **Adding, finding and importing SDS (getting SDS into the library)** — SDS approval queue (SDS Awaiting Approval) and SDS requests
- **Keeping SDS up to date: newer versions, SDS update requests to vendors, vendor inbox and SDS Quality** — newer versions, vendor emails, inbound SDS email
- **SDS library: substances list, SDS details, stock, archive and export** — Hazardous substances, private restricted lists, regulatory lists
- **Chemical risk assessment, PPE approval, disposal classification and substitution** — approving risk assessments
- **Job procedures (job hazard analysis, COSHH assessments, 7-point risk assessments) and chemical work instructions** — approving job procedures
- **Labels, labelling compliance, kits and usage tracking** — labels and chemical tracking
- **SDS Distribution for suppliers (eCommerce / DirectSDS), the customer SDS portal, and integrations** — Integrations (API key), SDS Distribution, MCP Server Access, SafetyCulture
