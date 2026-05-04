/// <reference types="vite/client" />

/** vite.config.js `define` 으로 주입 (빌드 시 .env / 호스트 환경 변수 폴백) */
declare const __VITE_ADMIN_KEY_FROM_ENV__: string;
declare const __VITE_SUPABASE_URL_FROM_ENV__: string;
declare const __VITE_SUPABASE_ANON_KEY_FROM_ENV__: string;
