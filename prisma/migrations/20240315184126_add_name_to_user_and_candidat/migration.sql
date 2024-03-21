/*
  Warnings:

  - Added the required column `name` to the `Candidate` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
ALTER TYPE "Classes" ADD VALUE 'ADMIN';

-- AlterTable
ALTER TABLE "Candidate" ADD COLUMN     "name" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "name" TEXT NOT NULL;
