/*
  Warnings:

  - You are about to drop the column `politicalTypeId` on the `PoliticalParty` table. All the data in the column will be lost.
  - You are about to drop the `PoliticalType` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[code]` on the table `PoliticalParty` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `code` to the `PoliticalParty` table without a default value. This is not possible if the table is not empty.
  - Added the required column `description` to the `PoliticalParty` table without a default value. This is not possible if the table is not empty.
  - Added the required column `governmentTypeId` to the `PoliticalParty` table without a default value. This is not possible if the table is not empty.
  - Added the required column `photoPath` to the `PoliticalParty` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "PoliticalParty" DROP CONSTRAINT "PoliticalParty_politicalTypeId_fkey";

-- AlterTable
ALTER TABLE "PoliticalParty" DROP COLUMN "politicalTypeId",
ADD COLUMN     "code" INTEGER NOT NULL,
ADD COLUMN     "description" TEXT NOT NULL,
ADD COLUMN     "governmentTypeId" TEXT NOT NULL,
ADD COLUMN     "photoPath" TEXT NOT NULL;

-- DropTable
DROP TABLE "PoliticalType";

-- CreateTable
CREATE TABLE "GovernmentType" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "cod" BIGINT NOT NULL,

    CONSTRAINT "GovernmentType_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GovernmentType_cod_key" ON "GovernmentType"("cod");

-- CreateIndex
CREATE UNIQUE INDEX "PoliticalParty_code_key" ON "PoliticalParty"("code");

-- AddForeignKey
ALTER TABLE "PoliticalParty" ADD CONSTRAINT "PoliticalParty_governmentTypeId_fkey" FOREIGN KEY ("governmentTypeId") REFERENCES "GovernmentType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
