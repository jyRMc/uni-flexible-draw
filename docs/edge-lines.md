# Uni Flexible Draw 连接线配置文档

> 本文档基于 `@uniresearch-web/packages/uni-flexible-draw/lib` 源码整理，覆盖所有可用的连接线类型、组合维度及画布配置示例。

---

## 1. 连接线设计概述

`uni-flexible-draw` 的连接线由 **4 个正交维度**组合而成：

| 维度 | 作用 | 配置项 |
|------|------|--------|
| **Router（路由）** | 决定边的路径如何绕行 | `router` |
| **Connector（连接器）** | 决定路径如何绘制 | `connector` |
| **Marker（箭头）** | 决定起点/终点端点样式 | `style.sourceMarker` / `style.targetMarker` |
| **Style（样式）** | 颜色、宽度、线型等视觉属性 | `style` |

每个维度独立配置，可自由组合。同时组件内置了 9 种常用“预设线条”，方便直接拖拽使用。

---

## 2. 内置预设线条

`lib/materials/edge.json` 中注册了 9 种常用连接线：

| 线条 ID | 名称 | 说明 | 默认 Router | 默认 Connector | 默认箭头 | 默认线型 |
|---------|------|------|-------------|----------------|----------|----------|
| `edge` | 连接线 | 最基础的直线连接 | `normal` | `normal` | 无 | 实线 |
| `edge-arrow` | 箭头线 | 带方向箭头的直线 | `normal` | `normal` | 终点 `classic` | 实线 |
| `edge-double-arrow` | 双箭头线 | 两端均带箭头 | `normal` | `normal` | 起点/终点 `classic` | 实线 |
| `edge-dashed` | 虚线 | 用于表示弱化/备选关系 | `normal` | `normal` | 无 | `dashed` |
| `edge-curve` | 曲线 | 平滑曲线，适合简洁布局 | `normal` | `smooth` | 无 | 实线 |
| `edge-orthogonal` | 折线 | 正交折线，适合流程图 | `orth` | `normal` | 无 | 实线 |
| `edge-rounded` | 圆角折线 | 正交圆角折线 | `orth` | `rounded` | 无 | 实线 |
| `edge-metro` | 地铁路线 | 类似地铁线路图效果 | `metro` | `rounded` | 无 | 实线 |
| `edge-sketch` | 草图线 | RoughJS 手绘风格 | — | `uni-draw-sketch-straight` | 无 | 实线 |

> 说明：`edge-sketch` 为独立 `shape`，使用 RoughJS 连接器，会忽略 `router` / `connector` 自定义值。

---

## 3. 可配置项详解

### 3.1 边类型 `shape`

```json
{
  "shape": "edge"
}
```

| 取值 | 说明 |
|------|------|
| `edge` | 基础边，支持 router / connector / marker / style 全量组合 |
| `edge-sketch` | 草图边，RoughJS 手绘风格，自动覆盖 connector |

### 3.2 标签 `label`

支持字符串或对象配置：

```json
// 字符串形式
"label": "是"

// 对象形式（可控制位置、样式）
"label": {
  "text": "验证通过",
  "position": "center",
  "style": {
    "fill": "#333333",
    "fontSize": 12,
    "fontFamily": "system-ui",
    "fontWeight": "normal"
  }
}
```

| 字段 | 类型 | 说明 |
|------|------|------|
| `text` | `string` | 标签内容 |
| `position` | `string` | 相对边位置：`center` / `top` / `bottom` / `near-source` / `near-target` |
| `style.fill` | `string` | 字体颜色 |
| `style.fontSize` | `number` | 字号 |
| `style.fontFamily` | `string` | 字体 |
| `style.fontWeight` | `string` | 字重：`normal` / `bold` |

### 3.3 路由 Router

控制边的路径如何绕行。配置位置：`router`。

```json
"router": { "name": "orth", "args": { "padding": 20 } }
```

| Router 名称 | 中文名 | 说明 | 适用场景 |
|-------------|--------|------|----------|
| `normal` | 默认路由 | 两点之间直接连接，不绕行 | 通用连线、箭头线 |
| `orth` | 正交路由 | 仅允许水平/垂直方向走线 | 流程图、折线 |
| `manhattan` | 曼哈顿路由 | 类似 Manhattan 路径规划，自动避让 | 复杂布局、网络拓扑 |
| `er` | ER 关系路由 | 专为实体关系图设计 | ER 图、数据库关系 |
| `metro` | 地铁路由 | 类似地铁线路图的圆润折线 | 架构图、路线图 |
| `oneSide` | 单侧路由 | 从同一侧出发/到达 | 泳道图、层级结构 |

**常用 args 参数：**

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `padding` | `number` | `20` | 路由与节点边界的间距 |
| `offset` | `number` | `32` | ER 路由偏移量 |
| `direction` | `string` | `H` | ER 路由方向：`H` 水平 / `V` 垂直 |
| `side` | `string` | `bottom` | oneSide 路由的参考边 |

### 3.4 连接器 Connector

控制路径如何绘制。配置位置：`connector`。

```json
"connector": { "name": "rounded", "args": { "radius": 8 } }
```

| Connector 名称 | 中文名 | 说明 | 适用场景 |
|----------------|--------|------|----------|
| `normal` | 直线连接器 | 顶点间直线连接 | 通用连线 |
| `rounded` | 圆角连接器 | 折线拐角处圆角 | 流程图、折线 |
| `smooth` | 平滑曲线 | 使用平滑曲线连接 | 曲线、UML 关系 |
| `jumpover` | 跳线连接器 | 交叉处显示跳线弧 | 复杂正交图 |
| `quadratic` | 二次贝塞尔 | 二次贝塞尔曲线 | 柔和曲线 |
| `wobble` | 随机摇摆线 | 手绘风格摇摆线 | 草图、脑图 |

**常用 args 参数：**

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `radius` | `number` | `8` | 圆角半径（rounded） |
| `type` | `string` | `arc` | jumpover 弧线类型 |
| `size` | `number` | `10` | jumpover 跳线大小 |
| `spread` | `number` | `8` | wobble 摇摆幅度 |

### 3.5 箭头 Marker

配置起点/终点端点样式。配置位置：`style.sourceMarker` / `style.targetMarker`。

```json
"style": {
  "sourceMarker": { "name": "circle", "size": 8, "fill": "#1890ff" },
  "targetMarker": { "name": "classic", "size": 10, "fill": "#1890ff" }
}
```

| Marker 名称 | 中文名 | 说明 | 适用场景 |
|-------------|--------|------|----------|
| `none` | 无 | 不显示端点标记 | 普通连线 |
| `classic` | 经典箭头 | 空心箭头 | 方向指示 |
| `block` | 实心三角 | 实心三角形 | 强指向、依赖关系 |
| `diamond` | 菱形 | 菱形标记 | UML 聚合/组合 |
| `circle` | 圆点 | 实心圆点 | 关联关系 |
| `circlePlus` | 圆加 | 圆圈内加号 | 特殊关联 |
| `ellipse` | 椭圆 | 椭圆标记 | 装饰性端点 |
| `cross` | 十字 | 十字标记 | 阻断/取消 |
| `async` | 异步箭头 | 开放箭头 | 异步消息 |
| `path` | 自定义路径 | 使用 SVG path 自定义 | 自定义图标 |

**MarkerConfig 字段：**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `name` | `MarkerName \| "none"` | 是 | 箭头类型 |
| `size` | `number` | 否 | 大小 |
| `fill` | `string` | 否 | 填充色 |
| `stroke` | `string` | 否 | 描边色 |
| `strokeWidth` | `number` | 否 | 描边宽度 |
| `d` | `string` | 否 | `name="path"` 时的 SVG path d 属性 |

### 3.6 颜色与宽度

```json
"style": {
  "stroke": "#7166F0",
  "strokeWidth": 2
}
```

| 字段 | 类型 | 说明 |
|------|------|------|
| `stroke` | `string` | 线条颜色，支持 `#RRGGBB` / `rgb()` / `rgba()` 等 |
| `strokeWidth` | `number` | 线条宽度，单位 px |
| `strokeLinecap` | `"butt" \| "round" \| "square"` | 线帽样式 |
| `strokeLinejoin` | `"miter" \| "round" \| "bevel"` | 线连接样式 |

> 默认线条颜色取自主题主色 `PRIMARY_COLOR`（`#7166F0`），默认宽度为 `2px`。

### 3.7 线型 Stroke Style

```json
"style": {
  "strokeDasharray": "6 4"
}
```

| 线型名称 | dasharray 值 | 说明 |
|----------|--------------|------|
| `solid` | `''` | 实线 |
| `dashed` | `'6 4'` | 虚线 |
| `dotted` | `'2 4'` | 点线 |
| `dashdot` | `'8 3 2 3'` | 点划线 |

> 向后兼容：也可在 `data.strokeStyle` 中使用 `'solid' / 'dashed' / 'dotted' / 'dashdot'` 字符串。

---

## 4. 起点与终点配置

边的 `source` 和 `target` 支持三种格式：

### 4.1 直接连接节点

```json
{
  "source": "node-a",
  "target": "node-b"
}
```

### 4.2 连接到指定端口

```json
{
  "source": { "cell": "node-a", "port": "right" },
  "target": { "cell": "node-b", "port": "left" }
}
```

### 4.3 自由连接到画布坐标

```json
{
  "source": { "x": 100, "y": 200 },
  "target": { "x": 300, "y": 200 }
}
```

| 格式 | 说明 |
|------|------|
| `string` | 节点 ID，自动连接到最近边界 |
| `{ cell, port? }` | 指定节点及连接桩 |
| `{ x, y }` | 绝对坐标，用于自由绘制 |

---

## 5. 完整配置示例

以下示例画布使用了全部 9 种内置线条类型，展示了不同 router / connector / marker / style 的组合效果。

```json
{
  "canvas": {
    "backgroundColor": "#f8f9fa",
    "grid": { "size": 10, "visible": true, "type": "dot", "color": "#d9d9d9" },
    "zoom": 0.9,
    "offset": { "x": 0, "y": 0 }
  },
  "meta": {
    "title": "连接线全类型示例",
    "type": "custom",
    "createdAt": "2026-07-01T00:00:00.000Z",
    "version": "1.0.0"
  },
  "nodes": [
    { "id": "title", "shape": "basic-text", "position": { "x": 300, "y": 20 }, "size": { "width": 400, "height": 40 }, "label": "连接线全类型展示", "data": { "textAlign": "center" }, "style": { "fill": "transparent", "stroke": "none" } },

    { "id": "n-base", "shape": "basic-rect", "position": { "x": 80, "y": 100 }, "size": { "width": 100, "height": 50 }, "label": "基础", "style": { "fill": "#e6f7ff", "stroke": "#1890ff", "strokeWidth": 2 } },
    { "id": "n-arrow", "shape": "basic-rect", "position": { "x": 260, "y": 100 }, "size": { "width": 100, "height": 50 }, "label": "箭头目标", "style": { "fill": "#fff7e6", "stroke": "#fa8c16", "strokeWidth": 2 } },

    { "id": "n-double-a", "shape": "basic-rect", "position": { "x": 460, "y": 100 }, "size": { "width": 100, "height": 50 }, "label": "双箭头A", "style": { "fill": "#f6ffed", "stroke": "#52c41a", "strokeWidth": 2 } },
    { "id": "n-double-b", "shape": "basic-rect", "position": { "x": 640, "y": 100 }, "size": { "width": 100, "height": 50 }, "label": "双箭头B", "style": { "fill": "#f6ffed", "stroke": "#52c41a", "strokeWidth": 2 } },

    { "id": "n-dash-a", "shape": "basic-rect", "position": { "x": 80, "y": 220 }, "size": { "width": 100, "height": 50 }, "label": "虚线起点", "style": { "fill": "#fff1f0", "stroke": "#ff4d4f", "strokeWidth": 2 } },
    { "id": "n-dash-b", "shape": "basic-rect", "position": { "x": 260, "y": 220 }, "size": { "width": 100, "height": 50 }, "label": "虚线终点", "style": { "fill": "#fff1f0", "stroke": "#ff4d4f", "strokeWidth": 2 } },

    { "id": "n-curve-a", "shape": "basic-circle", "position": { "x": 460, "y": 210 }, "size": { "width": 60, "height": 60 }, "label": "曲线A", "style": { "fill": "#f9f0ff", "stroke": "#722ed1", "strokeWidth": 2 } },
    { "id": "n-curve-b", "shape": "basic-circle", "position": { "x": 640, "y": 210 }, "size": { "width": 60, "height": 60 }, "label": "曲线B", "style": { "fill": "#f9f0ff", "stroke": "#722ed1", "strokeWidth": 2 } },

    { "id": "n-orth-a", "shape": "flowchart-process", "position": { "x": 80, "y": 340 }, "size": { "width": 120, "height": 56 }, "label": "折线起点", "style": { "fill": "#e6fffb", "stroke": "#13c2c2", "strokeWidth": 2 } },
    { "id": "n-orth-b", "shape": "flowchart-process", "position": { "x": 280, "y": 340 }, "size": { "width": 120, "height": 56 }, "label": "折线终点", "style": { "fill": "#e6fffb", "stroke": "#13c2c2", "strokeWidth": 2 } },

    { "id": "n-round-a", "shape": "flowchart-decision", "position": { "x": 460, "y": 340 }, "size": { "width": 100, "height": 70 }, "label": "圆角A", "style": { "fill": "#fffbe6", "stroke": "#faad14", "strokeWidth": 2 } },
    { "id": "n-round-b", "shape": "flowchart-decision", "position": { "x": 640, "y": 340 }, "size": { "width": 100, "height": 70 }, "label": "圆角B", "style": { "fill": "#fffbe6", "stroke": "#faad14", "strokeWidth": 2 } },

    { "id": "n-metro-a", "shape": "basic-diamond", "position": { "x": 80, "y": 460 }, "size": { "width": 90, "height": 70 }, "label": "地铁A", "style": { "fill": "#f0f5ff", "stroke": "#2f54eb", "strokeWidth": 2 } },
    { "id": "n-metro-b", "shape": "basic-diamond", "position": { "x": 280, "y": 460 }, "size": { "width": 90, "height": 70 }, "label": "地铁B", "style": { "fill": "#f0f5ff", "stroke": "#2f54eb", "strokeWidth": 2 } },

    { "id": "n-sketch-a", "shape": "basic-cloud", "position": { "x": 460, "y": 450 }, "size": { "width": 120, "height": 70 }, "label": "草图A", "style": { "fill": "#ffffff", "stroke": "#595959", "strokeWidth": 2 } },
    { "id": "n-sketch-b", "shape": "basic-cloud", "position": { "x": 640, "y": 450 }, "size": { "width": 120, "height": 70 }, "label": "草图B", "style": { "fill": "#ffffff", "stroke": "#595959", "strokeWidth": 2 } }
  ],
  "edges": [
    {
      "id": "e-edge",
      "shape": "edge",
      "source": "n-base",
      "target": "n-arrow",
      "label": "基础连接线",
      "style": { "stroke": "#1890ff", "strokeWidth": 2 }
    },
    {
      "id": "e-arrow",
      "shape": "edge",
      "source": "n-arrow",
      "target": "n-double-a",
      "label": "箭头线",
      "style": {
        "stroke": "#fa8c16",
        "strokeWidth": 2,
        "targetMarker": { "name": "classic", "size": 10, "fill": "#fa8c16" }
      }
    },
    {
      "id": "e-double-arrow",
      "shape": "edge",
      "source": "n-double-a",
      "target": "n-double-b",
      "label": "双箭头",
      "style": {
        "stroke": "#52c41a",
        "strokeWidth": 2,
        "sourceMarker": { "name": "classic", "size": 10, "fill": "#52c41a" },
        "targetMarker": { "name": "classic", "size": 10, "fill": "#52c41a" }
      }
    },
    {
      "id": "e-dashed",
      "shape": "edge",
      "source": "n-dash-a",
      "target": "n-dash-b",
      "label": "虚线关系",
      "style": {
        "stroke": "#ff4d4f",
        "strokeWidth": 2,
        "strokeDasharray": "6 4",
        "targetMarker": { "name": "block", "size": 8, "fill": "#ff4d4f" }
      }
    },
    {
      "id": "e-curve",
      "shape": "edge",
      "source": "n-curve-a",
      "target": "n-curve-b",
      "label": "平滑曲线",
      "style": { "stroke": "#722ed1", "strokeWidth": 2 },
      "connector": { "name": "smooth" }
    },
    {
      "id": "e-orthogonal",
      "shape": "edge",
      "source": { "cell": "n-orth-a", "port": "right" },
      "target": { "cell": "n-orth-b", "port": "left" },
      "label": "正交折线",
      "style": { "stroke": "#13c2c2", "strokeWidth": 2 },
      "router": { "name": "orth", "args": { "padding": 20 } }
    },
    {
      "id": "e-rounded",
      "shape": "edge",
      "source": { "cell": "n-round-a", "port": "right" },
      "target": { "cell": "n-round-b", "port": "left" },
      "label": "圆角折线",
      "style": { "stroke": "#faad14", "strokeWidth": 2 },
      "router": { "name": "orth", "args": { "padding": 20 } },
      "connector": { "name": "rounded", "args": { "radius": 8 } }
    },
    {
      "id": "e-metro",
      "shape": "edge",
      "source": { "cell": "n-metro-a", "port": "right" },
      "target": { "cell": "n-metro-b", "port": "left" },
      "label": "地铁路线",
      "style": {
        "stroke": "#2f54eb",
        "strokeWidth": 3,
        "targetMarker": { "name": "circle", "size": 8, "fill": "#2f54eb" }
      },
      "router": { "name": "metro", "args": { "padding": 20 } },
      "connector": { "name": "rounded", "args": { "radius": 8 } }
    },
    {
      "id": "e-sketch",
      "shape": "edge-sketch",
      "source": "n-sketch-a",
      "target": "n-sketch-b",
      "label": "草图线",
      "style": { "stroke": "#595959", "strokeWidth": 2 }
    }
  ]
}
```

---

## 6. 在 Vue 组件中使用

```vue
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { UniDraw } from 'uni-flexible-draw'
import 'uni-flexible-draw/lib/styles/index.css'
import edgeExample from './edge-example.json'

const graphData = ref(edgeExample)
</script>

<template>
  <div style="width: 100vw; height: 100vh;">
    <UniDraw :data="graphData" />
  </div>
</template>
```

---

## 7. 常用组合速查

| 场景 | Router | Connector | Marker | Style |
|------|--------|-----------|--------|-------|
| 普通流程图箭头 | `normal` | `normal` | 终点 `classic` | 实线 |
| 正交流程图 | `orth` | `rounded` | 终点 `classic` | 实线 |
| UML 继承/实现 | `normal` | `smooth` / `normal` | 终点 `block`（空心/实心） | 实线/虚线 |
| UML 聚合/组合 | `normal` | `normal` | 终点 `diamond` | 实线 |
| ER 关系 | `er` | `normal` | 无 | 实线 |
| 状态图迁移 | `orth` | `rounded` | 终点 `classic` | 实线 |
| 弱化/可选关系 | `normal` | `normal` | 无 | `dashed` |
| 手绘风格脑图 | — | `uni-draw-sketch-straight`（edge-sketch） | 无 | 实线 |

---

## 8. 注意事项

1. **ID 唯一性**：所有 `edges[].id` 必须在整个画布数据中全局唯一。
2. **节点引用**：`source` / `target` 引用的节点 ID 必须存在于 `nodes` 中。
3. **草图边限制**：`shape` 为 `edge-sketch` 时，自定义 `router` / `connector` 会被 RoughJS 手绘连接器覆盖。
4. **向后兼容**：`data.lineType` / `data.routerName` / `data.connectorName` / `data.sourceMarker` / `data.targetMarker` / `data.strokeStyle` 仍受支持，会被自动转换为对应的新架构配置。
