# Development Verification — Authentication + Public Job Discovery

**Module owner:** Bimsara Rathnayake
**Branch:** `test/auth-public-jobs`
**Phase:** Weeks 05–06 development verification (not formal QA)
**Base:** `develop`

---

## 1. Scope

This checklist covers the module owned by Bimsara:

### Backend (server)

- `POST /auth/register`
- `POST /auth/login`
- `GET /auth/verify-email/:token`
- `POST /auth/resend-verification`
- `POST /auth/forgot-password`
- `POST /auth/reset-password`
- `GET /auth/me` (protected)
- `GET /jobs` (public list)
- `GET /jobs/search`
- `GET /jobs/filter`
- `GET /jobs/:id` (public detail + similar jobs)
- Supporting code: `models/User.js`, `middleware/auth.js` (`protect` / `attachUserIfPresent`), `middleware/rateLimit.js` (forgot/reset limiters), `validations/auth.validation.js`, public parts of `validations/job.validation.js`, public parts of `services/job.service.js`

### Frontend (client)

- `features/authentication/` — Login, Register, VerifyEmail, ForgotPassword, ResetPassword, `AuthLayout`, `FormInput`, `getErrorMessage`, `roleHome`
- `features/public-jobs/` — `JobsPage`, `JobDetailPage`, `utils/format.js`
- Shared layouts owned by Bimsara — `layouts/public/PublicFooter.jsx`, `layouts/public/PublicLayout.jsx`
- Public parts of `services/authService.js`, `services/jobService.js`; integration of `services/savedJobService.js` and the Report modal on `JobDetailPage`

### Ownership boundaries (do NOT modify)

- Saved Job API — Madushika
- Report model / report form / Submit Report API — Anuruddhika
- Employer Job Management APIs (create/edit/close) — Disura
- Categories & Skills reference APIs — Admin module
- Non-admin sidebar (Injas), non-admin top navigation (Kalana), Admin layouts (Sahan)

Where a shared resource is exercised below (e.g. Save Job / Report on the job detail page), the check verifies **integration only** — any defect found there should be reported to the API/model owner, not "fixed" in this branch.

---

## 2. How to use

1. Start the backend and frontend locally (see `docs/setup/local-development.md`).
2. Confirm the base URL — default `http://localhost:5000/api/v1` (client default in `services/apiClient.js`).
3. Run the smoke script first (covers most backend cases):
   ```bash
   cd server
   node scripts/smoke-test.mjs
   ```
4. Work through the manual cases below, marking `PASS` / `FAIL` / `N/A` (with notes).
5. Record results in the log (Section 8) and capture evidence (screenshots / Postman / terminal output).

> Email-dependent flows (verify / resend / forgot / reset) cannot be fully automated in local dev
> unless a mail preview server is configured. The smoke script covers the non-email branches
> (validation, duplicates, invalid tokens, login failures). Manual email cases are listed below.

---

## 3. Backend — Functional tests

### 3.1 Registration — `POST /auth/register`

| ID   | Case                                                                                                        | Expected                                                                                                                                                              | Result |
| ---- | ----------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| B-01 | Register valid job seeker (`name`, valid `email`, password ≥ 8, `confirmPassword` match, role `job_seeker`) | `201`, `{ success, message, data: { user } }`, no token in response, email lowercased/trimmed, `emailVerified: false`, no `password`/hash in response                 |        |
| B-02 | Register valid employer (role `employer`)                                                                   | `201`, role stored as `employer`                                                                                                                                      |        |
| B-03 | Register with role omitted                                                                                  | `201`, defaults to `job_seeker`                                                                                                                                       |        |
| B-04 | Register with role `admin`                                                                                  | `400` (rejected by the register schema's role enum — admin is not registerable). Service keeps a `403` guard as defence-in-depth but it is unreachable via this route |        |
| B-05 | Register duplicate email (same, different case)                                                             | `409`, "account with this email already exists"                                                                                                                       |        |
| B-06 | Missing name / empty name                                                                                   | `400` validation, "Name is required"                                                                                                                                  |        |
| B-07 | Name > 100 chars                                                                                            | `400`, "Name cannot exceed 100 characters"                                                                                                                            |        |
| B-08 | Invalid email format                                                                                        | `400`, "Please provide a valid email address"                                                                                                                         |        |
| B-09 | Password < 8 chars                                                                                          | `400`, "Password must be at least 8 characters"                                                                                                                       |        |
| B-10 | Password > 72 chars                                                                                         | `400`                                                                                                                                                                 |        |
| B-11 | `confirmPassword` mismatch                                                                                  | `400`, "Passwords do not match"                                                                                                                                       |        |
| B-12 | Missing `confirmPassword`                                                                                   | `400`                                                                                                                                                                 |        |
| B-13 | Unknown role value                                                                                          | `400` validation (zod enum)                                                                                                                                           |        |
| B-14 | Response shape check                                                                                        | Exactly `{ success: true, message, data: { user } }`; `user` has no `password`, `resetPasswordTokenHash`, `resetPasswordTokenExpires`, `tokenVersion`                 |        |

### 3.2 Login — `POST /auth/login`

| ID   | Case                                                      | Expected                                                       | Result |
| ---- | --------------------------------------------------------- | -------------------------------------------------------------- | ------ |
| B-20 | Login verified active job seeker with correct credentials | `200`, `{ token, user }`, token is JWT, user has no password   |        |
| B-21 | Login verified active employer                            | `200`                                                          |        |
| B-22 | Login with unverified email                               | `403`, "Please verify your email before logging in"            |        |
| B-23 | Login with wrong password                                 | `401`, "Invalid email or password"                             |        |
| B-24 | Login with unknown email                                  | `401`, identical message to B-23 (no user probing)             |        |
| B-25 | Login with invalid email format                           | `400` validation                                               |        |
| B-26 | Login missing fields                                      | `400`                                                          |        |
| B-27 | Deactivated/suspended account (if a sample exists)        | `403`, "This account is not active"                            |        |
| B-28 | Email case-insensitivity                                  | Login succeeds with `EMAIL@x.com` when stored as `email@x.com` |        |

### 3.3 Email verification — `GET /auth/verify-email/:token`

| ID   | Case                                               | Expected                                                     | Result |
| ---- | -------------------------------------------------- | ------------------------------------------------------------ | ------ |
| B-30 | Valid verification link from registration email    | `200`, "Email verified successfully", account can now log in |        |
| B-31 | Verify again with the same token                   | `400`, "invalid or has expired" (token purpose one-time)     |        |
| B-32 | Verify with garbage token                          | `400`, "invalid or has expired"                              |        |
| B-33 | Verify with a reset-password token (wrong purpose) | `400`, "invalid or has expired"                              |        |
| B-34 | Verify for a deleted/nonexistent user id           | `400`, "no longer exists"                                    |        |

### 3.4 Resend verification — `POST /auth/resend-verification`

| ID   | Case                                   | Expected                         | Result |
| ---- | -------------------------------------- | -------------------------------- | ------ |
| B-40 | Resend for existing unverified account | `200`, "Verification email sent" |        |
| B-41 | Resend for already verified account    | `409`, "already verified"        |        |
| B-42 | Resend for nonexistent email           | `404`, "No account found"        |        |
| B-43 | Resend with invalid email format       | `400`                            |        |

### 3.5 Forgot password — `POST /auth/forgot-password`

| ID   | Case                                     | Expected                                                             | Result |
| ---- | ---------------------------------------- | -------------------------------------------------------------------- | ------ |
| B-50 | Forgot password for existing account     | `200`, generic message + `data.expiresIn` / `expiresInHuman` present |        |
| B-51 | Forgot password for NON-existent account | `200`, same status/message as B-50 (no probing), no email sent       |        |
| B-52 | Invalid email format                     | `400`                                                                |        |
| B-53 | Rate limit — 6th request within 15 min   | `429`, "Too many password reset requests"                            |        |

### 3.6 Reset password — `POST /auth/reset-password`

| ID   | Case                                                                                                 | Expected                                                                          | Result |
| ---- | ---------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- | ------ |
| B-60 | Valid token + new password (≥ 8) + matching confirm                                                  | `200`, "Your password has been reset"; old password no longer works, new one does |        |
| B-61 | Reuse the same token again                                                                           | `400`, "invalid or has expired" (single use)                                      |        |
| B-62 | Expired token (if a manual expired token can be produced)                                            | `400`, "invalid or has expired"                                                   |        |
| B-63 | Newer reset request then use the older token                                                         | `400` (hash overwritten → token invalidated)                                      |        |
| B-64 | Password < 8 chars                                                                                   | `400`                                                                             |        |
| B-65 | `confirmPassword` mismatch                                                                           | `400`, "Passwords do not match"                                                   |        |
| B-66 | Missing token                                                                                        | `400`, "Reset token is required"                                                  |        |
| B-67 | Rate limit — 11th attempt within 15 min                                                              | `429`                                                                             |        |
| B-68 | Session invalidation — session issued before reset is rejected by `GET /auth/me` (tokenVersion bump) | `401`, "Your session has expired"                                                 |        |

### 3.7 Current user — `GET /auth/me`

| ID   | Case                                 | Expected                                        | Result |
| ---- | ------------------------------------ | ----------------------------------------------- | ------ |
| B-70 | No Authorization header              | `401`, "Not authorized. Please log in."         |        |
| B-71 | Malformed header (not `Bearer`)      | `401`                                           |        |
| B-72 | Garbage / expired token              | `401`, "Session expired or invalid"             |        |
| B-73 | Valid token                          | `200`, `{ user }` matching session              |        |
| B-74 | Token from deleted user              | `401`, "user for this session no longer exists" |        |
| B-75 | Deactivated account with valid token | `403`, "This account is not active"             |        |

### 3.8 Public job discovery

| ID    | Case                                                                             | Expected                                                                                             | Result |
| ----- | -------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- | ------ |
| B-80  | `GET /jobs` no params                                                            | `200`, `{ jobs, pagination: { total, page, limit, totalPages } }`, only PUBLISHED jobs, newest first |        |
| B-81  | `GET /jobs?page=2&limit=12`                                                      | `200`, correct slice                                                                                 |        |
| B-82  | `GET /jobs?limit=51`                                                             | `400` (max 50)                                                                                       |        |
| B-83  | `GET /jobs?page=0`                                                               | `400` (min 1)                                                                                        |        |
| B-84  | `GET /jobs?limit=abc`                                                            | `400`                                                                                                |        |
| B-85  | `GET /jobs/search?q=developer`                                                   | `200`, matching published jobs                                                                       |        |
| B-86  | `GET /jobs/search?location=Colombo`                                              | `200`, case-insensitive location matches                                                             |        |
| B-87  | `GET /jobs/search?q=` (empty)                                                    | `200`, behaves like plain list                                                                       |        |
| B-88  | `GET /jobs/search?q=` 101+ chars                                                 | `400` (max 100)                                                                                      |        |
| B-89  | `GET /jobs/filter?jobType=Full-time`                                             | `200`, only that type                                                                                |        |
| B-90  | `GET /jobs/filter?workMode=Remote`                                               | `200`                                                                                                |        |
| B-91  | `GET /jobs/filter?category=<validId>`                                            | `200`                                                                                                |        |
| B-92  | `GET /jobs/filter?category=notanid`                                              | `400`, "Invalid category id"                                                                         |        |
| B-93  | `GET /jobs/filter?jobType=Bogus`                                                 | `400` (enum)                                                                                         |        |
| B-94  | `GET /jobs/filter?minExperience=5&maxExperience=2`                               | `400`, "maxExperience cannot be less than minExperience"                                             |        |
| B-95  | `GET /jobs/filter?minSalary=100000&maxSalary=50000`                              | `400`, "maxSalary cannot be less than minSalary"                                                     |        |
| B-96  | `GET /jobs/filter?minSalary=1000&maxSalary=10000`                                | `200`, returns jobs whose salary band overlaps range                                                 |        |
| B-97  | `GET /jobs/filter?postedDate=week`                                               | `200`, only jobs posted in last 7 days                                                               |        |
| B-98  | `GET /jobs/filter?postedDate=never`                                              | `400` (enum)                                                                                         |        |
| B-99  | `GET /jobs/:id` valid published id                                               | `200`, `{ job, similar[] }`, job has company populated, similar ≤ 4 matching category+jobType        |        |
| B-100 | `GET /jobs/:id` invalid ObjectId format                                          | `400`, "Invalid job id"                                                                              |        |
| B-101 | `GET /jobs/:id` nonexistent id (valid 24-hex)                                    | `404`, "Job not found"                                                                               |        |
| B-102 | `GET /jobs/:id` for draft/closed/rejected job                                    | `404` (public filter)                                                                                |        |
| B-103 | Anonymous view increments `viewsCount`                                           | Views count +1 after fetch                                                                           |        |
| B-104 | Job seeker view increments `viewsCount`                                          | +1                                                                                                   |        |
| B-105 | Job's own employer viewing does NOT increment `viewsCount` (attachUserIfPresent) | Count unchanged                                                                                      |        |
| B-106 | Employer (not owner) viewing DOES increment                                      | +1                                                                                                   |        |

---

## 4. Frontend — Functional & UI tests

### 4.1 Login page (`/login`)

| ID   | Case                                                    | Expected                                                            | Result |
| ---- | ------------------------------------------------------- | ------------------------------------------------------------------- | ------ |
| F-01 | Page loads with correct title/subtitle                  | Render                                                              |        |
| F-02 | Empty submit                                            | "Email is required" / "Password is required"                        |        |
| F-03 | Invalid email format                                    | "Please provide a valid email address"                              |        |
| F-04 | Wrong credentials                                       | server error banner with backend message                            |        |
| F-05 | Correct credentials                                     | success toast, redirects via `roleHome` (`/`), header shows profile |        |
| F-06 | "Forgot password?" link navigates to `/forgot-password` |                                                                     |        |
| F-07 | Show/Hide password toggle works                         |                                                                     |        |
| F-08 | Submit disabled + "Signing in…" while pending           |                                                                     |        |
| F-09 | Link to Register                                        |                                                                     |        |

### 4.2 Register page (`/register`)

| ID   | Case                                           | Expected                                                                  | Result |
| ---- | ---------------------------------------------- | ------------------------------------------------------------------------- | ------ |
| F-20 | Page loads, default role = Job Seeker selected |                                                                           |        |
| F-21 | Empty submit                                   | all required-field errors                                                 |        |
| F-22 | Name > 100                                     | "Name cannot exceed 100 characters"                                       |        |
| F-23 | Invalid email                                  | message shown                                                             |        |
| F-24 | Password < 8                                   | message shown                                                             |        |
| F-25 | Password mismatch                              | "Passwords do not match" on confirm                                       |        |
| F-26 | Valid submit (job seeker)                      | switches to "Verify your email" success state showing the submitted email |        |
| F-27 | Valid submit (employer)                        | same success state                                                        |        |
| F-28 | Duplicate email                                | server error banner "account with this email already exists"              |        |
| F-29 | Resend verification button                     | sends, shows "Email resent — check your inbox", resets after 60s          |        |
| F-30 | Resend failure (e.g. verified account)         | inline error shown                                                        |        |
| F-31 | "Go to sign in" navigates to `/login`          |                                                                           |        |

### 4.3 Verify email page (`/verify-email?token=...`)

| ID   | Case                                       | Expected                                        | Result |
| ---- | ------------------------------------------ | ----------------------------------------------- | ------ |
| F-40 | Valid token                                | success state, "Sign in" button                 |        |
| F-41 | Missing token                              | "Invalid verification link" state + resend form |        |
| F-42 | Expired token (message contains "expired") | "Link expired" state + resend form              |        |
| F-43 | Invalid/already-used token                 | "Invalid verification link" state + resend form |        |
| F-44 | Resend form on expired/invalid states      | sends; success/failure feedback                 |        |

### 4.4 Forgot password (`/forgot-password`)

| ID   | Case                                     | Expected                                                                                           | Result |
| ---- | ---------------------------------------- | -------------------------------------------------------------------------------------------------- | ------ |
| F-50 | Invalid email format                     | validation message                                                                                 |        |
| F-51 | Valid submit (existing OR unknown email) | "Check your email" state; shows expiry from `res.data.data.expiresInHuman` (fallback "30 minutes") |        |
| F-52 | "Back to sign in" navigates              |                                                                                                    |        |

### 4.5 Reset password (`/reset-password?token=...`)

| ID   | Case                                             | Expected                                          | Result |
| ---- | ------------------------------------------------ | ------------------------------------------------- | ------ |
| F-60 | No token in URL                                  | "Invalid reset link" state + "Request a new link" |        |
| F-61 | Password < 8                                     | validation message                                |        |
| F-62 | Mismatch                                         | "Passwords do not match"                          |        |
| F-63 | Valid token + new password                       | success state → "Sign in"                         |        |
| F-64 | Invalid/expired token                            | server error banner                               |        |
| F-65 | After reset, old session (if any) is invalidated | app clears session on next `/auth/me`             |        |

### 4.6 Auth state & routing (layout-level)

| ID   | Case                                   | Expected                                                                                      | Result |
| ---- | -------------------------------------- | --------------------------------------------------------------------------------------------- | ------ |
| F-70 | Guest visiting `/` and `/jobs`         | PublicLayout shows Sign In / Register buttons, no profile link                                |        |
| F-71 | Logged-in job seeker                   | header shows profile link → `/profile`, no Sign In/Register                                   |        |
| F-72 | Logged-in employer                     | header shows profile link → `/employer/company`, no Sign In/Register                          |        |
| F-73 | Logged-in admin                        | header shows NO profile link (no approved admin dashboard), and does NOT fall back to `/jobs` |        |
| F-74 | Persisted session restored on reload   | user stays logged in                                                                          |        |
| F-75 | Expired/invalid stored token on reload | session cleared, UI returns to guest state                                                    |        |
| F-76 | Logout (from authenticated layout)     | returns to guest state                                                                        |        |
| F-77 | `roleHome` for all roles               | redirects to `/`                                                                              |        |

### 4.7 PublicLayout header

| ID   | Case                                                                             | Expected | Result |
| ---- | -------------------------------------------------------------------------------- | -------- | ------ |
| F-80 | Desktop nav: Browse Jobs / About Us / Support render and navigate                |          |        |
| F-81 | Active nav item highlighted (`/jobs` when on `/jobs`)                            |          |        |
| F-82 | Brand logo links to `/jobs`                                                      |          |        |
| F-83 | Mobile (< lg): hamburger opens drawer, X closes, links navigate and close drawer |          |        |
| F-84 | Header is sticky                                                                 |          |        |

### 4.8 PublicFooter (Bimsara-owned shared layout)

| ID   | Case                                                                                                               | Expected | Result |
| ---- | ------------------------------------------------------------------------------------------------------------------ | -------- | ------ |
| F-90 | Footer renders on all public routes (`/`, `/jobs`, `/jobs/:id`, `/about`, `/contact`, `/faq`, `/help`, `/support`) |          |        |
| F-91 | All links resolve to real routes (no 404): `/jobs`, `/register`, `/login`, `/help`, `/contact`, `/about`, `/faq`   |          |        |
| F-92 | Footer not shown on auth pages (`/login`, `/register`, `/verify-email`, `/forgot-password`, `/reset-password`)     |          |        |
| F-93 | Current year displayed                                                                                             |          |        |
| F-94 | Responsive: 4 columns on md+, stacked on small screens                                                             |          |        |
| F-95 | Footer visible at bottom of short pages (flex layout)                                                              |          |        |

### 4.9 Jobs page (`/jobs`)

| ID    | Case                                                                                     | Expected | Result |
| ----- | ---------------------------------------------------------------------------------------- | -------- | ------ |
| F-100 | Loads jobs, shows "Showing X of Y jobs", cards render                                    |          |        |
| F-101 | Loading spinner while fetching                                                           |          |        |
| F-102 | Empty results → EmptyState + "Clear all filters"                                         |          |        |
| F-103 | API error → friendly error block                                                         |          |        |
| F-104 | Search via search bar → URL `q`/`location`, results from `/jobs/search`; filters removed |          |        |
| F-105 | Apply filters → URL filter params, results from `/jobs/filter`; `q`/`location` removed   |          |        |
| F-106 | Filter toggle shows/hides filter panel; active count badge correct                       |          |        |
| F-107 | Clear all filters resets URL and results                                                 |          |        |
| F-108 | Pagination next/prev updates `page` param                                                |          |        |
| F-109 | Cards link to `/jobs/:id`                                                                |          |        |
| F-110 | Responsive: 1/2/3 columns                                                                |          |        |

### 4.10 Job detail page (`/jobs/:id`)

| ID    | Case                                                                                                            | Expected                                                                   | Result |
| ----- | --------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- | ------ |
| F-120 | Loads full job info: title, company, location, type, mode, salary format, experience, category, deadline, views |                                                                            |        |
| F-121 | Company card + logo/initial render                                                                              |                                                                            |        |
| F-122 | Back to jobs link                                                                                               |                                                                            |        |
| F-123 | Similar jobs (≤ 4) render when present                                                                          |                                                                            |        |
| F-124 | Invalid/nonexistent id → "Job Unavailable" error state + back link                                              |                                                                            |        |
| F-125 | Save Job — guest                                                                                                | redirects to `/login` with `state.from = /jobs/:id`                        |        |
| F-126 | Save Job — logged-in job seeker                                                                                 | saves, button becomes "Saved" (filled), feedback "Job saved successfully!" |        |
| F-127 | Unsave — logged-in job seeker                                                                                   | removes, feedback "Job removed from saved list."                           |        |
| F-128 | Save Job — employer/admin                                                                                       | feedback "Saving jobs is available for job seekers." (no API call)         |        |
| F-129 | Saved state restored on page load for job seeker                                                                | bookmark already active if job saved                                       |        |
| F-130 | Save/unsave API failure                                                                                         | error feedback shown, state not corrupted                                  |        |
| F-131 | Report — guest                                                                                                  | redirects to `/login` with `state.from`                                    |        |
| F-132 | Report — job seeker                                                                                             | opens Report modal (submit flow owned by Anuruddhika)                      |        |
| F-133 | Report — employer/admin                                                                                         | feedback "Reporting jobs is available for job seekers."                    |        |
| F-134 | Save button disabled while request in flight                                                                    |                                                                            |        |
| F-135 | Views count increments visibly after reload (job seeker/anonymous)                                              |                                                                            |        |

---

## 5. Security checks (backend)

| ID   | Case                                                                      | Expected                               | Result |
| ---- | ------------------------------------------------------------------------- | -------------------------------------- | ------ |
| S-01 | No password/hash/token fields in any auth response                        | Verified in B-14                       |        |
| S-02 | Passwords stored hashed (bcrypt)                                          | Inspect DB — never plaintext           |        |
| S-03 | Registration cannot create `admin`                                        | B-04                                   |        |
| S-04 | Forgot-password does not reveal account existence (status/message/timing) | B-50/B-51                              |        |
| S-05 | Login returns identical message for unknown email vs wrong password       | B-23/B-24                              |        |
| S-06 | Reset tokens stored hashed; single use; invalidated by newer request      | B-61/B-63; code review                 |        |
| S-07 | Password reset invalidates prior sessions (tokenVersion)                  | B-68                                   |        |
| S-08 | Rate limiting active on forgot/reset                                      | B-53/B-67                              |        |
| S-09 | Public job endpoints expose only PUBLISHED non-deleted jobs               | B-102                                  |        |
| S-10 | No secrets committed in branch (`.env`, URIs, keys)                       | `git status` / scan                    |        |
| S-11 | JWT secret required at boot (fail-fast)                                   | `env.js` throws if missing/placeholder |        |

---

## 6. Performance / smoke checks

| ID   | Case                                                                                           | Expected                                             | Result |
| ---- | ---------------------------------------------------------------------------------------------- | ---------------------------------------------------- | ------ |
| P-01 | `/auth/login` responds < ~500 ms locally                                                       | measure with Postman/timing                          |        |
| P-02 | `/jobs`, `/jobs/search`, `/jobs/filter`, `/jobs/:id` respond < ~500 ms locally (small dataset) |                                                      |        |
| P-03 | Repeated list requests do not grow memory / no obvious N+1 in `listJobs`                       | code review + basic load (10–20 concurrent requests) |        |
| P-04 | `GET /jobs/:id` runs ≤ 2 queries for the public paths (detail + similar)                       | code review                                          |        |
| P-05 | Frontend bundle builds without errors (`npm run build`)                                        | run locally                                          |        |
| P-06 | ESLint passes on both client and server (`npm run lint`)                                       | run locally                                          |        |

---

## 7. Edge cases (cross-cutting)

| ID   | Case                                                        | Expected                                              | Result |
| ---- | ----------------------------------------------------------- | ----------------------------------------------------- | ------ |
| E-01 | Register email with surrounding spaces / uppercase          | normalized (trim + lowercase)                         |        |
| E-02 | Login email with surrounding spaces                         | still succeeds (trim)                                 |        |
| E-03 | Search `q` with special regex chars (`[.*+?])               | does not throw (escaped) — verify `escapeRegExp` used |        |
| E-04 | Filter salary with only `minSalary` and only `maxSalary`    | behaves as unbounded on the missing side              |        |
| E-05 | Job with null salary bounds appears in salary range results | matches unbounded logic                               |        |
| E-06 | `page` beyond last page                                     | returns empty `jobs` with `total` intact, no crash    |        |
| E-07 | Concurrent reset-password with same token                   | exactly one succeeds (atomic findOneAndUpdate)        |        |
| E-08 | Empty search result then applying a filter                  | resets properly, results reload                       |        |
| E-09 | Mobile: save/report buttons wrap cleanly on small screens   | visual check                                          |        |

---

## 8. Results log

### Run 1 — automated API smoke tests (2026-08-18)

Executed with `node server/scripts/smoke-test.mjs` against a locally running backend
(`SMOKE_BASE_URL=http://localhost:5001/api/v1`, `SMOKE_RATE_LIMIT=1`).

Result: **39 PASS / 0 FAIL**.

| Area                           | Cases (PASS)                                                     |
| ------------------------------ | ---------------------------------------------------------------- |
| Health                         | H-01                                                             |
| Auth validation                | B-06, B-08, B-09, B-11, B-04, B-25                               |
| Auth registration & login      | B-01, B-05, B-22, B-23, B-24                                     |
| Auth token & protected route   | B-70, B-72, B-32                                                 |
| Auth resend / forgot / reset   | B-43, B-40, B-52, B-50, B-51, B-53, B-66, B-64, B-67             |
| Public jobs list/search/filter | B-80, B-82, B-83, B-85, B-88, B-93, B-94, B-95, B-92, B-96, B-98 |
| Public jobs detail             | B-100, B-101, B-80b, B-99                                        |

Notes from the run:

- **B-04** — `admin` registration is rejected with `400` by the register schema's role enum
  (the service-level `403` guard is defence-in-depth and unreachable via this route).
- **B-50/B-51** — verified identical generic response for existing vs unknown accounts
  (no user probing). On repeated runs the `forgot-password` limiter (5/15 min) correctly
  returned `429`, which the harness treats as a PASS annotation.
- **B-53 / B-67** — rate limiters confirmed working: bursts returned `429`.
- **B-22** — unverified accounts blocked from login with `403`.
- **B-80b / B-99** — detail + similar jobs verified against a real published job
  (`6a7599f201aa7448b2e3fad1`); each detail fetch increments `viewsCount` by design.

Manual / email-flow cases still to complete (need a reachable inbox — SMTP is configured, so
tokens are not printed to the console):

- B-30/B-31/B-20 (verify → login happy path + token reuse)
- B-40 resend email delivery check
- B-60/B-61/B-62/B-63/B-68 (reset happy path, reuse, expiry, session invalidation)
- All frontend F-* cases and visual/performance items in Sections 4–7.

### Results table (fill in remaining)

| TC ID      | Result (PASS/FAIL/N/A)                            | Notes / Evidence                          |
| ---------- | ------------------------------------------------- | ----------------------------------------- |
| B-01–B-24  | PASS                                              | automated (see Run 1)                     |
| B-30–B-31  | N/A                                               | needs email token — manual                |
| B-40–B-43  | PASS (B-40 200, B-43 400)                         | automated; delivery check pending         |
| B-50–B-53  | PASS                                              | automated incl. 429 verification          |
| B-60–B-68  | PASS (B-64/B-66), N/A (B-60/61/62/63/68)          | happy path needs email token              |
| B-70–B-75  | PASS (B-70/B-72), N/A (B-71/73/74/75)             | need verified user                        |
| B-80–B-106 | PASS (B-80…B-101, B-103/104/106), N/A (B-102/105) | see Run 1; owner-view & draft-view manual |
| F-*        | pending                                           | manual UI pass                            |

**Summary**

- Total cases run (automated): 39 — all PASS.
- Automated coverage: auth validation, registration, login (incl. unverified), protected
  route, verify/resend/forgot/reset failure paths, rate limiting, public job list/search/filter/detail.
- Pending: email happy-paths (verify/reset with a reachable inbox) and the full manual
  frontend pass (Sections 4, 6, 7).
- Open questions / defects to raise with owners:
  - Apply Now button on JobDetailPage always targets `/login` (see §9.2) — confirm expected
    behaviour with Application module owner (Madushika) before applications UI lands.
  - Note: smoke runs created throwaway users (`smoke.bimsara.<timestamp>@example.com`) in the
    dev DB and triggered real outbound Brevo emails to those addresses (they will bounce). Clean
    them up or re-run with SMTP unset in `.env` for future runs.

---

## 9. Known observations from code review

Items already fixed in this branch (Bimsara-owned code, approved):

1. **VerifyEmailPage lint error fixed** — `react-hooks/set-state-in-effect` was triggered by
   `setStatus(STATUS.INVALID)` called synchronously in the effect. Refactored to store only the
   async `result` in state and derive the visible status during render (`!token ? INVALID : result ?? LOADING`).
   Behaviour is unchanged; ESLint now passes on the file.
   - Also noted while fixing: the file's comment says the backend returns `410` for expired
     tokens, but it actually returns `400` with message "…invalid or has expired". The page maps
     this via message matching, so behaviour is correct — the comment is stale.

Items intentionally NOT changed (need owner / Team Lead approval before any fix):

2. **JobDetailPage** "Apply Now" is a static `Link to="/login"` regardless of auth state/role.
   An authenticated job seeker clicking Apply is sent to login rather than an application flow.
   Application flow is owned by Madushika; flag for confirmation on how Apply should behave once
   applications land.
3. **roleHome** currently returns `/` for every role (including admin), so post-login redirect
   goes to the public landing page. Confirm intended once dashboards exist.
4. **PublicFooter** Help Center / Contact / FAQ links point at routes owned by the Help & Support
   module — verify they are reachable in current develop (they exist in `AppRoutes`).
5. Pre-existing client ESLint issues exist in files owned by other members (`Sidebar.jsx`,
   `ConfirmationModal.jsx`, `SavedJobsPage.jsx`, `EmployerDashboard.jsx`, `ReportFakeJobModal.jsx`)
   — left untouched, not part of this module's branch scope.

---

_Branch created from `origin/develop` on 2026-08-18. No commits authored by tools; all changes/commits are authored by Bimsara._
