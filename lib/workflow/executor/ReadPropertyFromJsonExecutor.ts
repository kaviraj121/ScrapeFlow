import { ExecutionEnviornment } from "@/type/executor";
import { ReadPropertyFromJsonTask } from "../task/ReadPropertyFromJson";

export async function ReadPropertyFromJsonExecutor(
    enviornment: ExecutionEnviornment<typeof ReadPropertyFromJsonTask>
  ): Promise<boolean> {
    try {
      let jsonData = enviornment.getInput("JSON");
      if (!jsonData) {
        enviornment.log.error("input -> JSON is not defined");
        return false;
      }
      const propertyName = enviornment.getInput("Property name");
  
      if (!propertyName) {
        enviornment.log.error("input -> Property is not defined");
        return false;
      }
      const json = JSON.parse(jsonData);
  
      const propertValue = json[propertyName];
  
      if (!propertValue) {
        enviornment.log.error("Property not found");
        return false;
      }
  
      enviornment.setOutput("Property Value", propertValue);
  
      return true;
    } catch (error: any) {
      enviornment.log.error(error.message);
      return false;
    }
  }