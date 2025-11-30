import { createClient, SupabaseClient } from '@supabase/supabase-js';

const STORAGE_KEY_URL = 'pvg_sb_url';
const STORAGE_KEY_KEY = 'pvg_sb_key';

export const getSupabaseConfig = () => {
  return {
    url: localStorage.getItem(STORAGE_KEY_URL) || '',
    key: localStorage.getItem(STORAGE_KEY_KEY) || ''
  };
};

export const saveSupabaseConfig = (url: string, key: string) => {
  localStorage.setItem(STORAGE_KEY_URL, url);
  localStorage.setItem(STORAGE_KEY_KEY, key);
};

// We use 'let' so we can re-assign it when configuration changes.
// ESM live bindings will allow other modules to see the update.
const config = getSupabaseConfig();
const safeUrl = config.url && config.url.startsWith('http') ? config.url : 'https://placeholder.supabase.co';
const safeKey = config.key || 'placeholder';

export let supabase: SupabaseClient = createClient(
  safeUrl,
  safeKey,
  {
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
  }
);

export const reinitSupabaseClient = (url: string, key: string) => {
  saveSupabaseConfig(url, key);
  
  // Re-create the client with new credentials
  supabase = createClient(url, key, {
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
  });
  
  return supabase;
};