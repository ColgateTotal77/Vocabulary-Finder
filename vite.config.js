import { defineConfig } from 'vite';

export default defineConfig({
    build: {
        rollupOptions: {
            input: {
                content: 'src/content.js',
                popup: 'src/popup/popup.js',
                options: 'src/options/options.js',
                background: 'src/background.js',
            },
            output: {
                entryFileNames: '[name]/[name].js',
                manualChunks: () => 'vendor',                // Disable code splitting completely
                inlineDynamicImports: false,
            },
            external: [],
        },
        outDir: 'dist',
        emptyOutDir: true,
        cssCodeSplit: false,
        chunkSizeWarningLimit: 2000,
    }
});

// import { defineConfig } from 'vite';
//
// export default defineConfig({
//     build: {
//         rollupOptions: {
//             input: {
//                 content: 'src/content.js',
//                 popup: 'src/popup/popup.js',
//                 options: 'src/options/options.js',
//                 background: 'src/background.js',
//             },
//             output: {
//                 entryFileNames: '[name]/[name].js',
//                 manualChunks: undefined, // Disable manual chunking
//                 inlineDynamicImports: true, // Bundle dynamic imports
//                 format: 'iife', // Use IIFE format for better extension compatibility
//             },
//             external: [], // Bundle everything
//         },
//         outDir: 'dist',
//         emptyOutDir: true,
//         cssCodeSplit: false,
//         chunkSizeWarningLimit: 2000,
//         minify: false, // Disable minification for debugging
//     }
// });