import { ref, watch, nextTick, onMounted, onUnmounted, type Ref } from 'vue'
import { useAlignment } from './useAlignment'
import { useStyleEditor, type EdgeViewData } from './useStyleEditor'
import { useSketch } from './useSketch'
import type { GraphData, NodeData, EdgeData, MaterialItem, NodeStyle } from '../shared'
import { PRIMARY_COLOR, DEFAULT_PORTS, EDGE_SHAPES, shortId } from '../shared'
import { buildTableAttrs, buildTableMarkup, createDefaultTableData, normalizeTableData } from '../shapes/basic/table'
import {
  AntVRenderEngine,
  GraphManager,
  ExportService,
  GraphEventBus,
  ZoomTool,
  PanTool,
  MiniMapTool,
  ShortcutManager,
  NodeFactory,
  ClipboardManager,
  GroupManager,
} from '../core'
import type { MiniMapOptions } from '../core/tool/MiniMapTool'
import { highlightEdge, unhighlightEdge } from '../core/graph/highlight'

export interface UseCanvasOptions {
  modelValue: Ref<GraphData>
  readonly?: boolean
  minimap?: boolean
  grid?: boolean
  snapline?: boolean
  keyboard?: boolean
  onDataChange?: (data: GraphData) => void
}

export interface ContextMenuState {
  visible: boolean
  x: number
  y: number
  hasSelection: boolean
  canPaste: boolean
  nodeSelectionCount: number
  edgeSelectionCount: number
  hasSingleNodeSelection: boolean
  allSelectedLocked: boolean
  canGroup: boolean
  canUngroup: boolean
}

export interface DrawBrushStyle {
  stroke: string
  strokeWidth: number
  strokeDasharray: string
  opacity: number
}

export interface UseCanvasReturn {
  containerRef: Ref<HTMLElement | null>
  zoom: Ref<number>
  canUndo: Ref<boolean>
  canRedo: Ref<boolean>
  panMode: Ref<boolean>
  sketchMode: Ref<boolean>
  drawMode: Ref<boolean>
  drawBrushStyle: Ref<DrawBrushStyle>
  sketchElementIds: Ref<Set<string>>
  selectedNodeData: Ref<NodeData | null>
  selectedEdgeData: Ref<EdgeViewData | null>
  selectionCount: Ref<number>
  contextMenuState: Ref<ContextMenuState>
  getData: () => GraphData
  setData: (data: GraphData) => void
  toJSON: () => string
  fromJSON: (json: string) => void
  toPNG: () => Promise<string>
  toSVG: () => Promise<string>
  zoomIn: () => void
  zoomOut: () => void
  zoomTo: (factor: number) => void
  zoomToFit: () => void
  undo: () => void
  redo: () => void
  addNode: (data: NodeData) => void
  addEdge: (data: EdgeData) => void
  removeNode: (id: string) => void
  removeEdge: (id: string) => void
  togglePanMode: () => boolean
  createNodeFromMaterial: (material: MaterialItem, position?: { x: number; y: number }) => NodeData
  createElementFromMaterial: (material: MaterialItem, position?: { x: number; y: number }) => NodeData | EdgeData
  screenToCanvas: (clientX: number, clientY: number) => { x: number; y: number }
  updateNodeStyle: (id: string, style: Record<string, unknown>) => void
  updateEdgeStyle: (id: string, style: Record<string, unknown>) => void
  changeEdgeType: (id: string, lineType: string) => void
  alignNodes: (direction: string) => void
  selectAll: () => void
  clearCanvas: () => void
  toggleDrawMode: () => boolean
  updateDrawBrushStyle: (style: Partial<DrawBrushStyle>) => void
  addPathNode: (x: number, y: number, width: number, height: number, d: string) => void
  toggleSketchMode: () => boolean
  toggleElementSketch: (id: string) => boolean
  isElementSketch: (id: string) => boolean
  applySketchToAll: () => void
  resetSketchFromAll: () => void
  resizeNode: (id: string, width: number, height: number) => void
  addTableRow: (id: string) => void
  addTableColumn: (id: string) => void
  deleteTableRow: (id: string) => void
  deleteTableColumn: (id: string) => void
  updateTableCell: (id: string, row: number, col: number, value: string) => void
  // 剪贴板操作
  copy: () => void
  cut: () => void
  paste: () => void
  duplicate: () => void
  // 删除
  deleteSelected: () => void
  // 层级操作
  moveUp: () => void
  moveDown: () => void
  toFront: () => void
  toBack: () => void
  // 翻转
  flipH: () => void
  flipV: () => void
  // 锁定
  toggleLock: () => void
  // 组合
  groupNodes: () => void
  ungroupNodes: () => void
  canGroup: Ref<boolean>
  canUngroup: Ref<boolean>
  groupEditMode: Ref<boolean>
  enterGroupEdit: () => void
  exitGroupEdit: () => void
  // 创建画框
  createFrame: () => void
  // 复制为图片
  copyAsPng: () => Promise<void>
  copyAsSvg: () => Promise<void>
  // 外部文件投放
  svgEditState: Ref<{ nodeId: string; content: string } | null>
  addExternalImage: (dataUrl: string, pos: { x: number; y: number }, width: number, height: number) => void
  addExternalSvg: (svgContent: string, pos: { x: number; y: number }, width: number, height: number) => void
  commitSvgEdit: (newContent: string) => void
  closeSvgEditor: () => void
  // 添加链接
  addLink: () => void
  // 上下文菜单
  showContextMenu: (x: number, y: number) => void
  hideContextMenu: () => void
  handleContextAction: (action: string) => void
  // minimap
  enableMinimap: (container: HTMLElement, options?: MiniMapOptions) => void
  disableMinimap: () => void
}

export function useCanvas(options: UseCanvasOptions): UseCanvasReturn {
  const containerRef = ref<HTMLElement | null>(null)
  const zoom = ref(1)
  const canUndo = ref(false)
  const canRedo = ref(false)
  const panMode = ref(false)
  const selectedNodeData = ref<NodeData | null>(null)
  const selectedEdgeData = ref<EdgeViewData | null>(null)
  const drawMode = ref(false)
  const drawBrushStyle = ref<DrawBrushStyle>({
    stroke: '#333333',
    strokeWidth: 2,
    strokeDasharray: '',
    opacity: 1,
  })
  const selectionCount = ref(0)
  const svgEditState = ref<{ nodeId: string; content: string } | null>(null)
  const canGroup = ref(false)
  const canUngroup = ref(false)
  const groupEditMode = ref(false)
  const contextMenuState = ref<ContextMenuState>({
    visible: false,
    x: 0,
    y: 0,
    hasSelection: false,
    canPaste: false,
    nodeSelectionCount: 0,
    edgeSelectionCount: 0,
    hasSingleNodeSelection: false,
    allSelectedLocked: false,
    canGroup: false,
    canUngroup: false,
  })

  let engine: AntVRenderEngine | null = null
  let graphManager: GraphManager | null = null
  let exportService: ExportService | null = null
  let eventBus: GraphEventBus | null = null
  let zoomTool: ZoomTool | null = null
  let panTool: PanTool | null = null
  let shortcutManager: ShortcutManager | null = null
  let clipboardManager: ClipboardManager | null = null
  let miniMapTool: MiniMapTool | null = null
  let groupManager: GroupManager | null = null
  let unwatchModelValue: (() => void) | null = null
  let isEmittingUpdate = false
  const autoVertexEdgeIds = new Set<string>()
  const autoVertexTolerance = 4

  function getGraph() {
    return engine?.getGraph() ?? null
  }

  function isSketchStraightEdge(edge: any): boolean {
    return edge?.shape === EDGE_SHAPES.SKETCH
  }

  function getAutoVertex(edge: any): { x: number; y: number } | null {
    if (isSketchStraightEdge(edge)) return null
    const src = edge.getSourcePoint?.()
    const tgt = edge.getTargetPoint?.()
    if (!src || !tgt) return null
    return { x: (src.x + tgt.x) / 2, y: (src.y + tgt.y) / 2 }
  }

  function isNearPoint(a: { x: number; y: number }, b: { x: number; y: number }): boolean {
    return Math.abs(a.x - b.x) <= autoVertexTolerance && Math.abs(a.y - b.y) <= autoVertexTolerance
  }

  function ensureAutoVertex(edge: any): void {
    const vertices = edge.getVertices?.() ?? []
    if (vertices.length > 0) return
    const vertex = getAutoVertex(edge)
    if (!vertex) return
    autoVertexEdgeIds.add(edge.id)
    edge.setVertices([vertex], { silent: true })
  }

  function syncAutoVertex(edge: any): void {
    if (!autoVertexEdgeIds.has(edge.id)) return
    const vertex = getAutoVertex(edge)
    if (!vertex) return
    const vertices = edge.getVertices?.() ?? []
    if (vertices.length === 1 && isNearPoint(vertices[0], vertex)) return
    edge.setVertices([vertex], { silent: true })
  }

  function releaseAutoVertex(edge: any): void {
    const vertices = edge.getVertices?.() ?? []
    const vertex = getAutoVertex(edge)
    if (autoVertexEdgeIds.has(edge.id) && vertices.length === 1 && vertex && isNearPoint(vertices[0], vertex)) {
      edge.setVertices([], { silent: true })
    }
    autoVertexEdgeIds.delete(edge.id)
  }

  function refreshAutoVertexState(edge: any): void {
    if (!autoVertexEdgeIds.has(edge.id)) return
    const vertices = edge.getVertices?.() ?? []
    const vertex = getAutoVertex(edge)
    if (!(vertices.length === 1 && vertex && isNearPoint(vertices[0], vertex))) {
      autoVertexEdgeIds.delete(edge.id)
    }
  }

  const sketch = useSketch(() => engine?.getGraph() ?? null)
  const {
    sketchMode,
    sketchElementIds,
    toggleSketchMode,
    toggleElementSketch,
    isElementSketch,
    applySketchToAll,
    resetSketchFromAll,
    onSketchNodeAdded,
    onSketchEdgeAdded,
    onSketchNodeChange,
    onSketchNodeAttrsChange,
    onSketchEdgeChange,
  } = sketch

  const { extractEdgeData, updateNodeStyle, updateEdgeStyle, changeEdgeType } = useStyleEditor(
    () => engine?.getGraph() ?? null,
    selectedEdgeData,
  )

  const { alignNodes } = useAlignment(() => getSelectedCells())

  function getSelectedCells(): any[] {
    const graph = getGraph()
    if (!graph) return []
    // 优先使用 graph.getSelectedCells()（Selection 插件注册后可用）
    if (typeof graph.getSelectedCells === 'function') {
      return graph.getSelectedCells()
    }
    // 降级：通过插件获取
    const selection = (graph as any).getPlugin?.('selection')
    return selection?.getSelectedCells?.() ?? []
  }

  function selectContextCell(cell: any): void {
    const graph = getGraph()
    if (!graph || !cell) return
    if (graph.isSelected?.(cell)) {
      updateContextMenuState()
      return
    }
    if (typeof (graph as any).cleanSelection === 'function') {
      ;(graph as any).cleanSelection()
    }
    if (typeof (graph as any).select === 'function') {
      ;(graph as any).select(cell)
    }
  }

  function clearContextSelection(): void {
    const graph = getGraph()
    if (!graph) return
    if (typeof (graph as any).cleanSelection === 'function') {
      ;(graph as any).cleanSelection()
    }
    selectedNodeData.value = null
    selectedEdgeData.value = null
    selectionCount.value = 0
    updateContextMenuState()
  }

  onMounted(() => {
    if (!containerRef.value) return

    eventBus = new GraphEventBus()
    engine = new AntVRenderEngine()
    const graph = engine.init(containerRef.value, {
      canvasConfig: options.modelValue.value.canvas,
      readonly: options.readonly,
      grid: options.grid,
      snapline: options.snapline,
      keyboard: options.keyboard,
      minimap: options.minimap,
    })

    graphManager = new GraphManager(graph, eventBus)
    exportService = new ExportService(graph)
    zoomTool = new ZoomTool(graph)
    panTool = new PanTool(graph)
    miniMapTool = new MiniMapTool(graph)
    shortcutManager = new ShortcutManager(graph)
    shortcutManager.registerAction('cut', () => cut())
    shortcutManager.registerAction('copy', () => copy())
    shortcutManager.registerAction('paste', () => paste())
    shortcutManager.registerAction('duplicate', () => duplicate())
    shortcutManager.registerAction('copyAsPng', () => copyAsPng())
    shortcutManager.registerAction('toBack', () => toBack())
    shortcutManager.registerAction('toFront', () => toFront())
    shortcutManager.registerAction('moveDown', () => moveDown())
    shortcutManager.registerAction('moveUp', () => moveUp())
    shortcutManager.registerAction('flipH', () => flipH())
    shortcutManager.registerAction('flipV', () => flipV())
    shortcutManager.registerAction('addLink', () => addLink())
    shortcutManager.registerAction('toggleLock', () => toggleLock())
    shortcutManager.registerAction('group', () => groupNodes())
    shortcutManager.registerAction('ungroup', () => ungroupNodes())
    shortcutManager.bind()
    clipboardManager = new ClipboardManager(graph)
    groupManager = new GroupManager(graph)

    // 监听历史变化（x6-plugin-history 事件）
    graph.on('history:change', () => {
      canUndo.value = (graph as any).canUndo?.() ?? false
      canRedo.value = (graph as any).canRedo?.() ?? false
    })

    // 监听画布数据变化
    eventBus.on('data:changed', (data: unknown) => {
      isEmittingUpdate = true
      options.onDataChange?.(data as GraphData)
      nextTick(() => { isEmittingUpdate = false })
    })

    // 监听缩放
    graph.on('scale', ({ sx }: { sx: number }) => {
      zoom.value = sx
    })

    graph.on('cell:contextmenu', ({ cell, e }: any) => {
      e?.preventDefault?.()
      e?.stopPropagation?.()
      selectContextCell(cell)
      showContextMenu(e?.clientX ?? 0, e?.clientY ?? 0)
    })
    graph.on('blank:contextmenu', ({ e }: any) => {
      e?.preventDefault?.()
      e?.stopPropagation?.()
      clearContextSelection()
      hideContextMenu()
    })

    // 监听节点/边选中
    graph.on('cell:selected', ({ cell }: any) => {
      if (cell.isNode?.()) {
        selectedNodeData.value = NodeFactory.toData(cell)
        selectedEdgeData.value = null
      } else if (cell.isEdge?.()) {
        selectedEdgeData.value = extractEdgeData(cell)
        selectedNodeData.value = null
        ensureAutoVertex(cell)
        highlightEdge(cell)
        const toolItems = isSketchStraightEdge(cell)
          ? []
          : [
              {
                name: 'segments',
                args: {
                  threshold: 12,
                  snapRadius: 10,
                  attrs: {
                    fill: PRIMARY_COLOR,
                    stroke: '#fff',
                    'stroke-width': 2,
                    width: 20,
                    height: 8,
                    x: -10,
                    y: -4,
                    rx: 4,
                    ry: 4,
                    cursor: 'move',
                  },
                },
              },
            ]
        if (toolItems.length > 0) {
          cell.setTools({ items: toolItems }, { async: false })
          const view = graph.findViewByCell(cell)
          if (view) {
            ;(view as any).renderTools?.()
          }
        }
      } else {
        selectedNodeData.value = null
        selectedEdgeData.value = null
      }
      // 更新选中节点数量
      selectionCount.value = (typeof graph.getSelectedCells === 'function'
        ? graph.getSelectedCells()
        : []
      ).filter((c: any) => c.isNode?.()).length
      updateContextMenuState()
    })
    graph.on('cell:unselected', ({ cell }: any) => {
      selectionCount.value = (typeof graph.getSelectedCells === 'function'
        ? graph.getSelectedCells()
        : []
      ).filter((c: any) => c.isNode?.()).length
      if (cell.isEdge?.()) {
        releaseAutoVertex(cell)
        unhighlightEdge(cell)
        // 卸载边工具
        const view = graph.findViewByCell(cell)
        if (view) {
          try { view.removeTools() } catch {}
        }
      }
      selectedNodeData.value = null
      selectedEdgeData.value = null
      updateContextMenuState()
    })

    // 监听选中节点的属性变更（大小/位置/样式），实现双向绑定
    graph.on('node:change:size', ({ node }: any) => {
      if (selectedNodeData.value && selectedNodeData.value.id === node.id) {
        selectedNodeData.value = NodeFactory.toData(node)
      }
    })
    graph.on('node:change:attrs', ({ node }: any) => {
      if (selectedNodeData.value && selectedNodeData.value.id === node.id) {
        selectedNodeData.value = NodeFactory.toData(node)
      }
    })
    graph.on('node:change:data', ({ node }: any) => {
      if (selectedNodeData.value && selectedNodeData.value.id === node.id) {
        selectedNodeData.value = NodeFactory.toData(node)
      }
    })
    graph.on('node:change:position', ({ node }: any) => {
      if (selectedNodeData.value && selectedNodeData.value.id === node.id) {
        selectedNodeData.value = NodeFactory.toData(node)
      }
    })

    // 监听选中边的属性变更
    graph.on('edge:change:attrs', ({ edge }: any) => {
      if (selectedEdgeData.value && selectedEdgeData.value.id === edge.id) {
        selectedEdgeData.value = extractEdgeData(edge)
      }
    })
    graph.on('edge:change:vertices', ({ edge }: any) => {
      refreshAutoVertexState(edge)
      if (selectedEdgeData.value && selectedEdgeData.value.id === edge.id) {
        selectedEdgeData.value = extractEdgeData(edge)
      }
    })
    graph.on('edge:change:source', ({ edge }: any) => {
      syncAutoVertex(edge)
      if (selectedEdgeData.value && selectedEdgeData.value.id === edge.id) {
        selectedEdgeData.value = extractEdgeData(edge)
      }
    })
    graph.on('edge:change:target', ({ edge }: any) => {
      syncAutoVertex(edge)
      if (selectedEdgeData.value && selectedEdgeData.value.id === edge.id) {
        selectedEdgeData.value = extractEdgeData(edge)
      }
    })
    graph.on('edge:change:connector', ({ edge }: any) => {
      if (selectedEdgeData.value && selectedEdgeData.value.id === edge.id) {
        selectedEdgeData.value = extractEdgeData(edge)
      }
    })
    graph.on('edge:change:router', ({ edge }: any) => {
      if (selectedEdgeData.value && selectedEdgeData.value.id === edge.id) {
        selectedEdgeData.value = extractEdgeData(edge)
      }
    })
    graph.on('edge:removed', ({ edge }: any) => {
      autoVertexEdgeIds.delete(edge.id)
    })
    graph.on('node:change:position', ({ node }: any) => {
      graph.getConnectedEdges(node).forEach((edge: any) => syncAutoVertex(edge))
    })

    // 双击 group 节点进入编辑模式；双击 SVG 节点打开 SVG 代码编辑器
    graph.on('node:dblclick', ({ node, e }: any) => {
      if (node.shape === 'basic-group') {
        e.stopPropagation()
        enterGroupEdit()
        return
      }
      if (node.shape !== 'basic-svg') return
      const data = node.getData() ?? {}
      svgEditState.value = { nodeId: node.id, content: (data.svgContent as string) ?? '' }
    })

    // 双击空白区域：若处于 group 编辑模式则退出
    graph.on('blank:dblclick', () => {
      if (groupEditMode.value) {
        exitGroupEdit()
      }
    })

    // 拖拽入组：节点被拖入父容器时自动成为子节点
    graph.on('node:embedded', ({ node: embeddedNode, currentParent }: any) => {
      if (!groupManager || !currentParent) return
      if (currentParent.shape === 'basic-group') {
        // X6 已经处理了 addChild，这里只需要调整 group 大小
        groupManager.fitGroupSize(currentParent)
      }
    })

    // 草图模式事件监听（始终注册，内部通过 sketchElementIds 过滤）
    graph.on('node:added', onSketchNodeAdded)
    graph.on('edge:added', onSketchEdgeAdded)
    graph.on('node:change:size', onSketchNodeChange)
    graph.on('node:change:attrs', onSketchNodeAttrsChange)
    graph.on('edge:change:vertices', onSketchEdgeChange)
    graph.on('edge:change:source', onSketchEdgeChange)
    graph.on('edge:change:target', onSketchEdgeChange)
    // 节点移动时，orth 路由路径会改变，需重绘关联的草图边
    graph.on('node:change:position', ({ node }: any) => {
      if (sketchElementIds.value.size === 0) return
      graph.getConnectedEdges(node).forEach((e: any) => {
        if (sketchElementIds.value.has(e.id)) onSketchEdgeChange({ edge: e })
      })
    })

    // 加载初始数据
    graphManager.loadData(options.modelValue.value)

    // 双向绑定（忽略自身触发的更新，避免循环加载）
    unwatchModelValue = watch(
      () => options.modelValue.value,
      (newData: GraphData) => {
        if (isEmittingUpdate) return
        if (graphManager) {
          graphManager.loadData(newData)
        }
      },
      { deep: true },
    )
  })

  onUnmounted(() => {
    unwatchModelValue?.()
    shortcutManager?.unbind()
    miniMapTool?.disable()
    engine?.dispose()
    eventBus?.clear()
  })

  function updateContextMenuState() {
    const selected = getSelectedCells()
    const nodeSelectionCount = selected.filter((cell: any) => cell.isNode?.()).length
    const edgeSelectionCount = selected.filter((cell: any) => cell.isEdge?.()).length
    const allSelectedLocked = selected.length > 0 && selected.every((cell: any) => cell.getData?.()?.locked === true)
    // canGroup: 至少 2 个节点，且都不是 group 本身，且都不在其他 group 内
    const nextCanGroup = nodeSelectionCount >= 2
      && selected.filter((c: any) => c.isNode?.()).every((n: any) => {
        if (n.shape === 'basic-group') return false
        const parent = n.getParent?.()
        return !parent
      })
    // canUngroup: 选中的是 group 节点
    const nextCanUngroup = selected.some((cell: any) => cell.isNode?.() && cell.shape === 'basic-group')
    canGroup.value = nextCanGroup
    canUngroup.value = nextCanUngroup
    contextMenuState.value = {
      ...contextMenuState.value,
      hasSelection: selected.length > 0,
      canPaste: clipboardManager?.hasContent() ?? false,
      nodeSelectionCount,
      edgeSelectionCount,
      hasSingleNodeSelection: nodeSelectionCount === 1 && edgeSelectionCount === 0,
      allSelectedLocked,
      canGroup: nextCanGroup,
      canUngroup: nextCanUngroup,
    }
  }

  function getSelectionViewBox(padding = 10): { x: number; y: number; width: number; height: number } | undefined {
    const graph = getGraph()
    if (!graph) return undefined
    const selected = getSelectedCells()
    if (selected.length === 0) return undefined
    const bbox = (graph as any).getCellsBBox?.(selected)
    if (!bbox) return undefined
    return {
      x: bbox.x - padding,
      y: bbox.y - padding,
      width: bbox.width + padding * 2,
      height: bbox.height + padding * 2,
    }
  }

  // ==================== 基础操作 ====================

  function getData(): GraphData {
    return graphManager?.exportData() ?? options.modelValue.value
  }

  function setData(data: GraphData): void {
    graphManager?.loadData(data)
  }

  function toJSON(): string {
    return exportService?.toJSON(getData()) ?? '{}'
  }

  function fromJSON(json: string): void {
    const data = exportService?.fromJSON(json)
    if (data) setData(data)
  }

  async function toPNG(): Promise<string> {
    return exportService?.toPNG() ?? ''
  }

  async function toSVG(): Promise<string> {
    return exportService?.toSVG() ?? ''
  }

  function zoomIn(): void {
    zoomTool?.zoomIn()
  }

  function zoomOut(): void {
    zoomTool?.zoomOut()
  }

  function zoomTo(factor: number): void {
    zoomTool?.zoomTo(factor)
  }

  function zoomToFit(): void {
    zoomTool?.zoomToFit()
  }

  function undo(): void {
    const graph = getGraph()
    if (graph) (graph as any).undo?.()
  }

  function redo(): void {
    const graph = getGraph()
    if (graph) (graph as any).redo?.()
  }

  function addNode(data: NodeData): void {
    graphManager?.addNode(data)
  }

  function addEdge(data: EdgeData): void {
    graphManager?.addEdge(data)
  }

  function removeNode(id: string): void {
    graphManager?.removeNode(id)
  }

  function removeEdge(id: string): void {
    graphManager?.removeEdge(id)
  }

  function togglePanMode(): boolean {
    const enabled = panTool?.toggle() ?? false
    panMode.value = enabled
    return enabled
  }

  function isEdgeMaterial(material: MaterialItem): boolean {
    return Object.values(EDGE_SHAPES).includes(material.shape as typeof EDGE_SHAPES[keyof typeof EDGE_SHAPES])
  }

  function updateSelectedNodeSnapshot(node: any): void {
    if (selectedNodeData.value && selectedNodeData.value.id === node.id) {
      selectedNodeData.value = NodeFactory.toData(node)
    }
  }

  function applyTableNodeData(node: any, table: unknown): void {
    const normalized = normalizeTableData(table)
    const style = ((NodeFactory.toData(node).style ?? {}) as Record<string, unknown>)
    node.setMarkup(buildTableMarkup(normalized))
    node.setAttrs(buildTableAttrs(normalized, style as any), { overwrite: true })
    node.setData({ table: normalized }, { overwrite: false })
    const width = node.getSize?.().width ?? 240
    const height = node.getSize?.().height ?? 120
    const nextWidth = Math.max(width, normalized.cols * 80)
    const nextHeight = Math.max(height, normalized.rows * 36)
    if (nextWidth !== width || nextHeight !== height) {
      node.resize(nextWidth, nextHeight)
    }
    updateSelectedNodeSnapshot(node)
  }

  function withSelectedTableNode(id: string, fn: (node: any, table: ReturnType<typeof normalizeTableData>) => void): void {
    const graph = getGraph()
    if (!graph) return
    const cell = graph.getCellById(id)
    if (!cell || !cell.isNode?.() || cell.shape !== 'basic-table') return
    const table = normalizeTableData((cell.getData?.() ?? {}).table)
    fn(cell, table)
  }

  function createNodeFromMaterial(
    material: MaterialItem,
    position?: { x: number; y: number },
  ): NodeData {
    let materialData = material.data ? { ...material.data } : undefined
    if (material.shape === 'basic-table') {
      materialData ??= {}
      materialData.table = normalizeTableData(materialData.table ?? createDefaultTableData())
    }
    const nodeData: NodeData = {
      id: shortId('node'),
      shape: material.shape,
      position: position ?? { x: 100, y: 100 },
      size: { ...material.defaultSize },
      label: material.defaultLabel ?? material.name,
      ports: material.defaultPorts,
      ...(material.defaultStyle ? { style: material.defaultStyle as NodeStyle } : {}),
      ...(materialData ? { data: materialData } : {}),
    }
    addNode(nodeData)
    return nodeData
  }

  function createEdgeFromMaterial(
    material: MaterialItem,
    position?: { x: number; y: number },
  ): EdgeData {
    const center = position ?? { x: 100, y: 100 }
    const halfWidth = Math.max((material.defaultSize?.width ?? 100) / 2, 40)
    const edgeData: EdgeData = {
      id: shortId('edge'),
      shape: material.shape,
      source: { x: center.x - halfWidth, y: center.y },
      target: { x: center.x + halfWidth, y: center.y },
      ...(material.defaultLabel ? { label: material.defaultLabel } : {}),
      ...(material.data ? { data: { ...material.data } } : {}),
    }
    addEdge(edgeData)
    return edgeData
  }

  function createElementFromMaterial(
    material: MaterialItem,
    position?: { x: number; y: number },
  ): NodeData | EdgeData {
    return isEdgeMaterial(material)
      ? createEdgeFromMaterial(material, position)
      : createNodeFromMaterial(material, position)
  }

  function screenToCanvas(clientX: number, clientY: number): { x: number; y: number } {
    const graph = getGraph()
    if (!graph) return { x: clientX, y: clientY }
    const local = graph.clientToLocal({ x: clientX, y: clientY })
    return { x: local.x, y: local.y }
  }

  // ==================== 清空画布 ====================

  function clearCanvas(): void {
    const graph = getGraph()
    if (!graph) return
    graph.clearCells()
  }

  // ==================== 手绘模式 ====================

  function toggleDrawMode(): boolean {
    drawMode.value = !drawMode.value
    const graph = getGraph()
    if (!graph) return drawMode.value
    // 手绘模式开启时禁用 X6 交互，关闭时恢复
    if (drawMode.value) {
      graph.disableSelection()
      graph.disableRubberband()
    } else {
      graph.enableSelection()
    }
    return drawMode.value
  }

  function updateDrawBrushStyle(style: Partial<DrawBrushStyle>): void {
    drawBrushStyle.value = {
      ...drawBrushStyle.value,
      ...style,
    }
  }

  // ==================== 外部文件投放 ====================


  function addExternalImage(
    dataUrl: string,
    pos: { x: number; y: number },
    width: number,
    height: number,
  ): void {
    const graph = getGraph()
    if (!graph) return
    graph.addNode({
      id: `img-${Date.now()}`,
      shape: 'basic-image',
      x: pos.x - width / 2,
      y: pos.y - height / 2,
      width,
      height,
      attrs: {
        image: { 'xlink:href': dataUrl, refWidth: '100%', refHeight: '100%', x: 0, y: 0 },
      },
      data: { imageHref: dataUrl },
      ports: DEFAULT_PORTS as any,
    })
  }

  function addExternalSvg(
    svgContent: string,
    pos: { x: number; y: number },
    width: number,
    height: number,
  ): void {
    const graph = getGraph()
    if (!graph) return
    const href = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgContent)}`
    graph.addNode({
      id: `svg-${Date.now()}`,
      shape: 'basic-svg',
      x: pos.x - width / 2,
      y: pos.y - height / 2,
      width,
      height,
      attrs: {
        image: { 'xlink:href': href, refWidth: '100%', refHeight: '100%', x: 0, y: 0 },
      },
      data: { imageHref: href, svgContent },
      ports: DEFAULT_PORTS as any,
    })
  }

  function commitSvgEdit(newContent: string): void {
    if (!svgEditState.value) return
    const graph = getGraph()
    if (!graph) return
    const node = graph.getCellById(svgEditState.value.nodeId)
    if (!node || !(node as any).isNode?.()) return
    const href = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(newContent)}`
    ;(node as any).setAttrByPath('image/xlink:href', href)
    ;(node as any).setData({ imageHref: href, svgContent: newContent }, { overwrite: false })
    svgEditState.value = null
  }

  function closeSvgEditor(): void {
    svgEditState.value = null
  }

  function addPathNode(x: number, y: number, width: number, height: number, d: string): void {
    const graph = getGraph()
    if (!graph) return
    const id = `freehand-${Date.now()}`
    const brush = drawBrushStyle.value
    graph.addNode({
      id,
      shape: 'path',
      x,
      y,
      width,
      height,
      attrs: {
        body: {
          d,
          fill: 'none',
          stroke: brush.stroke,
          strokeWidth: brush.strokeWidth,
          strokeDasharray: brush.strokeDasharray || null,
          opacity: brush.opacity,
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
        },
      },
    })
  }

  function selectAll(): void {
    const graph = getGraph()
    if (!graph) return
    const cells = [...graph.getNodes(), ...graph.getEdges()]
    if (cells.length > 0 && typeof (graph as any).select === 'function') {
      ;(graph as any).select(cells)
    }
  }


  // ==================== 剪贴板操作 ====================

  function resizeNode(id: string, width: number, height: number): void {
    const graph = getGraph()
    if (!graph) return
    const cell = graph.getCellById(id)
    if (cell && cell.isNode()) {
      cell.resize(width, height)
    }
  }

  function addTableRow(id: string): void {
    withSelectedTableNode(id, (node, table) => {
      const next = normalizeTableData({
        rows: table.rows + 1,
        cols: table.cols,
        cells: [...table.cells, Array.from({ length: table.cols }, () => '')],
      })
      applyTableNodeData(node, next)
    })
  }

  function addTableColumn(id: string): void {
    withSelectedTableNode(id, (node, table) => {
      const next = normalizeTableData({
        rows: table.rows,
        cols: table.cols + 1,
        cells: table.cells.map((row, rowIndex) => [...row, rowIndex === 0 ? `列${table.cols + 1}` : '']),
      })
      applyTableNodeData(node, next)
    })
  }

  function deleteTableRow(id: string): void {
    withSelectedTableNode(id, (node, table) => {
      if (table.rows <= 1) return
      applyTableNodeData(node, {
        rows: table.rows - 1,
        cols: table.cols,
        cells: table.cells.slice(0, -1),
      })
    })
  }

  function deleteTableColumn(id: string): void {
    withSelectedTableNode(id, (node, table) => {
      if (table.cols <= 1) return
      const nextCols = table.cols - 1
      const nextCells = table.cells.map((row, rowIndex) => {
        const trimmed = row.slice(0, nextCols)
        if (rowIndex === 0) {
          return trimmed.map((value, colIndex) => value || `列${colIndex + 1}`)
        }
        return trimmed
      })
      applyTableNodeData(node, {
        rows: table.rows,
        cols: nextCols,
        cells: nextCells,
      })
    })
  }

  function updateTableCell(id: string, row: number, col: number, value: string): void {
    withSelectedTableNode(id, (node, table) => {
      if (row < 0 || col < 0 || row >= table.rows || col >= table.cols) return
      const nextCells = table.cells.map((cellRow, rowIndex) => (
        rowIndex === row
          ? cellRow.map((cellValue, colIndex) => (colIndex === col ? value : cellValue))
          : [...cellRow]
      ))
      applyTableNodeData(node, {
        rows: table.rows,
        cols: table.cols,
        cells: nextCells,
      })
    })
  }

  // ==================== 剪贴板操作 ====================

  function copy(): void {
    const cells: any[] = getSelectedCells()
    if (cells.length > 0) {
      clipboardManager?.copy(cells)
      updateContextMenuState()
    }
  }

  function cut(): void {
    const cells: any[] = getSelectedCells()
    if (cells.length > 0) {
      clipboardManager?.cut(cells)
      updateContextMenuState()
    }
  }

  function paste(): void {
    const graph = getGraph()
    const added = clipboardManager?.paste() ?? []
    if (graph && added.length > 0) {
      if (typeof (graph as any).cleanSelection === 'function') {
        ;(graph as any).cleanSelection()
      }
      if (typeof (graph as any).select === 'function') {
        ;(graph as any).select(added)
      }
    }
    updateContextMenuState()
  }

  function duplicate(): void {
    const graph = getGraph()
    const cells = getSelectedCells()
    if (graph && cells.length > 0) {
      clipboardManager?.copy(cells)
      const added = clipboardManager?.paste() ?? []
      if (typeof (graph as any).cleanSelection === 'function') {
        ;(graph as any).cleanSelection()
      }
      if (typeof (graph as any).select === 'function') {
        ;(graph as any).select(added)
      }
      updateContextMenuState()
    }
  }

  // ==================== 删除 ====================

  function deleteSelected(): void {
    const graph = getGraph()
    if (!graph) return
    const cells = getSelectedCells().filter((c: any) => c.getData?.()?.locked !== true)
    if (cells.length > 0) {
      graph.removeCells(cells)
    }
  }

  // ==================== 层级操作 ====================

  function moveUp(): void {
    const graph = getGraph()
    if (!graph) return
    const selected = getSelectedCells()
    if (selected.length === 0) return
    const selectedIds = new Set(selected.map((c: any) => c.id))
    const allCells: any[] = [...graph.getNodes(), ...graph.getEdges()]
    // 从 z 最高的选中元素开始处理，避免多选时相互干扰
    const sorted = [...selected].sort((a: any, b: any) =>
      (b.getZIndex?.() ?? 0) - (a.getZIndex?.() ?? 0),
    )
    for (const cell of sorted) {
      const curZ = cell.getZIndex?.() ?? 0
      const aboveZs = allCells
        .filter((c: any) => !selectedIds.has(c.id) && (c.getZIndex?.() ?? 0) > curZ)
        .map((c: any) => c.getZIndex?.() ?? 0)
      if (aboveZs.length === 0) continue
      cell.setZIndex(Math.min(...aboveZs) + 1)
    }
  }

  function moveDown(): void {
    const graph = getGraph()
    if (!graph) return
    const selected = getSelectedCells()
    if (selected.length === 0) return
    const selectedIds = new Set(selected.map((c: any) => c.id))
    const allCells: any[] = [...graph.getNodes(), ...graph.getEdges()]
    // 从 z 最低的选中元素开始处理
    const sorted = [...selected].sort((a: any, b: any) =>
      (a.getZIndex?.() ?? 0) - (b.getZIndex?.() ?? 0),
    )
    for (const cell of sorted) {
      const curZ = cell.getZIndex?.() ?? 0
      const belowZs = allCells
        .filter((c: any) => !selectedIds.has(c.id) && (c.getZIndex?.() ?? 0) < curZ)
        .map((c: any) => c.getZIndex?.() ?? 0)
      if (belowZs.length === 0) continue
      cell.setZIndex(Math.max(...belowZs) - 1)
    }
  }

  function toFront(): void {
    const graph = getGraph()
    if (!graph) return
    const selected = getSelectedCells()
    if (selected.length === 0) return
    const selectedIds = new Set(selected.map((c: any) => c.id))
    const allCells: any[] = [...graph.getNodes(), ...graph.getEdges()]
    const unselectedZs = allCells
      .filter((c: any) => !selectedIds.has(c.id))
      .map((c: any) => c.getZIndex?.() ?? 0)
    if (unselectedZs.length === 0) return
    const maxZ = Math.max(...unselectedZs)
    selected.forEach((cell: any, i: number) => cell.setZIndex(maxZ + 1 + i))
  }

  function toBack(): void {
    const graph = getGraph()
    if (!graph) return
    const selected = getSelectedCells()
    if (selected.length === 0) return
    const selectedIds = new Set(selected.map((c: any) => c.id))
    const allCells: any[] = [...graph.getNodes(), ...graph.getEdges()]
    const unselectedZs = allCells
      .filter((c: any) => !selectedIds.has(c.id))
      .map((c: any) => c.getZIndex?.() ?? 0)
    if (unselectedZs.length === 0) return
    const minZ = Math.min(...unselectedZs)
    selected.forEach((cell: any, i: number) =>
      cell.setZIndex(minZ - selected.length + i),
    )
  }

  // ==================== 翻转 ====================

  function flipH(): void {
    const cells = getSelectedCells()
    cells.forEach((cell: any) => {
      if (cell.isNode()) {
        const node = cell as any
        const currentScale = node.getScale?.() ?? { sx: 1, sy: 1 }
        node.scale(-currentScale.sx, currentScale.sy)
      }
    })
  }

  function flipV(): void {
    const cells = getSelectedCells()
    cells.forEach((cell: any) => {
      if (cell.isNode()) {
        const node = cell as any
        const currentScale = node.getScale?.() ?? { sx: 1, sy: 1 }
        node.scale(currentScale.sx, -currentScale.sy)
      }
    })
  }

  // ==================== 锁定 ====================

  function toggleLock(): void {
    const graph = getGraph()
    const cells = getSelectedCells()
    cells.forEach((cell: any) => {
      const isLocked = cell.getData()?.locked === true
      const nextLocked = !isLocked
      cell.setData({ ...cell.getData(), locked: nextLocked })
      if (nextLocked && graph?.isSelected?.(cell)) {
        graph.unselect(cell)
      }
    })
  }

  // ==================== 组合 ====================

  function groupNodes(): void {
    const graph = getGraph()
    if (!graph || !groupManager) return
    const cells = getSelectedCells()
    const nodes = cells.filter((c: any) => c.isNode?.())
    if (nodes.length < 2) return

    const group = groupManager.createGroup(nodes)
    if (group) {
      if (typeof (graph as any).cleanSelection === 'function') {
        ;(graph as any).cleanSelection()
      }
      if (typeof (graph as any).select === 'function') {
        ;(graph as any).select(group)
      }
    }
  }

  function ungroupNodes(): void {
    const graph = getGraph()
    if (!graph || !groupManager) return
    const cells = getSelectedCells()
    const groups = cells.filter((c: any) => c.isNode?.() && c.shape === 'basic-group')
    if (groups.length === 0) return

    groupManager.ungroup(groups.map((g: any) => g.id))
  }

  function enterGroupEdit(): void {
    if (!groupManager) return
    const cells = getSelectedCells()
    const group = cells.find((c: any) => c.isNode?.() && c.shape === 'basic-group')
    if (group) {
      groupManager.enterEditMode(group.id)
      groupEditMode.value = true
    }
  }

  function exitGroupEdit(): void {
    if (!groupManager) return
    groupManager.exitEditMode()
    groupEditMode.value = false
  }

  // ==================== 创建画框 ====================

  function createFrame(): void {
    const graph = getGraph()
    const cells = getSelectedCells()
    if (!graph || cells.length === 0) return

    const nodes = cells.filter((c) => c.isNode())
    if (nodes.length === 0) return

    let minX = Infinity; let minY = Infinity
    let maxX = -Infinity; let maxY = -Infinity

    nodes.forEach((n: any) => {
      const pos = (n as any).getPosition?.() ?? { x: 0, y: 0 }
      const size = (n as any).getSize?.() ?? { width: 100, height: 60 }
      minX = Math.min(minX, pos.x)
      minY = Math.min(minY, pos.y)
      maxX = Math.max(maxX, pos.x + size.width)
      maxY = Math.max(maxY, pos.y + size.height)
    })

    const padding = 20
    const frameData: NodeData = {
      id: shortId('frame'),
      shape: 'rect',
      position: { x: minX - padding, y: minY - padding },
      size: { width: maxX - minX + padding * 2, height: maxY - minY + padding * 2 },
      style: { fill: 'transparent', stroke: PRIMARY_COLOR, strokeWidth: 2, dashed: true },
    }
    addNode(frameData)
  }

  // ==================== 复制为图片 ====================

  async function copyAsPng(): Promise<void> {
    const graph = getGraph()
    if (!graph) return
    const selectionViewBox = getSelectionViewBox()
    try {
      const dataUrl = await exportService?.toPNG(selectionViewBox
        ? { backgroundColor: '#ffffff', viewBox: selectionViewBox }
        : { backgroundColor: '#ffffff', padding: 10 })
      if (!dataUrl) return
      const response = await fetch(dataUrl)
      const blob = await response.blob()
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob }),
      ])
    } catch {
      const dataUrl = await exportService?.toPNG(selectionViewBox
        ? { backgroundColor: '#ffffff', viewBox: selectionViewBox }
        : { backgroundColor: '#ffffff', padding: 10 })
      if (!dataUrl) return
      const img = new Image()
      img.src = dataUrl
      img.onload = () => {
        const canvas = document.createElement('canvas')
        canvas.width = img.width
        canvas.height = img.height
        const ctx = canvas.getContext('2d')
        ctx?.drawImage(img, 0, 0)
        canvas.toBlob(async (blob) => {
          if (blob) {
            try {
              await navigator.clipboard.write([
                new ClipboardItem({ 'image/png': blob }),
              ])
            } catch { /* 忽略 */ }
          }
        })
      }
    }
  }

  async function copyAsSvg(): Promise<void> {
    try {
      const selectionViewBox = getSelectionViewBox()
      const svgText = await exportService?.toSVG(selectionViewBox
        ? { viewBox: selectionViewBox }
        : { padding: 10 })
      if (!svgText) return
      await navigator.clipboard.writeText(svgText)
    } catch { /* 忽略 */ }
  }

  // ==================== 添加链接 ====================

  function addLink(): void {
    const cells = getSelectedCells()
    const nodes = cells.filter((c) => c.isNode())
    if (nodes.length < 2) return

    // 在选中的前两个节点之间创建一条边
    const sourceId = nodes[0].id
    const targetId = nodes[1].id
    const edgeData: EdgeData = {
      id: shortId('edge'),
      shape: 'edge',
      source: { cell: sourceId },
      target: { cell: targetId },
    }
    addEdge(edgeData)
  }

  // ==================== 上下文菜单 ====================

  function showContextMenu(x: number, y: number): void {
    updateContextMenuState()
    contextMenuState.value = {
      ...contextMenuState.value,
      visible: true,
      x,
      y,
    }
  }

  function hideContextMenu(): void {
    contextMenuState.value = {
      ...contextMenuState.value,
      visible: false,
    }
  }

  function enableMinimap(container: HTMLElement, options?: MiniMapOptions): void {
    miniMapTool?.enable(container, options)
  }

  function disableMinimap(): void {
    miniMapTool?.disable()
  }

  function handleContextAction(action: string): void {
    hideContextMenu()
    switch (action) {
      case 'cut': cut(); break
      case 'copy': copy(); break
      case 'paste': paste(); break
      case 'duplicate': duplicate(); break
      case 'delete': deleteSelected(); break
      case 'createFrame': createFrame(); break
      case 'moveUp': moveUp(); break
      case 'moveDown': moveDown(); break
      case 'toTop': toFront(); break
      case 'toBottom': toBack(); break
      case 'flipH': flipH(); break
      case 'flipV': flipV(); break
      case 'toggleLock': toggleLock(); break
      case 'addLink': addLink(); break
      case 'copyAsPng': copyAsPng(); break
      case 'copyAsSvg': copyAsSvg(); break
      case 'group': groupNodes(); break
      case 'ungroup': ungroupNodes(); break
    }
  }

  return {
    containerRef,
    zoom,
    canUndo,
    canRedo,
    panMode,
    sketchMode,
    drawMode,
    drawBrushStyle,
    sketchElementIds,
    selectedNodeData,
    selectedEdgeData,
    selectionCount,
    contextMenuState,
    getData,
    setData,
    toJSON,
    fromJSON,
    toPNG,
    toSVG,
    zoomIn,
    zoomOut,
    zoomTo,
    zoomToFit,
    undo,
    redo,
    addNode,
    addEdge,
    removeNode,
    removeEdge,
    togglePanMode,
    createNodeFromMaterial,
    createElementFromMaterial,
    screenToCanvas,
    updateNodeStyle,
    updateEdgeStyle,
    changeEdgeType,
    alignNodes,
    selectAll,
    clearCanvas,
    toggleDrawMode,
    updateDrawBrushStyle,
    addPathNode,
    toggleSketchMode,
    toggleElementSketch,
    isElementSketch,
    applySketchToAll,
    resetSketchFromAll,
    resizeNode,
    addTableRow,
    addTableColumn,
    deleteTableRow,
    deleteTableColumn,
    updateTableCell,
    copy,
    cut,
    paste,
    duplicate,
    deleteSelected,
    moveUp,
    moveDown,
    toFront,
    toBack,
    flipH,
    flipV,
    toggleLock,
    groupNodes,
    ungroupNodes,
    canGroup,
    canUngroup,
    groupEditMode,
    enterGroupEdit,
    exitGroupEdit,
    createFrame,
    copyAsPng,
    copyAsSvg,
    svgEditState,
    addExternalImage,
    addExternalSvg,
    commitSvgEdit,
    closeSvgEditor,
    addLink,
    showContextMenu,
    hideContextMenu,
    handleContextAction,
    enableMinimap,
    disableMinimap,
  }
}
