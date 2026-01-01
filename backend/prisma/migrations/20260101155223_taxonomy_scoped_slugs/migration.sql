/*
  Warnings:

  - A unique constraint covering the columns `[organizationId,slug]` on the table `Category` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[organizationId,slug]` on the table `City` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Category_slug_key";

-- DropIndex
DROP INDEX "City_slug_key";

-- CreateIndex
CREATE UNIQUE INDEX "Category_organizationId_slug_key" ON "Category"("organizationId", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "City_organizationId_slug_key" ON "City"("organizationId", "slug");
