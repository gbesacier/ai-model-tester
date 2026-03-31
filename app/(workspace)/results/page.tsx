import { Metadata } from 'next';
import ResultsTable from './results-table';

export const metadata: Metadata = {
  title: 'Test Results',
};

export default function ResultsPage() {
  return (
    <div className="bg-white rounded-xl p-8 shadow">
      <ResultsTable />
    </div>
  );
}
