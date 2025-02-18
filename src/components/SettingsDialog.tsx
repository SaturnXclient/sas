import React from 'react';
import { useTranslation } from 'react-i18next';
import { Settings, Moon, Sun, Globe, Bell, Lock } from 'lucide-react';
import { useEditorStore } from '../store/editorStore';
import { useAuthStore } from '../store/authStore';

export default function SettingsDialog({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { t } = useTranslation();
  const { isAutosaveEnabled, toggleAutosave } = useEditorStore();
  const { user, signOut } = useAuthStore();
  const [theme, setTheme] = React.useState('system');
  const [language, setLanguage] = React.useState('en');
  const [notifications, setNotifications] = React.useState(true);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-gray-800 rounded-lg w-full max-w-md p-6 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white flex items-center">
            <Settings className="w-5 h-5 mr-2" />
            Settings
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            ×
          </button>
        </div>

        <div className="space-y-6">
          {/* Account Section */}
          <div className="border-b border-gray-700 pb-4">
            <h3 className="text-sm font-medium text-gray-400 mb-3">Account</h3>
            {user ? (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white">{user.email}</p>
                  <p className="text-sm text-gray-400">Google Account</p>
                </div>
                <button
                  onClick={() => signOut()}
                  className="text-red-400 hover:text-red-300 text-sm"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <p className="text-gray-400">Not signed in</p>
            )}
          </div>

          {/* Appearance */}
          <div>
            <h3 className="text-sm font-medium text-gray-400 mb-3">Appearance</h3>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                {theme === 'dark' ? (
                  <Moon className="w-4 h-4 mr-2 text-gray-400" />
                ) : (
                  <Sun className="w-4 h-4 mr-2 text-gray-400" />
                )}
                <span className="text-white">Theme</span>
              </div>
              <select
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                className="bg-gray-700 text-white rounded px-2 py-1"
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="system">System</option>
              </select>
            </div>
          </div>

          {/* Language */}
          <div>
            <h3 className="text-sm font-medium text-gray-400 mb-3">Language</h3>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Globe className="w-4 h-4 mr-2 text-gray-400" />
                <span className="text-white">Language</span>
              </div>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="bg-gray-700 text-white rounded px-2 py-1"
              >
                <option value="en">English</option>
                <option value="es">Español</option>
                <option value="fr">Français</option>
              </select>
            </div>
          </div>

          {/* Notifications */}
          <div>
            <h3 className="text-sm font-medium text-gray-400 mb-3">Notifications</h3>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Bell className="w-4 h-4 mr-2 text-gray-400" />
                <span className="text-white">Email Notifications</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifications}
                  onChange={(e) => setNotifications(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
              </label>
            </div>
          </div>

          {/* Autosave */}
          <div>
            <h3 className="text-sm font-medium text-gray-400 mb-3">Project Settings</h3>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Lock className="w-4 h-4 mr-2 text-gray-400" />
                <span className="text-white">Autosave</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={isAutosaveEnabled}
                  onChange={toggleAutosave}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}