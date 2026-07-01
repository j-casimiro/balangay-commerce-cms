# Roadmap

This document is the source of truth for building Balangay Commerce CMS out from
its current skeleton into a full open-source, headless e-commerce platform with
a content-management admin.

## Where we are today

The repo ships a working **Products vertical slice** proving the architecture
end to end:

```
PostgreSQL → Prisma → NestJS Products API → HTTP/JSON → Next.js storefront
```

- **Data models:** only `Product` and `Category`.
- **API:** Products CRUD (`apps/admin-api/src/products`).
- **Storefront:** home page + `/products` grid.
- **Greenfield:** auth, cart, orders, checkout, payments, search, media,
  customer accounts, and the entire CMS/admin surface.

## How the work is phased

- **Phase 1 — E-Commerce Engine:** everything needed to actually sell — auth,
  richer catalog, browsing, cart, checkout, orders, Stripe payments, customer
  accounts, and commerce enhancers.
- **Phase 2 — CMS & Admin:** a dedicated `apps/admin` dashboard app plus the
  content-management layer (media, content pages/page builder, navigation,
  merchandising, SEO, settings, i18n, governance).

Phases are ordered by dependency, not just priority. **Auth & RBAC and a small
Platform-foundations epic come first** because cart, orders, accounts, and the
whole admin app depend on them.

## Conventions every epic follows

Each new domain is built as a **vertical slice**, mirroring the existing products
module:

1. **Schema** — add the model(s) to
   [`packages/database/prisma/schema.prisma`](packages/database/prisma/schema.prisma),
   migrate, and extend the seed.
2. **Contracts** — add domain models + request/response types to
   [`packages/types/src`](packages/types/src) (`models.ts`, `api.ts`).
3. **API** — add a NestJS module (`controller` + `service` + `dto/`) under
   [`apps/admin-api/src`](apps/admin-api/src), following
   [`apps/admin-api/src/products`](apps/admin-api/src/products) as the template
   (DTOs `implements` the shared input types; Prisma injected via `PRISMA_CLIENT`).
4. **Front-end** — consume the API from the storefront and/or admin app.

House rules that carry across the roadmap:

- Money is always integer `priceCents` + a `currency` code; never floats.
- API dates are ISO strings at the JSON boundary.
- The `ApiError` envelope in `packages/types/src/api.ts` is the standard error shape.
- Mutations are role-guarded once auth lands (Epic 1.1).
- **Commit per task, not per epic.** Make a focused commit as each checklist item
  lands (check the box in that same commit) so the epic's PR reads as a series of
  small, reviewable steps rather than one large diff.

To pick up an epic: check off its tasks below in the PR that implements the slice.

---

## Phase 1 — E-Commerce Engine

### Epic 1.0 — Platform foundations (cross-cutting)
Consistent primitives every later slice builds on.

- [x] Standardize list responses: generic `PaginatedResponse<T>` in `@cms/types`; add `page`/`pageSize`/`sort` query DTOs; retrofit `GET /products`.
- [x] Global exception filter emitting the existing `ApiError` envelope; consistent validation error shape.
- [x] OpenAPI/Swagger via `@nestjs/swagger` served at `/docs`.
- [x] Test harness: Jest + Supertest e2e for the API; Vitest + React Testing Library for storefront components.
- [x] Structured logging (pino / `nestjs-pino`) + request IDs; `/health` endpoint.
- [x] Basic rate limiting (`@nestjs/throttler`) on mutating routes.

### Epic 1.1 — Auth & RBAC (foundational)
JWT auth for customers and staff; guards protecting every mutation.

- [ ] Schema: `User` (email, `passwordHash`, name), `Role` enum (`CUSTOMER` / `STAFF` / `ADMIN`), optional `RefreshToken`/session model.
- [ ] Types: `AuthUser`, `LoginInput`, `RegisterInput`, `AuthTokens`, `SessionResponse` in `@cms/types`.
- [ ] API: `auth` module — register / login / logout / refresh, password hashing (argon2 or bcrypt), JWT access + refresh, `@nestjs/passport` strategy.
- [ ] Guards + decorators: `JwtAuthGuard`, `RolesGuard`, `@Roles()`, `@CurrentUser()`; protect all product/category mutations.
- [ ] Storefront: auth context, login/register pages, session persistence.

### Epic 1.2 — Catalog depth
Turn the flat product model into a real catalog.

- [ ] Category admin CRUD API (mirror the products slice) + nested/parent categories.
- [ ] Product **variants** (size/color): `ProductVariant` model with its own SKU, price, stock, and options.
- [ ] Product **media**: `ProductImage` model (multiple images, ordering, alt text) replacing the single `imageUrl`.
- [ ] Inventory: stock tracking at the variant level; low-stock flag; prevent overselling.
- [ ] Tags/attributes + SEO fields (`metaTitle`, `metaDescription`) on products.

### Epic 1.3 — Storefront browsing
Let customers actually find and view products.

- [ ] Product detail page `apps/storefront/src/app/products/[slug]/page.tsx` (gallery, variant picker, live stock/price, add-to-cart).
- [ ] Search endpoint + storefront search UI (name/description — Postgres full-text or `ILIKE` to start).
- [ ] Filtering (category, price range, tags, in-stock) + sorting + pagination UI.
- [ ] Category landing pages `/categories/[slug]`.

### Epic 1.4 — Cart
Persistent cart for guests and logged-in customers.

- [ ] Schema: `Cart` + `CartItem` (guest carts via token/cookie; merge into the user cart on login).
- [ ] Types + API: add / update / remove item, get cart, server-computed totals (subtotal, item count).
- [ ] Storefront: cart context/state, cart drawer + `/cart` page; wire up the existing "Add to cart" buttons (currently no-ops).

### Epic 1.5 — Checkout
Convert a cart into an order draft.

- [ ] Schema: `Address` model (shipping/billing) linked to user/order.
- [ ] Checkout API: create an order draft from a cart, validate stock, compute totals (items + shipping + tax).
- [ ] Storefront: multi-step checkout (address → shipping → review) at `/checkout`.

### Epic 1.6 — Orders
Order lifecycle and history.

- [ ] Schema: `Order` + `OrderItem` (price snapshot at purchase), `OrderStatus` enum (`PENDING` / `PAID` / `FULFILLED` / `CANCELLED` / `REFUNDED`), human-readable order number.
- [ ] API: create / list / get orders (customer-scoped and admin-scoped); status-transition service.
- [ ] Storefront: order confirmation page + order detail.

### Epic 1.7 — Payments (Stripe)
Take real money and reconcile it against orders.

- [ ] `payments` module: create a Stripe Checkout Session / PaymentIntent from an order.
- [ ] Webhook endpoint (raw body) handling `checkout.session.completed` / `payment_intent.succeeded` → transition the order to `PAID`; handle failures and refunds.
- [ ] Storefront: redirect-to-Stripe (or embedded) checkout + success/cancel return pages; env-driven Stripe keys.

### Epic 1.8 — Customer accounts
Self-service for returning customers.

- [ ] Account area `/account`: profile, saved addresses (CRUD), order history.
- [ ] Password reset flow (token delivered via email).

### Epic 1.9 — Commerce enhancers
The features that make the store competitive.

- [ ] Discounts/coupons: `Coupon`/`Discount` model, validation at checkout (percentage/fixed, expiry, usage limits).
- [ ] Shipping & tax: `ShippingMethod`/rate model and tax rules (start flat/region-based).
- [ ] Reviews & ratings: `Review` model (with a moderation flag), storefront display + submit.
- [ ] Wishlist/favorites (customer-scoped).
- [ ] Transactional email (order confirmation, password reset) via a pluggable mailer (Resend or Nodemailer).

---

## Phase 2 — CMS & Admin

### Epic 2.0 — Admin dashboard app scaffold
Stand up the CMS front-end.

- [ ] New Next.js app `apps/admin` (Tailwind + shadcn-style, reusing storefront UI conventions); register in the workspace and `pnpm dev`.
- [ ] Admin auth (login gated to `STAFF`/`ADMIN`), protected layout, sidebar navigation, shared API client against `NEXT_PUBLIC_API_URL`.
- [ ] Dashboard home with KPIs (sales, orders, low stock).

### Epic 2.1 — Catalog management UIs
Manage the Phase 1 catalog visually.

- [ ] Products: list / create / edit / delete with variants, media upload, category assignment, and SEO fields.
- [ ] Categories: tree management.
- [ ] Inventory: stock adjustments view.

### Epic 2.2 — Order & customer management
Operate the store day to day.

- [ ] Orders: list / filter / detail, status transitions, refunds.
- [ ] Customers: list / detail, order history, role assignment.

### Epic 2.3 — Media / asset management
Central asset store reused by products and content.

- [ ] `MediaAsset` model + upload API (local disk in dev, S3-compatible in prod); image processing/thumbnails.
- [ ] Admin media library (browse / upload / select), reused by the product and content editors.

### Epic 2.4 — Content pages & page builder
The core "CMS" — editable, published pages.

- [ ] Schema: `Page` (slug, draft/published status, SEO) + `ContentBlock` (typed sections: hero, rich text, product grid, banner, image).
- [ ] Admin page editor with add / reorder / edit blocks (start with a fixed block palette; rich text via a block/markdown editor).
- [ ] Storefront dynamic rendering: a catch-all route renders published pages/blocks; convert the hardcoded home hero into CMS-managed blocks.

### Epic 2.5 — Navigation & merchandising
Editorial control over how the store presents itself.

- [ ] Menu/navigation management (header/footer links).
- [ ] Banners / announcement bars / featured collections managed as content.

### Epic 2.6 — Blog / articles (optional content type)
Owned content for SEO and marketing.

- [ ] `Article` model + admin CRUD + storefront `/blog` index and post pages.

### Epic 2.7 — SEO & site settings
Discoverability and global configuration.

- [ ] `sitemap.xml` + `robots.txt` generation; JSON-LD structured data for products and pages.
- [ ] Redirects management model + storefront middleware.
- [ ] Store settings: branding, default currency, contact info, social links, theme tokens.

### Epic 2.8 — i18n / localization
Sell across languages and currencies.

- [ ] Multi-language content (translations for products/pages) + locale routing on the storefront.
- [ ] Multi-currency display/config.

### Epic 2.9 — Governance
Trust and accountability for admin operations.

- [ ] Roles & permissions admin UI (fine-grained beyond the base enum if needed).
- [ ] Audit log (`AuditLog` model) capturing admin mutations; activity feed.
