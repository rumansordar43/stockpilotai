
import { createClient } from '@supabase/supabase-js';

// Helper to safely access env vars
const getEnv = (key: string) => {
  try {
    if (typeof process !== 'undefined' && process.env && process.env[key]) {
      return process.env[key];
    }
    // @ts-ignore
    if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[key]) {
      // @ts-ignore
      return import.meta.env[key];
    }
  } catch (e) {}
  return '';
};

// Credentials provided in the project
const HARDCODED_URL = 'https://xfbynitzgmuydehyrcxn.supabase.co';
const HARDCODED_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhmYnluaXR6Z211eWRlaHlyY3huIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU0MzQ3NjgsImV4cCI6MjA4MTAxMDc2OH0.Z5TpnIGon7glcKy8XtcIlwwGnk-_EJdFzKeg49A-DLY';

const supabaseUrl = getEnv('VITE_SUPABASE_URL') || HARDCODED_URL;
const supabaseAnonKey = getEnv('VITE_SUPABASE_ANON_KEY') || HARDCODED_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);
