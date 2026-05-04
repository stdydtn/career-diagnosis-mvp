import { createClient } from "@supabase/supabase-js";

const fromMetaUrl = typeof import.meta.env.VITE_SUPABASE_URL === "string" ? import.meta.env.VITE_SUPABASE_URL.trim() : "";
const fromDefineUrl = typeof __VITE_SUPABASE_URL_FROM_ENV__ === "string" ? __VITE_SUPABASE_URL_FROM_ENV__.trim() : "";
const supabaseUrl = (fromMetaUrl || fromDefineUrl).replace(/\/$/, "");

const fromMetaKey = typeof import.meta.env.VITE_SUPABASE_ANON_KEY === "string" ? import.meta.env.VITE_SUPABASE_ANON_KEY.trim() : "";
const fromDefineKey = typeof __VITE_SUPABASE_ANON_KEY_FROM_ENV__ === "string" ? __VITE_SUPABASE_ANON_KEY_FROM_ENV__.trim() : "";
const supabaseAnonKey = fromMetaKey || fromDefineKey;

/** env 가 없으면 null (호출부에서 처리) */
export const supabase = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;
