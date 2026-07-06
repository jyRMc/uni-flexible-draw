import './styles/unidraw.css'
import { AntVRenderEngine } from './core/engine/AntVRenderEngine'
import { GraphManager } from './core/graph/GraphManager'
import { ExportService } from './core/export/ExportService'
import { showMessage } from './core/message/MessageService'
import { GraphEventBus } from './core/event/GraphEventBus'
import { ZoomTool } from './core/tool/ZoomTool'
import { ShortcutManager } from './core/shortcut/ShortcutManager'
import { registerAllShapes } from './shapes/register'
import { getAllLibraries } from './materials'
import type { AssetItem, EdgeData, GraphData, MaterialItem, NodeData, TemplateItem } from './shared/types'

import zhCN from './locale/zh-CN'
import type { UniDrawLocale } from './locale'
import { PRIMARY_COLOR } from './shared/constants/theme'
import { getConnectorConfig, getConnectorOptions, getEdgeLabelPosition, getMarkerOptions, getRouterConfig, getRouterOptions, getStrokeDasharray, getStrokeStyleOptions, inferConnectorName, inferEdgeLabelPosition, inferMarkerName, inferRouterName, inferStrokeStyleName } from './shared'
import { type NativeColorPickerInstance, createNativeColorPicker } from './components/ColorPicker/native'
import { icons } from './assets/icons'

// ─── Public types ──────────────────────────────────────────────────────────

export interface UniDrawOptions {
  /** Initial graph data */
  initialData?: GraphData
  /** External assets (SVGs / images) for the assets tab */
  assets?: AssetItem[]
  /** Current external assets page */
  assetPage?: number
  /** Total external assets pages */
  assetTotalPages?: number
  /** Whether external assets pagination is loading */
  assetPageLoading?: boolean
  /** Whether previous assets page is available */
  canPrevAssets?: boolean
  /** Whether next assets page is available */
  canNextAssets?: boolean
  /** Fired when the internal assets previous-page button is clicked */
  onAssetsPrevPage?: () => void
  /** Fired when the internal assets next-page button is clicked */
  onAssetsNextPage?: () => void
  /** External templates for the templates tab */
  templates?: TemplateItem[]
  /** Show shape sidebar (default: true) */
  showShapePanel?: boolean
  /** Show assets tab (default: true) */
  showAssetsPanel?: boolean
  /** Show templates tab (default: true) */
  showTemplates?: boolean
  /** Show toolbar strip (default: true) */
  showToolbar?: boolean
  /** Show properties panel (default: true) */
  showPropertiesPanel?: boolean
  /** Enable background grid (default: true) */
  grid?: boolean
  /** Enable snap-to-grid lines (default: true) */
  snapline?: boolean
  /** Read-only mode */
  readonly?: boolean
  locale?: UniDrawLocale
  /** Called once the canvas is ready */
  onReady?: () => void
  /** Fired whenever the selection changes */
  onSelectionChange?: (nodes: NodeData[], edges: EdgeData[]) => void
  /** Fired whenever graph data changes */
  onDataChange?: (data: GraphData) => void
  /** Upload handler for image nodes: receives a File, returns a URL string (or Promise<string>) */
  uploadApi?: (file: File) => string | Promise<string>
}

// ─── SVG icon references ──────────────────────────────────────────────────

const ICONS = {
  undo: icons['toolbar/undo'],
  redo: icons['toolbar/redo'],
  zoomIn: icons['toolbar/zoom-in'],
  zoomOut: icons['toolbar/zoom-out'],
  zoomFit: icons['toolbar/zoom-fit'],
  panelLeftClose: icons['toolbar/panel-left-close'],
  panelLeftOpen: icons['toolbar/panel-left-open'],
  trash: icons['toolbar/trash'],
  download: icons['toolbar/download'],
  svg: icons['toolbar/svg'],
  json: icons['toolbar/json'],
  close: icons['toolbar/close'],
}

// ─── DOM helpers ────────────────────────────────────────────────────────────

function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  cls: string,
  html = '',
): HTMLElementTagNameMap[K] {
  const e = document.createElement(tag)
  if (cls) {
    e.className = cls
  }
  if (html) {
    e.innerHTML = html
  }
  return e
}

function btn(cls: string, title: string, icon: string, onClick: () => void): HTMLButtonElement {
  const b = el('button', cls, icon)
  b.title = title
  b.addEventListener('click', onClick)
  return b
}

function materialPreviewSvg(shape: string): string {
  const palette = (() => {
    if (shape.startsWith('flowchart-'))
      return { fill: '#fff7e6', stroke: '#fa8c16' }
    if (shape.startsWith('edge-'))
      return { fill: '#f5f5f5', stroke: '#7166F0' }
    if (shape.startsWith('uml-'))
      return { fill: '#f9f0ff', stroke: '#722ed1' }
    if (shape.startsWith('er-'))
      return { fill: '#fff1f0', stroke: '#f5222d' }
    if (shape.startsWith('state-'))
      return { fill: '#f6ffed', stroke: '#52c41a' }
    if (shape.startsWith('dfd-'))
      return { fill: '#e6fffb', stroke: '#13c2c2' }
    if (shape.startsWith('swimlane-'))
      return { fill: '#f0f5ff', stroke: '#2f54eb' }
    if (shape.startsWith('sequence-'))
      return { fill: '#fffbe6', stroke: '#faad14' }
    return { fill: '#eef1f8', stroke: '#5b6b88' }
  })()

  const SHAPE_MAP: Record<string, string> = {
    'basic-rect': 'rect',
    'basic-rounded-rect': 'rounded-rect',
    'basic-circle': 'circle',
    'basic-diamond': 'diamond',
    'basic-triangle': 'triangle',
    'basic-parallelogram': 'parallelogram',
    'basic-trapezoid': 'trapezoid',
    'basic-hexagon': 'hexagon',
    'basic-pentagon': 'pentagon',
    'basic-octagon': 'octagon',
    'basic-star': 'star',
    'basic-cross': 'cross',
    'basic-cylinder': 'cylinder',
    'basic-cloud': 'cloud',
    'basic-document': 'document',
    'basic-table': 'table',
    'basic-text': 'text-lines',
    'basic-image': 'image',
    'flowchart-process': 'rect',
    'flowchart-connector': 'circle',
    'flowchart-decision': 'diamond',
    'flowchart-merge': 'triangle',
    'flowchart-input-output': 'parallelogram',
    'flowchart-database': 'cylinder',
    'flowchart-document': 'document',
    'uml-class': 'rect',
    'uml-actor': 'actor',
    'uml-use-case': 'ellipse',
    'uml-package': 'package',
    'uml-note': 'document',
    'er-entity': 'rect',
    'er-relationship': 'diamond',
    'er-attribute': 'ellipse',
    'er-weak-entity': 'double-rect',
    'er-key-attribute': 'underline-ellipse',
    'er-multivalued': 'double-ellipse',
    'state-simple': 'rounded-rect',
    'state-choice': 'diamond',
    'state-initial': 'filled-circle',
    'state-final': 'bullseye',
    'state-fork': 'bar',
    'state-join': 'bar',
    'dfd-process': 'circle',
    'dfd-external-entity': 'double-rect',
    'dfd-data-store': 'parallel-lines-h',
    'swimlane-horizontal': 'swimlane-h',
    'swimlane-vertical': 'swimlane-v',
    'swimlane-pool': 'swimlane-pool',
    'sequence-actor': 'actor',
    'sequence-lifeline': 'sequence-lifeline',
    'sequence-activation': 'sequence-activation',
    'edge-line': 'edge-line',
    'edge-sketch': 'edge-sketch',
    'edge-dashed': 'edge-dashed',
    'edge-arrow': 'edge-arrow',
    'edge-double-arrow': 'edge-double-arrow',
    'edge-curve': 'edge-curve',
    'edge-orthogonal': 'edge-orthogonal',
  }

  const templateName = SHAPE_MAP[shape] ?? 'default'
  const template = icons[`shape-preview/${templateName}`]
  if (!template) {
    return ''
  }
  return template
    .replace(/__FILL__/g, palette.fill)
    .replace(/__STROKE__/g, palette.stroke)
}

// ─── Main class ─────────────────────────────────────────────────────────────

export class UniDraw {
  private opts: UniDrawOptions
  private root: HTMLElement

  // Core services
  private engine = new AntVRenderEngine()
  private eventBus = new GraphEventBus()
  private graphManager!: GraphManager
  private exportService!: ExportService
  private zoomTool!: ZoomTool
  private shortcutMgr!: ShortcutManager

  // Toolbar state refs
  private undoBtn!: HTMLButtonElement
  private redoBtn!: HTMLButtonElement
  private zoomLabel!: HTMLSpanElement
  private sidebarOpenBtn: HTMLButtonElement | null = null
  private sidebarOpenDivider: HTMLDivElement | null = null
  private sidebarEl: HTMLDivElement | null = null
  private sidebarTabs = new Map<'shapes' | 'assets' | 'templates', HTMLButtonElement>()
  private sidebarPanels = new Map<'shapes' | 'assets' | 'templates', HTMLDivElement>()
  private activeSidebarTab: 'shapes' | 'assets' | 'templates' | null = null
  private sidebarVisible = true

  // Properties panel state
  private propertiesBody!: HTMLDivElement
  private propertiesPanelEl: HTMLDivElement | null = null
  private propertiesTitleEl: HTMLSpanElement | null = null
  private selectedNodeId: string | null = null
  private selectedEdgeId: string | null = null
  private propertyColorPickers: NativeColorPickerInstance[] = []
  private propertiesHidden = false

  private get t(): UniDrawLocale {
    return this.opts.locale ?? zhCN
  }

  constructor(container: HTMLElement, options: UniDrawOptions = {}) {
    this.opts = options
    this.root = el('div', 'ud-root')
    container.appendChild(this.root)

    registerAllShapes()

    this.buildLayout()
    this.initGraph()
    this.buildShapePanel()
    this.wireEvents()

    if (options.initialData) {
      this.setData(options.initialData)
    }

    setTimeout(() => options.onReady?.(), 0)
  }

  // ── Layout construction ────────────────────────────────────────────────────

  private buildLayout(): void {
    // 只读模式隐藏工具栏、侧边栏、属性面板
    const isReadonly = this.opts.readonly === true
    const showToolbar = !isReadonly && this.opts.showToolbar !== false
    const showSidebar = !isReadonly && this.opts.showShapePanel !== false
    const showProperties = !isReadonly && this.opts.showPropertiesPanel !== false

    const body = el('div', 'ud-body')
    if (showSidebar)
      body.appendChild(this.buildSidebar())

    const canvasWrap = el('div', 'ud-canvas-area') as HTMLDivElement
    const canvasDom = el('div', 'ud-canvas')
    canvasWrap.appendChild(canvasDom)
    if (!isReadonly) {
      canvasWrap.addEventListener('dragover', (event: DragEvent) => event.preventDefault())
      canvasWrap.addEventListener('drop', (event: DragEvent) => {
        event.preventDefault()
        this.handleExternalDrop(event)
      })
    }
    ;(this as any)._canvasEl = canvasDom

    if (showProperties)
      canvasWrap.appendChild(this.buildPropertiesPanel())
    if (showToolbar)
      canvasWrap.appendChild(this.buildToolbar())

    body.appendChild(canvasWrap)

    this.root.appendChild(body)
    this.updateSidebarVisibility()
  }

  private buildToolbar(): HTMLElement {
    const bar = el('div', 'toolbar-float')
    const t = this.t

    this.undoBtn = btn('tb-btn', `${t.toolbar.undo} (Ctrl+Z)`, ICONS.undo, () => this.undo())
    this.redoBtn = btn('tb-btn', `${t.toolbar.redo} (Ctrl+Y)`, ICONS.redo, () => this.redo())
    this.undoBtn.disabled = true
    this.redoBtn.disabled = true

    const sep = () => el('div', 'tb-divider')
    this.zoomLabel = el('span', 'tb-zoom', '100%') as HTMLSpanElement
    this.sidebarOpenDivider = sep() as HTMLDivElement
    this.sidebarOpenBtn = btn('tb-btn', t.panel.openShapePanel, ICONS.panelLeftOpen, () => this.toggleLeftPanel())

    bar.append(
      this.undoBtn,
      this.redoBtn,
      this.sidebarOpenDivider,
      this.sidebarOpenBtn,
      sep(),
      btn('tb-btn', `${t.contextMenu.delete} (Delete)`, ICONS.trash, () => this.deleteSelection()),
      sep(),
      btn('tb-btn', t.toolbar.zoomOut, ICONS.zoomOut, () => this.zoomTool?.zoomOut()),
      this.zoomLabel,
      btn('tb-btn', t.toolbar.zoomIn, ICONS.zoomIn, () => this.zoomTool?.zoomIn()),
      btn('tb-btn', t.toolbar.fitCanvas, ICONS.zoomFit, () => this.zoomTool?.zoomToFit({ padding: 24 })),
      sep(),
      btn('tb-btn', t.toolbar.exportJson, ICONS.json, () => this.exportJSONToFile()),
      btn('tb-btn', t.toolbar.exportPng, ICONS.download, () => this.exportPNGToFile()),
      btn('tb-btn', t.toolbar.exportSvg, ICONS.svg, () => this.exportSVGToFile()),
    )

    return bar
  }

  private buildSidebar(): HTMLElement {
    const aside = el('div', 'ud-left-panel')
    this.sidebarEl = aside
    const t = this.t
    const header = el('div', 'ud-panel-header')
    const tabs = el('div', 'ud-panel-tabs')
    const panels = el('div', 'ud-sidebar-panels')
    const showAssetPagination = (this.opts.assetTotalPages ?? 1) > 1 || this.opts.assetPageLoading === true
    const showAssetsTab = this.opts.showAssetsPanel !== false && (((this.opts.assets?.length ?? 0) > 0) || showAssetPagination)
    const addPanel = (key: 'shapes' | 'assets' | 'templates'): void => {
      const panel = el('div', 'ud-sidebar-scroll') as HTMLDivElement
      this.sidebarPanels.set(key, panel)
      panels.appendChild(panel)
    }
    const addTab = (key: 'shapes' | 'assets' | 'templates', title: string): void => {
      const tab = el('button', 'ud-tab', title) as HTMLButtonElement
      tab.type = 'button'
      tab.addEventListener('click', () => this.setSidebarTab(key))
      this.sidebarTabs.set(key, tab)
      tabs.appendChild(tab)
      addPanel(key)
    }

    addTab('shapes', t.panel.shapes)
    if (showAssetsTab)
      addTab('assets', t.panel.assets)
    if (this.opts.showTemplates !== false)
      addPanel('templates')

    const closeBtn = btn('qac-close', t.panel.close, ICONS.close, () => this.closeLeftPanel())
    closeBtn.type = 'button'
    header.append(tabs, closeBtn)
    aside.append(header, panels)

    const firstTab = this.sidebarTabs.keys().next().value as 'shapes' | 'assets' | 'templates' | undefined
    if (firstTab)
      this.setSidebarTab(firstTab)

    return aside
  }

  private buildShapePanel(): void {
    const scroll = this.sidebarPanels.get('shapes')
    if (!scroll)
      return
    const t = this.t

    scroll.innerHTML = ''

    const libs = getAllLibraries()
    const panel = el('div', 'shape-panel')
    const searchWrap = el('div', 'shape-panel-search')
    const searchInput = document.createElement('input')
    searchInput.type = 'text'
    searchInput.placeholder = t.panel.searchShapes
    searchInput.className = 'shape-panel-search-input'
    searchWrap.appendChild(searchInput)

    const content = el('div', 'shape-panel-content') as HTMLDivElement

    const render = (query: string): void => {
      content.innerHTML = ''
      const normalized = query.trim().toLowerCase()
      const filteredLibraries = normalized
        ? libs
            .map(lib => ({
              ...lib,
              items: lib.items.filter(item => item.name.toLowerCase().includes(normalized) || item.shape.toLowerCase().includes(normalized)),
            }))
            .filter(lib => lib.items.length > 0)
        : libs

      if (filteredLibraries.length === 0) {
        content.appendChild(el('div', 'ud-empty-state', t.panel.noShapesFound))
        return
      }

      for (const lib of filteredLibraries) {
        const group = el('div', 'shape-category')
        const header = el('div', 'shape-category-header')
        const arrow = el('span', 'shape-category-arrow expanded', '›')
        const localizedLibraryName = t.panel.shapeCategories[lib.id as keyof typeof t.panel.shapeCategories] ?? lib.name
        const name = el('span', 'shape-category-name', localizedLibraryName)
        const count = el('span', 'shape-category-count', String(lib.items.length))
        header.append(arrow, name, count)

        const itemsWrap = el('div', 'shape-category-items') as HTMLDivElement
        let expanded = true

        for (const item of lib.items) {
          const cell = el('div', 'shape-category-item', materialPreviewSvg(item.shape)) as HTMLDivElement
          cell.title = item.name
          cell.draggable = true
          cell.addEventListener('click', () => this.addElementFromMaterial(item))
          cell.addEventListener('dragstart', (event: DragEvent) => this.handleMaterialDragStart(item, event))
          itemsWrap.appendChild(cell)
        }

        header.addEventListener('click', () => {
          expanded = !expanded
          arrow.classList.toggle('expanded', expanded)
          itemsWrap.style.display = expanded ? 'grid' : 'none'
        })

        group.append(header, itemsWrap)
        content.appendChild(group)
      }
    }

    searchInput.addEventListener('input', () => render(searchInput.value))
    render('')

    panel.append(searchWrap, content)
    scroll.appendChild(panel)

    this.buildAssetsPanel()
    this.buildTemplatesPanel()
  }

  private buildAssetsPanel(): void {
    const panel = this.sidebarPanels.get('assets')
    if (!panel)
      return
    const t = this.t

    panel.innerHTML = ''

    const assets = this.opts.assets ?? []
    const page = this.opts.assetPage ?? 1
    const totalPages = this.opts.assetTotalPages ?? 1
    const isLoading = this.opts.assetPageLoading === true
    const canPrev = this.opts.canPrevAssets ?? page > 1
    const canNext = this.opts.canNextAssets ?? page < totalPages
    const showPagination = totalPages > 1 || isLoading

    const content = el('div', 'ud-assets-panel')
    const grid = el('div', 'ud-assets-grid')
    content.appendChild(grid)
    panel.appendChild(content)

    if (assets.length === 0) {
      grid.appendChild(el('div', 'ud-assets-empty', t.panel.noAssets))
    }
    else {
      for (const asset of assets) {
        const material = this.createAssetMaterial(asset)
        const cell = el('div', 'ud-asset-cell') as HTMLDivElement
        cell.draggable = true
        cell.addEventListener('click', () => this.addElementFromMaterial(material))
        cell.addEventListener('dragstart', (event: DragEvent) => this.handleMaterialDragStart(material, event))

        if (asset.type === 'image') {
          const img = document.createElement('img')
          img.className = 'ud-asset-icon-image'
          img.src = asset.content
          img.alt = asset.name
          cell.appendChild(img)
        }
        else {
          const wrap = el('div', 'ud-asset-icon-wrap') as HTMLDivElement
          wrap.innerHTML = asset.content
          cell.appendChild(wrap)
        }

        grid.appendChild(cell)
      }
    }

    if (!showPagination)
      return

    const pagination = el('div', 'ud-assets-pagination')
    const prevBtn = el('button', 'ud-assets-page-btn', t.panel.previousPage) as HTMLButtonElement
    prevBtn.type = 'button'
    prevBtn.disabled = !canPrev || isLoading
    prevBtn.addEventListener('click', () => this.opts.onAssetsPrevPage?.())
    const indicator = el('span', 'ud-assets-page-indicator', `${page} / ${totalPages}`)
    const nextBtn = el('button', 'ud-assets-page-btn', t.panel.nextPage) as HTMLButtonElement
    nextBtn.type = 'button'
    nextBtn.disabled = !canNext || isLoading
    nextBtn.addEventListener('click', () => this.opts.onAssetsNextPage?.())
    pagination.append(prevBtn, indicator, nextBtn)
    content.appendChild(pagination)
  }

  private buildTemplatesPanel(): void {
    const panel = this.sidebarPanels.get('templates')
    if (!panel)
      return
    const t = this.t

    panel.innerHTML = ''

    const templates = this.opts.templates ?? []
    if (templates.length === 0) {
      panel.appendChild(el('div', 'ud-empty-state', t.templatePanel.empty))
      return
    }

    const list = el('div', 'ud-template-list')
    for (const template of templates) {
      const card = el('div', 'ud-template-card')
      const preview = el('div', 'ud-template-preview')

      if (template.thumbnail) {
        const img = document.createElement('img')
        img.src = template.thumbnail
        img.alt = template.name
        preview.appendChild(img)
      }
      else {
        preview.textContent = `${template.data.nodes.length} ${t.templatePanel.nodes} / ${template.data.edges.length} ${t.templatePanel.edges}`
      }

      const info = el('div', 'ud-template-info')
      info.append(
        el('div', 'ud-template-title', template.name),
        el('div', 'ud-template-desc', template.description ?? t.templatePanel.defaultDescription),
      )

      if (template.tags?.length) {
        const tags = el('div', 'ud-template-tags')
        for (const tag of template.tags) {
          tags.appendChild(el('span', 'ud-template-tag', tag))
        }
        info.appendChild(tags)
      }

      const applyBtn = el('button', 'ud-template-apply', t.templatePanel.use) as HTMLButtonElement
      applyBtn.type = 'button'
      applyBtn.addEventListener('click', () => this.applyTemplate(template))

      card.append(preview, info, applyBtn)
      list.appendChild(card)
    }

    panel.appendChild(list)
  }

  private buildPropertiesPanel(): HTMLElement {
    const aside = el('div', 'quick-action-card ud-properties-card') as HTMLDivElement
    this.propertiesPanelEl = aside
    const t = this.t

    const header = el('div', 'qac-header')
    this.propertiesTitleEl = el('span', 'qac-title', t.properties.title) as HTMLSpanElement
    const closeBtn = el('button', 'qac-close', ICONS.close) as HTMLButtonElement
    closeBtn.type = 'button'
    closeBtn.title = t.properties.close
    closeBtn.addEventListener('click', () => {
      this.propertiesHidden = true
      this.updatePropertiesPanelVisibility()
    })
    header.append(this.propertiesTitleEl, closeBtn)

    this.propertiesBody = el('div', 'qac-body ud-properties-body') as HTMLDivElement
    aside.append(header, this.propertiesBody)
    this.updatePropertiesPanel()
    this.updatePropertiesPanelVisibility()
    return aside
  }

  private setSidebarTab(tab: 'shapes' | 'assets' | 'templates'): void {
    if (this.activeSidebarTab === tab)
      return

    this.activeSidebarTab = tab

    for (const [key, tabButton] of this.sidebarTabs) {
      tabButton.classList.toggle('active', key === tab)
    }

    for (const [key, panel] of this.sidebarPanels) {
      panel.style.display = key === tab ? 'block' : 'none'
    }
  }

  private openLeftPanel(): void {
    this.sidebarVisible = true
    this.updateSidebarVisibility()
  }

  private closeLeftPanel(): void {
    this.sidebarVisible = false
    this.updateSidebarVisibility()
  }

  private toggleLeftPanel(): void {
    this.sidebarVisible = !this.sidebarVisible
    this.updateSidebarVisibility()
  }

  private updateSidebarVisibility(): void {
    if (this.sidebarEl) {
      this.sidebarEl.style.display = this.sidebarVisible ? 'flex' : 'none'
    }
    if (this.sidebarOpenBtn) {
      this.sidebarOpenBtn.title = this.sidebarVisible ? this.t.panel.close : this.t.panel.openShapePanel
      this.sidebarOpenBtn.innerHTML = this.sidebarVisible ? ICONS.panelLeftClose : ICONS.panelLeftOpen
      this.sidebarOpenBtn.classList.toggle('active', this.sidebarVisible)
    }
  }

  private updatePropertiesPanelVisibility(): void {
    if (!this.propertiesPanelEl)
      return
    const visible = this.opts.showPropertiesPanel !== false
      && !this.propertiesHidden
      && !!(this.selectedNodeId || this.selectedEdgeId)
    this.propertiesPanelEl.style.display = visible ? 'block' : 'none'
  }

  // ── Graph initialisation ───────────────────────────────────────────────────

  private initGraph(): void {
    const canvasEl: HTMLElement = (this as any)._canvasEl
    const graph = this.engine.init(canvasEl, {
      grid: this.opts.grid !== false,
      snapline: this.opts.snapline !== false,
      readonly: this.opts.readonly,
    })
    ;(this as any)._graph = graph

    this.graphManager = new GraphManager(graph, this.eventBus)
    this.exportService = new ExportService(graph)
    this.zoomTool = new ZoomTool(graph)
    this.shortcutMgr = new ShortcutManager(graph)

    this.shortcutMgr.bind()
  }

  // ── Event wiring ───────────────────────────────────────────────────────────

  private wireEvents(): void {
    const graph = (this as any)._graph
    if (!graph)
      return

    // Undo / redo button state
    graph.on('history:change', () => {
      const canUndo = graph.canUndo?.() ?? false
      const canRedo = graph.canRedo?.() ?? false
      if (this.undoBtn)
        this.undoBtn.disabled = !canUndo
      if (this.redoBtn)
        this.redoBtn.disabled = !canRedo
    })

    // Zoom label
    graph.on('scale', ({ sx }: { sx: number }) => {
      if (this.zoomLabel)
        this.zoomLabel.textContent = `${Math.round(sx * 100)}%`
    })

    // Selection
    graph.on('selection:changed', ({ selected }: { selected: any[] }) => {
      const nodes = selected.filter((c: any) => c.isNode?.()).map((c: any) => {
        const pos = c.getPosition()
        const size = c.getSize()
        return {
          id: c.id,
          shape: c.shape,
          position: pos,
          size,
          label: c.getLabel?.() ?? '',
          style: c.getProp?.('style'),
        } as NodeData
      })
      const edges = selected.filter((c: any) => c.isEdge?.()).map((c: any) => ({
        id: c.id,
        shape: c.shape,
        source: c.getSource?.() ?? '',
        target: c.getTarget?.() ?? '',
      } as EdgeData))
      this.selectedNodeId = nodes[0]?.id ?? null
      this.selectedEdgeId = this.selectedNodeId ? null : (edges[0]?.id ?? null)
      if (this.selectedNodeId || this.selectedEdgeId)
        this.propertiesHidden = false
      this.updatePropertiesPanel()
      this.updatePropertiesPanelVisibility()
      this.opts.onSelectionChange?.(nodes, edges)
    })

    // Data change
    this.eventBus.on('data:changed', () => {
      this.opts.onDataChange?.(this.getData())
    })
  }

  // ── Adding nodes ───────────────────────────────────────────────────────────

  private isEdgeMaterial(item: MaterialItem): boolean {
    return item.shape.startsWith('edge-')
  }

  private getCanvasCenterPosition(): { x: number, y: number } {
    const graph = (this as any)._graph
    const canvasEl: HTMLElement = (this as any)._canvasEl
    if (!graph)
      return { x: (canvasEl?.clientWidth ?? 800) / 2, y: (canvasEl?.clientHeight ?? 600) / 2 }
    const cx = (canvasEl?.clientWidth ?? 800) / 2
    const cy = (canvasEl?.clientHeight ?? 600) / 2
    const local = (typeof (graph as any).clientToLocal === 'function')
      ? (graph as any).clientToLocal({ x: cx, y: cy })
      : { x: cx, y: cy }
    return { x: local.x, y: local.y }
  }

  private screenToCanvasPosition(clientX: number, clientY: number): { x: number, y: number } {
    const graph = (this as any)._graph
    if (!graph)
      return { x: clientX, y: clientY }
    const local = (typeof (graph as any).clientToLocal === 'function')
      ? (graph as any).clientToLocal({ x: clientX, y: clientY })
      : { x: clientX, y: clientY }
    return { x: local.x, y: local.y }
  }

  private handleMaterialDragStart(item: MaterialItem, event: DragEvent): void {
    if (!event.dataTransfer)
      return
    event.dataTransfer.effectAllowed = 'copy'
    const payload = JSON.stringify(item)
    event.dataTransfer.setData('application/json', payload)
    event.dataTransfer.setData('text/plain', payload)
  }

  private createAssetMaterial(asset: AssetItem): MaterialItem {
    const imageHref = asset.type === 'svg'
      ? `data:image/svg+xml;charset=utf-8,${encodeURIComponent(asset.content)}`
      : asset.content
    return {
      id: `asset-${asset.id}`,
      name: asset.name,
      shape: asset.type === 'svg' ? 'basic-svg' : 'basic-image',
      defaultSize: { width: 80, height: 80 },
      defaultLabel: "", //asset.name,
      data: asset.type === 'svg'
        ? { imageHref, svgContent: asset.content }
        : { imageHref },
    }
  }

  private handleExternalDrop(event: DragEvent): void {
    const data = event.dataTransfer?.getData('application/json') || event.dataTransfer?.getData('text/plain')
    if (!data)
      return
    try {
      const item = JSON.parse(data) as MaterialItem
      const position = this.screenToCanvasPosition(event.clientX, event.clientY)
      this.addElementFromMaterial(item, position)
    }
    catch {

    }
  }

  private addElementFromMaterial(item: MaterialItem, position?: { x: number, y: number }): void {
    if (this.isEdgeMaterial(item)) {
      this.addEdgeFromMaterial(item, position)
      return
    }
    this.addNodeFromMaterial(item, position)
  }

  private addNodeFromMaterial(item: MaterialItem, position?: { x: number, y: number }): void {
    const graph = (this as any)._graph
    if (!graph)
      return
    const center = position ?? this.getCanvasCenterPosition()
    const x = center.x - item.defaultSize.width / 2 + (position ? 0 : (Math.random() * 40 - 20))
    const y = center.y - item.defaultSize.height / 2 + (position ? 0 : (Math.random() * 40 - 20))
    const imageHref = typeof item.data?.imageHref === 'string' ? item.data.imageHref : ''
    graph.startBatch('add-node-from-material')
    try {
      graph.addNode({
        shape: item.shape,
        x,
        y,
        width: item.defaultSize.width,
        height: item.defaultSize.height,
        label: item.defaultLabel ?? item.name,
        attrs: {
          ...(imageHref
            ? { image: { 'xlink:href': imageHref, 'refWidth': '100%', 'refHeight': '100%', 'x': 0, 'y': 0 } }
            : {
                body: {
                  fill: item.defaultStyle?.fill ?? '#fff',
                  stroke: item.defaultStyle?.stroke ?? PRIMARY_COLOR,
                  strokeWidth: item.defaultStyle?.strokeWidth ?? 1.5,
                },
              }),
          label: { fill: '#333', fontSize: 12 },
        },
        ports: item.defaultPorts,
        ...(item.data ? { data: { ...item.data } } : {}),
      })
    }
    finally {
      graph.stopBatch('add-node-from-material')
    }
    this.opts.onDataChange?.(this.getData())
  }

  private addEdgeFromMaterial(item: MaterialItem, position?: { x: number, y: number }): void {
    const graph = (this as any)._graph
    if (!graph)
      return
    const center = position ?? this.getCanvasCenterPosition()
    const halfWidth = Math.max((item.defaultSize?.width ?? 100) / 2, 40)
    graph.startBatch('add-edge-from-material')
    try {
      graph.addEdge({
        shape: item.shape,
        source: { x: center.x - halfWidth, y: center.y },
        target: { x: center.x + halfWidth, y: center.y },
        ...(item.defaultLabel ? { label: item.defaultLabel } : {}),
        ...(item.data ? { data: { ...item.data } } : {}),
      })
    }
    finally {
      graph.stopBatch('add-edge-from-material')
    }
    this.opts.onDataChange?.(this.getData())
  }

  private applyTemplate(template: TemplateItem): void {
    // 模板应用需要记录为一次可撤销操作，使 undo 能回退到应用前的状态
    this.setData(template.data, { recordHistory: true })
    this.selectedNodeId = null
    this.selectedEdgeId = null
    this.updatePropertiesPanel()
    this.updatePropertiesPanelVisibility()
    this.opts.onDataChange?.(this.getData())
  }

  private updatePropertiesPanel(): void {
    if (!this.propertiesBody)
      return
    const t = this.t

    for (const picker of this.propertyColorPickers) picker.destroy()
    this.propertyColorPickers = []

    this.propertiesBody.innerHTML = ''
    const graph = (this as any)._graph
    if (!graph || (!this.selectedNodeId && !this.selectedEdgeId)) {
      if (this.propertiesTitleEl)
        this.propertiesTitleEl.textContent = t.properties.title
      this.propertiesBody.appendChild(el('div', 'ud-empty-state', t.properties.noSelection))
      return
    }

    const createRow = (labelText: string, control: HTMLElement): HTMLDivElement => {
      const row = el('div', 'ud-property-row') as HTMLDivElement
      row.append(el('label', 'ud-property-label', labelText), control)
      return row
    }

    const appendTextInput = (labelText: string, value: string, onChange: (next: string) => void): void => {
      const input = document.createElement('input')
      input.className = 'ud-property-input'
      input.type = 'text'
      input.value = value
      input.addEventListener('change', () => onChange(input.value))
      this.propertiesBody.appendChild(createRow(labelText, input))
    }

    const appendNumberInput = (labelText: string, value: number, onChange: (next: number) => void): void => {
      const input = document.createElement('input')
      input.className = 'ud-property-input'
      input.type = 'number'
      input.value = String(value)
      input.addEventListener('change', () => onChange(Number(input.value) || value))
      this.propertiesBody.appendChild(createRow(labelText, input))
    }

    const appendColorInput = (labelText: string, value: string, onChange: (next: string) => void): void => {
      const host = document.createElement('div')
      const picker = createNativeColorPicker({
        value,
        onChange,
      })
      host.appendChild(picker.root)
      this.propertyColorPickers.push(picker)
      this.propertiesBody.appendChild(createRow(labelText, host))
    }

    const appendSelectInput = (
      labelText: string,
      value: string,
      options: Array<{ label: string, value: string }>,
      onChange: (next: string) => void,
    ): void => {
      const select = document.createElement('select')
      select.className = 'ud-property-input'
      for (const option of options) {
        const opt = document.createElement('option')
        opt.value = option.value
        opt.textContent = option.label
        opt.selected = option.value === value
        select.appendChild(opt)
      }
      select.addEventListener('change', () => onChange(select.value))
      this.propertiesBody.appendChild(createRow(labelText, select))
    }

    const appendIconButtonGroup = (
      labelText: string,
      value: string,
      options: Array<{ value: string, title: string, svg: string }>,
      onChange: (next: string) => void,
    ): void => {
      const group = el('div', 'ud-property-icon-group') as HTMLDivElement
      for (const option of options) {
        const button = el('button', `ud-property-icon-btn${option.value === value ? ' active' : ''}`) as HTMLButtonElement
        button.type = 'button'
        button.title = option.title
        button.innerHTML = `<span class="ud-property-line-type-icon">${option.svg}</span>`
        button.addEventListener('click', () => onChange(option.value))
        group.appendChild(button)
      }
      this.propertiesBody.appendChild(createRow(labelText, group))
    }

    const appendFileInput = (labelText: string, accept: string, onChange: (file: File) => void): void => {
      const input = document.createElement('input')
      input.className = 'ud-property-input'
      input.type = 'file'
      input.accept = accept
      input.addEventListener('change', () => {
        if (input.files?.[0])
          onChange(input.files[0])
      })
      this.propertiesBody.appendChild(createRow(labelText, input))
    }

    if (this.selectedNodeId) {
      const node = graph.getCellById(this.selectedNodeId)
      if (!node || !node.isNode?.()) {
        if (this.propertiesTitleEl)
          this.propertiesTitleEl.textContent = t.properties.title
        this.propertiesBody.appendChild(el('div', 'ud-empty-state', t.properties.nodeMissing))
        return
      }

      if (this.propertiesTitleEl)
        this.propertiesTitleEl.textContent = t.properties.nodeTitle
      const size = node.getSize?.() ?? { width: 80, height: 80 }
      const attrs = node.getAttrs?.() ?? {}
      const body = attrs.body ?? {}

      this.propertiesBody.appendChild(el('div', 'ud-properties-section-title', t.properties.nodeTitle))
      appendTextInput(t.properties.label, node.getLabel?.() ?? '', (next) => {
        node.setLabel?.(next)
        this.opts.onDataChange?.(this.getData())
      })
      const labelAttrs = attrs.label ?? {}
      appendColorInput(t.properties.labelColor, String(labelAttrs.fill ?? '#333333'), (next) => {
        node.setAttrByPath?.('label/fill', next)
        this.opts.onDataChange?.(this.getData())
      })
      appendNumberInput(t.properties.width, Number(size.width) || 80, (next) => {
        node.resize?.(next, size.height)
        this.updatePropertiesPanel()
        this.opts.onDataChange?.(this.getData())
      })
      appendNumberInput(t.properties.height, Number(size.height) || 80, (next) => {
        node.resize?.(size.width, next)
        this.updatePropertiesPanel()
        this.opts.onDataChange?.(this.getData())
      })
      appendColorInput(t.properties.fillColor, body.fill ?? '#ffffff', (next) => {
        node.setAttrs?.({ body: { fill: next } })
        this.opts.onDataChange?.(this.getData())
      })
      appendColorInput(t.properties.borderColor, body.stroke ?? PRIMARY_COLOR, (next) => {
        node.setAttrs?.({ body: { stroke: next } })
        this.opts.onDataChange?.(this.getData())
      })
      if (node.shape === 'basic-image' || node.shape === 'basic-svg') {
        appendFileInput(t.properties.uploadImage, 'image/*,.svg', async (file) => {
          let url: string
          if (this.opts.uploadApi) {
            url = await this.opts.uploadApi(file)
          }
          else {
            url = await new Promise<string>((resolve) => {
              const reader = new FileReader()
              reader.onload = () => resolve(reader.result as string)
              reader.readAsDataURL(file)
            })
          }
          node.attr?.('image/xlink:href', url)
          const data = node.getData?.() ?? {}
          node.setData?.({ ...data, imageHref: url })
          this.opts.onDataChange?.(this.getData())
        })
        const imageAttrs = attrs.image ?? {}
        const currentFit = imageAttrs.preserveAspectRatio === 'xMidYMid slice' ? 'cover' : imageAttrs.preserveAspectRatio === 'none' ? 'fill' : 'contain'
        appendSelectInput(t.properties.imageFit, currentFit, [
          { label: t.properties.fitContain, value: 'contain' },
          { label: t.properties.fitCover, value: 'cover' },
          { label: t.properties.fitFill, value: 'fill' },
        ], (next) => {
          const map: Record<string, string> = {
            contain: 'xMidYMid meet',
            cover: 'xMidYMid slice',
            fill: 'none',
          }
          node.attr?.('image/preserveAspectRatio', map[next] ?? 'xMidYMid meet')
          const data = node.getData?.() ?? {}
          node.setData?.({ ...data, imageFit: next })
          this.opts.onDataChange?.(this.getData())
        })
      }
      const rxVal = Number(body.rx) || 0
      const ryVal = Number(body.ry) || 0
      appendNumberInput(t.properties.radius, rxVal, (next) => {
        node.setAttrs?.({ body: { rx: next } })
        this.opts.onDataChange?.(this.getData())
      })
      appendNumberInput(t.properties.radiusY ?? 'Radius Y', ryVal, (next) => {
        node.setAttrs?.({ body: { ry: next } })
        this.opts.onDataChange?.(this.getData())
      })

      if (node.shape === 'basic-text') {
        const labelAttrs = attrs.label ?? {}
        appendSelectInput(t.properties.fontFamily ?? 'Font', String(labelAttrs.fontFamily ?? 'sans-serif'), [
          { label: 'Sans', value: 'sans-serif' },
          { label: 'Serif', value: 'serif' },
          { label: 'Mono', value: 'monospace' },
        ], (next) => {
          node.setAttrByPath('label/fontFamily', next)
          this.opts.onDataChange?.(this.getData())
        })
        appendSelectInput(t.properties.fontWeight ?? 'Weight', String(labelAttrs.fontWeight ?? 'normal'), [
          { label: 'Normal', value: 'normal' },
          { label: 'Bold', value: 'bold' },
        ], (next) => {
          node.setAttrByPath('label/fontWeight', next)
          this.opts.onDataChange?.(this.getData())
        })
        const textAlign = labelAttrs.textAnchor === 'start' ? 'left' : labelAttrs.textAnchor === 'end' ? 'right' : 'center'
        appendSelectInput(t.properties.textAlign ?? 'Align', textAlign, [
          { label: 'Left', value: 'left' },
          { label: 'Center', value: 'center' },
          { label: 'Right', value: 'right' },
        ], (next) => {
          node.setAttrByPath('label/textAnchor', next === 'left' ? 'start' : next === 'right' ? 'end' : 'middle')
          this.opts.onDataChange?.(this.getData())
        })
        appendNumberInput(t.properties.lineHeight ?? 'Line Ht', Number(labelAttrs.lineHeight) || 1.2, (next) => {
          node.setAttrByPath('label/lineHeight', next)
          this.opts.onDataChange?.(this.getData())
        })
      }
      return
    }

    const edge = graph.getCellById(this.selectedEdgeId)
    if (!edge || !edge.isEdge?.()) {
      if (this.propertiesTitleEl)
        this.propertiesTitleEl.textContent = t.properties.title
      this.propertiesBody.appendChild(el('div', 'ud-empty-state', t.properties.edgeMissing))
      return
    }

    if (this.propertiesTitleEl)
      this.propertiesTitleEl.textContent = t.properties.edgeTitle
    const line = edge.getAttrs?.()?.line ?? {}
    const labels = edge.getLabels?.() ?? []
    const label = labels[0]?.attrs?.text?.text ?? ''
    const labelPosition = labels[0]?.position
      ? (typeof labels[0].position === 'number'
          ? 'center'
          : inferEdgeLabelPosition(labels[0].position as Record<string, any>))
      : 'center'
    const router = edge.getRouter?.()
    const connector = edge.getConnector?.()
    const routerName = inferRouterName(router)
    const connectorName = inferConnectorName(connector)
    const sourceMarker = inferMarkerName(line.sourceMarker)
    const targetMarker = inferMarkerName(line.targetMarker)
    const strokeStyle = inferStrokeStyleName(line.strokeDasharray as string | undefined)

    this.propertiesBody.appendChild(el('div', 'ud-properties-section-title', t.properties.edgeTitle))
    // Router 路由
    if (edge.shape !== 'edge-sketch') {
      appendIconButtonGroup(t.properties.router ?? 'Router', routerName, getRouterOptions({
        normal: t.properties.routerNormal ?? 'Default',
        orth: t.properties.routerOrth ?? 'Orth',
        manhattan: t.properties.routerManhattan ?? 'Manhattan',
        er: t.properties.routerEr ?? 'ER',
        metro: t.properties.routerMetro ?? 'Metro',
        oneSide: t.properties.routerOneSide ?? 'One Side',
      }), (next) => {
        const nextRouter = getRouterConfig(next as any)
        edge.setRouter?.(nextRouter)
        edge.setData?.({ ...(edge.getData?.() ?? {}), routerName: next })
        this.opts.onDataChange?.(this.getData())
      })
    }
    // Connector 连接器
    if (edge.shape !== 'edge-sketch') {
      appendIconButtonGroup(t.properties.connector ?? 'Connector', connectorName, getConnectorOptions({
        normal: t.properties.connectorNormal ?? 'Straight',
        smooth: t.properties.connectorSmooth ?? 'Smooth',
        rounded: t.properties.connectorRounded ?? 'Rounded',
        quadratic: t.properties.connectorQuadratic ?? 'Quadratic',
        jumpover: t.properties.connectorJumpover ?? 'Jumpover',
        wobble: t.properties.connectorWobble ?? 'Wobble',
      }), (next) => {
        const nextConnector = getConnectorConfig(next as any)
        edge.setConnector?.(nextConnector)
        edge.setData?.({ ...(edge.getData?.() ?? {}), connectorName: next })
        this.opts.onDataChange?.(this.getData())
      })
    }
    appendTextInput(t.properties.label, label, (next) => {
      if (next)
        edge.setLabels?.([{ attrs: { text: { text: next } } }])
      else edge.setLabels?.([])
      this.opts.onDataChange?.(this.getData())
    })
    appendSelectInput(t.quickAction.position, labelPosition, [
      { label: t.quickAction.labelCenter, value: 'center' },
      { label: t.quickAction.labelTop, value: 'top' },
      { label: t.quickAction.labelBottom, value: 'bottom' },
      { label: t.quickAction.labelNearSource, value: 'near-source' },
      { label: t.quickAction.labelNearTarget, value: 'near-target' },
    ], (next) => {
      const pos = getEdgeLabelPosition(next)
      const currentLabels = edge.getLabels?.() ?? []
      const currentText = currentLabels[0]?.attrs?.text?.text ?? ''
      edge.setLabels?.([{ attrs: { text: { text: currentText } }, position: pos }])
      this.opts.onDataChange?.(this.getData())
    })
    appendNumberInput(t.properties.strokeWidth, Number(line.strokeWidth) || 2, (next) => {
      edge.setAttrs?.({ line: { strokeWidth: next } })
      this.opts.onDataChange?.(this.getData())
    })
    appendColorInput(t.properties.color, line.stroke ?? PRIMARY_COLOR, (next) => {
      edge.setAttrs?.({ line: { stroke: next } })
      this.opts.onDataChange?.(this.getData())
    })
    // StrokeStyle 线样式
    appendIconButtonGroup(t.properties.lineStyle, strokeStyle, getStrokeStyleOptions({
      solid: t.properties.solidLine,
      dashed: t.properties.dashedLine,
      dotted: t.properties.dottedLine,
      dashdot: t.properties.dashdotLine ?? 'DashDot',
    }), (next) => {
      const dasharray = getStrokeDasharray(next as any)
      edge.setAttrs?.({ line: { strokeDasharray: dasharray || null } })
      edge.setData?.({ ...(edge.getData?.() ?? {}), strokeStyle: next })
      this.opts.onDataChange?.(this.getData())
    })
    // Source Marker 起点箭头
    appendIconButtonGroup(t.properties.sourceMarker, sourceMarker, getMarkerOptions({
      none: t.properties.markerNone,
      classic: t.properties.markerClassic,
      block: t.properties.markerBlock,
      diamond: t.properties.markerDiamond,
      circle: t.properties.markerCircle,
      cross: t.properties.markerCross ?? 'Cross',
      async: t.properties.markerAsync ?? 'Async',
    }), (next) => {
      edge.setAttrs?.({ line: { sourceMarker: next === 'none' ? null : { name: next } } })
      this.opts.onDataChange?.(this.getData())
    })
    // Target Marker 终点箭头
    appendIconButtonGroup(t.properties.targetMarker, targetMarker, getMarkerOptions({
      none: t.properties.markerNone,
      classic: t.properties.markerClassic,
      block: t.properties.markerBlock,
      diamond: t.properties.markerDiamond,
      circle: t.properties.markerCircle,
      cross: t.properties.markerCross ?? 'Cross',
      async: t.properties.markerAsync ?? 'Async',
    }), (next) => {
      edge.setAttrs?.({ line: { targetMarker: next === 'none' ? null : { name: next } } })
      this.opts.onDataChange?.(this.getData())
    })
  }

  // ── Export helpers ─────────────────────────────────────────────────────────

  private isEmpty(): boolean {
    const graph = (this as any)._graph
    if (!graph)
      return true
    return graph.getNodes().length === 0 && graph.getEdges().length === 0
  }

  private async exportPNGToFile(): Promise<void> {
    if (this.isEmpty()) {
      showMessage(this.t.toolbar.noExportableContent, 'warning')
      return
    }
    const dataUrl = await this.exportService?.toPNG({ padding: 20 })
    if (!dataUrl)
      return
    const a = document.createElement('a')
    a.href = dataUrl
    a.download = 'diagram.png'
    a.click()
  }

  private async exportSVGToFile(): Promise<void> {
    if (this.isEmpty()) {
      showMessage(this.t.toolbar.noExportableContent, 'warning')
      return
    }
    const svgText = await this.exportService?.toSVG()
    if (!svgText)
      return
    const blob = new Blob([svgText], { type: 'image/svg+xml;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'diagram.svg'
    a.click()
    URL.revokeObjectURL(url)
  }

  private exportJSONToFile(): void {
    const data = this.getData()
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'diagram.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  // ── Public API ─────────────────────────────────────────────────────────────

  getData(): GraphData {
    return this.graphManager?.exportData() ?? { canvas: {}, nodes: [], edges: [] }
  }

  setData(data: GraphData, options?: { recordHistory?: boolean }): void {
    this.graphManager?.loadData(data, options)
  }

  clear(): void {
    const g = (this as any)._graph
    if (g) {
      g.startBatch('clear-canvas')
      try {
        g.clearCells()
      }
      finally {
        g.stopBatch('clear-canvas')
      }
      this.eventBus.emit('data:changed', this.getData())
    }
  }

  async exportPNG(): Promise<string> {
    return this.exportService?.toPNG({ padding: 20 }) ?? ''
  }

  async exportSVG(): Promise<string> {
    return this.exportService?.toSVG() ?? ''
  }

  exportJSON(): string {
    return JSON.stringify(this.getData(), null, 2)
  }

  setAssets(assets: AssetItem[]): void {
    this.opts.assets = assets
    this.buildAssetsPanel()
  }

  setAssetPagination(pagination: Pick<UniDrawOptions, 'assetPage' | 'assetTotalPages' | 'assetPageLoading' | 'canPrevAssets' | 'canNextAssets' | 'onAssetsPrevPage' | 'onAssetsNextPage'>): void {
    this.opts.assetPage = pagination.assetPage
    this.opts.assetTotalPages = pagination.assetTotalPages
    this.opts.assetPageLoading = pagination.assetPageLoading
    this.opts.canPrevAssets = pagination.canPrevAssets
    this.opts.canNextAssets = pagination.canNextAssets
    this.opts.onAssetsPrevPage = pagination.onAssetsPrevPage
    this.opts.onAssetsNextPage = pagination.onAssetsNextPage
    this.buildAssetsPanel()
  }

  setTemplates(templates: TemplateItem[]): void {
    this.opts.templates = templates
    this.buildTemplatesPanel()
  }

  openTemplatePanel(): void {
    if (this.opts.showTemplates === false)
      return
    this.openLeftPanel()
    if (this.sidebarPanels.has('templates'))
      this.setSidebarTab('templates')
  }

  undo(): void {
    const g = (this as any)._graph
    if (g)
      (g as any).undo?.()
  }

  redo(): void {
    const g = (this as any)._graph
    if (g)
      (g as any).redo?.()
  }

  zoomIn(): void { this.zoomTool?.zoomIn() }
  zoomOut(): void { this.zoomTool?.zoomOut() }
  zoomFit(): void { this.zoomTool?.zoomToFit({ padding: 24 }) }

  selectAll(): void {
    if (this.opts.readonly)
      return
    const g = (this as any)._graph
    if (g)
      g.select?.(g.getCells())
  }

  deleteSelection(): void {
    if (this.opts.readonly)
      return
    const g = (this as any)._graph
    if (g)
      g.removeCells?.(g.getSelectedCells?.() ?? [])
  }

  /** Clean up the instance and remove the DOM. */
  destroy(): void {
    for (const picker of this.propertyColorPickers) picker.destroy()
    this.propertyColorPickers = []
    this.shortcutMgr?.unbind()
    this.engine.dispose()
    this.eventBus.clear()
    this.root.remove()
  }
}
