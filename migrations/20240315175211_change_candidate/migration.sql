/*
  Warnings:

  - You are about to drop the column `picString` on the `Candidate` table. All the data in the column will be lost.
  - Added the required column `picPath` to the `Candidate` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Candidate" DROP COLUMN "picString",
ADD COLUMN     "picPath" TEXT NOT NULL;
