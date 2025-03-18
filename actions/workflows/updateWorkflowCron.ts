"use server";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import parser from "cron-parser";

export async function updateWorkFlowCron({
    id,
    cron,
  }: {
    id: string;
    cron: string;
  }) {
    const { userId } = await auth();
  
    if (!userId) {
      throw new Error("Unauthenticated");
    }
  
    try {
      const interval = (parser as any).parseExpression(cron, { utc: true });
      await prisma.workFlow.update({
        where: {
          id,
          userId,
        },
        data: {
          cron,
          nextRunAt: interval.next().toDate(),
        },
      });
    } catch (error: any) {
      console.error(error.message);
      throw new Error("Invalid cron expression");
    }
    revalidatePath("/workflows");
  }