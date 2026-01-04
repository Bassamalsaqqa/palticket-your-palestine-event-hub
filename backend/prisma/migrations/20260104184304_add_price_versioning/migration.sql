-- AlterTable
ALTER TABLE "OrderItem" ADD COLUMN "currency" TEXT;
ALTER TABLE "OrderItem" ADD COLUMN "unitPriceCents" INTEGER;
ALTER TABLE "OrderItem" ADD COLUMN "priceVersionId" TEXT;

-- Backfill unitPriceCents from priceCents
UPDATE "OrderItem" SET "unitPriceCents" = "priceCents";

-- Backfill currency from TicketType
UPDATE "OrderItem"
SET "currency" = "TicketType"."currency"
FROM "TicketType"
WHERE "OrderItem"."ticketTypeId" = "TicketType"."id";

-- Set NOT NULL now that data is backfilled
ALTER TABLE "OrderItem" ALTER COLUMN "currency" SET NOT NULL;
ALTER TABLE "OrderItem" ALTER COLUMN "unitPriceCents" SET NOT NULL;

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