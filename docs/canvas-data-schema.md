# Uni Flexible Draw 画布数据 JSON 规范

> 本文档描述 `uni-flexible-draw` 画布组件能够正确解析和渲染的 JSON 数据结构。所有字段、枚举值、图形类型及图形特有属性均基于源码中的类型定义（`src/shared/types/*.ts`）与图形注册配置（`src/shapes/**/*.ts`）整理。

---

## 1. 数据根结构

```json
{
  "canvas": { /* CanvasConfig */ },
  "nodes": [ /* NodeData[] */ ],
  "edges": [ /* EdgeData[] */ ],
  "meta": { /* GraphMeta（可选） */ }
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `canvas` | `CanvasConfig` | 是 | 画布级配置：背景、网格、缩放、偏移 |
| `nodes` | `NodeData[]` | 是 | 节点列表 |
| `edges` | `EdgeData[]` | 是 | 边（连接线）列表 |
| `meta` | `GraphMeta` | 否 | 元数据：标题、类型、创建时间等 |

---

## 2. 画布配置 CanvasConfig

```json
{
  "backgroundColor": "#ffffff",
  "grid": {
    "size": 10,
    "visible": true,
    "type": "dot",
    "color": "#e5e5e5"
  },
  "zoom": 1,
  "offset": { "x": 0, "y": 0 }
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `backgroundColor` | `string` | 否 | 画布背景色，例如 `#ffffff` |
| `grid.size` | `number` | 否 | 网格间距，默认 `10` |
| `grid.visible` | `boolean` | 否 | 是否显示网格，默认 `true` |
| `grid.type` | `"dot" \| "line"` | 否 | 网格类型，默认 `"dot"` |
| `grid.color` | `string` | 否 | 网格颜色 |
| `zoom` | `number` | 否 | 初始缩放比例，默认 `1` |
| `offset` | `{ x, y }` | 否 | 初始平移偏移量 |

---

## 3. 元数据 GraphMeta

```json
{
  "title": "示例流程图",
  "type": "flowchart",
  "createdAt": "2026-06-16T00:00:00.000Z",
  "version": "1.0.0",
  "aiGenerated": false,
  "ext": {}
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `title` | `string` | 否 | 图表标题 |
| `type` | `"flowchart" \| "uml" \| "sequence" \| "er" \| "dfd" \| "custom"` | 否 | 图表类型 |
| `createdAt` | `string` | 否 | 创建时间（ISO 8601） |
| `version` | `string` | 否 | 数据版本 |
| `aiGenerated` | `boolean` | 否 | 是否由 AI 生成 |
| `ext` | `Record<string, unknown>` | 否 | 扩展字段 |

---

## 4. 节点 NodeData

```json
{
  "id": "node-1",
  "shape": "basic-rect",
  "position": { "x": 100, "y": 200 },
  "size": { "width": 120, "height": 60 },
  "angle": 0,
  "zIndex": 1,
  "label": "节点文本",
  "style": { /* NodeStyle */ },
  "data": { /* 图形特有数据 */ },
  "ports": { /* PortsConfig */ },
  "parent": "group-1",
  "children": ["child-1"],
  "locked": false
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `id` | `string` | 是 | 全局唯一节点 ID |
| `shape` | `string` | 是 | 图形类型标识，见第 7 节图形清单 |
| `position` | `{ x, y }` | 是 | 节点左上角坐标 |
| `size` | `{ width, height }` | 是 | 节点尺寸 |
| `angle` | `number` | 否 | 旋转角度（度），默认 `0` |
| `zIndex` | `number` | 否 | 层级顺序 |
| `label` | `string \| LabelConfig` | 否 | 节点标签文本或详细配置 |
| `style` | `NodeStyle` | 否 | 通用样式，见本节 4.2 |
| `data` | `Record<string, unknown>` | 否 | 图形特有业务数据，见第 8 节 |
| `ports` | `PortsConfig` | 否 | 连接桩配置，未指定时使用图形默认连接桩 |
| `parent` | `string` | 否 | 所属父 Group 节点 ID |
| `children` | `string[]` | 否 | 子节点 ID 列表 |
| `locked` | `boolean` | 否 | 是否锁定，默认 `false` |

### 4.1 标签 LabelConfig

```json
{
  "text": "标签文本",
  "position": "center",
  "style": {
    "fill": "#333333",
    "fontSize": 14,
    "fontFamily": "system-ui",
    "fontWeight": "normal"
  }
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `text` | `string` | 是 | 标签内容 |
| `position` | `"top" \| "bottom" \| "left" \| "right" \| "center"` | 否 | 相对节点位置，默认 `"center"` |
| `style.fill` | `string` | 否 | 文字颜色 |
| `style.fontSize` | `number` | 否 | 字号 |
| `style.fontFamily` | `string` | 否 | 字体 |
| `style.fontWeight` | `"normal" \| "bold"` | 否 | 字重 |

### 4.2 节点样式 NodeStyle

```json
{
  "fill": "#ffffff",
  "stroke": "#7166F0",
  "strokeWidth": 2,
  "strokeDasharray": "6 4",
  "rx": 8,
  "ry": 8,
  "opacity": 1,
  "shadow": {
    "color": "rgba(0,0,0,0.2)",
    "blur": 4,
    "offsetX": 2,
    "offsetY": 2
  }
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `fill` | `string` | 否 | 填充色 |
| `stroke` | `string` | 否 | 描边/边框色 |
| `strokeWidth` | `number` | 否 | 描边宽度 |
| `strokeDasharray` | `string` | 否 | 虚线样式，如 `"6 4"` |
| `rx` | `number` | 否 | 水平圆角半径（仅部分图形有效，见第 9 节） |
| `ry` | `number` | 否 | 垂直圆角半径 |
| `opacity` | `number` | 否 | 透明度 `0~1` |
| `shadow` | `object` | 否 | 阴影配置 |

> 注意：`style` 最终会被合并到节点 `attrs.body` 中。对于 `basic-cylinder`，`fill/stroke/strokeWidth` 会同步应用到 `bodyFill/topCap/bottomCap/leftLine/rightLine`。

### 4.3 连接桩 PortsConfig

```json
{
  "groups": {
    "top": { "position": "top", "attrs": { /* ... */ } },
    "bottom": { "position": "bottom" },
    "left": { "position": "left" },
    "right": { "position": "right" }
  },
  "items": [
    { "id": "top", "group": "top" },
    { "id": "bottom", "group": "bottom" },
    { "id": "left", "group": "left" },
    { "id": "right", "group": "right" }
  ]
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `groups` | `Record<string, PortGroup>` | 否 | 连接桩分组定义 |
| `items` | `PortItem[]` | 否 | 具体连接桩实例 |

连接桩 `position` 可取值：`"top"`、`"bottom"`、`"left"`、`"right"`、`"center"`，或 X6 支持的函数/绝对坐标对象。若 `ports` 未提供，组件会自动使用对应 `shape` 的默认连接桩。

---

## 5. 边 EdgeData

```json
{
  "id": "edge-1",
  "shape": "edge",
  "source": "node-1",
  "target": "node-2",
  "label": "是",
  "style": { /* EdgeStyle */ },
  "data": { /* 业务数据 */ },
  "vertices": [{ "x": 200, "y": 300 }],
  "router": { "name": "orth", "args": { "padding": 20 } },
  "connector": { "name": "rounded", "args": { "radius": 8 } }
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `id` | `string` | 是 | 全局唯一边 ID |
| `shape` | `"edge" \| "edge-sketch"` | 是 | 边类型 |
| `source` | `string \| { cell, port? } \| { x, y }` | 是 | 源节点 ID、源端口或绝对坐标 |
| `target` | `string \| { cell, port? } \| { x, y }` | 是 | 目标节点 ID、目标端口或绝对坐标 |
| `label` | `string \| LabelConfig` | 否 | 边标签 |
| `style` | `EdgeStyle` | 否 | 边样式，见第 6 节 |
| `data` | `Record<string, unknown>` | 否 | 业务数据；可存放 `lineType`、`routerName`、`connectorName` 等兼容字段 |
| `vertices` | `{ x, y }[]` | 否 | 折线顶点 |
| `router` | `string \| RouterConfig \| null` | 否 | 路由算法 |
| `connector` | `string \| ConnectorConfig \| null` | 否 | 连接器样式 |

### 5.1 source / target 格式

```json
// 直接连接节点
"source": "node-1",
"target": "node-2"

// 连接到指定端口
"source": { "cell": "node-1", "port": "right" },
"target": { "cell": "node-2", "port": "left" }

// 自由连接到画布坐标
"source": { "x": 100, "y": 200 },
"target": { "x": 300, "y": 200 }
```

---

## 6. 边样式 EdgeStyle

```json
{
  "stroke": "#7166F0",
  "strokeWidth": 2,
  "strokeDasharray": "6 4",
  "strokeLinecap": "round",
  "strokeLinejoin": "round",
  "sourceMarker": { "name": "none" },
  "targetMarker": { "name": "classic", "size": 10, "fill": "#7166F0" }
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `stroke` | `string` | 否 | 线条颜色 |
| `strokeWidth` | `number` | 否 | 线条宽度 |
| `strokeDasharray` | `string` | 否 | 虚线样式 |
| `strokeLinecap` | `"butt" \| "round" \| "square"` | 否 | 线帽样式 |
| `strokeLinejoin` | `"miter" \| "round" \| "bevel"` | 否 | 线连接样式 |
| `sourceMarker` | `MarkerConfig \| null` | 否 | 源端箭头 |
| `targetMarker` | `MarkerConfig \| null` | 否 | 目标端箭头 |

### 6.1 MarkerConfig

```json
{
  "name": "classic",
  "size": 10,
  "fill": "#7166F0",
  "stroke": "#7166F0",
  "strokeWidth": 1,
  "d": "M 0 0 L 10 5 L 0 10 Z"
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `name` | `MarkerName \| "none"` | 是 | 箭头类型 |
| `size` | `number` | 否 | 大小 |
| `fill` | `string` | 否 | 填充色 |
| `stroke` | `string` | 否 | 描边色 |
| `strokeWidth` | `number` | 否 | 描边宽度 |
| `d` | `string` | 否 | `name="path"` 时的自定义 SVG path |

支持的 `MarkerName`：`block`、`classic`、`diamond`、`cross`、`circle`、`circlePlus`、`ellipse`、`async`、`path`。

### 6.2 Router 与 Connector

Router 名称：`normal`、`orth`、`manhattan`、`er`、`metro`、`oneSide`。

Connector 名称：`normal`、`rounded`、`smooth`、`jumpover`、`quadratic`、`wobble`。

```json
"router": { "name": "manhattan", "args": { "padding": 20 } }
"connector": { "name": "rounded", "args": { "radius": 8 } }
```

> 向后兼容：在 `data` 中提供 `lineType`（`straight` / `curve` / `rounded` / `orthogonal` / `manhattan` / `jumpover`）会被自动转换为对应的 `router` + `connector`。当 `shape` 为 `edge-sketch` 时，组件会使用 RoughJS 手绘连接器。

---

## 7. 图形类型清单

### 7.1 基础图形 basic

| shape 名称 | 默认尺寸 | 几何类型 | 说明 |
|------------|----------|----------|------|
| `basic-rect` | 100×60 | rect | 矩形 |
| `basic-rounded-rect` | 100×60 | rect | 圆角矩形 |
| `basic-circle` | 60×60 | ellipse | 圆形 |
| `basic-diamond` | 80×60 | polygon | 菱形 |
| `basic-triangle` | 80×70 | polygon | 三角形 |
| `basic-parallelogram` | 100×60 | polygon | 平行四边形 |
| `basic-trapezoid` | 100×60 | polygon | 梯形 |
| `basic-hexagon` | 80×70 | polygon | 六边形 |
| `basic-pentagon` | 80×70 | polygon | 五边形 |
| `basic-octagon` | 80×70 | polygon | 八边形 |
| `basic-star` | 80×70 | polygon | 五角星 |
| `basic-cross` | 70×70 | polygon | 十字 |
| `basic-cylinder` | 100×70 | rect + ellipse | 圆柱体 |
| `basic-cloud` | 120×70 | path | 云 |
| `basic-document` | 100×70 | path | 文档 |
| `basic-table` | 240×120 | rect + path + text | 表格 |
| `basic-text` | 120×36 | rect + text | 纯文本 |
| `basic-image` | 80×80 | image | 图片 |
| `basic-svg` | 200×200 | image | SVG |
| `basic-group` | 160×120 | rect | 组合/分组容器 |

### 7.2 流程图 flowchart

| shape 名称 | 默认尺寸 | 几何类型 | 说明 |
|------------|----------|----------|------|
| `flowchart-start-end` | 100×50 | rect | 开始/结束 |
| `flowchart-process` | 100×60 | rect | 处理 |
| `flowchart-decision` | 80×60 | polygon | 判断 |
| `flowchart-input-output` | 100×60 | polygon | 输入/输出 |
| `flowchart-document` | 100×70 | path | 文档 |
| `flowchart-predefined` | 100×60 | rect | 预定义处理 |
| `flowchart-internal-storage` | 100×60 | rect | 内部存储 |
| `flowchart-database` | 100×70 | rect + ellipse | 数据库 |
| `flowchart-connector` | 20×20 | circle | 连接符 |
| `flowchart-merge` | 60×60 | polygon | 合并 |

### 7.3 UML 类图 uml

| shape 名称 | 默认尺寸 | 说明 |
|------------|----------|------|
| `uml-class` | 140×90 | 类（三栏） |
| `uml-interface` | 160×100 | 接口 |
| `uml-abstract` | 160×120 | 抽象类 |
| `uml-enum` | 160×100 | 枚举 |
| `uml-package` | 180×100 | 包 |
| `uml-note` | 140×80 | 注释 |
| `uml-actor` | 40×80 | 参与者 |
| `uml-use-case` | 140×60 | 用例 |
| `uml-component` | 140×60 | 组件 |
| `uml-deployment` | 140×80 | 部署节点（3D 立方体） |
| `uml-object` | 140×60 | 对象 |
| `uml-collaboration` | 140×70 | 协作 |
| `uml-composite` | 140×80 | 组合结构 |
| `uml-node` | 140×80 | 节点 |
| `uml-artifact` | 120×60 | 制品 |
| `uml-state` | 120×50 | UML 状态 |
| `uml-initial` | 30×30 | 初始状态 |
| `uml-final` | 30×30 | 终止状态 |

### 7.4 时序图 sequence

| shape 名称 | 默认尺寸 | 说明 |
|------------|----------|------|
| `sequence-actor` | 60×90 | 参与者 |
| `sequence-lifeline` | 120×200 | 生命线 |
| `sequence-activation` | 16×60 | 激活条 |
| `sequence-fragment-alt` | 300×200 | alt 片段 |
| `sequence-fragment-opt` | 300×150 | opt 片段 |
| `sequence-fragment-loop` | 300×150 | loop 片段 |
| `sequence-fragment-par` | 300×200 | par 片段 |
| `sequence-fragment-critical` | 300×150 | critical 片段 |
| `sequence-gateway` | 40×40 | 网关 |

### 7.5 实体关系图 er

| shape 名称 | 默认尺寸 | 说明 |
|------------|----------|------|
| `er-entity` | 120×50 | 实体 |
| `er-weak-entity` | 120×50 | 弱实体 |
| `er-relationship` | 80×60 | 关系 |
| `er-identifying-relationship` | 80×60 | 标识关系 |
| `er-attribute` | 80×40 | 属性 |
| `er-key-attribute` | 80×40 | 主键属性 |
| `er-multivalued` | 80×40 | 多值属性 |
| `er-derived` | 80×40 | 派生属性 |
| `er-associative` | 100×50 | 关联实体 |
| `er-total-participation` | 80×60 | 完全参与 |

### 7.6 数据流图 dfd

| shape 名称 | 默认尺寸 | 说明 |
|------------|----------|------|
| `dfd-process` | 80×80 | 处理（圆） |
| `dfd-data-store` | 120×40 | 数据存储 |
| `dfd-external-entity` | 120×50 | 外部实体 |
| `dfd-data-flow` | 100×1 | 数据流占位 |
| `dfd-multiple-process` | 80×80 | 多重处理 |

### 7.7 泳道图 swimlane

| shape 名称 | 默认尺寸 | 说明 |
|------------|----------|------|
| `swimlane-horizontal` | 300×80 | 水平泳道 |
| `swimlane-vertical` | 120×300 | 垂直泳道 |
| `swimlane-pool` | 400×300 | 泳池 |
| `swimlane-phase` | 400×40 | 阶段 |

### 7.8 状态图 state

| shape 名称 | 默认尺寸 | 说明 |
|------------|----------|------|
| `state-simple` | 140×70 | 简单状态 |
| `state-composite` | 200×120 | 复合状态 |
| `state-submachine` | 160×70 | 子状态机 |
| `state-initial` | 40×40 | 初始状态 |
| `state-final` | 40×40 | 终止状态 |
| `state-shallow-history` | 50×50 | 浅历史 |
| `state-deep-history` | 50×50 | 深历史 |
| `state-junction` | 40×40 | 连接点 |
| `state-choice` | 50×50 | 选择点 |
| `state-fork` | 120×60 | 分叉 |
| `state-join` | 120×60 | 汇合 |
| `state-entry-point` | 140×70 | 入口点 |
| `state-exit-point` | 140×70 | 出口点 |
| `state-terminate` | 40×40 | 终止伪状态 |
| `state-signal-send` | 160×70 | 发送信号 |
| `state-signal-receive` | 160×70 | 接收信号 |

### 7.9 边 edge

| shape 名称 | 说明 |
|------------|------|
| `edge` | 基础边（X6 内置） |
| `edge-sketch` | 草图边（RoughJS 手绘风格） |

---

## 8. 图形特有属性 data

### 8.1 表格 basic-table

`data.table` 定义表格结构：

```json
{
  "id": "t1",
  "shape": "basic-table",
  "position": { "x": 100, "y": 100 },
  "size": { "width": 240, "height": 120 },
  "data": {
    "table": {
      "rows": 3,
      "cols": 3,
      "cells": [
        ["列1", "列2", "列3"],
        ["", "", ""],
        ["", "", ""]
      ]
    }
  }
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `table.rows` | `number` | 是 | 行数，至少 1 |
| `table.cols` | `number` | 是 | 列数，至少 1 |
| `table.cells` | `string[][]` | 否 | 单元格文本，缺失时自动填充空字符串 |

### 8.2 图片 basic-image / SVG basic-svg

```json
{
  "id": "img1",
  "shape": "basic-image",
  "position": { "x": 100, "y": 100 },
  "size": { "width": 120, "height": 120 },
  "data": {
    "imageHref": "https://example.com/a.png",
    "imageFit": "contain"
  }
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `imageHref` | `string` | 是 | 图片/SVG 地址或 Data URL |
| `imageFit` | `"contain" \| "cover" \| "fill"` | 否 | 填充模式，默认 `contain` |

### 8.3 纯文本 basic-text

```json
{
  "id": "txt1",
  "shape": "basic-text",
  "position": { "x": 100, "y": 100 },
  "size": { "width": 120, "height": 36 },
  "label": "居中文本",
  "data": {
    "textAlign": "center"
  }
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `textAlign` | `"left" \| "center" \| "right"` | 否 | 文本水平对齐，默认 `center` |

### 8.4 组合 basic-group

`basic-group` 的样式通过 `style` 设置，渲染为虚线边框容器：

```json
{
  "id": "g1",
  "shape": "basic-group",
  "position": { "x": 50, "y": 50 },
  "size": { "width": 300, "height": 200 },
  "style": {
    "fill": "rgba(0,0,0,0.02)",
    "stroke": "#d9d9d9",
    "strokeWidth": 1,
    "strokeDasharray": "4 4"
  }
}
```

### 8.5 圆柱体 basic-cylinder

圆柱体没有独立的 `data` 字段，通过 `style` 控制整体外观：

```json
{
  "id": "cyl1",
  "shape": "basic-cylinder",
  "size": { "width": 100, "height": 70 },
  "style": {
    "fill": "#f0f5ff",
    "stroke": "#7166F0",
    "strokeWidth": 2
  }
}
```

### 8.6 多区域节点 regionData

以下图形支持通过 `data.regionData` 动态渲染内部区域：

- `uml-class`
- `uml-abstract`
- `uml-interface`
- `uml-enum`
- `sequence-fragment-alt`
- `sequence-fragment-par`
- `swimlane-horizontal`
- `swimlane-vertical`
- `swimlane-pool`

```json
{
  "id": "class1",
  "shape": "uml-class",
  "position": { "x": 100, "y": 100 },
  "size": { "width": 180, "height": 120 },
  "data": {
    "regionData": {
      "regions": [
        { "id": "name", "label": "Order" },
        { "id": "attributes", "label": "id: UUID\ncreatedAt: Date" },
        { "id": "methods", "label": "pay()\ncancel()" }
      ],
      "dividers": [
        { "id": "divider1", "position": 0.3 },
        { "id": "divider2", "position": 0.62 }
      ]
    }
  }
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `regions` | `{ id, label }[]` | 是 | 区域列表 |
| `dividers` | `{ id, position }[]` | 是 | 分隔线位置（`0~1` 的相对位置） |

> 若未提供 `regionData`，组件会根据 `shape` 自动填充默认值。

---

## 9. 圆角 rx 支持说明

`style.rx` 与 `style.ry` 仅在 body 为 `<rect>` 的图形上生效。支持圆角的图形包括：

- 基础：`basic-rect`、`basic-rounded-rect`、`basic-cloud`、`basic-document`
- 流程图：`flowchart-start-end`、`flowchart-process`、`flowchart-document`、`flowchart-database`、`flowchart-predefined`、`flowchart-internal-storage`
- UML：`uml-class`、`uml-interface`、`uml-abstract`、`uml-enum`、`uml-package`、`uml-object`、`uml-component`
- 时序图：`sequence-activation`、`sequence-fragment-alt`、`sequence-fragment-opt`、`sequence-fragment-loop`、`sequence-fragment-par`、`sequence-fragment-critical`
- ER：`er-entity`、`er-weak-entity`、`er-associative`
- 数据流图：`dfd-external-entity`
- 泳道图：`swimlane-horizontal`、`swimlane-vertical`、`swimlane-pool`、`swimlane-phase`
- 状态图：`state-simple`、`state-composite`、`state-fork`、`state-join`

以下图形不支持圆角：所有 polygon 图形、ellipse/circle 图形、Actor、Deployment、Node、Artifact 等特殊 markup 图形。

---

## 10. 完整示例

### 10.1 简单流程图

```json
{
  "canvas": {
    "backgroundColor": "#ffffff",
    "grid": { "size": 10, "visible": true, "type": "dot" },
    "zoom": 1
  },
  "meta": { "title": "登录流程", "type": "flowchart" },
  "nodes": [
    {
      "id": "n1",
      "shape": "flowchart-start-end",
      "position": { "x": 260, "y": 40 },
      "size": { "width": 120, "height": 44 },
      "label": "开始",
      "style": { "fill": "#e6f7ff", "stroke": "#1890ff" }
    },
    {
      "id": "n2",
      "shape": "flowchart-process",
      "position": { "x": 260, "y": 130 },
      "size": { "width": 120, "height": 56 },
      "label": "输入账号密码",
      "style": { "fill": "#ffffff", "stroke": "#1890ff" }
    },
    {
      "id": "n3",
      "shape": "flowchart-decision",
      "position": { "x": 240, "y": 240 },
      "size": { "width": 160, "height": 76 },
      "label": "验证通过？",
      "style": { "fill": "#fffbe6", "stroke": "#faad14" }
    }
  ],
  "edges": [
    { "id": "e1", "shape": "edge", "source": "n1", "target": "n2" },
    {
      "id": "e2",
      "shape": "edge",
      "source": "n2",
      "target": "n3",
      "style": {
        "stroke": "#333333",
        "strokeWidth": 2,
        "targetMarker": { "name": "classic", "size": 8 }
      }
    }
  ]
}
```

### 10.2 含表格与图片的混合图

```json
{
  "canvas": { "backgroundColor": "#ffffff", "grid": { "size": 10, "visible": true, "type": "dot" }, "zoom": 1 },
  "nodes": [
    {
      "id": "table1",
      "shape": "basic-table",
      "position": { "x": 50, "y": 50 },
      "size": { "width": 240, "height": 120 },
      "data": {
        "table": {
          "rows": 2,
          "cols": 2,
          "cells": [["Name", "Age"], ["Alice", "30"]]
        }
      }
    },
    {
      "id": "img1",
      "shape": "basic-image",
      "position": { "x": 320, "y": 50 },
      "size": { "width": 120, "height": 120 },
      "data": { "imageHref": "data:image/svg+xml,...", "imageFit": "contain" }
    }
  ],
  "edges": []
}
```

### 10.3 UML 类图

```json
{
  "canvas": { "backgroundColor": "#ffffff", "grid": { "size": 10, "visible": true, "type": "dot" }, "zoom": 1 },
  "nodes": [
    {
      "id": "order",
      "shape": "uml-class",
      "position": { "x": 100, "y": 100 },
      "size": { "width": 180, "height": 130 },
      "data": {
        "regionData": {
          "regions": [
            { "id": "name", "label": "Order" },
            { "id": "attributes", "label": "- id: UUID\n- total: Decimal" },
            { "id": "methods", "label": "+ pay()\n+ cancel()" }
          ],
          "dividers": [
            { "id": "divider1", "position": 0.25 },
            { "id": "divider2", "position": 0.55 }
          ]
        }
      }
    }
  ],
  "edges": []
}
```

---

## 11. 校验与注意事项

1. **ID 唯一性**：所有 `NodeData.id` 与 `EdgeData.id` 必须在整个 JSON 中全局唯一。
2. **shape 有效性**：`shape` 必须是已注册的图形名称之一，否则画布无法渲染。
3. **source / target 引用**：边引用的节点 ID 必须存在于 `nodes` 中；引用的 `port` 必须存在于目标节点的 `ports.items` 中。
4. **parent / children 一致性**：`parent` 指向的节点必须真实存在，且不能形成循环依赖。
5. **表格 cells 维度**：`basic-table` 的 `cells` 行/列数应与 `rows`/`cols` 一致；不一致时组件会按最小维度补空字符串。
6. **图片地址**：`basic-image` / `basic-svg` 的 `imageHref` 需要是浏览器可解析的 URL 或 Data URL。
7. **边草图模式**：`shape` 为 `edge-sketch` 时，组件会自动覆盖 `connector` 为 RoughJS 手绘连接器，此时 `router`/`connector` 字段的自定义值会被忽略。
