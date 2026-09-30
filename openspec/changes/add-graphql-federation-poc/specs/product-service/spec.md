# Spec Delta

## Purpose

Owns and serves product data as an Apollo Federation subgraph backed by its own database, so other services can reference products without duplicating product data.

## ADDED Requirements

### Requirement: Product Entity Exposed via Federated Subgraph
The product service SHALL expose a `Product` GraphQL type as a federation entity keyed by `id`, queryable directly from this subgraph.

#### Scenario: Query a single product by id
- **WHEN** a client queries `product(id: "P1")` against the product subgraph
- **THEN** the subgraph returns the `Product` object with that id and its fields (id, name, price)

#### Scenario: List all products
- **WHEN** a client queries `products` against the product subgraph
- **THEN** the subgraph returns all products currently stored in its database

### Requirement: Product Data Persisted in Dedicated Database
Product records SHALL be persisted in a database owned exclusively by the product service; no other service SHALL read from or write to it directly.

#### Scenario: Product data survives a service restart
- **WHEN** the product service is restarted after products have been created/seeded
- **THEN** querying `products` after restart still returns the previously stored products

### Requirement: Product Entity Reference Resolution
The product service SHALL resolve a `Product` entity reference containing only the `id` field, as required by Apollo Federation entity resolution, and return the full `Product` object for that id.

#### Scenario: Gateway resolves a Product reference from another subgraph
- **WHEN** the gateway sends an entity representation `{ __typename: "Product", id: "P1" }` to the product subgraph as part of resolving a federated query
- **THEN** the product subgraph returns the complete `Product` object matching that id

#### Scenario: Reference to a non-existent product
- **WHEN** the gateway sends an entity representation for a product id that does not exist
- **THEN** the product subgraph returns `null` for that entity instead of raising an unhandled error
