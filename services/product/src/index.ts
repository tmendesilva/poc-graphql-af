import "dotenv/config";
import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import { buildSubgraphSchema } from "@apollo/subgraph";
import { typeDefs } from "./schema";
import { resolvers } from "./resolvers";

const server = new ApolloServer({
  schema: buildSubgraphSchema([{ typeDefs, resolvers }]),
});

const port = process.env.PORT ? Number(process.env.PORT) : 4002;

startStandaloneServer(server, { listen: { port } })
  .then(({ url }) => {
    console.log(`Product subgraph ready at ${url}`);
  })
  .catch((error) => {
    console.error("Product subgraph failed to start:", error);
    process.exit(1);
  });
