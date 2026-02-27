import { create } from 'zustand';

export type ToastType = 'success' | 'error' | 'info';

export interface Toast {
  id: string;
  messageKey: string;
  type: ToastType;
}

interface StrategyState {
  suggestedVariables: Record<string, string>;
  setSuggestedVariables: (vars: Record<string, string>) => void;
  clearSuggestedVariables: () => void;
}

interface ToastState {
  toasts: Toast[];
  addToast: (messageKey: string, type: ToastType) => void;
  removeToast: (id: string) => void;
}

type AppStore = StrategyState & ToastState;

export const useAppStore = create<AppStore>((set) => ({
  // Strategy Slice
  suggestedVariables: {},
  setSuggestedVariables: (vars) => set({ suggestedVariables: vars }),
  clearSuggestedVariables: () => set({ suggestedVariables: {} }),
  
  // Toast Slice
  toasts: [],
  addToast: (messageKey, type) => set((state) => ({
    toasts: [...state.toasts, { id: Date.now().toString(), messageKey, type }]
  })),
  removeToast: (id) => set((state) => ({
    toasts: state.toasts.filter((t) => t.id !== id)
  }))
}));
