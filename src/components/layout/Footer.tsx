import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-8 py-4 border-t border-gray-200 bg-white">
      <div className="w-full px-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 bg-blue-600 rounded-lg flex items-center justify-center">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="text-white">
                <path d="M12 2L3 7L12 12L21 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M3 17L12 22L21 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M3 12L12 17L21 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="text-sm text-gray-600">© 2024 whyXpse. All rights reserved.</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded">V1.2</span>
            <span className="text-sm text-gray-500">Powered by Security Solutions</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
