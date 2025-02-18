import React, { useState } from 'react';
import { useEditorStore } from '../store/editorStore';
import { Sparkles, Wand2, Palette, Brain } from 'lucide-react';

const aiFeatures = [
  {
    name: 'Smart Enhance',
    icon: Sparkles,
    description: 'Automatically enhance image quality',
  },
  {
    name: 'Background Remove',
    icon: Wand2,
    description: 'Remove background with AI',
  },
  {
    name: 'Style Transfer',
    icon: Palette,
    description: 'Apply artistic styles to your image',
  },
  {
    name: 'Smart Retouch',
    icon: Brain,
    description: 'AI-powered portrait retouching',
  },
];

export default function AIPanel() {
  const { canvas, activeObject } = useEditorStore();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleAIFeature = (feature: string) => {
    if (!canvas || !activeObject || !(activeObject instanceof fabric.Image)) return;

    setIsProcessing(true);
    // Simulate AI processing
    setTimeout(() => {
      setIsProcessing(false);
    }, 2000);
  };

  if (!activeObject || !(activeObject instanceof fabric.Image)) {
    return (
      <div className="p-4 text-center text-gray-400">
        Select an image to use AI features
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4">
        {aiFeatures.map((feature) => (
          <button
            key={feature.name}
            onClick={() => handleAIFeature(feature.name)}
            disabled={isProcessing}
            className={`
              p-4 rounded-lg bg-gray-700/50 hover:bg-gray-700 transition-colors
              ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            <div className="flex items-center space-x-3">
              <feature.icon className="w-6 h-6 text-blue-400" />
              <div className="text-left">
                <h3 className="text-sm font-medium text-white">{feature.name}</h3>
                <p className="text-xs text-gray-400">{feature.description}</p>
              </div>
            </div>
          </button>
        ))}
      </div>

      {isProcessing && (
        <div className="text-center text-sm text-gray-400">
          Processing... Please wait
        </div>
      )}
    </div>
  );
}