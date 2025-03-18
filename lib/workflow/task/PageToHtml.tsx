import { TaskParamType, TaskType } from "@/type/task";
import { WorkflowTask } from "@/type/workflow";
import { GlobeIcon, LucideProps } from "lucide-react";

export const PageToHtml = {
    type: TaskType.PAGE_TO_HTML,
    label:"Got Html from Page",
    icon : (props: LucideProps)=>(
        <GlobeIcon className="stroke-pink-400" {...props} />
    ),
    isEntryPoint:false,
    credits:2,
    inputs:[
        {name:"Web page",
            type:TaskParamType.BROWSER_INSTANCE,
            required:true,
           
        }
    ] as const,
    outputs:[
        {
            name:"Html",
            type: TaskParamType.STRING
        },
        {
            name:"Web page",
            type: TaskParamType.BROWSER_INSTANCE
        }
    ] as const,
} satisfies WorkflowTask;