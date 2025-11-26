import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co'
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key'

export const supabase = createClient(supabaseUrl, supabaseKey)

// Auth convenience methods
export const auth = {
  get user() {
    return supabase.auth.getUser()
  },
  
  get session() {
    return supabase.auth.getSession()
  },
  
  signIn: (email, password) => 
    supabase.auth.signInWithPassword({ email, password }),
  
  signUp: (email, password) => 
    supabase.auth.signUp({ email, password }),
  
  signOut: () => supabase.auth.signOut(),
  
  onAuthStateChange: (callback) => 
    supabase.auth.onAuthStateChange(callback)
}

// Storage convenience methods
export const storage = {
  upload: (path, file) => 
    supabase.storage.from('simulations').upload(path, file),
  
  download: (path) => 
    supabase.storage.from('simulations').download(path),
  
  getPublicUrl: (path) => 
    supabase.storage.from('simulations').getPublicUrl(path),
  
  list: (path) => 
    supabase.storage.from('simulations').list(path)
}
