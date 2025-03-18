import { TaskType } from "@/type/task";
import { ExtractTextElemrntTask } from "./ExtractTextFromElement";
import { LaunchBrowserTask } from "./LaunchBrowser";
import { PageToHtml } from "./PageToHtml";
import { WorkflowTask } from "@/type/workflow";
import { DeliverViaWebHookTask } from "./DeliverViaWebHook";
import { FillInputTask } from "./FillInput";
import { ClickElementTask } from "./ClickElement";
import { WaitForElementTask } from "./WaitForElement";
import { ExtractDataWithAiTask } from "./ExtractDataWithAi";
import { ReadPropertyFromJsonTask } from "./ReadPropertyFromJson";
import { AddPropertyToJsonTask } from "./AddPropertyToJson";
import { NavigateUrlTask } from "./NavigateUrl";
import { ScrollToElementTask } from "./ScrollToElement";

type Registery ={
    [K in TaskType] :WorkflowTask & {type : K} ;
};
export const TaskRegistry: Registery={
    LAUNCH_BROWSER: LaunchBrowserTask,
    PAGE_TO_HTML: PageToHtml,
    EXTRACT_TEXT_FROM_ELEMENT: ExtractTextElemrntTask,
    FILL_INPUT: FillInputTask,
    CLICK_ELEMENT: ClickElementTask,
    WAIT_FOR_ELEMENT: WaitForElementTask,
    DELIVER_VIA_WEBHOOK: DeliverViaWebHookTask,
    EXTRACT_DATA_WITH_AI: ExtractDataWithAiTask,
    READ_PROPERTY_FROM_JSON:ReadPropertyFromJsonTask,
    ADD_PROPERTY_TO_JSON:AddPropertyToJsonTask,
    NAVIGATE_URL:NavigateUrlTask,
    SCROLL_TO_ELEMENT:ScrollToElementTask,
}

