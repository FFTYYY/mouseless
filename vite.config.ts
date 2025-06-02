import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import dts from "vite-plugin-dts"
import { resolve } from "path"

export default defineConfig({
    plugins: [
        react(),
        dts({
            include: ["lib/**/*"],
            outDir: "dist",
        }),
    ],
    build: {
        lib: {
            entry    : resolve(__dirname, "lib/index.ts"),
            name     : "mouseless",
            fileName : "mouseless",
            formats  : ["es", "umd"],
        },
        rollupOptions: {
            external: ["react", "react-dom"],
            output: {
                globals: {
                    react     : "React",
                    "react-dom": "ReactDOM",
                },
            },
        },
    },
})