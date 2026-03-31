import { Metadata } from 'next';
import LLMTesterForm from "./llm-tester-form";

export const metadata: Metadata = {
  title: 'Tester',
};

export default function TesterPage() {
  return (
    <div className="bg-white rounded-xl p-8 shadow">
      <LLMTesterForm />
    </div>
  );
}
