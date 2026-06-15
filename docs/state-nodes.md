# UML 状态图节点速查文档

> 本文档包含状态图中全部 16 种常用节点，每个节点提供**缩略 SVG**（侧边栏拖拽用）和**实际渲染 SVG**（画布展示用）。

---

## 1. 初始状态（Initial State）

**描述**：状态机的起始点，表示状态机开始执行的第一个状态。一个状态图中通常只有一个初始状态（嵌套状态中可多个）。

### 缩略 SVG（侧边栏）
```svg
<svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
  <circle cx="20" cy="20" r="10" fill="#1a1a1a"/>
</svg>
```

### 实际渲染 SVG（画布）
```svg
<svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
  <circle cx="20" cy="20" r="12" fill="#1a1a1a"/>
</svg>
```

---

## 2. 终止状态（Final State）

**描述**：状态机的结束点，表示状态机生命周期的终结。一个状态图中可以有零个或多个终止状态。

### 缩略 SVG（侧边栏）
```svg
<svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
  <circle cx="20" cy="20" r="12" fill="none" stroke="#1a1a1a" stroke-width="2"/>
  <circle cx="20" cy="20" r="6" fill="#1a1a1a"/>
</svg>
```

### 实际渲染 SVG（画布）
```svg
<svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
  <circle cx="20" cy="20" r="14" fill="none" stroke="#1a1a1a" stroke-width="2"/>
  <circle cx="20" cy="20" r="8" fill="#1a1a1a"/>
</svg>
```

---

## 3. 简单状态（Simple State）

**描述**：最基本的状态单元，表示对象在某一时间段内满足特定条件、执行特定活动或等待某事件。

### 缩略 SVG（侧边栏）
```svg
<svg width="48" height="32" viewBox="0 0 48 32" xmlns="http://www.w3.org/2000/svg">
  <rect x="2" y="2" width="44" height="28" rx="6" ry="6" fill="#f8fafc" stroke="#334155" stroke-width="2"/>
</svg>
```

### 实际渲染 SVG（画布）
```svg
<svg width="140" height="70" viewBox="0 0 140 70" xmlns="http://www.w3.org/2000/svg">
  <rect x="5" y="5" width="130" height="60" rx="12" ry="12" fill="#f8fafc" stroke="#334155" stroke-width="2"/>
  <text x="70" y="42" font-family="system-ui, -apple-system, sans-serif" font-size="16" font-weight="500" fill="#1e293b" text-anchor="middle">Idle</text>
</svg>
```

---

## 4. 复合状态（Composite State）

**描述**：包含子状态的状态，内部可嵌套一个或多个状态区域。用于对复杂行为进行层次化分解。

### 缩略 SVG（侧边栏）
```svg
<svg width="48" height="36" viewBox="0 0 48 36" xmlns="http://www.w3.org/2000/svg">
  <rect x="2" y="2" width="44" height="32" rx="6" ry="6" fill="#f8fafc" stroke="#334155" stroke-width="2"/>
  <line x1="2" y1="12" x2="46" y2="12" stroke="#334155" stroke-width="2"/>
</svg>
```

### 实际渲染 SVG（画布）
```svg
<svg width="200" height="120" viewBox="0 0 200 120" xmlns="http://www.w3.org/2000/svg">
  <rect x="5" y="5" width="190" height="110" rx="12" ry="12" fill="#f8fafc" stroke="#334155" stroke-width="2"/>
  <line x1="5" y1="40" x2="195" y2="40" stroke="#334155" stroke-width="2"/>
  <text x="100" y="28" font-family="system-ui, -apple-system, sans-serif" font-size="14" font-weight="600" fill="#1e293b" text-anchor="middle">Processing</text>
  <rect x="25" y="55" width="150" height="45" rx="6" ry="6" fill="#e2e8f0" stroke="#94a3b8" stroke-width="1.5" stroke-dasharray="4 2"/>
  <text x="100" y="82" font-family="system-ui, -apple-system, sans-serif" font-size="12" fill="#64748b" text-anchor="middle">[子状态区域]</text>
</svg>
```

---

## 5. 子状态机状态（Submachine State）

**描述**：引用另一个独立状态机的状态，通过状态机名称实现复用，避免重复绘制复杂逻辑。

### 缩略 SVG（侧边栏）
```svg
<svg width="48" height="32" viewBox="0 0 48 32" xmlns="http://www.w3.org/2000/svg">
  <rect x="2" y="2" width="44" height="28" rx="6" ry="6" fill="#f8fafc" stroke="#334155" stroke-width="2"/>
  <text x="40" y="22" font-family="monospace" font-size="8" fill="#334155" text-anchor="middle">::</text>
</svg>
```

### 实际渲染 SVG（画布）
```svg
<svg width="160" height="70" viewBox="0 0 160 70" xmlns="http://www.w3.org/2000/svg">
  <rect x="5" y="5" width="150" height="60" rx="12" ry="12" fill="#f8fafc" stroke="#334155" stroke-width="2"/>
  <text x="75" y="42" font-family="system-ui, -apple-system, sans-serif" font-size="16" font-weight="500" fill="#1e293b" text-anchor="middle">AuthFlow</text>
  <path d="M 125 50 L 135 50 L 135 60 L 125 60 Z" fill="none" stroke="#334155" stroke-width="1.5"/>
  <text x="130" y="57" font-family="monospace" font-size="10" fill="#334155" text-anchor="middle">::</text>
</svg>
```

---

## 6. 浅历史状态（Shallow History）

**描述**：记录复合状态最近一次激活的直接子状态。当再次进入该复合状态时，恢复到该子状态（不恢复更深层的子状态）。

### 缩略 SVG（侧边栏）
```svg
<svg width="40" height="32" viewBox="0 0 40 32" xmlns="http://www.w3.org/2000/svg">
  <rect x="2" y="2" width="36" height="28" rx="4" ry="4" fill="#f8fafc" stroke="#334155" stroke-width="2"/>
  <text x="20" y="22" font-family="system-ui, -apple-system, sans-serif" font-size="14" font-weight="600" fill="#1e293b" text-anchor="middle">H</text>
</svg>
```

### 实际渲染 SVG（画布）
```svg
<svg width="60" height="50" viewBox="0 0 60 50" xmlns="http://www.w3.org/2000/svg">
  <rect x="5" y="5" width="50" height="40" rx="8" ry="8" fill="#f8fafc" stroke="#334155" stroke-width="2"/>
  <text x="30" y="33" font-family="system-ui, -apple-system, sans-serif" font-size="20" font-weight="600" fill="#1e293b" text-anchor="middle">H</text>
</svg>
```

---

## 7. 深历史状态（Deep History）

**描述**：记录复合状态最近一次激活的最深层子状态。当再次进入时，完整恢复到之前的嵌套状态路径。

### 缩略 SVG（侧边栏）
```svg
<svg width="40" height="32" viewBox="0 0 40 32" xmlns="http://www.w3.org/2000/svg">
  <rect x="2" y="2" width="36" height="28" rx="4" ry="4" fill="#f8fafc" stroke="#334155" stroke-width="2"/>
  <text x="20" y="22" font-family="system-ui, -apple-system, sans-serif" font-size="12" font-weight="600" fill="#1e293b" text-anchor="middle">H*</text>
</svg>
```

### 实际渲染 SVG（画布）
```svg
<svg width="60" height="50" viewBox="0 0 60 50" xmlns="http://www.w3.org/2000/svg">
  <rect x="5" y="5" width="50" height="40" rx="8" ry="8" fill="#f8fafc" stroke="#334155" stroke-width="2"/>
  <text x="30" y="33" font-family="system-ui, -apple-system, sans-serif" font-size="20" font-weight="600" fill="#1e293b" text-anchor="middle">H*</text>
</svg>
```

---

## 8. 发送信号（Send Signal）

**描述**：状态机向外部对象或系统发送一个信号/事件。通常表示当前状态执行某个动作后触发对外通知。

### 缩略 SVG（侧边栏）
```svg
<svg width="48" height="32" viewBox="0 0 48 32" xmlns="http://www.w3.org/2000/svg">
  <polygon points="2,16 12,2 36,2 46,16 36,30 12,30" fill="#f8fafc" stroke="#334155" stroke-width="2"/>
</svg>
```

### 实际渲染 SVG（画布）
```svg
<svg width="160" height="70" viewBox="0 0 160 70" xmlns="http://www.w3.org/2000/svg">
  <polygon points="5,35 40,5 120,5 155,35 120,65 40,65" fill="#f8fafc" stroke="#334155" stroke-width="2"/>
  <text x="80" y="42" font-family="system-ui, -apple-system, sans-serif" font-size="14" font-weight="500" fill="#1e293b" text-anchor="middle">Send Order</text>
  <line x1="120" y1="5" x2="155" y2="35" stroke="#334155" stroke-width="1.5"/>
  <line x1="120" y1="65" x2="155" y2="35" stroke="#334155" stroke-width="1.5"/>
</svg>
```

---

## 9. 接收信号（Receive Signal）

**描述**：状态机接收来自外部对象或系统的信号/事件。当收到指定信号时触发状态转换或执行内部动作。

### 缩略 SVG（侧边栏）
```svg
<svg width="48" height="32" viewBox="0 0 48 32" xmlns="http://www.w3.org/2000/svg">
  <polygon points="12,2 36,2 46,16 36,30 12,30 2,16" fill="#f8fafc" stroke="#334155" stroke-width="2"/>
</svg>
```

### 实际渲染 SVG（画布）
```svg
<svg width="160" height="70" viewBox="0 0 160 70" xmlns="http://www.w3.org/2000/svg">
  <polygon points="40,5 120,5 155,35 120,65 40,65 5,35" fill="#f8fafc" stroke="#334155" stroke-width="2"/>
  <text x="80" y="42" font-family="system-ui, -apple-system, sans-serif" font-size="14" font-weight="500" fill="#1e293b" text-anchor="middle">Recv Payment</text>
  <line x1="40" y1="5" x2="5" y2="35" stroke="#334155" stroke-width="1.5"/>
  <line x1="40" y1="65" x2="5" y2="35" stroke="#334155" stroke-width="1.5"/>
</svg>
```

---

## 10. 连接点（Junction）

**描述**：将多条转换路径合并为一条，或将一条路径拆分为多条。用于实现静态分支/合并逻辑（无事件触发，仅基于监护条件）。

### 缩略 SVG（侧边栏）
```svg
<svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
  <polygon points="16,4 28,16 16,28 4,16" fill="#334155"/>
</svg>
```

### 实际渲染 SVG（画布）
```svg
<svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
  <polygon points="20,8 32,20 20,32 8,20" fill="#334155"/>
</svg>
```

---

## 11. 选择点（Choice）

**描述**：动态条件分支点，根据进入时的监护条件动态选择 outgoing 转换路径。与连接点不同，选择点支持动态决策。

### 缩略 SVG（侧边栏）
```svg
<svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
  <polygon points="16,4 28,16 16,28 4,16" fill="#f8fafc" stroke="#334155" stroke-width="2"/>
  <text x="16" y="19" font-family="system-ui, -apple-system, sans-serif" font-size="10" font-weight="600" fill="#1e293b" text-anchor="middle">?</text>
</svg>
```

### 实际渲染 SVG（画布）
```svg
<svg width="50" height="50" viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg">
  <polygon points="25,10 40,25 25,40 10,25" fill="#f8fafc" stroke="#334155" stroke-width="2"/>
  <text x="25" y="29" font-family="system-ui, -apple-system, sans-serif" font-size="10" font-weight="600" fill="#1e293b" text-anchor="middle">?</text>
</svg>
```

---

## 12. 分叉（Fork）

**描述**：将单条控制流分裂为多条并发控制流，进入多个正交区域（并发子状态）。

### 缩略 SVG（侧边栏）
```svg
<svg width="48" height="32" viewBox="0 0 48 32" xmlns="http://www.w3.org/2000/svg">
  <line x1="24" y1="2" x2="24" y2="12" stroke="#334155" stroke-width="2"/>
  <line x1="4" y1="12" x2="44" y2="12" stroke="#334155" stroke-width="4" stroke-linecap="round"/>
  <line x1="12" y1="12" x2="12" y2="30" stroke="#334155" stroke-width="2"/>
  <line x1="24" y1="12" x2="24" y2="30" stroke="#334155" stroke-width="2"/>
  <line x1="36" y1="12" x2="36" y2="30" stroke="#334155" stroke-width="2"/>
</svg>
```

### 实际渲染 SVG（画布）
```svg
<svg width="120" height="60" viewBox="0 0 120 60" xmlns="http://www.w3.org/2000/svg">
  <line x1="60" y1="10" x2="60" y2="30" stroke="#334155" stroke-width="2"/>
  <line x1="20" y1="30" x2="100" y2="30" stroke="#334155" stroke-width="5" stroke-linecap="round"/>
  <line x1="30" y1="30" x2="30" y2="50" stroke="#334155" stroke-width="2"/>
  <line x1="60" y1="30" x2="60" y2="50" stroke="#334155" stroke-width="2"/>
  <line x1="90" y1="30" x2="90" y2="50" stroke="#334155" stroke-width="2"/>
</svg>
```

---

## 13. 汇合（Join）

**描述**：将多条并发控制流合并为单条控制流，所有入线都完成后才能继续。

### 缩略 SVG（侧边栏）
```svg
<svg width="48" height="32" viewBox="0 0 48 32" xmlns="http://www.w3.org/2000/svg">
  <line x1="12" y1="2" x2="12" y2="12" stroke="#334155" stroke-width="2"/>
  <line x1="24" y1="2" x2="24" y2="12" stroke="#334155" stroke-width="2"/>
  <line x1="36" y1="2" x2="36" y2="12" stroke="#334155" stroke-width="2"/>
  <line x1="4" y1="12" x2="44" y2="12" stroke="#334155" stroke-width="4" stroke-linecap="round"/>
  <line x1="24" y1="12" x2="24" y2="30" stroke="#334155" stroke-width="2"/>
</svg>
```

### 实际渲染 SVG（画布）
```svg
<svg width="120" height="60" viewBox="0 0 120 60" xmlns="http://www.w3.org/2000/svg">
  <line x1="30" y1="10" x2="30" y2="30" stroke="#334155" stroke-width="2"/>
  <line x1="60" y1="10" x2="60" y2="30" stroke="#334155" stroke-width="2"/>
  <line x1="90" y1="10" x2="90" y2="30" stroke="#334155" stroke-width="2"/>
  <line x1="20" y1="30" x2="100" y2="30" stroke="#334155" stroke-width="5" stroke-linecap="round"/>
  <line x1="60" y1="30" x2="60" y2="50" stroke="#334155" stroke-width="2"/>
</svg>
```

---

## 14. 入口点（Entry Point）

**描述**：定义在状态机边界上的特殊入口，允许从外部直接进入某个内部状态，绕过初始状态。

### 缩略 SVG（侧边栏）
```svg
<svg width="48" height="32" viewBox="0 0 48 32" xmlns="http://www.w3.org/2000/svg">
  <rect x="10" y="2" width="36" height="28" rx="4" ry="4" fill="#f8fafc" stroke="#334155" stroke-width="2"/>
  <circle cx="10" cy="16" r="4" fill="#f8fafc" stroke="#334155" stroke-width="2"/>
  <line x1="2" y1="16" x2="6" y2="16" stroke="#334155" stroke-width="1.5"/>
  <polygon points="6,16 3,13 3,19" fill="#334155"/>
</svg>
```

### 实际渲染 SVG（画布）
```svg
<svg width="140" height="70" viewBox="0 0 140 70" xmlns="http://www.w3.org/2000/svg">
  <rect x="30" y="5" width="100" height="60" rx="12" ry="12" fill="#f8fafc" stroke="#334155" stroke-width="2"/>
  <text x="80" y="38" font-family="system-ui, -apple-system, sans-serif" font-size="14" fill="#1e293b" text-anchor="middle">State</text>
  <circle cx="30" cy="35" r="6" fill="#f8fafc" stroke="#334155" stroke-width="2"/>
  <line x1="5" y1="35" x2="24" y2="35" stroke="#334155" stroke-width="2"/>
  <polygon points="24,35 18,31 18,39" fill="#334155"/>
</svg>
```

---

## 15. 出口点（Exit Point）

**描述**：定义在状态机边界上的特殊出口，允许从内部状态直接退出到外部指定目标。

### 缩略 SVG（侧边栏）
```svg
<svg width="48" height="32" viewBox="0 0 48 32" xmlns="http://www.w3.org/2000/svg">
  <rect x="2" y="2" width="36" height="28" rx="4" ry="4" fill="#f8fafc" stroke="#334155" stroke-width="2"/>
  <circle cx="38" cy="16" r="4" fill="#f8fafc" stroke="#334155" stroke-width="2"/>
  <line x1="38" y1="13" x2="38" y2="19" stroke="#334155" stroke-width="1"/>
  <line x1="35" y1="13" x2="41" y2="19" stroke="#334155" stroke-width="1"/>
  <line x1="42" y1="16" x2="46" y2="16" stroke="#334155" stroke-width="1.5"/>
  <polygon points="46,16 43,13 43,19" fill="#334155"/>
</svg>
```

### 实际渲染 SVG（画布）
```svg
<svg width="140" height="70" viewBox="0 0 140 70" xmlns="http://www.w3.org/2000/svg">
  <rect x="5" y="5" width="100" height="60" rx="12" ry="12" fill="#f8fafc" stroke="#334155" stroke-width="2"/>
  <text x="55" y="38" font-family="system-ui, -apple-system, sans-serif" font-size="14" fill="#1e293b" text-anchor="middle">State</text>
  <circle cx="105" cy="35" r="6" fill="#f8fafc" stroke="#334155" stroke-width="2"/>
  <line x1="102" y1="32" x2="108" y2="38" stroke="#334155" stroke-width="1.5"/>
  <line x1="108" y1="32" x2="102" y2="38" stroke="#334155" stroke-width="1.5"/>
  <line x1="111" y1="35" x2="130" y2="35" stroke="#334155" stroke-width="2"/>
  <polygon points="130,35 124,31 124,39" fill="#334155"/>
</svg>
```

---

## 16. 终止伪状态（Terminate / Exit）

**描述**：表示状态机实例被显式销毁或终止，对象生命周期结束。与 Final State 不同，Terminate 是强制销毁而非正常完成。

### 缩略 SVG（侧边栏）
```svg
<svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
  <line x1="8" y1="8" x2="24" y2="24" stroke="#dc2626" stroke-width="2.5" stroke-linecap="round"/>
  <line x1="24" y1="8" x2="8" y2="24" stroke="#dc2626" stroke-width="2.5" stroke-linecap="round"/>
</svg>
```

### 实际渲染 SVG（画布）
```svg
<svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
  <line x1="12" y1="12" x2="28" y2="28" stroke="#dc2626" stroke-width="3" stroke-linecap="round"/>
  <line x1="28" y1="12" x2="12" y2="28" stroke="#dc2626" stroke-width="3" stroke-linecap="round"/>
</svg>
```

---

## 汇总速查表

| 序号 | 节点名称 | 英文名称 | 缩略尺寸 | 渲染尺寸 | 核心用途 |
|------|----------|----------|----------|----------|----------|
| 1 | 初始状态 | Initial State | 40×40 | 40×40 | 起点 |
| 2 | 终止状态 | Final State | 40×40 | 40×40 | 正常结束 |
| 3 | 简单状态 | Simple State | 48×32 | 140×70 | 基本状态单元 |
| 4 | 复合状态 | Composite State | 48×36 | 200×120 | 包含子状态 |
| 5 | 子状态机 | Submachine State | 48×32 | 160×70 | 引用外部状态机 |
| 6 | 浅历史 | Shallow History | 40×32 | 60×50 | 恢复最近直接子状态 |
| 7 | 深历史 | Deep History | 40×32 | 60×50 | 恢复最深嵌套状态 |
| 8 | 发送信号 | Send Signal | 48×32 | 160×70 | 向外部发送信号 |
| 9 | 接收信号 | Receive Signal | 48×32 | 160×70 | 接收外部信号 |
| 10 | 连接点 | Junction | 32×32 | 40×40 | 静态分支/合并 |
| 11 | 选择点 | Choice | 32×32 | 50×50 | 动态条件分支 |
| 12 | 分叉 | Fork | 48×32 | 120×60 | 并发分裂 |
| 13 | 汇合 | Join | 48×32 | 120×60 | 并发合并 |
| 14 | 入口点 | Entry Point | 48×32 | 140×70 | 外部直接进入 |
| 15 | 出口点 | Exit Point | 48×32 | 140×70 | 内部直接退出 |
| 16 | 终止伪状态 | Terminate | 32×32 | 40×40 | 强制销毁 |
