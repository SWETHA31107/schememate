import React, { useEffect } from 'react';
import { LogOut, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const LogoutModal = ({ isOpen, onClose, onConfirm }) => {
  const { t } = useTranslation();

  // Handle keyboard events (Escape to close, Enter to confirm)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;
      if (e.key === 'Escape') onClose();
      if (e.key === 'Enter') onConfirm();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, onConfirm]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div 
        className="bg-white dark:bg-darkCard w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden transform animate-in zoom-in-95 fade-in duration-300 ease-out mt-64"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {/* Header */}
        <div className="relative p-6 pb-0 flex items-center justify-center">
          <button 
            onClick={onClose}
            className="absolute right-4 top-4 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            aria-label="Close"
          >
            <X size={20} />
          </button>
          <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center text-red-600 dark:text-red-400 mb-4">
            <LogOut size={32} />
          </div>
        </div>

        {/* Content */}
        <div className="px-8 pb-8 text-center">
          <h3 
            id="modal-title" 
            className="text-2xl font-bold text-slate-900 dark:text-white mb-2 font-serif"
          >
            {t('nav.logout_confirm')}
          </h3>
          <p className="text-slate-600 dark:text-slate-300 text-lg">
            {t('nav.logout_msg')}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 p-6 pt-0">
          <button 
            onClick={onClose}
            className="flex-1 px-6 py-3 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all font-semibold active:scale-95"
          >
            {t('nav.cancel')}
          </button>
          <button 
            onClick={onConfirm}
            className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-lg shadow-red-600/20 transition-all font-semibold active:scale-95 flex items-center justify-center gap-2"
          >
            <LogOut size={18} />
            {t('nav.logout')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LogoutModal;
