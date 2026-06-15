# UML 流程图节点速查文档

> 本文档包含流程图中全部 18 种常用节点，每个节点提供**缩略 SVG**（侧边栏拖拽用）和**实际渲染 SVG**（画布展示用）。

---

## 1. 开始/结束（Start / End）

**描述**：流程图的起点或终点。圆角矩形表示流程的开始或结束位置，通常标注「开始」或「结束」。

### 缩略 SVG（侧边栏）
```svg
<svg width="48" height="32" viewBox="0 0 48 32" xmlns="http://www.w3.org/2000/svg"><rect x="2" y="2" width="44" height="28" rx="14" ry="14" fill="#f8fafc" stroke="#334155" stroke-width="2"/></svg>
```

### 实际渲染 SVG（画布）
```svg
<svg width="160" height="70" viewBox="0 0 160 70" xmlns="http://www.w3.org/2000/svg"><rect x="5" y="5" width="150" height="60" rx="30" ry="30" fill="#f8fafc" stroke="#334155" stroke-width="2"/><text x="80" y="42" font-family="system-ui, -apple-system, sans-serif" font-size="16" font-weight="500" fill="#1e293b" text-anchor="middle">Start / End</text></svg>
```

---

## 2. 处理/操作（Process）

**描述**：表示一个处理步骤或操作，如计算、赋值、调用函数等。流程图中最基本的节点类型。

### 缩略 SVG（侧边栏）
```svg
<svg width="48" height="32" viewBox="0 0 48 32" xmlns="http://www.w3.org/2000/svg"><rect x="2" y="2" width="44" height="28" fill="#f8fafc" stroke="#334155" stroke-width="2"/></svg>
```

### 实际渲染 SVG（画布）
```svg
<svg width="160" height="70" viewBox="0 0 160 70" xmlns="http://www.w3.org/2000/svg"><rect x="5" y="5" width="150" height="60" fill="#f8fafc" stroke="#334155" stroke-width="2"/><text x="80" y="42" font-family="system-ui, -apple-system, sans-serif" font-size="16" font-weight="500" fill="#1e293b" text-anchor="middle">Process</text></svg>
```

---

## 3. 判断/决策（Decision）

**描述**：表示一个条件判断，根据条件结果选择不同的分支路径。通常有「是/否」或「真/假」两个出口。

### 缩略 SVG（侧边栏）
```svg
<svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"><polygon points="20,4 36,20 20,36 4,20" fill="#f8fafc" stroke="#334155" stroke-width="2"/></svg>
```

### 实际渲染 SVG（画布）
```svg
<svg width="120" height="120" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg"><polygon points="60,10 110,60 60,110 10,60" fill="#f8fafc" stroke="#334155" stroke-width="2"/><text x="60" y="65" font-family="system-ui, -apple-system, sans-serif" font-size="14" font-weight="500" fill="#1e293b" text-anchor="middle">Yes / No</text></svg>
```

---

## 4. 输入/输出（Input / Output）

**描述**：表示数据的输入或输出操作，如用户输入、文件读取、打印输出等。

### 缩略 SVG（侧边栏）
```svg
<svg width="48" height="32" viewBox="0 0 48 32" xmlns="http://www.w3.org/2000/svg"><polygon points="10,2 46,2 38,30 2,30" fill="#f8fafc" stroke="#334155" stroke-width="2"/></svg>
```

### 实际渲染 SVG（画布）
```svg
<svg width="160" height="70" viewBox="0 0 160 70" xmlns="http://www.w3.org/2000/svg"><polygon points="30,5 155,5 135,65 10,65" fill="#f8fafc" stroke="#334155" stroke-width="2"/><text x="82" y="42" font-family="system-ui, -apple-system, sans-serif" font-size="16" font-weight="500" fill="#1e293b" text-anchor="middle">Input / Output</text></svg>
```

---

## 5. 预定义处理（Predefined Process）

**描述**：表示一个已在其他地方定义好的子程序或函数调用。双边矩形表示该处理在别处有详细定义。

### 缩略 SVG（侧边栏）
```svg
<svg width="48" height="32" viewBox="0 0 48 32" xmlns="http://www.w3.org/2000/svg"><rect x="2" y="2" width="44" height="28" fill="#f8fafc" stroke="#334155" stroke-width="2"/><line x1="8" y1="2" x2="8" y2="30" stroke="#334155" stroke-width="1.5"/><line x1="40" y1="2" x2="40" y2="30" stroke="#334155" stroke-width="1.5"/></svg>
```

### 实际渲染 SVG（画布）
```svg
<svg width="160" height="70" viewBox="0 0 160 70" xmlns="http://www.w3.org/2000/svg"><rect x="5" y="5" width="150" height="60" fill="#f8fafc" stroke="#334155" stroke-width="2"/><line x1="25" y1="5" x2="25" y2="65" stroke="#334155" stroke-width="1.5"/><line x1="135" y1="5" x2="135" y2="65" stroke="#334155" stroke-width="1.5"/><text x="80" y="42" font-family="system-ui, -apple-system, sans-serif" font-size="16" font-weight="500" fill="#1e293b" text-anchor="middle">Predefined</text></svg>
```

---

## 6. 连接符（Connector）

**描述**：用于连接同一页内相距较远的流程线，避免线条交叉混乱。通常用字母或数字编号。

### 缩略 SVG（侧边栏）
```svg
<svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><circle cx="16" cy="16" r="12" fill="#f8fafc" stroke="#334155" stroke-width="2"/><text x="16" y="20" font-family="system-ui, -apple-system, sans-serif" font-size="10" font-weight="600" fill="#1e293b" text-anchor="middle">1</text></svg>
```

### 实际渲染 SVG（画布）
```svg
<svg width="50" height="50" viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg"><circle cx="25" cy="25" r="18" fill="#f8fafc" stroke="#334155" stroke-width="2"/><text x="25" y="30" font-family="system-ui, -apple-system, sans-serif" font-size="14" font-weight="600" fill="#1e293b" text-anchor="middle">A</text></svg>
```

---

## 7. 跨页连接符（Off-page Connector）

**描述**：用于连接不同页面上的流程，表示流程在另一页继续。通常配合页码编号使用。

### 缩略 SVG（侧边栏）
```svg
<svg width="48" height="32" viewBox="0 0 48 32" xmlns="http://www.w3.org/2000/svg"><polygon points="2,2 38,2 46,16 38,30 2,30" fill="#f8fafc" stroke="#334155" stroke-width="2"/></svg>
```

### 实际渲染 SVG（画布）
```svg
<svg width="160" height="70" viewBox="0 0 160 70" xmlns="http://www.w3.org/2000/svg"><polygon points="5,5 140,5 155,35 140,65 5,65" fill="#f8fafc" stroke="#334155" stroke-width="2"/><text x="80" y="42" font-family="system-ui, -apple-system, sans-serif" font-size="16" font-weight="500" fill="#1e293b" text-anchor="middle">Off-page</text></svg>
```

---

## 8. 文档（Document）

**描述**：表示输出为文档或报告。右上角折叠角象征纸张的翻页效果。

### 缩略 SVG（侧边栏）
```svg
<svg width="48" height="40" viewBox="0 0 48 40" xmlns="http://www.w3.org/2000/svg"><path d="M 4 4 L 32 4 L 44 16 L 44 36 L 4 36 Z" fill="#f8fafc" stroke="#334155" stroke-width="2" stroke-linejoin="round"/><polyline points="32,4 32,16 44,16" fill="none" stroke="#334155" stroke-width="2" stroke-linejoin="round"/></svg>
```

### 实际渲染 SVG（画布）
```svg
<svg width="160" height="90" viewBox="0 0 160 90" xmlns="http://www.w3.org/2000/svg"><path d="M 10 10 L 110 10 L 150 50 L 150 80 L 10 80 Z" fill="#f8fafc" stroke="#334155" stroke-width="2" stroke-linejoin="round"/><polyline points="110,10 110,50 150,50" fill="none" stroke="#334155" stroke-width="2" stroke-linejoin="round"/><text x="80" y="52" font-family="system-ui, -apple-system, sans-serif" font-size="16" font-weight="500" fill="#1e293b" text-anchor="middle">Document</text></svg>
```

---

## 9. 多文档（Multi-document）

**描述**：表示输出多个文档或报告。由多个堆叠的折叠角文档形状组成，象征批量文档处理。

### 缩略 SVG（侧边栏）
```svg
<svg width="48" height="44" viewBox="0 0 48 44" xmlns="http://www.w3.org/2000/svg"><path d="M 8 8 L 36 8 L 44 16 L 44 40 L 8 40 Z" fill="#f8fafc" stroke="#334155" stroke-width="1.5" stroke-linejoin="round"/><polyline points="36,8 36,16 44,16" fill="none" stroke="#334155" stroke-width="1.5" stroke-linejoin="round"/><path d="M 4 4 L 32 4 L 40 12 L 40 36 L 4 36 Z" fill="#f8fafc" stroke="#334155" stroke-width="1.5" stroke-linejoin="round"/><polyline points="32,4 32,12 40,12" fill="none" stroke="#334155" stroke-width="1.5" stroke-linejoin="round"/></svg>
```

### 实际渲染 SVG（画布）
```svg
<svg width="160" height="100" viewBox="0 0 160 100" xmlns="http://www.w3.org/2000/svg"><path d="M 20 20 L 120 20 L 150 50 L 150 90 L 20 90 Z" fill="#f8fafc" stroke="#334155" stroke-width="2" stroke-linejoin="round"/><polyline points="120,20 120,50 150,50" fill="none" stroke="#334155" stroke-width="2" stroke-linejoin="round"/><path d="M 5 5 L 105 5 L 135 35 L 135 75 L 5 75 Z" fill="#f8fafc" stroke="#334155" stroke-width="2" stroke-linejoin="round"/><polyline points="105,5 105,35 135,35" fill="none" stroke="#334155" stroke-width="2" stroke-linejoin="round"/><text x="80" y="85" font-family="system-ui, -apple-system, sans-serif" font-size="16" font-weight="500" fill="#1e293b" text-anchor="middle">Multi-doc</text></svg>
```

---

## 10. 准备/初始化（Preparation）

**描述**：表示初始化设置或准备工作，如变量初始化、配置加载等。六边形象征准备阶段。

### 缩略 SVG（侧边栏）
```svg
<svg width="48" height="32" viewBox="0 0 48 32" xmlns="http://www.w3.org/2000/svg"><polygon points="12,2 36,2 46,16 36,30 12,30 2,16" fill="#f8fafc" stroke="#334155" stroke-width="2"/></svg>
```

### 实际渲染 SVG（画布）
```svg
<svg width="160" height="70" viewBox="0 0 160 70" xmlns="http://www.w3.org/2000/svg"><polygon points="40,5 120,5 155,35 120,65 40,65 5,35" fill="#f8fafc" stroke="#334155" stroke-width="2"/><text x="80" y="42" font-family="system-ui, -apple-system, sans-serif" font-size="16" font-weight="500" fill="#1e293b" text-anchor="middle">Prepare</text></svg>
```

---

## 11. 手动操作（Manual Operation）

**描述**：表示需要人工执行的操作步骤，而非自动处理。梯形顶部宽底部窄，象征人工干预。

### 缩略 SVG（侧边栏）
```svg
<svg width="48" height="32" viewBox="0 0 48 32" xmlns="http://www.w3.org/2000/svg"><polygon points="2,2 46,2 38,30 10,30" fill="#f8fafc" stroke="#334155" stroke-width="2"/></svg>
```

### 实际渲染 SVG（画布）
```svg
<svg width="160" height="70" viewBox="0 0 160 70" xmlns="http://www.w3.org/2000/svg"><polygon points="5,5 155,5 135,65 25,65" fill="#f8fafc" stroke="#334155" stroke-width="2"/><text x="80" y="42" font-family="system-ui, -apple-system, sans-serif" font-size="16" font-weight="500" fill="#1e293b" text-anchor="middle">Manual</text></svg>
```

---

## 12. 延迟（Delay）

**描述**：表示流程中的等待或延迟阶段，如定时等待、异步等待等。左侧半圆象征时间的流逝。

### 缩略 SVG（侧边栏）
```svg
<svg width="48" height="32" viewBox="0 0 48 32" xmlns="http://www.w3.org/2000/svg"><path d="M 16 2 L 46 2 L 46 30 L 16 30 A 14 14 0 0 1 16 2 Z" fill="#f8fafc" stroke="#334155" stroke-width="2"/></svg>
```

### 实际渲染 SVG（画布）
```svg
<svg width="160" height="70" viewBox="0 0 160 70" xmlns="http://www.w3.org/2000/svg"><path d="M 50 5 L 155 5 L 155 65 L 50 65 A 30 30 0 0 1 50 5 Z" fill="#f8fafc" stroke="#334155" stroke-width="2"/><text x="105" y="42" font-family="system-ui, -apple-system, sans-serif" font-size="16" font-weight="500" fill="#1e293b" text-anchor="middle">Delay</text></svg>
```

---

## 13. 数据库（Database）

**描述**：表示数据库的读写操作。圆柱体形状象征传统数据库的磁盘存储形态。

### 缩略 SVG（侧边栏）
```svg
<svg width="48" height="40" viewBox="0 0 48 40" xmlns="http://www.w3.org/2000/svg"><ellipse cx="24" cy="8" rx="20" ry="6" fill="#f8fafc" stroke="#334155" stroke-width="2"/><path d="M 4 8 L 4 32 A 20 6 0 0 0 44 32 L 44 8 A 20 6 0 0 1 4 8" fill="#f8fafc" stroke="#334155" stroke-width="2"/><ellipse cx="24" cy="32" rx="20" ry="6" fill="none" stroke="#334155" stroke-width="2"/></svg>
```

### 实际渲染 SVG（画布）
```svg
<svg width="160" height="90" viewBox="0 0 160 90" xmlns="http://www.w3.org/2000/svg"><ellipse cx="80" cy="15" rx="70" ry="10" fill="#f8fafc" stroke="#334155" stroke-width="2"/><path d="M 10 15 L 10 75 A 70 10 0 0 0 150 75 L 150 15 A 70 10 0 0 1 10 15" fill="#f8fafc" stroke="#334155" stroke-width="2"/><ellipse cx="80" cy="75" rx="70" ry="10" fill="none" stroke="#334155" stroke-width="2"/><text x="80" y="50" font-family="system-ui, -apple-system, sans-serif" font-size="16" font-weight="500" fill="#1e293b" text-anchor="middle">Database</text></svg>
```

---

## 14. 显示（Display）

**描述**：表示在屏幕上显示信息，如弹窗、日志输出、仪表盘展示等。左侧三角形象征显示设备。

### 缩略 SVG（侧边栏）
```svg
<svg width="48" height="32" viewBox="0 0 48 32" xmlns="http://www.w3.org/2000/svg"><polygon points="2,16 12,2 46,2 46,30 12,30" fill="#f8fafc" stroke="#334155" stroke-width="2"/></svg>
```

### 实际渲染 SVG（画布）
```svg
<svg width="160" height="70" viewBox="0 0 160 70" xmlns="http://www.w3.org/2000/svg"><polygon points="5,35 25,5 155,5 155,65 25,65" fill="#f8fafc" stroke="#334155" stroke-width="2"/><text x="90" y="42" font-family="system-ui, -apple-system, sans-serif" font-size="16" font-weight="500" fill="#1e293b" text-anchor="middle">Display</text></svg>
```

---

## 15. 注释（Annotation）

**描述**：用于添加说明性文字，解释流程细节或补充信息。虚线边框表示非执行节点。

### 缩略 SVG（侧边栏）
```svg
<svg width="48" height="32" viewBox="0 0 48 32" xmlns="http://www.w3.org/2000/svg"><rect x="2" y="2" width="44" height="28" rx="4" ry="4" fill="#f8fafc" stroke="#334155" stroke-width="2" stroke-dasharray="4 2"/></svg>
```

### 实际渲染 SVG（画布）
```svg
<svg width="160" height="70" viewBox="0 0 160 70" xmlns="http://www.w3.org/2000/svg"><rect x="5" y="5" width="150" height="60" rx="8" ry="8" fill="#f8fafc" stroke="#334155" stroke-width="2" stroke-dasharray="6 3"/><text x="80" y="42" font-family="system-ui, -apple-system, sans-serif" font-size="16" font-weight="500" fill="#1e293b" text-anchor="middle">Note</text></svg>
```

---

## 16. 合并（Merge）

**描述**：将多条流程路径合并为一条，与判断节点对应。实心菱形表示无条件合并，所有分支汇聚后继续。

### 缩略 SVG（侧边栏）
```svg
<svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><polygon points="16,4 28,16 16,28 4,16" fill="#334155"/></svg>
```

### 实际渲染 SVG（画布）
```svg
<svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"><polygon points="20,6 34,20 20,34 6,20" fill="#334155"/></svg>
```

---

## 17. 排序（Sort）

**描述**：表示对数据进行排序操作。三角形形状象征数据的有序排列（从小到大或从大到小）。

### 缩略 SVG（侧边栏）
```svg
<svg width="48" height="32" viewBox="0 0 48 32" xmlns="http://www.w3.org/2000/svg"><polygon points="24,4 44,28 4,28" fill="#f8fafc" stroke="#334155" stroke-width="2"/></svg>
```

### 实际渲染 SVG（画布）
```svg
<svg width="120" height="100" viewBox="0 0 120 100" xmlns="http://www.w3.org/2000/svg"><polygon points="60,10 110,90 10,90" fill="#f8fafc" stroke="#334155" stroke-width="2"/><text x="60" y="75" font-family="system-ui, -apple-system, sans-serif" font-size="16" font-weight="500" fill="#1e293b" text-anchor="middle">Sort</text></svg>
```

---

## 18. 存储数据（Stored Data）

**描述**：表示数据在系统中的存储位置，如变量、缓存、临时文件等。D形符号象征数据的持久化存储。

### 缩略 SVG（侧边栏）
```svg
<svg width="48" height="32" viewBox="0 0 48 32" xmlns="http://www.w3.org/2000/svg"><path d="M 2 2 L 38 2 A 14 14 0 0 1 38 30 L 2 30 Z" fill="#f8fafc" stroke="#334155" stroke-width="2"/></svg>
```

### 实际渲染 SVG（画布）
```svg
<svg width="160" height="70" viewBox="0 0 160 70" xmlns="http://www.w3.org/2000/svg"><path d="M 5 5 L 135 5 A 30 30 0 0 1 135 65 L 5 65 Z" fill="#f8fafc" stroke="#334155" stroke-width="2"/><text x="75" y="42" font-family="system-ui, -apple-system, sans-serif" font-size="16" font-weight="500" fill="#1e293b" text-anchor="middle">Stored Data</text></svg>
```

---

## 汇总速查表

| 序号 | 节点名称 | 英文名称 | 缩略尺寸 | 渲染尺寸 | 核心用途 |
|------|----------|----------|----------|----------|----------|
| 1 | 开始/结束 | Start / End | 48×32 | 160×70 | 流程图的起点或终点。 |
| 2 | 处理/操作 | Process | 48×32 | 160×70 | 表示一个处理步骤或操作，如计算、赋值、调用函数等。 |
| 3 | 判断/决策 | Decision | 40×40 | 120×120 | 表示一个条件判断，根据条件结果选择不同的分支路径。 |
| 4 | 输入/输出 | Input / Output | 48×32 | 160×70 | 表示数据的输入或输出操作，如用户输入、文件读取、打印输出等。 |
| 5 | 预定义处理 | Predefined Process | 48×32 | 160×70 | 表示一个已在其他地方定义好的子程序或函数调用。 |
| 6 | 连接符 | Connector | 32×32 | 50×50 | 用于连接同一页内相距较远的流程线，避免线条交叉混乱。 |
| 7 | 跨页连接符 | Off-page Connector | 48×32 | 160×70 | 用于连接不同页面上的流程，表示流程在另一页继续。 |
| 8 | 文档 | Document | 48×40 | 160×90 | 表示输出为文档或报告。 |
| 9 | 多文档 | Multi-document | 48×44 | 160×100 | 表示输出多个文档或报告。 |
| 10 | 准备/初始化 | Preparation | 48×32 | 160×70 | 表示初始化设置或准备工作，如变量初始化、配置加载等。 |
| 11 | 手动操作 | Manual Operation | 48×32 | 160×70 | 表示需要人工执行的操作步骤，而非自动处理。 |
| 12 | 延迟 | Delay | 48×32 | 160×70 | 表示流程中的等待或延迟阶段，如定时等待、异步等待等。 |
| 13 | 数据库 | Database | 48×40 | 160×90 | 表示数据库的读写操作。 |
| 14 | 显示 | Display | 48×32 | 160×70 | 表示在屏幕上显示信息，如弹窗、日志输出、仪表盘展示等。 |
| 15 | 注释 | Annotation | 48×32 | 160×70 | 用于添加说明性文字，解释流程细节或补充信息。 |
| 16 | 合并 | Merge | 32×32 | 40×40 | 将多条流程路径合并为一条，与判断节点对应。 |
| 17 | 排序 | Sort | 48×32 | 120×100 | 表示对数据进行排序操作。 |
| 18 | 存储数据 | Stored Data | 48×32 | 160×70 | 表示数据在系统中的存储位置，如变量、缓存、临时文件等。 |
