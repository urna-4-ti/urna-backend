/*
  Warnings:

  - A unique constraint covering the columns `[enrollment]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "User_enrollment_key" ON "User"("enrollment");

-- CreateIndex
CREATE INDEX "User_id_enrollment_idx" ON "User"("id", "enrollment");
