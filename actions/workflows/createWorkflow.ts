"use server";

import prisma from "@/lib/prisma";
import { CreateFlowNode } from "@/lib/workflow/createFlowNode";
import { createWorkflowSchema, createWorkflowSchemaType } from "@/schema/workflow";
import { AppNode } from "@/type/appNode";
import { TaskType } from "@/type/task";
import { WorkflowStatus } from "@/type/workflow";
import { auth } from "@clerk/nextjs/server";
import { Edge } from "@xyflow/react";
import { redirect } from "next/navigation";

export async function CreateWorkflow(form: createWorkflowSchemaType) {
  const { success, data } = createWorkflowSchema.safeParse(form);

  if (!success) {
    throw new Error("Invalid form data");
  }

  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthenticated");
  }

  const initWorkflow: { nodes: AppNode[]; edges: Edge[] } = {
    nodes: [],
    edges: [],
  };
  initWorkflow.nodes.push(CreateFlowNode(TaskType.LAUNCH_BROWSER));
  const result = await prisma.workFlow.create({
    data: {
      userId,
      status: WorkflowStatus.DRAFT,
      defination: JSON.stringify(initWorkflow),
      ...data,
    },
  });
  if (!result) {
    throw new Error("Failed to create workflow");
  }

  redirect(`/workflow/editor/${result.id}`);
}