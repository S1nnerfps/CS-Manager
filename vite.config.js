import { cpSync, createReadStream, existsSync, mkdirSync, statSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const rootDir = fileURLToPath(new URL('.', import.meta.url))
const downloadsDir = path.resolve(rootDir, 'downloads')

function downloadsPlugin() {
  return {
    name: 'downloads-static',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const rawUrl = req.url ? decodeURIComponent(req.url.split('?')[0]) : ''
        if (!rawUrl.startsWith('/downloads/')) return next()

        const relativePath = rawUrl.slice('/downloads/'.length)
        if (!relativePath) return next()

        const filePath = path.resolve(downloadsDir, relativePath)
        const safeRelative = path.relative(downloadsDir, filePath)
        if (
          safeRelative.startsWith('..') ||
          path.isAbsolute(safeRelative) ||
          !existsSync(filePath) ||
          !statSync(filePath).isFile()
        ) {
          res.statusCode = 404
          res.end('Not found')
          return
        }

        res.statusCode = 200
        if (path.extname(filePath).toLowerCase() === '.exe') {
          res.setHeader('Content-Type', 'application/vnd.microsoft.portable-executable')
          res.setHeader('Content-Disposition', `attachment; filename="${path.basename(filePath)}"`)
        }
        createReadStream(filePath).pipe(res)
      })
    },
    writeBundle(outputOptions) {
      if (!existsSync(downloadsDir)) return
      const outDir = outputOptions.dir
        ? path.resolve(rootDir, outputOptions.dir)
        : path.resolve(rootDir, 'dist')
      const targetDir = path.resolve(outDir, 'downloads')
      mkdirSync(targetDir, { recursive: true })
      cpSync(downloadsDir, targetDir, { recursive: true })
    },
  }
}

export default defineConfig({
  plugins: [react(), downloadsPlugin()],
  build: {
    rollupOptions: {
      input: {
        index: 'index.html',
        play: 'play.html',
      },
    },
  },
})
