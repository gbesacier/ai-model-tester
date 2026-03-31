import { Suspense } from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { unauthorized } from "next/navigation";
import WorkspaceTabs from "./workspace-tabs";
import { getGatewayCredits } from "@/app/gateway";

async function CreditsDisplay() {
  const result = await getGatewayCredits();
  if (!result.success || result.balance === undefined) return null;
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-2">
      <div className="text-sm text-gray-600">Credits Remaining</div>
      <div className="text-lg font-semibold text-blue-600">
        ${result.balance.toFixed(2)}
      </div>
    </div>
  );
}

export default async function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);

  if (!session) {
    unauthorized();
  }

  return (
    <WorkspaceTabs
      creditsSlot={
        <Suspense fallback={<div className="animate-pulse bg-gray-300 rounded px-3 py-1 w-32 h-6" />}>
          <CreditsDisplay />
        </Suspense>
      }
    >
      {children}
    </WorkspaceTabs>
  );
}
