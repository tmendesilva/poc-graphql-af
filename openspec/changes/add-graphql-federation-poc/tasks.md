# Tasks

## 1. Workspace & Database Infrastructure

- [x] 1.1 Create the pnpm workspace (`pnpm-workspace.yaml`, root `package.json`, shared base `tsconfig.json`) with empty `services/salesman`, `services/product`, `services/order`, and `gateway` packages; verify `pnpm install` succeeds from the repo root
- [x] 1.2 Create `docker-compose.yml` defining one Postgres container per service (salesman-db, product-db, order-db) on distinct ports/volumes; verify `docker-compose up -d` starts all three containers healthy and each is reachable with `psql`/a DB client

## 2. Salesman Service

- [x] 2.1 Scaffold `services/salesman` (package.json, tsconfig, Apollo Server + `@apollo/subgraph` deps) with a Prisma schema for `Salesman(id, name, email)` pointed at `salesman-db`; verify `pnpm --filter salesman prisma migrate dev` creates the table
- [x] 2.2 Implement the `Salesman` subgraph type (`@key(fields: "id")`), `Query.salesman(id)`, `Query.salesmen`, and the `__resolveReference` resolver reading from Prisma per the salesman-service spec; verify the subgraph starts on its own port and a `salesmen` query returns `[]` against an empty DB
- [x] 2.3 Seed sample salesman rows (at least 2); verify `salesmen` query returns the seeded rows after `pnpm --filter salesman run seed`

## 3. Product Service

- [x] 3.1 Scaffold `services/product` (package.json, tsconfig, Apollo Server + `@apollo/subgraph` deps) with a Prisma schema for `Product(id, name, price)` pointed at `product-db`; verify `pnpm --filter product prisma migrate dev` creates the table
- [x] 3.2 Implement the `Product` subgraph type (`@key(fields: "id")`), `Query.product(id)`, `Query.products`, and the `__resolveReference` resolver reading from Prisma per the product-service spec; verify the subgraph starts on its own port and a `products` query returns `[]` against an empty DB
- [x] 3.3 Seed sample product rows (at least 3); verify `products` query returns the seeded rows after `pnpm --filter product run seed`

## 4. Order Service

- [x] 4.1 Scaffold `services/order` (package.json, tsconfig, Apollo Server + `@apollo/subgraph` deps) with a Prisma schema for `Order(id, createdAt, salesmanId, productIds[])` pointed at `order-db`; verify `pnpm --filter order prisma migrate dev` creates the table
- [x] 4.2 Implement the `Order` subgraph type (`@key(fields: "id")`) with `salesman: Salesman!` and `products: [Product!]!` returning federation reference stubs (`{ __typename, id }`) per design.md, plus `Query.order(id)` and `Query.orders`; verify the subgraph starts and a direct `order(id)` query returns the order with unresolved `{ __typename, id }` stubs for `salesman`/`products`
- [x] 4.3 Add validation rejecting an order with no `salesmanId` or an empty `productIds` list, per the order-service spec; verify attempting to create/seed such an order is rejected with a clear error
- [x] 4.4 Seed sample orders referencing real salesman ids (from Task 2.3) and real product ids (from Task 3.3); verify `orders` query returns the seeded orders with correct `salesmanId`/`productIds`

## 5. Federation Gateway

- [x] 5.1 Scaffold `gateway` (package.json, tsconfig, `@apollo/gateway` + `@apollo/server` deps) using `IntrospectAndCompose` against the three subgraph URLs (env-configurable); verify the gateway starts with all three subgraphs running and composition succeeds with no errors logged
- [x] 5.2 Verify composition-failure handling from the federation-gateway spec: stop one subgraph and confirm the gateway fails startup or logs a clear composition error naming the unreachable subgraph, instead of exposing a partial schema
- [x] 5.3 Add a root pnpm script that starts all three subgraphs and the gateway together (e.g. via `concurrently`); verify running it brings up all four processes and the gateway endpoint responds to an introspection query

## 6. End-to-End Validation

- [x] 6.1 Run one federated query through the gateway requesting an order's own fields plus `salesman { name email }` plus `products { name price }`; verify the single response correctly combines data from all three services, per the federation-gateway spec's cross-service scenario
- [x] 6.2 Update a salesman's or product's data directly via its owning subgraph, re-run the same federated order query through the gateway, and verify the change is reflected immediately, proving the gateway holds no stale copy of another service's data
- [x] 6.3 Write a root `README.md` documenting how to run the POC end-to-end (start databases, migrate + seed each service, start all services + gateway, run the sample federated query); verify the documented steps work when followed from a clean checkout
