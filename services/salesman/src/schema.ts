import gql from "graphql-tag";

export const typeDefs = gql`
  extend schema
    @link(url: "https://specs.apollo.dev/federation/v2.6", import: ["@key"])

  type Salesman @key(fields: "id") {
    id: ID!
    name: String!
    email: String!
  }

  type Query {
    salesman(id: ID!): Salesman
    salesmen: [Salesman!]!
  }
`;
