import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import { VitePWA } from "vite-plugin-pwa"

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      injectRegister: "auto",
      includeAssets: ["vite.svg"],
      manifest: {
        name: "ImmoMarket",
        short_name: "ImmoMarket",
        description: "ImmoMarket Morocco",
        theme_color: "#06142f",
        background_color: "#f3f5fb",
        display: "standalone",
        orientation: "portrait",
        scope: "/",
        start_url: "/",
        lang: "ar",
        dir: "rtl",
        icons: [
          {
            src: "/vite.svg",
            sizes: "192x192",
            type: "image/svg+xml",
            purpose: "any"
          },
          {
            src: "/vite.svg",
            sizes: "512x512",
            type: "image/svg+xml",
            purpose: "any maskable"
          }
        ]
      },
      devOptions: {
        enabled: true
      }
    })
  ]
})
