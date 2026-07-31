'use client';

import React from 'react';
import { AlertCircle, CheckCircle, X } from 'lucide-react';

interface ToastAlertProps {
  type: 'error' | 'success' | null;
  message: string | null;
  onDismiss: () => void;
}

export const ToastAlert: React.FC<ToastAlertProps> = ({ type, message, onDismiss }) => {
  if (!type || !message) return null;

  const isError = type === 'error';

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-bounce-in">
      <div
        className={`flex items-center gap-3 px-4 py-3 rounded-xl border shadow-2xl backdrop-blur-md max-w-md ${
          isError
            ? 'bg-rose-950/90 border-rose-800 text-rose-200'
            : 'bg-emerald-950/90 border-emerald-800 text-emerald-200'
        }`}
      >
        {isError ? (
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
        ) : (
          <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
        )}

        <div className="text-sm font-medium leading-tight flex-1">{message}</div>

        <button
          onClick={onDismiss}
          className="p-1 text-slate-400 hover:text-slate-200 transition-colors rounded-md"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
