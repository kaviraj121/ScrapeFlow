"use server";
import { periodToDateRange } from "@/lib/helper/dates";
import prisma from "@/lib/prisma";
import { Period } from "@/type/analytics";
import { ExecutionPhaseStatus, workFlowExecutionStatus } from "@/type/workflow";
import { auth } from "@clerk/nextjs/server";
import { eachDayOfInterval, format } from "date-fns";
import { WorkflowExecutionType } from "./getCreditsUsageInPeriod";

export async function getWorkflowExecutionsStats(period: Period) {
    const { userId } = await auth();
  
    if (!userId) {
      throw new Error("Unauthenticated");
    }
  
    const dateRange = periodToDateRange(period);
  
    const executions = await prisma.workflowExecution.findMany({
      where: {
        userId,
        startedAt: {
          gte: dateRange.startDate,
          lte: dateRange.endDate,
        },
        status: {
          in: [ExecutionPhaseStatus.COMPLETED, ExecutionPhaseStatus.FAILED],
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
  
    executions.forEach((execution) => {
      const date = format(execution.startedAt!, "yyyy-MM-dd");
  
      if (execution.status === workFlowExecutionStatus.COMPLETED) {
        stats[date].success! += 1;
      }
  
      if (execution.status === workFlowExecutionStatus.FAILED) {
        stats[date].failed! += 1;
      }
    });
  
    const result = Object.entries(stats).map(([date, infos]) => ({
      date,
      ...infos,
    }));
  
    return result;
  }