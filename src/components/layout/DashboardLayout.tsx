import React, { useState } from 'react';
import { Sidebar, ModuleType } from './Sidebar';
import { Topbar } from './Topbar';
import { useLanguage } from '../../hooks/useLanguage';
import { cn } from '../../utils/cn';

interface DashboardLayoutProps {
  children: (activeModule: ModuleType) => React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [activeModule, setActiveModule] = useState<ModuleType>('postAnalyzer');
  const { dir } = useLanguage();

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <Sidebar activeModule={activeModule} setActiveModule={setActiveModule} />
      <div className={cn(
        "transition-all duration-300 flex flex-col min-h-screen",
        dir === 'rtl' ? 'mr-64' : 'ml-64'
      )}>
        <Topbar />
        <main className="flex-1 p-6 overflow-x-hidden">
          <div className="max-w-7xl mx-auto">
            {children(activeModule)}
          </div>
        </main>
      </div>
    </div>
  );
};
