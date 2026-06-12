import { createServer } from 'node:http'
import { readFile, readdir } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const ROOT_DIR = path.resolve(__dirname, '..')
const ASSETS_DIR = path.resolve(ROOT_DIR, 'assets')
const PORT = Number(process.env.SVG_ASSET_PORT ?? process.env.PORT ?? 3077)
const GRID_COLUMNS = 4

let cache = {
  items: [],
  loadedAt: null,
}

async function collectSvgFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true })
  const files = []

  for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name))) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      files.push(...await collectSvgFiles(fullPath))
      continue
    }
    if (entry.isFile() && entry.name.toLowerCase().endsWith('.svg')) {
      files.push(fullPath)
    }
  }

  return files
}

function normalizeSlashes(value) {
  return value.split(path.sep).join('/')
}

function toAssetName(filePath) {
  const baseName = path.basename(filePath, '.svg')
  return baseName.replace(/[_-]+/g, ' ').replace(/\s+/g, ' ').trim() || baseName
}

function toAssetCategory(filePath) {
  const relativeDir = path.relative(ASSETS_DIR, path.dirname(filePath))
  return normalizeSlashes(relativeDir || 'default')
}

async function loadAssets() {
  const files = await collectSvgFiles(ASSETS_DIR)
  const items = await Promise.all(
    files.map(async (filePath) => {
      const relativePath = normalizeSlashes(path.relative(ASSETS_DIR, filePath))
      const content = await readFile(filePath, 'utf8')
      return {
        id: relativePath,
        name: toAssetName(filePath),
        category: toAssetCategory(filePath),
        type: 'svg',
        content,
      }
    }),
  )

  items.sort((a, b) => {
    const categoryCompare = a.category.localeCompare(b.category)
    if (categoryCompare !== 0)
      return categoryCompare
    return a.name.localeCompare(b.name)
  })

  cache = {
    items,
    loadedAt: new Date().toISOString(),
  }

  return cache.items
}

async function getAssets(forceReload = false) {
  if (forceReload || cache.items.length === 0) {
    return loadAssets()
  }
  return cache.items
}

function toPositiveInt(value, fallback) {
  const num = Number.parseInt(value ?? '', 10)
  if (!Number.isFinite(num) || num <= 0)
    return fallback
  return num
}

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  })
  res.end(JSON.stringify(payload))
}

const server = createServer(async (req, res) => {
  if (!req.url) {
    sendJson(res, 400, { message: 'Missing request URL' })
    return
  }

  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    })
    res.end()
    return
  }

  const url = new URL(req.url, `http://${req.headers.host ?? '127.0.0.1'}`)

  try {
    if (req.method === 'GET' && url.pathname === '/health') {
      const items = await getAssets(true)
      sendJson(res, 200, {
        ok: true,
        assetCount: items.length,
        loadedAt: cache.loadedAt,
      })
      return
    }

    if (req.method === 'GET' && url.pathname === '/api/assets') {
      const forceReload = true
      const page = toPositiveInt(url.searchParams.get('page'), 1)
      const keyword = url.searchParams.get('keyword')?.trim().toLowerCase() ?? ''
      const category = url.searchParams.get('category')?.trim().toLowerCase() ?? ''

      const sourceItems = await getAssets(forceReload)
      const filteredItems = sourceItems.filter((item) => {
        const matchKeyword = !keyword || item.name.toLowerCase().includes(keyword) || item.id.toLowerCase().includes(keyword)
        const matchCategory = !category || item.category.toLowerCase() === category
        return matchKeyword && matchCategory
      })

      const total = filteredItems.length
      const defaultPageSize = Math.max(total, 1)
      const pageSize = toPositiveInt(url.searchParams.get('pageSize'), defaultPageSize)
      const totalPages = Math.max(1, Math.ceil(total / pageSize))
      const currentPage = Math.min(page, totalPages)
      const start = (currentPage - 1) * pageSize
      const end = start + pageSize
      const items = filteredItems.slice(start, end)

      sendJson(res, 200, {
        items,
        pagination: {
          page: currentPage,
          pageSize,
          total,
          totalPages,
          hasPrev: currentPage > 1,
          hasNext: currentPage < totalPages,
        },
        grid: {
          columns: GRID_COLUMNS,
          rows: Math.max(1, Math.ceil(pageSize / GRID_COLUMNS)),
          perPage: pageSize,
        },
        loadedAt: cache.loadedAt,
      })
      return
    }

    sendJson(res, 404, { message: 'Not found' })
  }
  catch (error) {
    sendJson(res, 500, {
      message: 'Failed to read SVG assets',
      error: error instanceof Error ? error.message : String(error),
    })
  }
})

loadAssets()
  .then((items) => {
    server.listen(PORT, () => {
      console.log(`[svg-assets] listening on http://127.0.0.1:${PORT}`)
      console.log(`[svg-assets] loaded ${items.length} svg assets from ${ASSETS_DIR}`)
    })
  })
  .catch((error) => {
    console.error('[svg-assets] failed to initialize', error)
    process.exitCode = 1
  })
