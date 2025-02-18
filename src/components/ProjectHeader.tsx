import React, { useState } from 'react';
import { useEditorStore } from '../store/editorStore';
import { useTranslation } from 'react-i18next';
import { Save, Share2, Settings, Download } from 'lucide-react';

export default function ProjectHeader() {
  const { t } = useTranslation();
  const { projectName, saveProject, lastSaved } = useEditorStore();
  const [isRenaming, setIsRenaming] = useState(false);
  const [newName, setNewName] = useState(projectName);

  const handleRename = (e: React.FormEvent) => {
    e.preventDefault();
    useEditorStore.getState().setProjectName(newName);
    setIsRenaming(false);
  };

  const handleSave = async () => {
    try {
      await saveProject();
    } catch (error) {
      console.error('Failed to save:', error);
    }
  };

  return (
    <div className="h-16 bg-gray-800 border-b border-gray-700 flex items-center justify-between px-4">
      <div className="flex items-center space-x-4">
        {isRenaming ? (
          <form onSubmit={handleRename} className="flex items-center">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="bg-gray-700 text-white px-2 py-1 rounded"
              autoFocus
            />
            <button
              type="submit"
              className="ml-2 text-sm text-blue-400 hover:text-blue-300"
            >
              {t('save')}
            </button>
          </form>
        ) : (
          <h1
            className="text-lg font-semibold text-white cursor-pointer hover:text-gray-300"
            onClick={() => setIsRenaming(true)}
          >
            {projectName}
          </h1>
        )}
        {lastSaved && (
          <span className="text-sm text-gray-400">
            {t('lastSaved', { time: new Date(lastSaved).toLocaleTimeString() })}
          </span>
        )}
      </div>

      <div className="flex items-center space-x-4">
        <button
          onClick={handleSave}
          className="flex items-center space-x-2 px-3 py-1.5 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          <Save className="w-4 h-4" />
          <span>{t('save')}</span>
        </button>

        <button className="text-gray-300 hover:text-white">
          <Share2 className="w-5 h-5" />
        </button>

        <button className="text-gray-300 hover:text-white">
          <Download className="w-5 h-5" />
        </button>

        <button className="text-gray-300 hover:text-white">
          <Settings className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}