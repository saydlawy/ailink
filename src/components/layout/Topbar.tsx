import React from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import { Globe } from 'lucide-react';

export const Topbar: React.FC = () => {
  const { language, setLanguage, dir } = useLanguage();

  const toggleLanguage = () => {
    setLanguage(language === 'ar' ? 'en' : 'ar');
  };

  return (
    <header className="bg-white border-b border-slate-200 shadow-sm h-16 flex items-center justify-between px-6">
      <div className="flex-1"></div>
      <div className="flex items-center gap-4">
        <button
          onClick={toggleLanguage}
          className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
        >
          <Globe className="w-4 h-4" />
          <span>{language === 'ar' ? 'English' : 'العربية'}</span>
        </button>
      </div>
    </header>
  );
};
