import { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';

const Modal = ({ isOpen, onClose, title, children }) => {
  const modalRef = useRef(null);
  const [isClosing, setIsClosing] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Handle modal closing with animation
  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 300); // Match this with the animation duration
  };

  useEffect(() => {
    if (isOpen) {
      setMounted(true);
      modalRef.current?.focus();
      document.body.style.overflow = 'hidden';
      
      return () => {
        document.body.style.overflow = 'auto';
      };
    }
  }, [isOpen]);

  // If modal is not open and not in closing animation, don't render
  if (!isOpen && !isClosing) return null;

  // Animation classes based on state
  const backdropClasses = `
    fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm
    transition-opacity duration-300 ease-out
    ${isClosing ? 'opacity-0' : 'opacity-100'}
    ${mounted ? '' : 'animate-fade-in'}
  `;

  const modalClasses = `
    relative w-full max-w-md rounded-xl bg-white shadow-lg dark:bg-gray-800 overflow-hidden
    transition-all duration-300 ease-out
    ${isClosing ? 'opacity-0 scale-95 translate-y-4' : 'opacity-100 scale-100 translate-y-0'}
    ${mounted ? '' : 'animate-modal-in'}
  `;

  return (
    <div
      ref={modalRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      className={backdropClasses}
      tabIndex={-1}
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div 
        className={modalClasses}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-700">
          <h3 
            id="modal-title"
            className="text-lg font-semibold text-gray-900 dark:text-white animate-slide-in-right"
          >
            {title}
          </h3>
          <button
            type="button"
            className="inline-flex items-center justify-center w-8 h-8 text-gray-500 transition-all duration-200 transform rounded-lg hover:bg-gray-100 hover:text-red-500 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-red-400 hover:rotate-90"
            onClick={handleClose}
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-4 md:p-5 overflow-y-auto max-h-[calc(100vh-10rem)] animate-fade-in-up delay-150">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
