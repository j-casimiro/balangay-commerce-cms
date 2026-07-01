# Balangay Commerce CMS

Balangay Commerce CMS is an open-source, production-oriented
e-commerce ecosystem: a Next.js storefront and a NestJS admin API, decoupled
and communicating over a JSON REST API, backed by Prisma + PostgreSQL in a
pnpm monorepo.

This repository currently ships the full monorepo skeleton plus a working
**Products vertical slice** proving the architecture end to end:

```
PostgreSQL → Prisma → NestJS Products API → HTTP/JSON → Next.js storefront
```

## Architecture

```
       ┌────────────────────────┐
       │   Next.js Storefront   │   apps/storefront   (:3000)
       │   (Customer Facing)    │
       └───────────┬────────────┘
                   │ HTTP REST API / JSON
                   ▼
       ┌────────────────────────┐        ┌────────────────────────┐
       │   NestJS Admin & API   │───────►│   Prisma ORM Layer     │
       │     (Core Engine)      │        └───────────┬────────────┘
       │  apps/admin-api (:4000)│                    │
       └────────────────────────┘                    ▼
                                          ┌────────────────────────┐
                                          │  PostgreSQL (:5432)     │
                                          │  docker-compose         │
                                          └────────────────────────┘
```

### Design guarantees

- **Single Schema Origin** — the database schema lives only in
  [`packages/database`](packages/database/prisma/schema.prisma). Both apps
  consume the generated Prisma client and types exclusively through the
  `@cms/database` export.
- **Modular NestJS** — every domain owns its Controller, Service, and DTOs
  (see [`apps/admin-api/src/products`](apps/admin-api/src/products)).
- **Shared Interface Registry** — HTTP contracts live in
  [`packages/types`](packages/types/src) and are imported by both sides.
- **Zero-Config Local Setup** — `pnpm install` + `pnpm db:up` + migrate + seed.

## Tech stack

| Layer      | Technology                                   |
| ---------- | -------------------------------------------- |
| Storefront | Next.js 15 (App Router), React 19            |
| Admin API  | NestJS 11                                    |
| ORM / DB   | Prisma 7 (pg driver adapter) + PostgreSQL 16 |
| Styling    | Tailwind CSS + shadcn-style UI               |
| API docs   | OpenAPI / Swagger (`@nestjs/swagger`)        |
| Logging    | pino (`nestjs-pino`) + request IDs           |
| Testing    | Jest + Supertest (API), Vitest + RTL (web)   |
| Monorepo   | pnpm workspaces                              |
| Local DB   | Docker Compose                               |

## Prerequisites

- **Node.js** ≥ 20 (developed on Node 26)
- **pnpm** ≥ 11 — `npm i -g pnpm` (or `corepack enable pnpm`)
- **Docker Desktop** (for the local PostgreSQL container)

## Quickstart

```bash
# 1. Install dependencies (generates the Prisma client on postinstall)
pnpm install

# 2. Copy env templates (optional — defaults already work for local dev)
cp .env.example .env

# 3. Start PostgreSQL
pnpm db:up

# 4. Apply the schema and seed demo data
pnpm db:migrate      # first run will prompt for a migration name, e.g. "init"
pnpm db:seed

# 5. Run both apps (builds shared packages first, then watches everything)
pnpm dev
```

Then open:

- Storefront → <http://localhost:3000> (product grid at `/products`)
- Admin API → <http://localhost:4000/products>
- API docs (Swagger UI) → <http://localhost:4000/docs>
- Health check → <http://localhost:4000/health>

## Root scripts

| Script            | Description                                             |
| ----------------- | ------------------------------------------------------- |
| `pnpm db:up`      | Start the local PostgreSQL container (Docker Compose)   |
| `pnpm db:down`    | Stop the container                                      |
| `pnpm db:migrate` | Create & apply a dev migration (`prisma migrate dev`)   |
| `pnpm db:seed`    | Seed demo categories & products                         |
| `pnpm db:studio`  | Open Prisma Studio                                      |
| `pnpm dev`        | Build shared packages, then run both apps in watch mode |
| `pnpm build`      | Build every workspace in dependency order               |
| `pnpm test`       | Run all workspace test suites (Jest e2e + Vitest)       |
| `pnpm lint`       | Lint the monorepo (ESLint flat config)                  |
| `pnpm format`     | Format with Prettier                                    |

## Ports

| Service    | Port |
| ---------- | ---- |
| Storefront | 3000 |
| Admin API  | 4000 |
| PostgreSQL | 5432 |

## Workspace layout

```
apps/
  storefront/     Next.js 15 storefront (App Router)
  admin-api/      NestJS 11 admin & REST API
packages/
  database/       Prisma schema, migrations, seed, shared client (@cms/database)
  types/          Shared TypeScript contracts (@cms/types)
```

## Platform foundations

Cross-cutting primitives every domain slice builds on (Roadmap Epic 1.0):

- **Paginated lists** — collection endpoints return a generic
  `PaginatedResponse<T>` (`{ data, meta }`) from `@cms/types`. `GET` list routes
  accept `?page=`, `?pageSize=` (1–100), and `?sort=field:direction`
  (e.g. `?sort=priceCents:asc`); sortable fields are allowlisted per resource.
- **Consistent errors** — a global exception filter serializes every error into
  the shared `ApiError` envelope (`statusCode`, `message`, `error`, `path`,
  `timestamp`, `requestId`). Validation failures keep a field-level `message[]`.
- **OpenAPI docs** — Swagger UI at `/docs`, raw spec at `/docs-json`
  (`@nestjs/swagger`, auto-introspected from DTOs).
- **Structured logging** — `nestjs-pino` request logging with per-request IDs.
  Send `x-request-id` to reuse a trace id; it is always echoed on the response
  and correlates with the `requestId` in error bodies.
- **Health check** — liveness probe at `/health`.
- **Rate limiting** — `@nestjs/throttler` guards all mutating routes
  (POST/PATCH/PUT/DELETE); reads are never throttled. Tune with `THROTTLE_LIMIT`
  / `THROTTLE_TTL`.
- **Tests** — `pnpm test` runs Jest + Supertest e2e for the API and
  Vitest + React Testing Library for storefront components.

## Products API (current slice)

| Method | Route                 | Description                                         |
| ------ | --------------------- | --------------------------------------------------- |
| GET    | `/products`           | List active products (paginated: `page`/`pageSize`/`sort`) |
| GET    | `/products/:idOrSlug` | Get one product by id or slug                       |
| POST   | `/products`           | Create a product                                    |
| PATCH  | `/products/:id`       | Update a product                                    |
| DELETE | `/products/:id`       | Delete a product                                    |

## Roadmap

The following domains are planned as future vertical slices (in priority order):

1. **Auth & RBAC** — JWT auth for the admin API, `User`/`Role` models, guards
   protecting product mutations.
2. **Products depth** — category admin CRUD, inventory, images, storefront
   product-detail pages, search & filtering.
3. **Cart & Orders** — cart persistence, order creation and status lifecycle.
4. **Stripe checkout** — payment intents / checkout sessions and webhook
   listeners that transition order status on payment events.

## License

Open source — add your preferred license (e.g. MIT) here.
