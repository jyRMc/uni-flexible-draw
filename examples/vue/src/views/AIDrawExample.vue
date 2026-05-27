<template>
  <div class="app-shell">
    <!-- 顶部业务栏 -->
    <TopBar
      :title="graphData.meta?.title || '未命名图表'"
      :zoom-percent="zoomPercent"
      :editing="!readonly"
      @toggle-edit="readonly = !readonly"
      @templates="openTemplates"
      @ai-draw="toggleAiPanel"
      @new-chat="clearAiChat"
      @share="onShare"
      @exit="onExit"
    />

    <!-- 主体：UniDraw 组件（内含图形、素材、模板、工具栏、AI面板） -->
    <UniDraw
      ref="drawRef"
      v-model="graphData"
      :show-ai-panel="true"
      :assets="assets"
      :asset-page="assetPage"
      :asset-total-pages="assetTotalPages"
      :asset-page-loading="assetsLoading"
      :can-prev-assets="assetPage > 1"
      :can-next-assets="assetPage < assetTotalPages"
      :templates="templates"
      :readonly="readonly"
      @assets:prev-page="goToPreviousAssetPage"
      @assets:next-page="goToNextAssetPage"
      @ai:generate="onAiGenerate"
      @ready="onReady"
      @update:model-value="onDataChange"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { UniDraw } from '@uni-draw/draw'
import type { AssetItem, GraphData, TemplateItem } from '@uni-draw/draw'
import { generateGraph, diagnoseSiliconFlow } from '../mocks/aiService'
import { SCENARIO_TEMPLATES } from '../mocks/templates'
import TopBar from './TopBar.vue'

interface SvgAssetsApiEnvelope {
  items: AssetItem[]
  pagination?: {
    page: number
    totalPages: number
    hasPrev: boolean
    hasNext: boolean
  }
}

const ASSETS_API_URL = (import.meta as { env?: Record<string, string | undefined> }).env?.VITE_SVG_ASSETS_API ?? 'http://127.0.0.1:3077/api/assets'
const templates = SCENARIO_TEMPLATES as unknown as TemplateItem[]
const assets = ref<AssetItem[]>([])
const assetPage = ref(1)
const assetTotalPages = ref(1)
const assetsLoading = ref(false)
const assetsPaginated = ref(false)

const drawRef = ref<InstanceType<typeof UniDraw> | null>(null)
const readonly = ref(false)
const zoomPercent = ref(100)

const graphData = ref<GraphData>({
  canvas: { backgroundColor: '#ffffff', grid: { size: 10, visible: true, type: 'dot' }, zoom: 1 },
  nodes: [],
  edges: [],
})

function normalizeAssetsResponse(payload: unknown, requestedPage: number) {
  if (Array.isArray(payload)) {
    return {
      items: payload as AssetItem[],
      page: 1,
      totalPages: 1,
      paginated: false,
    }
  }

  if (payload && typeof payload === 'object') {
    const envelope = payload as Partial<SvgAssetsApiEnvelope>
    const items = Array.isArray(envelope.items) ? envelope.items : []
    const pagination = envelope.pagination
    const paginated = !!pagination

    return {
      items,
      page: paginated ? pagination.page ?? requestedPage : 1,
      totalPages: paginated ? pagination.totalPages ?? 1 : 1,
      paginated,
    }
  }

  return {
    items: [],
    page: 1,
    totalPages: 1,
    paginated: false,
  }
}

async function loadAssets(page = assetPage.value) {
  assetsLoading.value = true
  try {
    const url = new URL(ASSETS_API_URL)
    if (assetsPaginated.value) {
      url.searchParams.set('page', String(page))
    }

    const response = await fetch(url.toString())
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }

    const payload = await response.json() as unknown
    const normalized = normalizeAssetsResponse(payload, page)
    assets.value = normalized.items
    assetPage.value = normalized.page
    assetTotalPages.value = normalized.totalPages
    assetsPaginated.value = normalized.paginated
  } catch (error) {
    console.error('[AIDrawExample] Failed to load SVG assets', error)
    assets.value = []
    assetPage.value = 1
    assetTotalPages.value = 1
    assetsPaginated.value = false
  } finally {
    assetsLoading.value = false
  }
}

onMounted(() => {
  void loadAssets()
})

function goToPreviousAssetPage() {
  if (assetsLoading.value || !assetsPaginated.value || assetPage.value <= 1) return
  void loadAssets(assetPage.value - 1)
}

function goToNextAssetPage() {
  if (assetsLoading.value || !assetsPaginated.value || assetPage.value >= assetTotalPages.value) return
  void loadAssets(assetPage.value + 1)
}

function onDataChange(_data: GraphData) {
  zoomPercent.value = Math.round((drawRef.value as any)?.canvasRef?.zoom * 100) || 100
}

function toggleAiPanel() {
  (drawRef.value as any)?.toggleAiPanel?.()
}

function openTemplates() {
  (drawRef.value as any)?.openTemplatePanel?.()
}

function clearAiChat() {
  (drawRef.value as any)?.clearAiChat?.()
}

function onShare() {
  const json = drawRef.value?.exportJSON()
  if (json) {
    navigator.clipboard.writeText(json).then(() => alert('已复制 JSON 到剪贴板'))
  }
}

function onExit() {
  if (confirm('确定要退出吗？')) {
    window.close()
  }
}

async function onReady() {
  const diag = await diagnoseSiliconFlow()
  drawRef.value?.applyAiResult(undefined, `🔌 API 连通诊断: ${diag}`, [
    '如何绘制流程图？', '如何绘制 UML 类图？', '如何绘制实体关系图？',
  ])
}

async function onAiGenerate(prompt: string, _context: GraphData) {
  try {
    const data = await generateGraph(prompt, (_token, full) => {
      drawRef.value?.applyAiResult(undefined, full)
    })
    const nodeLabels = data.nodes.map(n => n.label || n.shape).filter(Boolean)
    const summary = `已为你生成${data.meta?.title ?? '图表'}，包含 ${data.nodes.length} 个节点和 ${data.edges.length} 条边。\n\n图中包含：\n${nodeLabels.map(n => `• ${n}`).join('\n')}`
    const followUp = data.meta?.type === 'flowchart'
      ? ['能否添加异常处理分支？', '如何将这个流程优化？']
      : ['如何扩展这个架构？', '有哪些可以优化的地方？']
    drawRef.value?.applyAiResult(data, summary, followUp)
  } catch (err) {
    drawRef.value?.applyAiResult(undefined, `生成失败：${err instanceof Error ? err.message : '未知错误'}`)
  }
}
</script>

<style scoped>
.app-shell {
  display: flex;
  flex-direction: column;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
}

.app-shell > :last-child {
  flex: 1;
  min-height: 0;
}
</style>
