import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig, loadEnv } from 'vite';

// FIX: `__dirname` is not available in ES modules. The following lines define it for this context.
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig(({ mode }) => {
    // Load env file based on `mode` in the current working directory.
    const env = loadEnv(mode, process.cwd(), '');

    return {
        resolve: {
            alias: {
              '@': path.resolve(__dirname, '.'),
            }
        },
        define: {
            // Expose the VITE_API_KEY to the client-side code as process.env.API_KEY
            // This allows for a production key to be set during the build process.
            'process.env.API_KEY': JSON.stringify(env.VITE_API_KEY)
        }
    }
});