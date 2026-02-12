import React from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-75 backdrop-blur-sm flex items-center justify-center p-4 z-50 transition-opacity duration-300 ease-in-out"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div 
        className="bg-[#FFFFFF] dark:bg-[#1E293B] rounded-lg shadow-xl p-6 md:p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto relative custom-scrollbar" 
        onClick={(e) => e.stopPropagation()} 
      >
        <div className="flex justify-between items-center mb-4">
          <h2 id="modal-title" className="text-xl font-semibold text-[#0A2F5C] dark:text-[#F1F5F9]">{title}</h2>
          <button
            onClick={onClose}
            className="text-[#4A5E78] dark:text-[#94A3B8] hover:text-[#0A2F5C] dark:hover:text-[#F1F5F9] transition-colors"
            aria-label="Close modal"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="text-sm text-[#0A2F5C] dark:text-[#F1F5F9] space-y-3">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;