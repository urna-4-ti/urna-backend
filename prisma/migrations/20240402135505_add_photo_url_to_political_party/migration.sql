/*
  Warnings:

  - Added the required column `photoUrl` to the `PoliticalParty` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "PoliticalParty" ADD COLUMN     "photoUrl" TEXT NOT NULL;
