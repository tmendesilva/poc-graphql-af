# Spec Delta

## Purpose

Composes the salesman, product, and order subgraphs into a single unified GraphQL endpoint, so clients can query across services in one request without knowing they are backed by separate microservices.

## ADDED Requirements

### Requirement: Gateway Composes All Subgraphs into a Supergraph
The gateway SHALL, at startup, introspect the salesman, product, and order subgraphs and compose their schemas into a single supergraph exposed on one GraphQL endpoint.

#### Scenario: Successful startup composition
- **WHEN** the gateway starts and all three subgraphs are reachable and their schemas compose without conflicts
- **THEN** the gateway exposes a single GraphQL endpoint serving the combined schema, including the `Order`, `Product`, and `Salesman` types

#### Scenario: Composition fails when a subgraph is unreachable
- **WHEN** the gateway starts and one of the three subgraphs is unreachable
- **THEN** the gateway does not silently expose a partial schema; it fails startup or reports a clear composition error identifying the unreachable subgraph

### Requirement: Gateway Resolves Cross-Service Queries in One Response
The gateway SHALL route a single client query that spans multiple subgraphs into the corresponding per-subgraph requests, and return one composed response.

#### Scenario: Query an order together with its salesman and products
- **WHEN** a client sends one query requesting an order's own fields, its `salesman { name email }`, and its `products { name price }`
- **THEN** the gateway fetches the order from the order subgraph, resolves the `salesman` reference against the salesman subgraph, resolves each `products` reference against the product subgraph, and returns a single JSON response containing all of it correctly assembled

#### Scenario: Referenced entity data reflects the owning service
- **WHEN** the product or salesman data referenced by an order changes in its owning service
- **THEN** a subsequent federated query for that order through the gateway reflects the updated data, proving the gateway is not caching a stale copy of another service's data
