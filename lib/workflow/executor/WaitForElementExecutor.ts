import { ExecutionEnviornment } from "@/type/executor";
import { WaitForElementTask } from "../task/WaitForElement";

export async function WaitForElementExecutor(
    enviornment: ExecutionEnviornment<typeof WaitForElementTask>
  ): Promise<boolean> {
    try {
      const selector = enviornment.getInput("Selector");
      if (!selector) {
        enviornment.log.error("input -> selector is not defined");
        return false;
      }
      const visibility = enviornment.getInput("Visiblity");
      if (!visibility) {
        enviornment.log.error("input -> visibility is not defined");
        return false;
      }
  
      await enviornment.getPage()!.waitForSelector(selector, {
        visible: visibility === "visible",
        hidden: visibility === "hidden",
      });
  
      enviornment.log.info(`Element ${selector} became: ${visibility}`);
  
      return true;
    } catch (error: any) {
      enviornment.log.error(error.message);
      return false;
    }
  }