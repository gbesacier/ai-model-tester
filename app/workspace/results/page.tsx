import ResultsTable from '@/components/results-table';

export const metadata = {
  title: 'Test Results',
};

export default function ResultsPage() {
  return (
    <div className="bg-white rounded-xl p-8 shadow">
      <ResultsTable />
    </div>
  );
}
