import React from 'react';
import { AlertTriangle, Trash2, CheckCircle2 } from 'lucide-react';
import Modal from './Modal';

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message,
  warningText,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isDanger = false,
  isLoading = false,
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="max-w-md">
      <div className="flex flex-col items-center text-center">
        <div
          className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 ${
            isDanger ? 'bg-rose-100 text-rose-600' : 'bg-blue-100 text-blue-600'
          }`}
        >
          {isDanger ? <AlertTriangle className="w-8 h-8" /> : <CheckCircle2 className="w-8 h-8" />}
        </div>

        <p className="text-slate-600 text-sm leading-relaxed mb-4">{message}</p>

        {warningText && (
          <div className="w-full bg-amber-50 border border-amber-200/80 rounded-xl p-3.5 mb-5 text-left flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-800 leading-normal">
              <strong>Caution:</strong> {warningText}
            </div>
          </div>
        )}

        <div className="flex items-center justify-end gap-3 w-full mt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2.5 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-5 py-2.5 text-sm font-semibold text-white rounded-xl shadow-sm transition-all flex items-center gap-2 ${
              isDanger
                ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/20'
                : 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/20'
            } ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {isLoading && <span className="animate-spin mr-1">⌛</span>}
            {confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
}
