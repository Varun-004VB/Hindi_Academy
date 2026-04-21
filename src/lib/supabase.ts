import { createClient } from '@supabase/supabase-js';

const rawUrl = import.meta.env.VITE_SUPABASE_URL || '';
const rawKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Validate that the URL is actually a real Supabase URL, not a placeholder
const isValidUrl = rawUrl.startsWith('https://') && rawUrl.includes('.supabase.co');
const supabaseUrl = isValidUrl ? rawUrl : 'https://placeholder-url.supabase.co';
const supabaseAnonKey = isValidUrl ? rawKey : 'placeholder-key';

if (!isValidUrl) {
  console.warn('Supabase credentials not configured. Testimonials and auth features will be disabled. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.');
}

// Initialize with safe fallback values
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
export const isSupabaseConfigured = isValidUrl;
