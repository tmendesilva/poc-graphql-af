# Proposal

## Why

We need a proof of concept to validate whether GraphQL with Apollo Federation is a viable architecture for our microservices, before committing to it for real product work. The POC must prove that independently owned services can each expose their own GraphQL subgraph, that those subgraphs can be composed into a single unified graph, and that entity references can cross service boundaries (an order referencing products and a salesman owned by other services) through federation rather than ad-hoc REST calls or data duplication.

## What Changes

- Introduce three independently deployable Node.js/TypeScript microservices, each an Apollo Federation subgraph with its own database:
  - `salesman` service — owns the `Salesman` entity.
  - `product` service — owns the `Product` entity.
  - `order` service — owns the `Order` entity, which contains a list of `Product` references and belongs to one `Salesman`.
- Introduce a gateway service (Apollo Gateway, Node.js) that composes the three subgraphs via schema introspection (`IntrospectAndCompose`) into a single supergraph and routes client queries across services, including resolving `Order.products` and `Order.salesman` by federating into the `product` and `salesman` subgraphs.
- Set up the whole POC as a single pnpm workspace monorepo (one package per service + gateway) so all services can be installed and started together for local validation.
- Each service persists its data in its own database (one DB per service, no shared database), seeded with sample data sufficient to demonstrate cross-service queries.

## Capabilities

### New Capabilities
- `salesman-service`: GraphQL subgraph exposing the `Salesman` entity (query by id, list, federation key) backed by its own database.
- `product-service`: GraphQL subgraph exposing the `Product` entity (query by id, list, federation key) backed by its own database.
- `order-service`: GraphQL subgraph exposing the `Order` entity, which references a list of `Product` entities and a single `Salesman` entity via federation, backed by its own database.
- `federation-gateway`: Composition of the three subgraphs into one supergraph via Apollo Gateway, and routing of cross-service federated queries (e.g. fetching an order together with its products and its salesman in one request).

### Modified Capabilities
(none — this is a new, standalone POC)

## Impact

- **New code**: `services/salesman`, `services/product`, `services/order`, `gateway` packages in a new pnpm workspace monorepo at the repo root; no existing code is touched (repo is currently empty aside from OpenSpec scaffolding).
- **New infrastructure**: one database instance per service (three databases total), each service's own connection/config.
- **New dependencies**: `@apollo/server`, `@apollo/subgraph`, `@apollo/gateway`, `graphql`, `pnpm` workspaces, plus a database client library (chosen in design.md).
- **No breaking changes**: nothing pre-existing depends on this.
