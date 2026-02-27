import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    VitePWA({
      registerType: "autoUpdate",
      injectRegister: "auto",
      workbox: {
        // Cache semua asset statik
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff,woff2}"],
        // Cache runtime untuk data lokal
        runtimeCaching: [
          {
            // Cache halaman navigasi
            urlPattern: /^https?:\/\/localhost/,
            handler: "NetworkFirst",
            options: {
              cacheName: "gajiku-pages",
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 7, // 7 hari
              },
            },
          },
        ],
        // Skip waiting agar update langsung aktif
        skipWaiting: true,
        clientsClaim: true,
      },
      manifest: {
        name: "GAJIKU - Pembukuan Keuangan",
        short_name: "GAJIKU",
        description: "Aplikasi pembukuan keuangan pribadi offline & online",
        theme_color: "#6366f1",
        background_color: "#ffffff",
        display: "standalone",
        orientation: "portrait",
        scope: "/",
        start_url: "/",
        lang: "id",
        categories: ["finance", "productivity"],
        icons: [
          {
            src: "/icon-192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "/icon-192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "maskable",
          },
          {
            src: "/icon-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "/icon-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
        shortcuts: [
          {
            name: "Tambah Transaksi",
            short_name: "Tambah",
            description: "Tambah transaksi baru",
            url: "/?action=add-transaction",
            icons: [{ src: "/icon-192.png", sizes: "192x192" }],
          },
          {
            name: "Lihat Laporan",
            short_name: "Laporan",
            description: "Lihat laporan keuangan",
            url: "/report",
            icons: [{ src: "/icon-192.png", sizes: "192x192" }],
          },
        ],
        screenshots: [],
      },
      devOptions: {
        // Di development mode, aktifkan service worker juga
        enabled: false, // false selama dev agar HMR tidak konflik
        type: "module",
      },
    }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        // Code splitting untuk reduce bundle size
        manualChunks: {
          vendor: ["react", "react-dom", "react-router-dom"],
          charts: ["recharts"],
          ui: [
            "@radix-ui/react-dialog",
            "@radix-ui/react-select",
            "@radix-ui/react-switch",
            "@radix-ui/react-tooltip",
          ],
        },
      },
    },
  },
}));
