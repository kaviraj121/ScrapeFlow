import { ExecutionEnviornment } from "@/type/executor";
import { PageToHtml } from "../task/PageToHtml";


export async function PageToHtmlExecutor(
  enviornment: ExecutionEnviornment<typeof PageToHtml>
): Promise<boolean> {
  try {
    
    const html = await enviornment.getPage()!.content();
    enviornment.setOutput("Html", html);
    return true;
  } catch (error: any) {
    enviornment.log.error(error.message);
    return false;
  }
}