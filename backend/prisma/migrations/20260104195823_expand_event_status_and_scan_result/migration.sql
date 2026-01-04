-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "EventStatus" ADD VALUE 'LIVE';
ALTER TYPE "EventStatus" ADD VALUE 'ENDED';

-- AlterEnum
ALTER TYPE "ScanResult" ADD VALUE 'DENIED_EVENT_NOT_SCANNABLE';
