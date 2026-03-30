'use client';

import { usePathname, useRouter } from 'next/navigation';
import { TabGroup, TabList, Tab, TabPanels, TabPanel } from '@headlessui/react';

interface WorkspaceTabsProps {
  children: React.ReactNode;
  credits: { balance: number; totalUsed: number } | null;
}

export default function WorkspaceTabs({ children, credits }: WorkspaceTabsProps) {
  const pathname = usePathname();
  const router = useRouter();

  const tabs = [
    { name: 'Tester', path: '/workspace/tester' },
    { name: 'Prompt Library', path: '/workspace/prompt-library' },
    { name: 'Results', path: '/workspace/results' },
  ];

  const selectedIndex = tabs.findIndex((tab) => pathname === tab.path) ?? 0;

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-6">
            {/* Tabs */}
            <div className="flex-1">
              <TabGroup selectedIndex={selectedIndex} onChange={(idx) => router.push(tabs[idx].path)}>
                <TabList className="flex gap-2 border-b-2 border-gray-200">
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

                {/* Tab Panels */}
                <TabPanels className="mt-6">
                  {tabs.map((_, idx) => (
                    <TabPanel key={idx}>{children}</TabPanel>
                  ))}
                </TabPanels>
              </TabGroup>
            </div>
            
            {/* Credits Display */}
            {credits && (
              <div className="flex items-center gap-2">
                <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-2">
                  <div className="text-sm text-gray-600">Credits Remaining</div>
                  <div className="text-lg font-semibold text-blue-600">
                    ${credits.balance.toFixed(2)}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

