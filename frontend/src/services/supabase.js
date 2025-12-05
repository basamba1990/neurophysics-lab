// supabaseClient.js
import { createClient } from '@supabase/supabase-js'

// --- Validate env variables ---
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    "[Supabase] Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env"
  );
}

// --- Create Supabase client ---
export const supabase = createClient(supabaseUrl, supabaseKey);

// -------------------------
// AUTH UTILITIES
// -------------------------
export const auth = {
  /** Get current session */
  getSession: () => supabase.auth.getSession(),

  /** Get current user */
  getUser: () => supabase.auth.getUser(),

  /** Sign in with email + password */
  signIn: (email, password) =>
    supabase.auth.signInWithPassword({ email, password }),

  /** Sign up with email + password */
  signUp: (email, password) =>
    supabase.auth.signUp({ email, password }),

  /** Sign out */
  signOut: () => supabase.auth.signOut(),

  /** Listen to auth state changes */
  onAuthStateChange: (callback) =>
    supabase.auth.onAuthStateChange(callback),
};

// -------------------------
// STORAGE UTILITIES
// -------------------------
const bucket = "simulations"; // Change if needed

export const storage = {
  /** Upload a file */
  upload: (path, file) =>
    supabase.storage.from(bucket).upload(path, file, {
      upsert: true, // optional: overwrite
    }),

  /** Download a file */
  download: (path) =>
    supabase.storage.from(bucket).download(path),

  /** Get public URL */
  getPublicUrl: (path) =>
    supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl,

  /** List folder content */
  list: (path = "") =>
    supabase.storage.from(bucket).list(path),
};
