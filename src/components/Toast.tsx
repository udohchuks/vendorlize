'use client';

import React, { useEffect } from 'react';

export interface ToastMessage {
  id: string;
  text: string;
  type: 'success' | 'error';
}

interface ToastProps {
  message: string | null;
  type: 'success' | 'error';
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
  useEffect(() => {
    if (!message) return;

    const timer = setTimeout(() => {
      onClose();
    }, 3000);

    return () => clearTimeout(timer);
  }, [message, onClose]);

  if (!message) return null;

  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 w-full max-w-[380px] px-4 animate-slide-up">
      <div
        className={`w-full px-5 py-4 rounded-2xl backdrop-blur-md shadow-2xl flex items-center justify-between gap-3 border ${
          type === 'success'
            ? 'bg-[#181615]/95 border-[#D4A853]/35 text-[#FAF0E6]'
            : 'bg-[#1C1414]/95 border-red-500/35 text-[#FAF0E6]'
        }`}
      >
        <div className="flex items-center gap-3">
          {type === 'success' ? (
            <div className="p-1 rounded-lg bg-[#D4A853]/15 text-[#D4A853] flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="3" stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
              </svg>
            </div>
          ) : (
            <div className="p-1 rounded-lg bg-red-500/15 text-red-500 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="3" stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
              </svg>
            </div>
          )}
          <span className="text-xs font-semibold tracking-wide leading-relaxed">
            {message}
          </span>
        </div>
        
        <button
          onClick={onClose}
          className="text-[#C9B99A] hover:text-[#FAF0E6] p-0.5 rounded transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-3.5 h-3.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
};
