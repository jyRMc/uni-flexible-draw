import './styles/index.css'
import type { App } from 'vue'
import { UniDraw } from './components/UniDraw'
import { FlexibleDraw } from './components/FlexibleDraw'
import { ShapePanel } from './components/ShapePanel'
import { Toolbar } from './components/Toolbar'
import { MiniMap } from './components/MiniMap'
import { ContextMenu } from './components/ContextMenu'
import { QuickActionBar } from './components/QuickActionBar'

// ===== Primary component =====
export { UniDraw }
export type { UniDrawProps } from './components/UniDraw'

// ===== Sub-components (advanced / custom layouts) =====
export { FlexibleDraw, ShapePanel, Toolbar, MiniMap, ContextMenu, QuickActionBar }
export type { FlexibleDrawProps } from './components/FlexibleDraw'
export type { ShapePanelProps } from './components/ShapePanel'
export type { ToolbarProps } from './components/Toolbar'
export type { QuickActionBarProps } from './components/QuickActionBar'
export { useCanvas } from './composables/useCanvas'
export type { UniDrawLocale } from './locale'
export { LOCALE_KEY, useLocale, zhCN, enUS } from './locale'

// ===== Shapes =====
export { registerAllShapes } from './shapes/register'

// ===== Materials =====
export { getAllLibraries, getLibraryById } from './materials/index'

// ===== Shared types & utils =====
export * from './shared/types'
export * from './shared/utils'
export * from './shared/constants/shapes'
export * from './shared/constants/theme'
export * from './shared/constants/ports'

// ===== Core (advanced usage) =====
export { AntVRenderEngine } from './core/engine/AntVRenderEngine'
export type { AntVRenderEngineOptions } from './core/engine/AntVRenderEngine'
export { GraphManager } from './core/graph/GraphManager'
export { NodeRegistry } from './core/node/NodeRegistry'
export { NodeFactory } from './core/node/NodeFactory'
export { EdgeRegistry } from './core/edge/EdgeRegistry'
export { EdgeFactory } from './core/edge/EdgeFactory'
export type { ICommand } from './core/command/ICommand'
export { CommandManager } from './core/command/CommandManager'
export { BatchCommand } from './core/command/BatchCommand'
export { ExportService } from './core/export/ExportService'
export { DataMigration } from './core/export/DataMigration'
export type { ExportImageOptions } from './core/export/ExportService'
export { GraphEventBus } from './core/event/GraphEventBus'
export { ZoomTool } from './core/tool/ZoomTool'
export { MiniMapTool } from './core/tool/MiniMapTool'
export type { MiniMapOptions } from './core/tool/MiniMapTool'
export { SnaplineTool } from './core/tool/SnaplineTool'
export { PanTool } from './core/tool/PanTool'
export { ShortcutManager } from './core/shortcut/ShortcutManager'
export { ClipboardManager } from './core/clipboard/ClipboardManager'
export type { ClipboardCell } from './core/clipboard/ClipboardManager'
export { SketchRenderer, getSketchRenderer, ROUGHNESS } from './core/sketch/SketchRenderer'
export type { SketchRenderOptions } from './core/sketch/SketchRenderer'

const components = [UniDraw, FlexibleDraw, ShapePanel, Toolbar, MiniMap, ContextMenu, QuickActionBar]

export default {
  install(app: App) {
    for (const component of components) {
      app.component(component.name ?? component.__name ?? 'Unknown', component)
    }
  },
}
