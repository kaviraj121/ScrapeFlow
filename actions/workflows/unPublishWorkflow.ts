"use server";

import prisma from "@/lib/prisma";
import { WorkflowStatus } from "@/type/workflow";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export async function unPublishWorkflow(id: string) {
    const { userId } = await auth();
  
    if (!userId) {
      throw new Error("Unauthenticated");
    }
    const workflow = await prisma.workFlow.findUnique({
      where: {
        id,
        userId,
      },
    });
    if (!workflow) {
      throw new Error("Workflow not found");
    }
  
    if (workflow.status !== WorkflowStatus.PUBLISHED) {
      throw new Error("Workflow is not published");
    }
  
    await prisma.workFlow.update({
      where: {
        id,
        userId,
      },
      data: {
        status: WorkflowStatus.DRAFT,
        executionPlan: null,
        creditsCost: 0,
      },
    });
    revalidatePath(`/worflow/editor/${id}`);
  }
  