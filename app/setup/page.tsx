import { setupUser } from "@/actions/billing/getAvailableCredits";

async function SetupPage() {
  return await setupUser();
}

export default SetupPage;