import { Metadata } from 'next';
import PromptLibraryTable from './prompt-library-table';

export const metadata: Metadata = {
  title: 'Prompt Library',
};

export default function PromptLibraryPage() {
  return (
    <div className="bg-white rounded-xl p-8 shadow">
      <PromptLibraryTable />
    </div>
  );
}
