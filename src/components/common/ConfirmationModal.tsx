import React, { useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason?: string) => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  requireReason?: boolean;
  reasonPlaceholder?: string;
  variant?: 'danger' | 'warning' | 'primary';
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  requireReason = false,
  reasonPlaceholder = 'Please enter a reason...',
  variant = 'danger'
}) => {
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (requireReason && !reason.trim()) {
      setError('A reason is required to proceed.');
      return;
    }
    onConfirm(reason);
    setReason('');
    setError('');
    onClose();
  };

  const variantStyles = {
    danger: 'bg-red-600 hover:bg-red-700 text-white',
    warning: 'bg-amber-600 hover:bg-amber-700 text-white',
    primary: 'bg-[#f5764b] hover:bg-[#e05a2b] text-white',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20">
      <div className="w-full max-w-md bg-white rounded-lg shadow-xs border border-gray-200 overflow-hidden max-h-[90vh] overflow-y-auto">
        <div className="p-5">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded ${variant === 'danger' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'}`}>
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900">{title}</h3>
                <p className="text-xs text-gray-500 mt-0.5">{message}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-1 rounded"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {requireReason && (
            <div className="mt-4">
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Reason / Note *
              </label>
              <textarea
                value={reason}
                onChange={(e) => {
                  setReason(e.target.value);
                  if (error) setError('');
                }}
                placeholder={reasonPlaceholder}
                rows={3}
                className="w-full text-xs p-2.5 rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-1 focus:ring-[#f5764b] text-gray-900"
              />
              {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
            </div>
          )}

          <div className="mt-5 flex items-center justify-end gap-2.5 pt-3 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded text-xs font-medium border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 transition-colors"
            >
              {cancelText}
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              className={`px-3.5 py-1.5 rounded text-xs font-medium transition-colors ${variantStyles[variant]}`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
