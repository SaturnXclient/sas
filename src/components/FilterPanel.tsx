import React, { useState } from 'react';
import { useEditorStore } from '../store/editorStore';
import { Sliders, Sparkles, Palette } from 'lucide-react';
import tinycolor from 'tinycolor2';

const filters = [
  { name: 'Brightness', min: -100, max: 100, default: 0 },
  { name: 'Contrast', min: -100, max: 100, default: 0 },
  { name: 'Saturation', min: -100, max: 100, default: 0 },
  { name: 'Temperature', min: -100, max: 100, default: 0 },
  { name: 'Blur', min: 0, max: 20, default: 0 },
  { name: 'Noise', min: 0, max: 100, default: 0 },
];

const presets = [
  { name: 'Vintage', icon: '🎞️', values: { brightness: 10, contrast: 20, saturation: -20, temperature: 15 } },
  { name: 'B&W', icon: '⚫', values: { brightness: 0, contrast: 20, saturation: -100, temperature: 0 } },
  { name: 'Vivid', icon: '🌈', values: { brightness: 5, contrast: 25, saturation: 25, temperature: 0 } },
  { name: 'Moody', icon: '🌙', values: { brightness: -10, contrast: 15, saturation: -15, temperature: -10 } },
];

export default function FilterPanel() {
  const { canvas, activeObject } = useEditorStore();
  const [filterValues, setFilterValues] = useState(
    filters.reduce((acc, filter) => ({ ...acc, [filter.name.toLowerCase()]: filter.default }), {})
  );

  const applyFilters = (values: any) => {
    if (!canvas || !activeObject) return;

    if (activeObject instanceof fabric.Image) {
      const filters = [];

      if (values.brightness !== 0) {
        filters.push(new fabric.Image.filters.Brightness({ brightness: values.brightness / 100 }));
      }
      if (values.contrast !== 0) {
        filters.push(new fabric.Image.filters.Contrast({ contrast: values.contrast / 100 }));
      }
      if (values.saturation !== 0) {
        filters.push(new fabric.Image.filters.Saturation({ saturation: values.saturation / 100 }));
      }
      if (values.blur > 0) {
        filters.push(new fabric.Image.filters.Blur({ blur: values.blur / 20 }));
      }

      // Apply color temperature
      if (values.temperature !== 0) {
        const temp = values.temperature;
        const color = temp > 0 
          ? tinycolor({ r: 255, g: 255 - temp * 2, b: 255 - temp * 4 })
          : tinycolor({ r: 255 + temp * 4, g: 255 + temp * 2, b: 255 });
        
        filters.push(new fabric.Image.filters.BlendColor({
          color: color.toHexString(),
          mode: 'multiply',
          alpha: Math.abs(temp) / 100
        }));
      }

      activeObject.filters = filters;
      activeObject.applyFilters();
      canvas.renderAll();
    }
  };

  const handleFilterChange = (name: string, value: number) => {
    const newValues = { ...filterValues, [name.toLowerCase()]: value };
    setFilterValues(newValues);
    applyFilters(newValues);
  };

  const applyPreset = (preset: typeof presets[0]) => {
    setFilterValues(preset.values);
    applyFilters(preset.values);
  };

  if (!activeObject || !(activeObject instanceof fabric.Image)) {
    return (
      <div className="p-4 text-center text-gray-400">
        Select an image to apply filters
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Presets */}
      <div>
        <h3 className="text-sm font-medium text-gray-300 mb-3">Presets</h3>
        <div className="grid grid-cols-2 gap-2">
          {presets.map((preset) => (
            <button
              key={preset.name}
              onClick={() => applyPreset(preset)}
              className="flex items-center space-x-2 p-2 rounded bg-gray-700/50 hover:bg-gray-700 transition-colors"
            >
              <span className="text-xl">{preset.icon}</span>
              <span className="text-sm text-gray-300">{preset.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="space-y-4">
        {filters.map((filter) => (
          <div key={filter.name}>
            <div className="flex items-center justify-between mb-1">
              <label className="text-sm font-medium text-gray-300">
                {filter.name}
              </label>
              <span className="text-xs text-gray-400">
                {filterValues[filter.name.toLowerCase()]}
              </span>
            </div>
            <input
              type="range"
              min={filter.min}
              max={filter.max}
              value={filterValues[filter.name.toLowerCase()]}
              onChange={(e) => handleFilterChange(filter.name, parseInt(e.target.value))}
              className="w-full"
            />
          </div>
        ))}
      </div>

      {/* Reset Button */}
      <button
        onClick={() => {
          const defaultValues = filters.reduce(
            (acc, filter) => ({ ...acc, [filter.name.toLowerCase()]: filter.default }),
            {}
          );
          setFilterValues(defaultValues);
          applyFilters(defaultValues);
        }}
        className="w-full py-2 bg-gray-700 text-gray-300 rounded hover:bg-gray-600 transition-colors"
      >
        Reset Filters
      </button>
    </div>
  );
}