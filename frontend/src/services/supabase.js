// supabaseClient.js
import { createClient } from '@supabase/supabase-js'

// --- Validate env variables ---
// Utiliser les variables VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY
// Si elles sont manquantes, utiliser les variables SUPABASE_URL et SUPABASE_ANON_KEY (pour la compatibilité avec d'autres conventions)
// Si toutes sont manquantes, utiliser des valeurs par défaut pour éviter un crash fatal immédiat, mais l'application ne fonctionnera pas.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || import.meta.env.SUPABASE_URL || 'https://your-project.supabase.co'
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.SUPABASE_ANON_KEY || 'your-anon-key'

// Vérification de base pour s'assurer que les clés ne sont pas les placeholders
if (supabaseUrl.includes('your-project.supabase.co') || supabaseKey.includes('your-anon-key')) {
  console.error(
    "[Supabase] ATTENTION: Les variables d'environnement VITE_SUPABASE_URL et/ou VITE_SUPABASE_ANON_KEY ne sont pas définies. L'application utilisera des valeurs par défaut et ne fonctionnera pas correctement."
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
