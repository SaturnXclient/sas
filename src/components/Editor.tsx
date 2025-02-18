import React, { useEffect, useRef, useState, useCallback } from 'react';
import { fabric } from 'fabric';
import { useEditorStore } from '../store/editorStore';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { X, ZoomIn, ZoomOut, RotateCcw, Maximize, Minimize } from 'lucide-react';
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [panPosition, setPanPosition] = useState({ x: 0, y: 0 });
  const [activePanel, setActivePanel] = useState<'layers' | 'properties' | 'filters' | 'history' | 'ai'>('layers');
  const [isDragging, setIsDragging] = useState(false);
  const [lastTouch, setLastTouch] = useState({ x: 0, y: 0 });

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
    // Implement bounds checking
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

  // Initialize canvas with mobile-friendly settings
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
          backgroundColor: '#2a2a2a',
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
  }, []);

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

  return (
    <>
      <Helmet>
        <title>{`${projectName} - ${t('editor.title')}`}</title>
        <meta name="description" content={t('editor.description')} />
      </Helmet>

      <div className="flex h-screen bg-gray-900 overflow-hidden">
        <div className="flex flex-col flex-1">
          <ProjectHeader />
          <div className="flex flex-1 relative">
            <Toolbar />
            <div
              ref={containerRef}
              className="flex-1 overflow-hidden relative"
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
                <canvas ref={canvasRef} className="max-w-full max-h-full" />
              </div>

              {/* Zoom controls */}
              <div className="absolute bottom-4 right-4 flex space-x-2">
                <button
                  onClick={() => handleZoom(-0.1)}
                  className="p-2 bg-gray-800 rounded-full hover:bg-gray-700"
                >
                  <ZoomOut className="w-5 h-5 text-white" />
                </button>
                <button
                  onClick={() => handleZoom(0.1)}
                  className="p-2 bg-gray-800 rounded-full hover:bg-gray-700"
                >
                  <ZoomIn className="w-5 h-5 text-white" />
                </button>
                <button
                  onClick={() => {
                    setZoom(1);
                    setPanPosition({ x: 0, y: 0 });
                  }}
                  className="p-2 bg-gray-800 rounded-full hover:bg-gray-700"
                >
                  <RotateCcw className="w-5 h-5 text-white" />
                </button>
                <button
                  onClick={toggleFullscreen}
                  className="p-2 bg-gray-800 rounded-full hover:bg-gray-700"
                >
                  {isFullscreen ? (
                    <Minimize className="w-5 h-5 text-white" />
                  ) : (
                    <Maximize className="w-5 h-5 text-white" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile-optimized sidebar */}
        <div
          className={`
            fixed md:relative top-0 right-0 h-full w-full md:w-80
            transform transition-transform duration-300 ease-in-out
            ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}
            border-l border-gray-700 bg-gray-800/95 backdrop-blur-md overflow-y-auto z-30
            md:bg-gray-800 md:backdrop-blur-none
          `}
        >
          <div className="sticky top-0 z-50 bg-gray-800 border-b border-gray-700 p-4 flex items-center justify-between">
            <div className="flex space-x-4">
              <button
                onClick={() => setActivePanel('layers')}
                className={`px-3 py-1 rounded ${
                  activePanel === 'layers' ? 'bg-blue-500 text-white' : 'text-gray-400'
                }`}
              >
                Layers
              </button>
              <button
                onClick={() => setActivePanel('properties')}
                className={`px-3 py-1 rounded ${
                  activePanel === 'properties' ? 'bg-blue-500 text-white' : 'text-gray-400'
                }`}
              >
                Properties
              </button>
              <button
                onClick={() => setActivePanel('filters')}
                className={`px-3 py-1 rounded ${
                  activePanel === 'filters' ? 'bg-blue-500 text-white' : 'text-gray-400'
                }`}
              >
                Filters
              </button>
            </div>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="md:hidden text-gray-400 hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="p-4">
            {activePanel === 'layers' && <LayersPanel />}
            {activePanel === 'properties' && <PropertiesPanel />}
            {activePanel === 'filters' && <FilterPanel />}
            {activePanel === 'history' && <HistoryPanel />}
            {activePanel === 'ai' && <AIPanel />}
          </div>
        </div>

        {/* Mobile toolbar */}
        <MobileToolbar
          onOpenSidebar={() => setIsSidebarOpen(true)}
          className="md:hidden"
        />
      </div>
    </>
  );
}