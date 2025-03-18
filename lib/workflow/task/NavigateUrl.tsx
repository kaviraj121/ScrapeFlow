import { TaskParamType, TaskType } from "@/type/task";
import { WorkflowTask } from "@/type/workflow";
import { Link2Icon, LucideProps } from "lucide-react";

export const NavigateUrlTask = {
    type: TaskType.NAVIGATE_URL,
    label: "Navigate Url",
    icon: (props: LucideProps) => (
      <Link2Icon className="stroke-orange-400" {...props} />
    ),
    isEntryPoint: false,
    inputs: [
      {
        name: "Web page",
        type: TaskParamType.BROWSER_INSTANCE,
        required: true,
      },
      {
        name: "Url",
        type: TaskParamType.STRING,
        required: true,
      },
    ] as const,
    outputs: [
      {
        name: "Web page",
        type: TaskParamType.BROWSER_INSTANCE,
      },
    ] as const,
    credits: 2,
  } satisfies WorkflowTask;