import { defineConfig } from 'vite';
import { viteStaticCopy } from 'vite-plugin-static-copy';

export default defineConfig({
    build: {
        rollupOptions: {
            input: {
                content: 'src/content.js',
                popup:   'src/popup/popup.js',
                options: 'src/options/options.js',
                background: 'src/background.js',
            },
            output: {
                entryFileNames: '[name]/[name].js',
                manualChunks: undefined
            }
        },
        outDir: 'dist',
        emptyOutDir: true,
        cssCodeSplit: false
    },
    plugins: [
        viteStaticCopy({
            targets: [
                { src: 'public/manifest.json',          dest: '.'       },
                { src: 'public/manifest_firefox.json',          dest: '.'       },
                { src: 'public/icons/*',                dest: 'icons'  },
                { src: 'src/popup/popup.html',          dest: 'popup'  },
                { src: 'src/popup/popup.css',           dest: 'popup'  },
                { src: 'src/options/options.html',      dest: 'options'},
                { src: 'src/options/options.css',      dest: 'options'}
            ]
        })
    ]
});
