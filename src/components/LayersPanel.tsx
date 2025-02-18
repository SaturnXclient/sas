import React from 'react';
import { useEditorStore } from '../store/editorStore';
import { Eye, EyeOff, Trash2, Lock, Unlock } from 'lucide-react';

export default function LayersPanel() {
  const { canvas } = useEditorStore();
  const [layers, setLayers] = React.useState<fabric.Object[]>([]);

  React.useEffect(() => {
    if (!canvas) return;

    const updateLayers = () => {
      setLayers([...canvas.getObjects()].reverse());
    };

    canvas.on('object:added', updateLayers);
    canvas.on('object:removed', updateLayers);
    canvas.on('object:modified', updateLayers);

    return () => {
      canvas.off('object:added', updateLayers);
      canvas.off('object:removed', updateLayers);
      canvas.off('object:modified', updateLayers);
    };
  }, [canvas]);

  const toggleVisibility = (object: fabric.Object) => {
    if (!canvas) return;
    object.visible = !object.visible;
    canvas.renderAll();
  };

  const toggleLock = (object: fabric.Object) => {
    if (!canvas) return;
    object.selectable = !object.selectable;
    object.evented = !object.evented;
    canvas.renderAll();
  };

  const deleteLayer = (object: fabric.Object) => {
    if (!canvas) return;
    canvas.remove(object);
  };

  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold text-white mb-4">Layers</h2>
      <div className="space-y-2">
        {layers.map((object, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-2 bg-gray-700/50 rounded"
          >
            <div className="flex items-center space-x-2">
              <button
                onClick={() => toggleVisibility(object)}
                className="text-gray-300 hover:text-white"
              >
                {object.visible ? (
                  <Eye className="w-4 h-4" />
                ) : (
                  <EyeOff className="w-4 h-4" />
                )}
              </button>
              <span className="text-sm text-gray-300">
                {object.type || 'Layer'} {index + 1}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => toggleLock(object)}
                className="text-gray-300 hover:text-white"
              >
                {object.selectable ? (
                  <Unlock className="w-4 h-4" />
                ) : (
                  <Lock className="w-4 h-4" />
                )}
              </button>
              <button
                onClick={() => deleteLayer(object)}
                className="text-gray-300 hover:text-white"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}