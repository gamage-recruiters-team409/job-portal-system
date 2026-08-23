# API Routes

All backend endpoints must begin with `/api/v1`.

Route files should define route paths and middleware only. Move business logic into controllers and services. Do not create duplicate routes or silently change an API contract already used by another module.
