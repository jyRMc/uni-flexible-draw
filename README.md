# Uni Flexible Draw

基于 `Vue 3 + AntV X6` 的通用绘图组件库，提供：

- 一体化编辑器 `UniDraw`
- 可拆分的画布与面板子组件
- Vue 使用方式
- React 包装层使用方式
- 图形库、素材面板、模板面板、AI 面板、快捷操作栏等能力

## 项目定位

该仓库当前同时包含两条使用路径：

- **Vue 组件路径**
  - 主入口：`@uni-draw/draw`
  - 适合直接在 Vue 项目中使用完整编辑器或子组件

- **React 路径**
  - 入口：`@uni-draw/draw/react`
  - 本质上是对 `lib/UniDraw.ts` 的 React 包装
  - 适合在 React 项目中以组件 + ref API 的方式使用

## 组件封装说明

### 1. `UniDraw`

主编辑器组件，内部已封装以下区域：

- 左侧图形面板
- 左侧素材面板
- 模板面板
- 中央画布
- 浮动工具栏
- 快捷操作栏
- AI 面板

适合场景：

- 希望快速接入完整绘图编辑器
- 不想自行拼装工具栏、面板、画布

### 2. `FlexibleDraw`

底层画布组件，负责图元绘制、选择、拖拽、连线、缩放等核心能力。

适合场景：

- 需要自定义外层布局
- 希望自己组合工具栏、面板、右侧属性区

### 3. `ShapePanel`

图形面板组件，用于展示内置图形库并支持点击添加、拖拽到画布。

### 4. `Toolbar`

工具栏组件，负责撤销、重做、缩放、导出、画布操作等行为入口。

### 5. `QuickActionBar`

快捷操作栏组件，用于在选中节点/边后进行样式与局部编辑操作。

### 6. 其他导出

仓库还导出以下能力，适合高级用法：

- `MiniMap`
- `ContextMenu`
- `useCanvas`
- `registerAllShapes`
- `getAllLibraries`
- 各类 `shared types`
- 核心引擎与管理器：`AntVRenderEngine`、`GraphManager`、`ExportService` 等

## 导出入口说明

### Vue

```ts
import { UniDraw } from '@uni-draw/draw'
```

也可使用默认安装插件方式：

```ts
import UniDrawPlugin from '@uni-draw/draw'
app.use(UniDrawPlugin)
```

### React

```ts
import { UniDraw } from '@uni-draw/draw/react'
```

### Vue 单独入口

```ts
import UniDraw from '@uni-draw/draw/vue'
```

## 使用说明

## Vue 基础使用

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { UniDraw } from '@uni-draw/draw'
import type { GraphData, AssetItem, TemplateItem } from '@uni-draw/draw'

const graphData = ref<GraphData>({
  canvas: { backgroundColor: '#ffffff', grid: { size: 10, visible: true, type: 'dot' }, zoom: 1 },
  nodes: [],
  edges: [],
})

const assets = ref<AssetItem[]>([])
const templates = ref<TemplateItem[]>([])

function onAiGenerate(prompt: string, context: GraphData) {
  console.log(prompt, context)
}
</script>

<template>
  <UniDraw
    v-model="graphData"
    :assets="assets"
    :templates="templates"
    :show-ai-panel="true"
    @ai:generate="onAiGenerate"
  />
</template>
```

### Vue 常用 Props

- `modelValue`
- `assets`
- `templates`
- `assetPage`
- `assetTotalPages`
- `assetPageLoading`
- `canPrevAssets`
- `canNextAssets`
- `grid`
- `snapline`
- `readonly`
- `showShapePanel`
- `showAssetsPanel`
- `showTemplates`
- `showToolbar`
- `showMinimap`
- `showAiPanel`
- `locale`
- `theme`

### Vue 常用事件

- `update:modelValue`
- `ready`
- `selection:change`
- `ai:generate`
- `assets:prev-page`
- `assets:next-page`

### Vue ref 暴露方法

- `openAiPanel()`
- `closeAiPanel()`
- `toggleAiPanel()`
- `openTemplatePanel()`
- `getData()`
- `setData(data)`
- `clear()`
- `exportPNG()`
- `exportJSON()`
- `exportSVG()`
- `undo()`
- `redo()`
- `zoomIn()`
- `zoomOut()`
- `zoomFit()`
- `selectAll()`
- `deleteSelection()`
- `applyAiResult(data?, message?, followUp?)`

## React 基础使用

```tsx
import { useRef, useState } from 'react'
import { UniDraw, type UniDrawRef } from '@uni-draw/draw/react'
import type { GraphData } from '@uni-draw/draw'

export default function App() {
  const drawRef = useRef<UniDrawRef>(null)
  const [graphData, setGraphData] = useState<GraphData>({
    canvas: { backgroundColor: '#ffffff', grid: { size: 10, visible: true, type: 'dot' }, zoom: 1 },
    nodes: [],
    edges: [],
  })

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <UniDraw
        ref={drawRef}
        value={graphData}
        onChange={setGraphData}
        showAiPanel
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  )
}
```

### React Props 对应关系

React 包装层对外主要做了以下映射：

- `value` -> 初始化/同步图数据
- `onChange` -> 数据变化回调
- `onReady` -> 实例准备完成
- `onAiGenerate` -> AI 生成事件
- `onSelectionChange` -> 选区变化

其余大部分配置项沿用底层 `UniDrawOptions`。

### React ref 方法

- `getData()`
- `setData(data)`
- `clear()`
- `exportPNG()`
- `exportSVG()`
- `exportJSON()`
- `openTemplatePanel()`
- `openAiPanel()`
- `closeAiPanel()`
- `toggleAiPanel()`
- `clearAiChat()`
- `undo()`
- `redo()`
- `zoomIn()`
- `zoomOut()`
- `zoomFit()`
- `selectAll()`
- `deleteSelection()`
- `applyAiResult(data?, message?, followUp?)`

## 高级使用说明

如果你不想直接使用一体化 `UniDraw`，可以改为：

- 使用 `FlexibleDraw` 作为核心画布
- 使用 `ShapePanel` 自定义左栏
- 使用 `Toolbar` 自定义工具栏
- 使用 `QuickActionBar` 自定义右侧/浮动编辑区
- 使用 `useCanvas` 自行控制数据与交互

这适合：

- 自定义业务布局
- 自定义顶栏、侧栏、属性面板
- 嵌入到已有设计器系统中

## 运行说明

## 环境要求

- Node.js 18+
- pnpm 9+
- 如需抓取素材，需具备 Python 运行环境

## 安装依赖

```bash
pnpm install
```

## 启动方式

### 1. 启动主开发环境

```bash
pnpm dev
```

### 2. 启动 Vue 示例

```bash
pnpm dev:vue
```

### 3. 启动 React 示例

```bash
pnpm dev:react
```

### 4. 启动素材 API 服务

```bash
pnpm dev:assets-api
```

默认脚本会启动本地素材接口，供 Vue / React 示例拉取 SVG 素材数据。

### 5. 抓取 SciDraw 素材

```bash
pnpm crawl:assets
```

该命令依赖 Python 脚本 `scripts/crawl_scidraw_assets.py`。

## 构建与检查

### 构建

```bash
pnpm build
```

### 预览构建结果

```bash
pnpm preview
```

### 代码检查

```bash
pnpm lint
```

### 自动修复格式/部分 lint

```bash
pnpm lint:fix
pnpm format
```

## 项目结构说明

```text
lib/
  components/        Vue 组件实现
  react/             React 包装层
  vue/               Vue 单独导出入口
  core/              渲染、图管理、工具、导出等核心能力
  materials/         内置图形库
  shared/            共享类型、常量、工具
examples/
  vue/               Vue 示例
  react/             React 示例
scripts/
  serve-svg-assets.mjs
  crawl_scidraw_assets.py
```

## 说明

- 仓库中的示例当前使用 `@uni-draw/draw`、`@uni-draw/draw/react` 等别名进行联调。
- 如果你要对外发布到 npm，请以你最终的包名和导出配置为准。
