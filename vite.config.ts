import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import dts from "vite-plugin-dts"
import { resolve } from "path"

export default defineConfig(({ command, mode }) => {
    const isLib = mode === "lib"
    const isExample = mode === "example"

    return {
        base: isExample ? "/mouseless/" : "/",
        plugins: [
            react(),
            ...(isLib ? [
                dts({
                    include: ["lib/**/*"],
                    outDir: "dist",
                })
            ] : []),
        ],
        resolve: isExample ? {
            alias: {
                "mouseless": resolve(__dirname, "lib/index.tsx"),
            },
        } : undefined,
        build: {
            lib: isLib ? {
                entry    : resolve(__dirname, "lib/index.tsx"),
                name     : "mouseless",
                fileName : "mouseless",
                formats  : ["es", "umd"],
            } : undefined,
            rollupOptions: {
                external: isLib ? ["react", "react-dom"] : [],
                output: isLib ? {
                    globals: {
                        react     : "React",
                        "react-dom": "ReactDOM",
                    },
                } : {
                    manualChunks: {
                        "react-vendor": ["react", "react-dom"],
                    },
                },
            },
            outDir: isLib ? "dist" : "../docs",
        },
        root: isExample ? "example" : undefined,
    }
})