import "dotenv/config";
import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import { ApolloGateway, IntrospectAndCompose } from "@apollo/gateway";

const gateway = new ApolloGateway({
  supergraphSdl: new IntrospectAndCompose({
    subgraphs: [
      { name: "salesman", url: process.env.SALESMAN_URL ?? "http://localhost:4001/" },
      { name: "product", url: process.env.PRODUCT_URL ?? "http://localhost:4002/" },
      { name: "order", url: process.env.ORDER_URL ?? "http://localhost:4003/" },
    ],
  }),
});

const server = new ApolloServer({ gateway });

const port = process.env.PORT ? Number(process.env.PORT) : 4000;

startStandaloneServer(server, { listen: { port } })
  .then(({ url }) => {
    console.log(`Gateway ready at ${url}`);
  })
  .catch((error) => {
    console.error("Gateway failed to start (subgraph composition error):", error);
    process.exit(1);
  });
