<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import type { AssetItem, GraphData, TemplateItem, UniDrawLocale } from '@uni-draw/draw'
import { UniDraw, enUS, zhCN } from '@uni-draw/draw'
import { type AIConnectionConfig, diagnoseAiConnection, generateGraph } from '../mocks/aiService'
import { SCENARIO_TEMPLATES } from '../mocks/templates'
import PreviewModal from '../components/PreviewModal.vue'
import AIPanel from './AIPanel.vue'
import TopBar from './TopBar.vue'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

interface SvgAssetsApiEnvelope {
  items: AssetItem[]
  pagination?: {
    page: number
    totalPages: number
    hasPrev: boolean
    hasNext: boolean
  }
}

type DemoLanguage = 'zh-CN' | 'en-US'

const SERVER_BASE_URL = (import.meta as { env?: Record<string, string | undefined> }).env?.VITE_UNIDRAW_SERVER ?? 'http://127.0.0.1:3077'
const ASSETS_API_URL = (import.meta as { env?: Record<string, string | undefined> }).env?.VITE_SVG_ASSETS_API ?? `${SERVER_BASE_URL}/api/assets`
const templates = SCENARIO_TEMPLATES as unknown as TemplateItem[]
const assets = ref<AssetItem[]>([])
const assetPage = ref(1)
const assetTotalPages = ref(1)
const assetsLoading = ref(false)
const assetsPaginated = ref(false)

const drawRef = ref<InstanceType<typeof UniDraw> | null>(null)
const readonly = ref(false)
const zoomPercent = ref(100)
const previewVisible = ref(false)
const aiPanelOpen = ref(false)
const aiLoading = ref(false)
const aiMessages = ref<Message[]>([])
const followUpQuestions = ref<string[]>([])
const currentLanguage = ref<DemoLanguage>('zh-CN')
const aiConfig = ref<AIConnectionConfig>({
  model: '',
  apiUrl: '',
  apiKey: '',
})

const currentLocale = computed<UniDrawLocale>(() => (currentLanguage.value === 'en-US' ? enUS : zhCN))
const exampleText = computed(() => currentLocale.value.example)

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
  }
  catch (error) {
    console.error('[AIDrawExample] Failed to load SVG assets', error)
    assets.value = []
    assetPage.value = 1
    assetTotalPages.value = 1
    assetsPaginated.value = false
  }
  finally {
    assetsLoading.value = false
  }
}

onMounted(() => {
  void loadAssets()
})

function goToPreviousAssetPage() {
  if (assetsLoading.value || !assetsPaginated.value || assetPage.value <= 1)
    return
  void loadAssets(assetPage.value - 1)
}

function goToNextAssetPage() {
  if (assetsLoading.value || !assetsPaginated.value || assetPage.value >= assetTotalPages.value)
    return
  void loadAssets(assetPage.value + 1)
}

function onDataChange(data: GraphData) {
  zoomPercent.value = Math.round((data.canvas?.zoom ?? 1) * 100) || 100
}

function toggleAiPanel() {
  aiPanelOpen.value = !aiPanelOpen.value
}

function openTemplates() {
  (drawRef.value as any)?.openTemplatePanel?.()
}

function clearAiChat() {
  aiPanelOpen.value = true
  aiMessages.value = []
  followUpQuestions.value = []
  aiLoading.value = false
}

function appendAssistantMessage(content: string) {
  const lastMessage = aiMessages.value[aiMessages.value.length - 1]
  if (lastMessage?.role === 'assistant') {
    lastMessage.content = content
    aiMessages.value = [...aiMessages.value]
    return
  }
  aiMessages.value = [...aiMessages.value, { role: 'assistant', content }]
}

function onShare() {
  const json = drawRef.value?.exportJSON()
  if (json) {
    navigator.clipboard.writeText(json).then(() => alert(exampleText.value.common.copiedJson))
  }
}

function openPreview() {
  previewVisible.value = true
}

function onPreviewCopy(data: GraphData) {
  const json = JSON.stringify(data, null, 2)
  navigator.clipboard.writeText(json).then(() => alert(exampleText.value.common.copiedJson))
}

function onPreviewDownload(data: GraphData) {
  const json = JSON.stringify(data, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${data.meta?.title ?? 'diagram'}.json`
  a.click()
  URL.revokeObjectURL(url)
}

function onExit() {
  if (confirm(exampleText.value.common.exitConfirm)) {
    window.close()
  }
}

function toggleLanguage() {
  currentLanguage.value = currentLanguage.value === 'zh-CN' ? 'en-US' : 'zh-CN'
}

function onAiConfigChange(config: AIConnectionConfig) {
  aiConfig.value = config
}

async function onReady() {
  const diag = await diagnoseAiConnection(aiConfig.value)
  aiMessages.value = [{ role: 'assistant', content: `🔌 API 连通诊断: ${diag}` }]
  followUpQuestions.value = [
    '如何绘制流程图？',
    '如何绘制 UML 类图？',
    '如何绘制实体关系图？',
  ]
}

async function onAiGenerate(prompt: string) {
  const normalizedPrompt = prompt.trim()
  if (!normalizedPrompt || aiLoading.value)
    return
  aiPanelOpen.value = true
  aiMessages.value = [...aiMessages.value, { role: 'user', content: normalizedPrompt }]
  aiLoading.value = true
  followUpQuestions.value = []
  try {
    const data = await generateGraph(normalizedPrompt, aiConfig.value, (_token, full) => {
      appendAssistantMessage(full)
    })
    const nodeLabels = data.nodes.map(n => n.label || n.shape).filter(Boolean)
    const summary = `已为你生成${data.meta?.title ?? '图表'}，包含 ${data.nodes.length} 个节点和 ${data.edges.length} 条边。\n\n图中包含：\n${nodeLabels.map(n => `• ${n}`).join('\n')}`
    const followUp = data.meta?.type === 'flowchart'
      ? ['能否添加异常处理分支？', '如何将这个流程优化？']
      : ['如何扩展这个架构？', '有哪些可以优化的地方？']
    drawRef.value?.setData?.(data)
    appendAssistantMessage(summary)
    followUpQuestions.value = followUp
  }
  catch (err) {
    appendAssistantMessage(`生成失败：${err instanceof Error ? err.message : '未知错误'}`)
  }
  finally {
    aiLoading.value = false
  }
}
</script>

<template>
  <div class="app-shell">
    <!-- 顶部业务栏 -->
    <TopBar
      :title="graphData.meta?.title || exampleText.common.untitled"
      :zoom-percent="zoomPercent"
      :editing="!readonly"
      :lang="currentLanguage"
      :texts="exampleText.topBar"
      @toggle-edit="readonly = !readonly"
      @toggle-language="toggleLanguage"
      @templates="openTemplates"
      @preview="openPreview"
      @ai-draw="toggleAiPanel"
      @new-chat="clearAiChat"
      @share="onShare"
      @exit="onExit"
    />

    <PreviewModal
      v-model:visible="previewVisible"
      :data="graphData"
      :title="exampleText.common.previewTitle"
      :copy-title="exampleText.common.copyJson"
      :download-title="exampleText.common.downloadJson"
      :close-title="exampleText.common.close"
      @copy="onPreviewCopy"
      @download="onPreviewDownload"
    />

    <div class="workspace-shell">
      <UniDraw
        ref="drawRef"
        v-model="graphData"
        class="draw-shell"
        :assets="assets"
        :asset-page="assetPage"
        :asset-total-pages="assetTotalPages"
        :asset-page-loading="assetsLoading"
        :can-prev-assets="assetPage > 1"
        :can-next-assets="assetPage < assetTotalPages"
        :templates="templates"
        :readonly="readonly"
        :locale="currentLocale"
        @assets:prev-page="goToPreviousAssetPage"
        @assets:next-page="goToNextAssetPage"
        @ready="onReady"
        @update:model-value="onDataChange"
      />

      <AIPanel
        v-if="aiPanelOpen"
        :messages="aiMessages"
        :is-loading="aiLoading"
        :follow-up-questions="followUpQuestions"
        :config="aiConfig"
        class="ai-shell"
        @update:config="onAiConfigChange"
        @send="onAiGenerate"
      />
    </div>
  </div>
</template>

<style scoped>
.app-shell {
  display: flex;
  flex-direction: column;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
}

.workspace-shell {
  display: flex;
  flex: 1;
  min-height: 0;
}

.draw-shell {
  flex: 1;
  min-width: 0;
}

.ai-shell {
  flex-shrink: 0;
}
</style>
