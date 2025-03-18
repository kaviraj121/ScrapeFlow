"use server";

import { periodToDateRange } from "@/lib/helper/dates";
import prisma from "@/lib/prisma";
import { Period } from "@/type/analytics";
import { ExecutionPhaseStatus } from "@/type/workflow";
import { auth } from "@clerk/nextjs/server";
import { eachDayOfInterval, format } from "date-fns";

export type WorkflowExecutionType = Record<
  string,
  {
    success: number;
    failed: number;
  }
>;
export async function getCreditsUsageInPeriod(period: Period) {
    const { userId } = await auth();
  
    if (!userId) {
      throw new Error("Unauthenticated");
    }
  
    const dateRange = periodToDateRange(period);
  
    const executionsPhases = await prisma.workflowExecution.findMany({
      where: {
        userId,
        startedAt: {
          gte: dateRange.startDate,
          lte: dateRange.endDate,
        },
      },
    });
  
    const stats: WorkflowExecutionType = eachDayOfInterval({
      start: dateRange.startDate,
      end: dateRange.endDate,
    })
      .map((date) => format(date, "yyyy-MM-dd"))
      .reduce((acc, date) => {
        acc[date] = {
          success: 0,
          failed: 0,
        };
        return acc;
      }, {} as any);
  
    executionsPhases.forEach((phase) => {
      const date = format(phase.startedAt!, "yyyy-MM-dd");
  
      if (phase.status === ExecutionPhaseStatus.COMPLETED) {
        stats[date].success! += phase.creditsConsumed || 0;
      }
  
      if (phase.status === ExecutionPhaseStatus.FAILED) {
        stats[date].failed! += phase.creditsConsumed || 0;
      }
    });
  
    const result = Object.entries(stats).map(([date, infos]) => ({
      date,
      ...infos,
    }));
  
    return result;
  }