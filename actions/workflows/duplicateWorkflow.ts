"use server";
import prisma from "@/lib/prisma";
import { createWorkflowSchema, duplicateWorkflowSchemaType } from "@/schema/workflow";
import { WorkflowStatus } from "@/type/workflow";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export async function duplicateWorkflow(form: duplicateWorkflowSchemaType) {
    const { success, data } = createWorkflowSchema.safeParse(form);
    if (!success) {
      throw new Error("Invalid form data");
    }
  
    const { userId } = await auth();
  
    if (!userId) {
      throw new Error("Unauthenticated");
    }
  
    const sourceWorkflow = await prisma.workFlow.findUnique({
      where: {
        userId,
        id: form.workflowId,
      },
    });
  
    if (!sourceWorkflow) {
      throw new Error("Workflow not found");
    }
  
    const result = await prisma.workFlow.create({
      data: {
        userId,
        status: WorkflowStatus.DRAFT,
        name: data.name,
        description: data.description,
        defination: sourceWorkflow.defination,
      },
    });
    if (!result) {
      throw new Error("Failed to duplicate workflow");
    }
  
    redirect("/workflows");
  }