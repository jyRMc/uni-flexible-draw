import './styles/unidraw.css'
import { AntVRenderEngine } from './core/engine/AntVRenderEngine'
import { GraphManager } from './core/graph/GraphManager'
import { ExportService } from './core/export/ExportService'
import { GraphEventBus } from './core/event/GraphEventBus'
import { ZoomTool } from './core/tool/ZoomTool'
import { ShortcutManager } from './core/shortcut/ShortcutManager'
import { registerAllShapes } from './shapes/register'
import { getAllLibraries } from './materials'
import type { GraphData, NodeData, EdgeData, MaterialItem } from './shared/types'
import type { AssetItem, TemplateItem } from './shared/types'
import zhCN from './locale/zh-CN'
import type { UniDrawLocale } from './locale'
import { PRIMARY_COLOR } from './shared/constants/theme'
import { getEdgeLineConfig, getEdgeLineType, getEdgeLineTypeOptions, getEdgeLineVertices } from './shared'
import { createNativeColorPicker, type NativeColorPickerInstance } from './components/ColorPicker/native'

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
}

// ─── Tiny SVG icon helper ──────────────────────────────────────────────────

function svg(path: string, size = 16): string {
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${path}</svg>`
}

const ICONS = {
  undo:     svg('<path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"/>'),
  redo:     svg('<path d="M21 7v6h-6"/><path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3l3 2.7"/>'),
  zoomIn:   svg('<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/>'),
  zoomOut:  svg('<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="8" y1="11" x2="14" y2="11"/>'),
  zoomFit:  svg('<path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/>'),
  panelLeftClose: svg('<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M9 4v16"/><path d="m16 9-3 3 3 3"/>'),
  panelLeftOpen: svg('<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M9 4v16"/><path d="m14 9 3 3-3 3"/>'),
  trash:    svg('<polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>'),
  download: svg('<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>'),
  json:     svg('<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>'),
  close:    svg('<path d="M18 6 6 18"/><path d="m6 6 12 12"/>', 14),
}

// ─── DOM helpers ────────────────────────────────────────────────────────────

function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  cls: string,
  html = '',
): HTMLElementTagNameMap[K] {
  const e = document.createElement(tag)
  if (cls) e.className = cls
  if (html) e.innerHTML = html
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
    if (shape.startsWith('flowchart-')) return { fill: '#fff7e6', stroke: '#fa8c16' }
    if (shape.startsWith('edge-')) return { fill: '#f5f5f5', stroke: '#7166F0' }
    if (shape.startsWith('uml-')) return { fill: '#f9f0ff', stroke: '#722ed1' }
    if (shape.startsWith('er-')) return { fill: '#fff1f0', stroke: '#f5222d' }
    if (shape.startsWith('state-')) return { fill: '#f6ffed', stroke: '#52c41a' }
    if (shape.startsWith('dfd-')) return { fill: '#e6fffb', stroke: '#13c2c2' }
    if (shape.startsWith('swimlane-')) return { fill: '#f0f5ff', stroke: '#2f54eb' }
    if (shape.startsWith('sequence-')) return { fill: '#fffbe6', stroke: '#faad14' }
    return { fill: '#eef1f8', stroke: '#5b6b88' }
  })()

  const ba = `fill="${palette.fill}" stroke="${palette.stroke}" stroke-width="1.8"`
  const ln = `fill="none" stroke="${palette.stroke}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"`
  const wrap = (viewBox: string, body: string) => `<svg class="ud-shape-preview-svg" viewBox="${viewBox}" xmlns="http://www.w3.org/2000/svg">${body}</svg>`

  switch (shape) {
    case 'basic-rect':
    case 'flowchart-process':
    case 'uml-class':
    case 'er-entity':
      return wrap('0 0 44 32', `<rect x="4" y="5" width="36" height="22" ${ba}/>`)
    case 'basic-rounded-rect':
    case 'state-simple':
      return wrap('0 0 44 32', `<rect x="4" y="5" width="36" height="22" rx="7" ${ba}/>`)
    case 'basic-circle':
    case 'flowchart-connector':
    case 'dfd-process':
      return wrap('0 0 32 32', `<circle cx="16" cy="16" r="11" ${ba}/>`)
    case 'basic-diamond':
    case 'flowchart-decision':
    case 'er-relationship':
    case 'state-choice':
      return wrap('0 0 36 32', `<polygon points="18,3 33,16 18,29 3,16" ${ba}/>`)
    case 'basic-triangle':
    case 'flowchart-merge':
      return wrap('0 0 36 32', `<polygon points="18,4 32,28 4,28" ${ba}/>`)
    case 'basic-parallelogram':
    case 'flowchart-input-output':
      return wrap('0 0 44 32', `<polygon points="10,26 40,26 34,6 4,6" ${ba}/>`)
    case 'basic-trapezoid':
      return wrap('0 0 44 32', `<polygon points="6,26 38,26 32,6 12,6" ${ba}/>`)
    case 'basic-hexagon':
      return wrap('0 0 40 32', `<polygon points="20,3 33,10 33,22 20,29 7,22 7,10" ${ba}/>`)
    case 'basic-pentagon':
      return wrap('0 0 36 32', `<polygon points="18,3 31,12 26,28 10,28 5,12" ${ba}/>`)
    case 'basic-octagon':
      return wrap('0 0 36 36', `<polygon points="11,3 25,3 33,11 33,25 25,33 11,33 3,25 3,11" ${ba}/>`)
    case 'basic-star':
      return wrap('0 0 36 36', `<polygon points="18,3 21.6,13 33,13 23.5,19.8 27,31 18,24.2 9,31 12.5,19.8 3,13 14.4,13" ${ba}/>`)
    case 'basic-cross':
      return wrap('0 0 36 36', `<polygon points="12,3 24,3 24,12 33,12 33,24 24,24 24,33 12,33 12,24 3,24 3,12 12,12" ${ba}/>`)
    case 'basic-cylinder':
    case 'flowchart-database':
      return wrap('0 0 36 36', `<rect x="6" y="10" width="24" height="16" fill="${palette.fill}" stroke="none"/><ellipse cx="18" cy="10" rx="12" ry="4" ${ba}/><ellipse cx="18" cy="26" rx="12" ry="4" fill="${palette.fill}" stroke="${palette.stroke}" stroke-width="1.8"/><line x1="6" y1="10" x2="6" y2="26" ${ln}/><line x1="30" y1="10" x2="30" y2="26" ${ln}/>`)
    case 'basic-cloud':
      return wrap('0 0 44 32', `<path d="M10,27 Q5,27 5,21 Q5,16 11,15 Q11,8 18,8 Q22,8 24,12 Q27,8 32,8 Q39,8 39,15 Q43,16 43,21 Q43,27 36,27 Z" ${ba}/>`)
    case 'basic-document':
    case 'flowchart-document':
    case 'uml-note':
      return wrap('0 0 34 36', `<path d="M4,4 L22,4 L30,12 L30,32 L4,32 Z" ${ba}/><polyline points="22,4 22,12 30,12" ${ln}/>`)
    case 'basic-table':
      return wrap('0 0 40 32', `<rect x="4" y="4" width="32" height="24" ${ba}/><line x1="14.7" y1="4" x2="14.7" y2="28" ${ln}/><line x1="25.3" y1="4" x2="25.3" y2="28" ${ln}/><line x1="4" y1="12" x2="36" y2="12" ${ln}/><line x1="4" y1="20" x2="36" y2="20" ${ln}/>`)
    case 'basic-text':
      return wrap('0 0 44 32', `<line x1="6" y1="10" x2="38" y2="10" ${ln}/><line x1="6" y1="17" x2="30" y2="17" ${ln}/><line x1="6" y1="24" x2="24" y2="24" ${ln}/>`)
    case 'basic-image':
      return wrap('0 0 38 32', `<rect x="3" y="4" width="32" height="24" rx="3" ${ba}/><circle cx="12" cy="12" r="3" fill="${palette.stroke}" opacity="0.45"/><polyline points="5,24 14,16 20,21 27,13 33,22" ${ln}/>`)
    case 'edge-line':
      return wrap('0 0 44 16', `<line x1="4" y1="8" x2="40" y2="8" ${ln}/>`)
    case 'edge-sketch':
      return wrap('0 0 44 16', `<path d="M4,8 C6.5,4.9 9.5,10.6 13,7.5 C17,4.1 21,11 25,7.3 C29,4.3 33,9.8 36.5,6.9 C38.2,5.5 39.2,8.8 40,8" ${ln}/>`)
    case 'edge-dashed':
      return wrap('0 0 44 16', `<line x1="4" y1="8" x2="40" y2="8" ${ln} stroke-dasharray="5 3"/>`)
    case 'edge-arrow':
      return wrap('0 0 44 16', `<line x1="4" y1="8" x2="31" y2="8" ${ln}/><polygon points="31,4 40,8 31,12" fill="${palette.stroke}"/>`)
    case 'edge-double-arrow':
      return wrap('0 0 44 16', `<line x1="12" y1="8" x2="32" y2="8" ${ln}/><polygon points="12,4 4,8 12,12" fill="${palette.stroke}"/><polygon points="32,4 40,8 32,12" fill="${palette.stroke}"/>`)
    case 'edge-curve':
      return wrap('0 0 44 22', `<path d="M4,7 C11,7 11,17 22,17 C33,17 33,7 40,7" ${ln}/>`)
    case 'edge-orthogonal':
      return wrap('0 0 44 28', `<path d="M4,22 L18,22 Q21,22 21,19 L21,9 Q21,6 24,6 L40,6" ${ln}/>`)
    case 'uml-actor':
    case 'sequence-actor':
      return wrap('0 0 24 36', `<circle cx="12" cy="7" r="5" ${ba}/><line x1="12" y1="12" x2="12" y2="24" ${ln}/><line x1="4" y1="17" x2="20" y2="17" ${ln}/><line x1="12" y1="24" x2="4" y2="32" ${ln}/><line x1="12" y1="24" x2="20" y2="32" ${ln}/>`)
    case 'uml-use-case':
    case 'er-attribute':
      return wrap('0 0 44 28', `<ellipse cx="22" cy="14" rx="18" ry="10" ${ba}/>`)
    case 'uml-package':
      return wrap('0 0 44 36', `<rect x="3" y="10" width="38" height="22" ${ba}/><rect x="3" y="5" width="14" height="8" ${ba}/>`)
    case 'er-weak-entity':
    case 'dfd-external-entity':
      return wrap('0 0 44 32', `<rect x="4" y="5" width="36" height="22" ${ba}/><rect x="8" y="9" width="28" height="14" fill="none" stroke="${palette.stroke}" stroke-width="1.2"/>`)
    case 'er-key-attribute':
      return wrap('0 0 44 28', `<ellipse cx="22" cy="14" rx="18" ry="10" ${ba}/><line x1="9" y1="21" x2="35" y2="21" ${ln}/>`)
    case 'er-multivalued':
      return wrap('0 0 44 28', `<ellipse cx="22" cy="14" rx="18" ry="10" ${ba}/><ellipse cx="22" cy="14" rx="14" ry="7" fill="none" stroke="${palette.stroke}" stroke-width="1.2"/>`)
    case 'state-initial':
      return wrap('0 0 28 28', `<circle cx="14" cy="14" r="10" fill="${palette.stroke}"/>`)
    case 'state-final':
      return wrap('0 0 28 28', `<circle cx="14" cy="14" r="10" fill="none" stroke="${palette.stroke}" stroke-width="2"/><circle cx="14" cy="14" r="6" fill="${palette.stroke}"/>`)
    case 'state-fork':
    case 'state-join':
      return wrap('0 0 12 32', `<rect x="2" y="3" width="8" height="26" rx="1" fill="${palette.stroke}"/>`)
    case 'dfd-data-store':
      return wrap('0 0 44 28', `<line x1="4" y1="6" x2="40" y2="6" ${ln}/><line x1="4" y1="22" x2="40" y2="22" ${ln}/>`)
    case 'swimlane-horizontal':
      return wrap('0 0 44 30', `<rect x="3" y="3" width="38" height="24" ${ba}/><line x1="3" y1="11" x2="41" y2="11" ${ln}/><line x1="3" y1="19" x2="41" y2="19" ${ln}/>`)
    case 'swimlane-vertical':
      return wrap('0 0 44 30', `<rect x="3" y="3" width="38" height="24" ${ba}/><line x1="16" y1="3" x2="16" y2="27" ${ln}/><line x1="28" y1="3" x2="28" y2="27" ${ln}/>`)
    case 'swimlane-pool':
      return wrap('0 0 44 30', `<rect x="3" y="3" width="38" height="24" ${ba}/><line x1="3" y1="11" x2="41" y2="11" ${ln}/>`)
    case 'sequence-lifeline':
      return wrap('0 0 44 30', `<rect x="12" y="4" width="20" height="8" ${ba}/><line x1="22" y1="12" x2="22" y2="28" ${ln} stroke-dasharray="4 2"/>`)
    case 'sequence-activation':
      return wrap('0 0 24 32', `<rect x="10" y="4" width="4" height="24" fill="${palette.stroke}" rx="1"/>`)
    default:
      return wrap('0 0 44 32', `<rect x="4" y="5" width="36" height="22" rx="5" ${ba}/>`)
  }
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
    const showToolbar = this.opts.showToolbar !== false
    const showSidebar = this.opts.showShapePanel !== false
    const showProperties = this.opts.showPropertiesPanel !== false

    const body = el('div', 'ud-body')
    if (showSidebar) body.appendChild(this.buildSidebar())

    const canvasWrap = el('div', 'ud-canvas-area') as HTMLDivElement
    const canvasDom = el('div', 'ud-canvas')
    canvasWrap.appendChild(canvasDom)
    canvasWrap.addEventListener('dragover', (event: DragEvent) => event.preventDefault())
    canvasWrap.addEventListener('drop', (event: DragEvent) => {
      event.preventDefault()
      this.handleExternalDrop(event)
    })
    ;(this as any)._canvasEl = canvasDom

    if (showProperties) canvasWrap.appendChild(this.buildPropertiesPanel())
    if (showToolbar) canvasWrap.appendChild(this.buildToolbar())

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
    if (showAssetsTab) addTab('assets', t.panel.assets)
    if (this.opts.showTemplates !== false) addPanel('templates')

    const closeBtn = btn('qac-close', t.panel.close, ICONS.close, () => this.closeLeftPanel())
    closeBtn.type = 'button'
    header.append(tabs, closeBtn)
    aside.append(header, panels)

    const firstTab = this.sidebarTabs.keys().next().value as 'shapes' | 'assets' | 'templates' | undefined
    if (firstTab) this.setSidebarTab(firstTab)

    return aside
  }

  private buildShapePanel(): void {
    const scroll = this.sidebarPanels.get('shapes')
    if (!scroll) return
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
          .map((lib) => ({
            ...lib,
            items: lib.items.filter((item) => item.name.toLowerCase().includes(normalized) || item.shape.toLowerCase().includes(normalized)),
          }))
          .filter((lib) => lib.items.length > 0)
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
    if (!panel) return
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
    } else {
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
        } else {
          const wrap = el('div', 'ud-asset-icon-wrap') as HTMLDivElement
          wrap.innerHTML = asset.content
          cell.appendChild(wrap)
        }

        grid.appendChild(cell)
      }
    }

    if (!showPagination) return

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
    if (!panel) return
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
      } else {
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
    if (this.activeSidebarTab === tab) return

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
    if (!this.propertiesPanelEl) return
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

    this.graphManager  = new GraphManager(graph, this.eventBus)
    this.exportService = new ExportService(graph)
    this.zoomTool      = new ZoomTool(graph)
    this.shortcutMgr   = new ShortcutManager(graph)


    this.shortcutMgr.bind()
  }

  // ── Event wiring ───────────────────────────────────────────────────────────

  private wireEvents(): void {
    const graph = (this as any)._graph
    if (!graph) return

    // Undo / redo button state
    graph.on('history:change', () => {
      const canUndo = graph.canUndo?.() ?? false
      const canRedo = graph.canRedo?.() ?? false
      if (this.undoBtn) this.undoBtn.disabled = !canUndo
      if (this.redoBtn) this.redoBtn.disabled = !canRedo
    })

    // Zoom label
    graph.on('scale', ({ sx }: { sx: number }) => {
      if (this.zoomLabel) this.zoomLabel.textContent = `${Math.round(sx * 100)}%`
    })

    // Selection
    graph.on('selection:changed', ({ selected }: { selected: any[] }) => {
      const nodes = selected.filter((c: any) => c.isNode?.()).map((c: any) => {
        const pos  = c.getPosition()
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
      if (this.selectedNodeId || this.selectedEdgeId) this.propertiesHidden = false
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

  private getCanvasCenterPosition(): { x: number; y: number } {
    const graph = (this as any)._graph
    const canvasEl: HTMLElement = (this as any)._canvasEl
    if (!graph) return { x: (canvasEl?.clientWidth ?? 800) / 2, y: (canvasEl?.clientHeight ?? 600) / 2 }
    const cx = (canvasEl?.clientWidth  ?? 800) / 2
    const cy = (canvasEl?.clientHeight ?? 600) / 2
    const local = (typeof (graph as any).clientToLocal === 'function')
      ? (graph as any).clientToLocal({ x: cx, y: cy })
      : { x: cx, y: cy }
    return { x: local.x, y: local.y }
  }

  private screenToCanvasPosition(clientX: number, clientY: number): { x: number; y: number } {
    const graph = (this as any)._graph
    if (!graph) return { x: clientX, y: clientY }
    const local = (typeof (graph as any).clientToLocal === 'function')
      ? (graph as any).clientToLocal({ x: clientX, y: clientY })
      : { x: clientX, y: clientY }
    return { x: local.x, y: local.y }
  }

  private handleMaterialDragStart(item: MaterialItem, event: DragEvent): void {
    if (!event.dataTransfer) return
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
      defaultLabel: asset.name,
      data: asset.type === 'svg'
        ? { imageHref, svgContent: asset.content }
        : { imageHref },
    }
  }

  private handleExternalDrop(event: DragEvent): void {
    const data = event.dataTransfer?.getData('application/json') || event.dataTransfer?.getData('text/plain')
    if (!data) return
    try {
      const item = JSON.parse(data) as MaterialItem
      const position = this.screenToCanvasPosition(event.clientX, event.clientY)
      this.addElementFromMaterial(item, position)
    } catch {
      return
    }
  }

  private addElementFromMaterial(item: MaterialItem, position?: { x: number; y: number }): void {
    if (this.isEdgeMaterial(item)) {
      this.addEdgeFromMaterial(item, position)
      return
    }
    this.addNodeFromMaterial(item, position)
  }

  private addNodeFromMaterial(item: MaterialItem, position?: { x: number; y: number }): void {
    const graph = (this as any)._graph
    if (!graph) return
    const center = position ?? this.getCanvasCenterPosition()
    const x = center.x - item.defaultSize.width  / 2 + (position ? 0 : (Math.random() * 40 - 20))
    const y = center.y - item.defaultSize.height / 2 + (position ? 0 : (Math.random() * 40 - 20))
    const imageHref = typeof item.data?.imageHref === 'string' ? item.data.imageHref : ''
    graph.addNode({
      shape: item.shape,
      x,
      y,
      width: item.defaultSize.width,
      height: item.defaultSize.height,
      label: item.defaultLabel ?? item.name,
      attrs: {
        ...(imageHref
          ? { image: { 'xlink:href': imageHref, refWidth: '100%', refHeight: '100%', x: 0, y: 0 } }
          : {
            body: {
              fill:        item.defaultStyle?.fill        ?? '#fff',
              stroke:      item.defaultStyle?.stroke      ?? PRIMARY_COLOR,
              strokeWidth: item.defaultStyle?.strokeWidth ?? 1.5,
            },
          }),
        label: { fill: '#333', fontSize: 12 },
      },
      ports: item.defaultPorts,
      ...(item.data ? { data: { ...item.data } } : {}),
    })
    this.opts.onDataChange?.(this.getData())
  }

  private addEdgeFromMaterial(item: MaterialItem, position?: { x: number; y: number }): void {
    const graph = (this as any)._graph
    if (!graph) return
    const center = position ?? this.getCanvasCenterPosition()
    const halfWidth = Math.max((item.defaultSize?.width ?? 100) / 2, 40)
    graph.addEdge({
      shape: item.shape,
      source: { x: center.x - halfWidth, y: center.y },
      target: { x: center.x + halfWidth, y: center.y },
      ...(item.defaultLabel ? { label: item.defaultLabel } : {}),
      ...(item.data ? { data: { ...item.data } } : {}),
    })
    this.opts.onDataChange?.(this.getData())
  }

  private applyTemplate(template: TemplateItem): void {
    this.setData(template.data)
    this.selectedNodeId = null
    this.selectedEdgeId = null
    this.updatePropertiesPanel()
    this.updatePropertiesPanelVisibility()
    this.opts.onDataChange?.(this.getData())
  }

  private updatePropertiesPanel(): void {
    if (!this.propertiesBody) return
    const t = this.t

    for (const picker of this.propertyColorPickers) picker.destroy()
    this.propertyColorPickers = []

    this.propertiesBody.innerHTML = ''
    const graph = (this as any)._graph
    if (!graph || (!this.selectedNodeId && !this.selectedEdgeId)) {
      if (this.propertiesTitleEl) this.propertiesTitleEl.textContent = t.properties.title
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
      options: Array<{ label: string; value: string }>,
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
      options: Array<{ value: string; title: string; svg: string }>,
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

    if (this.selectedNodeId) {
      const node = graph.getCellById(this.selectedNodeId)
      if (!node || !node.isNode?.()) {
        if (this.propertiesTitleEl) this.propertiesTitleEl.textContent = t.properties.title
        this.propertiesBody.appendChild(el('div', 'ud-empty-state', t.properties.nodeMissing))
        return
      }

      if (this.propertiesTitleEl) this.propertiesTitleEl.textContent = t.properties.nodeTitle
      const size = node.getSize?.() ?? { width: 80, height: 80 }
      const attrs = node.getAttrs?.() ?? {}
      const body = attrs.body ?? {}

      this.propertiesBody.appendChild(el('div', 'ud-properties-section-title', t.properties.nodeTitle))
      appendTextInput(t.properties.label, node.getLabel?.() ?? '', (next) => {
        node.setLabel?.(next)
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
      return
    }

    const edge = graph.getCellById(this.selectedEdgeId)
    if (!edge || !edge.isEdge?.()) {
      if (this.propertiesTitleEl) this.propertiesTitleEl.textContent = t.properties.title
      this.propertiesBody.appendChild(el('div', 'ud-empty-state', t.properties.edgeMissing))
      return
    }

    if (this.propertiesTitleEl) this.propertiesTitleEl.textContent = t.properties.edgeTitle
    const line = edge.getAttrs?.()?.line ?? {}
    const labels = edge.getLabels?.() ?? []
    const label = labels[0]?.attrs?.label?.text ?? ''
    const router = edge.getRouter?.()
    const connector = edge.getConnector?.()
    const lineType = getEdgeLineType(router, connector, edge.getData?.())
    const sourceMarker = line.sourceMarker?.name ?? 'none'
    const targetMarker = line.targetMarker?.name ?? 'none'

    this.propertiesBody.appendChild(el('div', 'ud-properties-section-title', t.properties.edgeTitle))
    appendTextInput(t.properties.label, label, (next) => {
      if (next) edge.setLabels?.([{ attrs: { label: { text: next } } }])
      else edge.setLabels?.([])
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
    if (edge.shape !== 'edge-sketch') {
      appendIconButtonGroup(t.properties.lineType, lineType, getEdgeLineTypeOptions({
        straight: t.properties.straight,
        curve: t.properties.curve,
        rounded: t.properties.rounded,
        orthogonal: t.properties.orthogonal,
        manhattan: t.properties.manhattan,
        jumpover: t.properties.jumpover,
      }), (next) => {
        const { router: nextRouter, connector: nextConnector } = getEdgeLineConfig(next)
        const vertices = getEdgeLineVertices(next, edge.getSourcePoint?.(), edge.getTargetPoint?.())
        edge.setData?.({ ...(edge.getData?.() ?? {}), lineType: next })
        edge.setRouter?.(nextRouter)
        edge.setConnector?.(nextConnector)
        edge.setVertices?.(vertices)
        this.opts.onDataChange?.(this.getData())
      })
    }
    appendSelectInput(t.properties.lineStyle, line.strokeDasharray ?? '', [
      { label: t.properties.solidLine, value: '' },
      { label: t.properties.dashedLine, value: '5 5' },
      { label: t.properties.dottedLine, value: '2 4' },
    ], (next) => {
      edge.setAttrs?.({ line: { strokeDasharray: next || null } })
      this.opts.onDataChange?.(this.getData())
    })
    appendSelectInput(t.properties.sourceMarker, sourceMarker, [
      { label: t.properties.markerNone, value: 'none' },
      { label: t.properties.markerClassic, value: 'classic' },
      { label: t.properties.markerBlock, value: 'block' },
      { label: t.properties.markerOpen, value: 'open' },
      { label: t.properties.markerDiamond, value: 'diamond' },
      { label: t.properties.markerCircle, value: 'circle' },
    ], (next) => {
      edge.setAttrs?.({ line: { sourceMarker: next === 'none' ? null : { name: next } } })
      this.opts.onDataChange?.(this.getData())
    })
    appendSelectInput(t.properties.targetMarker, targetMarker, [
      { label: t.properties.markerNone, value: 'none' },
      { label: t.properties.markerClassic, value: 'classic' },
      { label: t.properties.markerBlock, value: 'block' },
      { label: t.properties.markerOpen, value: 'open' },
      { label: t.properties.markerDiamond, value: 'diamond' },
      { label: t.properties.markerCircle, value: 'circle' },
    ], (next) => {
      edge.setAttrs?.({ line: { targetMarker: next === 'none' ? null : { name: next } } })
      this.opts.onDataChange?.(this.getData())
    })
  }

  // ── Export helpers ─────────────────────────────────────────────────────────

  private async exportPNGToFile(): Promise<void> {
    const dataUrl = await this.exportService?.toPNG({ padding: 20 })
    if (!dataUrl) return
    const a = document.createElement('a')
    a.href = dataUrl
    a.download = 'diagram.png'
    a.click()
  }

  private exportJSONToFile(): void {
    const data = this.getData()
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = 'diagram.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  // ── Public API ─────────────────────────────────────────────────────────────

  getData(): GraphData {
    return this.graphManager?.exportData() ?? { canvas: {}, nodes: [], edges: [] }
  }

  setData(data: GraphData): void {
    this.graphManager?.loadData(data)
  }

  clear(): void {
    const g = (this as any)._graph
    if (g) {
      g.clearCells()
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
    if (this.opts.showTemplates === false) return
    this.openLeftPanel()
    if (this.sidebarPanels.has('templates')) this.setSidebarTab('templates')
  }

  undo(): void {
    const g = (this as any)._graph
    if (g) (g as any).undo?.()
  }
  redo(): void {
    const g = (this as any)._graph
    if (g) (g as any).redo?.()
  }
  zoomIn(): void  { this.zoomTool?.zoomIn() }
  zoomOut(): void { this.zoomTool?.zoomOut() }
  zoomFit(): void { this.zoomTool?.zoomToFit({ padding: 24 }) }

  selectAll(): void {
    const g = (this as any)._graph
    if (g) g.select?.(g.getCells())
  }

  deleteSelection(): void {
    const g = (this as any)._graph
    if (g) g.removeCells?.(g.getSelectedCells?.() ?? [])
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
