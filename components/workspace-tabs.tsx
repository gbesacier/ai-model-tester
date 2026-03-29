'use client';

import { usePathname, useRouter } from 'next/navigation';
import { TabGroup, TabList, Tab, TabPanels, TabPanel } from '@headlessui/react';
import { useEffect, useState } from 'react';
import { getGatewayCredits } from '@/app/actions/gateway';

export default function WorkspaceTabs({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [credits, setCredits] = useState<{ balance: number; totalUsed: number } | null>(null);
  const [creditsLoading, setCreditsLoading] = useState(true);

  useEffect(() => {
    const fetchCredits = async () => {
      try {
        const result = await getGatewayCredits();
        if (result.success && result.balance !== undefined && result.totalUsed !== undefined) {
          setCredits({
            balance: result.balance,
            totalUsed: result.totalUsed,
          });
        }
      } catch (error) {
        console.error('Error fetching credits:', error);
      } finally {
        setCreditsLoading(false);
      }
    };

    fetchCredits();
  }, []);

  const tabs = [
    { name: 'Tester', path: '/workspace/tester' },
    { name: 'Prompt Library', path: '/workspace/prompt-library' },
    { name: 'Results', path: '/workspace/results' },
  ];

  const selectedIndex = tabs.findIndex((tab) => pathname === tab.path) ?? 0;

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Tabs with Credits on same line */}
        <TabGroup selectedIndex={selectedIndex} onChange={(idx) => router.push(tabs[idx].path)}>
          <div className="flex items-center justify-between border-b-2 border-gray-200">
            <TabList className="flex gap-2">
              {tabs.map((tab, idx) => (
                <Tab
                  key={idx}
                  className={({ selected }) =>
                    `px-6 py-3 font-semibold border-b-2 transition-colors ${
                      selected
                        ? 'text-blue-600 border-blue-600 bg-white'
                        : 'text-gray-600 border-transparent hover:text-gray-900 hover:border-gray-300'
                    }`
                  }
                >
                  {tab.name}
                </Tab>
              ))}
            </TabList>
            
            {/* Credits Display - Only shown for logged-in users (validated server-side) */}
            <div className="flex items-center gap-2 pb-3">
              {creditsLoading ? (
                <div className="animate-pulse bg-gray-300 rounded px-3 py-1 w-32 h-6"></div>
              ) : credits ? (
                <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-2">
                  <div className="text-sm text-gray-600">Credits Remaining</div>
                  <div className="text-lg font-semibold text-blue-600">
                    ${credits.balance.toFixed(2)}
                  </div>
                </div>
              ) : null}
            </div>
          </div>

          {/* Tab Panels */}
          <TabPanels className="mt-6">
            {tabs.map((_, idx) => (
              <TabPanel key={idx}>{children}</TabPanel>
            ))}
          </TabPanels>
        </TabGroup>
      </div>
    </div>
  );
}

