<p align="center">
  <img src="docs/img/logo.svg" width="320" alt="Uni Flexible Draw logo">
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Vue-3.4.27-33A06F" alt="Vue 3.4.27">
  <img src="https://img.shields.io/badge/Vite-5.2.12-8A2BE2" alt="Vite 5.2.12">
  <img src="https://img.shields.io/badge/AntV%20X6-2.18.1-5B8CFF" alt="AntV X6 2.18.1">
  <img src="https://img.shields.io/badge/Node.js-18%2B-43853D" alt="Node.js 18+">
  <img src="https://img.shields.io/badge/License-MIT-F4A261" alt="License MIT">
</p>

<p align="center">
  <img src="docs/screenshot-20260529-085959.png" alt="Uni Flexible Draw editor screenshot" width="100%">
</p>

<p align="center">
  <a href="./README.md">English</a> | <strong>简体中文</strong>
</p>

# Uni Flexible Draw

基于 `Vue 3 + AntV X6` 的通用绘图组件库，提供：

- 一体化编辑器 `UniDraw`
- 可拆分的画布与面板子组件
- Vue 使用方式
- React 包装层使用方式
- 图形库、素材面板、模板面板、快捷操作栏等能力
- 独立 Node.js server，用于素材接口与 AI 代理接口

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

快捷操作栏组件，用于在选中节点或边后进行样式与局部编辑操作。

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
</script>

<template>
  <UniDraw
    v-model="graphData"
    :assets="assets"
    :templates="templates"
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
- `locale`
- `theme`

### Vue 常用事件

- `update:modelValue`
- `ready`
- `selection:change`
- `assets:prev-page`
- `assets:next-page`

### Vue ref 暴露方法

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

## 组件画布输入输出 JSON 格式

`UniDraw` 组件接收和产出的画布数据，统一使用 `GraphData` 结构。

### 输入方式

- Vue `v-model` / `modelValue`
- React `value`
- 实例方法 `setData(data)`

### 输出方式

- Vue `update:modelValue`
- React `onChange`
- 实例方法 `getData()`
- 实例方法 `exportJSON()`，返回同结构的 JSON 字符串

### 根结构

```ts
interface GraphData {
  canvas: CanvasConfig
  nodes: NodeData[]
  edges: EdgeData[]
  meta?: GraphMeta
}
```

### 主要字段说明

- `canvas`
  - 画布级配置，例如 `backgroundColor`、`grid`、`zoom`、`offset`

- `nodes`
  - 节点数组
  - 每个节点通常包含 `id`、`shape`、`position`、`size`
  - 可选字段包括 `label`、`style`、`data`、`ports`、`locked`、`angle`、`zIndex`

- `edges`
  - 连线数组
  - 每条边通常包含 `id`、`shape`、`source`、`target`
  - 可选字段包括 `label`、`style`、`data`、`vertices`、`router`、`connector`

- `meta`
  - 可选元数据，例如 `title`、`type`、`createdAt`、`version`、`aiGenerated`

### JSON 示例

```json
{
  "canvas": {
    "backgroundColor": "#ffffff",
    "grid": {
      "size": 10,
      "visible": true,
      "type": "dot",
      "color": "#e5e7eb"
    },
    "zoom": 1,
    "offset": { "x": 0, "y": 0 }
  },
  "nodes": [
    {
      "id": "node-start",
      "shape": "flow-start",
      "position": { "x": 120, "y": 100 },
      "size": { "width": 120, "height": 48 },
      "label": "Start",
      "style": {
        "fill": "#EEF4FF",
        "stroke": "#5B8CFF",
        "strokeWidth": 2
      },
      "data": {
        "bizType": "entry"
      }
    },
    {
      "id": "node-process",
      "shape": "flow-process",
      "position": { "x": 340, "y": 100 },
      "size": { "width": 160, "height": 56 },
      "label": {
        "text": "Process Data",
        "position": "center",
        "style": {
          "fontSize": 14,
          "fontWeight": "bold",
          "fill": "#1f2937"
        }
      }
    }
  ],
  "edges": [
    {
      "id": "edge-1",
      "shape": "flow-edge",
      "source": { "cell": "node-start" },
      "target": { "cell": "node-process" },
      "label": "next",
      "style": {
        "stroke": "#64748b",
        "strokeWidth": 2,
        "targetMarker": {
          "name": "classic",
          "size": 8,
          "fill": "#64748b"
        }
      }
    }
  ],
  "meta": {
    "title": "Sample Flow",
    "type": "flowchart",
    "version": "1.0.0"
  }
}
```

### 说明

- `shape` 必须和已注册的节点或边类型名称一致。
- `label` 可以是纯字符串，也可以是带位置和样式的对象。
- `source` / `target` 可以是节点 ID、`{ cell, port }` 对象，或者坐标对象。
- `data` 用于承载你的业务字段，导入导出时会原样保留。

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
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  )
}
```

### React Props 对应关系

React 包装层对外主要做了以下映射：

- `value` -> 初始化或同步图数据
- `onChange` -> 数据变化回调
- `onReady` -> 实例准备完成
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
- `undo()`
- `redo()`
- `zoomIn()`
- `zoomOut()`
- `zoomFit()`
- `selectAll()`
- `deleteSelection()`

## AI 接入说明

当前仓库中的 AI 面板已经改为 **外部面板 + 运行时配置** 模式，不再依赖内置的 `showAiPanel` 或 `ai:generate` 事件。

你需要在业务层显式提供以下输入：

- `model`
- `apiUrl`
- `apiKey`

共享 AI 客户端位于：

- `src/shared/utils/aiService.ts`

主要接口：

- `diagnoseAiConnection(config)`
- `generateGraph(prompt, config, onToken)`

配置结构：

```ts
interface AIConnectionConfig {
  model: string
  apiUrl: string
  apiKey: string
}
```

示例项目中的 AI 面板位置：

- `src/views/AIPanel.vue`
- `examples/vue/src/views/AIPanel.vue`
- `examples/react/src/components/AIPanel.tsx`

所有 AI 请求默认会转发到本地 Node server：

- `POST /api/ai/diagnose`
- `POST /api/ai/chat`

默认 server 地址：

- `http://127.0.0.1:3077`

如果需要修改，可以通过环境变量覆盖：

- `VITE_UNIDRAW_SERVER`
- `VITE_SVG_ASSETS_API`

## 高级使用说明

如果你不想直接使用一体化 `UniDraw`，可以改为：

- 使用 `FlexibleDraw` 作为核心画布
- 使用 `ShapePanel` 自定义左栏
- 使用 `Toolbar` 自定义工具栏
- 使用 `QuickActionBar` 自定义右侧或浮动编辑区
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
pnpm dev:server
```

兼容旧命令：

```bash
pnpm dev:assets-api
```

该服务会同时提供：

- `GET /health`
- `GET /api/assets`
- `POST /api/ai/diagnose`
- `POST /api/ai/chat`

默认地址：

- `http://127.0.0.1:3077`

`/api/assets` 支持：

- `page`
- `pageSize`
- `keyword`
- `category`
- `reload=true`

默认分页大小为 `80`，最大 `200`。

Vue 与 React 示例都依赖这个本地 server 拉取素材并转发 AI 请求。

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

### 自动修复格式或部分 lint

```bash
pnpm lint:fix
pnpm format
```

## 项目结构说明

```text
server/
  index.mjs           素材接口与 AI 代理服务
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
  crawl_scidraw_assets.py
```

## 说明

- 仓库中的示例当前使用 `@uni-draw/draw`、`@uni-draw/draw/react` 等别名进行联调。
- 如果你要对外发布到 npm，请以你最终的包名和导出配置为准。
