import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig, loadEnv } from 'vite';

// FIX: `__dirname` is not available in ES modules. The following lines define it for this context.
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig(({ mode }) => {
    // Load env file based on `mode` in the current working directory.
    // FIX: Replaced `process.cwd()` with `path.resolve()` to avoid a TypeScript error where `cwd` is not found on the `Process` type.
    const env = loadEnv(mode, path.resolve(), '');

    return {
        resolve: {
            alias: {
              '@': path.resolve(__dirname, '.'),
            }
        },
        define: {
            // Expose the VITE_API_KEY to the client-side code as process.env.API_KEY.
            // If VITE_API_KEY is not set, define it as an empty string to ensure
            // process.env.API_KEY is falsy, allowing fallback logic to work correctly.
            'process.env.API_KEY': JSON.stringify(env.VITE_API_KEY || '')
        }
    }
});
