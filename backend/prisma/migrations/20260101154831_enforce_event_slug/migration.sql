/*
  Warnings:

  - A unique constraint covering the columns `[organizationId,slug]` on the table `Event` will be added. If there are existing duplicate values, this will fail.
  - Made the column `slug` on table `Event` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Event" ALTER COLUMN "slug" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Event_organizationId_slug_key" ON "Event"("organizationId", "slug");
