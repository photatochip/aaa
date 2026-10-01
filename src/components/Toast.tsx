import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';

export interface ToastMessage {
  id: number;
  text: string;
  type?: 'success' | 'error' | 'info';
}

interface ToastProps {
  toasts: ToastMessage[];
  onRemove: (id: number) => void;
}

export const Toast: React.FC<ToastProps> = ({ toasts, onRemove }) => {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 max-w-md pointer-events-none">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  );
};

const ToastItem: React.FC<{ toast: ToastMessage; onRemove: (id: number) => void }> = ({
  toast,
  onRemove,
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onRemove(toast.id);
    }, 2800);
    return () => clearTimeout(timer);
  }, [toast.id, onRemove]);

  return (
    <div className="pointer-events-auto flex items-center gap-2.5 px-4 py-3 bg-slate-900 text-white rounded-lg shadow-xl border border-slate-700 text-sm animate-in fade-in slide-in-from-bottom-2 duration-150">
      {toast.type === 'error' ? (
        <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
      ) : toast.type === 'info' ? (
        <Info className="w-4 h-4 text-sky-400 shrink-0" />
      ) : (
        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
      )}
      <span className="font-medium text-slate-100">{toast.text}</span>
    </div>
  );
};
