"use server";


import prisma from "@/lib/prisma";
import { ExecuteWorkflow } from "@/lib/workflow/executeWorkflow";
import { FlowToExecutionPlan } from "@/lib/workflow/executionPlan";
import { TaskRegistry } from "@/lib/workflow/task/registry";
import { ExecutionPhaseStatus, WorkflowExecutionPlan, workFlowExecutionStatus, WorkflowExecutionTrigger, WorkflowStatus } from "@/type/workflow";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";



export async function runWorkflow(form:{
    workflowId:string;
    flowDefination?:string;
}){

    const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthenticated");
  }

  const { workflowId, flowDefination } = form;
  if (!workflowId) {
    throw new Error("workflowId is required");
  }

  const workflow = await prisma.workFlow.findUnique({
    where: {
      userId,
      id: workflowId,
    },
  });

  if (!workflow) {
    throw new Error("Workflow not found");
  }

  let executionPlan: WorkflowExecutionPlan;
  let workflowDefinition = flowDefination;

  // Is the execution plan is published then the execution plan will set from workflow definition
  if (workflow.status === WorkflowStatus.PUBLISHED) {
    if (!workflow.executionPlan) {
      throw new Error("No execution planned found in published workflow");
    }
    executionPlan = JSON.parse(workflow.executionPlan);
    workflowDefinition = workflow.defination;
  } else {
    // Otherwise generating execution plan from flow-definition passed
    if (!flowDefination) {
      throw new Error("Flow definition is not defined");
    }

    const flow = JSON.parse(flowDefination);
    const result = FlowToExecutionPlan(flow.nodes, flow.edges);
    if (result.error) {
      throw new Error("Flow definition not valid");
    }
    if (!result.executionPlan) {
      throw new Error("No execution plan generated, Something went wrong");
    }
    executionPlan = result.executionPlan;
  }

  const execution = await prisma.workflowExecution.create({
    data: {
      workflowId,
      userId,
      status: workFlowExecutionStatus.PENDING,
      startedAt: new Date(),
      trigger: WorkflowExecutionTrigger.MANUAL,
      defination: workflowDefinition,
      phases: {
        create: executionPlan.flatMap((phase) =>
          phase.nodes.flatMap((node) => {
            return {
              userId,
              status: ExecutionPhaseStatus.CREATED,
              number: phase.phase,
              node: JSON.stringify(node),
              name: TaskRegistry[node.data.type].label,
            };
          })
        ),
      },
    },
    select: {
      id: true,
      phases: true,
    },
  });

  if (!execution) {
    throw new Error("Workflow execution not created");
  }

  // This will be a long running function, so just calling it and making it run in background
  ExecuteWorkflow(execution.id);

  redirect(`/workflow/runs/${workflowId}/${execution.id}`);
}