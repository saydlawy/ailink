import { useContext } from 'react';
import { LanguageContext } from '../contexts/LanguageContext';
import { translations } from '../translations';

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }

  const t = (key: string): string => {
    const dict = translations[context.language];
    return dict[key] || key;
  };

  return {
    language: context.language,
    setLanguage: context.setLanguage,
    dir: context.dir,
    t,
  };
};
