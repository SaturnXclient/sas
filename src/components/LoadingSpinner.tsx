import React from 'react';

export default function LoadingSpinner() {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm">
      <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent"></div>
    </div>
  );
}