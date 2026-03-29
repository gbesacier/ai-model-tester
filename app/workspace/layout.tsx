import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import WorkspaceTabs from "@/components/workspace-tabs";

export default async function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/");
  }

  return <WorkspaceTabs>{children}</WorkspaceTabs>;
}
