/*
  Warnings:

  - A unique constraint covering the columns `[politicalPartyId]` on the table `Candidate` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `politicalPartyId` to the `Candidate` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Candidate" ADD COLUMN     "politicalPartyId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "PoliticalType" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "PoliticalType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PoliticalParty" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "class" "Classes" NOT NULL,
    "politicalTypeId" TEXT NOT NULL,

    CONSTRAINT "PoliticalParty_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Candidate_politicalPartyId_key" ON "Candidate"("politicalPartyId");

-- AddForeignKey
ALTER TABLE "Candidate" ADD CONSTRAINT "Candidate_politicalPartyId_fkey" FOREIGN KEY ("politicalPartyId") REFERENCES "PoliticalParty"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PoliticalParty" ADD CONSTRAINT "PoliticalParty_politicalTypeId_fkey" FOREIGN KEY ("politicalTypeId") REFERENCES "PoliticalType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
