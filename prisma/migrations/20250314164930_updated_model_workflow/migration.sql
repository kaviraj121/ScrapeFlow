-- AlterTable
ALTER TABLE "WorkFlow" ADD COLUMN "cron" TEXT;
ALTER TABLE "WorkFlow" ADD COLUMN "nextRunAt" DATETIME;
