import gql from "graphql-tag";

export const typeDefs = gql`
  extend schema
    @link(url: "https://specs.apollo.dev/federation/v2.6", import: ["@key"])

  type Order @key(fields: "id") {
    id: ID!
    createdAt: String!
    salesman: Salesman!
    products: [Product!]!
  }

  type Salesman @key(fields: "id") {
    id: ID!
    orders: [Order!]!
  }

  type Product @key(fields: "id", resolvable: false) {
    id: ID!
  }

  type Query {
    order(id: ID!): Order
    orders: [Order!]!
  }
`;
