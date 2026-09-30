export interface OrderInput {
  salesmanId?: string | null;
  productIds?: string[] | null;
}

export function validateOrderInput(input: OrderInput): void {
  if (!input.salesmanId) {
    throw new Error("Order must belong to a salesman (salesmanId is required)");
  }
  if (!input.productIds || input.productIds.length === 0) {
    throw new Error("Order must contain at least one product (productIds must be non-empty)");
  }
}
