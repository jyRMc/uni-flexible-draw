<template>
  <div class="uni-draw" :style="cssVars">
    <!-- ── Body ─────────────────────────────────────────────── -->
    <div class="ud-body">

      <!-- Left panel -->
      <aside v-if="showShapePanel !== false" class="ud-left-panel">
        <div class="ud-panel-tabs">
          <button :class="['ud-tab', { active: leftTab === 'shapes' }]" @click="leftTab = 'shapes'">图形</button>
          <button
            v-if="showAssetsPanel !== false"
            :class="['ud-tab', { active: leftTab === 'assets' }]"
            @click="leftTab = 'assets'"
          >素材</button>
        </div>

        <!-- Shapes -->
        <ShapePanel
          v-show="leftTab === 'shapes'"
          :libraries="libraries"
          @select="onShapeAdd"
          @dragstart="onShapeDragStart"
        />

        <!-- External assets -->
        <div v-if="leftTab === 'assets'" class="ud-assets-panel">
          <div class="ud-assets-grid">
            <div
              v-for="asset in assets"
              :key="asset.id"
              class="ud-asset-cell"
              draggable="true"
              @click="onAssetAdd(asset)"
              @dragstart="onAssetDragStart($event, asset)"
            >
              <!-- eslint-disable-next-line vue/no-v-html -->
              <div v-if="asset.type === 'svg'" class="ud-asset-icon-wrap" v-html="asset.content" />
              <img v-else class="ud-asset-icon-image" :src="asset.content" :alt="asset.name" />
            </div>
            <div v-if="!assets || assets.length === 0" class="ud-assets-empty">暂无素材</div>
          </div>
          <div v-if="showAssetPagination" class="ud-assets-pagination">
            <button class="ud-assets-page-btn" :disabled="!canGoPrevAssets || assetPageLoading" @click="emit('assets:prev-page')">上一页</button>
            <span class="ud-assets-page-indicator">{{ assetPage }} / {{ assetTotalPages }}</span>
            <button class="ud-assets-page-btn" :disabled="!canGoNextAssets || assetPageLoading" @click="emit('assets:next-page')">下一页</button>
          </div>
        </div>
      </aside>

      <!-- Template modal -->
      <TemplatePanel
        :visible="templateOpen"
        :templates="templates"
        @apply="onTemplateApply"
        @close="templateOpen = false"
      />

      <!-- Canvas area -->
      <main class="ud-canvas-area">
        <FlexibleDraw
          ref="canvasRef"
          v-model="graphData"
          class="ud-canvas"
          :grid="grid !== false"
          :snapline="snapline !== false"
          :readonly="readonly"
          @selection:change="onSelectionChange"
          @dragover.prevent
          @drop.prevent="onExternalDrop"
        />

        <!-- Quick action bar -->
        <QuickActionBar
          v-if="(selectedNode || selectedEdge) && !qabClosed"
          :selected-node="selectedNode"
          :selected-edge="selectedEdge"
          :sketch-mode="sketchMode"
          :element-sketch-ids="elementSketchIds"
          @update-style="onUpdateStyle"
          @update-edge-style="onUpdateEdgeStyle"
          @change-edge-type="onChangeEdgeType"
          @resize="onResizeNode"
          @add-row="onAddTableRow"
          @add-column="onAddTableColumn"
          @delete-row="onDeleteTableRow"
          @delete-column="onDeleteTableColumn"
          @update-cell="onUpdateTableCell"
          @close="qabClosed = true"
          @toggle-sketch="onToggleSketch"
          @toggle-element-sketch="onToggleElementSketch"
        />

        <!-- Toolbar -->
        <Toolbar
          v-if="showToolbar !== false"
          :zoom="canvasRef?.zoom ?? 1"
          :can-undo="canvasRef?.canUndo ?? false"
          :can-redo="canvasRef?.canRedo ?? false"
          :pan-mode="canvasRef?.panMode ?? false"
          :sketch-mode="sketchMode"
          :draw-mode="drawMode"
          :selection-count="canvasRef?.selectionCount ?? 0"
          @action="onToolbarAction"
        />
      </main>
    </div>

    <!-- JSON preview modal -->
    <Teleport to="body">
      <div v-if="jsonModalOpen" class="ud-modal-backdrop" @click.self="jsonModalOpen = false">
        <div class="ud-modal">
          <div class="ud-modal-header">
            <span>JSON 预览</span>
            <div class="ud-modal-actions">
              <button class="ud-icon-btn" :title="copyDone ? '已复制' : '复制'" @click="copyJson">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
              </button>
              <button class="ud-icon-btn" title="下载" @click="downloadJson">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
                </svg>
              </button>
              <button class="ud-icon-btn" @click="jsonModalOpen = false">✕</button>
            </div>
          </div>
          <div class="ud-modal-body">
            <pre class="ud-json-pre">{{ jsonPreviewText }}</pre>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, provide, onMounted } from 'vue'
import type { GraphData, NodeData, AssetItem, TemplateItem, UniDrawTheme } from '@uni-draw/shared'
import { LOCALE_KEY } from '../../locale'
import zhCN from '../../locale/zh-CN'
import type { UniDrawLocale } from '../../locale'
import { registerAllShapes } from '../../shapes/register'
import { getAllLibraries } from '../../materials'
import FlexibleDraw from '../FlexibleDraw/FlexibleDraw.vue'
import ShapePanel from '../ShapePanel/ShapePanel.vue'
import Toolbar from '../Toolbar/Toolbar.vue'
import QuickActionBar from '../QuickActionBar/QuickActionBar.vue'
import TemplatePanel from '../TemplatePanel/TemplatePanel.vue'
import type { MaterialItem } from '@uni-draw/shared'

// ──────────────────────────────────────────────────────────────────────────────
// Props
// ──────────────────────────────────────────────────────────────────────────────

export interface UniDrawProps {
  modelValue?: GraphData
  assets?: AssetItem[]
  templates?: TemplateItem[]
  assetPage?: number
  assetTotalPages?: number
  assetPageLoading?: boolean
  canPrevAssets?: boolean
  canNextAssets?: boolean
  grid?: boolean
  snapline?: boolean
  readonly?: boolean
  showShapePanel?: boolean
  showAssetsPanel?: boolean
  showTemplates?: boolean
  showToolbar?: boolean
  showMinimap?: boolean
  locale?: UniDrawLocale
  theme?: UniDrawTheme
}

const props = withDefaults(defineProps<UniDrawProps>(), {
  assetPage: 1,
  assetTotalPages: 1,
  assetPageLoading: false,
  canPrevAssets: false,
  canNextAssets: false,
  grid: true,
  snapline: true,
  readonly: false,
  showShapePanel: true,
  showAssetsPanel: true,
  showTemplates: true,
  showToolbar: true,
  showMinimap: false,
})

// ──────────────────────────────────────────────────────────────────────────────
// Emits
// ──────────────────────────────────────────────────────────────────────────────

const emit = defineEmits<{
  (e: 'update:modelValue', data: GraphData): void
  (e: 'ready'): void
  (e: 'selection:change', nodes: NodeData[], edges: unknown[]): void
  (e: 'assets:prev-page'): void
  (e: 'assets:next-page'): void
}>()

// ──────────────────────────────────────────────────────────────────────────────
// Locale
// ──────────────────────────────────────────────────────────────────────────────

provide(LOCALE_KEY, props.locale ?? zhCN)

// ──────────────────────────────────────────────────────────────────────────────
// Theme → CSS vars
// ──────────────────────────────────────────────────────────────────────────────

const cssVars = computed(() => {
  const t = props.theme
  if (!t) return {}
  const map: Record<string, string> = {
    '--uni-draw-primary':          t.primaryColor ?? '',
    '--uni-draw-primary-bg':       t.primaryBg ?? '',
    '--uni-draw-primary-bg-light': t.primaryBgLight ?? '',
    '--uni-draw-canvas-bg':        t.canvasBg ?? '',
    '--uni-draw-panel-bg':         t.panelBg ?? '',
    '--uni-draw-panel-bg-alt':     t.panelBgAlt ?? '',
    '--uni-draw-panel-border':     t.borderColor ?? '',
    '--uni-draw-text':             t.textColor ?? '',
    '--uni-draw-text-secondary':   t.textSecondary ?? '',
    '--uni-draw-text-muted':       t.textMuted ?? '',
    '--uni-draw-hover-bg':         t.hoverBg ?? '',
    '--uni-draw-shadow-sm':        t.shadowSm ?? '',
    '--uni-draw-shadow-md':        t.shadowMd ?? '',
    '--uni-draw-radius-sm':        t.radiusSm ?? '',
    '--uni-draw-radius-md':        t.radiusMd ?? '',
    '--uni-draw-radius-lg':        t.radiusLg ?? '',
    '--uni-draw-panel-width':      t.panelWidth ?? '',
  }
  return Object.fromEntries(Object.entries(map).filter(([, v]) => v !== ''))
})

const showAssetPagination = computed(() => props.assetTotalPages > 1 || props.assetPageLoading)
const canGoPrevAssets = computed(() => props.canPrevAssets || props.assetPage > 1)
const canGoNextAssets = computed(() => props.canNextAssets || props.assetPage < props.assetTotalPages)

// ──────────────────────────────────────────────────────────────────────────────
// Graph data (v-model passthrough with internal default)
// ──────────────────────────────────────────────────────────────────────────────

const graphData = ref<GraphData>(
  props.modelValue ?? {
    canvas: { backgroundColor: '#ffffff', grid: { size: 10, visible: true, type: 'dot' }, zoom: 1 },
    nodes: [],
    edges: [],
  },
)

watch(() => props.modelValue, (val) => {
  if (val) graphData.value = val
})

watch(graphData, (val) => {
  emit('update:modelValue', val)
}, { deep: true })

// ──────────────────────────────────────────────────────────────────────────────
// Canvas ref + sub-state
// ──────────────────────────────────────────────────────────────────────────────

const canvasRef = ref<InstanceType<typeof FlexibleDraw> | null>(null)
const libraries = ref(getAllLibraries())
const leftTab = ref<'shapes' | 'assets'>('shapes')
const templateOpen = ref(false)
const sketchMode = ref(false)
const drawMode = ref(false)
const elementSketchIds = ref(new Set<string>())
const selectedNode = ref<NodeData | null>(null)
const selectedEdge = ref<{ id: string; shape: string; stroke: string; strokeWidth: number; strokeDasharray: string; lineType: string; label?: string; sourceMarker?: string; targetMarker?: string } | null>(null)
const qabClosed = ref(false)

// ──────────────────────────────────────────────────────────────────────────────
// JSON modal
// ──────────────────────────────────────────────────────────────────────────────

const jsonModalOpen = ref(false)
const jsonPreviewText = ref('')
const copyDone = ref(false)

// ──────────────────────────────────────────────────────────────────────────────
// Lifecycle
// ──────────────────────────────────────────────────────────────────────────────

onMounted(() => {
  registerAllShapes()
  emit('ready')
})

// ──────────────────────────────────────────────────────────────────────────────
// Shape / asset handlers
// ──────────────────────────────────────────────────────────────────────────────

function onShapeAdd(item: MaterialItem) {
  canvasRef.value?.createElementFromMaterial(item, { x: 200, y: 200 })
}

function onShapeDragStart(item: MaterialItem, event: DragEvent) {
  event.dataTransfer!.effectAllowed = 'copy'
  const payload = JSON.stringify(item)
  event.dataTransfer!.setData('application/json', payload)
  event.dataTransfer!.setData('text/plain', payload)
}

function onAssetAdd(asset: AssetItem) {
  const imageHref = asset.type === 'svg'
    ? `data:image/svg+xml;charset=utf-8,${encodeURIComponent(asset.content)}`
    : asset.content
  canvasRef.value?.createNodeFromMaterial({
    id: `asset-${asset.id}`,
    name: asset.name,
    shape: asset.type === 'svg' ? 'basic-svg' : 'basic-image',
    defaultSize: { width: 80, height: 80 },
    defaultLabel: asset.name,
    data: asset.type === 'svg'
      ? { imageHref, svgContent: asset.content }
      : { imageHref },
  }, { x: 200, y: 200 })
}

function onAssetDragStart(event: DragEvent, asset: AssetItem) {
  const imageHref = asset.type === 'svg'
    ? `data:image/svg+xml;charset=utf-8,${encodeURIComponent(asset.content)}`
    : asset.content
  const item: MaterialItem = {
    id: `asset-${asset.id}`,
    name: asset.name,
    shape: asset.type === 'svg' ? 'basic-svg' : 'basic-image',
    defaultSize: { width: 80, height: 80 },
    defaultLabel: asset.name,
    data: asset.type === 'svg'
      ? { imageHref, svgContent: asset.content }
      : { imageHref },
  }
  event.dataTransfer!.effectAllowed = 'copy'
  const payload = JSON.stringify(item)
  event.dataTransfer!.setData('application/json', payload)
  event.dataTransfer!.setData('text/plain', payload)
}

function onExternalDrop(event: DragEvent) {
  const data = event.dataTransfer?.getData('application/json') || event.dataTransfer?.getData('text/plain')
  if (!data) return
  try {
    const item: MaterialItem = JSON.parse(data)
    const pos = canvasRef.value?.screenToCanvas(event.clientX, event.clientY) ?? { x: event.clientX, y: event.clientY }
    canvasRef.value?.createElementFromMaterial(item, pos)
  } catch { /* ignore */ }
}

// ──────────────────────────────────────────────────────────────────────────────
// Template handler
// ──────────────────────────────────────────────────────────────────────────────

function onTemplateApply(tpl: TemplateItem) {
  canvasRef.value?.setData(tpl.data)
  templateOpen.value = false
}

// ──────────────────────────────────────────────────────────────────────────────
// Selection
// ──────────────────────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function onSelectionChange(nodes: NodeData[], edges: any[] = []) {
  selectedNode.value = nodes.length > 0 ? nodes[0] : null
  selectedEdge.value = edges.length > 0 ? edges[0] : null
  if (nodes.length > 0 || edges.length > 0) qabClosed.value = false
  emit('selection:change', nodes, edges)
}

watch(() => canvasRef.value?.selectedNodeData, (data) => {
  if (data) selectedNode.value = { ...data }
}, { deep: true })

watch(() => canvasRef.value?.selectedEdgeData, (data) => {
  selectedEdge.value = data ? { ...data } : null
  if (data) qabClosed.value = false
}, { deep: true })

watch(() => canvasRef.value?.sketchMode, (val) => {
  if (val !== undefined) sketchMode.value = val
})

watch(() => canvasRef.value?.sketchElementIds, (ids) => {
  if (ids) elementSketchIds.value = ids
}, { deep: true })

// ──────────────────────────────────────────────────────────────────────────────
// Style / edge updates
// ──────────────────────────────────────────────────────────────────────────────

function onUpdateStyle(id: string, style: Record<string, unknown>) {
  canvasRef.value?.updateNodeStyle(id, style)
}
function onUpdateEdgeStyle(id: string, style: Record<string, unknown>) {
  canvasRef.value?.updateEdgeStyle(id, style)
}
function onChangeEdgeType(id: string, lineType: string) {
  canvasRef.value?.changeEdgeType(id, lineType)
}
function onResizeNode(id: string, w: number, h: number) {
  canvasRef.value?.resizeNode(id, w, h)
}
function onAddTableRow(id: string) {
  canvasRef.value?.addTableRow(id)
}
function onAddTableColumn(id: string) {
  canvasRef.value?.addTableColumn(id)
}
function onDeleteTableRow(id: string) {
  canvasRef.value?.deleteTableRow(id)
}
function onDeleteTableColumn(id: string) {
  canvasRef.value?.deleteTableColumn(id)
}
function onUpdateTableCell(id: string, row: number, col: number, value: string) {
  canvasRef.value?.updateTableCell(id, row, col, value)
}
function onToggleSketch() {
  canvasRef.value?.toggleSketchMode()
}
function onToggleElementSketch(id: string) {
  canvasRef.value?.toggleElementSketch(id)
}

// ──────────────────────────────────────────────────────────────────────────────
// Toolbar
// ──────────────────────────────────────────────────────────────────────────────

function onToolbarAction(action: string) {
  const c = canvasRef.value
  if (!c) return
  switch (action) {
    case 'undo': c.undo(); break
    case 'redo': c.redo(); break
    case 'togglePan': c.togglePanMode(); break
    case 'zoomIn': c.zoomIn(); break
    case 'zoomOut': c.zoomOut(); break
    case 'zoomToFit': c.zoomToFit(); break
    case 'toggleSketch': c.toggleSketchMode(); break
    case 'toggleDraw': drawMode.value = c.toggleDrawMode(); break
    case 'clearCanvas': c.clearCanvas(); break
    case 'selectAll': c.selectAll(); break
    case 'export:json': onExportJSON(); break
    case 'export:png': onExportPNG(); break
    default:
      if (action.startsWith('align:')) c.alignNodes(action.slice(6))
  }
}

// ──────────────────────────────────────────────────────────────────────────────
// Export
// ──────────────────────────────────────────────────────────────────────────────

async function onExportPNG() {
  const url = await canvasRef.value?.toPNG()
  if (!url) return
  const a = document.createElement('a')
  a.href = url
  a.download = `${graphData.value.meta?.title ?? 'diagram'}.png`
  a.click()
}

function onExportJSON() {
  const raw = canvasRef.value?.toJSON() ?? '{}'
  try { jsonPreviewText.value = JSON.stringify(JSON.parse(raw), null, 2) }
  catch { jsonPreviewText.value = raw }
  copyDone.value = false
  jsonModalOpen.value = true
}

async function copyJson() {
  await navigator.clipboard.writeText(jsonPreviewText.value)
  copyDone.value = true
  setTimeout(() => { copyDone.value = false }, 2000)
}

function downloadJson() {
  const blob = new Blob([jsonPreviewText.value], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${graphData.value.meta?.title ?? 'diagram'}.json`
  a.click()
  URL.revokeObjectURL(url)
}


function openTemplatePanel() {
  if (props.showTemplates !== false) {
    templateOpen.value = true
  }
}

// ──────────────────────────────────────────────────────────────────────────────
// Expose
// ──────────────────────────────────────────────────────────────────────────────

defineExpose({
  openTemplatePanel,
  getData: () => canvasRef.value?.getData?.() ?? graphData.value,
  setData: (data: GraphData) => canvasRef.value?.setData(data),
  clear: () => canvasRef.value?.clearCanvas(),
  exportPNG: () => canvasRef.value?.toPNG(),
  exportJSON: () => canvasRef.value?.toJSON() ?? '{}',
  exportSVG: () => canvasRef.value?.toSVG?.(),
  undo: () => canvasRef.value?.undo(),
  redo: () => canvasRef.value?.redo(),
  zoomIn: () => canvasRef.value?.zoomIn(),
  zoomOut: () => canvasRef.value?.zoomOut(),
  zoomFit: () => canvasRef.value?.zoomToFit(),
  selectAll: () => canvasRef.value?.selectAll(),
  deleteSelection: () => canvasRef.value?.deleteSelected?.(),
})
</script>

<style scoped>
/* ── Root ─────────────────────────────────────────────────── */
.uni-draw {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  overflow: hidden;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  color: var(--uni-draw-text, #1a1a1a);
}

/* ── Body ─────────────────────────────────────────────────── */
.ud-body {
  display: flex;
  flex: 1;
  overflow: hidden;
  min-height: 0;
}

/* ── Left panel ───────────────────────────────────────────── */
.ud-left-panel {
  display: flex;
  flex-direction: column;
  width: var(--uni-draw-panel-width, 220px);
  flex-shrink: 0;
  background: var(--uni-draw-panel-bg-alt, #f5f5f5);
  border-right: 1px solid var(--uni-draw-panel-border, #e0e0e0);
  overflow: hidden;
}

.ud-panel-tabs {
  display: flex;
  border-bottom: 1px solid var(--uni-draw-panel-border, #e0e0e0);
  flex-shrink: 0;
}

.ud-tab {
  flex: 1;
  padding: 8px 0;
  font-size: 12px;
  font-weight: 500;
  color: var(--uni-draw-text-muted, #999);
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  cursor: pointer;
  transition: all .15s;
}
.ud-tab:hover { color: var(--uni-draw-primary, #7166F0); }
.ud-tab.active {
  color: var(--uni-draw-primary, #7166F0);
  border-bottom-color: var(--uni-draw-primary, #7166F0);
  background: var(--uni-draw-primary-bg-light, #f4f3fe);
}

/* ── Assets grid ──────────────────────────────────────────── */
.ud-assets-grid {
  flex: 1;
  overflow-y: auto;
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
  padding: 4px;
  align-content: start;
}

.ud-assets-panel {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.ud-asset-cell {
  display: flex;
  align-items: center;
  justify-content: center;
  aspect-ratio: 1 / 1;
  padding: 8px;
  border: 1px solid var(--uni-draw-panel-border, #e0e0e0);
  border-radius: var(--uni-draw-radius-sm, 4px);
  background: var(--uni-draw-panel-bg, #fff);
  cursor: pointer;
  transition: border-color .15s, box-shadow .15s, background .15s;
  overflow: hidden;
}
.ud-asset-cell:hover,
.ud-asset-cell:focus-visible {
  border-color: var(--uni-draw-primary, #7166F0);
  box-shadow: 0 0 0 3px rgba(113, 102, 240, 0.14);
  background: var(--uni-draw-primary-bg-light, #f4f3fe);
  outline: none;
}

.ud-asset-icon-wrap,
.ud-asset-icon-image {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  min-width: 0;
  min-height: 0;
  overflow: hidden;
  border-radius: var(--uni-draw-radius-sm, 4px);
  background: var(--uni-draw-panel-bg, #fff);
}

.ud-asset-icon-image {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: contain;
  pointer-events: none;
}

.ud-asset-icon-wrap :deep(svg) {
  display: block;
  width: 100%;
  height: 100%;
  max-width: 100%;
  max-height: 100%;
  overflow: hidden;
  pointer-events: none;
}

.ud-assets-empty {
  grid-column: 1 / -1;
  padding: 32px 16px;
  text-align: center;
  color: var(--uni-draw-text-muted, #999);
  font-size: 13px;
}

.ud-assets-pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 8px 4px 4px;
  border-top: 1px solid var(--uni-draw-panel-border, #e5e7eb);
}

.ud-assets-page-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 28px;
  padding: 0 10px;
  border: 1px solid var(--uni-draw-panel-border, #d9d9d9);
  border-radius: 6px;
  background: var(--uni-draw-panel-bg, #fff);
  color: var(--uni-draw-text-secondary, #555);
  cursor: pointer;
  font-size: 12px;
  transition: border-color .15s, color .15s, opacity .15s;
}

.ud-assets-page-btn:hover:not(:disabled) {
  border-color: var(--uni-draw-primary, #7166F0);
  color: var(--uni-draw-primary, #7166F0);
}

.ud-assets-page-btn:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.ud-assets-page-indicator {
  flex: 1;
  min-width: 0;
  text-align: center;
  font-size: 12px;
  color: var(--uni-draw-text-secondary, #666);
}

/* ── Canvas ───────────────────────────────────────────────── */
.ud-canvas-area {
  flex: 1;
  position: relative;
  overflow: hidden;
  min-width: 0;
}

.ud-canvas { width: 100%; height: 100%; }

/* ── JSON modal ───────────────────────────────────────────── */
.ud-modal-backdrop {
  position: fixed; inset: 0; background: rgba(0,0,0,.4);
  display: flex; align-items: center; justify-content: center; z-index: 1000;
}
.ud-modal {
  background: var(--uni-draw-panel-bg, #fff);
  border-radius: var(--uni-draw-radius-md, 8px);
  box-shadow: var(--uni-draw-shadow-md, 0 4px 12px rgba(0,0,0,.12));
  width: 620px; max-width: 90vw; max-height: 80vh;
  display: flex; flex-direction: column; overflow: hidden;
}
.ud-modal-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 12px 16px; border-bottom: 1px solid var(--uni-draw-panel-border, #e0e0e0);
  font-size: 14px; font-weight: 600; flex-shrink: 0;
}
.ud-modal-actions { display: flex; gap: 4px; }
.ud-icon-btn {
  display: flex; align-items: center; justify-content: center;
  width: 28px; height: 28px; border: none; border-radius: var(--uni-draw-radius-sm, 4px);
  background: none; cursor: pointer; color: var(--uni-draw-text-muted, #999); transition: all .15s; font-size: 14px;
}
.ud-icon-btn:hover { background: var(--uni-draw-hover-bg, #f0f0f0); color: var(--uni-draw-text, #1a1a1a); }
.ud-modal-body { flex: 1; overflow: auto; padding: 16px; }
.ud-json-pre {
  margin: 0; font-size: 12px; line-height: 1.6; white-space: pre-wrap; word-break: break-all;
  color: var(--uni-draw-text, #1a1a1a); font-family: 'Consolas', 'Monaco', monospace;
}
</style>
