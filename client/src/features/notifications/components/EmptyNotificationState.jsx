import React from 'react';

const EmptyNotificationState = ({ variant = 'empty', onAction }) => {
  const isFilter = variant === 'filter';

  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 bg-white rounded-[14px] border border-[#E2E8F0]">
      
      {/* Icon Circle */}
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#F8FAFC] mb-5 relative">
        {isFilter ? (
          // Magnifying Glass Icon for Filter State
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#94A3B8" className="w-10 h-10">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
        ) : (
          // Bell Icon with Green Check for Empty State
          <div className="relative">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#3B82F6" className="w-10 h-10">
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
            </svg>
            <div className="absolute -top-1 -right-1 bg-[#16A34A] rounded-full p-0.5 border-2 border-white">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3 text-white">
                <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        )}
      </div>

      {/* Typography */}
      <h3 className="text-[18px] font-bold text-[#0F172A] mb-2">
        {isFilter ? 'No notifications match this filter' : "You're all caught up!"}
      </h3>
      <p className="text-[14px] text-[#64748B] text-center max-w-[380px] mb-6 leading-relaxed">
        {isFilter 
          ? 'Try selecting a different category, or clear your filters to see all notifications.' 
          : "There are no new notifications right now. We'll let you know as soon as something needs your attention."}
      </p>

      {/* Action Button */}
      <button 
        onClick={onAction}
        className="flex items-center gap-2 px-5 py-2.5 bg-white border border-[#E2E8F0] rounded-[8px] text-[13px] font-medium text-[#475569] hover:bg-[#F8FAFC] hover:text-[#0F172A] transition-colors shadow-xs"
      >
        {isFilter ? (
          <>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
            Clear filters
          </>
        ) : (
          <>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
            </svg>
            Refresh
          </>
        )}
      </button>
    </div>
  );
};

export default EmptyNotificationState;