import "dotenv/config";
import { prisma } from "../src/prisma";

const products = [
  { id: "p1", name: "Wireless Mouse", price: 29.99 },
  { id: "p2", name: "Mechanical Keyboard", price: 89.99 },
  { id: "p3", name: "USB-C Dock", price: 59.5 },
  { id: "p4", name: '27" Monitor', price: 249.99 },
  { id: "p5", name: "Webcam 1080p", price: 45.0 },
  { id: "p6", name: "Noise Cancelling Headphones", price: 199.99 },
  { id: "p7", name: "Laptop Stand", price: 39.99 },
  { id: "p8", name: "External SSD 1TB", price: 109.99 },
  { id: "p9", name: "Bluetooth Speaker", price: 65.0 },
  { id: "p10", name: "Desk Lamp", price: 34.5 },
  { id: "p11", name: "Ergonomic Chair", price: 349.0 },
  { id: "p12", name: "Standing Desk", price: 599.0 },
  { id: "p13", name: "Wireless Charger", price: 24.99 },
  { id: "p14", name: "HDMI Cable", price: 12.99 },
  { id: "p15", name: "Portable Battery Pack", price: 49.99 },
  { id: "p16", name: "Smart Watch", price: 199.0 },
  { id: "p17", name: 'Tablet 10"', price: 329.0 },
  { id: "p18", name: "Graphics Tablet", price: 149.0 },
  { id: "p19", name: "Ring Light", price: 27.5 },
  { id: "p20", name: "Cable Organizer", price: 9.99 },
];

async function main() {
  for (const product of products) {
    await prisma.product.upsert({
      where: { id: product.id },
      update: product,
      create: product,
    });
  }
  console.log(`Seeded ${products.length} products.`);
}

main()
  .catch((error) => {
    console.error("Seeding product data failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
