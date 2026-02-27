import React, { useEffect } from 'react';
import { useAppStore, Toast as ToastType } from '../../store/useAppStore';
import { useLanguage } from '../../hooks/useLanguage';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { cn } from '../../utils/cn';

const ToastItem: React.FC<{ toast: ToastType }> = ({ toast }) => {
  const { removeToast } = useAppStore();
  const { t } = useLanguage();

  useEffect(() => {
    const timer = setTimeout(() => {
      removeToast(toast.id);
    }, 5000);
    return () => clearTimeout(timer);
  }, [toast.id, removeToast]);

  const icons = {
    success: <CheckCircle className="w-5 h-5 text-emerald-500" />,
    error: <AlertCircle className="w-5 h-5 text-red-500" />,
    info: <Info className="w-5 h-5 text-blue-500" />
  };

  const bgColors = {
    success: 'bg-emerald-50 border-emerald-200',
    error: 'bg-red-50 border-red-200',
    info: 'bg-blue-50 border-blue-200'
  };

  return (
    <div className={cn(
      "flex items-center p-4 mb-4 border rounded-xl shadow-sm transition-all duration-300",
      bgColors[toast.type]
    )}>
      <div className="flex-shrink-0">
        {icons[toast.type]}
      </div>
      <div className="ms-3 text-sm font-medium text-gray-800">
        {t(toast.messageKey)}
      </div>
      <button
        onClick={() => removeToast(toast.id)}
        className="ms-auto -mx-1.5 -my-1.5 bg-transparent text-gray-400 hover:text-gray-900 rounded-lg focus:ring-2 focus:ring-gray-300 p-1.5 hover:bg-gray-100 inline-flex items-center justify-center h-8 w-8"
      >
        <span className="sr-only">Close</span>
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

export const ToastContainer: React.FC = () => {
  const { toasts } = useAppStore();
  const { dir } = useLanguage();

  return (
    <div className={cn(
      "fixed bottom-5 z-50 w-full max-w-xs",
      dir === 'rtl' ? 'left-5' : 'right-5'
    )}>
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} />
      ))}
    </div>
  );
};
