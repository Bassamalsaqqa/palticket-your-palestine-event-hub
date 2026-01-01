/*
  Warnings:

  - The values [SUCCESS,DUPLICATE,INVALID] on the enum `ScanResult` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ScanResult_new" AS ENUM ('GRANTED', 'DENIED_ALREADY_USED', 'DENIED_INVALID_EVENT', 'DENIED_INVALID_TICKET');
ALTER TABLE "ScanLog" ALTER COLUMN "result" TYPE "ScanResult_new" USING ("result"::text::"ScanResult_new");
ALTER TYPE "ScanResult" RENAME TO "ScanResult_old";
ALTER TYPE "ScanResult_new" RENAME TO "ScanResult";
DROP TYPE "public"."ScanResult_old";
COMMIT;
