import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function ErrorMessage({ message }: { message: string }) {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-gray-800 rounded-lg p-6 text-center">
        <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-white mb-2">
          {t('error.title')}
        </h2>
        <p className="text-gray-300 mb-4">{message}</p>
        <button
          onClick={() => window.location.reload()}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
        >
          {t('error.retry')}
        </button>
      </div>
    </div>
  );
}