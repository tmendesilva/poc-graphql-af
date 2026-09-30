import "dotenv/config";
import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import { buildSubgraphSchema } from "@apollo/subgraph";
import { typeDefs } from "./schema";
import { resolvers } from "./resolvers";
import { createLoaders } from "./loaders";

const server = new ApolloServer({
  schema: buildSubgraphSchema([{ typeDefs, resolvers }]),
});

const port = process.env.PORT ? Number(process.env.PORT) : 4003;

startStandaloneServer(server, {
  listen: { port },
  context: async () => ({ loaders: createLoaders() }),
})
  .then(({ url }) => {
    console.log(`Order subgraph ready at ${url}`);
  })
  .catch((error) => {
    console.error("Order subgraph failed to start:", error);
    process.exit(1);
  });
