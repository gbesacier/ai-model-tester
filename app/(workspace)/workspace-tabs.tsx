'use client';

import { usePathname, useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { TabGroup, TabList, Tab, TabPanels, TabPanel } from '@headlessui/react';

interface WorkspaceTabsProps {
  children: React.ReactNode;
  creditsSlot: React.ReactNode;
}

export default function WorkspaceTabs({ children, creditsSlot }: WorkspaceTabsProps) {
  const pathname = usePathname();
  const router = useRouter();

  const tabs = [
    { name: 'Tester', path: '/tester' },
    { name: 'Prompt Library', path: '/prompt-library' },
    { name: 'Results', path: '/results' },
  ];

  const selectedIndex = tabs.findIndex((tab) => pathname === tab.path) ?? 0;

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <TabGroup selectedIndex={selectedIndex} onChange={(idx) => router.push(tabs[idx].path)}>
          <div className="flex items-end justify-between border-b-2 border-gray-200">
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

            {/* Credits Display */}
            <div className="flex items-center gap-3 pb-2">
              {creditsSlot}
              {process.env.NODE_ENV === 'development' && (
                <button
                  onClick={() => signOut()}
                  className="text-xs text-gray-400 hover:text-red-500 border border-gray-300 rounded px-2 py-1"
                >
                  [dev] sign out
                </button>
              )}
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

