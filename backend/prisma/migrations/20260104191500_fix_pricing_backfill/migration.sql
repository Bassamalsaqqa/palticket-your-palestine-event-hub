-- Repair OrderItem columns if they exist but are NULL (from a failed or empty apply of 20260104184304)
-- This migration ensures consistency without editing the original file.

-- Backfill unitPriceCents from priceCents if it is NULL
UPDATE "OrderItem" SET "unitPriceCents" = "priceCents" WHERE "unitPriceCents" IS NULL;

-- Backfill currency from TicketType if it is NULL
UPDATE "OrderItem"
SET "currency" = "TicketType"."currency"
FROM "TicketType"
WHERE "OrderItem"."ticketTypeId" = "TicketType"."id" AND "OrderItem"."currency" IS NULL;

-- Ensure NOT NULL constraints are active (some DBs might have applied the ADD COLUMN NOT NULL already if the table was empty)
-- We use a safe approach here.
DO $$
BEGIN
    ALTER TABLE "OrderItem" ALTER COLUMN "currency" SET NOT NULL;
EXCEPTION
    WHEN OTHERS THEN NULL;
END $$;

DO $$
BEGIN
    ALTER TABLE "OrderItem" ALTER COLUMN "unitPriceCents" SET NOT NULL;
EXCEPTION
    WHEN OTHERS THEN NULL;
END $$;
