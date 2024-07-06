-- CreateEnum
CREATE TYPE "Roles" AS ENUM ('ADMIN', 'VOTER');

-- CreateEnum
CREATE TYPE "Classes" AS ENUM ('TI_1', 'TI_2', 'TI_3', 'TI_4', 'TQ_1', 'TQ_2', 'TQ_3', 'TQ_4', 'TMA_1', 'TMA_2', 'TMA_3', 'TMA_4', 'TA_1', 'TA_2', 'TA_3', 'TA_4', 'ADMIN');

-- CreateEnum
CREATE TYPE "NamesPR" AS ENUM ('Parlamentarismo', 'Presidencialismo', 'SemiPresidencialismo');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "Roles" NOT NULL,
    "enrollment" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "hashPassword" TEXT NOT NULL,
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
    "electionId" TEXT,

    CONSTRAINT "Candidate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PoliticalType" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "cod" INTEGER NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "PoliticalType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PoliticalParty" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "class" "Classes" NOT NULL,
    "politicalTypeId" TEXT NOT NULL,
    "photoUrl" TEXT NOT NULL,

    CONSTRAINT "PoliticalParty_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PoliticalRegime" (
    "id" TEXT NOT NULL,
    "name" "NamesPR" NOT NULL,
    "cod" INTEGER NOT NULL,
    "electionId" TEXT,

    CONSTRAINT "PoliticalRegime_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Government" (
    "id" TEXT NOT NULL,
    "cod" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "electionId" TEXT,

    CONSTRAINT "Government_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Election" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "class" "Classes" NOT NULL,

    CONSTRAINT "Election_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Vote" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "governmentId" TEXT,
    "politicalRegimeId" TEXT,
    "candidateId" TEXT,
    "class" "Classes" NOT NULL,
    "electionId" TEXT NOT NULL,
    "userEnrollment" TEXT NOT NULL,

    CONSTRAINT "Vote_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_enrollment_key" ON "User"("enrollment");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_id_enrollment_idx" ON "User"("id", "enrollment");

-- CreateIndex
CREATE UNIQUE INDEX "Candidate_cod_key" ON "Candidate"("cod");

-- CreateIndex
CREATE UNIQUE INDEX "PoliticalType_cod_key" ON "PoliticalType"("cod");

-- CreateIndex
CREATE UNIQUE INDEX "PoliticalRegime_cod_key" ON "PoliticalRegime"("cod");

-- CreateIndex
CREATE INDEX "Vote_id_governmentId_politicalRegimeId_candidateId_idx" ON "Vote"("id", "governmentId", "politicalRegimeId", "candidateId");

-- AddForeignKey
ALTER TABLE "Candidate" ADD CONSTRAINT "Candidate_politicalPartyId_fkey" FOREIGN KEY ("politicalPartyId") REFERENCES "PoliticalParty"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Candidate" ADD CONSTRAINT "Candidate_electionId_fkey" FOREIGN KEY ("electionId") REFERENCES "Election"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PoliticalParty" ADD CONSTRAINT "PoliticalParty_politicalTypeId_fkey" FOREIGN KEY ("politicalTypeId") REFERENCES "PoliticalType"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PoliticalRegime" ADD CONSTRAINT "PoliticalRegime_electionId_fkey" FOREIGN KEY ("electionId") REFERENCES "Election"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Government" ADD CONSTRAINT "Government_electionId_fkey" FOREIGN KEY ("electionId") REFERENCES "Election"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vote" ADD CONSTRAINT "Vote_governmentId_fkey" FOREIGN KEY ("governmentId") REFERENCES "Government"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vote" ADD CONSTRAINT "Vote_politicalRegimeId_fkey" FOREIGN KEY ("politicalRegimeId") REFERENCES "PoliticalRegime"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vote" ADD CONSTRAINT "Vote_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "Candidate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vote" ADD CONSTRAINT "Vote_electionId_fkey" FOREIGN KEY ("electionId") REFERENCES "Election"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vote" ADD CONSTRAINT "Vote_userEnrollment_fkey" FOREIGN KEY ("userEnrollment") REFERENCES "User"("enrollment") ON DELETE CASCADE ON UPDATE CASCADE;
