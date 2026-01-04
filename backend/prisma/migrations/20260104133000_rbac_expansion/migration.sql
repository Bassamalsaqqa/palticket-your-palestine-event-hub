-- Create new OrganizationRole enum
CREATE TYPE "OrganizationRole_new" AS ENUM ('ORG_ADMIN', 'EVENT_MANAGER', 'SELLER', 'SCANNER', 'FINANCE');

-- Alter OrganizationMember table to use the new enum
ALTER TABLE "OrganizationMember" ALTER COLUMN "role" TYPE "OrganizationRole_new" USING CASE "role"::text WHEN 'ADMIN' THEN 'ORG_ADMIN'::"OrganizationRole_new" WHEN 'STAFF' THEN 'SELLER'::"OrganizationRole_new" END;

-- Alter OrganizationInvite table to use the new enum
ALTER TABLE "OrganizationInvite" ALTER COLUMN "role" TYPE "OrganizationRole_new" USING CASE "role"::text WHEN 'ADMIN' THEN 'ORG_ADMIN'::"OrganizationRole_new" WHEN 'STAFF' THEN 'SELLER'::"OrganizationRole_new" END;

-- Drop old OrganizationRole enum
DROP TYPE "OrganizationRole";

-- Rename new OrganizationRole enum
ALTER TYPE "OrganizationRole_new" RENAME TO "OrganizationRole";

-- CreateTable
CREATE TABLE "EventStaffAssignment" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "role" "OrganizationRole" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EventStaffAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GateAssignment" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "gateId" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GateAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "EventStaffAssignment_memberId_eventId_key" ON "EventStaffAssignment"("memberId", "eventId");

-- CreateIndex
CREATE INDEX "EventStaffAssignment_organizationId_eventId_idx" ON "EventStaffAssignment"("organizationId", "eventId");

-- CreateIndex
CREATE UNIQUE INDEX "GateAssignment_memberId_gateId_key" ON "GateAssignment"("memberId", "gateId");

-- CreateIndex
CREATE INDEX "GateAssignment_organizationId_gateId_idx" ON "GateAssignment"("organizationId", "gateId");

-- AddForeignKey
ALTER TABLE "EventStaffAssignment" ADD CONSTRAINT "EventStaffAssignment_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventStaffAssignment" ADD CONSTRAINT "EventStaffAssignment_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventStaffAssignment" ADD CONSTRAINT "EventStaffAssignment_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "OrganizationMember"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GateAssignment" ADD CONSTRAINT "GateAssignment_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GateAssignment" ADD CONSTRAINT "GateAssignment_gateId_fkey" FOREIGN KEY ("gateId") REFERENCES "Gate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GateAssignment" ADD CONSTRAINT "GateAssignment_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "OrganizationMember"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
