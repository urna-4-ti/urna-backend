/*
  Warnings:

  - You are about to drop the column `politicalTypeId` on the `PoliticalParty` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "PoliticalParty" DROP CONSTRAINT "PoliticalParty_politicalTypeId_fkey";

-- AlterTable
ALTER TABLE "PoliticalParty" DROP COLUMN "politicalTypeId",
ADD COLUMN     "governmentId" TEXT;

-- AddForeignKey
ALTER TABLE "PoliticalParty" ADD CONSTRAINT "PoliticalParty_governmentId_fkey" FOREIGN KEY ("governmentId") REFERENCES "Government"("id") ON DELETE CASCADE ON UPDATE CASCADE;
