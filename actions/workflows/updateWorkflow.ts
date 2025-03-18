"use server";

import prisma from "@/lib/prisma";
import { WorkflowStatus } from "@/type/workflow";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export async  function UpdateWorkflow({
    id,
    defination,
}:{
    id:string;
    defination:string;
}){
    const {userId} =auth();

    if(!userId){
        throw new Error("unathenticated");
    }

    const workflow = await prisma.workFlow.findUnique({
        where:{
            id,
            userId,
        },
    });

        if(!workflow){ 
            throw new Error ("workflow not found");
        }
    if(workflow.status !== WorkflowStatus.DRAFT){
        throw new Error("workflow is not a draft");
    }
        await prisma.workFlow.update({
            data:{
                defination,
            },
            where:{
                id,
                userId,
            },
        });

        revalidatePath("/workflows")
}

