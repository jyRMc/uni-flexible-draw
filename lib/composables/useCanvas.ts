import { ref, watch, nextTick, onMounted, onUnmounted, type Ref } from 'vue'
import { useAlignment } from './useAlignment'
import { useStyleEditor, type EdgeViewData } from './useStyleEditor'
import { useSketch } from './useSketch'
import type { GraphData, NodeData, EdgeData, MaterialItem, NodeStyle } from '@uni-draw/shared'
import { PRIMARY_COLOR, DEFAULT_PORTS, EDGE_SHAPES, getEdgeLineType, getEdgeLineVertices, isSameEdgeVertices, shortId } from '@uni-draw/shared'
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
} from '@uni-draw/core'

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
  const contextMenuState = ref<ContextMenuState>({
    visible: false,
    x: 0,
    y: 0,
    hasSelection: false,
    canPaste: false,
  })

  let engine: AntVRenderEngine | null = null
  let graphManager: GraphManager | null = null
  let exportService: ExportService | null = null
  let eventBus: GraphEventBus | null = null
  let zoomTool: ZoomTool | null = null
  let panTool: PanTool | null = null
  let miniMapTool: MiniMapTool | null = null
  let shortcutManager: ShortcutManager | null = null
  let clipboardManager: ClipboardManager | null = null
  let unwatchModelValue: (() => void) | null = null
  let isEmittingUpdate = false
  const autoVertexEdgeMap = new Map<string, Array<{ x: number; y: number }>>()
  const autoVertexTolerance = 4

  function getGraph() {
    return engine?.getGraph() ?? null
  }

  function getAutoVertices(edge: any): Array<{ x: number; y: number }> {
    const src = edge.getSourcePoint?.()
    const tgt = edge.getTargetPoint?.()
    const lineType = getEdgeLineType(edge.getRouter?.(), edge.getConnector?.(), edge.getData?.())
    return getEdgeLineVertices(lineType, src, tgt)
  }

  function isAutoVertices(current: Array<{ x: number; y: number }>, expected: Array<{ x: number; y: number }>): boolean {
    return isSameEdgeVertices(current, expected, autoVertexTolerance)
  }

  function ensureAutoVertex(edge: any): void {
    const expected = getAutoVertices(edge)
    if (expected.length === 0) return
    const vertices = edge.getVertices?.() ?? []
    if (vertices.length > 0) return
    autoVertexEdgeMap.set(edge.id, expected)
    edge.setVertices(expected, { silent: true })
  }

  function syncAutoVertex(edge: any): void {
    const previous = autoVertexEdgeMap.get(edge.id)
    if (!previous) return
    const expected = getAutoVertices(edge)
    const vertices = edge.getVertices?.() ?? []
    if (expected.length === 0) {
      if (isAutoVertices(vertices, previous)) {
        edge.setVertices([], { silent: true })
      }
      autoVertexEdgeMap.delete(edge.id)
      return
    }
    if (isAutoVertices(vertices, expected)) {
      autoVertexEdgeMap.set(edge.id, expected)
      return
    }
    edge.setVertices(expected, { silent: true })
    autoVertexEdgeMap.set(edge.id, expected)
  }

  function releaseAutoVertex(edge: any): void {
    const vertices = edge.getVertices?.() ?? []
    const expected = autoVertexEdgeMap.get(edge.id)
    if (expected && isAutoVertices(vertices, expected)) {
      edge.setVertices([], { silent: true })
    }
    autoVertexEdgeMap.delete(edge.id)
  }

  function refreshAutoVertexState(edge: any): void {
    const expected = autoVertexEdgeMap.get(edge.id)
    if (!expected) return
    const vertices = edge.getVertices?.() ?? []
    if (!isAutoVertices(vertices, expected)) {
      autoVertexEdgeMap.delete(edge.id)
    }
  }

  function renderEdgeEditTools(edge: any): void {
    const graph = getGraph()
    if (!graph) return
    edge.setTools({
      items: [
        {
          name: 'vertices',
          args: {
            addable: false,
            attrs: {
              fill: '#fff',
              stroke: PRIMARY_COLOR,
              'stroke-width': 2,
              r: 5,
              cursor: 'move',
            },
          },
        },
        { name: 'source-arrowhead', args: { attrs: { fill: PRIMARY_COLOR, r: 5 } } },
        { name: 'target-arrowhead', args: { attrs: { fill: PRIMARY_COLOR, r: 5 } } },
      ],
    }, { async: false })
    const view = graph.findViewByCell(edge)
    if (view) {
      ;(view as any).renderTools?.()
    }
  }

  function removeEdgeEditTools(edge: any): void {
    const graph = getGraph()
    if (!graph) return
    const view = graph.findViewByCell(edge)
    if (view) {
      try { view.removeTools() } catch {}
    }
  }

  function showEdgeEditToolsOnHover(edge: any): void {
    const graph = getGraph()
    if (!graph || graph.isSelected?.(edge)) return
    ensureAutoVertex(edge)
    renderEdgeEditTools(edge)
  }

  function hideEdgeEditToolsOnHover(edge: any): void {
    const graph = getGraph()
    if (!graph || graph.isSelected?.(edge)) return
    removeEdgeEditTools(edge)
    releaseAutoVertex(edge)
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
    shortcutManager.bind()
    clipboardManager = new ClipboardManager(graph)

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

    graph.on('edge:mouseenter', ({ edge }: any) => {
      showEdgeEditToolsOnHover(edge)
    })
    graph.on('edge:mouseleave', ({ edge }: any) => {
      hideEdgeEditToolsOnHover(edge)
    })

    // 监听节点/边选中
    graph.on('cell:selected', ({ cell }: any) => {
      if (cell.isNode?.()) {
        selectedNodeData.value = NodeFactory.toData(cell)
        selectedEdgeData.value = null
      } else if (cell.isEdge?.()) {
        selectedEdgeData.value = extractEdgeData(cell)
        selectedNodeData.value = null
        removeEdgeEditTools(cell)
        releaseAutoVertex(cell)
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
        removeEdgeEditTools(cell)
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
      syncAutoVertex(edge)
      if (selectedEdgeData.value && selectedEdgeData.value.id === edge.id) {
        selectedEdgeData.value = extractEdgeData(edge)
      }
    })
    graph.on('edge:change:router', ({ edge }: any) => {
      syncAutoVertex(edge)
      if (selectedEdgeData.value && selectedEdgeData.value.id === edge.id) {
        selectedEdgeData.value = extractEdgeData(edge)
      }
    })
    graph.on('edge:removed', ({ edge }: any) => {
      autoVertexEdgeMap.delete(edge.id)
    })
    graph.on('node:change:position', ({ node }: any) => {
      graph.getConnectedEdges(node).forEach((edge: any) => syncAutoVertex(edge))
    })

    // SVG 节点双击 → 打开 SVG 代码编辑器
    graph.on('node:dblclick', ({ node }: any) => {
      if (node.shape !== 'basic-svg') return
      const data = node.getData() ?? {}
      svgEditState.value = { nodeId: node.id, content: (data.svgContent as string) ?? '' }
    })

    // 草图模式事件监听（始终注册，内部通过 sketchElementIds 过滤）
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
    engine?.dispose()
    eventBus?.clear()
  })

  function updateContextMenuState() {
    const selected = getSelectedCells()
    contextMenuState.value = {
      ...contextMenuState.value,
      hasSelection: selected.length > 0,
      canPaste: clipboardManager?.hasContent() ?? false,
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

  function createNodeFromMaterial(
    material: MaterialItem,
    position?: { x: number; y: number },
  ): NodeData {
    const nodeData: NodeData = {
      id: shortId('node'),
      shape: material.shape,
      position: position ?? { x: 100, y: 100 },
      size: { ...material.defaultSize },
      label: material.defaultLabel ?? material.name,
      ports: material.defaultPorts,
      ...(material.defaultStyle ? { style: material.defaultStyle as NodeStyle } : {}),
      ...(material.data ? { data: { ...material.data } } : {}),
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
    clipboardManager?.paste()
    updateContextMenuState()
  }

  function duplicate(): void {
    const cells = getSelectedCells()
    if (cells.length > 0) {
      clipboardManager?.copy(cells)
      clipboardManager?.paste()
      updateContextMenuState()
    }
  }

  // ==================== 删除 ====================

  function deleteSelected(): void {
    const graph = getGraph()
    if (!graph) return
    const cells = getSelectedCells()
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
    const cells = getSelectedCells()
    cells.forEach((cell: any) => {
      const isLocked = cell.getData()?.locked === true
      cell.setData({ ...cell.getData(), locked: !isLocked })
      // 锁定后不可移动
      if (!isLocked) {
        cell.setProp('movable', false)
      } else {
        cell.setProp('movable', true)
      }
    })
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
    try {
      // 导出选中区域或整个画布
      const dataUrl = await exportService?.toPNG({ backgroundColor: '#ffffff', padding: 10 })
      if (!dataUrl) return
      const response = await fetch(dataUrl)
      const blob = await response.blob()
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob }),
      ])
    } catch {
      // 降级：通过 canvas 复制
      const dataUrl = await exportService?.toPNG({ backgroundColor: '#ffffff', padding: 10 })
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
      const svgText = await exportService?.toSVG({ padding: 10 })
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
  }
}
