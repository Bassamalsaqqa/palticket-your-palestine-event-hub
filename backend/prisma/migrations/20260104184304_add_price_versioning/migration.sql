/*
  Warnings:

  - Added the required column `currency` to the `OrderItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `unitPriceCents` to the `OrderItem` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "OrderItem" ADD COLUMN     "currency" TEXT NOT NULL,
ADD COLUMN     "priceVersionId" TEXT,
ADD COLUMN     "unitPriceCents" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "TicketTypePriceVersion" (
    "id" TEXT NOT NULL,
    "ticketTypeId" TEXT NOT NULL,
    "currency" TEXT NOT NULL,
    "priceCents" INTEGER NOT NULL,
    "startsAt" TIMESTAMP(3),
    "endsAt" TIMESTAMP(3),
    "createdByMemberId" TEXT,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TicketTypePriceVersion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TicketTypePriceVersion_ticketTypeId_createdAt_idx" ON "TicketTypePriceVersion"("ticketTypeId", "createdAt");

-- CreateIndex
CREATE INDEX "TicketTypePriceVersion_ticketTypeId_currency_idx" ON "TicketTypePriceVersion"("ticketTypeId", "currency");

-- AddForeignKey
ALTER TABLE "TicketTypePriceVersion" ADD CONSTRAINT "TicketTypePriceVersion_ticketTypeId_fkey" FOREIGN KEY ("ticketTypeId") REFERENCES "TicketType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_priceVersionId_fkey" FOREIGN KEY ("priceVersionId") REFERENCES "TicketTypePriceVersion"("id") ON DELETE SET NULL ON UPDATE CASCADE;
