import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import LLMTesterForm from "@/components/llm-tester-form";

export default async function Workspace() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-zinc-50 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-xl p-8 shadow">
        <h1 className="text-3xl font-bold mb-6">LLM Tester</h1>
        <LLMTesterForm />
      </div>
    </div>
  );
}
