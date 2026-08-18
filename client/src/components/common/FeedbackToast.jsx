/**
 * @file FeedbackToast.jsx
 * @description Centralized, reusable rich feedback toast notification component.
 * Provides custom animated toasts with progress bar, title, subtitle, and dismiss button.
 * @module Common/Components
 */

import toast from 'react-hot-toast';
import {
  SuccessFeedbackIcon,
  ErrorFeedbackIcon,
  CloseFeedbackIcon,
} from './FeedbackIcons';

/**
 * Trigger a rich custom feedback toast notification.
 * @param {string} title - Primary bold heading
 * @param {string} [subtitle] - Secondary descriptive text
 * @param {'success' | 'error' | 'warning' | 'info'} [type='success'] - Toast type
 * @param {number} [duration=3000] - Duration in ms
 */
export const showFeedbackToast = (
  title,
  subtitle = '',
  type = 'success',
  duration = 3000
) => {
  return toast.custom(
    (t) => (
      <>
        <style>{`
          @keyframes progress-shrink-${t.id} {
            from { transform: scaleX(1); }
            to { transform: scaleX(0); }
          }
          .animate-progress-shrink-${t.id} {
            animation: progress-shrink-${t.id} ${duration}ms linear forwards;
          }
        `}</style>
        <div
          className={`${
            t.visible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
          } relative max-w-[420px] w-full bg-white shadow-xl shadow-slate-200/50 rounded-2xl pointer-events-auto flex flex-col border border-slate-100 transition-all duration-300 overflow-hidden font-sans`}
        >
          <div className="flex items-center w-full gap-4 p-4">
            {type === 'success' ? (
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-green-100/50 flex items-center justify-center text-[#16A34A] shadow-2xs">
                <SuccessFeedbackIcon />
              </div>
            ) : type === 'error' ? (
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-red-50 flex items-center justify-center text-[#DC2626] shadow-2xs">
                <ErrorFeedbackIcon />
              </div>
            ) : (
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-[#2563EB] shadow-2xs">
                <SuccessFeedbackIcon />
              </div>
            )}

            <div className="flex-1 min-w-0">
              <p className="text-[16px] font-semibold text-slate-900 leading-snug truncate">
                {title}
              </p>
              {subtitle && (
                <p className="mt-0.5 text-[13.5px] text-slate-500 font-medium leading-normal line-clamp-2">
                  {subtitle}
                </p>
              )}
            </div>

            <div className="flex-shrink-0">
              <button
                type="button"
                onClick={() => toast.dismiss(t.id)}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 transition-colors text-slate-400 hover:text-slate-600"
                aria-label="Close notification"
              >
                <CloseFeedbackIcon />
              </button>
            </div>
          </div>

          {/* Shrinking Animated Progress Bar */}
          <div
            className={`h-1 w-full origin-left ${
              type === 'success'
                ? 'bg-[#16A34A]'
                : type === 'error'
                ? 'bg-[#DC2626]'
                : 'bg-[#2563EB]'
            } ${t.visible ? `animate-progress-shrink-${t.id}` : ''}`}
          />
        </div>
      </>
    ),
    { duration }
  );
};

/** Shorthand for success feedback toast */
export const showSuccessToast = (title, subtitle = '', duration = 3000) =>
  showFeedbackToast(title, subtitle, 'success', duration);

/** Shorthand for error feedback toast */
export const showErrorToast = (title, subtitle = '', duration = 4000) =>
  showFeedbackToast(title, subtitle, 'error', duration);

export default showFeedbackToast;
