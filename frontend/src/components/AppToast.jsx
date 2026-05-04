import React, { useEffect } from 'react';

function AppToast({ toast, onClose }) {
  useEffect(() => {
    if (!toast) return undefined;

    const timer = setTimeout(() => {
      onClose();
    }, 3200);

    return () => clearTimeout(timer);
  }, [toast, onClose]);

  if (!toast) return null;

  const isSuccess = toast.type === 'success';

  return (
    <div className="pointer-events-none fixed inset-x-0 top-24 z-[70] flex justify-center px-4">
      <div
        className={`pointer-events-auto w-full max-w-md overflow-hidden rounded-[1.5rem] border shadow-[0_24px_60px_-36px_rgba(15,23,42,0.65)] backdrop-blur-xl ${
          isSuccess
            ? 'border-emerald-200/80 bg-white/95'
            : 'border-red-200/80 bg-white/95'
        }`}
      >
        <div className="flex items-start gap-4 p-4">
          <div
            className={`mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${
              isSuccess ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
            }`}
          >
            {isSuccess ? (
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m5 13 4 4L19 7" />
              </svg>
            ) : (
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v4m0 4h.01M4.93 19h14.14c1.54 0 2.5-1.67 1.73-3L13.73 4c-.77-1.33-2.69-1.33-3.46 0L3.2 16c-.77 1.33.19 3 1.73 3Z" />
              </svg>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <p className={`text-sm font-semibold ${isSuccess ? 'text-emerald-800' : 'text-red-800'}`}>
              {isSuccess ? 'Success' : 'Something went wrong'}
            </p>
            <p className="mt-1 text-sm leading-6 text-slate-600">{toast.message}</p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
            aria-label="Close notification"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m6 6 12 12M18 6 6 18" />
            </svg>
          </button>
        </div>

        <div className={`h-1 w-full ${isSuccess ? 'bg-emerald-500/80' : 'bg-red-500/80'}`} />
      </div>
    </div>
  );
}

export default AppToast;
