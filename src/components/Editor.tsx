import React, { useEffect, useRef, useState, useCallback } from 'react';
import { fabric } from 'fabric';
import { useEditorStore } from '../store/editorStore';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { X, ZoomIn, ZoomOut, RotateCcw, Maximize, Minimize, Menu, ChevronLeft, Save, Share2, Download, Settings, Eye, EyeOff } from 'lucide-react';
import Toolbar from './Toolbar';
import LayersPanel from './LayersPanel';
import PropertiesPanel from './PropertiesPanel';
import ProjectHeader from './ProjectHeader';
import CollaborationPanel from './CollaborationPanel';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';
import MobileToolbar from './MobileToolbar';
import FilterPanel from './FilterPanel';
import HistoryPanel from './HistoryPanel';
import AIPanel from './AIPanel';

export default function Editor({ imageUrl }: { imageUrl: string }) {
  const { t } = useTranslation();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { setCanvas, canvas, addToHistory, projectName } = useEditorStore();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [zoom, setZoom] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [panPosition, setPanPosition] = useState({ x: 0, y: 0 });
  const [activePanel, setActivePanel] = useState<'layers' | 'properties' | 'filters' | 'history' | 'ai'>('layers');
  const [isDragging, setIsDragging] = useState(false);
  const [lastTouch, setLastTouch] = useState({ x: 0, y: 0 });
  const [showGrid, setShowGrid] = useState(true);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  // Handle touch events for pan
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      setLastTouch({ x: touch.clientX, y: touch.clientY });
      setIsDragging(true);
    }
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (isDragging && e.touches.length === 1) {
      const touch = e.touches[0];
      const deltaX = touch.clientX - lastTouch.x;
      const deltaY = touch.clientY - lastTouch.y;

      setPanPosition(prev => ({
        x: prev.x + deltaX,
        y: prev.y + deltaY
      }));

      setLastTouch({ x: touch.clientX, y: touch.clientY });
    }
  }, [isDragging, lastTouch]);

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
    const bounds = containerRef.current?.getBoundingClientRect();
    if (bounds) {
      setPanPosition(prev => ({
        x: Math.max(Math.min(prev.x, bounds.width / 2), -bounds.width / 2),
        y: Math.max(Math.min(prev.y, bounds.height / 2), -bounds.height / 2)
      }));
    }
  }, []);

  // Handle zoom controls
  const handleZoom = useCallback((delta: number) => {
    setZoom(prev => {
      const newZoom = Math.max(0.1, Math.min(5, prev + delta));
      if (canvas) {
        canvas.setZoom(newZoom);
        canvas.renderAll();
      }
      return newZoom;
    });
  }, [canvas]);

  // Handle fullscreen
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  // Initialize canvas
  useEffect(() => {
    let fabricCanvas: fabric.Canvas | null = null;

    const initializeCanvas = () => {
      if (!canvasRef.current || !containerRef.current) return;

      try {
        const container = containerRef.current;
        const width = container.clientWidth;
        const height = container.clientHeight;

        fabricCanvas = new fabric.Canvas(canvasRef.current, {
          width,
          height,
          backgroundColor: theme === 'dark' ? '#1a1a1a' : '#f0f0f0',
          preserveObjectStacking: true,
          enableRetinaScaling: true,
          selection: true,
          defaultCursor: 'default',
          hoverCursor: 'pointer',
          touchSupport: true
        });

        // Enable touch events
        fabricCanvas.set('allowTouchScrolling', true);

        // Handle selection events
        fabricCanvas.on('selection:created', (e) => {
          useEditorStore.getState().setActiveObject(e.target);
          if (window.innerWidth < 768) {
            setIsSidebarOpen(true);
            setActivePanel('properties');
          }
        });

        fabricCanvas.on('selection:cleared', () => {
          useEditorStore.getState().setActiveObject(null);
        });

        // Track modifications
        fabricCanvas.on('object:modified', () => {
          addToHistory();
        });

        setCanvas(fabricCanvas);
        setIsLoading(false);
      } catch (err) {
        setError('Failed to initialize canvas');
        console.error('Canvas initialization error:', err);
      }
    };

    initializeCanvas();

    // Cleanup
    return () => {
      if (fabricCanvas) {
        fabricCanvas.dispose();
      }
    };
  }, [theme]);

  // Load image
  useEffect(() => {
    if (!canvas || !imageUrl) return;

    setIsLoading(true);
    fabric.Image.fromURL(
      imageUrl,
      (img) => {
        try {
          const scale = Math.min(
            (canvas.width! - 100) / img.width!,
            (canvas.height! - 100) / img.height!
          );

          img.scale(scale);
          img.center();
          canvas.add(img);
          canvas.renderAll();
          addToHistory();
          setIsLoading(false);
        } catch (err) {
          setError('Failed to load image');
          console.error('Image loading error:', err);
        }
      },
      { crossOrigin: 'anonymous' }
    );
  }, [canvas, imageUrl]);

  if (error) {
    return <ErrorMessage message={error} />;
  }

  const themeClasses = theme === 'dark' 
    ? 'bg-gray-900 text-white' 
    : 'bg-gray-100 text-gray-900';

  return (
    <>
      <Helmet>
        <title>{`${projectName} - ${t('editor.title')}`}</title>
        <meta name="description" content={t('editor.description')} />
      </Helmet>

      <div className={`flex h-screen overflow-hidden ${themeClasses}`}>
        {/* Left Sidebar - Tools */}
        <div className={`
          fixed md:relative left-0 h-full transition-all z-40
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}
          border-r
        `}>
          <Toolbar theme={theme} />
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className={`h-16 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} flex items-center justify-between px-4`}>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className={`p-2 rounded-lg transition-colors ${
                  theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-200'
                }`}
              >
                <Menu className="w-6 h-6" />
              </button>
              <h1 className="text-lg font-semibold">{projectName}</h1>
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className={`p-2 rounded-lg transition-colors ${
                  theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-200'
                }`}
              >
                {theme === 'dark' ? '🌞' : '🌙'}
              </button>
              <button
                onClick={() => setShowGrid(!showGrid)}
                className={`p-2 rounded-lg transition-colors ${
                  theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-200'
                }`}
              >
                {showGrid ? <EyeOff className="w-6 h-6" /> : <Eye className="w-6 h-6" />}
              </button>
              <button className="p-2">
                <Save className="w-6 h-6" />
              </button>
              <button className="p-2">
                <Share2 className="w-6 h-6" />
              </button>
              <button className="p-2">
                <Download className="w-6 h-6" />
              </button>
              <button className="p-2">
                <Settings className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Canvas Area */}
          <div className="flex-1 relative">
            <div
              ref={containerRef}
              className={`absolute inset-0 ${showGrid ? 'bg-grid' : ''}`}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              {isLoading && <LoadingSpinner />}
              <div
                className="absolute inset-0 flex items-center justify-center"
                style={{
                  transform: `translate(${panPosition.x}px, ${panPosition.y}px) scale(${zoom})`
                }}
              >
                <canvas ref={canvasRef} className="max-w-full max-h-full shadow-lg" />
              </div>

              {/* Zoom Controls */}
              <div className={`
                absolute bottom-4 right-4 flex space-x-2 p-2 rounded-lg
                ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}
                shadow-lg
              `}>
                <button
                  onClick={() => handleZoom(-0.1)}
                  className={`p-2 rounded-full ${
                    theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-200'
                  }`}
                >
                  <ZoomOut className="w-5 h-5" />
                </button>
                <div className="px-2 flex items-center min-w-[3rem] justify-center">
                  {Math.round(zoom * 100)}%
                </div>
                <button
                  onClick={() => handleZoom(0.1)}
                  className={`p-2 rounded-full ${
                    theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-200'
                  }`}
                >
                  <ZoomIn className="w-5 h-5" />
                </button>
                <button
                  onClick={() => {
                    setZoom(1);
                    setPanPosition({ x: 0, y: 0 });
                  }}
                  className={`p-2 rounded-full ${
                    theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-200'
                  }`}
                >
                  <RotateCcw className="w-5 h-5" />
                </button>
                <button
                  onClick={toggleFullscreen}
                  className={`p-2 rounded-full ${
                    theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-200'
                  }`}
                >
                  {isFullscreen ? (
                    <Minimize className="w-5 h-5" />
                  ) : (
                    <Maximize className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar - Panels */}
        <div className={`
          fixed md:relative right-0 h-full w-80
          transform transition-transform duration-300 ease-in-out
          ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}
          ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}
          border-l backdrop-blur-md z-30
        `}>
          <div className={`sticky top-0 z-50 p-4 flex items-center justify-between ${
            theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          } border-b`}>
            <div className="flex space-x-4">
              {['layers', 'properties', 'filters', 'history', 'ai'].map((panel) => (
                <button
                  key={panel}
                  onClick={() => setActivePanel(panel as any)}
                  className={`px-3 py-1 rounded text-sm ${
                    activePanel === panel
                      ? theme === 'dark' 
                        ? 'bg-blue-500 text-white'
                        : 'bg-blue-100 text-blue-800'
                      : theme === 'dark'
                        ? 'text-gray-400 hover:text-gray-300'
                        : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  {panel.charAt(0).toUpperCase() + panel.slice(1)}
                </button>
              ))}
            </div>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="md:hidden"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="p-4 overflow-y-auto" style={{ height: 'calc(100vh - 4rem)' }}>
            {activePanel === 'layers' && <LayersPanel theme={theme} />}
            {activePanel === 'properties' && <PropertiesPanel theme={theme} />}
            {activePanel === 'filters' && <FilterPanel theme={theme} />}
            {activePanel === 'history' && <HistoryPanel theme={theme} />}
            {activePanel === 'ai' && <AIPanel theme={theme} />}
          </div>
        </div>
      </div>
    </>
  );
}

export default Editor;