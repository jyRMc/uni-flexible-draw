# uni-flexible-draw 项目代码结构分析

> 本文档用于帮助新成员快速理解项目结构、模块划分和核心实现，便于后续介入开发。

---

## 1. 项目概述

`uni-flexible-draw` 是一个基于 **Vue 3 + AntV X6** 的通用绘图组件库，目标是提供：

- 一体化编辑器 `UniDraw`（Vue / React 均可使用）
- 可拆分的画布与面板子组件
- 丰富的内置图形库（流程图、UML、ER、时序图、状态图、DFD、泳道等）
- 素材面板、模板面板、快捷操作栏、手绘模式等高级能力
- 独立的 Node.js 服务端：素材 API + AI 代理

### 1.1 技术栈

| 层级 | 技术 |
|------|------|
| 视图框架 | Vue 3.4 + Composition API |
| 画布引擎 | AntV X6 2.18 + History / Selection / Transform 插件 |
| 构建工具 | Vite 5.2 |
| 类型系统 | TypeScript 5.4 |
| 包管理 | pnpm 9 |
| 服务端 | Node.js 原生 `http` 模块（零框架依赖） |

### 1.2 双入口设计

项目存在两套代码组织：

- **`src/`**：开发源码，包含 Vue 应用主入口、示例视图、mock 数据等。
- **`lib/`**：组件库源码，作为 Vite 构建和 tsconfig 路径别名的实际目标目录。

> 注意：`lib/` 与 `src/` 中大部分组件和 core 代码结构高度重合，但 `lib/` 额外包含 `UniDraw.ts`（原生 JS 类实现，供 React wrapper 使用）和 `react/`、`vue/` 子入口。日常修改应优先同步到 `src/`，然后视情况同步到 `lib/`。

---

## 2. 目录结构

```text
uni-flexible-draw/
├── assets/                     # 本地 SVG/图片素材（被 server 索引）
├── docs/                       # 文档、截图、Logo
├── examples/
│   ├── vue/                    # Vue 使用示例
│   └── react/                  # React 使用示例
├── lib/                        # 组件库源码（构建目标）
│   ├── components/             # Vue 组件
│   ├── composables/            # Vue 组合式函数
│   ├── core/                   # 渲染引擎、图管理、工具等核心能力
│   ├── locale/                 # 国际化（zh-CN / en-US）
│   ├── materials/              # 内置图形库 JSON 配置
│   ├── react/                  # React 包装入口
│   ├── shapes/                 # 图形定义（X6 节点/边注册）
│   ├── shared/                 # 类型、常量、工具函数
│   ├── styles/                 # CSS 样式与 CSS 变量
│   ├── vue/                    # Vue 单独入口
│   ├── UniDraw.ts              # 原生 JS 类实现（React wrapper 底层）
│   └── index.ts                # 组件库主入口
├── scripts/
│   └── crawl_scidraw_assets.py # SciDraw 素材爬取脚本
├── server/
│   └── index.mjs               # Node 服务：素材 API + AI 代理
├── src/                        # 开发源码
│   ├── components/             # 与 lib/components 对应
│   ├── composables/            # 与 lib/composables 对应
│   ├── core/                   # 与 lib/core 对应
│   ├── locale/                 # 与 lib/locale 对应
│   ├── materials/              # 与 lib/materials 对应
│   ├── mocks/                  # AI 与模板 mock 数据
│   ├── shapes/                 # 与 lib/shapes 对应
│   ├── shared/                 # 与 lib/shared 对应
│   ├── styles/                 # 与 lib/styles 对应
│   ├── views/                  # 应用级视图（AIDrawExample、AIPanel 等）
│   ├── App.vue                 # Vue 应用根组件
│   ├── main.ts                 # Vue 应用入口
│   └── index.ts                # src 主入口（与 lib/index.ts 对应）
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md / README.zh-CN.md
```

---

## 3. 模块划分

### 3.1 组件层（`components/`）

| 组件 | 文件 | 职责 |
|------|------|------|
| `UniDraw` | `components/UniDraw/UniDraw.vue` | 一体化编辑器，组合左侧边栏、画布、工具栏、快捷操作栏、JSON 预览弹窗 |
| `FlexibleDraw` | `components/FlexibleDraw/FlexibleDraw.vue` | 底层画布组件，暴露 `useCanvas` 的大部分能力，支持外部拖放、手绘模式、SVG 编辑器 |
| `ShapePanel` | `components/ShapePanel/*.vue` | 左侧图形库面板，按分类展示内置图形 |
| `Toolbar` | `components/Toolbar/*.vue` | 浮动工具栏（撤销/重做/缩放/手绘/对齐/导出等） |
| `QuickActionBar` | `components/QuickActionBar/*.vue` | 选中节点/边后的浮动属性编辑条 |
| `MiniMap` | `components/MiniMap/*.vue` | 小地图 |
| `ContextMenu` | `components/ContextMenu/*.vue` | 右键菜单 |
| `ColorPicker` | `components/ColorPicker/*.vue` | 颜色选择器（含原生版本） |
| `TemplatePanel` | `components/TemplatePanel/*.vue` | 模板选择弹窗 |

### 3.2 组合式函数层（`composables/`）

| 文件 | 职责 |
|------|------|
| `useCanvas.ts` | **核心组合式函数**，封装 X6 Graph 的初始化、数据绑定、事件监听、选中状态、手绘、剪贴板、上下文菜单等完整能力 |
| `useAlignment.ts` | 选中节点的对齐逻辑（左对齐/右对齐/水平居中/垂直居中/顶对齐/底对齐） |
| `useStyleEditor.ts` | 节点/边样式编辑，边类型切换，自动顶点处理 |
| `useSketch.ts` | 草图模式（roughjs 手绘风格）的状态管理与渲染触发 |

### 3.3 核心引擎层（`core/`）

| 目录 | 文件 | 职责 |
|------|------|------|
| `engine/` | `AntVRenderEngine.ts` | X6 Graph 实例的创建、插件安装、事件挂载、销毁 |
| `graph/` | `GraphManager.ts` | GraphData 与 X6 实例的双向同步（加载、导出、增删节点/边） |
| `node/` | `NodeRegistry.ts` | X6 节点定义注册表 |
| `node/` | `NodeFactory.ts` | NodeData ↔ X6 Node 的序列化与反序列化 |
| `edge/` | `EdgeRegistry.ts` | X6 边定义注册表 |
| `edge/` | `EdgeFactory.ts` | EdgeData ↔ X6 Edge 的序列化与反序列化 |
| `command/` | `CommandManager.ts` / `BatchCommand.ts` / `ICommand.ts` | 命令模式（当前主要依赖 X6 History 插件，CommandManager 为扩展预留） |
| `export/` | `ExportService.ts` | JSON / PNG / SVG 导入导出 |
| `export/` | `DataMigration.ts` | 数据版本迁移兼容 |
| `event/` | `GraphEventBus.ts` | 类型化事件总线 |
| `tool/` | `ZoomTool.ts` / `PanTool.ts` / `MiniMapTool.ts` / `SnaplineTool.ts` | 缩放、平移、小地图、对齐线 |
| `shortcut/` | `ShortcutManager.ts` | 快捷键注册与绑定 |
| `clipboard/` | `ClipboardManager.ts` | 复制/剪切/粘贴/ duplicate |
| `sketch/` | `SketchRenderer.ts` | roughjs 草图渲染器（自定义 X6 渲染） |

### 3.4 图形定义层（`shapes/`）

图形按领域分类组织：

```text
shapes/
├── basic/           # 基础几何图形：rect、circle、diamond、table、image、svg 等
├── flowchart/       # 流程图：start-end、process、decision、database 等
├── uml/             # UML：class、actor、use-case、component、deployment 等
├── sequence/        # 时序图：actor、lifeline、activation、fragment 等
├── er/              # ER 图：entity、relationship、attribute 等
├── dfd/             # 数据流图：process、data-store、external-entity 等
├── swimlane/        # 泳道图：horizontal、vertical、pool、phase
├── state/           # 状态图：state、initial、final、history、fork、join 等
├── edge/            # 连线：line、arrow、dashed、curve、orthogonal、sketch
├── register.ts      # 一键注册所有内置图形
└── theme.ts         # 图形主题与默认配色
```

每个 shape 目录下的文件通常遵循 `export const basicRect = { ... }` 的 X6 节点定义格式。

### 3.5 共享层（`shared/`）

```text
shared/
├── types/
│   ├── graph.ts     # GraphData / CanvasConfig / GraphMeta / AIGraphData
│   ├── node.ts      # NodeData / NodeStyle / LabelConfig / PortsConfig
│   ├── edge.ts      # EdgeData / EdgeStyle / MarkerConfig
│   ├── material.ts  # MaterialLibrary / MaterialItem
│   └── unidraw.ts   # AssetItem / TemplateItem / AiMessage / UniDrawTheme
├── constants/
│   ├── shapes.ts    # 所有 shape 名称常量与 RX 支持集合
│   ├── theme.ts     # 主题色常量（PRIMARY_COLOR 等）
│   └── ports.ts     # 默认连接桩配置
├── utils/
│   ├── id.ts        # shortId 生成
│   ├── deepClone.ts # 深拷贝
│   └── edgeLineIcons.ts / edgeLine.ts # 边线类型图标与配置
└── index.ts
```

### 3.6 国际化（`locale/`）

- `zh-CN.ts` / `en-US.ts`：翻译字典
- `types.ts`：UniDrawLocale 类型
- `useLocale.ts`：组合式函数，通过 `provide/inject(LOCALE_KEY)` 消费

### 3.7 服务端（`server/`）

`server/index.mjs` 是一个轻量 Node 服务，提供：

- `GET /health`：健康检查
- `GET /api/assets`：分页返回 `assets/` 目录下的 SVG 素材
  - 参数：`page`、`pageSize`、`keyword`、`category`、`reload`
- `POST /api/ai/diagnose`：代理到上游 AI 服务 `/models`，验证连通性
- `POST /api/ai/chat`：代理到上游 AI 服务 `/chat/completions`，支持 SSE 流式返回

---

## 4. 核心功能实现

### 4.1 画布初始化流程（`useCanvas`）

```
FlexibleDraw.vue
  └─ useCanvas(options)
       ├─ onMounted
       │   ├─ new GraphEventBus()
       │   ├─ new AntVRenderEngine().init(container, opts)
       │   │   └─ new Graph({ ... }) + use(Selection) + use(History) + use(Transform)
       │   ├─ new GraphManager(graph, eventBus)
       │   ├─ new ExportService(graph)
       │   ├─ new ZoomTool / PanTool / MiniMapTool / ShortcutManager / ClipboardManager
       │   ├─ 绑定 graph 事件（history:change / scale / cell:selected / cell:unselected / ...）
       │   ├─ graphManager.loadData(initialData)
       │   └─ watch(modelValue) 双向绑定
       └─ 返回 refs + 操作方法（zoom/canUndo/selectedNodeData/...）
```

关键绑定：

- `history:change` → 更新 `canUndo` / `canRedo`
- `scale` → 更新 `zoom`
- `cell:selected` / `cell:unselected` → 更新 `selectedNodeData` / `selectedEdgeData`
- `data:changed`（事件总线）→ 通过 `emit('update:modelValue')` 同步外部 `v-model`

### 4.2 数据流（GraphData）

```ts
interface GraphData {
  canvas: CanvasConfig   // 背景色、网格、zoom、offset
  nodes: NodeData[]      // 节点数组
  edges: EdgeData[]      // 边数组
  meta?: GraphMeta       // 标题、类型、版本、AI 标记等
}
```

数据流转：

1. 外部通过 `v-model` / `setData()` 传入 `GraphData`
2. `GraphManager.loadData()` 暂停历史 → 清空画布 → 调用 `NodeFactory.createNode` / `EdgeFactory.createEdge` 批量添加 → 清空历史栈
3. 用户交互触发 X6 内部变更 → `GraphManager` 监听 `node:added|removed|changed` / `edge:added|removed|changed` → `eventBus.emit('data:changed')`
4. `useCanvas` 收到 `data:changed` → `emit('update:modelValue')` / `emit('change')`
5. 外部响应式数据更新 → `watch` 检测到非自身触发的变更 → `graphManager.loadData(newData)`

> 通过 `isEmittingUpdate` 标记避免循环更新。

### 4.3 节点/边序列化

- **`NodeFactory.createNode(graph, data)`**：
  - 普通 shape → `attrs: { body: { ...data.style } }`
  - `basic-image` / `basic-svg` → `attrs: { image: { 'xlink:href': ... } }`
  - `basic-table` → 通过 `buildTableMarkup` / `buildTableAttrs` 生成表格结构
  - `basic-cylinder` → 分别设置 `bodyFill` / `topCap` / `bottomCap` / `leftLine` / `rightLine`
  - 未指定 ports → 使用 `DEFAULT_PORTS`（上下左右四个连接桩，默认隐藏）

- **`NodeFactory.toData(node)`**：
  - 从 `node.getPosition()` / `node.getSize()` 读取位置尺寸
  - 根据 shape 类型从 attrs 提取 style
  - 保留 `data` / `label` / `ports` / `angle` / `zIndex`

- **`EdgeFactory.createEdge(graph, data)`**：
  - 普通边 → `attrs: { line: { ...data.style } }`
  - `edge-sketch` → 使用自定义 connector `uni-draw-sketch-straight` + roughjs seed
  - 支持 `vertices` / `router` / `connector`

### 4.4 左侧图形/素材面板

`UniDraw.vue` 中的左侧面板包含两个 tab：

- **shapes**：`<ShapePanel :libraries="libraries" />`
  - 内置库通过 `getAllLibraries()` 从 `materials/*.json` 读取
  - 点击 → `onShapeAdd` → `canvasRef.createElementFromMaterial(item, pos)`
  - 拖拽 → `onShapeDragStart` → 通过 `dataTransfer` 携带 JSON，在 `FlexibleDraw` 的 `@drop` 中解析
- **assets**：展示外部 `AssetItem[]`，支持点击/拖拽，转换为 `basic-image` 或 `basic-svg` 节点

### 4.5 快捷操作栏（QuickActionBar）

选中节点或边时显示，支持：

- 节点：修改填充/边框/线宽/虚线/圆角/透明度、对齐、锁定、层级、手绘切换、表格行列增删、单元格编辑
- 边：修改颜色/线宽/线型/箭头、切换直线/曲线/正交/手绘、编辑标签

数据回传：`onUpdateStyle(id, style)` → `canvas.updateNodeStyle(id, style)` → 调用 X6 `node.setAttrs()`。

### 4.6 手绘模式（Draw Mode）

`FlexibleDraw.vue` 内部维护了一个透明 `<canvas class="draw-overlay">`：

- 开启后禁用 X6 Selection
- 监听 `mousedown` / `mousemove` / `mouseup`
- 收集屏幕坐标 → 通过 `screenToCanvas()` 转为画布坐标
- 生成 SVG path → 调用 `addPathNode(x, y, w, h, d)` 创建 `shape: 'path'` 的 X6 节点
- 画笔样式：`stroke` / `strokeWidth` / `strokeDasharray` / `opacity`

### 4.7 草图模式（Sketch Mode）

通过 `useSketch` 管理：

- `sketchElementIds: Set<string>` 记录已启用草图风格的元素
- 切换时：调用 `toggleElementSketch(id)` → 通过 `SketchRenderer` 对节点/边进行 roughjs 重绘
- 全局草图模式：`toggleSketchMode()` 将所有元素加入 `sketchElementIds`

### 4.8 剪贴板与快捷键

`ClipboardManager`：

- `copy(cells)`：序列化当前选中的节点/边
- `cut(cells)`：复制后删除
- `paste()`：反序列化并添加新实例，自动偏移
- `duplicate()`：复制 + 粘贴

`ShortcutManager`：

- 底层依赖 X6 `keyboard` 配置
- 注册 action 名称到回调函数，统一 `bind()` / `unbind()`
- 默认注册：cut / copy / paste / duplicate / copyAsPng / toBack / toFront / moveDown / moveUp / flipH / flipV / addLink / toggleLock

### 4.9 导出功能

`ExportService`：

- `toJSON(data)`：直接 `JSON.stringify`
- `fromJSON(json)`：`JSON.parse` 后经过 `DataMigration.migrate()` 做版本兼容
- `toPNG(opts)`：调用 X6 原生 `graph.toPNG()`
- `toSVG(opts)`：调用 X6 原生 `graph.toSVG()`

`UniDraw.vue` 额外提供 JSON 预览弹窗，支持复制和下载。

### 4.10 React 接入方式

`lib/react/UniDraw.tsx` 是一个 React forwardRef 组件：

- 内部 `new UniDrawCore(containerRef.current, opts)` 创建 `lib/UniDraw.ts` 的实例
- `useImperativeHandle` 暴露 ref 方法：`getData` / `setData` / `exportPNG` / `undo` ...
- 通过 `useEffect` 同步外部 `value` / `assets` / `templates` / 分页等 props

`lib/UniDraw.ts` 是纯 JS/TS 类实现，不依赖 Vue 运行时，直接用 DOM 构建完整 UI，因此 React wrapper 非常薄。

---


## 5. 构建与配置

### 5.1 Vite 配置（`vite.config.ts`）

```ts
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@uni-draw/shared': resolve(__dirname, 'lib/shared'),
      '@uni-draw/core':   resolve(__dirname, 'lib/core'),
      '@uni-draw/shapes': resolve(__dirname, 'lib/shapes'),
      '@uni-draw/materials': resolve(__dirname, 'lib/materials'),
      '@uni-draw/draw/vue':  resolve(__dirname, 'lib/vue'),
      '@uni-draw/draw/react': resolve(__dirname, 'lib/react'),
      '@uni-draw/draw':      resolve(__dirname, 'lib'),
      '@':                   resolve(__dirname, 'lib'),
    },
  },
  server: { port: 3002 },
})
```

所有业务代码统一使用 `@uni-draw/*` 别名指向 `lib/` 目录，保证 `src/` 和 `examples/` 都能正确解析。

### 5.2 TypeScript 配置（`tsconfig.json`）

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "noEmit": true,
    "strict": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "baseUrl": ".",
    "paths": {
      "@uni-draw/shared": ["./lib/shared/index.ts"],
      "@uni-draw/core":   ["./lib/core/index.ts"],
      "@uni-draw/shapes": ["./lib/shapes/index.ts"],
      "@uni-draw/materials": ["./lib/materials/index.ts"],
      "@uni-draw/draw":    ["./lib/index.ts"],
      "@uni-draw/draw/vue": ["./lib/vue/index.ts"],
      "@uni-draw/draw/react": ["./lib/react/index.ts"],
      "@/*": ["./lib/*"]
    }
  },
  "include": ["lib/**/*", "examples/**/*", "vite.config.ts"],
  "exclude": ["lib/react/**", "examples/react/**"]
}
```

> `exclude` 排除了 React 目录，说明当前主构建流默认面向 Vue。React 示例拥有独立的 `tsconfig.json`。

---

## 6. 开发入口与常用命令

| 命令 | 说明 |
|------|------|
| `pnpm dev` | 启动主开发环境（Vue 编辑器页面，端口 3002） |
| `pnpm dev:vue` | 启动 Vue 示例 |
| `pnpm dev:react` | 启动 React 示例 |
| `pnpm dev:server` | 启动素材/AI 代理服务（端口 3077） |
| `pnpm build` | Vite 生产构建 |
| `pnpm lint` / `pnpm lint:fix` | ESLint 检查与修复 |
| `pnpm format` | Prettier 格式化 |
| `pnpm crawl:assets` | 运行 Python 脚本爬取 SciDraw 素材 |

---

## 7. 扩展指引

### 7.1 新增一种内置图形

以新增一个名为 `custom-badge` 的基础图形为例：

1. **定义常量**：`lib/shared/constants/shapes.ts`
   ```ts
   export const BASIC_SHAPES = {
     // ... existing
     BADGE: 'basic-badge',
   } as const
   ```

2. **实现 X6 节点定义**：`lib/shapes/basic/badge.ts`
   ```ts
   export const basicBadge = {
     shape: 'basic-badge',
     width: 80,
     height: 80,
     markup: [
       { tagName: 'rect', selector: 'body' },
       { tagName: 'text', selector: 'label' },
     ],
     attrs: {
       body: { refWidth: '100%', refHeight: '100%', fill: '#fff', stroke: '#7166F0', rx: 12 },
       label: { refX: '50%', refY: '50%', textAnchor: 'middle', textVerticalAnchor: 'middle', fontSize: 12 },
     },
     ports: DEFAULT_PORTS,
   }
   ```

3. **在分类入口导出**：`lib/shapes/basic/index.ts`
   ```ts
   export { basicBadge } from './badge'
   ```

4. **注册到注册表**：`lib/shapes/register.ts`
   ```ts
   import { basicBadge } from './basic'
   NodeRegistry.register(BASIC_SHAPES.BADGE, basicBadge)
   ```

5. **添加到素材库**（可选）：编辑 `lib/materials/basic.json`，在 `items` 数组中增加：
   ```json
   {
     "id": "basic-badge",
     "name": "徽章",
     "shape": "basic-badge",
     "defaultSize": { "width": 80, "height": 80 }
   }
   ```

6. **同步到 `src/`**：将上述修改同样应用到 `src/` 对应目录，保持两份代码一致。

### 7.2 新增一种边类型

流程与节点类似，在 `lib/shapes/edge/` 下新增定义，然后在 `lib/shapes/register.ts` 中通过 `EdgeRegistry.register()` 注册。

### 7.3 自定义面板/工具栏按钮

如果不想使用 `UniDraw` 一体化组件，可以：

```vue
<template>
  <div class="my-layout">
    <MyCustomPanel />
    <FlexibleDraw v-model="graphData" ref="canvasRef" />
    <MyCustomToolbar />
  </div>
</template>
```

通过 `canvasRef` 暴露的 `useCanvas` 方法直接操作画布。

### 7.4 接入 AI 生成

项目已改为**外部面板 + 运行时配置**模式，不内置 AI UI。

在业务层：

1. 引入 `src/shared/utils/aiService.ts` 中的 `generateGraph(prompt, config, onToken)`
2. 配置 `AIConnectionConfig`：`model` / `apiUrl` / `apiKey`
3. 自行实现 AI 面板 UI（参考 `src/views/AIPanel.vue` 或 `examples/vue/src/views/AIPanel.vue`）
4. 拿到生成结果后调用 `canvasRef.value?.setData(result)` 写入画布

默认 AI 请求会打到本地 `http://127.0.0.1:3077`（`server/index.mjs`），由服务端代理到上游大模型接口。

---

## 8. 关键注意事项

### 8.1 `src/` 与 `lib/` 的同步

当前项目存在两份几乎平行的源码：`src/`（开发源）和 `lib/`（构建源）。

- `lib/` 是 Vite 别名和 tsconfig 的实际指向目录
- `src/` 包含额外的应用级视图和 mock 数据
- **修改核心逻辑时，建议优先在 `src/` 中调试验证，然后同步到 `lib/`**
- 若只改组件库逻辑，可直接改 `lib/`；若涉及 `src/views/` 或 `src/mocks/`，则只需改 `src/`

### 8.2 X6 插件版本

项目使用 `@antv/x6` v2 + 独立插件包：

- `@antv/x6-plugin-history`
- `@antv/x6-plugin-selection`
- `@antv/x6-plugin-transform`

这些插件 API 在 v2 中较稳定，但后续若升级到 v3 需注意 breaking changes。

### 8.3 边的自动顶点（Auto Vertex）

`useCanvas` 中为普通直线边实现了自动中点顶点：

- 当选中一条非 sketch 边时，自动在连线中点插入一个顶点（`ensureAutoVertex`）
- 拖拽顶点偏移后，若不再等于中点，则移除 auto 标记（`refreshAutoVertexState`）
- 节点移动时同步更新关联边的 auto 顶点（`syncAutoVertex`）

此机制让直线边默认呈现“可拖拽折弯”的交互体验。

### 8.4 表格节点（basic-table）

表格不是原生 X6 节点，而是通过自定义 `markup` + `attrs` 模拟：

- `buildTableMarkup(tableData)` 生成 SVG `<rect>` + 多组 `<text>`
- `buildTableAttrs(tableData, style)` 计算每个单元格的 `x/y` 和文本内容
- 行列增删时重新生成 markup 和 attrs，并自动调整节点尺寸

### 8.5 外部文件拖放

`FlexibleDraw.vue` 的 `@drop` 支持：

1. 来自 ShapePanel / AssetsPanel 的 JSON payload（优先）
2. 外部 `.svg` 文件 → 解析 viewBox 尺寸 → `addExternalSvg()`
3. 外部图片文件 → `FileReader.readAsDataURL` → `addExternalImage()`

---

## 9. 附件：核心类/接口速查

### 9.1 `UseCanvasReturn`（来自 `useCanvas`）

```ts
interface UseCanvasReturn {
  containerRef: Ref<HTMLElement | null>
  zoom: Ref<number>
  canUndo: Ref<boolean>; canRedo: Ref<boolean>
  panMode: Ref<boolean>; sketchMode: Ref<boolean>; drawMode: Ref<boolean>
  drawBrushStyle: Ref<DrawBrushStyle>
  selectedNodeData: Ref<NodeData | null>
  selectedEdgeData: Ref<EdgeViewData | null>
  selectionCount: Ref<number>
  sketchElementIds: Ref<Set<string>>
  contextMenuState: Ref<ContextMenuState>

  // 数据
  getData(): GraphData
  setData(data: GraphData): void
  toJSON(): string; fromJSON(json: string): void
  toPNG(): Promise<string>; toSVG(): Promise<string>

  // 视图
  zoomIn(); zoomOut(); zoomTo(factor); zoomToFit()
  togglePanMode(): boolean; toggleSketchMode(): boolean; toggleDrawMode(): boolean

  // 节点/边操作
  addNode(data); addEdge(data); removeNode(id); removeEdge(id)
  createNodeFromMaterial(material, position); createElementFromMaterial(material, position)
  updateNodeStyle(id, style); updateEdgeStyle(id, style); changeEdgeType(id, lineType)
  resizeNode(id, w, h)
  addTableRow(id); addTableColumn(id); deleteTableRow(id); deleteTableColumn(id); updateTableCell(id, row, col, value)
  alignNodes(direction); selectAll(); clearCanvas()

  // 手绘
  addPathNode(x, y, w, h, d); updateDrawBrushStyle(style)

  // 剪贴板
  copy(); cut(); paste(); duplicate()
  deleteSelected(); moveUp(); moveDown(); toFront(); toBack()
  flipH(); flipV(); toggleLock(); createFrame()
  copyAsPng(); copyAsSvg()

  // 外部资源
  addExternalImage(url, pos, w, h); addExternalSvg(content, pos, w, h)
  screenToCanvas(clientX, clientY): { x, y }

  // SVG 编辑器
  svgEditState: Ref<{ nodeId: string; content: string } | null>
  commitSvgEdit(newContent); closeSvgEditor()
}
```

### 9.2 `UniDrawProps`（一体化编辑器）

```ts
interface UniDrawProps {
  modelValue?: GraphData
  assets?: AssetItem[]
  templates?: TemplateItem[]
  assetPage?: number; assetTotalPages?: number; assetPageLoading?: boolean
  canPrevAssets?: boolean; canNextAssets?: boolean
  grid?: boolean; snapline?: boolean; readonly?: boolean
  showShapePanel?: boolean; showAssetsPanel?: boolean
  showTemplates?: boolean; showToolbar?: boolean; showMinimap?: boolean
  locale?: UniDrawLocale; theme?: UniDrawTheme
}
```

### 9.3 `UniDrawRef`（Vue ref / React ref 暴露方法）

```ts
interface UniDrawRef {
  openTemplatePanel(): void
  getData(): GraphData
  setData(data: GraphData): void
  clear(): void
  exportPNG(): Promise<string>
  exportJSON(): string
  exportSVG(): Promise<string>
  undo(): void; redo(): void
  zoomIn(): void; zoomOut(): void; zoomFit(): void
  selectAll(): void; deleteSelection(): void
}
```

---

## 10. 总结

| 如果你想… | 应该关注… |
|-----------|-----------|
| 快速集成完整编辑器 | `lib/index.ts` 导出的 `UniDraw`，或 `lib/UniDraw.ts` 的类 API |
| 自定义布局/二次开发 | `FlexibleDraw` + `useCanvas` + 各子组件 |
| 新增图形 | `shapes/` 目录 + `register.ts` + `materials/*.json` |
| 修改画布核心交互 | `core/engine/AntVRenderEngine.ts` + `composables/useCanvas.ts` |
| 修改数据序列化格式 | `core/node/NodeFactory.ts` + `core/edge/EdgeFactory.ts` |
| 接入 AI | `shared/utils/aiService.ts` + 自行实现外部面板 |
| 跑服务端 | `server/index.mjs`（素材 API + AI 代理） |

---

*文档版本：基于 `uni-flexible-draw` 当前代码库生成*
