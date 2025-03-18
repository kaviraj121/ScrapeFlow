"use server";

import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export async function DeleteWorkflow(workflowId: string) {
    const { userId } = await auth();
  
    if (!userId) {
      throw new Error("Unauthenticated");
    }
  
    await prisma.workFlow.delete({
      where: {
        userId,
        id: workflowId,
      },
    });
  
    revalidatePath("/workflows");
  }