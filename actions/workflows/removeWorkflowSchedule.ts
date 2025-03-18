"use server";

import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export async function removeWorkflowSchedule(id: string) {
    const { userId } = await auth();
  
    if (!userId) {
      throw new Error("Unauthenticated");
    }
    await prisma.workFlow.update({
      where: {
        id,
        userId,
      },
      data: {
        cron: null,
        nextRunAt: null,
      },
    });
    revalidatePath("/workflows");
  }