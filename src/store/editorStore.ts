import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { fabric } from 'fabric';
import { nanoid } from 'nanoid';

interface EditorState {
  canvas: fabric.Canvas | null;
  activeObject: fabric.Object | null;
  history: string[];
  historyIndex: number;
  projectName: string;
  lastSaved: Date | null;
  isAutosaveEnabled: boolean;
  collaborators: string[];
  setCanvas: (canvas: fabric.Canvas) => void;
  setActiveObject: (object: fabric.Object | null) => void;
  addToHistory: () => void;
  undo: () => void;
  redo: () => void;
  saveProject: () => Promise<void>;
  setProjectName: (name: string) => void;
  toggleAutosave: () => void;
  addCollaborator: (userId: string) => void;
  removeCollaborator: (userId: string) => void;
}

// Maximum number of projects to keep in storage
const MAX_STORED_PROJECTS = 5;

const cleanupOldProjects = () => {
  try {
    const projects = [];
    let i = 0;
    
    // Safely iterate through localStorage
    while (i < localStorage.length) {
      try {
        const key = localStorage.key(i);
        if (key?.startsWith('project_')) {
          try {
            const item = localStorage.getItem(key);
            if (item) {
              const parsed = JSON.parse(item);
              if (parsed && parsed.timestamp) {
                projects.push({
                  key,
                  timestamp: parsed.timestamp,
                });
              }
            }
          } catch (parseError) {
            console.warn(`Failed to parse project ${key}:`, parseError);
            // Remove corrupted project data
            localStorage.removeItem(key);
          }
        }
      } catch (error) {
        console.warn(`Error accessing localStorage at index ${i}:`, error);
      }
      i++;
    }

    // Sort projects by timestamp and remove oldest if we exceed the limit
    if (projects.length >= MAX_STORED_PROJECTS) {
      projects
        .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
        .slice(0, projects.length - MAX_STORED_PROJECTS + 1)
        .forEach(project => {
          try {
            localStorage.removeItem(project.key);
          } catch (error) {
            console.warn(`Failed to remove project ${project.key}:`, error);
          }
        });
    }
  } catch (error) {
    // Log error but don't throw to prevent blocking save operation
    console.warn('Project cleanup warning:', error);
  }
};

// Simple compression using base64
const compress = (str: string): string => {
  try {
    return btoa(encodeURIComponent(str));
  } catch (error) {
    console.warn('Compression failed, using original data:', error);
    return str;
  }
};

// Simple decompression from base64
const decompress = (str: string): string => {
  try {
    return decodeURIComponent(atob(str));
  } catch (error) {
    console.warn('Decompression failed, using original data:', error);
    return str;
  }
};

export const useEditorStore = create<EditorState>()(
  persist(
    (set, get) => ({
      canvas: null,
      activeObject: null,
      history: [],
      historyIndex: -1,
      projectName: 'Untitled Project',
      lastSaved: null,
      isAutosaveEnabled: true,
      collaborators: [],

      setCanvas: (canvas) => set({ canvas }),
      
      setActiveObject: (object) => set({ activeObject: object }),
      
      addToHistory: () => {
        const { canvas, history, historyIndex, isAutosaveEnabled } = get();
        if (!canvas) return;

        try {
          const json = JSON.stringify(canvas.toJSON(['id', 'selectable']));
          const newHistory = history.slice(0, historyIndex + 1);
          
          // Limit history size to prevent memory issues
          if (newHistory.length > 50) {
            newHistory.shift();
          }
          
          newHistory.push(json);

          set({
            history: newHistory,
            historyIndex: newHistory.length - 1,
            lastSaved: null,
          });

          // Trigger autosave if enabled
          if (isAutosaveEnabled) {
            get().saveProject().catch(error => {
              console.warn('Autosave failed:', error);
              // Disable autosave if we hit quota issues
              if (error.name === 'QuotaExceededError') {
                set({ isAutosaveEnabled: false });
              }
            });
          }
        } catch (error) {
          console.warn('Error adding to history:', error);
        }
      },

      undo: () => {
        const { canvas, history, historyIndex } = get();
        if (!canvas || historyIndex <= 0) return;

        try {
          const newIndex = historyIndex - 1;
          const json = JSON.parse(history[newIndex]);
          canvas.loadFromJSON(json, () => {
            canvas.renderAll();
            set({ historyIndex: newIndex });
          });
        } catch (error) {
          console.warn('Error during undo:', error);
        }
      },

      redo: () => {
        const { canvas, history, historyIndex } = get();
        if (!canvas || historyIndex >= history.length - 1) return;

        try {
          const newIndex = historyIndex + 1;
          const json = JSON.parse(history[newIndex]);
          canvas.loadFromJSON(json, () => {
            canvas.renderAll();
            set({ historyIndex: newIndex });
          });
        } catch (error) {
          console.warn('Error during redo:', error);
        }
      },

      saveProject: async () => {
        const { canvas } = get();
        if (!canvas) return;

        try {
          // Clean up old projects before saving
          cleanupOldProjects();

          const projectData = {
            id: nanoid(),
            name: get().projectName,
            canvas: canvas.toJSON(['id', 'selectable']),
            timestamp: new Date().toISOString(),
          };

          // Compress the project data
          const compressedData = compress(JSON.stringify(projectData));
          
          // Store the compressed data
          localStorage.setItem(`project_${projectData.id}`, compressedData);
          
          set({ lastSaved: new Date() });
        } catch (error) {
          console.error('Failed to save project:', error);
          // Only throw if it's a critical error
          if (error instanceof Error && error.name === 'QuotaExceededError') {
            throw error;
          }
        }
      },

      setProjectName: (name) => set({ projectName: name }),
      
      toggleAutosave: () => set((state) => ({ isAutosaveEnabled: !state.isAutosaveEnabled })),
      
      addCollaborator: (userId) => 
        set((state) => ({ collaborators: [...state.collaborators, userId] })),
      
      removeCollaborator: (userId) => 
        set((state) => ({ collaborators: state.collaborators.filter(id => id !== userId) })),
    }),
    {
      name: 'editor-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        projectName: state.projectName,
        isAutosaveEnabled: state.isAutosaveEnabled,
        collaborators: state.collaborators,
      }),
    }
  )
);