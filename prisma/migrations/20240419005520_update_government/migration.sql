/*
  Warnings:

  - Added the required column `cod` to the `Government` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `Government` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Government" ADD COLUMN     "cod" INTEGER NOT NULL,
ADD COLUMN     "name" TEXT NOT NULL;
