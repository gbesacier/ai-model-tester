import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function Workspace() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-zinc-50 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-xl p-8 shadow">
        <h1 className="text-3xl font-bold mb-4">Workspace</h1>
        <p className="text-gray-600">This page is visible only to logged-in users.</p>
        <p className="text-sm text-gray-500 mt-3">(Empty content for now)</p>
      </div>
    </div>
  );
}
