-- CreateEnum
CREATE TYPE "CandidateType" AS ENUM ('PESSOA', 'PARTIDO', 'GOVERNO');

-- CreateEnum
CREATE TYPE "Roles" AS ENUM ('ADMIN', 'VOTER');

-- CreateEnum
CREATE TYPE "Classes" AS ENUM ('TI_1', 'TI_2', 'TI_3', 'TI_4', 'TQ_1', 'TQ_2', 'TQ_3', 'TQ_4', 'TMA_1', 'TMA_2', 'TMA_3', 'TMA_4', 'TA_1', 'TA_2', 'TA_3', 'TA_4', 'ADMIN');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "Roles" NOT NULL,
    "enrollment" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "class" "Classes" NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Candidate" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "cod" INTEGER NOT NULL,
    "picPath" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "politicalPartyId" TEXT NOT NULL,

    CONSTRAINT "Candidate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PoliticalType" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "cod" INTEGER NOT NULL,

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
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Candidate_cod_key" ON "Candidate"("cod");

-- CreateIndex
CREATE UNIQUE INDEX "Candidate_politicalPartyId_key" ON "Candidate"("politicalPartyId");

-- CreateIndex
CREATE UNIQUE INDEX "PoliticalType_cod_key" ON "PoliticalType"("cod");

-- AddForeignKey
ALTER TABLE "Candidate" ADD CONSTRAINT "Candidate_politicalPartyId_fkey" FOREIGN KEY ("politicalPartyId") REFERENCES "PoliticalParty"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PoliticalParty" ADD CONSTRAINT "PoliticalParty_politicalTypeId_fkey" FOREIGN KEY ("politicalTypeId") REFERENCES "PoliticalType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
