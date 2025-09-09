import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig } from 'vite';

// FIX: `__dirname` is not available in ES modules. The following lines define it for this context.
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
    resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
    }
});