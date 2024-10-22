/*
  Warnings:

  - A unique constraint covering the columns `[participantIds]` on the table `Thread` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Thread" ADD COLUMN     "participantIds" INTEGER[];

-- CreateIndex
CREATE UNIQUE INDEX "Thread_participantIds_key" ON "Thread"("participantIds");
