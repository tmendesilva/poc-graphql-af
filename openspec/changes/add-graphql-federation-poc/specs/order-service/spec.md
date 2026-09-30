# Spec Delta

## Purpose

Owns and serves order data as an Apollo Federation subgraph backed by its own database, where each order belongs to exactly one salesman and contains one or more products owned by other services.

## ADDED Requirements

### Requirement: Order Entity Exposed via Federated Subgraph
The order service SHALL expose an `Order` GraphQL type as a federation entity keyed by `id`, queryable directly from this subgraph, including a reference to the owning salesman and to the list of products it contains.

#### Scenario: Query a single order by id
- **WHEN** a client queries `order(id: "O1")` against the order subgraph
- **THEN** the subgraph returns the `Order` object with that id, its own fields, a `salesman` reference, and a `products` list of references

#### Scenario: List all orders
- **WHEN** a client queries `orders` against the order subgraph
- **THEN** the subgraph returns all orders currently stored in its database

### Requirement: Order Belongs to Exactly One Salesman
Every order SHALL belong to exactly one salesman, identified by a salesman id stored on the order. The order service SHALL NOT store salesman data itself, only the reference.

#### Scenario: Order exposes its owning salesman as a federated reference
- **WHEN** a client queries an order's `salesman` field through the gateway
- **THEN** the gateway resolves the full `Salesman` object from the salesman subgraph using the salesman id stored on the order

#### Scenario: Order cannot be created without a salesman
- **WHEN** an order is created/seeded without a salesman id
- **THEN** the order service rejects it as invalid

### Requirement: Order Contains One or More Products
Every order SHALL contain a list of at least one product, identified by product ids stored on the order. The order service SHALL NOT store product data itself, only the references.

#### Scenario: Order exposes its products as federated references
- **WHEN** a client queries an order's `products` field through the gateway
- **THEN** the gateway resolves the full list of `Product` objects from the product subgraph using the product ids stored on the order

#### Scenario: Order cannot be created with an empty product list
- **WHEN** an order is created/seeded with zero products
- **THEN** the order service rejects it as invalid

### Requirement: Order Data Persisted in Dedicated Database
Order records (including the salesman id and product ids they reference) SHALL be persisted in a database owned exclusively by the order service.

#### Scenario: Order data survives a service restart
- **WHEN** the order service is restarted after orders have been created/seeded
- **THEN** querying `orders` after restart still returns the previously stored orders with their salesman and product references intact
