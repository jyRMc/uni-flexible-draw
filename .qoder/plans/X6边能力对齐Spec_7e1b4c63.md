
# X6 边能力对齐 Spec

## 一、X6 官方边功能全貌（基于 https://x6.antv.antgroup.com/examples 实际访问）

| 维度 | X6 官方分类 | X6 提供的选项 |
|------|-----------|-------------|
| **样式 Style** | 样式 | 默认边、渐变背景色、交错背景色、沿边图形、自定义点击事件 |
| **箭头 Marker** | 箭头 | 内置箭头(block/classic/diamond/circle/circlePlus/ellipse/cross/async)、path自定义、图形元素自定义、image自定义、复杂自定义 |
| **标签 Label** | 标签 | SVG渲染、HTML渲染、React渲染、多标签、沿路径Label |
| **路由 Router** | 路由 | 默认(normal)、拐线(orth)、正交线(orth+vertices)、关系(er)、关系中心(er-center)、智能(manhattan)、智能地铁(metro)、单侧(oneSide)、自定义随机 |
| **连接器 Connector** | 连线 | 默认(normal/直线)、圆角(rounded)、平滑(smooth/三次贝塞尔)、跳线(jumpover)、二次贝塞尔(quadratic)、随机摇摆(wobble)、多条光滑曲线 |
| **辅助工具 Edge Tools** | 辅助工具 | 调整顶点(vertices)、调整线段(segments)、自定义按钮(button)、删除按钮(button-remove)、调整箭头(arrowheads)、包围框(boundary)、右键菜单(contextMenu)、Tooltip |

## 二、当前项目已有能力

| 维度 | 已有 | 缺失/问题 |
|------|-----|----------|
| **Router** | normal/orth/manhattan/er/metro/oneSide (6个全有) | -- 无缺失 |
| **Connector** | normal/smooth/rounded/quadratic/jumpover/wobble (6个全有) | -- 无缺失 |
| **Marker** | none/classic/block/diamond/circle/cross/async (7个) | 缺少 circlePlus, ellipse, path (官方有9种内置) |
| **StrokeStyle** | solid/dashed/dotted/dashdot (4个全有) | -- 无缺失 |
| **Label** | 文本输入框 | 缺少: 标签位置控制(center/top/bottom/left/right)、多标签 |
| **Edge Tools** | 仅 edge:mouseenter 时自动挂载 vertices+segments | 缺少: 删除按钮、调整箭头(arrowheads 拖拽重连)、包围框 |
| **事件链路** | QuickActionBar→UniDraw→FlexibleDraw→useCanvas→useStyleEditor 全链路已通 | -- |

## 三、核心差距分析

### 差距1: 缺少 Edge Tools 持久化控制
当前 vertices/segments 只在 hover 时自动挂载，缺少像 X6 示例中那样的：
- **button-remove**: 边上的删除按钮
- **arrowheads**: 拖拽箭头端点重连到其他节点
- **boundary**: 选中时显示包围框

### 差距2: Marker 不完整
X6 官方内置 9 种箭头（block, classic, diamond, cross, async, circle, circlePlus, ellipse, path），当前只支持 7 种，缺少 circlePlus 和 ellipse。

### 差距3: Label 位置控制缺失
X6 示例中 Label 支持 center/top/bottom/left/right 5个位置，当前只有一个文本输入框。

### 差距4: 缺少边的渐变/交错背景色
X6 示例中的 "样式" 分类有渐变边、交错填充边等高级样式，当前完全没有。

## 四、执行计划

### Phase 1: Marker 补全 (circlePlus + ellipse)
- 文件: `lib/shared/types/edge.ts` - MarkerName 类型添加 `'circlePlus' | 'ellipse'`
- 文件: `lib/shared/utils/edgeLineIcons.ts` - 添加 circlePlus 和 ellipse 的 SVG 图标
- 文件: `lib/shared/utils/edgeLine.ts` - getMarkerConfig 添加 circlePlus/ellipse 配置
- 文件: locale 文件 - 添加翻译
- 文件: QuickActionBar.vue / UniDraw.ts - 自动继承（通过 getMarkerOptions 已动态生成）

### Phase 2: Label 位置控制
- 文件: `lib/composables/useStyleEditor.ts` - 添加 `changeEdgeLabelPosition(id, position)` 函数
- 文件: `lib/components/QuickActionBar/QuickActionBar.vue` - 在 Label section 添加位置选择按钮组
- 文件: 事件链路贯穿 useCanvas → FlexibleDraw → UniDraw

### Phase 3: Edge Tools 增强
- 文件: `lib/core/engine/AntVRenderEngine.ts` - 选中边时额外挂载 button-remove + arrowheads
- 文件: `lib/composables/useCanvas.ts` - 添加 `deleteEdge(id)` 方法（已有 removeEdge 可复用）
- 重点: arrowheads 允许拖拽边的端点连接到其他节点

### Phase 4: 边高级样式（渐变/交错填充）
- 文件: `lib/composables/useStyleEditor.ts` - 添加 `changeEdgeGradient(id, ...)` 函数
- 文件: QuickActionBar.vue - 在 Line section 添加渐变开关
- 这是低优先级，X6 示例中也属于比较高级的功能

## 五、不在范围内

以下功能属于 X6 的高级定制能力，不在本次对齐范围内：
- 自定义 Router（随机路由等）
- 自定义 Connector（wobble 已内置）
- React/HTML 渲染 Label
- 沿路径 Label
- image/复杂 path 自定义箭头
- ContextMenu/Tooltip 辅助工具（项目已有自己的右键菜单）

## 六、执行优先级

1. **Phase 1** (Marker 补全) - 最小改动，最高收益
2. **Phase 3** (Edge Tools 增强) - 交互体验提升最大
3. **Phase 2** (Label 位置) - 中等改动
4. **Phase 4** (高级样式) - 低优先级，可后续迭代
