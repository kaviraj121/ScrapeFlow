import "server-only";
import prisma from "../prisma";
import { revalidatePath } from "next/cache";
import { ExecutionPhaseStatus, workFlowExecutionStatus, WorkflowStatus } from "@/type/workflow";
import { waitFor } from "../helper/waitFor";
import { ExecutionPhase } from "@prisma/client";
import { AppNode } from "@/type/appNode";
import { TaskRegistry } from "./task/registry";
import { ExecutorRegistry } from "./executor/registry";
import { Environment, ExecutionEnviornment } from "@/type/executor";
import { TaskParamType } from "@/type/task";
import { Browser, Page } from "puppeteer";
import { Edge } from "@xyflow/react";
import { LogCollector } from "@/type/log";
import { createLogCollector } from "../log";

export async function ExecuteWorkflow(executionId:string,nextRunAt?:Date){
    const execution = await prisma.workflowExecution.findUnique({
        where:{id:executionId},
        include:{workflow:true,phases:true},
});

    if(!execution){
        throw new Error("execution not find");
    }
    const edges = JSON.parse(execution.defination).edges as Edge[];

    const environment : Environment ={phases:{}};

await intializeWorkflowExecution(executionId,execution.workflowId,nextRunAt);
await intializePhaseStatuses(execution);

    let creditsConsumed = 0;
    let executionFailed = false;
    for(const phase of execution.phases){
       const phaseExecution = await executeWorkflowPhase(phase,environment,edges,execution.userId);
       creditsConsumed += phaseExecution.creditsConsumed;
       if(!phaseExecution.success){
        executionFailed = true;
        break;
       }
    }

    await finalizeWorkflowExecution(executionId,execution.workflowId,executionFailed,creditsConsumed);
    await cleanupEnviornment(environment);
    revalidatePath(`/workflows/runs`);
}

async function intializeWorkflowExecution(executionId:string, workflowId:string,nextRunAt?:Date){
    await prisma.workflowExecution.update({
        where:{
            id:executionId
        },
        data:{
            startedAt:new Date(),
            status: workFlowExecutionStatus.RUNNING,

        }
    });

    await prisma.workFlow.update({
        where:{
            id:workflowId,
           
        },
        data:{
            lastRunAt: new Date(),
            lastRunStatus: workFlowExecutionStatus.RUNNING,
            lastRunId: executionId,
            ...(nextRunAt && {nextRunAt}),
        },
    })
}

async function intializePhaseStatuses(execution:any){
    await prisma.executionPhase.updateMany({
        where:{
            id:{
                in:execution.phases.map((phase:any)=>phase.id)
            },
        },
        data:{
            status:ExecutionPhaseStatus.PENDING,
        }
    },
)
}

async function finalizeWorkflowExecution(executionId:string,
    workflowId:string,
    executionFailed:boolean,
    creditsConsumed:number,
){
    const finalStatus = executionFailed ? workFlowExecutionStatus.FAILED
    : workFlowExecutionStatus.COMPLETED;

    await prisma.workflowExecution.update({
        where:{id:executionId},
        data:{
            status:finalStatus,
            completedAt: new Date(),
            creditsConsumed,
        }
    });

    await prisma.workFlow.update({
        where:{
            id:workflowId,
            lastRunId:executionId,
        },
        data:{
            lastRunStatus:finalStatus,
        }
    }).catch((err)=>{

    })
}


async function executeWorkflowPhase(phase: ExecutionPhase, environment: Environment,edges:Edge[],userId:string){
    const logCollector= createLogCollector();
       const startedAt = new Date();
       const node = JSON.parse(phase.node) as AppNode;
       setupEnviornmentForPhase(node, environment,edges);

       await prisma.executionPhase.update({
        where:{id:phase.id},
        data:{
            status:ExecutionPhaseStatus.RUNNING,
            startedAt,
            inputs:JSON.stringify(environment.phases[node.id].inputs), 
        }
       })

       const creditsRequired = TaskRegistry[node.data.type].credits;
       let success = await decrementCredits(userId, creditsRequired, logCollector);

       const creditsConsumed = success ? creditsRequired : 0;
       if (success) {
         // executing phase only when credits are available and deducted
         success = await executePhase(phase, node, environment, logCollector);
       }
       const outputs = environment.phases[node.id].outputs;
       await finalizePhase(phase.id,success,outputs,logCollector,creditsConsumed);
       return {success, creditsConsumed};
}

async function finalizePhase(phaseId:string,success:boolean,outputs:any,logCollector:LogCollector,creditsConsumed:number){
    const finalStatus = success ? ExecutionPhaseStatus.COMPLETED : ExecutionPhaseStatus.FAILED;

    await prisma.executionPhase.update({
        where:{
            id:phaseId,
        },
        data:{
            status:finalStatus,
            completedAt:new Date(),
            outputs: JSON.stringify(outputs),
            creditsConsumed,
            logs: {
                createMany: {
                  data: logCollector.getAll().map((log) => ({
                    message: log.message,
                    timestamp: log.timestamp,
                    logLevel: log.level,
                  })),
                }
            }
        }
    })
}

async function executePhase(
    phase: ExecutionPhase,
    node: AppNode,
    enviornment:Environment,
    logCollector:LogCollector
    
  ): Promise<boolean> {
    const runFn = ExecutorRegistry[node.data.type];
    if (!runFn) {
       logCollector.error(`not found executor for ${node.data.type}`);
      return false;
    }

    const executionEnvironment : ExecutionEnviornment<any> = createExecutionEnvironment(node,enviornment,logCollector)

    return await runFn(executionEnvironment);
}

function setupEnviornmentForPhase(
    node: AppNode,
    enviornment: Environment,
    edges:Edge[],
    
  ) {
    enviornment.phases[node.id] = {
      inputs: {},
      outputs: {},
    };
    const inputs = TaskRegistry[node.data.type].inputs;
    for (const input of inputs) {
        if (input.type === TaskParamType.BROWSER_INSTANCE) continue;
        const inputValue = node.data.inputs[input.name];
        if (inputValue) {
          // Input value is defined by user
          enviornment.phases[node.id].inputs[input.name] = inputValue;
          continue;
        }
        const connectedEdge = edges.find(
            (edge) => edge.target === node.id && edge.targetHandle === input.name
          );

          if (!connectedEdge) {
            console.error(
              "Missing edge for input ",
              input.name,
              " node.id: ",
              node.id
            );
            continue;
          }

          const outputValue =
      enviornment.phases[connectedEdge!.source].outputs[
        connectedEdge!.sourceHandle!
      ];

    enviornment.phases[node.id].inputs[input.name] = outputValue;
  }
 }


function createExecutionEnvironment(
    node: AppNode,
    enviornment: Environment,
     logCollector: LogCollector
  ) : ExecutionEnviornment<any> 
  {
    return {
      getInput: (name: string) => enviornment.phases[node.id]?.inputs[name],
      setOutput: (name: string, value: string) => {
        enviornment.phases[node.id].outputs[name] = value;
      },
      getBrowser: () => enviornment.browser,
     setBrowser: (browser: Browser) => {
        enviornment.browser = browser;
       },
       setPage: (page: Page) => (enviornment.page = page),
       getPage: () => enviornment.page,
      log: logCollector,
     };
  }


async function cleanupEnviornment(enviornment: Environment) {
    if (enviornment.browser) {
      await enviornment.browser.close().catch((err) => {
        console.log("Cannot close browser, reason:", err);
      });
    }
  }

  async function decrementCredits(
    userId: string,
    amount: number,
    logCollector: LogCollector
  ) {
    try {
      await prisma.userBalance.update({
        where: {
          userId,
          credits: {
            gte: amount,
          },
        },
        data: {
          credits: { decrement: amount },
        },
      });
      return true;
    } catch (error) {
      logCollector.error("Insufficient balance");
      // user does not have sufficient balance
      return false;
    }
  }
  