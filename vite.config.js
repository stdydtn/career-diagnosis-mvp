import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // VITE_ 접두사만 로드(파일 + process.env 병합). Vercel 빌드 시 CI 주입 변수가 여기 포함됩니다.
  const loaded = loadEnv(mode, __dirname, "VITE_");
  const adminKey = (loaded.VITE_ADMIN_KEY ?? process.env.VITE_ADMIN_KEY ?? "").trim();
  const supabaseUrl = (loaded.VITE_SUPABASE_URL ?? process.env.VITE_SUPABASE_URL ?? "").trim();
  const supabaseAnonKey = (loaded.VITE_SUPABASE_ANON_KEY ?? process.env.VITE_SUPABASE_ANON_KEY ?? "").trim();

  const onVercel = Boolean(process.env.VERCEL);
  if (mode === "production" && onVercel && (!supabaseUrl.trim() || !supabaseAnonKey.trim())) {
    throw new Error(
      "On Vercel, set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in Project → Settings → Environment Variables, then redeploy."
    );
  }

  return {
    root: __dirname,
    envDir: __dirname,
    define: {
      __VITE_ADMIN_KEY_FROM_ENV__: JSON.stringify(adminKey),
      __VITE_SUPABASE_URL_FROM_ENV__: JSON.stringify(supabaseUrl),
      __VITE_SUPABASE_ANON_KEY_FROM_ENV__: JSON.stringify(supabaseAnonKey),
    },
    plugins: [react()],
    css: {
      postcss: path.join(__dirname, "postcss.config.js"),
    },
  };
});
