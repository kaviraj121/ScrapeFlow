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

    const {userId} = auth();
    if(!userId){
        throw new Error("unathenticted");
    }

    const {workflowId, flowDefination} = form;
    if(!workflowId){
        throw new Error("workflowId is required");
    }

    const workflow = await prisma.workFlow.findUnique({
        where:{
            userId,
            id:workflowId,
        }
    });
    if(!workflow){
        throw new Error("workflow not found");
    }

    let executionPlan:WorkflowExecutionPlan;
     let workflowDefinition = flowDefination;
    if (workflow.status === WorkflowStatus.PUBLISHED) {
        if(!workflow.executionPlan){
            throw new Error("no execution plan found in published workflow");
        }
        executionPlan = JSON.parse(workflow.executionPlan);
        workflowDefinition =workflow.defination;
    }else{
        if(!flowDefination){
            throw new Error("flow defination is not defined")
        }
        const flow = JSON.parse(flowDefination);
    const result = FlowToExecutionPlan(flow.nodes,flow.edges);
    if(result.error){
        throw new Error("flow defination not valid");
    }

    if(!result.executionPlan){
        throw new Error("no execution plan generated");
    }


    executionPlan = result.executionPlan;
    

    }
    
    

    const execution = await prisma.workflowExecution.create({
        data:{
            workflowId,
            userId,
            status:workFlowExecutionStatus.PENDING,
            startedAt:new Date(),
            defination: workflowDefinition,
            trigger:WorkflowExecutionTrigger.MANUAL,
            phases:{
                create:executionPlan.flatMap(phase =>{
                    return phase.nodes.flatMap((node)=>{
                        return {
                            userId,
                            status:ExecutionPhaseStatus.CREATED,
                            number:phase.phase,
                            node:JSON.stringify(node),
                            name:TaskRegistry[node.data.type].label,
                        }
                    })
                })
            },
        },

        select: {
            id:true,
            phases:true,
        },
    });

    if(!execution){
        throw new Error("workflow execution not created");
    }

    ExecuteWorkflow(execution.id);

    redirect(`/workflow/runs/${workflowId}/${execution.id}`);
}