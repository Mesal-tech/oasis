import React from 'react';
import { X } from 'lucide-react';

export const Modal = ({ isOpen, onClose, children, title, maxWidth = 'max-w-2xl' }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className={`bg-[#121215] border border-[#27272A] rounded-3xl ${maxWidth} w-full max-h-[90vh] overflow-y-auto shadow-2xl`}
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <div className="flex items-center justify-between p-6 border-b border-[#27272A]">
            <h2 className="text-2xl font-bold text-white">{title}</h2>
            <button
              onClick={onClose}
              className="text-[#71717A] hover:text-white transition-colors p-2 hover:bg-white/5 rounded-lg"
            >
              <X size={24} />
            </button>
          </div>
        )}
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
};
