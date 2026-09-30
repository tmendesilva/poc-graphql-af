import "dotenv/config";
import { prisma } from "../src/prisma";

const salesmen = [
  { id: "s1", name: "Alice Johnson", email: "alice.johnson@example.com" },
  { id: "s2", name: "Bruno Silva", email: "bruno.silva@example.com" },
  { id: "s3", name: "Carla Mendes", email: "carla.mendes@example.com" },
  { id: "s4", name: "David Kim", email: "david.kim@example.com" },
  { id: "s5", name: "Elena Rossi", email: "elena.rossi@example.com" },
];

async function main() {
  for (const salesman of salesmen) {
    await prisma.salesman.upsert({
      where: { id: salesman.id },
      update: salesman,
      create: salesman,
    });
  }
  console.log(`Seeded ${salesmen.length} salesmen.`);
}

main()
  .catch((error) => {
    console.error("Seeding salesman data failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
