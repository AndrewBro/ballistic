import {defineConfig} from 'vite'
import react from '@vitejs/plugin-react'
// GitHub Pages serves the site from /<repo>/; the deploy workflow passes the repo name in BASE_PATH
export default defineConfig({plugins:[react()],base:process.env.BASE_PATH??'/'})
