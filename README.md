# Gamage Recruiters Job Portal System

Public development workspace for the Gamage Recruiters Job Portal System, a MERN-based recruitment and application-management platform developed by the Software Engineering Team.

## Development Phase

Weeks 05–06 focus on implementing and integrating the approved Minimum Viable Product (MVP).

## Approved Technology Stack

- **Frontend:** React, Vite, JavaScript, Tailwind CSS, React Router, Axios, React Hook Form, Zod and toast notifications
- **Backend:** Node.js, Express.js, JavaScript, REST APIs, JWT, bcrypt, Multer and Nodemailer with Brevo SMTP
- **Database:** MongoDB Atlas with Mongoose
- **Media Storage:** Cloudinary
- **Code Quality:** ESLint and Prettier
- **Deployment Direction:** Vercel for the frontend and Render for the backend

## Repository Structure

```text
client/
  public/                  Static public files
  src/
    assets/                Images, icons and approved static assets
    components/            Reusable shared UI components
    features/              Module-specific frontend work
    hooks/                 Shared React hooks
    layouts/               Public, authenticated and Admin layouts
    pages/                 Route-level pages
    routes/                Central frontend route definitions
    services/              Shared Axios client and API services
    constants/             Shared frontend constants and status values
    utils/                 Reusable frontend utilities
    validations/           Shared Zod validation schemas

server/
  src/
    config/                Database and environment configuration
    constants/             Shared roles, statuses and notification types
    controllers/           Request and response handling
    middleware/            Authentication, authorization, validation and errors
    models/                Mongoose models owned by approved primary owners
    routes/                Versioned REST API routes
    services/              Business logic and shared services
    utils/                 Reusable backend utilities
    validations/           Backend Zod validation schemas

docs/
  architecture/            Architecture and structure decisions
  api/                     API contracts and integration references
  database/                Model ownership and database decisions
  ownership/               Module, API, model and layout ownership
  setup/                   Local development and onboarding instructions

.github/                   CODEOWNERS, pull-request template and issue templates
```

## Branches

- `main` contains stable, release-ready code.
- `develop` is the main integration branch during development.
- Normal development work must use a task branch and a pull request into `develop`.

## Local Setup

Use a current Node.js version supported by the installed Vite release.

```bash
cd client
npm install
npm run dev
```

```bash
cd server
npm install
npm run dev
```

See [docs/setup/local-development.md](docs/setup/local-development.md) for the complete setup process.

## Ownership and Conflict Prevention

Before creating a model, API, status constant or shared layout component, read:

- [Module and shared-resource ownership](docs/ownership/README.md)
- [Frontend feature ownership](client/src/features/README.md)
- [Shared layout ownership](client/src/layouts/README.md)
- [Backend model ownership](server/src/models/README.md)

Do not create duplicate models, Axios instances, global layouts, API response formats or status values.

## Security Notice

This is a public repository. Never commit credentials, `.env` files, MongoDB connection strings, JWT secrets, email credentials, Cloudinary credentials, API keys, personal access tokens, real CVs, personal data, private company documents, database exports, production logs or private Postman environments.

Use only safe placeholders in `.env.example` files.

## Contribution Rules

Read [CONTRIBUTING.md](CONTRIBUTING.md) before making changes.

## Licence

No licence is currently included. A licence may only be added after company or supervisor approval.
