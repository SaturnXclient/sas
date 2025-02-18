import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Create a disabled client with placeholder values if credentials are missing
const createDisabledClient = () => {
  console.warn('Supabase credentials not found. Please connect to Supabase to enable collaboration features.');
  return createClient('https://placeholder.supabase.co', 'placeholder');
};

// Export a single client instance
export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : createDisabledClient();