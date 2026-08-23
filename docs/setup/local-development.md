# Local Development Setup

## Prerequisites

- Git
- A current Node.js release supported by Vite
- npm
- VS Code or another approved editor

## Clone and branch

```bash
git clone https://github.com/gamage-recruiters-team409/job-portal-system.git
cd job-portal-system
git switch develop
git pull origin develop
git switch -c feature/task-name
```

## Frontend

```bash
cd client
npm install
copy .env.example .env
npm run dev
```

## Backend

```bash
cd server
npm install
copy .env.example .env
npm run dev
```

Replace only local `.env` values. Never commit `.env` files.

## Verification

- Frontend: `http://localhost:5173`
- Backend health endpoint: `http://localhost:5000/api/v1/health`
- Run `npm run lint` in both `client` and `server` before requesting review.
