/*
  Warnings:

  - Added the required column `organizationId` to the `Gate` table without a default value. This is not possible if the table is not empty.
  - Added the required column `organizationId` to the `ScanLog` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'PAID', 'CANCELLED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "EventStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'CANCELLED');

-- DropForeignKey
ALTER TABLE "ScanLog" DROP CONSTRAINT "ScanLog_scannedByUserId_fkey";

-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "status" "EventStatus" NOT NULL DEFAULT 'DRAFT';

-- AlterTable
ALTER TABLE "Gate" ADD COLUMN     "organizationId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "status" "OrderStatus" NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "ScanLog" ADD COLUMN     "organizationId" TEXT NOT NULL,
ADD COLUMN     "scannedByMemberId" TEXT,
ALTER COLUMN "scannedByUserId" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "Gate_organizationId_idx" ON "Gate"("organizationId");

-- CreateIndex
CREATE INDEX "ScanLog_organizationId_idx" ON "ScanLog"("organizationId");

-- CreateIndex
CREATE INDEX "ScanLog_gateId_idx" ON "ScanLog"("gateId");

-- CreateIndex
CREATE INDEX "ScanLog_scannedByMemberId_idx" ON "ScanLog"("scannedByMemberId");

-- AddForeignKey
ALTER TABLE "Gate" ADD CONSTRAINT "Gate_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScanLog" ADD CONSTRAINT "ScanLog_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScanLog" ADD CONSTRAINT "ScanLog_scannedByUserId_fkey" FOREIGN KEY ("scannedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScanLog" ADD CONSTRAINT "ScanLog_scannedByMemberId_fkey" FOREIGN KEY ("scannedByMemberId") REFERENCES "OrganizationMember"("id") ON DELETE SET NULL ON UPDATE CASCADE;
