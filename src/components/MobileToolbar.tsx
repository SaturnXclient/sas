import React from 'react';
import { Menu, Undo, Redo, Download, Share2, Layers } from 'lucide-react';
import { useEditorStore } from '../store/editorStore';

interface MobileToolbarProps {
  onOpenSidebar: () => void;
  className?: string;
}

export default function MobileToolbar({ onOpenSidebar, className = '' }: MobileToolbarProps) {
  const { undo, redo, canvas } = useEditorStore();

  const handleExport = () => {
    if (!canvas) return;
    const dataUrl = canvas.toDataURL({
      format: 'png',
      quality: 1,
    });
    const link = document.createElement('a');
    link.download = 'sarux-export.png';
    link.href = dataUrl;
    link.click();
  };

  return (
    <div className={`fixed bottom-0 left-0 right-0 bg-gray-800 border-t border-gray-700 p-2 z-40 ${className}`}>
      <div className="flex items-center justify-between max-w-screen-lg mx-auto">
        <button
          onClick={onOpenSidebar}
          className="p-3 rounded-full hover:bg-gray-700 transition-colors"
        >
          <Menu className="w-6 h-6 text-gray-300" />
        </button>

        <div className="flex space-x-2">
          <button
            onClick={undo}
            className="p-3 rounded-full hover:bg-gray-700 transition-colors"
          >
            <Undo className="w-6 h-6 text-gray-300" />
          </button>
          <button
            onClick={redo}
            className="p-3 rounded-full hover:bg-gray-700 transition-colors"
          >
            <Redo className="w-6 h-6 text-gray-300" />
          </button>
        </div>

        <div className="flex space-x-2">
          <button
            onClick={handleExport}
            className="p-3 rounded-full hover:bg-gray-700 transition-colors"
          >
            <Download className="w-6 h-6 text-gray-300" />
          </button>
          <button
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: 'My Sarux Creation',
                  text: 'Check out what I made with Sarux!',
                  url: window.location.href,
                });
              }
            }}
            className="p-3 rounded-full hover:bg-gray-700 transition-colors"
          >
            <Share2 className="w-6 h-6 text-gray-300" />
          </button>
        </div>
      </div>
    </div>
  );
}