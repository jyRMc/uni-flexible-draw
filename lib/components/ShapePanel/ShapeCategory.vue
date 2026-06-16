<script setup lang="ts">
import '../../icon/iconfont.css'
import { computed, ref } from 'vue'
import type { MaterialItem, MaterialLibrary } from '@uni-draw/shared'
import { useLocale } from '../../locale'

export interface ShapeCategoryProps {
  library: MaterialLibrary
  collapsible?: boolean
}

const props = withDefaults(defineProps<ShapeCategoryProps>(), {
  collapsible: true,
})

const emit = defineEmits<{
  (e: 'dragstart', item: MaterialItem, event: DragEvent): void
  (e: 'select', item: MaterialItem): void
}>()

const t = useLocale()
const isExpanded = ref(true)
const displayLibraryName = computed(() => {
  const categories = t.panel.shapeCategories
  return categories[props.library.id as keyof typeof categories] ?? props.library.name
})

function toggle() {
  if (props.collapsible) {
    isExpanded.value = !isExpanded.value
  }
}

function onDragStart(item: MaterialItem, event: DragEvent) {
  event.dataTransfer?.setData('application/json', JSON.stringify(item))
  emit('dragstart', item, event)
}

function onSelect(item: MaterialItem) {
  emit('select', item)
}

const SHAPE_ICON_CLASSES: Record<string, string> = {
  'basic-rect': 'icon-basic-rectangle',
  'basic-rounded-rect': 'icon-basic-rounded-rectangle',
  'basic-circle': 'icon-basic-circle',
  'basic-diamond': 'icon-basic-diamond',
  'basic-triangle': 'icon-basic-triangle',
  'basic-parallelogram': 'icon-basic-parallelogram',
  'basic-trapezoid': 'icon-basic-trapezoid',
  'basic-hexagon': 'icon-basic-hexagon',
  'basic-pentagon': 'icon-a-basic-pentagon',
  'basic-octagon': 'icon-a-basic-octagon',
  'basic-star': 'icon-a-basic-star',
  'basic-cross': 'icon-a-basic-cross',
  'basic-cylinder': 'icon-basic-cylinder',
  'basic-cloud': 'icon-basic-cloud',
  'basic-document': 'icon-basic-document',
  'basic-table': 'icon-basic-rectangle',
  'basic-text': 'icon-basic-text',
  'basic-image': 'icon-basic-image',
  'basic-svg': 'icon-basic-svg',
  'flowchart-start-end': 'icon-flowchart-start-end',
  'flowchart-process': 'icon-flowchart-process',
  'flowchart-decision': 'icon-flowchart-decision',
  'flowchart-input-output': 'icon-flowchart-input-output',
  'flowchart-document': 'icon-flowchart-document',
  'flowchart-database': 'icon-flowchart-database',
  'flowchart-predefined': 'icon-flowchart-predefined',
  'flowchart-connector': 'icon-flowchart-connector',
  'flowchart-merge': 'icon-basic-triangle',
  'flowchart-internal-storage': 'icon-flowchart-internal-storage',
  'edge': 'icon-edge-line',
  'edge-sketch': 'icon-edge-line',
  'uml-class': 'icon-uml-class',
  'uml-interface': 'icon-uml-interface',
  'uml-abstract': 'icon-uml-class',
  'uml-enum': 'icon-uml-enum',
  'uml-object': 'icon-uml-class',
  'uml-package': 'icon-uml-package',
  'uml-note': 'icon-uml-note',
  'uml-actor': 'icon-uml-actor',
  'uml-use-case': 'icon-uml-use-case',
  'uml-component': 'icon-uml-component',
  'uml-deployment': 'icon-uml-node',
  'uml-collaboration': 'icon-uml-collaboration',
  'uml-composite': 'icon-uml-component',
  'uml-node': 'icon-uml-node',
  'uml-artifact': 'icon-uml-note',
  'er-entity': 'icon-basic-rectangle',
  'er-weak-entity': 'icon-basic-rectangle',
  'er-relationship': 'icon-basic-diamond',
  'er-identifying-relationship': 'icon-basic-diamond',
  'er-attribute': 'icon-basic-circle',
  'er-key-attribute': 'icon-basic-circle',
  'er-multivalued': 'icon-basic-circle',
  'er-derived': 'icon-basic-circle',
  'er-associative': 'icon-basic-rectangle',
  'er-total-participation': 'icon-edge-arrow',
  'state-simple': 'icon-state-simple',
  'state-initial': 'icon-state-initial',
  'state-final': 'icon-state-final',
  'state-shallow-history': 'icon-state-shallow-history',
  'state-deep-history': 'icon-state-deep-history',
  'state-junction': 'icon-state-junction',
  'state-choice': 'icon-state-choice',
  'state-fork': 'icon-state-fork',
  'state-join': 'icon-state-join',
  'state-entry-point': 'icon-state-initial',
  'state-exit-point': 'icon-state-terminate',
  'state-terminate': 'icon-state-terminate',
  'state-signal-send': 'icon-state-signal-send',
  'state-signal-receive': 'icon-state-signal-receive',
  'dfd-process': 'icon-dfd-process',
  'dfd-data-store': 'icon-dfd-data-store',
  'dfd-external-entity': 'icon-dfd-external-entity',
  'dfd-multiple-process': 'icon-dfd-multiple-process',
  'swimlane-horizontal': 'icon-swimlane-horizontal',
  'swimlane-vertical': 'icon-swimlane-vertical',
  'swimlane-pool': 'icon-swimlane-horizontal',
  'swimlane-phase': 'icon-swimlane-horizontal',
  'sequence-actor': 'icon-sequence-actor',
  'sequence-lifeline': 'icon-sequence-lifeline',
  'sequence-activation': 'icon-sequence-activation',
  'sequence-fragment-alt': 'icon-sequence-fragment-alt',
  'sequence-fragment-opt': 'icon-sequence-fragment-opt',
  'sequence-fragment-loop': 'icon-sequence-fragment-loop',
  'sequence-fragment-par': 'icon-sequence-fragment-par',
  'sequence-fragment-critical': 'icon-sequence-fragment-critical',
  'sequence-gateway': 'icon-basic-diamond',
}

const CATEGORY_ICON_CLASSES: Record<string, string> = {
  basic: 'icon-basic-rectangle',
  flowchart: 'icon-flowchart-process',
  edge: 'icon-edge-line',
  uml: 'icon-uml-class',
  er: 'icon-basic-rectangle',
  state: 'icon-state-simple',
  dfd: 'icon-dfd-process',
  swimlane: 'icon-swimlane-horizontal',
  sequence: 'icon-sequence-actor',
}

function getShapeIconClass(shape: string): string {
  return SHAPE_ICON_CLASSES[shape] ?? CATEGORY_ICON_CLASSES[shape.split('-')[0]] ?? 'icon-basic-rectangle'
}

function isEdgePreviewShape(item: MaterialItem): boolean {
  return item.shape === 'edge' || item.shape === 'edge-sketch'
}

function getEdgePreviewSvg(item: MaterialItem): string {
  const stroke = 'currentColor'
  const line = `fill="none" stroke="${stroke}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"`
  const d = item.data ?? {}
  const connectorName = (d.connectorName as string) ?? 'normal'
  const routerName = (d.routerName as string) ?? 'normal'
  const sourceMarker = (d.sourceMarker as string) ?? 'none'
  const targetMarker = (d.targetMarker as string) ?? 'none'
  const strokeStyle = (d.strokeStyle as string) ?? 'solid'

  const dashAttr = strokeStyle === 'dashed' ? ' stroke-dasharray="6 4"' : strokeStyle === 'dotted' ? ' stroke-dasharray="2 4"' : strokeStyle === 'dashdot' ? ' stroke-dasharray="8 3 2 3"' : ''

  // 箭头多边形
  const arrowFill = `fill="${stroke}"`
  const srcArrow = sourceMarker !== 'none' ? `<polygon points="12,5 4,9 12,13" ${arrowFill}/>` : ''
  const tgtArrow = targetMarker !== 'none' ? `<polygon points="32,5 40,9 32,13" ${arrowFill}/>` : ''
  const lineStart = sourceMarker !== 'none' ? 12 : 4
  const lineEnd = targetMarker !== 'none' ? 32 : 40

  // 路径
  let path = ''
  if (item.shape === 'edge-sketch') {
    path = `<path d="M4,9 C6.5,5.7 9.5,11.7 13,8.4 C17,4.8 21,12.2 25,8.2 C29,4.6 33,10.8 36.5,7.6 C38.2,6.1 39.2,9.8 40,9" ${line}${dashAttr}/>`
  }
  else if (connectorName === 'smooth') {
    path = `<path d="M4,7 C11,7 11,17 22,17 C33,17 33,7 40,7" ${line}${dashAttr}/>`
  }
  else if (connectorName === 'rounded') {
    path = `<path d="M4,22 L18,22 Q21,22 21,19 L21,9 Q21,6 24,6 L40,6" ${line}${dashAttr}/>`
  }
  else if (connectorName === 'quadratic') {
    path = `<path d="M4,18 Q22,2 40,18" ${line}${dashAttr}/>`
  }
  else if (connectorName === 'jumpover') {
    path = `<path d="M4,16 H16 C18,16 18,8 20,8 C22,8 22,16 24,16 H40" ${line}${dashAttr}/>`
  }
  else if (connectorName === 'wobble') {
    path = `<path d="M4,9 C7,5 10,13 14,9 C18,5 21,13 25,9 C29,5 32,13 36,9 C38,7 39,9 40,9" ${line}${dashAttr}/>`
  }
  else if (routerName === 'orth') {
    path = `<polyline points="4,22 22,22 22,6 40,6" ${line}${dashAttr}/>`
  }
  else if (routerName === 'manhattan') {
    path = `<polyline points="4,22 14,22 14,14 30,14 30,6 40,6" ${line}${dashAttr}/>`
  }
  else if (routerName === 'er') {
    path = `<path d="M4,14 H16 C20,14 20,6 22,6 C24,6 24,14 28,14 H40" ${line}${dashAttr}/>`
  }
  else if (routerName === 'metro') {
    path = `<polyline points="4,22 12,22 12,8 32,8 32,22 40,22" ${line}${dashAttr}/>`
  }
  else {
    path = `<line x1="${lineStart}" y1="9" x2="${lineEnd}" y2="9" ${line}${dashAttr}/>`
  }

  return `<svg viewBox="0 0 44 28" xmlns="http://www.w3.org/2000/svg">${srcArrow}${path}${tgtArrow}</svg>`
}
</script>

<template>
  <div class="shape-category">
    <div class="shape-category-header" @click="toggle">
      <span class="shape-category-arrow" :class="{ expanded: isExpanded }">›</span>
      <span class="shape-category-name">{{ displayLibraryName }}</span>
      <span class="shape-category-count">{{ library.items.length }}</span>
    </div>
    <div v-show="isExpanded" class="shape-category-items">
      <div
        v-for="item in library.items"
        :key="item.id"
        class="shape-category-item"
        :title="item.name"
        draggable="true"
        @dragstart="(e: DragEvent) => onDragStart(item, e)"
        @click="onSelect(item)"
      >
        <div v-if="isEdgePreviewShape(item)" class="shape-svg-preview" v-html="getEdgePreviewSvg(item)" />
        <span v-else class="shape-icon-font iconfont" :class="getShapeIconClass(item.shape)" aria-hidden="true" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.shape-category {
  user-select: none;
}

.shape-category-header {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 600;
  color: #555;
  transition: background 0.15s;
}

.shape-category-header:hover {
  background: #f0f0f0;
}

.shape-category-arrow {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 14px;
  height: 14px;
  line-height: 1;
  transition: transform 0.2s;
  color: #999;
  flex-shrink: 0;
  transform: rotate(0deg);
}

.shape-category-arrow.expanded {
  transform: rotate(90deg);
}

.shape-category-name {
  flex: 1;
  margin-left: 4px;
}

.shape-category-count {
  font-size: 10px;
  color: #bbb;
}

.shape-category-items {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 2px;
  padding: 4px 8px 8px 8px;
}

.shape-category-item {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  margin: 0 auto;
  cursor: pointer;
  border-radius: 6px;
  color: #555;
  transition: all 0.15s;
}

.shape-category-item:hover {
  background: #eef1f8;
  color: var(--uni-draw-primary);
}

.shape-category-item:active {
  background: #dce5f5;
}

.shape-icon-font {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  font-size: 18px;
  line-height: 1;
  color: inherit;
  transition: color 0.15s;
}

.shape-svg-preview {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  color: inherit;
}

.shape-svg-preview :deep(svg) {
  width: 20px;
  height: 20px;
  overflow: visible;
}

.shape-category-item:hover .shape-icon-font {
  color: inherit;
}
</style>
