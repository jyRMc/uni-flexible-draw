import { createServer } from 'node:http'
import { readdir, readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const ROOT_DIR = path.resolve(__dirname, '..')
const ASSETS_DIR = path.resolve(ROOT_DIR, 'assets')
const PORT = Number(process.env.UNIDRAW_SERVER_PORT ?? process.env.PORT ?? 3077)
const GRID_COLUMNS = 4
const DEFAULT_PAGE_SIZE = 80
const MAX_PAGE_SIZE = 200

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
    if (categoryCompare !== 0) return categoryCompare
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
  if (!Number.isFinite(num) || num <= 0) return fallback
  return num
}

function setCorsHeaders(res, contentType = 'application/json; charset=utf-8') {
  res.setHeader('Content-Type', contentType)
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
}

function sendJson(res, statusCode, payload) {
  res.statusCode = statusCode
  setCorsHeaders(res)
  res.end(JSON.stringify(payload))
}

async function readJsonBody(req) {
  const chunks = []
  for await (const chunk of req) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk)
  }
  const raw = Buffer.concat(chunks).toString('utf8').trim()
  return raw ? JSON.parse(raw) : {}
}

function validateAiConfig(body) {
  const apiUrl = typeof body.apiUrl === 'string' ? body.apiUrl.trim() : ''
  const apiKey = typeof body.apiKey === 'string' ? body.apiKey.trim() : ''
  const model = typeof body.model === 'string' ? body.model.trim() : ''
  if (!apiUrl) return 'Missing apiUrl'
  if (!apiKey) return 'Missing apiKey'
  if (!model && body.requireModel !== false) return 'Missing model'
  return ''
}

function deriveModelsUrl(apiUrl) {
  const url = new URL(apiUrl)
  if (url.pathname.endsWith('/chat/completions')) {
    url.pathname = url.pathname.replace(/\/chat\/completions$/, '/models')
    return url.toString()
  }
  if (url.pathname.endsWith('/completions')) {
    url.pathname = url.pathname.replace(/\/completions$/, '/models')
    return url.toString()
  }
  url.pathname = '/models'
  url.search = ''
  return url.toString()
}

async function handleAiDiagnose(req, res) {
  const body = await readJsonBody(req)
  const error = validateAiConfig({ ...body, requireModel: false })
  if (error) {
    sendJson(res, 400, { ok: false, message: error })
    return
  }

  const upstream = await fetch(deriveModelsUrl(body.apiUrl), {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${body.apiKey.trim()}`,
    },
  })

  const text = await upstream.text()
  sendJson(res, upstream.ok ? 200 : upstream.status, {
    ok: upstream.ok,
    status: upstream.status,
    message: text.slice(0, 300),
  })
}

async function handleAiChat(req, res) {
  const body = await readJsonBody(req)
  const error = validateAiConfig(body)
  if (error) {
    sendJson(res, 400, { message: error })
    return
  }

  const upstream = await fetch(body.apiUrl.trim(), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${body.apiKey.trim()}`,
    },
    body: JSON.stringify({
      model: body.model.trim(),
      messages: Array.isArray(body.messages) ? body.messages : [],
      temperature: typeof body.temperature === 'number' ? body.temperature : 0.3,
      max_tokens: typeof body.max_tokens === 'number' ? body.max_tokens : 4096,
      stream: body.stream !== false,
    }),
  })

  if (!upstream.ok) {
    const message = await upstream.text().catch(() => '')
    sendJson(res, upstream.status, {
      message: `[${upstream.status}] ${upstream.statusText}${message ? `: ${message}` : ''}`,
    })
    return
  }

  if (!upstream.body) {
    sendJson(res, 502, { message: 'No upstream response body' })
    return
  }

  res.statusCode = 200
  setCorsHeaders(res, upstream.headers.get('content-type') || 'text/event-stream; charset=utf-8')

  const reader = upstream.body.getReader()
  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    if (value) {
      res.write(Buffer.from(value))
    }
  }
  res.end()
}

const server = createServer(async (req, res) => {
  if (!req.url) {
    sendJson(res, 400, { message: 'Missing request URL' })
    return
  }

  if (req.method === 'OPTIONS') {
    res.statusCode = 204
    setCorsHeaders(res)
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
      const forceReload = url.searchParams.get('reload') === 'true'
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
      const pageSize = Math.min(toPositiveInt(url.searchParams.get('pageSize'), DEFAULT_PAGE_SIZE), MAX_PAGE_SIZE)
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

    if (req.method === 'POST' && url.pathname === '/api/ai/diagnose') {
      await handleAiDiagnose(req, res)
      return
    }

    if (req.method === 'POST' && url.pathname === '/api/ai/chat') {
      await handleAiChat(req, res)
      return
    }

    sendJson(res, 404, { message: 'Not found' })
  } catch (error) {
    sendJson(res, 500, {
      message: error instanceof Error ? error.message : String(error),
    })
  }
})

loadAssets()
  .then((items) => {
    server.listen(PORT, () => {
      console.log(`[uni-server] listening on http://127.0.0.1:${PORT}`)
      console.log(`[uni-server] loaded ${items.length} svg assets from ${ASSETS_DIR}`)
    })
  })
  .catch((error) => {
    console.error('[uni-server] failed to initialize', error)
    process.exitCode = 1
  })
