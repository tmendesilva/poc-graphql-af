import "dotenv/config";
import { prisma } from "../src/prisma";
import { validateOrderInput } from "../src/validateOrderInput";

const orders = [
  { id: "o1", salesmanId: "s1", productIds: ["p1", "p2"] },
  { id: "o2", salesmanId: "s2", productIds: ["p3"] },
  { id: "o3", salesmanId: "s3", productIds: ["p4", "p5", "p6"] },
  { id: "o4", salesmanId: "s4", productIds: ["p7"] },
  { id: "o5", salesmanId: "s5", productIds: ["p8", "p9"] },
  { id: "o6", salesmanId: "s1", productIds: ["p10", "p11", "p12"] },
  { id: "o7", salesmanId: "s2", productIds: ["p13"] },
  { id: "o8", salesmanId: "s3", productIds: ["p14", "p15"] },
  { id: "o9", salesmanId: "s4", productIds: ["p16", "p17", "p18"] },
  { id: "o10", salesmanId: "s5", productIds: ["p19", "p20"] },
];

async function main() {
  // Confirm invalid orders are rejected before touching the database.
  try {
    validateOrderInput({ salesmanId: undefined, productIds: ["p1"] });
    throw new Error("Expected validation to reject an order with no salesmanId");
  } catch (error) {
    console.log(`Validation correctly rejected missing salesmanId: ${(error as Error).message}`);
  }
  try {
    validateOrderInput({ salesmanId: "s1", productIds: [] });
    throw new Error("Expected validation to reject an order with an empty productIds list");
  } catch (error) {
    console.log(`Validation correctly rejected empty productIds: ${(error as Error).message}`);
  }

  for (const order of orders) {
    validateOrderInput(order);
    await prisma.order.upsert({
      where: { id: order.id },
      update: order,
      create: order,
    });
  }
  console.log(`Seeded ${orders.length} orders.`);
}

main()
  .catch((error) => {
    console.error("Seeding order data failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
