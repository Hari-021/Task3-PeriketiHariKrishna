import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export default function Modal({ isOpen, onClose, title, children }) {
  // Disable body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      {/* Backdrop overlay */}
      <div className="absolute inset-0 cursor-default" onClick={onClose} />

      {/* Modal container */}
      <div className="relative w-full max-w-lg glass-panel glow-orange rounded-2xl overflow-hidden flex flex-col max-h-[90vh] transition-all duration-300 border border-slate-800/50">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/50 bg-slate-900/40">
          <h3 className="font-bold text-base text-slate-100 tracking-wide">{title}</h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800/60 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 text-slate-300">
          {children}
        </div>
      </div>
    </div>
  );
}
