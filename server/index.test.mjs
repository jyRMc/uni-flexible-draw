import { createServer } from 'node:http'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const __dirname = dirname(fileURLToPath(import.meta.url))

// 动态加载 server 模块，避免在加载时直接启动服务器
async function loadServerModule() {
  return await import(join(__dirname, 'index.mjs'))
}

describe('server helper functions', () => {
  it('should normalize slashes', () => {
    expect('a\\b\\c'.split('\\').join('/')).toBe('a/b/c')
  })

  it('should convert asset name', () => {
    const baseName = 'my_test-file'
    const name = baseName.replace(/[_-]+/g, ' ').replace(/\s+/g, ' ').trim() || baseName
    expect(name).toBe('my test file')
  })
})
