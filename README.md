# GraphQL Apollo Federation POC

A proof of concept validating [Apollo Federation](https://www.apollographql.com/docs/federation/) across three independently owned microservices:

- **salesman** — owns the `Salesman` entity, its own Postgres database.
- **product** — owns the `Product` entity, its own Postgres database.
- **order** — owns the `Order` entity, its own Postgres database. Each order belongs to exactly one salesman and contains one or more products, referenced via Apollo Federation entity references (not duplicated data).
- **gateway** — an Apollo Gateway that introspects the three subgraphs above and composes them into a single supergraph endpoint.

See `openspec/changes/add-graphql-federation-poc/` for the full proposal, specs, and design decisions behind this POC.

## Prerequisites

- Node.js 20+
- pnpm
- Docker (with Compose)

## 1. Install dependencies

```bash
pnpm install
```

## 2. Start the databases

Each service gets its own isolated Postgres container.

```bash
docker compose up -d
```

## 3. Migrate and seed each service's database

```bash
pnpm run migrate
pnpm run seed
```

This creates each service's schema and inserts sample data:
- Salesmen `s1` (Alice Johnson) and `s2` (Bruno Silva)
- Products `p1` (Wireless Mouse), `p2` (Mechanical Keyboard), `p3` (USB-C Dock)
- Orders `o1` (salesman `s1`, products `p1`+`p2`) and `o2` (salesman `s2`, product `p3`)

The order seed script also demonstrates that an order with no salesman or with an empty product list is rejected before insertion.

## 4. Start all services + the gateway

```bash
pnpm run dev
```

This starts the three subgraphs (ports `4001`, `4002`, `4003`) and the gateway (port `4000`) together. The gateway composes the subgraphs at startup via `IntrospectAndCompose` — if any subgraph isn't reachable yet, the gateway will fail to start with a clear error naming the unreachable subgraph; just make sure all three subgraphs are up before the gateway starts (the `pnpm run dev` script starts them concurrently, so watch the logs for all four "ready" messages).

## 5. Run a federated query

Open `http://localhost:4000/` (Apollo Sandbox) or `curl`:

```bash
curl -s -X POST http://localhost:4000/ \
  -H "Content-Type: application/json" \
  -d '{"query":"{ orders { id salesman { name email } products { name price } } }"}'
```

The response combines data fetched from all three services in a single request:

```json
{
  "data": {
    "orders": [
      {
        "id": "o1",
        "salesman": { "name": "Alice Johnson", "email": "alice.johnson@example.com" },
        "products": [
          { "name": "Wireless Mouse", "price": 29.99 },
          { "name": "Mechanical Keyboard", "price": 89.99 }
        ]
      },
      {
        "id": "o2",
        "salesman": { "name": "Bruno Silva", "email": "bruno.silva@example.com" },
        "products": [{ "name": "USB-C Dock", "price": 59.5 }]
      }
    ]
  }
}
```

Updating a salesman's or product's data directly in its owning database and re-running this query shows the gateway always reflects the current data — it holds no cached copy of another service's data.

## Project layout

```
/
├── docker-compose.yml     # one Postgres container per service
├── services/
│   ├── salesman/          # Salesman subgraph + its own DB
│   ├── product/           # Product subgraph + its own DB
│   └── order/              # Order subgraph + its own DB
└── gateway/                # Apollo Gateway composing the three subgraphs
```
