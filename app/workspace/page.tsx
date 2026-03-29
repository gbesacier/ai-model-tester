import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import LLMTesterForm from "@/components/llm-tester-form";
import Link from "next/link";

export default async function Workspace() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-zinc-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">LLM Tester</h1>
          <Link
            href="/workspace/prompt-library"
            className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
          >
            📚 Prompt Library
          </Link>
        </div>
        <div className="bg-white rounded-xl p-8 shadow">
          <LLMTesterForm />
        </div>
      </div>
    </div>
  );
}
