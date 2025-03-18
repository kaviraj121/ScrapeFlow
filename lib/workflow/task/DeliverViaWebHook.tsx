import { TaskParamType, TaskType } from "@/type/task";
import { WorkflowTask } from "@/type/workflow";
import { LucideProps, SendIcon } from "lucide-react";

export const DeliverViaWebHookTask = {
    type: TaskType.DELIVER_VIA_WEBHOOK,
    label: "Deliver via Webhook",
    icon: (props: LucideProps) => (
      <SendIcon className="stroke-blue-400" {...props} />
    ),
    isEntryPoint: false,
    inputs: [
      {
        name: "Body",
        type: TaskParamType.STRING,
        required: true,
      },
      {
        name: "Target url",
        type: TaskParamType.STRING,
        required: true,
      },
    ] as const,
    outputs: [] as const,
    credits: 1,
  } satisfies WorkflowTask;