"use server";
import { periodToDateRange } from "@/lib/helper/dates";
import prisma from "@/lib/prisma";
import { Period } from "@/type/analytics";
import { workFlowExecutionStatus } from "@/type/workflow";
import { auth } from "@clerk/nextjs/server";

export async function getStatsCardsValue(period: Period) {
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
          in: [workFlowExecutionStatus.COMPLETED, workFlowExecutionStatus.FAILED],
        },
      },
      select: {
        creditsConsumed: true,
        phases: {
          where: {
            creditsConsumed: {
              not: null,
            },
          },
          select: {
            creditsConsumed: true,
          },
        },
      },
    });
  
    const stats = {
      WorkflowExecutions: executions.length,
      creditsConsumed: 0,
      phaseExecutions: 0,
    };
  
    stats.creditsConsumed = executions.reduce(
      (sum, execution) => sum + execution.creditsConsumed,
      0
    );
    stats.phaseExecutions = executions.reduce(
      (sum, execution) => sum + execution.phases.length,
      0
    );
  
    return stats;
  }
  