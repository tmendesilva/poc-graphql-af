import DataLoader from "dataloader";
import { prisma } from "./prisma";
import { mapOrder } from "./mapOrder";

type MappedOrder = ReturnType<typeof mapOrder>;

export interface Loaders {
  ordersBySalesmanId: DataLoader<string, MappedOrder[]>;
}

// One set of loaders per request: batches every Salesman.orders lookup
// requested in that operation into a single `salesmanId IN (...)` query,
// instead of one query per salesman (N+1).
export function createLoaders(): Loaders {
  const ordersBySalesmanId = new DataLoader<string, MappedOrder[]>(async (salesmanIds) => {
    const orders = await prisma.order.findMany({
      where: { salesmanId: { in: [...salesmanIds] } },
    });

    const ordersById = new Map<string, MappedOrder[]>();
    for (const order of orders) {
      const mapped = mapOrder(order);
      const existing = ordersById.get(order.salesmanId);
      if (existing) {
        existing.push(mapped);
      } else {
        ordersById.set(order.salesmanId, [mapped]);
      }
    }

    return salesmanIds.map((salesmanId) => ordersById.get(salesmanId) ?? []);
  });

  return { ordersBySalesmanId };
}
