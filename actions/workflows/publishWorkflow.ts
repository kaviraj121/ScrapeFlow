"use server";
import prisma from "@/lib/prisma";
import { FlowToExecutionPlan } from "@/lib/workflow/executionPlan";
import { calculateWorkflowCost } from "@/lib/workflow/helpers";
import { WorkflowStatus } from "@/type/workflow";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export async function publishWorkflow({
    id,
    flowDefinition,
  }: {
    id: string;
    flowDefinition: string;
  }) {
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
    
      if (workflow.status !== WorkflowStatus.DRAFT) {
        throw new Error("Workflow is not draft");
      }
    
      const flow = JSON.parse(flowDefinition);
    
      const result = FlowToExecutionPlan(flow.nodes, flow.edges);
    
      if (result.error) {
        throw new Error("Flow definition not valid");
      }
    
      if (!result.executionPlan) {
        throw new Error("Something went wrong, No eexecution plan generated");
      }

      const creditsCost = calculateWorkflowCost(flow.nodes);

  await prisma.workFlow.update({
    where: {
      id,
      userId,
    },
    data: {
      defination: flowDefinition,
      executionPlan: JSON.stringify(result.executionPlan),
      creditsCost,
      status: WorkflowStatus.PUBLISHED,
    },
  });
  revalidatePath(`/worflow/editor/${id}`);
}
    
