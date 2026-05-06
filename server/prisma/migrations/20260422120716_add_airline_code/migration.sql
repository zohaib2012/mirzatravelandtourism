/*
  Warnings:

  - You are about to drop the column `branch_address` on the `bank_accounts` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "airlines" ADD COLUMN     "code" TEXT;

-- AlterTable
ALTER TABLE "bank_accounts" DROP COLUMN "branch_address",
ADD COLUMN     "branch_code" TEXT,
ADD COLUMN     "branch_name" TEXT;

-- AlterTable
ALTER TABLE "passengers" ADD COLUMN     "passport_back_url" TEXT,
ADD COLUMN     "passport_expiry" DATE,
ADD COLUMN     "passport_front_url" TEXT,
ADD COLUMN     "surname" TEXT,
ADD COLUMN     "title" TEXT;
