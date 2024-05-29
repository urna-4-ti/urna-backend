/*
  Warnings:

  - Made the column `photoUrl` on table `PoliticalParty` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `description` to the `PoliticalType` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "PoliticalParty" ALTER COLUMN "photoUrl" SET NOT NULL;

-- AlterTable
ALTER TABLE "PoliticalType" ADD COLUMN     "description" TEXT NOT NULL;
