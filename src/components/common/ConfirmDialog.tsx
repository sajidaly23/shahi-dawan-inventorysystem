import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Modal } from './Modal';
import { useDb } from '../../context/DbContext';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'primary';
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger',
}) => {
  const { settings } = useDb();
  const isLight = settings?.theme === 'light';

  const confirmStyles = {
    danger: 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-950/40',
    warning: 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-950/40',
    primary: 'gold-gradient-bg text-slate-950 font-extrabold shadow-amber-950/40 hover:brightness-110',
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      maxWidth="md"
      icon={<AlertTriangle className="w-5 h-5 text-amber-400" />}
    >
      <div className="space-y-4">
        <p className={`text-sm leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
          {message}
        </p>
        <div
          className={`flex items-center justify-end gap-3 pt-4 border-t ${
            isLight ? 'border-slate-200' : 'border-slate-800'
          }`}
        >
          <button
            type="button"
            onClick={onClose}
            className={`px-4 py-2.5 rounded-xl border text-sm font-medium transition cursor-pointer ${
              isLight
                ? 'border-slate-300 bg-slate-100 hover:bg-slate-200 text-slate-700'
                : 'border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white'
            }`}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`px-5 py-2.5 rounded-xl text-sm font-semibold shadow-lg transition transform active:scale-95 cursor-pointer ${confirmStyles[variant]}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  );
};
