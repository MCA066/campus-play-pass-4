import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
const repositoryName = process.env.GITHUB_REPOSITORY?.split('/')[1];
const base = repositoryName ? `/${repositoryName}/` : './';

// Keep built asset paths relative so the exported demo also works from a
// nested folder or when opened from its packaged directory.
export default defineConfig({ base, plugins: [react(), tailwindcss()] });
