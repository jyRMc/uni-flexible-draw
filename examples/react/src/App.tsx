import { useRef, useState, useCallback, useEffect } from 'react'
import type { CSSProperties } from 'react'
import { UniDraw, type UniDrawRef } from '@uni-draw/draw/react'
import TopBar from './components/TopBar'
import type { AssetItem, GraphData, TemplateItem } from '@uni-draw/draw'
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

export default function App() {
  const drawRef = useRef<UniDrawRef>(null)
  const [assets, setAssets] = useState<AssetItem[]>([])
  const [assetPage, setAssetPage] = useState(1)
  const [assetTotalPages, setAssetTotalPages] = useState(1)
  const [assetsLoading, setAssetsLoading] = useState(false)
  const [assetsPaginated, setAssetsPaginated] = useState(false)
  const [readonly, setReadonly] = useState(false)
  const [zoomPercent, setZoomPercent] = useState(100)
  const [graphData, setGraphData] = useState<GraphData>({
    canvas: { backgroundColor: '#ffffff', grid: { size: 10, visible: true, type: 'dot' }, zoom: 1 },
    nodes: [],
    edges: [],
  })

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
      navigator.clipboard.writeText(json).then(() => alert('已复制 JSON 到剪贴板'))
    }
  }, [])

  const handleToggleAiPanel = useCallback(() => {
    drawRef.current?.toggleAiPanel()
  }, [])

  const handleOpenTemplates = useCallback(() => {
    drawRef.current?.openTemplatePanel()
  }, [])

  const handleClearAiChat = useCallback(() => {
    drawRef.current?.clearAiChat()
  }, [])

  const handleExit = useCallback(() => {
    if (window.confirm('确定要退出吗？')) {
      window.close()
    }
  }, [])

  const handleReady = useCallback(async () => {
    const diag = await diagnoseSiliconFlow()
    drawRef.current?.applyAiResult(undefined, `🔌 API 连通诊断: ${diag}`, [
      '如何绘制流程图？', '如何绘制 UML 类图？', '如何绘制实体关系图？',
    ])
  }, [])

  const handleAiGenerate = useCallback(async (prompt: string, _context: GraphData) => {
    try {
      const data = await generateGraph(prompt, (_token, full) => {
        drawRef.current?.applyAiResult(undefined, full)
      })
      const nodeLabels = data.nodes.map(node => node.label || node.shape).filter(Boolean)
      const summary = `已为你生成${data.meta?.title ?? '图表'}，包含 ${data.nodes.length} 个节点和 ${data.edges.length} 条边。\n\n图中包含：\n${nodeLabels.map(label => `• ${label}`).join('\n')}`
      const followUp = data.meta?.type === 'flowchart'
        ? ['能否添加异常处理分支？', '如何将这个流程优化？']
        : ['如何扩展这个架构？', '有哪些可以优化的地方？']
      drawRef.current?.applyAiResult(data, summary, followUp)
    } catch (error) {
      drawRef.current?.applyAiResult(undefined, `生成失败：${error instanceof Error ? error.message : '未知错误'}`)
    }
  }, [])

  const handleDataChange = useCallback((data: GraphData) => {
    setGraphData(data)
    setZoomPercent(Math.round((data.canvas?.zoom ?? 1) * 100) || 100)
  }, [])

  return (
    <div style={shellStyle}>
      <TopBar
        title={graphData.meta?.title || '未命名图表'}
        zoomPercent={zoomPercent}
        editing={!readonly}
        onToggleEdit={() => setReadonly(prev => !prev)}
        onTemplates={handleOpenTemplates}
        onAiDraw={handleToggleAiPanel}
        onNewChat={handleClearAiChat}
        onShare={handleShare}
        onExit={handleExit}
      />

      <UniDraw
        ref={drawRef}
        value={graphData}
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