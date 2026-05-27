<template>
  <div class="quick-action-card">
    <div class="qac-header">
      <span class="qac-title">{{ isEdge ? t.quickAction.edgeProps : t.quickAction.nodeProps }}</span>
      <button class="qac-close" :title="t.quickAction.close" @click="$emit('close')">
        <XIcon :size="14" />
      </button>
    </div>
    <div class="qac-body">
      <!-- ===== 节点属性 ===== -->
      <template v-if="!isEdge">
        <div class="qab-section">
          <div class="qab-section-title">{{ t.quickAction.size }}</div>
          <div class="qab-row">
            <label>{{ t.quickAction.width }}</label>
            <input type="number" :value="currentSize.width" min="20" step="10" @input="onResize('width', $event)">
          </div>
          <div class="qab-row">
            <label>{{ t.quickAction.height }}</label>
            <input type="number" :value="currentSize.height" min="20" step="10" @input="onResize('height', $event)">
          </div>
        </div>

        <div class="qab-divider" />

        <div class="qab-section">
          <div class="qab-section-title">{{ t.quickAction.border }}</div>
          <div class="qab-row">
            <label>{{ t.quickAction.style }}</label>
            <div class="qab-icon-row">
              <button class="qab-icon-btn" :class="{active: currentStrokeDash === ''}" :title="t.quickAction.solidLine" @click="setStrokeDash('')">
                <svg width="22" height="10" viewBox="0 0 22 10"><line x1="1" y1="5" x2="21" y2="5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
              </button>
              <button class="qab-icon-btn" :class="{active: currentStrokeDash === '5 5'}" :title="t.quickAction.dashedLine" @click="setStrokeDash('5 5')">
                <svg width="22" height="10" viewBox="0 0 22 10"><line x1="1" y1="5" x2="21" y2="5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-dasharray="5 3"/></svg>
              </button>
              <button class="qab-icon-btn" :class="{active: currentStrokeDash === '2 4'}" :title="t.quickAction.dottedLine" @click="setStrokeDash('2 4')">
                <svg width="22" height="10" viewBox="0 0 22 10"><line x1="1" y1="5" x2="21" y2="5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-dasharray="2 3"/></svg>
              </button>
            </div>
          </div>
          <div class="qab-row">
            <label>{{ t.quickAction.color }}</label>
            <ColorPicker :model-value="currentStroke" @update:model-value="onColorChange('stroke', $event)" />
          </div>
          <div class="qab-row">
            <label>{{ t.quickAction.lineWidth }}</label>
            <input type="range" :value="currentStrokeWidth" min="0" max="8" step="0.5" @input="onRange('strokeWidth', $event)">
            <span class="qab-val">{{ currentStrokeWidth }}</span>
          </div>
          <div v-if="rxSupported" class="qab-row">
            <label>{{ t.quickAction.radius }}</label>
            <input type="range" :value="currentRx" min="0" max="50" step="1" @input="onRange('rx', $event)">
            <span class="qab-val">{{ currentRx }}</span>
          </div>
        </div>

        <div class="qab-divider" />

        <div class="qab-section">
          <div class="qab-section-title">{{ t.quickAction.fill }}</div>
          <div class="qab-row">
            <label>{{ t.quickAction.color }}</label>
            <ColorPicker :model-value="currentFill" @update:model-value="onColorChange('fill', $event)" />
          </div>
        </div>

        <div class="qab-divider" />

        <div class="qab-section">
          <div class="qab-section-title">{{ t.quickAction.opacity }}</div>
          <div class="qab-row">
            <label>{{ t.quickAction.transparent }}</label>
            <input type="range" :value="currentOpacity" min="0" max="1" step="0.05" @input="onRange('opacity', $event)">
            <span class="qab-val">{{ Math.round(currentOpacity * 100) }}%</span>
          </div>
        </div>

        <div class="qab-divider" />

        <div class="qab-section">
          <div class="qab-section-title">{{ t.quickAction.label }}</div>
          <div class="qab-row">
            <label>{{ t.quickAction.text }}</label>
            <input type="text" :value="currentLabel" :placeholder="t.quickAction.inputLabelPlaceholder" @input="onNodeLabel($event)">
          </div>
        </div>

        <div class="qab-divider" />

        <div class="qab-section">
          <div class="qab-section-title">{{ t.quickAction.text }}</div>
          <div class="qab-row">
            <label>{{ t.quickAction.position }}</label>
            <div class="qab-icon-row">
              <button class="qab-icon-btn" :class="{active: currentLabelPos === 'center'}" :title="t.quickAction.labelCenter" @click="setLabelPos('center')"><AlignCenterIcon :size="13"/></button>
              <button class="qab-icon-btn" :class="{active: currentLabelPos === 'top'}" :title="t.quickAction.labelTop" @click="setLabelPos('top')"><AlignTopIcon :size="13"/></button>
              <button class="qab-icon-btn" :class="{active: currentLabelPos === 'bottom'}" :title="t.quickAction.labelBottom" @click="setLabelPos('bottom')"><AlignBottomIcon :size="13"/></button>
              <button class="qab-icon-btn" :class="{active: currentLabelPos === 'left'}" :title="t.quickAction.labelLeft" @click="setLabelPos('left')"><AlignLeftIcon :size="13"/></button>
              <button class="qab-icon-btn" :class="{active: currentLabelPos === 'right'}" :title="t.quickAction.labelRight" @click="setLabelPos('right')"><AlignRightIcon :size="13"/></button>
            </div>
          </div>
          <div class="qab-row">
            <label>{{ t.quickAction.fontSize }}</label>
            <input type="range" :value="currentFontSize" min="8" max="36" step="1" @input="onRange('fontSize', $event)">
            <span class="qab-val">{{ currentFontSize }}</span>
          </div>
        </div>
      </template>

      <!-- ===== 边属性 ===== -->
      <template v-else>
        <div class="qab-section">
          <div class="qab-section-title">{{ t.quickAction.lineType }}</div>
          <div class="qab-row">
            <label>{{ t.quickAction.type }}</label>
            <div class="qab-icon-row">
              <button class="qab-icon-btn qab-chip" :class="{active: edgeLineType === 'straight'}" :title="t.quickAction.straight" @click="setEdgeLineType('straight')">{{ t.quickAction.straight }}</button>
              <button class="qab-icon-btn qab-chip" :class="{active: edgeLineType === 'curve'}" :title="t.quickAction.curve" @click="setEdgeLineType('curve')">{{ t.quickAction.curve }}</button>
              <button class="qab-icon-btn qab-chip" :class="{active: edgeLineType === 'rounded'}" :title="t.quickAction.rounded" @click="setEdgeLineType('rounded')">{{ t.quickAction.rounded }}</button>
              <button class="qab-icon-btn qab-chip" :class="{active: edgeLineType === 'orthogonal'}" :title="t.quickAction.orthogonal" @click="setEdgeLineType('orthogonal')">{{ t.quickAction.orthogonal }}</button>
              <button class="qab-icon-btn qab-chip" :class="{active: edgeLineType === 'manhattan'}" :title="t.quickAction.manhattan" @click="setEdgeLineType('manhattan')">{{ t.quickAction.manhattan }}</button>
              <button class="qab-icon-btn qab-chip" :class="{active: edgeLineType === 'jumpover'}" :title="t.quickAction.jumpover" @click="setEdgeLineType('jumpover')">{{ t.quickAction.jumpover }}</button>
            </div>
          </div>
        </div>

        <div class="qab-divider" />

        <div class="qab-section">
          <div class="qab-section-title">{{ t.quickAction.label }}</div>
          <div class="qab-row">
            <label>{{ t.quickAction.text }}</label>
            <input type="text" :value="edgeLabel" :placeholder="t.quickAction.inputLabelPlaceholder" @input="onEdgeLabel($event)">
          </div>
        </div>

        <div class="qab-divider" />

        <div class="qab-section">
          <div class="qab-section-title">{{ t.quickAction.arrow }}</div>
          <div class="qab-row">
            <label>{{ t.quickAction.source }}</label>
            <div class="qab-icon-row">
              <button class="qab-icon-btn qab-chip" :class="{active: edgeSourceMarker === 'none'}" :title="t.quickAction.markerNone" @click="setSourceMarker('none')">—</button>
              <button class="qab-icon-btn qab-chip" :class="{active: edgeSourceMarker === 'classic'}" :title="t.quickAction.markerClassic" @click="setSourceMarker('classic')">→</button>
              <button class="qab-icon-btn qab-chip" :class="{active: edgeSourceMarker === 'block'}" :title="t.quickAction.markerBlock" @click="setSourceMarker('block')">▶</button>
              <button class="qab-icon-btn qab-chip" :class="{active: edgeSourceMarker === 'open'}" :title="t.quickAction.markerOpen" @click="setSourceMarker('open')">▷</button>
              <button class="qab-icon-btn qab-chip" :class="{active: edgeSourceMarker === 'diamond'}" :title="t.quickAction.markerDiamond" @click="setSourceMarker('diamond')">◇</button>
              <button class="qab-icon-btn qab-chip" :class="{active: edgeSourceMarker === 'circle'}" :title="t.quickAction.markerCircle" @click="setSourceMarker('circle')">○</button>
            </div>
          </div>
          <div class="qab-row">
            <label>{{ t.quickAction.target }}</label>
            <div class="qab-icon-row">
              <button class="qab-icon-btn qab-chip" :class="{active: edgeTargetMarker === 'none'}" :title="t.quickAction.markerNone" @click="setTargetMarker('none')">—</button>
              <button class="qab-icon-btn qab-chip" :class="{active: edgeTargetMarker === 'classic'}" :title="t.quickAction.markerClassic" @click="setTargetMarker('classic')">→</button>
              <button class="qab-icon-btn qab-chip" :class="{active: edgeTargetMarker === 'block'}" :title="t.quickAction.markerBlock" @click="setTargetMarker('block')">▶</button>
              <button class="qab-icon-btn qab-chip" :class="{active: edgeTargetMarker === 'open'}" :title="t.quickAction.markerOpen" @click="setTargetMarker('open')">▷</button>
              <button class="qab-icon-btn qab-chip" :class="{active: edgeTargetMarker === 'diamond'}" :title="t.quickAction.markerDiamond" @click="setTargetMarker('diamond')">◇</button>
              <button class="qab-icon-btn qab-chip" :class="{active: edgeTargetMarker === 'circle'}" :title="t.quickAction.markerCircle" @click="setTargetMarker('circle')">○</button>
            </div>
          </div>
        </div>

        <div class="qab-divider" />

        <div class="qab-section">
          <div class="qab-section-title">{{ t.quickAction.line }}</div>
          <div class="qab-row">
            <label>{{ t.quickAction.style }}</label>
            <div class="qab-icon-row">
              <button class="qab-icon-btn" :class="{active: edgeStrokeDash === ''}" :title="t.quickAction.solidLine" @click="setEdgeStrokeDash('')">
                <svg width="22" height="10" viewBox="0 0 22 10"><line x1="1" y1="5" x2="21" y2="5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
              </button>
              <button class="qab-icon-btn" :class="{active: edgeStrokeDash === '5 5'}" :title="t.quickAction.dashedLine" @click="setEdgeStrokeDash('5 5')">
                <svg width="22" height="10" viewBox="0 0 22 10"><line x1="1" y1="5" x2="21" y2="5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-dasharray="5 3"/></svg>
              </button>
              <button class="qab-icon-btn" :class="{active: edgeStrokeDash === '2 4'}" :title="t.quickAction.dottedLine" @click="setEdgeStrokeDash('2 4')">
                <svg width="22" height="10" viewBox="0 0 22 10"><line x1="1" y1="5" x2="21" y2="5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-dasharray="2 3"/></svg>
              </button>
            </div>
          </div>
          <div class="qab-row">
            <label>{{ t.quickAction.color }}</label>
            <ColorPicker :model-value="edgeStroke" @update:model-value="onEdgeColorChange($event)" />
          </div>
          <div class="qab-row">
            <label>{{ t.quickAction.lineWidth }}</label>
            <input type="range" :value="edgeStrokeWidth" min="0.5" max="8" step="0.5" @input="onEdgeWidth($event)">
            <span class="qab-val">{{ edgeStrokeWidth }}</span>
          </div>
        </div>
      </template>

      <div class="qab-divider" />

      <!-- 草图模式开关 -->
      <div class="qab-section">
        <div class="qab-section-title">{{ t.quickAction.sketchMode }}</div>
        <div v-if="selectedCellId && sketchElementSupported" class="qab-row qab-row-switch">
          <label>{{ t.quickAction.currentElement }}</label>
          <label class="qab-switch">
            <input type="checkbox" :checked="elementSketch" @change="$emit('toggle-element-sketch', selectedCellId)">
            <span class="qab-switch-track" />
          </label>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import ColorPicker from '../ColorPicker/ColorPicker.vue'
import { PRIMARY_COLOR } from '../../styles/vars'
import { useLocale } from '../../locale'
import {
  X as XIcon,
  AlignCenter as AlignCenterIcon,
  AlignStartHorizontal as AlignTopIcon,
  AlignEndHorizontal as AlignBottomIcon,
  AlignStartVertical as AlignLeftIcon,
  AlignEndVertical as AlignRightIcon,
} from 'lucide-vue-next'
import type { NodeData } from '@uni-draw/shared'

export interface QuickActionBarProps {
  selectedNode: NodeData | null
  selectedEdge: { id: string; stroke: string; strokeWidth: number; strokeDasharray: string; lineType: string; label?: string; sourceMarker?: string; targetMarker?: string } | null
  sketchMode: boolean
  elementSketchIds: Set<string>
}

const props = defineProps<QuickActionBarProps>()

const emit = defineEmits<{
  (e: 'update-style', id: string, style: Record<string, unknown>): void
  (e: 'update-edge-style', id: string, style: Record<string, unknown>): void
  (e: 'change-edge-type', id: string, lineType: string): void
  (e: 'resize', id: string, width: number, height: number): void
  (e: 'close'): void
  (e: 'toggle-sketch'): void
  (e: 'toggle-element-sketch', id: string): void
}>()

const isEdge = computed(() => !!props.selectedEdge)
const selectedCellId = computed(() => {
  if (props.selectedEdge) return props.selectedEdge.id
  if (props.selectedNode) return props.selectedNode.id
  return null
})
const elementSketch = computed(() => {
  const id = selectedCellId.value
  return id ? props.elementSketchIds.has(id) : false
})
const sketchElementSupported = computed(() => {
  if (props.selectedEdge) return true
  const shape = props.selectedNode?.shape ?? ''
  return shape !== 'basic-image' && shape !== 'basic-svg'
})
/** 判断图形是否支持圆角 — 仅 body 为 <rect> 的图形支持 rx */
const rxSupported = computed(() => {
  if (!props.selectedNode) return false
  const shape = props.selectedNode.shape ?? ''
  // polygon(有refPoints)、ellipse/circle、特殊markup 不支持圆角
  // 只有 rect 系列才支持
  const rectShapes = new Set([
    'basic-rect', 'basic-rounded-rect', 'basic-cylinder', 'basic-cloud', 'basic-document',
    'flowchart-start-end', 'flowchart-process', 'flowchart-document', 'flowchart-database', 'flowchart-predefined', 'flowchart-internal-storage',
    'uml-class', 'uml-interface', 'uml-abstract', 'uml-enum', 'uml-package', 'uml-object', 'uml-component',
    'sequence-activation', 'sequence-fragment-alt', 'sequence-fragment-opt', 'sequence-fragment-loop', 'sequence-fragment-par', 'sequence-fragment-critical',
    'er-entity', 'er-weak-entity', 'er-associative',
    'dfd-external-entity',
    'swimlane-horizontal', 'swimlane-vertical', 'swimlane-pool', 'swimlane-phase',
    'state-simple', 'state-fork', 'state-join',
  ])
  return rectShapes.has(shape)
})

// 节点状态
const t = useLocale()

const currentSize = ref({ width: 100, height: 60 })
const currentStroke = ref(PRIMARY_COLOR)
const currentStrokeWidth = ref(2)
const currentStrokeDash = ref('')
const currentRx = ref(0)
const currentFill = ref('#ffffff')
const currentFontSize = ref(14)
const currentLabelPos = ref('center')
const currentOpacity = ref(1)
const currentLabel = ref('')

// 边状态
const edgeStroke = ref(PRIMARY_COLOR)
const edgeStrokeWidth = ref(2)
const edgeStrokeDash = ref('')
const edgeLineType = ref('straight')
const edgeLabel = ref('')
const edgeSourceMarker = ref('none')
const edgeTargetMarker = ref('block')

watch(
  () => props.selectedNode,
  (n) => {
    if (!n) return
    currentSize.value = { ...n.size }
    const s = n.style ?? {}
    currentStroke.value = (s.stroke as string) ?? PRIMARY_COLOR
    currentStrokeWidth.value = (s.strokeWidth as number) ?? 2
    currentStrokeDash.value = (s.strokeDasharray as string) ?? ''
    currentRx.value = (s.rx as number) ?? 0
    currentFill.value = (s.fill as string) ?? '#ffffff'
    currentOpacity.value = (s.opacity as number) ?? 1
    currentFontSize.value = (n.label as any)?.style?.fontSize ?? 14
    currentLabelPos.value = (n.label as any)?.position ?? 'center'
    currentLabel.value = typeof n.label === 'string' ? n.label : ((n.label as any)?.text ?? '')
  },
  { immediate: true },
)

watch(
  () => props.selectedEdge,
  (e) => {
    if (!e) return
    edgeStroke.value = e.stroke
    edgeStrokeWidth.value = e.strokeWidth
    edgeStrokeDash.value = e.strokeDasharray
    edgeLineType.value = e.lineType
    edgeLabel.value = e.label ?? ''
    edgeSourceMarker.value = e.sourceMarker ?? 'none'
    edgeTargetMarker.value = e.targetMarker ?? 'block'
  },
  { immediate: true },
)

// ===== 节点操作 =====
function onResize(dim: 'width' | 'height', ev: Event) {
  if (!props.selectedNode) return
  const val = Number((ev.target as HTMLInputElement).value)
  if (isNaN(val) || val < 20) return
  currentSize.value[dim] = val
  emit('resize', props.selectedNode.id, currentSize.value.width, currentSize.value.height)
}

function setStrokeDash(val: string) {
  if (!props.selectedNode) return
  currentStrokeDash.value = val
  emit('update-style', props.selectedNode.id, { strokeDasharray: val })
}

function onColorChange(key: string, val: string) {
  if (!props.selectedNode) return
  if (key === 'stroke') currentStroke.value = val
  if (key === 'fill') currentFill.value = val
  emit('update-style', props.selectedNode.id, { [key]: val })
}

function onRange(key: string, ev: Event) {
  if (!props.selectedNode) return
  const val = Number((ev.target as HTMLInputElement).value)
  if (key === 'strokeWidth') currentStrokeWidth.value = val
  if (key === 'rx') currentRx.value = val
  if (key === 'fontSize') currentFontSize.value = val
  if (key === 'opacity') currentOpacity.value = val
  emit('update-style', props.selectedNode.id, { [key]: val })
}

function onNodeLabel(ev: Event) {
  if (!props.selectedNode) return
  currentLabel.value = (ev.target as HTMLInputElement).value
  emit('update-style', props.selectedNode.id, { label: currentLabel.value })
}

function setLabelPos(val: string) {
  if (!props.selectedNode) return
  currentLabelPos.value = val
  emit('update-style', props.selectedNode.id, { labelPosition: val })
}

// ===== 边操作 =====
function setEdgeLineType(val: string) {
  if (!props.selectedEdge) return
  edgeLineType.value = val
  emit('change-edge-type', props.selectedEdge.id, val)
}

function onEdgeLabel(ev: Event) {
  if (!props.selectedEdge) return
  edgeLabel.value = (ev.target as HTMLInputElement).value
  emit('update-edge-style', props.selectedEdge.id, { label: edgeLabel.value })
}

function setSourceMarker(val: string) {
  if (!props.selectedEdge) return
  edgeSourceMarker.value = val
  emit('update-edge-style', props.selectedEdge.id, { sourceMarker: val })
}

function setTargetMarker(val: string) {
  if (!props.selectedEdge) return
  edgeTargetMarker.value = val
  emit('update-edge-style', props.selectedEdge.id, { targetMarker: val })
}

function setEdgeStrokeDash(val: string) {
  if (!props.selectedEdge) return
  edgeStrokeDash.value = val
  emit('update-edge-style', props.selectedEdge.id, { strokeDasharray: val })
}

function onEdgeColorChange(val: string) {
  if (!props.selectedEdge) return
  edgeStroke.value = val
  emit('update-edge-style', props.selectedEdge.id, { stroke: val })
}

function onEdgeWidth(ev: Event) {
  if (!props.selectedEdge) return
  edgeStrokeWidth.value = Number((ev.target as HTMLInputElement).value)
  emit('update-edge-style', props.selectedEdge.id, { strokeWidth: edgeStrokeWidth.value })
}
</script>

<style scoped>
.quick-action-card {
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  width: 180px;
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1), 0 1px 4px rgba(0, 0, 0, 0.06);
  z-index: 20;
  overflow: hidden;
  user-select: none;
}

.qac-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  border-bottom: 1px solid #f0f0f0;
  background: #fafbfc;
}

.qac-title {
  font-size: 12px;
  font-weight: 600;
  color: #333;
}

.qac-close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border: none;
  background: transparent;
  color: #999;
  cursor: pointer;
  border-radius: 4px;
  padding: 0;
  transition: all 0.15s;
}
.qac-close:hover {
  background: #f0f0f0;
  color: #333;
}

.qac-body {
  max-height: calc(100vh - 200px);
  overflow-y: auto;
}

.qab-section {
  padding: 10px 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.qab-section-title {
  font-size: 11px;
  color: #999;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.qab-row {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #555;
}

.qab-row label {
  min-width: 28px;
  font-size: 11px;
  color: #888;
  flex-shrink: 0;
}

.qab-row input[type="text"],
.qab-row input[type="number"] {
  width: 52px;
  padding: 3px 5px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  font-size: 12px;
  outline: none;
  box-sizing: border-box;
}
.qab-row input[type="text"]:focus,
.qab-row input[type="number"]:focus {
  border-color: var(--uni-draw-primary);
}

.qab-icon-row {
  display: flex;
  flex: 1;
  gap: 3px;
}

.qab-icon-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 24px;
  min-width: 0;
  padding: 0 2px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  background: #fafafa;
  color: #555;
  font-size: 11px;
  cursor: pointer;
  transition: all 0.12s;
}

.qab-icon-btn:hover {
  border-color: var(--uni-draw-primary);
  color: var(--uni-draw-primary);
  background: var(--uni-draw-primary-bg-light);
}

.qab-icon-btn.active {
  border-color: var(--uni-draw-primary);
  background: var(--uni-draw-primary-bg);
  color: var(--uni-draw-primary);
}

.qab-row input[type="color"] {
  width: 28px;
  height: 24px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  padding: 0;
  cursor: pointer;
  flex-shrink: 0;
}

.qab-row input[type="range"] {
  flex: 1;
  min-width: 0;
  accent-color: var(--uni-draw-primary);
}

.qab-val {
  min-width: 22px;
  text-align: right;
  font-size: 11px;
  color: #888;
  font-family: monospace;
}

.qab-divider {
  height: 1px;
  background: #f0f0f0;
  margin: 0 8px;
}

.qab-row-switch {
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
}

.qab-switch {
  position: relative;
  display: inline-block;
  width: 34px;
  height: 18px;
  flex-shrink: 0;
  cursor: pointer;
}

.qab-switch input {
  opacity: 0;
  width: 0;
  height: 0;
  position: absolute;
}

.qab-switch-track {
  position: absolute;
  inset: 0;
  background: #d9d9d9;
  border-radius: 18px;
  transition: background 0.2s;
}

.qab-switch-track::after {
  content: '';
  position: absolute;
  left: 2px;
  top: 2px;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 1px 3px rgba(0,0,0,0.2);
  transition: transform 0.2s;
}

.qab-switch input:checked + .qab-switch-track {
  background: var(--uni-draw-primary);
}

.qab-switch input:checked + .qab-switch-track::after {
  transform: translateX(16px);
}
</style>
