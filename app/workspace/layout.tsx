import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import WorkspaceTabs from "@/components/workspace-tabs";
import { getGatewayCredits } from "@/app/actions/gateway";

export default async function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/");
  }

  let credits: { balance: number; totalUsed: number } | null = null;
  try {
    const result = await getGatewayCredits();
    if (result.success && result.balance !== undefined && result.totalUsed !== undefined) {
      credits = { balance: result.balance, totalUsed: result.totalUsed };
    }
  } catch {
    // Credits fetch failed — continue without showing credits
  }

  return <WorkspaceTabs credits={credits}>{children}</WorkspaceTabs>;
}
