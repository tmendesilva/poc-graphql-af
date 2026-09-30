# Spec Delta

## Purpose

Owns and serves salesman data as an Apollo Federation subgraph backed by its own database, so other services can attach a salesman to their own entities by reference.

## ADDED Requirements

### Requirement: Salesman Entity Exposed via Federated Subgraph
The salesman service SHALL expose a `Salesman` GraphQL type as a federation entity keyed by `id`, queryable directly from this subgraph.

#### Scenario: Query a single salesman by id
- **WHEN** a client queries `salesman(id: "S1")` against the salesman subgraph
- **THEN** the subgraph returns the `Salesman` object with that id and its fields (id, name, email)

#### Scenario: List all salesmen
- **WHEN** a client queries `salesmen` against the salesman subgraph
- **THEN** the subgraph returns all salesmen currently stored in its database

### Requirement: Salesman Data Persisted in Dedicated Database
Salesman records SHALL be persisted in a database owned exclusively by the salesman service; no other service SHALL read from or write to it directly.

#### Scenario: Salesman data survives a service restart
- **WHEN** the salesman service is restarted after salesmen have been created/seeded
- **THEN** querying `salesmen` after restart still returns the previously stored salesmen

### Requirement: Salesman Entity Reference Resolution
The salesman service SHALL resolve a `Salesman` entity reference containing only the `id` field, as required by Apollo Federation entity resolution, and return the full `Salesman` object for that id.

#### Scenario: Gateway resolves a Salesman reference from another subgraph
- **WHEN** the gateway sends an entity representation `{ __typename: "Salesman", id: "S1" }` to the salesman subgraph as part of resolving a federated query
- **THEN** the salesman subgraph returns the complete `Salesman` object matching that id

#### Scenario: Reference to a non-existent salesman
- **WHEN** the gateway sends an entity representation for a salesman id that does not exist
- **THEN** the salesman subgraph returns `null` for that entity instead of raising an unhandled error
