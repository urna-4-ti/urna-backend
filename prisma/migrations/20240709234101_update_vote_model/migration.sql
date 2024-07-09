/*
  Warnings:

  - A unique constraint covering the columns `[electionId]` on the table `Vote` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Vote_electionId_key" ON "Vote"("electionId");
