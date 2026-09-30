import { prisma } from "./prisma";
import { mapOrder } from "./mapOrder";
import type { Loaders } from "./loaders";

interface Context {
  loaders: Loaders;
}

export const resolvers = {
  Query: {
    order: async (_parent: unknown, args: { id: string }) => {
      const order = await prisma.order.findUnique({ where: { id: args.id } });
      return order ? mapOrder(order) : null;
    },
    orders: async () => {
      const orders = await prisma.order.findMany();
      return orders.map(mapOrder);
    },
  },
  Salesman: {
    __resolveReference: (reference: { id: string }) => reference,
    orders: (parent: { id: string }, _args: unknown, context: Context) =>
      context.loaders.ordersBySalesmanId.load(parent.id),
  },
};
