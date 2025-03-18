-- AlterTable
ALTER TABLE "WorkFlow" ADD COLUMN "lastRunAt" DATETIME;
ALTER TABLE "WorkFlow" ADD COLUMN "lastRunId" TEXT;
ALTER TABLE "WorkFlow" ADD COLUMN "lastRunStatus" TEXT;
