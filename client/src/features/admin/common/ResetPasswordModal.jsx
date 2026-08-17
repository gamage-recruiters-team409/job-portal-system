/**
 * @file ResetPasswordModal.jsx
 * @description Pixel-perfect Password Reset Link confirmation modal for Admin module.
 * Matches UI specifications with recipient email badge and security protocol alert.
 */

import { useState } from 'react';
import { Mail, RotateCcw, Info, CheckCircle2, Send, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { forgotPassword } from '../../../services/authService';

const ResetPasswordModal = ({
  isOpen,
  onClose,
  userName = 'User',
  email = '',
  isVerified = true,
  userType = 'User',
}) => {
  const [isSending, setIsSending] = useState(false);

  if (!isOpen) return null;

  const handleSendResetLink = async () => {
    if (!email) {
      toast.error('No email address provided.');
      return;
    }

    try {
      setIsSending(true);
      await forgotPassword(email);
      toast.success(`Password reset link sent to ${email}`);
      onClose();
    } catch (err) {
      toast.error(
        err.response?.data?.message || err.message || 'Failed to send reset link'
      );
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 sm:p-7 border border-slate-100 space-y-6 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900 leading-tight">
              Reset {userType} Password
            </h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              A secure password reset link will be sent to the registered email address for{' '}
              <strong className="text-slate-900 font-semibold">{userName}</strong>.
            </p>
          </div>

          <div className="w-10 h-10 rounded-full bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center shrink-0 shadow-2xs">
            <RotateCcw size={18} />
          </div>
        </div>

        {/* Recipient Email Card */}
        <div className="bg-[#EFF6FF] border border-blue-100 rounded-xl p-3.5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-full bg-white text-[#2563EB] shadow-2xs flex items-center justify-center shrink-0">
              <Mail size={16} />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Recipient Email
              </p>
              <p className="text-sm font-bold text-slate-900 truncate mt-0.5">
                {email}
              </p>
            </div>
          </div>

          {isVerified && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#DCFCE7] text-[#16A34A] text-xs font-semibold border border-emerald-200 shrink-0 shadow-2xs">
              <CheckCircle2 size={12} className="text-[#16A34A]" />
              Verified
            </span>
          )}
        </div>

        {/* Security Protocol Box */}
        <div className="bg-[#EFF6FF]/60 border border-blue-100 rounded-xl p-4 flex items-start gap-3 text-xs text-slate-600 leading-relaxed">
          <Info size={16} className="text-[#2563EB] shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-slate-900 block mb-0.5">
              Security Protocol
            </span>
            <span>
              For security reasons, this link will expire in exactly{' '}
              <strong className="text-slate-900 font-semibold">24 hours</strong>. If the link
              expires, you will need to re-initiate the request from this dashboard.
            </span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isSending}
            className="px-5 py-2.5 bg-white border border-slate-200 text-slate-700 text-sm font-semibold rounded-xl hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSendResetLink}
            disabled={isSending}
            className="px-6 py-2.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-sm font-semibold rounded-xl inline-flex items-center gap-2 shadow-sm transition-all disabled:opacity-50"
          >
            {isSending ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Sending...
              </>
            ) : (
              <>
                Send Reset Link
                <Send size={14} className="translate-x-0.5" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordModal;
