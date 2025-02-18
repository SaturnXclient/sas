import React from 'react';
import { useEditorStore } from '../store/editorStore';

export default function PropertiesPanel() {
  const { activeObject, canvas } = useEditorStore();

  const updateProperty = (property: string, value: any) => {
    if (!activeObject || !canvas) return;
    
    activeObject.set(property, value);
    canvas.renderAll();
    useEditorStore.getState().addToHistory();
  };

  if (!activeObject) {
    return (
      <div className="p-4 border-t border-gray-700">
        <p className="text-gray-400 text-sm">Select an object to edit its properties</p>
      </div>
    );
  }

  return (
    <div className="p-4 border-t border-gray-700">
      <h2 className="text-lg font-semibold text-white mb-4">Properties</h2>
      
      <div className="space-y-4">
        {/* Position */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Position
          </label>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs text-gray-400">X</label>
              <input
                type="number"
                value={Math.round(activeObject.left ?? 0)}
                onChange={(e) => updateProperty('left', Number(e.target.value))}
                className="w-full bg-gray-700 text-white px-2 py-1 rounded"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400">Y</label>
              <input
                type="number"
                value={Math.round(activeObject.top ?? 0)}
                onChange={(e) => updateProperty('top', Number(e.target.value))}
                className="w-full bg-gray-700 text-white px-2 py-1 rounded"
              />
            </div>
          </div>
        </div>

        {/* Size */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Size
          </label>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs text-gray-400">Width</label>
              <input
                type="number"
                value={Math.round(activeObject.width ?? 0)}
                onChange={(e) => updateProperty('width', Number(e.target.value))}
                className="w-full bg-gray-700 text-white px-2 py-1 rounded"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400">Height</label>
              <input
                type="number"
                value={Math.round(activeObject.height ?? 0)}
                onChange={(e) => updateProperty('height', Number(e.target.value))}
                className="w-full bg-gray-700 text-white px-2 py-1 rounded"
              />
            </div>
          </div>
        </div>

        {/* Rotation */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Rotation
          </label>
          <input
            type="number"
            value={Math.round(activeObject.angle ?? 0)}
            onChange={(e) => updateProperty('angle', Number(e.target.value))}
            className="w-full bg-gray-700 text-white px-2 py-1 rounded"
          />
        </div>

        {/* Opacity */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Opacity
          </label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={activeObject.opacity ?? 1}
            onChange={(e) => updateProperty('opacity', Number(e.target.value))}
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
}