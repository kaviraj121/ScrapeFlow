"use client";
import { getWorkflowExecutions } from "@/actions/workflows/getWorkflowExecutions";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DatesToDurationString } from "@/lib/helper/dates";
import { workFlowExecutionStatus } from "@/type/workflow";
import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { CoinsIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import ExecutionStatusIndicator from "./ExecutionStatusIndicator";

type InitialDataType = Awaited<ReturnType<typeof getWorkflowExecutions>>;

function ExecutionsTable({
    workflowId,
    initialData,
  }: {
    workflowId: string;
    initialData: InitialDataType;
  }) {
    const query = useQuery({
      queryKey: ["executions", workflowId],
      initialData,
      queryFn: () => getWorkflowExecutions(workflowId),
      refetchInterval: 5000,
    });
  
    const router = useRouter();
  
    return (
      <div className="border rounded-lg shadow-md overflow-auto ">
        <Table className="h-full">
          <TableHeader className="bg-muted">
            <TableRow>
              <TableHead>Id</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Consumed</TableHead>
              <TableHead className="text-right text-sm text-muted-foreground">
                Started at
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="gap-2 h-full overflow-auto">
            {query.data.map((execution) => {
              const duration = DatesToDurationString(
                execution.completedAt,
                execution.startedAt
              );
  
              const formattedStartedAt =
                execution.startedAt &&
                formatDistanceToNow(execution.startedAt, { addSuffix: true });
  
              return (
                <TableRow
                  key={execution.id}
                  className="cursor-pointer"
                  onClick={() => {
                    router.push(
                      `/workflow/runs/${execution.workflowId}/${execution.id}`
                    );
                  }}
                >
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-semibold">{execution.id}</span>
                      <div className="text-muted-foreground text-xs flex gap-1 items-center">
                        <span className="">Triggered via</span>
                        <Badge variant={"outline"}>{execution.trigger}</Badge>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <div className="flex gap-2 items-center">
                        <ExecutionStatusIndicator
                          status={execution.status as workFlowExecutionStatus}
                        />
                        <span className="font-semibold capitalize">
                          {execution.status}
                        </span>
                      </div>
                      <div className="text-muted-foreground text-xs mx-5">
                        {duration}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <div className="flex gap-2 items-center">
                        <CoinsIcon size={16} className="text-primary" />
                        <span className="font-semibold capitalize">
                          {execution.creditsConsumed}
                        </span>
                      </div>
                      <div className="text-muted-foreground text-xs mx-5">
                        Credits
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground capitalize first:uppercase">
                    {formattedStartedAt}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    );
  }
  
  export default ExecutionsTable;