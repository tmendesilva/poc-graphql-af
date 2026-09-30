-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "salesmanId" TEXT NOT NULL,
    "productIds" TEXT[],

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);
