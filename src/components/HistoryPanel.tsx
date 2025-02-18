import React from 'react';
import { useEditorStore } from '../store/editorStore';
import { History, RotateCcw, RotateCw } from 'lucide-react';

export default function HistoryPanel() {
  const { history, historyIndex, undo, redo } = useEditorStore();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-white">History</h2>
        <div className="flex space-x-2">
          <button
            onClick={undo}
            disabled={historyIndex <= 0}
            className={`p-2 rounded hover:bg-gray-700 transition-colors ${
              historyIndex <= 0 ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <RotateCcw className="w-4 h-4 text-gray-300" />
          </button>
          <button
            onClick={redo}
            disabled={historyIndex >= history.length - 1}
            className={`p-2 rounded hover:bg-gray-700 transition-colors ${
              historyIndex >= history.length - 1 ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <RotateCw className="w-4 h-4 text-gray-300" />
          </button>
        </div>
      </div>

      <div className="space-y-2">
        {history.map((_, index) => (
          <div
            key={index}
            className={`
              flex items-center space-x-3 p-2 rounded
              ${index === historyIndex ? 'bg-blue-500/20 text-blue-400' : 'text-gray-400'}
              ${index <= historyIndex ? 'opacity-100' : 'opacity-50'}
            `}
          >
            <History className="w-4 h-4" />
            <span className="text-sm">
              {index === 0
                ? 'Initial State'
                : `Edit ${index}`}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}