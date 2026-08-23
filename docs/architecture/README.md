# Architecture Direction

The project uses one monorepo containing the React frontend, Node.js and Express backend, project documentation and GitHub governance files.

## Frontend separation

Keep pages, reusable components, feature-specific code, layouts, routes, services, hooks, utilities, constants and validation schemas in their approved directories.

## Backend separation

Keep models, routes, controllers, services, middleware, validation schemas, constants, utilities and configuration in their approved directories.

Business logic must not be placed directly inside route files. Shared configuration and reusable logic must be created once and reused.
