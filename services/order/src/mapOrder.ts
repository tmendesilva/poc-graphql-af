export interface OrderRecord {
  id: string;
  createdAt: Date;
  salesmanId: string;
  productIds: string[];
}

export function mapOrder(order: OrderRecord) {
  return {
    id: order.id,
    createdAt: order.createdAt.toISOString(),
    salesman: { __typename: "Salesman", id: order.salesmanId },
    products: order.productIds.map((id) => ({ __typename: "Product", id })),
  };
}
