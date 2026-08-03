# Contributing Guidelines

All contributors must follow the approved GitHub workflow and project ownership rules.

## Before Starting

1. Confirm the assigned ClickUp task and module ownership.
2. Check related shared-model, API and layout dependencies.
3. Update the local `develop` branch.
4. Create a new task branch from `develop`.

```bash
git switch develop
git pull origin develop
git switch -c feature/task-name
```

## Branch Naming

Use one of the approved prefixes:

- `feature/`
- `fix/`
- `docs/`
- `refactor/`
- `test/`
- `chore/`

Keep one task or one closely related group of changes per branch.

## Commit Messages

Use this format:

```text
type(scope): short description
```

Example:

```text
feat(auth): add employer registration validation
```

## Folder Placement

- Put route-level React pages in `client/src/pages/` or the approved feature directory.
- Put module-specific frontend code inside `client/src/features/<module>/`.
- Put reusable UI components in `client/src/components/` only when they are genuinely shared.
- Put Axios and API service code in `client/src/services/`.
- Put Mongoose models in `server/src/models/` only when you are the approved primary owner.
- Keep business logic in `server/src/services/`, not directly inside route files.
- Put authentication, authorization, validation and error handling in `server/src/middleware/`.
- Put API routes under `/api/v1`.

## Pull Requests

- Normal pull requests must target `develop`.
- Complete the repository pull-request template.
- Include basic development-verification evidence.
- Mention shared-model, shared-API and shared-layout impact.
- Continue corrections on the same branch.
- Resolve corrected conversations and re-request review.
- Development members must not merge their own pull requests.
- The Team Lead normally performs squash merging and branch deletion.

## Shared Ownership

Read `docs/ownership/README.md` before changing shared resources. Do not create duplicate shared models, APIs, status values or layout components. Changes affecting another member's owned area require coordination with the primary owner and Team Lead approval.

## Security

Before every commit, run `git status` and inspect staged files. Never commit secrets, real personal data, real CVs, private company information or private Postman environments.

If a secret is exposed, inform the Team Lead immediately and revoke or rotate the credential. Removing it in a later commit is not sufficient because it may remain in Git history.
