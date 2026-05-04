import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** Windows·Linux 모두에서 glob이 안정적으로 동작하도록 슬래시로 통일 */
function posix(p) {
  return p.split(path.sep).join("/");
}

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    posix(path.join(__dirname, "index.html")),
    posix(path.join(__dirname, "src", "**", "*.{js,jsx,ts,tsx}")),
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
