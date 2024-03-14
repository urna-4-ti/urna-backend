-- CreateEnum
CREATE TYPE "CandidateType" AS ENUM ('PESSOA', 'PARTIDO', 'GOVERNO');

-- CreateEnum
CREATE TYPE "Roles" AS ENUM ('ADMIN', 'VOTER');

-- CreateEnum
CREATE TYPE "Classes" AS ENUM ('TI_1', 'TI_2', 'TI_3', 'TI_4', 'TQ_1', 'TQ_2', 'TQ_3', 'TQ_4', 'TMA_1', 'TMA_2', 'TMA_3', 'TMA_4', 'TA_1', 'TA_2', 'TA_3', 'TA_4');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "role" "Roles" NOT NULL,
    "enrollment" INTEGER NOT NULL,
    "email" TEXT NOT NULL,
    "class" "Classes" NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Candidate" (
    "id" TEXT NOT NULL,
    "cod" INTEGER NOT NULL,
    "picString" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" "CandidateType" NOT NULL,

    CONSTRAINT "Candidate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Candidate_cod_key" ON "Candidate"("cod");
