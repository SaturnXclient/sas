import React, { useState, useCallback } from 'react';
import { MousePointer2, Move, Square, Circle, Wand2, Paintbrush, Type, Eraser, Stamp, Undo, Redo, Download, Scissors, Lasso, HandMetal, Pipette, PenTool, Brush, Spline, Pencil, PaintBucket as Bucket, Highlighter, Blend, Crop, ImagePlus, Shapes, Ruler, Frame, Gauge, SlidersHorizontal, Settings2, Palette, Filter, Layers, Sparkles, Maximize2, Minimize2, Menu, X } from 'lucide-react';
import { useEditorStore } from '../store/editorStore';
import { fabric } from 'fabric';

const toolGroups = [
  {
    name: 'Selection',
    tools: [
      { icon: MousePointer2, name: 'Select', action: 'select', shortcut: 'V' },
      { icon: Move, name: 'Move', action: 'move', shortcut: 'M' },
      { icon: Lasso, name: 'Lasso', action: 'lasso', shortcut: 'L' },
      { icon: Square, name: 'Rectangular Marquee', action: 'rectangle', shortcut: 'M' },
      { icon: Circle, name: 'Elliptical Marquee', action: 'ellipse', shortcut: 'M' },
      { icon: Wand2, name: 'Magic Wand', action: 'wand', shortcut: 'W' },
    ]
  },
  {
    name: 'Drawing',
    tools: [
      { icon: Brush, name: 'Brush', action: 'brush', shortcut: 'B' },
      { icon: Pencil, name: 'Pencil', action: 'pencil', shortcut: 'N' },
      { icon: PenTool, name: 'Pen', action: 'pen', shortcut: 'P' },
      { icon: Spline, name: 'Curve', action: 'curve', shortcut: 'C' },
      { icon: Bucket, name: 'Fill', action: 'fill', shortcut: 'G' },
      { icon: Gradient, name: 'Gradient', action: 'gradient', shortcut: 'G' },
    ]
  },
  {
    name: 'Editing',
    tools: [
      { icon: Eraser, name: 'Eraser', action: 'eraser', shortcut: 'E' },
      { icon: Stamp, name: 'Clone Stamp', action: 'stamp', shortcut: 'S' },
      { icon: Highlighter, name: 'Healing Brush', action: 'healing', shortcut: 'J' },
      { icon: Blend, name: 'Blur/Sharpen', action: 'blur', shortcut: 'R' },
      { icon: HandMetal, name: 'Smudge', action: 'smudge', shortcut: 'R' },
      { icon: Pipette, name: 'Eyedropper', action: 'eyedropper', shortcut: 'I' },
    ]
  },
  {
    name: 'Objects',
    tools: [
      { icon: Type, name: 'Text', action: 'text', shortcut: 'T' },
      { icon: Shapes, name: 'Shape', action: 'shape', shortcut: 'U' },
      { icon: Frame, name: 'Frame', action: 'frame', shortcut: 'K' },
      { icon: ImagePlus, name: 'Place Image', action: 'place', shortcut: 'P' },
      { icon: Ruler, name: 'Ruler', action: 'ruler', shortcut: 'I' },
      { icon: Crop, name: 'Crop', action: 'crop', shortcut: 'C' },
    ]
  }
];

const adjustmentTools = [
  { icon: Gauge, name: 'Levels', action: 'levels' },
  { icon: SlidersHorizontal, name: 'Curves', action: 'curves' },
  { icon: Settings2, name: 'Brightness/Contrast', action: 'brightness' },
  { icon: Palette, name: 'Hue/Saturation', action: 'hue' },
  { icon: Filter, name: 'Photo Filter', action: 'photofilter' },
  { icon: Sparkles, name: 'Effects', action: 'effects' },
];

function ToolButton({ 
  icon: Icon, 
  name, 
  action, 
  shortcut, 
  isActive, 
  onClick 
}: { 
  icon: any; 
  name: string; 
  action: string; 
  shortcut?: string; 
  isActive: boolean; 
  onClick: () => void; 
}) {
  return (
    <button
      onClick={onClick}
      className={`p-2 rounded-lg hover:bg-gray-700 transition-colors group relative ${
        isActive ? 'bg-gray-700' : ''
      }`}
      title={`${name}${shortcut ? ` (${shortcut})` : ''}`}
    >
      <Icon className="w-5 h-5 text-gray-300" />
      <span className="sr-only">{name}</span>
      
      {/* Tooltip */}
      <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2 py-1 bg-gray-800 text-sm text-gray-300 rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50 hidden md:block">
        {name}
        {shortcut && <span className="ml-2 text-gray-500">{shortcut}</span>}
      </div>
    </button>
  );
}

function ToolGroup({ name, tools, activeTool, onToolSelect }: any) {
  return (
    <div className="mb-4">
      <h3 className="text-xs font-medium text-gray-500 uppercase mb-2 px-2">{name}</h3>
      <div className="grid grid-cols-2 gap-1 p-1">
        {tools.map((tool: any) => (
          <ToolButton
            key={tool.action}
            {...tool}
            isActive={activeTool === tool.action}
            onClick={() => onToolSelect(tool.action)}
          />
        ))}
      </div>
    </div>
  );
}

export default function Toolbar() {
  const { canvas, undo, redo } = useEditorStore();
  const [activeTool, setActiveTool] = useState('select');
  const [isExpanded, setIsExpanded] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [brushSize, setBrushSize] = useState(5);
  const [brushColor, setBrushColor] = useState('#ffffff');
  const [isDrawingMode, setIsDrawingMode] = useState(false);

  const handleToolClick = useCallback((action: string) => {
    setActiveTool(action);
    if (!canvas) return;

    // Reset canvas mode
    canvas.isDrawingMode = false;
    canvas.selection = true;

    switch (action) {
      case 'text':
        const text = new fabric.IText('Double click to edit', {
          left: 100,
          top: 100,
          fontSize: 20,
          fill: brushColor,
        });
        canvas.add(text);
        canvas.setActiveObject(text);
        break;

      case 'brush':
      case 'pencil':
        canvas.isDrawingMode = true;
        canvas.freeDrawingBrush.width = brushSize;
        canvas.freeDrawingBrush.color = brushColor;
        setIsDrawingMode(true);
        break;

      case 'shape':
        const rect = new fabric.Rect({
          left: 100,
          top: 100,
          width: 100,
          height: 100,
          fill: brushColor,
        });
        canvas.add(rect);
        canvas.setActiveObject(rect);
        break;

      case 'ellipse':
        const circle = new fabric.Circle({
          left: 100,
          top: 100,
          radius: 50,
          fill: brushColor,
        });
        canvas.add(circle);
        canvas.setActiveObject(circle);
        break;

      case 'select':
        canvas.selection = true;
        break;

      case 'move':
        canvas.selection = false;
        break;

      case 'eraser':
        canvas.isDrawingMode = true;
        canvas.freeDrawingBrush.width = brushSize * 2;
        canvas.freeDrawingBrush.color = '#000000';
        setIsDrawingMode(true);
        break;

      case 'crop':
        // Implement crop functionality
        const cropRect = new fabric.Rect({
          left: 50,
          top: 50,
          width: canvas.width! - 100,
          height: canvas.height! - 100,
          fill: 'rgba(0,0,0,0.3)',
          stroke: '#fff',
          strokeWidth: 2,
          strokeDashArray: [5, 5],
        });
        canvas.add(cropRect);
        canvas.setActiveObject(cropRect);
        break;
    }

    canvas.renderAll();
  }, [canvas, brushSize, brushColor]);

  const handleExport = useCallback(() => {
    if (!canvas) return;
    const dataUrl = canvas.toDataURL({
      format: 'png',
      quality: 1,
    });
    const link = document.createElement('a');
    link.download = 'sarux-export.png';
    link.href = dataUrl;
    link.click();
  }, [canvas]);

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="md:hidden fixed top-4 left-4 z-50 bg-gray-800 p-2 rounded-lg"
      >
        {isMobileMenuOpen ? (
          <X className="w-6 h-6 text-gray-300" />
        ) : (
          <Menu className="w-6 h-6 text-gray-300" />
        )}
      </button>

      {/* Toolbar */}
      <div className={`
        fixed md:relative
        ${isMobileMenuOpen ? 'left-0' : '-left-full md:left-0'}
        top-0 h-full bg-gray-800 border-r border-gray-700 transition-all z-40
        ${isExpanded ? 'w-[140px]' : 'w-[52px]'}
      `}>
        <div className="h-16 border-b border-gray-700 flex items-center justify-between px-2">
          <div className="flex space-x-1">
            <button
              onClick={undo}
              className="p-2 rounded hover:bg-gray-700 transition-colors"
              title="Undo (Ctrl+Z)"
            >
              <Undo className="w-5 h-5 text-gray-300" />
            </button>
            <button
              onClick={redo}
              className="p-2 rounded hover:bg-gray-700 transition-colors"
              title="Redo (Ctrl+Y)"
            >
              <Redo className="w-5 h-5 text-gray-300" />
            </button>
          </div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 rounded hover:bg-gray-700 transition-colors hidden md:block"
            title={isExpanded ? 'Collapse' : 'Expand'}
          >
            {isExpanded ? (
              <Minimize2 className="w-5 h-5 text-gray-300" />
            ) : (
              <Maximize2 className="w-5 h-5 text-gray-300" />
            )}
          </button>
        </div>

        <div className="p-2 overflow-y-auto" style={{ height: 'calc(100vh - 64px)' }}>
          {toolGroups.map((group) => (
            <ToolGroup
              key={group.name}
              name={group.name}
              tools={group.tools}
              activeTool={activeTool}
              onToolSelect={handleToolClick}
            />
          ))}

          {/* Brush Settings */}
          {isDrawingMode && (
            <div className="mb-4 p-2 bg-gray-700/50 rounded">
              <h3 className="text-xs font-medium text-gray-400 mb-2">Brush Settings</h3>
              <div className="space-y-2">
                <div>
                  <label className="text-xs text-gray-400 block mb-1">Size</label>
                  <input
                    type="range"
                    min="1"
                    max="50"
                    value={brushSize}
                    onChange={(e) => {
                      const size = parseInt(e.target.value);
                      setBrushSize(size);
                      if (canvas) {
                        canvas.freeDrawingBrush.width = size;
                      }
                    }}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400 block mb-1">Color</label>
                  <input
                    type="color"
                    value={brushColor}
                    onChange={(e) => {
                      setBrushColor(e.target.value);
                      if (canvas) {
                        canvas.freeDrawingBrush.color = e.target.value;
                      }
                    }}
                    className="w-full h-8 bg-transparent rounded cursor-pointer"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="h-px bg-gray-700 my-4" />

          <h3 className="text-xs font-medium text-gray-500 uppercase mb-2 px-2">Adjustments</h3>
          <div className="grid grid-cols-2 gap-1 p-1">
            {adjustmentTools.map((tool) => (
              <ToolButton
                key={tool.action}
                {...tool}
                isActive={activeTool === tool.action}
                onClick={() => handleToolClick(tool.action)}
              />
            ))}
          </div>

          <div className="h-px bg-gray-700 my-4" />

          <div className="px-2">
            <button
              onClick={handleExport}
              className="w-full px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors flex items-center justify-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span className={isExpanded ? '' : 'hidden'}>Export</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

function Gradient({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M3 3h18v18H3z" />
      <path d="M3 3L21 21" />
    </svg>
  );
}