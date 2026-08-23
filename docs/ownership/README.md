# Module and Shared-Resource Ownership

## Module ownership

| Member | Main area |
|---|---|
| Bimsara | Authentication and Public Job Discovery |
| Hiba | Job Seeker Profile Management |
| Madushika | Applications, Saved Jobs and Application Timeline |
| Injas | Employer and Company Profile |
| Disura | Job Management |
| Kalana | Applicant Management |
| Sahan | Admin Management and Moderation |
| Danaja | Notifications, Email Events and Statistics |
| Anuruddhika | Help, Support and Job Seeker Reported Jobs |

## Shared layout ownership

| Shared component | Primary owner |
|---|---|
| Standard non-admin top navigation | Kalana |
| Standard non-admin sidebar | Injas |
| Shared public footer | Bimsara |
| Admin top navigation | Sahan |
| Admin sidebar | Sahan |

## Reported Jobs split

- Anuruddhika owns the shared Report model, job seeker report form, validation and Submit Report API.
- Sahan owns Admin Reported Jobs lists, details, review actions and moderation integration.
- Both areas must use the same Report model and shared report statuses.

## Rules

1. Do not create duplicate models, APIs, status values or shared layouts.
2. Contact the primary owner before changing a shared resource.
3. Obtain Team Lead approval for cross-module structural changes.
4. Explain shared impact in the pull-request description.
5. Test changes against affected modules.
