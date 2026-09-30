import { prisma } from "./prisma";

export const resolvers = {
  Query: {
    salesman: (_parent: unknown, args: { id: string }) =>
      prisma.salesman.findUnique({ where: { id: args.id } }),
    salesmen: () => prisma.salesman.findMany(),
  },
  Salesman: {
    __resolveReference: (reference: { id: string }) =>
      prisma.salesman.findUnique({ where: { id: reference.id } }),
  },
};
