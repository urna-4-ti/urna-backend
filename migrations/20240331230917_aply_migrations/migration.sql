/*
  Warnings:

  - You are about to drop the column `code` on the `PoliticalParty` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `PoliticalParty` table. All the data in the column will be lost.
  - You are about to drop the column `governmentTypeId` on the `PoliticalParty` table. All the data in the column will be lost.
  - You are about to drop the column `photoPath` on the `PoliticalParty` table. All the data in the column will be lost.
  - You are about to drop the `GovernmentType` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `politicalTypeId` to the `PoliticalParty` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "PoliticalParty" DROP CONSTRAINT "PoliticalParty_governmentTypeId_fkey";

-- DropIndex
DROP INDEX "PoliticalParty_code_key";

-- AlterTable
ALTER TABLE "PoliticalParty" DROP COLUMN "code",
DROP COLUMN "description",
DROP COLUMN "governmentTypeId",
DROP COLUMN "photoPath",
ADD COLUMN     "politicalTypeId" TEXT NOT NULL;

-- DropTable
DROP TABLE "GovernmentType";

-- CreateTable
CREATE TABLE "PoliticalType" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "PoliticalType_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "PoliticalParty" ADD CONSTRAINT "PoliticalParty_politicalTypeId_fkey" FOREIGN KEY ("politicalTypeId") REFERENCES "PoliticalType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
