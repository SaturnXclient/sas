import React, { useState } from 'react';
import { useEditorStore } from '../store/editorStore';
import { useAuthStore } from '../store/authStore';
import { useTranslation } from 'react-i18next';
import { UserPlus, Users, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

export default function CollaborationPanel() {
  const { t } = useTranslation();
  const { collaborators, addCollaborator, removeCollaborator } = useEditorStore();
  const { user } = useAuthStore();
  const [isInviting, setIsInviting] = useState(false);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  // Check if Supabase is properly configured
  const isSupabaseConfigured = Boolean(
    import.meta.env.VITE_SUPABASE_URL && 
    import.meta.env.VITE_SUPABASE_ANON_KEY
  );

  if (!isSupabaseConfigured) {
    return (
      <div className="border-t border-gray-700 p-4">
        <div className="flex items-center space-x-2 text-yellow-400 mb-2">
          <AlertCircle className="w-5 h-5" />
          <h2 className="text-lg font-semibold">Collaboration Unavailable</h2>
        </div>
        <p className="text-gray-400 text-sm">
          Please connect to Supabase to enable collaboration features.
          Click the "Connect to Supabase" button in the top right corner.
        </p>
      </div>
    );
  }

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !user) return;

    setLoading(true);
    try {
      // Insert invitation into Supabase
      const { error } = await supabase
        .from('project_invitations')
        .insert([
          {
            project_id: useEditorStore.getState().projectName,
            inviter_email: user.email,
            invitee_email: email,
            status: 'pending'
          }
        ]);

      if (error) throw error;

      addCollaborator(email);
      setEmail('');
      setIsInviting(false);
      toast.success('Invitation sent successfully!');
    } catch (error) {
      console.error('Error sending invitation:', error);
      toast.error('Failed to send invitation. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="border-t border-gray-700 p-4">
        <p className="text-gray-400 text-sm">
          Please sign in to collaborate with others.
        </p>
      </div>
    );
  }

  return (
    <div className="border-t border-gray-700 p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-white flex items-center">
          <Users className="w-5 h-5 mr-2" />
          {t('collaboration.title')}
        </h2>
        <button
          onClick={() => setIsInviting(true)}
          className="text-blue-400 hover:text-blue-300"
        >
          <UserPlus className="w-5 h-5" />
        </button>
      </div>

      {isInviting && (
        <form onSubmit={handleInvite} className="mb-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t('collaboration.enterEmail')}
            className="w-full bg-gray-700 text-white px-3 py-2 rounded mb-2"
            disabled={loading}
          />
          <button
            type="submit"
            className={`w-full bg-blue-500 text-white px-3 py-2 rounded hover:bg-blue-600 transition-colors ${
              loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            disabled={loading}
          >
            {loading ? 'Sending...' : t('collaboration.invite')}
          </button>
        </form>
      )}

      <div className="space-y-2">
        {collaborators.map((collaborator) => (
          <div
            key={collaborator}
            className="flex items-center justify-between p-2 bg-gray-700/50 rounded"
          >
            <span className="text-gray-300">{collaborator}</span>
            <button
              onClick={() => removeCollaborator(collaborator)}
              className="text-red-400 hover:text-red-300 text-sm"
            >
              {t('remove')}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}