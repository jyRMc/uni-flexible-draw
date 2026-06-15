<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { UniDraw } from '../UniDraw'
import type { UniDrawOptions } from '../UniDraw'
import type { EdgeData, GraphData, NodeData } from '../shared/types'

// ─── Props ────────────────────────────────────────────────────────────────

const props = withDefaults(defineProps<{
  modelValue?: GraphData
  showShapePanel?: boolean
  showToolbar?: boolean
  grid?: boolean
  snapline?: boolean
  readonly?: boolean
  assets?: UniDrawOptions['assets']
  assetPage?: UniDrawOptions['assetPage']
  assetTotalPages?: UniDrawOptions['assetTotalPages']
  assetPageLoading?: UniDrawOptions['assetPageLoading']
  canPrevAssets?: UniDrawOptions['canPrevAssets']
  canNextAssets?: UniDrawOptions['canNextAssets']
  templates?: UniDrawOptions['templates']
}>(), {
  showShapePanel: true,
  showToolbar: true,
  grid: true,
  snapline: true,
  readonly: false,
  assetPage: 1,
  assetTotalPages: 1,
  assetPageLoading: false,
  canPrevAssets: false,
  canNextAssets: false,
})

// ─── Emits ────────────────────────────────────────────────────────────────

const emit = defineEmits<{
  (e: 'update:modelValue', data: GraphData): void
  (e: 'ready'): void
  (e: 'selection:change', nodes: NodeData[], edges: EdgeData[]): void
  (e: 'assets:prev-page'): void
  (e: 'assets:next-page'): void
}>()

// ─── Instance ─────────────────────────────────────────────────────────────

const containerRef = ref<HTMLElement | null>(null)
let instance: UniDraw | null = null

onMounted(() => {
  if (!containerRef.value)
    return
  instance = new UniDraw(containerRef.value, {
    initialData: props.modelValue,
    assets: props.assets,
    assetPage: props.assetPage,
    assetTotalPages: props.assetTotalPages,
    assetPageLoading: props.assetPageLoading,
    canPrevAssets: props.canPrevAssets,
    canNextAssets: props.canNextAssets,
    onAssetsPrevPage: () => emit('assets:prev-page'),
    onAssetsNextPage: () => emit('assets:next-page'),
    templates: props.templates,
    showShapePanel: props.showShapePanel,
    showToolbar: props.showToolbar,
    grid: props.grid,
    snapline: props.snapline,
    readonly: props.readonly,
    onReady: () => emit('ready'),
    onSelectionChange: (nodes, edges) => emit('selection:change', nodes, edges),
    onDataChange: data => emit('update:modelValue', data),
  })
})

onBeforeUnmount(() => { instance?.destroy(); instance = null })

// Sync external v-model changes into the canvas
watch(() => props.modelValue, (val) => {
  if (val && instance)
    instance.setData(val)
})

watch(() => props.assets, (val) => {
  if (instance && val)
    instance.setAssets(val)
})

watch(() => props.templates, (val) => {
  if (instance && val)
    instance.setTemplates(val)
})

watch(
  () => [props.assetPage, props.assetTotalPages, props.assetPageLoading, props.canPrevAssets, props.canNextAssets] as const,
  () => {
    instance?.setAssetPagination({
      assetPage: props.assetPage,
      assetTotalPages: props.assetTotalPages,
      assetPageLoading: props.assetPageLoading,
      canPrevAssets: props.canPrevAssets,
      canNextAssets: props.canNextAssets,
      onAssetsPrevPage: () => emit('assets:prev-page'),
      onAssetsNextPage: () => emit('assets:next-page'),
    })
  },
)

// ─── Expose ───────────────────────────────────────────────────────────────

defineExpose({
  getData: () => instance?.getData(),
  setData: (d: GraphData) => instance?.setData(d),
  clear: () => instance?.clear(),
  exportPNG: () => instance?.exportPNG(),
  exportSVG: () => instance?.exportSVG(),
  exportJSON: () => instance?.exportJSON(),
  undo: () => instance?.undo(),
  redo: () => instance?.redo(),
  zoomIn: () => instance?.zoomIn(),
  zoomOut: () => instance?.zoomOut(),
  zoomFit: () => instance?.zoomFit(),
  selectAll: () => instance?.selectAll(),
  deleteSelection: () => instance?.deleteSelection(),
})
</script>

<template>
  <div ref="containerRef" style="width:100%;height:100%;overflow:hidden" />
</template>
