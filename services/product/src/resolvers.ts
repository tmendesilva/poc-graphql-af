import { prisma } from "./prisma";

export const resolvers = {
  Query: {
    product: (_parent: unknown, args: { id: string }) =>
      prisma.product.findUnique({ where: { id: args.id } }),
    products: () => prisma.product.findMany(),
  },
  Product: {
    __resolveReference: (reference: { id: string }) =>
      prisma.product.findUnique({ where: { id: reference.id } }),
  },
};
