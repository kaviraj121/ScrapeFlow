import prisma from "@/lib/prisma";
import { ExecuteWorkflow } from "@/lib/workflow/executeWorkflow";
import { TaskRegistry } from "@/lib/workflow/task/registry";
import { ExecutionPhaseStatus, WorkflowExecutionPlan, workFlowExecutionStatus, WorkflowExecutionTrigger } from "@/type/workflow";
import { timingSafeEqual } from "crypto";
import parser from "cron-parser";


export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const secret = authHeader.split(" ")[1];
  if (!validSecret(secret)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { searchParams } = new URL(request.url);
  const workflowId = searchParams.get("workflowId");
  if (!workflowId) {
    return Response.json({ error: "Bad Request" }, { status: 400 });
  }

  const workflow = await prisma.workFlow.findUnique({
    where: {
      id: workflowId,
    },
  });
  if (!workflow) {
    return Response.json({ error: "Bad Request" }, { status: 400 });
  }

  const executionPlan = JSON.parse(
    workflow.executionPlan!
  ) as WorkflowExecutionPlan;

  if (!executionPlan) {
    return Response.json({ error: "Bad Request" }, { status: 400 });
  }

  try {
    const cron = parser.parseExpression(workflow.cron!, { utc: true });
    const nextRun = cron.next().toDate();

    const execution = await prisma.workflowExecution.create({
      data: {
        workflowId,
        userId: workflow.userId,
        defination: workflow.defination,
        status: workFlowExecutionStatus.PENDING,
        startedAt: new Date(),
        trigger: WorkflowExecutionTrigger.CRON,
        phases: {
          create: executionPlan.flatMap((phase) =>
            phase.nodes.flatMap((node) => {
              return {
                userId: workflow.userId,
                status: ExecutionPhaseStatus.CREATED,
                number: phase.phase,
                node: JSON.stringify(node),
                name: TaskRegistry[node.data.type].label,
              };
            })
          ),
        },
      },
    });

    await ExecuteWorkflow(execution.id, nextRun);
    return new Response(null, { status: 200 });
  } catch (error: any) {
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

function validSecret(secret: string) {
  if (!process.env.API_SECRET) return false;

  try {
    return timingSafeEqual(
      Buffer.from(secret),
      Buffer.from(process.env.API_SECRET)
    );
  } catch (error) {
    console.log("Invalid Secret");
  }
}