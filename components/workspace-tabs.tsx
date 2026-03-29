'use client';

import { usePathname, useRouter } from 'next/navigation';
import { TabGroup, TabList, Tab, TabPanels, TabPanel } from '@headlessui/react';

export default function WorkspaceTabs({ children }: { children: React.ReactNode }) {
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
          <h1 className="text-3xl font-bold text-gray-900 mb-6">LLM Model Tester</h1>

          {/* Tabs */}
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
      </div>
    </div>
  );
}
