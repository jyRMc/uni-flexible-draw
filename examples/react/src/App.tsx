import { useRef, useState, useCallback, useEffect, useMemo } from 'react'
import type { CSSProperties } from 'react'
import { UniDraw, type UniDrawRef } from '@uni-draw/draw/react'
import AIPanel, { type Message } from './components/AIPanel'
import TopBar from './components/TopBar'
import { zhCN, enUS, type AssetItem, type GraphData, type TemplateItem, type UniDrawLocale } from '@uni-draw/draw'
import { generateGraph, diagnoseSiliconFlow } from '../../vue/src/mocks/aiService'
import { SCENARIO_TEMPLATES } from '../../vue/src/mocks/templates'

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
const shellStyle: CSSProperties = { width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column' }
const workspaceStyle: CSSProperties = { flex: 1, minHeight: 0, display: 'flex' }
const drawShellStyle: CSSProperties = { flex: 1, minWidth: 0 }
type DemoLanguage = 'zh-CN' | 'en-US'

export default function App() {
  const drawRef = useRef<UniDrawRef>(null)
  const [assets, setAssets] = useState<AssetItem[]>([])
  const [assetPage, setAssetPage] = useState(1)
  const [assetTotalPages, setAssetTotalPages] = useState(1)
  const [assetsLoading, setAssetsLoading] = useState(false)
  const [assetsPaginated, setAssetsPaginated] = useState(false)
  const [readonly, setReadonly] = useState(false)
  const [zoomPercent, setZoomPercent] = useState(100)
  const [aiPanelOpen, setAiPanelOpen] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  const [aiMessages, setAiMessages] = useState<Message[]>([])
  const [followUpQuestions, setFollowUpQuestions] = useState<string[]>([])
  const [currentLanguage, setCurrentLanguage] = useState<DemoLanguage>('zh-CN')
  const [graphData, setGraphData] = useState<GraphData>({
    canvas: { backgroundColor: '#ffffff', grid: { size: 10, visible: true, type: 'dot' }, zoom: 1 },
    nodes: [],
    edges: [],
  })
  const currentLocale = useMemo<UniDrawLocale>(() => (currentLanguage === 'en-US' ? enUS : zhCN), [currentLanguage])

  const normalizeAssetsResponse = useCallback((payload: unknown, requestedPage: number) => {
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
      items: [] as AssetItem[],
      page: 1,
      totalPages: 1,
      paginated: false,
    }
  }, [])

  const loadAssets = useCallback(async (page = assetPage) => {
    setAssetsLoading(true)
    try {
      const url = new URL(ASSETS_API_URL)
      if (assetsPaginated) {
        url.searchParams.set('page', String(page))
      }

      const response = await fetch(url.toString())
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const payload = await response.json() as unknown
      const normalized = normalizeAssetsResponse(payload, page)
      setAssets(normalized.items)
      setAssetPage(normalized.page)
      setAssetTotalPages(normalized.totalPages)
      setAssetsPaginated(normalized.paginated)
    } catch (error) {
      console.error('[AIDrawExample] Failed to load SVG assets', error)
      setAssets([])
      setAssetPage(1)
      setAssetTotalPages(1)
      setAssetsPaginated(false)
    } finally {
      setAssetsLoading(false)
    }
  }, [assetPage, assetsPaginated, normalizeAssetsResponse])

  useEffect(() => {
    void loadAssets()
  }, [loadAssets])

  const goToPreviousAssetPage = useCallback(() => {
    if (assetsLoading || !assetsPaginated || assetPage <= 1) return
    void loadAssets(assetPage - 1)
  }, [assetPage, assetsLoading, assetsPaginated, loadAssets])

  const goToNextAssetPage = useCallback(() => {
    if (assetsLoading || !assetsPaginated || assetPage >= assetTotalPages) return
    void loadAssets(assetPage + 1)
  }, [assetPage, assetTotalPages, assetsLoading, assetsPaginated, loadAssets])

  const handleShare = useCallback(() => {
    const json = drawRef.current?.exportJSON()
    if (json) {
      navigator.clipboard.writeText(json).then(() => alert(currentLocale.example.common.copiedJson))
    }
  }, [currentLocale])

  const handleToggleAiPanel = useCallback(() => {
    setAiPanelOpen((prev) => !prev)
  }, [])

  const handleOpenTemplates = useCallback(() => {
    drawRef.current?.openTemplatePanel()
  }, [])

  const handleClearAiChat = useCallback(() => {
    setAiPanelOpen(true)
    setAiMessages([])
    setFollowUpQuestions([])
    setAiLoading(false)
  }, [])

  const appendAssistantMessage = useCallback((content: string) => {
    setAiMessages((prev) => {
      const lastMessage = prev[prev.length - 1]
      if (lastMessage?.role === 'assistant') {
        return [...prev.slice(0, -1), { ...lastMessage, content }]
      }
      return [...prev, { role: 'assistant', content }]
    })
  }, [])

  const handleExit = useCallback(() => {
    if (window.confirm(currentLocale.example.common.exitConfirm)) {
      window.close()
    }
  }, [currentLocale])

  const handleToggleLanguage = useCallback(() => {
    setCurrentLanguage((prev) => (prev === 'zh-CN' ? 'en-US' : 'zh-CN'))
  }, [])

  const handleReady = useCallback(async () => {
    const diag = await diagnoseSiliconFlow()
    setAiMessages([{ role: 'assistant', content: `🔌 API 连通诊断: ${diag}` }])
    setFollowUpQuestions([
      '如何绘制流程图？', '如何绘制 UML 类图？', '如何绘制实体关系图？',
    ])
  }, [])

  const handleAiGenerate = useCallback(async (prompt: string) => {
    const normalizedPrompt = prompt.trim()
    if (!normalizedPrompt || aiLoading) return
    setAiPanelOpen(true)
    setAiMessages((prev) => [...prev, { role: 'user', content: normalizedPrompt }])
    setAiLoading(true)
    setFollowUpQuestions([])
    try {
      const data = await generateGraph(normalizedPrompt, (_token, full) => {
        appendAssistantMessage(full)
      })
      const nodeLabels = data.nodes.map(node => node.label || node.shape).filter(Boolean)
      const summary = `已为你生成${data.meta?.title ?? '图表'}，包含 ${data.nodes.length} 个节点和 ${data.edges.length} 条边。\n\n图中包含：\n${nodeLabels.map(label => `• ${label}`).join('\n')}`
      const followUp = data.meta?.type === 'flowchart'
        ? ['能否添加异常处理分支？', '如何将这个流程优化？']
        : ['如何扩展这个架构？', '有哪些可以优化的地方？']
      drawRef.current?.setData(data)
      appendAssistantMessage(summary)
      setFollowUpQuestions(followUp)
    } catch (error) {
      appendAssistantMessage(`生成失败：${error instanceof Error ? error.message : '未知错误'}`)
    } finally {
      setAiLoading(false)
    }
  }, [aiLoading, appendAssistantMessage])

  const handleDataChange = useCallback((data: GraphData) => {
    setGraphData(data)
    setZoomPercent(Math.round((data.canvas?.zoom ?? 1) * 100) || 100)
  }, [])

  return (
    <div style={shellStyle}>
      <TopBar
        title={graphData.meta?.title || currentLocale.example.common.untitled}
        zoomPercent={zoomPercent}
        editing={!readonly}
        lang={currentLanguage}
        texts={currentLocale.example.topBar}
        onToggleEdit={() => setReadonly(prev => !prev)}
        onToggleLanguage={handleToggleLanguage}
        onTemplates={handleOpenTemplates}
        onAiDraw={handleToggleAiPanel}
        onNewChat={handleClearAiChat}
        onShare={handleShare}
        onExit={handleExit}
      />

      <UniDraw
        key={currentLanguage}
        ref={drawRef}
        value={graphData}
        locale={currentLocale}
        assets={assets}
        assetPage={assetPage}
        assetTotalPages={assetTotalPages}
        assetPageLoading={assetsLoading}
        canPrevAssets={assetPage > 1}
        canNextAssets={assetPage < assetTotalPages}
        templates={templates}
        readonly={readonly}
        showAiPanel
        onAssetsPrevPage={goToPreviousAssetPage}
        onAssetsNextPage={goToNextAssetPage}
        onAiGenerate={handleAiGenerate}
        onReady={handleReady}
        onChange={handleDataChange}
        style={{ flex: 1 }}
      />
    </div>
  )
}