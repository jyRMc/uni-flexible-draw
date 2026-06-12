<script setup lang="ts">
import { computed, nextTick, onUnmounted, ref, toRef, watch } from 'vue'
import type { CanvasConfig, EdgeData, GraphData, NodeData } from '@uni-draw/shared'
import { useLocale } from '../../locale'
import { useCanvas } from '../../composables/useCanvas'
import ContextMenu from '../ContextMenu/ContextMenu.vue'
import ColorPicker from '../ColorPicker/ColorPicker.vue'
import MiniMap from '../MiniMap/MiniMap.vue'

export interface FlexibleDrawProps {
  modelValue: GraphData
  /** 画布初始配置（背景色、网格等） */
  canvasConfig?: CanvasConfig
  /** 注册的图形类型列表（shape ID 白名单） */
  shapes?: string[]
  /** 只读模式 */
  readonly?: boolean
  /** 是否显示 minimap */
  minimap?: boolean
  /** 网格配置 */
  grid?: boolean
  /** 对齐线 */
  snapline?: boolean
  /** 快捷键启用 */
  keyboard?: boolean
  /** 选中状态防抖（ms） */
  selectionDebounce?: number
}

const props = withDefaults(defineProps<FlexibleDrawProps>(), {
  readonly: false,
  minimap: false,
  grid: true,
  snapline: true,
  keyboard: true,
})

const emit = defineEmits<{
  (e: 'update:modelValue', data: GraphData): void
  (e: 'change', data: GraphData): void
  (e: 'node:click', node: NodeData, event: MouseEvent): void
  (e: 'node:dblclick', node: NodeData, event: MouseEvent): void
  (e: 'edge:click', edge: EdgeData, event: MouseEvent): void
  (e: 'blank:click', event: MouseEvent): void
  (e: 'selection:change', nodes: NodeData[], edges: EdgeData[]): void
  (e: 'history:change', canUndo: boolean, canRedo: boolean): void
  (e: 'add-to-materials', nodeData: NodeData): void
}>()

const t = useLocale()

const modelValueRef = toRef(props, 'modelValue')

const canvas = useCanvas({
  modelValue: modelValueRef,
  readonly: props.readonly,
  minimap: props.minimap,
  grid: props.grid,
  snapline: props.snapline,
  keyboard: props.keyboard,
  onDataChange: (data) => {
    emit('update:modelValue', data)
    emit('change', data)
  },
})

// ==================== SVG 编辑器状态 ====================

const svgEditorContent = computed({
  get: () => canvas.svgEditState.value?.content ?? '',
  set: (v: string) => {
    if (canvas.svgEditState.value)
      canvas.svgEditState.value.content = v
  },
})

const {
  containerRef,
  zoom,
  canUndo,
  canRedo,
  panMode,
  drawMode,
  drawBrushStyle,
  sketchMode: canvasSketchMode,
  selectionCount,
  sketchElementIds,
  selectedNodeData,
  selectedEdgeData,
  contextMenuState,
} = canvas

const minimapRef = ref<InstanceType<typeof MiniMap> | null>(null)

watch(() => props.minimap, async (enabled) => {
  await nextTick()
  if (enabled && minimapRef.value?.minimapRef) {
    canvas.enableMinimap(minimapRef.value.minimapRef)
  }
  else {
    canvas.disableMinimap()
  }
}, { immediate: true })

// ==================== 手绘覆盖层 ====================

const drawCanvasRef = ref<HTMLCanvasElement | null>(null)
let isDrawing = false
let drawPoints: { x: number, y: number }[] = []
let drawCtx: CanvasRenderingContext2D | null = null

function syncDrawCanvasSize() {
  const el = drawCanvasRef.value
  const wrapper = el?.parentElement
  if (!el || !wrapper)
    return
  el.width = wrapper.clientWidth
  el.height = wrapper.clientHeight
}

function onDrawStart(e: MouseEvent) {
  const el = drawCanvasRef.value
  if (!el)
    return
  syncDrawCanvasSize()
  drawCtx = el.getContext('2d')
  if (!drawCtx)
    return
  isDrawing = true
  drawPoints = []
  const rect = el.getBoundingClientRect()
  // drawPoints stores client coords for screenToCanvas conversion
  drawPoints.push({ x: e.clientX, y: e.clientY })
  // canvas overlay uses element-relative coords for drawing
  const ox = e.clientX - rect.left
  const oy = e.clientY - rect.top
  drawCtx.clearRect(0, 0, el.width, el.height)
  drawCtx.beginPath()
  drawCtx.strokeStyle = drawBrushStyle.value.stroke
  drawCtx.lineWidth = drawBrushStyle.value.strokeWidth
  drawCtx.lineCap = 'round'
  drawCtx.lineJoin = 'round'
  drawCtx.globalAlpha = drawBrushStyle.value.opacity
  drawCtx.setLineDash(parseStrokeDash(drawBrushStyle.value.strokeDasharray))
  drawCtx.moveTo(ox, oy)
}

function onDrawMove(e: MouseEvent) {
  if (!isDrawing || !drawCtx || !drawCanvasRef.value)
    return
  const rect = drawCanvasRef.value.getBoundingClientRect()
  drawPoints.push({ x: e.clientX, y: e.clientY })
  drawCtx.lineTo(e.clientX - rect.left, e.clientY - rect.top)
  drawCtx.stroke()
}

function onDrawEnd() {
  if (!isDrawing)
    return
  isDrawing = false
  const el = drawCanvasRef.value
  if (!el || drawPoints.length < 2) {
    drawCtx?.clearRect(0, 0, el?.width ?? 0, el?.height ?? 0)
    drawPoints = []
    return
  }
  // 将屏幕坐标转换为画布坐标
  const canvasPoints = drawPoints.map(p => canvas.screenToCanvas(p.x, p.y))
  const xs = canvasPoints.map(p => p.x)
  const ys = canvasPoints.map(p => p.y)
  const pad = 4
  const minX = Math.min(...xs) - pad
  const minY = Math.min(...ys) - pad
  const w = Math.max(...xs) - minX + pad
  const h = Math.max(...ys) - minY + pad
  // 构建局部坐标路径
  const d = canvasPoints
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${(p.x - minX).toFixed(1)} ${(p.y - minY).toFixed(1)}`)
    .join(' ')
  canvas.addPathNode(minX, minY, Math.max(w, 4), Math.max(h, 4), d)
  drawCtx?.clearRect(0, 0, el.width, el.height)
  drawPoints = []
}

function parseStrokeDash(value: string): number[] {
  return value
    .split(/\s+/)
    .map(v => Number(v.trim()))
    .filter(v => !Number.isNaN(v) && v > 0)
}

function onDrawBrushColor(value: string) {
  canvas.updateDrawBrushStyle({ stroke: value })
}

function setDrawStrokeDash(value: string) {
  canvas.updateDrawBrushStyle({ strokeDasharray: value })
}

function onDrawBrushWidth(ev: Event) {
  canvas.updateDrawBrushStyle({ strokeWidth: Number((ev.target as HTMLInputElement).value) })
}

function onDrawBrushOpacity(ev: Event) {
  canvas.updateDrawBrushStyle({ opacity: Number((ev.target as HTMLInputElement).value) })
}

onUnmounted(() => {
  if (drawMode.value)
    canvas.toggleDrawMode()
})

// 暴露 screenToCanvas 供父组件拖拽使用
function screenToCanvas(clientX: number, clientY: number): { x: number, y: number } {
  return canvas.screenToCanvas(clientX, clientY)
}

// 暴露 updateNodeStyle
function updateNodeStyle(id: string, style: Record<string, unknown>): void {
  canvas.updateNodeStyle(id, style)
}

function updateEdgeStyle(id: string, style: Record<string, unknown>): void {
  canvas.updateEdgeStyle(id, style)
}

function changeEdgeType(id: string, lineType: string): void {
  canvas.changeEdgeType(id, lineType)
}

function toggleSketchMode(): boolean | undefined {
  return canvas.toggleSketchMode()
}

function alignNodes(direction: string): void {
  canvas.alignNodes(direction)
}

function selectAll(): void {
  canvas.selectAll()
}

// ==================== 外部文件投放 ====================

function readAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader()
    r.onload = () => resolve(r.result as string)
    r.onerror = reject
    r.readAsText(file)
  })
}

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader()
    r.onload = () => resolve(r.result as string)
    r.onerror = reject
    r.readAsDataURL(file)
  })
}

function parseSvgSize(svg: string): { width: number, height: number } {
  const doc = new DOMParser().parseFromString(svg, 'image/svg+xml')
  const el = doc.querySelector('svg')
  const MAX = 400
  const raw = (attr: string) => Number.parseFloat(el?.getAttribute(attr) ?? '0')
  let w = raw('width'); let h = raw('height')
  if (!(w > 0 && h > 0)) {
    const vb = el?.getAttribute('viewBox')?.split(/[\s,]+/).map(Number) ?? []
    if (vb.length >= 4) { w = vb[2]; h = vb[3] }
  }
  if (!(w > 0 && h > 0))
    return { width: 200, height: 200 }
  const s = Math.min(1, MAX / Math.max(w, h))
  return { width: Math.round(w * s), height: Math.round(h * s) }
}

function getImgSize(url: string): Promise<{ width: number, height: number }> {
  return new Promise((resolve) => {
    const img = new Image()
    const MAX = 400
    img.onload = () => {
      const s = Math.min(1, MAX / Math.max(img.naturalWidth, img.naturalHeight, 1))
      resolve({ width: Math.round(img.naturalWidth * s), height: Math.round(img.naturalHeight * s) })
    }
    img.onerror = () => resolve({ width: 200, height: 200 })
    img.src = url
  })
}

async function onExternalDrop(e: DragEvent) {
  const pos = canvas.screenToCanvas(e.clientX, e.clientY)

  // 优先处理来自 ShapePanel 的素材拖放
  const jsonData = e.dataTransfer?.getData('application/json') || e.dataTransfer?.getData('text/plain')
  if (jsonData) {
    try {
      const item = JSON.parse(jsonData)
      canvas.createElementFromMaterial(item, pos)
    }
    catch { /* ignore malformed JSON */ }
    return
  }

  // 处理外部文件拖放（SVG / 图片）
  const files = Array.from(e.dataTransfer?.files ?? [])
  if (!files.length)
    return
  let ox = 0
  for (const file of files) {
    const filePos = canvas.screenToCanvas(e.clientX + ox, e.clientY)
    if (file.type === 'image/svg+xml' || file.name.toLowerCase().endsWith('.svg')) {
      const text = await readAsText(file)
      const { width, height } = parseSvgSize(text)
      canvas.addExternalSvg(text, filePos, width, height)
    }
    else if (file.type.startsWith('image/')) {
      const url = await readAsDataUrl(file)
      const { width, height } = await getImgSize(url)
      canvas.addExternalImage(url, filePos, width, height)
    }
    ox += 220
  }
}

// ==================== SVG 编辑器操作 ====================

function onSvgApply() {
  canvas.commitSvgEdit(svgEditorContent.value)
}

function onContextAction(action: string) {
  if (action === 'addToMaterials') {
    if (selectedNodeData.value) {
      emit('add-to-materials', selectedNodeData.value)
    }
    canvas.hideContextMenu()
    return
  }
  canvas.handleContextAction(action)
}

// 监听历史变化向外 emit
watch(canUndo, () => emit('history:change', canUndo.value, canRedo.value))
watch(canRedo, () => emit('history:change', canUndo.value, canRedo.value))

// 监听选中变化向外 emit（合并两个 ref，一次性 emit 最终状态，避免过渡态二次触发）
watch([selectedNodeData, selectedEdgeData], ([nodeData, edgeData]) => {
  emit('selection:change', nodeData ? [nodeData] : [], edgeData ? [edgeData as any] : [])
})

defineExpose({
  clearCanvas: canvas.clearCanvas,
  toggleDrawMode: canvas.toggleDrawMode,
  addPathNode: canvas.addPathNode,
  getData: canvas.getData,
  setData: canvas.setData,
  toJSON: canvas.toJSON,
  fromJSON: canvas.fromJSON,
  toPNG: canvas.toPNG,
  exportPreviewImage: canvas.exportPreviewImage,
  toSVG: canvas.toSVG,
  zoomIn: canvas.zoomIn,
  zoomOut: canvas.zoomOut,
  zoomTo: canvas.zoomTo,
  zoomToFit: canvas.zoomToFit,
  undo: canvas.undo,
  redo: canvas.redo,
  addNode: canvas.addNode,
  addEdge: canvas.addEdge,
  removeNode: canvas.removeNode,
  removeEdge: canvas.removeEdge,
  togglePanMode: canvas.togglePanMode,
  createNodeFromMaterial: canvas.createNodeFromMaterial,
  createElementFromMaterial: canvas.createElementFromMaterial,
  screenToCanvas,
  updateNodeStyle,
  updateEdgeStyle,
  changeEdgeType,
  toggleSketchMode,
  alignNodes,
  selectAll,
  toggleElementSketch: canvas.toggleElementSketch,
  isElementSketch: canvas.isElementSketch,
  resizeNode: canvas.resizeNode,
  addTableRow: canvas.addTableRow,
  addTableColumn: canvas.addTableColumn,
  deleteTableRow: canvas.deleteTableRow,
  deleteTableColumn: canvas.deleteTableColumn,
  updateTableCell: canvas.updateTableCell,
  copy: canvas.copy,
  cut: canvas.cut,
  paste: canvas.paste,
  duplicate: canvas.duplicate,
  deleteSelected: canvas.deleteSelected,
  moveUp: canvas.moveUp,
  moveDown: canvas.moveDown,
  toFront: canvas.toFront,
  toBack: canvas.toBack,
  flipH: canvas.flipH,
  flipV: canvas.flipV,
  toggleLock: canvas.toggleLock,
  groupNodes: canvas.groupNodes,
  ungroupNodes: canvas.ungroupNodes,
  canGroup: canvas.canGroup,
  canUngroup: canvas.canUngroup,
  createFrame: canvas.createFrame,
  copyAsPng: canvas.copyAsPng,
  copyAsSvg: canvas.copyAsSvg,
  addExternalImage: canvas.addExternalImage,
  addExternalSvg: canvas.addExternalSvg,
  addLink: canvas.addLink,
  zoom,
  canUndo,
  canRedo,
  panMode,
  drawBrushStyle,
  sketchMode: canvasSketchMode,
  selectionCount,
  sketchElementIds,
  selectedNodeData,
  selectedEdgeData,
})
</script>

<template>
  <div class="flexible-draw-wrapper">
    <div
      ref="containerRef"
      class="flexible-draw"
      @dragover.prevent
      @drop.prevent="onExternalDrop"
    />
    <div v-if="drawMode" class="draw-brush-panel">
      <div class="draw-brush-title">
        {{ t.drawPanel.title }}
      </div>
      <div class="draw-brush-row">
        <label>{{ t.drawPanel.color }}</label>
        <ColorPicker :model-value="drawBrushStyle.stroke" @update:model-value="onDrawBrushColor" />
      </div>
      <div class="draw-brush-row">
        <label>{{ t.drawPanel.style }}</label>
        <div class="draw-brush-dash-list">
          <button class="draw-brush-dash-btn" :class="{ active: drawBrushStyle.strokeDasharray === '' }" @click="setDrawStrokeDash('')">
            <svg width="24" height="10" viewBox="0 0 24 10"><line x1="2" y1="5" x2="22" y2="5" stroke="currentColor" stroke-width="2" stroke-linecap="round" /></svg>
          </button>
          <button class="draw-brush-dash-btn" :class="{ active: drawBrushStyle.strokeDasharray === '5 5' }" @click="setDrawStrokeDash('5 5')">
            <svg width="24" height="10" viewBox="0 0 24 10"><line x1="2" y1="5" x2="22" y2="5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-dasharray="5 3" /></svg>
          </button>
          <button class="draw-brush-dash-btn" :class="{ active: drawBrushStyle.strokeDasharray === '2 4' }" @click="setDrawStrokeDash('2 4')">
            <svg width="24" height="10" viewBox="0 0 24 10"><line x1="2" y1="5" x2="22" y2="5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-dasharray="2 3" /></svg>
          </button>
        </div>
      </div>
      <div class="draw-brush-row">
        <label>{{ t.drawPanel.width }}</label>
        <input type="range" :value="drawBrushStyle.strokeWidth" min="1" max="12" step="0.5" @input="onDrawBrushWidth">
        <span>{{ drawBrushStyle.strokeWidth }}</span>
      </div>
      <div class="draw-brush-row">
        <label>{{ t.drawPanel.opacity }}</label>
        <input type="range" :value="drawBrushStyle.opacity" min="0.05" max="1" step="0.05" @input="onDrawBrushOpacity">
        <span>{{ Math.round(drawBrushStyle.opacity * 100) }}%</span>
      </div>
    </div>
    <!-- 手绘覆盖层 -->
    <canvas
      v-if="drawMode"
      ref="drawCanvasRef"
      class="draw-overlay"
      @mousedown="onDrawStart"
      @mousemove="onDrawMove"
      @mouseup="onDrawEnd"
      @mouseleave="onDrawEnd"
    />
    <MiniMap
      v-if="minimap"
      ref="minimapRef"
      class="mini-map-overlay"
    />
  </div>
  <ContextMenu
    :visible="contextMenuState.visible"
    :x="contextMenuState.x"
    :y="contextMenuState.y"
    :has-selection="contextMenuState.hasSelection"
    :can-paste="contextMenuState.canPaste"
    :node-selection-count="contextMenuState.nodeSelectionCount"
    :edge-selection-count="contextMenuState.edgeSelectionCount"
    :has-single-node-selection="contextMenuState.hasSingleNodeSelection"
    :all-selected-locked="contextMenuState.allSelectedLocked"
    :can-group="contextMenuState.canGroup"
    :can-ungroup="contextMenuState.canUngroup"
    @action="onContextAction"
    @close="canvas.hideContextMenu"
  />
  <!-- SVG 代码编辑器对话框 -->
  <Teleport to="body">
    <div v-if="canvas.svgEditState.value" class="svg-editor-mask" @click.self="canvas.closeSvgEditor">
      <div class="svg-editor-dialog">
        <div class="svg-editor-header">
          <span class="svg-editor-title">{{ t.svgEditor.title }}</span>
          <button class="svg-editor-close" @click="canvas.closeSvgEditor">
            ✕
          </button>
        </div>
        <div class="svg-editor-body">
          <textarea
            v-model="svgEditorContent"
            class="svg-editor-textarea"
            spellcheck="false"
            :placeholder="t.svgEditor.placeholder"
          />
          <div class="svg-editor-preview">
            <div class="svg-preview-label">
              {{ t.svgEditor.preview }}
            </div>
            <!-- eslint-disable-next-line vue/no-v-html -->
            <div class="svg-preview-box" v-html="svgEditorContent" />
          </div>
        </div>
        <div class="svg-editor-footer">
          <button class="svg-editor-btn svg-editor-cancel" @click="canvas.closeSvgEditor">
            {{ t.svgEditor.cancel }}
          </button>
          <button class="svg-editor-btn svg-editor-apply" @click="onSvgApply">
            {{ t.svgEditor.apply }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.flexible-draw-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
}

.flexible-draw {
  position: relative;
  overflow: hidden;
  width: 100%;
  height: 100%;
}

.draw-overlay {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  cursor: crosshair;
  z-index: 10;
}

.draw-brush-panel {
  position: absolute;
  top: 16px;
  right: 16px;
  z-index: 12;
  width: 228px;
  padding: 12px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.96);
  border: 1px solid rgba(113, 102, 240, 0.12);
  box-shadow: 0 10px 28px rgba(18, 22, 33, 0.12);
  backdrop-filter: blur(10px);
}

.draw-brush-title {
  margin-bottom: 10px;
  font-size: 12px;
  font-weight: 600;
  color: #555;
}

.draw-brush-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
}

.draw-brush-row:last-child {
  margin-bottom: 0;
}

.draw-brush-row label {
  width: 34px;
  flex-shrink: 0;
  font-size: 12px;
  color: #777;
}

.draw-brush-row input[type='range'] {
  flex: 1;
  min-width: 0;
}

.draw-brush-row span {
  min-width: 38px;
  text-align: right;
  font-size: 11px;
  color: #666;
}

.draw-brush-dash-list {
  display: flex;
  gap: 6px;
}

.draw-brush-dash-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 28px;
  border: 1px solid #d9d9e6;
  border-radius: 8px;
  background: #fff;
  color: #555;
  cursor: pointer;
  transition: all 0.15s ease;
}

.draw-brush-dash-btn:hover {
  border-color: var(--uni-draw-primary);
  color: var(--uni-draw-primary);
}

.draw-brush-dash-btn.active {
  border-color: var(--uni-draw-primary);
  background: var(--uni-draw-primary-bg);
  color: var(--uni-draw-primary);
}

.mini-map-overlay {
  position: absolute;
  right: 16px;
  bottom: 16px;
  z-index: 15;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  background: #fff;
}
</style>

<style>
/* SVG 编辑器（全局，Teleport 到 body） */
.svg-editor-mask {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.svg-editor-dialog {
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 8px 40px rgba(0, 0, 0, 0.22);
  width: 840px;
  max-width: 95vw;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.svg-editor-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 20px;
  border-bottom: 1px solid #eee;
  flex-shrink: 0;
}

.svg-editor-title {
  font-size: 15px;
  font-weight: 600;
  color: #222;
}

.svg-editor-close {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 16px;
  color: #888;
  padding: 2px 6px;
  border-radius: 4px;
  line-height: 1;
}

.svg-editor-close:hover {
  background: #f0f0f0;
  color: #333;
}

.svg-editor-body {
  display: flex;
  flex: 1;
  min-height: 0;
  gap: 0;
}

.svg-editor-textarea {
  flex: 1;
  min-width: 0;
  padding: 14px;
  font-family: 'Menlo', 'Monaco', 'Consolas', monospace;
  font-size: 12px;
  line-height: 1.6;
  border: none;
  border-right: 1px solid #eee;
  outline: none;
  resize: none;
  background: #fafafa;
  color: #333;
}

.svg-editor-preview {
  width: 300px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.svg-preview-label {
  padding: 8px 14px;
  font-size: 11px;
  color: #aaa;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  border-bottom: 1px solid #eee;
  flex-shrink: 0;
}

.svg-preview-box {
  flex: 1;
  overflow: auto;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  background: #f8f8f8;
}

.svg-preview-box svg {
  max-width: 100%;
  max-height: 100%;
}

.svg-editor-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 12px 20px;
  border-top: 1px solid #eee;
  flex-shrink: 0;
}

.svg-editor-btn {
  padding: 7px 20px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  border: 1px solid transparent;
  transition: opacity 0.15s;
}

.svg-editor-btn:hover {
  opacity: 0.85;
}

.svg-editor-cancel {
  background: #f5f5f5;
  color: #555;
  border-color: #ddd;
}

.svg-editor-apply {
  background: #7166f0;
  color: #fff;
}
</style>
