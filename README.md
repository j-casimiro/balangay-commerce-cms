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

## Products API (current slice)

| Method | Route                 | Description                   |
| ------ | --------------------- | ----------------------------- |
| GET    | `/products`           | List active products          |
| GET    | `/products/:idOrSlug` | Get one product by id or slug |
| POST   | `/products`           | Create a product              |
| PATCH  | `/products/:id`       | Update a product              |
| DELETE | `/products/:id`       | Delete a product              |

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
