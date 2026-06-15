<script setup lang="ts">
import { onBeforeUnmount, ref } from 'vue'
import { UniDraw, type UniDrawOptions } from '../../../../lib/UniDraw'
import { getAllLibraries } from '../../../../lib/materials'

// ─── State ────────────────────────────────────────────────────────────────

interface TestResult {
  name: string
  status: 'pending' | 'pass' | 'fail'
  error?: string
  ms?: number
}

const canvasHost = ref<HTMLElement | null>(null)
const results = ref<TestResult[]>([])
const running = ref(false)
const done = ref(false)
const passed = ref(0)
const total = ref(0)
const selected = ref<TestResult | null>(null)

let liveInstance: UniDraw | null = null

onBeforeUnmount(() => { liveInstance?.destroy(); liveInstance = null })

// ─── Test helpers ─────────────────────────────────────────────────────────

function assert(condition: boolean, message: string): void {
  if (!condition)
    throw new Error(`Assertion failed: ${message}`)
}

function sleep(ms: number): Promise<void> {
  return new Promise(r => setTimeout(r, ms))
}

/** Creates an off-screen 800×600 container, runs fn(container), tears it down unless keep=true */
async function withContainer(
  fn: (container: HTMLElement, ud: UniDraw) => Promise<void>,
  opts: UniDrawOptions = {},
  keep = false,
): Promise<void> {
  const div = document.createElement('div')
  Object.assign(div.style, {
    position: 'fixed',
    top: '-9999px',
    left: '-9999px',
    width: '800px',
    height: '600px',
    overflow: 'hidden',
  })
  document.body.appendChild(div)
  const ud = new UniDraw(div, opts)
  await sleep(50)
  try {
    await fn(div, ud)
  }
  finally {
    if (!keep) { ud.destroy(); div.remove() }
    else {
      liveInstance?.destroy()
      liveInstance = ud
      if (canvasHost.value) {
        canvasHost.value.innerHTML = ''
        canvasHost.value.appendChild(div)
        Object.assign(div.style, { position: 'relative', top: '0', left: '0', width: '100%', height: '100%' })
      }
    }
  }
}

// ─── Test suite ───────────────────────────────────────────────────────────

type TestFn = () => Promise<void>

const TESTS: [string, TestFn][] = [

  ['[DOM] ud-root element is created inside container', async () => {
    await withContainer(async (container) => {
      assert(container.querySelector('.ud-root') !== null, '.ud-root should exist')
    })
  }],

  ['[DOM] toolbar renders when showToolbar=true (default)', async () => {
    await withContainer(async (container) => {
      assert(container.querySelector('.toolbar-float') !== null, '.toolbar-float should exist')
    })
  }],

  ['[DOM] toolbar hidden when showToolbar=false', async () => {
    await withContainer(async (container) => {
      assert(container.querySelector('.toolbar-float') === null, '.toolbar-float should not exist')
    }, { showToolbar: false })
  }],

  ['[DOM] shape sidebar renders when showShapePanel=true (default)', async () => {
    await withContainer(async (container) => {
      assert(container.querySelector('.ud-left-panel') !== null, '.ud-left-panel should exist')
    })
  }],

  ['[DOM] shape sidebar hidden when showShapePanel=false', async () => {
    await withContainer(async (container) => {
      assert(container.querySelector('.ud-left-panel') === null, '.ud-left-panel should not exist')
    }, { showShapePanel: false })
  }],

  ['[DOM] properties panel renders on selection when showPropertiesPanel=true', async () => {
    await withContainer(async (container, ud) => {
      ud.setData({
        canvas: { backgroundColor: '#ffffff', grid: { size: 10, visible: true, type: 'dot' as const }, zoom: 1 },
        nodes: [{ id: 'n1', shape: 'basic-rect', position: { x: 100, y: 100 }, size: { width: 80, height: 40 } }],
        edges: [],
      })
      await sleep(50)
      // Trigger selection through internal graph API
      const g: any = (ud as any)._graph
      const cell = g.getCellById('n1')
      if (g.select && cell)
        g.select(cell)
      await sleep(50)
      assert(container.querySelector('.ud-properties-card') !== null, '.ud-properties-card should exist after selection')
    }, { showPropertiesPanel: true })
  }],

  ['[DOM] X6 SVG canvas is rendered inside .ud-canvas', async () => {
    await withContainer(async (container) => {
      await sleep(100)
      const svg = container.querySelector('.ud-canvas svg')
      assert(svg !== null, 'X6 should render an SVG element inside .ud-canvas')
    })
  }],

  ['[Materials] getAllLibraries() returns non-empty array', async () => {
    const libs = getAllLibraries()
    assert(libs.length > 0, 'at least one material library')
    assert(libs[0].items.length > 0, 'first library has items')
  }],

  ['[DOM] shape panel is populated with library items', async () => {
    await withContainer(async (container) => {
      const items = container.querySelectorAll('.shape-category-item')
      assert(items.length > 0, `should have >0 .shape-category-item elements, got ${items.length}`)
    })
  }],

  ['[Data] getData() returns valid GraphData structure', async () => {
    await withContainer(async (_c, ud) => {
      const data = ud.getData()
      assert(typeof data === 'object', 'getData() should return object')
      assert(Array.isArray(data.nodes), 'data.nodes should be array')
      assert(Array.isArray(data.edges), 'data.edges should be array')
      assert(typeof data.canvas === 'object', 'data.canvas should be object')
    })
  }],

  ['[Data] setData() + getData() round-trip preserves canvas config', async () => {
    await withContainer(async (_c, ud) => {
      const input = {
        canvas: {
          backgroundColor: '#fafafa',
          grid: { size: 20, visible: false, type: 'line' as const },
          zoom: 1.5,
        },
        nodes: [{ id: 'n1', shape: 'basic-rect', position: { x: 100, y: 100 }, size: { width: 80, height: 40 }, label: 'TestNode' }],
        edges: [],
      }
      ud.setData(input)
      await sleep(50)
      const out = ud.getData()
      assert(out.nodes.length === 1, `expected 1 node, got ${out.nodes.length}`)
      assert(out.nodes[0].id === 'n1', `expected id=n1, got ${out.nodes[0].id}`)
      assert(out.canvas.backgroundColor === '#fafafa', `expected backgroundColor #fafafa, got ${out.canvas.backgroundColor}`)
      assert(out.canvas.grid!.size === 20, `expected grid size 20, got ${out.canvas.grid!.size}`)
      assert(out.canvas.grid!.type === 'line', `expected grid type line, got ${out.canvas.grid!.type}`)
      assert(out.canvas.zoom === 1.5, `expected zoom 1.5, got ${out.canvas.zoom}`)
    })
  }],

  ['[Data] clear() removes all nodes', async () => {
    await withContainer(async (_c, ud) => {
      ud.setData({
        canvas: { backgroundColor: '#ffffff', grid: { size: 10, visible: true, type: 'dot' as const }, zoom: 1 },
        nodes: [{ id: 'n1', shape: 'basic-rect', position: { x: 100, y: 100 }, size: { width: 80, height: 40 } }],
        edges: [],
      })
      await sleep(30)
      ud.clear()
      await sleep(30)
      const out = ud.getData()
      assert(out.nodes.length === 0, `expected 0 nodes after clear(), got ${out.nodes.length}`)
    })
  }],

  ['[Node] clicking shape panel item adds a node', async () => {
    await withContainer(async (container, ud) => {
      const before = ud.getData().nodes.length
      const item = container.querySelector<HTMLElement>('.shape-category-item')
      assert(item !== null, 'no .shape-category-item found in sidebar')
      item!.click()
      await sleep(80)
      const after = ud.getData().nodes.length
      assert(after === before + 1, `expected ${before + 1} nodes after click, got ${after}`)
    })
  }],

  ['[Zoom] zoomIn() increases zoom level', async () => {
    await withContainer(async (_c, ud) => {
      ud.setData({
        canvas: { backgroundColor: '#ffffff', grid: { size: 10, visible: true, type: 'dot' as const }, zoom: 1 },
        nodes: [],
        edges: [],
      })
      await sleep(30)
      const g: any = (ud as any)._graph
      const before = g.zoom()
      ud.zoomIn()
      await sleep(30)
      const after = g.zoom()
      assert(after > before, `zoom should increase: ${before} → ${after}`)
    })
  }],

  ['[Zoom] zoomOut() decreases zoom level', async () => {
    await withContainer(async (_c, ud) => {
      ud.setData({
        canvas: { backgroundColor: '#ffffff', grid: { size: 10, visible: true, type: 'dot' as const }, zoom: 1.5 },
        nodes: [],
        edges: [],
      })
      await sleep(30)
      const g: any = (ud as any)._graph
      const before = g.zoom()
      ud.zoomOut()
      await sleep(30)
      const after = g.zoom()
      assert(after < before, `zoom should decrease: ${before} → ${after}`)
    })
  }],

  ['[History] undo/redo: adding a node then undoing removes it', async () => {
    await withContainer(async (container, ud) => {
      const item = container.querySelector<HTMLElement>('.shape-category-item')
      assert(item !== null, 'no sidebar item found')
      const before = ud.getData().nodes.length
      item!.click()
      await sleep(80)
      assert(ud.getData().nodes.length === before + 1, 'should have 1 more node after add')
      ud.undo()
      await sleep(80)
      assert(ud.getData().nodes.length === before, `undo should remove node, got ${ud.getData().nodes.length}`)
      ud.redo()
      await sleep(80)
      assert(ud.getData().nodes.length === before + 1, `redo should restore node, got ${ud.getData().nodes.length}`)
    })
  }],

  ['[Export] exportJSON() returns parseable JSON', async () => {
    await withContainer(async (_c, ud) => {
      const json = ud.exportJSON()
      assert(typeof json === 'string' && json.length > 0, 'exportJSON should return non-empty string')
      const parsed = JSON.parse(json)
      assert(Array.isArray(parsed.nodes), 'parsed JSON has .nodes array')
      assert(typeof parsed.canvas === 'object', 'parsed JSON has .canvas object')
    })
  }],

  ['[Export] exportPNG() returns data-url string', async () => {
    await withContainer(async (_c, ud) => {
      const url = await ud.exportPNG()
      assert(typeof url === 'string' && url.length > 0, 'exportPNG should return non-empty string')
      assert(url.startsWith('data:image'), `expected data: URL, got: ${url.slice(0, 30)}`)
    })
  }],

  ['[Destroy] destroy() removes root from DOM', async () => {
    const div = document.createElement('div')
    document.body.appendChild(div)
    const ud = new UniDraw(div, {})
    await sleep(50)
    assert(div.querySelector('.ud-root') !== null, '.ud-root should exist before destroy')
    ud.destroy()
    assert(div.querySelector('.ud-root') === null, '.ud-root should be gone after destroy')
    div.remove()
  }],

  ['[Live] full canvas with nodes and edges (visual)', async () => {
    await withContainer(async (_c, ud) => {
      ud.setData({
        canvas: { backgroundColor: '#fafafa', grid: { size: 10, visible: true, type: 'dot' as const }, zoom: 1 },
        nodes: [
          { id: 'a', shape: 'basic-rect', position: { x: 80, y: 120 }, size: { width: 100, height: 44 }, label: '开始' },
          { id: 'b', shape: 'basic-rect', position: { x: 300, y: 120 }, size: { width: 100, height: 44 }, label: '处理' },
          { id: 'c', shape: 'basic-rect', position: { x: 520, y: 120 }, size: { width: 100, height: 44 }, label: '结束' },
        ],
        edges: [
          { id: 'e1', shape: 'edge-line', source: { cell: 'a' }, target: { cell: 'b' } },
          { id: 'e2', shape: 'edge-line', source: { cell: 'b' }, target: { cell: 'c' } },
        ],
      })
      const data = ud.getData()
      assert(data.nodes.length === 3, `expected 3 nodes, got ${data.nodes.length}`)
      assert(data.edges.length === 2, `expected 2 edges, got ${data.edges.length}`)
    }, { showToolbar: true, showShapePanel: true, showPropertiesPanel: true }, true /* keep */)
  }],

]

// ─── Runner ───────────────────────────────────────────────────────────────

async function runAll() {
  running.value = true
  done.value = false
  passed.value = 0
  total.value = TESTS.length
  selected.value = null
  results.value = TESTS.map(([name]) => ({ name, status: 'pending' }))

  for (let i = 0; i < TESTS.length; i++) {
    const [name, fn] = TESTS[i]
    const start = performance.now()
    try {
      await fn()
      const ms = Math.round(performance.now() - start)
      results.value[i] = { name, status: 'pass', ms }
      passed.value++
    }
    catch (err: unknown) {
      const ms = Math.round(performance.now() - start)
      results.value[i] = { name, status: 'fail', error: String(err), ms }
    }
  }

  running.value = false
  done.value = true
}
</script>

<template>
  <div class="tr-root">
    <div class="tr-header">
      <span class="tr-title">UniDraw 功能测试</span>
      <button class="tr-run-btn" :disabled="running" @click="runAll">
        {{ running ? '运行中…' : '▶ 运行全部' }}
      </button>
      <span v-if="done" class="tr-summary">
        <span class="pass">✓ {{ passed }}</span> /
        <span class="fail">✗ {{ total - passed }}</span>
        共 {{ total }}
      </span>
    </div>

    <div class="tr-body">
      <!-- Test result list -->
      <div class="tr-list">
        <div
          v-for="r in results"
          :key="r.name"
          class="tr-item"
          :class="r.status"
          @click="selected = r"
        >
          <span class="tr-icon">{{ r.status === 'pass' ? '✓' : r.status === 'fail' ? '✗' : '○' }}</span>
          <span class="tr-name">{{ r.name }}</span>
          <span v-if="r.ms !== undefined" class="tr-dur">{{ r.ms }}ms</span>
        </div>
      </div>

      <!-- Detail panel -->
      <div class="tr-detail">
        <template v-if="selected">
          <div class="tr-detail-name" :class="selected.status">
            {{ selected.name }}
          </div>
          <pre v-if="selected.error" class="tr-error">{{ selected.error }}</pre>
          <pre v-else class="tr-ok">PASSED</pre>
        </template>
        <div v-else class="tr-detail-empty">
          点击左侧测试项查看详情
        </div>

        <!-- Live canvas for visual inspection -->
        <div class="tr-canvas-label">
          实时画布（最后一次测试）
        </div>
        <div ref="canvasHost" class="tr-canvas-host" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.tr-root {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-size: 13px;
  background: #f7f8fc;
  overflow: hidden;
}

.tr-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 16px;
  background: #fff;
  border-bottom: 1px solid #e8e8ec;
  flex-shrink: 0;
}

.tr-title {
  font-weight: 700;
  font-size: 14px;
  color: #7166f0;
}

.tr-run-btn {
  padding: 5px 16px;
  background: #7166f0;
  color: #fff;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 600;
}
.tr-run-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.tr-summary {
  font-size: 12px;
  color: #888;
}
.tr-summary .pass {
  color: #16a34a;
  font-weight: 600;
}
.tr-summary .fail {
  color: #dc2626;
  font-weight: 600;
}

.tr-body {
  display: flex;
  flex: 1;
  overflow: hidden;
  min-height: 0;
}

.tr-list {
  width: 300px;
  flex-shrink: 0;
  overflow-y: auto;
  border-right: 1px solid #e8e8ec;
  background: #fff;
  padding: 6px 0;
}

.tr-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 7px 14px;
  cursor: pointer;
  border-left: 3px solid transparent;
  transition: background 0.1s;
}
.tr-item:hover {
  background: #f5f5fa;
}
.tr-item.pass {
  border-left-color: #16a34a;
}
.tr-item.fail {
  border-left-color: #dc2626;
  background: #fff5f5;
}
.tr-item.pending {
  color: #aaa;
}

.tr-icon {
  font-size: 12px;
  width: 14px;
  flex-shrink: 0;
}
.tr-item.pass .tr-icon {
  color: #16a34a;
}
.tr-item.fail .tr-icon {
  color: #dc2626;
}

.tr-name {
  flex: 1;
  font-size: 12px;
  line-height: 1.4;
}
.tr-dur {
  font-size: 11px;
  color: #bbb;
  flex-shrink: 0;
}

.tr-detail {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 16px;
  overflow-y: auto;
  gap: 10px;
}

.tr-detail-name {
  font-weight: 600;
  font-size: 13px;
  padding-bottom: 8px;
  border-bottom: 1px solid #eee;
}
.tr-detail-name.pass {
  color: #16a34a;
}
.tr-detail-name.fail {
  color: #dc2626;
}

.tr-error {
  background: #fff0f0;
  border: 1px solid #fecaca;
  border-radius: 6px;
  padding: 10px 12px;
  font-size: 12px;
  color: #991b1b;
  white-space: pre-wrap;
  word-break: break-word;
}

.tr-ok {
  color: #16a34a;
  font-size: 12px;
  padding: 10px 12px;
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: 6px;
}

.tr-detail-empty {
  color: #ccc;
  font-size: 12px;
  margin-top: 20px;
  text-align: center;
}

.tr-canvas-label {
  font-size: 11px;
  font-weight: 600;
  color: #aaa;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.tr-canvas-host {
  flex: 1;
  border: 1px solid #e8e8ec;
  border-radius: 6px;
  overflow: hidden;
  min-height: 200px;
  background: #fafafa;
}
</style>
