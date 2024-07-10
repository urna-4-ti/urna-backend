/*
  Warnings:

  - Added the required column `status` to the `Election` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "electionStatus" AS ENUM ('CREATED', 'IN_PROGRESS', 'DONE');

-- AlterTable
ALTER TABLE "Election" ADD COLUMN     "status" "electionStatus" NOT NULL;
