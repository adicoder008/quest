// File: hooks/use-toast.tsx
'use client';

import { useState, useCallback } from 'react';
import { Check, AlertCircle, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'qp';
  icon?: string; // For QP emoji or custom icon
}

export const useToast = () => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' | 'qp' = 'success', icon?: string) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast: ToastMessage = { id, message, type, icon };

    setToasts((prev) => [...prev, newToast]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 3000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  return { toasts, showToast, removeToast };
};

// Toast Component
interface ToastProps {
  toast: ToastMessage;
  onClose: (id: string) => void;
}

export const Toast = ({ toast, onClose }: ToastProps) => {
  const bgColor = toast.type === 'success'
    ? 'bg-green-600'
    : toast.type === 'error'
      ? 'bg-red-600'
      : toast.type === 'qp'
        ? 'bg-[#EA6100]' // OnQuest orange
        : 'bg-blue-600';

  const Icon = toast.type === 'success'
    ? Check
    : toast.type === 'qp'
      ? null // Will use custom icon/emoji
      : AlertCircle;

  return (
    <div
      className={`${bgColor} text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3 min-w-[300px] animate-slide-up`}
    >
      {toast.icon ? (
        <span className="text-2xl">{toast.icon}</span>
      ) : Icon && (
        <Icon size={20} />
      )}
      <span className="font-medium flex-1">{toast.message}</span>
      <button
        onClick={() => onClose(toast.id)}
        className="hover:bg-white hover:bg-opacity-20 rounded p-1 transition-colors"
      >
        <X size={16} />
      </button>
    </div>
  );
};

// Toast Container Component
interface ToastContainerProps {
  toasts: ToastMessage[];
  onClose: (id: string) => void;
}

export const ToastContainer = ({ toasts, onClose }: ToastContainerProps) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-24 left-1/2 transform -translate-x-1/2 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <Toast toast={toast} onClose={onClose} />
        </div>
      ))}
    </div>
  );
};