import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

export default function Notification({ message, type, onClose }) {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => {
      onClose();
    }, 4000);
    return () => clearTimeout(timer);
  }, [message, onClose]);

  if (!message) return null;

  const isSuccess = type === 'success';

  return (
    <div className="fixed top-5 right-5 z-[9999] flex items-center gap-3.5 px-4 py-3 rounded-xl border glass-panel animate-fade-in max-w-md shadow-2xl border-slate-800">
      <div className={`p-1.5 rounded-lg ${isSuccess ? 'bg-emerald-500/15 text-emerald-400' : 'bg-rose-500/15 text-rose-400'}`}>
        {isSuccess ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
      </div>
      <div className="flex-1">
        <p className="text-xs font-bold text-slate-100 tracking-wide">
          {isSuccess ? 'SUCCESS' : 'ERROR'}
        </p>
        <p className="text-[11px] text-slate-400 mt-0.5 font-medium leading-normal">
          {message}
        </p>
      </div>
      <button
        onClick={onClose}
        className="p-1 rounded text-slate-500 hover:text-slate-300 transition-colors"
      >
        <X size={14} />
      </button>
    </div>
  );
}
