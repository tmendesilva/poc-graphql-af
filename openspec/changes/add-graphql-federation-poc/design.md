# Design

## Context

See proposal.md - Why. This is a greenfield POC (repo currently only has OpenSpec scaffolding); no existing code, services, or conventions constrain the approach. Three decisions were confirmed with the user up front and drive this design:
- Each service uses a **real database**, not in-memory mock data.
- The **services themselves run locally via a pnpm workspace monorepo** (not Docker Compose).
- The gateway is **Apollo Gateway (Node)** using `IntrospectAndCompose`, not Apollo Router.

## Goals / Non-Goals

**Goals:**
- Prove that three independently-owned Apollo Federation subgraphs, each with its own database, can be composed by Apollo Gateway into one queryable graph.
- Prove that a federated query spanning `Order` → `Salesman` and `Order` → `Product` resolves correctly across service/database boundaries in a single client request.
- Keep the POC runnable end-to-end by one person locally with a small number of commands.

**Non-Goals:**
- Production concerns: auth/authz, rate limiting, observability, CI/CD, managed federation (Apollo Studio/Uplink), horizontal scaling.
- Data model completeness: no order line-item quantities, pricing/currency handling, inventory, or salesman/product mutations beyond what's needed to demonstrate federation (seed data + read queries).
- Automated test suite; verification is via manual/scripted GraphQL queries against the composed gateway (captured in tasks.md).

## Decisions

### Language & package management: TypeScript + pnpm workspaces
Apollo's federation libraries (`@apollo/server`, `@apollo/subgraph`, `@apollo/gateway`) are first-class in the Node/TypeScript ecosystem and this is what most Apollo Federation examples and docs assume, minimizing POC friction. pnpm workspaces (confirmed with user) give one monorepo with a package per service, shared root tooling (TypeScript config, lint), and a single install step. Alternative considered: separate repos per service (more realistic for "independent microservices" but adds multi-repo overhead irrelevant to what this POC validates).

### Monorepo layout
```
/
├── pnpm-workspace.yaml
├── services/
│   ├── salesman/   (Apollo subgraph + its own DB schema/migrations)
│   ├── product/    (Apollo subgraph + its own DB schema/migrations)
│   └── order/      (Apollo subgraph + its own DB schema/migrations)
└── gateway/        (Apollo Gateway composing the three subgraph URLs)
```
Each service package is self-contained (own `package.json`, own DB connection config, own GraphQL schema) to reflect real microservice ownership boundaries, even though they live in one repo for POC convenience.

### Database: PostgreSQL, one instance per service, via Docker Compose (infra only)
Postgres is used for all three services for consistency and because it's the most common relational choice for this kind of demo data (salesmen, products, orders). "One database per service" (confirmed with user) is implemented as one Postgres container per service in a `docker-compose.yml` at the repo root — this provides real, isolated per-service persistence without requiring each developer to install/manage Postgres manually. This does not conflict with the "pnpm monorepo, run locally" decision: that decision is about how the **Node services** run (locally via pnpm, not containerized); the databases are supporting infra, and Docker Compose is the lightest way to give each service a real, isolated database on a dev machine. Prisma is used as the ORM/migration/seed tool in each service for fast schema iteration and type-safe queries.

Alternative considered: a single shared Postgres instance with three separate logical databases. Rejected because it weakens the "own database per service" proof the POC is meant to give — separate containers make the isolation visible and trivially enforceable (no shared connection string).

### Federation entity modeling
- `Salesman` (salesman subgraph): `@key(fields: "id")`, fields `id`, `name`, `email`. Reference resolver looks up by `id`.
- `Product` (product subgraph): `@key(fields: "id")`, fields `id`, `name`, `price`. Reference resolver looks up by `id`.
- `Order` (order subgraph): `@key(fields: "id")`, fields `id`, `createdAt`, plus:
  - `salesman: Salesman!` — order subgraph stores `salesmanId` and returns a stub `{ __typename: "Salesman", id: salesmanId }`; the gateway federates the rest from the salesman subgraph.
  - `products: [Product!]!` — order subgraph stores `productIds: [ID!]!` and returns stub `{ __typename: "Product", id }` entries; the gateway federates full product data from the product subgraph.

This is the standard Apollo Federation pattern (owning service stores the foreign key, returns a reference stub, gateway does the rest) and is exactly what the POC needs to validate. Order intentionally stores a flat list of product ids (no quantity/line-item wrapper) to keep the entity model minimal — line items are a real-world concern, not a federation-mechanics concern, so they're out of scope (see Non-Goals).

### Gateway composition: `IntrospectAndCompose`
Apollo Gateway builds the supergraph at startup by introspecting the three subgraph URLs (from env/config, e.g. `http://localhost:4001/graphql`, `4002`, `4003`), rather than using managed federation (Apollo Studio/Uplink) or a pre-built supergraph SDL via Rover. This is the simplest option for local POC validation (confirmed with user) — no external account/service is required, and schema changes are picked up by restarting the gateway.

## Risks / Trade-offs

- **[Risk]** `IntrospectAndCompose` re-introspects subgraphs at startup only, so a subgraph schema change isn't picked up without restarting the gateway → **Mitigation**: acceptable for a POC; note it explicitly so it isn't mistaken for a production-ready composition strategy.
- **[Risk]** Three separate Postgres containers add local setup overhead (Docker required) beyond a pure in-memory POC → **Mitigation**: this was an explicit, confirmed trade-off to get a realistic "real database per service" proof; `docker-compose up` keeps the overhead to one command.
- **[Risk]** Stub/reference resolution pattern (services returning `{ __typename, id }` stubs) is easy to get subtly wrong (e.g. wrong `__typename`, missing key field) and fails at the gateway with unclear errors → **Mitigation**: tasks.md includes an explicit end-to-end federated query check against the composed gateway before the POC is considered validated.

## Migration Plan

Not applicable in the deploy/rollback sense (new, standalone POC with no prior version). Bring-up order for local validation:
1. `docker-compose up -d` — starts the three Postgres containers.
2. Run each service's Prisma migrate + seed (salesman, then product, then order — order needs valid salesman/product ids to seed against).
3. Start all three subgraphs, then the gateway, via a root pnpm script (e.g. `concurrently`).
4. Run a federated query through the gateway that fetches an order with its salesman and products, and confirm the response contains data from all three services.
