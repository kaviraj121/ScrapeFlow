import { AppNode } from "@/type/appNode";
import { TaskRegistry } from "./task/registry";

export function calculateWorkflowCost(nodes: AppNode[]) {
    return nodes.reduce((acc, node) => {
      return acc + TaskRegistry[node.data.type].credits;
    }, 0);
  }
  