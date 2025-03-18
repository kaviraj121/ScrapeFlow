import { ExecutionEnviornment } from "@/type/executor";
import { FillInputTask } from "../task/FillInput";

export async function FillInputExecutor(
    enviornment: ExecutionEnviornment<typeof FillInputTask>
  ): Promise<boolean> {
    try {
      const selector = enviornment.getInput("Selector");
      if (!selector) {
        enviornment.log.error("input -> selector is not defined");
        return false;
      }
  
      const value = enviornment.getInput("Value");
      if (!value) {
        enviornment.log.error("input -> value is not defined");
        return false;
      }
  
      await enviornment.getPage()!.type(selector, value);
  
      return true;
    } catch (error: any) {
      enviornment.log.error(error.message);
      return false;
    }
  }