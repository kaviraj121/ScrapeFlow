"use server";

import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function GetWorkflowPhaseDetails(phaseId: string){
    const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthenticated");
  }

  return prisma.executionPhase.findUnique({
    where: {
      id: phaseId,
      execution: {
        userId,
      },
    },
    include: {
      logs: {
        orderBy: {
          timestamp: "asc",
        },
      },
    },
  });
}
