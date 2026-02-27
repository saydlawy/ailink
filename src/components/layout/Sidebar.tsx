import React from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import { 
  LayoutDashboard, 
  PenTool, 
  BarChart3, 
  MessageSquareText 
} from 'lucide-react';
import { cn } from '../../utils/cn';

export type ModuleType = 'postAnalyzer' | 'contentPlanner' | 'profileAnalyzer' | 'smartAssistant';

interface SidebarProps {
  activeModule: ModuleType;
  setActiveModule: (module: ModuleType) => void;
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeModule, setActiveModule, isOpen = false, onClose }) => {
  const { t, dir } = useLanguage();

  const menuItems: { id: ModuleType; icon: React.ElementType; labelKey: string }[] = [
    { id: 'postAnalyzer', icon: PenTool, labelKey: 'sidebar.postAnalyzer' },
    { id: 'contentPlanner', icon: LayoutDashboard, labelKey: 'sidebar.contentPlanner' },
    { id: 'profileAnalyzer', icon: BarChart3, labelKey: 'sidebar.profileAnalyzer' },
    { id: 'smartAssistant', icon: MessageSquareText, labelKey: 'sidebar.smartAssistant' },
  ];

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <aside className={cn(
        "fixed top-0 bottom-0 z-50 w-64 bg-slate-900 text-white transition-transform duration-300",
        dir === 'rtl'
          ? 'right-0 border-l border-slate-800'
          : 'left-0 border-r border-slate-800',
        isOpen ? 'translate-x-0' : (dir === 'rtl' ? 'translate-x-full lg:translate-x-0' : '-translate-x-full lg:translate-x-0')
      )}>
        <div className="h-full px-3 py-6 overflow-y-auto">
        <div className="mb-10 px-4">
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
            LinkedIn Strategy
          </h1>
        </div>
        <ul className="space-y-2 font-medium">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeModule === item.id;
            return (
              <li key={item.id}>
                <button
                  onClick={() => setActiveModule(item.id)}
                  className={cn(
                    "flex items-center w-full p-3 rounded-xl transition-colors duration-200",
                    isActive 
                      ? "bg-blue-600 text-white shadow-md" 
                      : "text-slate-300 hover:bg-slate-800 hover:text-white"
                  )}
                >
                  <Icon className={cn("w-5 h-5", dir === 'rtl' ? 'ml-3' : 'mr-3')} />
                  <span>{t(item.labelKey)}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </aside>
    </>
  );
};
