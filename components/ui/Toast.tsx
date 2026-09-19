'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';
import { cn } from '@/lib/utils';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = 'success') => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  const dismiss = (id: string) => setToasts((prev) => prev.filter((t) => t.id !== id));

  const iconMap: Record<ToastType, ReactNode> = {
    success: <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />,
    error:   <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />,
    info:    <Info className="w-4 h-4 text-blue-500 shrink-0" />,
  };

  const bgMap: Record<ToastType, string> = {
    success: 'border-green-200 dark:border-green-800/80 bg-white dark:bg-[#131924] text-neutral-800 dark:text-neutral-100',
    error:   'border-red-200 dark:border-red-800/80 bg-white dark:bg-[#131924] text-neutral-800 dark:text-neutral-100',
    info:    'border-blue-200 dark:border-blue-800/80 bg-white dark:bg-[#131924] text-neutral-800 dark:text-neutral-100',
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Toast Container */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none max-w-sm w-full sm:w-auto">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={cn(
              'pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg text-sm font-medium animate-in fade-in slide-in-from-bottom-2 duration-200',
              bgMap[toast.type],
            )}
          >
            {iconMap[toast.type]}
            <span className="flex-1 leading-snug">{toast.message}</span>
            <button
              onClick={() => dismiss(toast.id)}
              className="shrink-0 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within <ToastProvider>');
  return ctx;
}
