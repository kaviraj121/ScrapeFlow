import { cn } from "@/lib/utils";
import { workFlowExecutionStatus } from "@/type/workflow";

const indicatorsColors: Record<workFlowExecutionStatus, string> = {
    COMPLETED: "bg-emerald-600",
    PENDING: "bg-slate-400",
    RUNNING: "bg-yellow-400",
    FAILED: "bg-red-400",
  };
  
  function ExecutionStatusIndicator({
    status,
  }: {
    status: workFlowExecutionStatus;
  }) {
    return (
      <div
        className={cn(
          "w-2 h-2 rounded-full bg-red-600",
          indicatorsColors[status]
        )}
      />
    );
  }
  
  export default ExecutionStatusIndicator;
  
  const labelColors: Record<workFlowExecutionStatus, string> = {
    COMPLETED: "text-emerald-600",
    PENDING: "text-slate-400",
    RUNNING: "text-yellow-400",
    FAILED: "text-red-400",
  };
  
  export function ExecutionStatusLabel({
    status,
  }: {
    status: workFlowExecutionStatus;
  }) {
    return (
      <span className={cn("lowercase font-semibold", labelColors[status])}>
        {status}
      </span>
    );
  }