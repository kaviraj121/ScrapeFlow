import { TaskType } from "@/type/task";
import { LaunchBrowserExecutor } from "./LaunchBrowserExecutor"
import { PageToHtmlExecutor } from "./PageToHtmlExecutor";
import { ExecutionEnviornment } from "@/type/executor";
import { WorkflowTask } from "@/type/workflow";
import { ExtractTextFromElementExecutor } from "./ExtractTextFromElementExecutor";
import { FillInputExecutor } from "./FillInputExecutor";
import { ClickElementExecutor } from "./ClickElementExecutor";
import { WaitForElementExecutor } from "./WaitForElementExecutor";
import { DeviverViaWebHookExecutor } from "./DeliverViaWebHookExecutor";
import { ExtractDataWithAiExecutor } from "./ExtractDataWithAiExecutor";
import { ReadPropertyFromJsonExecutor } from "./ReadPropertyFromJsonExecutor";
import { AddPropertyToJsonExecutor } from "./AddPropertyToJsonExecutor ";
import { NavigateUrlExecutor } from "./NavigateUrlExecutor";
import { ScrollToElementExecutor } from "./ScrollToElementExecutor";


type ExecutorFn<T extends WorkflowTask> = (enviornment:ExecutionEnviornment<T>) => Promise<boolean>;

type RegistryType ={
  [K in TaskType] : ExecutorFn<WorkflowTask & {type:K}>;
}

export const ExecutorRegistry  = {
  LAUNCH_BROWSER: LaunchBrowserExecutor,
  PAGE_TO_HTML: PageToHtmlExecutor,
   EXTRACT_TEXT_FROM_ELEMENT: ExtractTextFromElementExecutor,
   FILL_INPUT: FillInputExecutor,
   CLICK_ELEMENT: ClickElementExecutor,
  WAIT_FOR_ELEMENT: WaitForElementExecutor,
  DELIVER_VIA_WEBHOOK: DeviverViaWebHookExecutor,
  EXTRACT_DATA_WITH_AI: ExtractDataWithAiExecutor,
   READ_PROPERTY_FROM_JSON: ReadPropertyFromJsonExecutor,
   ADD_PROPERTY_TO_JSON: AddPropertyToJsonExecutor,
   NAVIGATE_URL: NavigateUrlExecutor,
   SCROLL_TO_ELEMENT: ScrollToElementExecutor,
};