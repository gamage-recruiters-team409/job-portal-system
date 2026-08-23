# API Contract Baseline

- Base path: `/api/v1`
- Successful responses: `success`, `message`, `data`
- Error responses: `success`, `message`, and `errors` when validation details are available
- Use shared authentication and role-authorization middleware
- Validate request bodies, path parameters and query values before business logic

Do not silently rename routes, request fields, response fields or status values after another module has started consuming them.
