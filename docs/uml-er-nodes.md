# UML 实体关系图节点速查文档

> 本文档包含实体关系图（ER图）中全部 10 种常用节点，每个节点提供**缩略 SVG**（侧边栏拖拽用）和**实际渲染 SVG**（画布展示用）。

---

## 1. 实体（Entity）

**描述**：表示具有独立存在意义的对象或概念，如「学生」、「课程」。矩形是ER图中最基本的实体符号。

### 缩略 SVG（侧边栏）
```svg
<svg width="48" height="32" viewBox="0 0 48 32" xmlns="http://www.w3.org/2000/svg"><rect x="2" y="2" width="44" height="28" fill="#f8fafc" stroke="#334155" stroke-width="2"/></svg>
```

### 实际渲染 SVG（画布）
```svg
<svg width="160" height="70" viewBox="0 0 160 70" xmlns="http://www.w3.org/2000/svg"><rect x="5" y="5" width="150" height="60" fill="#f8fafc" stroke="#334155" stroke-width="2"/><text x="80" y="42" font-family="system-ui, -apple-system, sans-serif" font-size="16" font-weight="500" fill="#1e293b" text-anchor="middle">Student</text></svg>
```

---

## 2. 弱实体（Weak Entity）

**描述**：表示依赖于其他实体才能存在的实体，不能独立标识。双边矩形强调其依赖性和弱标识特征。

### 缩略 SVG（侧边栏）
```svg
<svg width="48" height="32" viewBox="0 0 48 32" xmlns="http://www.w3.org/2000/svg"><rect x="2" y="2" width="44" height="28" fill="#f8fafc" stroke="#334155" stroke-width="2"/><rect x="5" y="5" width="38" height="22" fill="none" stroke="#334155" stroke-width="1.5"/></svg>
```

### 实际渲染 SVG（画布）
```svg
<svg width="160" height="70" viewBox="0 0 160 70" xmlns="http://www.w3.org/2000/svg"><rect x="5" y="5" width="150" height="60" fill="#f8fafc" stroke="#334155" stroke-width="2"/><rect x="10" y="10" width="140" height="50" fill="none" stroke="#334155" stroke-width="1.5"/><text x="80" y="42" font-family="system-ui, -apple-system, sans-serif" font-size="16" font-weight="500" fill="#1e293b" text-anchor="middle">Dependent</text></svg>
```

---

## 3. 属性（Attribute）

**描述**：表示实体的特征或性质，如「姓名」、「年龄」。椭圆形象征属性的可选性和可变性。

### 缩略 SVG（侧边栏）
```svg
<svg width="48" height="32" viewBox="0 0 48 32" xmlns="http://www.w3.org/2000/svg"><ellipse cx="24" cy="16" rx="20" ry="12" fill="#f8fafc" stroke="#334155" stroke-width="2"/></svg>
```

### 实际渲染 SVG（画布）
```svg
<svg width="160" height="70" viewBox="0 0 160 70" xmlns="http://www.w3.org/2000/svg"><ellipse cx="80" cy="35" rx="70" ry="25" fill="#f8fafc" stroke="#334155" stroke-width="2"/><text x="80" y="42" font-family="system-ui, -apple-system, sans-serif" font-size="16" font-weight="500" fill="#1e293b" text-anchor="middle">Name</text></svg>
```

---

## 4. 多值属性（Multi-valued Attribute）

**描述**：表示可以取多个值的属性，如「电话号码」、「地址」。双椭圆表示该属性有多个值实例。

### 缩略 SVG（侧边栏）
```svg
<svg width="48" height="32" viewBox="0 0 48 32" xmlns="http://www.w3.org/2000/svg"><ellipse cx="24" cy="16" rx="20" ry="12" fill="#f8fafc" stroke="#334155" stroke-width="2"/><ellipse cx="24" cy="16" rx="16" ry="9" fill="none" stroke="#334155" stroke-width="1.5"/></svg>
```

### 实际渲染 SVG（画布）
```svg
<svg width="160" height="70" viewBox="0 0 160 70" xmlns="http://www.w3.org/2000/svg"><ellipse cx="80" cy="35" rx="70" ry="25" fill="#f8fafc" stroke="#334155" stroke-width="2"/><ellipse cx="80" cy="35" rx="60" ry="18" fill="none" stroke="#334155" stroke-width="1.5"/><text x="80" y="42" font-family="system-ui, -apple-system, sans-serif" font-size="16" font-weight="500" fill="#1e293b" text-anchor="middle">Phones</text></svg>
```

---

## 5. 派生属性（Derived Attribute）

**描述**：表示可以从其他属性计算得出的属性，如「年龄」可由出生日期推导。虚线椭圆表示其派生性质。

### 缩略 SVG（侧边栏）
```svg
<svg width="48" height="32" viewBox="0 0 48 32" xmlns="http://www.w3.org/2000/svg"><ellipse cx="24" cy="16" rx="20" ry="12" fill="#f8fafc" stroke="#334155" stroke-width="2" stroke-dasharray="4 2"/></svg>
```

### 实际渲染 SVG（画布）
```svg
<svg width="160" height="70" viewBox="0 0 160 70" xmlns="http://www.w3.org/2000/svg"><ellipse cx="80" cy="35" rx="70" ry="25" fill="#f8fafc" stroke="#334155" stroke-width="2" stroke-dasharray="6 3"/><text x="80" y="42" font-family="system-ui, -apple-system, sans-serif" font-size="16" font-weight="500" fill="#1e293b" text-anchor="middle">Age</text></svg>
```

---

## 6. 主键属性（Key Attribute）

**描述**：表示能唯一标识实体的属性，如「学号」、「身份证号」。下划线强调其唯一标识作用。

### 缩略 SVG（侧边栏）
```svg
<svg width="48" height="36" viewBox="0 0 48 36" xmlns="http://www.w3.org/2000/svg"><ellipse cx="24" cy="14" rx="20" ry="10" fill="#f8fafc" stroke="#334155" stroke-width="2"/><line x1="8" y1="28" x2="40" y2="28" stroke="#334155" stroke-width="2"/></svg>
```

### 实际渲染 SVG（画布）
```svg
<svg width="160" height="80" viewBox="0 0 160 80" xmlns="http://www.w3.org/2000/svg"><ellipse cx="80" cy="30" rx="70" ry="20" fill="#f8fafc" stroke="#334155" stroke-width="2"/><line x1="20" y1="55" x2="140" y2="55" stroke="#334155" stroke-width="2"/><text x="80" y="36" font-family="system-ui, -apple-system, sans-serif" font-size="16" font-weight="500" fill="#1e293b" text-anchor="middle">ID</text></svg>
```

---

## 7. 关系（Relationship）

**描述**：表示实体之间的关联，如「选修」、「属于」。菱形是ER图中关系的标准符号。

### 缩略 SVG（侧边栏）
```svg
<svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"><polygon points="20,4 36,20 20,36 4,20" fill="#f8fafc" stroke="#334155" stroke-width="2"/></svg>
```

### 实际渲染 SVG（画布）
```svg
<svg width="120" height="120" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg"><polygon points="60,10 110,60 60,110 10,60" fill="#f8fafc" stroke="#334155" stroke-width="2"/><text x="60" y="65" font-family="system-ui, -apple-system, sans-serif" font-size="14" font-weight="500" fill="#1e293b" text-anchor="middle">Enrolls</text></svg>
```

---

## 8. 弱关系（Identifying Relationship）

**描述**：表示弱实体与其所依赖实体之间的关系。双边菱形强调该关系用于标识弱实体。

### 缩略 SVG（侧边栏）
```svg
<svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"><polygon points="20,4 36,20 20,36 4,20" fill="#f8fafc" stroke="#334155" stroke-width="2"/><polygon points="20,10 30,20 20,30 10,20" fill="none" stroke="#334155" stroke-width="1.5"/></svg>
```

### 实际渲染 SVG（画布）
```svg
<svg width="120" height="120" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg"><polygon points="60,10 110,60 60,110 10,60" fill="#f8fafc" stroke="#334155" stroke-width="2"/><polygon points="60,25 85,60 60,95 35,60" fill="none" stroke="#334155" stroke-width="1.5"/><text x="60" y="65" font-family="system-ui, -apple-system, sans-serif" font-size="14" font-weight="500" fill="#1e293b" text-anchor="middle">Depends</text></svg>
```

---

## 9. 关联实体（Associative Entity）

**描述**：表示具有自身属性的关系，需要同时作为实体和关系处理。矩形与菱形的组合符号。

### 缩略 SVG（侧边栏）
```svg
<svg width="48" height="44" viewBox="0 0 48 44" xmlns="http://www.w3.org/2000/svg"><polygon points="24,4 38,18 24,32 10,18" fill="#f8fafc" stroke="#334155" stroke-width="2"/><rect x="6" y="32" width="36" height="12" rx="2" ry="2" fill="#f8fafc" stroke="#334155" stroke-width="2"/></svg>
```

### 实际渲染 SVG（画布）
```svg
<svg width="160" height="100" viewBox="0 0 160 100" xmlns="http://www.w3.org/2000/svg"><polygon points="80,5 120,45 80,85 40,45" fill="#f8fafc" stroke="#334155" stroke-width="2"/><rect x="25" y="85" width="110" height="15" rx="2" ry="2" fill="#f8fafc" stroke="#334155" stroke-width="2"/><text x="80" y="52" font-family="system-ui, -apple-system, sans-serif" font-size="16" font-weight="500" fill="#1e293b" text-anchor="middle">Enrollment</text></svg>
```

---

## 10. 注释（Annotation）

**描述**：用于添加说明性文字，解释实体、属性或关系的业务含义。虚线边框表示非数据节点。

### 缩略 SVG（侧边栏）
```svg
<svg width="48" height="32" viewBox="0 0 48 32" xmlns="http://www.w3.org/2000/svg"><rect x="2" y="2" width="44" height="28" rx="4" ry="4" fill="#f8fafc" stroke="#334155" stroke-width="2" stroke-dasharray="4 2"/></svg>
```

### 实际渲染 SVG（画布）
```svg
<svg width="160" height="70" viewBox="0 0 160 70" xmlns="http://www.w3.org/2000/svg"><rect x="5" y="5" width="150" height="60" rx="8" ry="8" fill="#f8fafc" stroke="#334155" stroke-width="2" stroke-dasharray="6 3"/><text x="80" y="42" font-family="system-ui, -apple-system, sans-serif" font-size="16" font-weight="500" fill="#1e293b" text-anchor="middle">Note</text></svg>
```

---

## 汇总速查表

| 序号 | 节点名称 | 英文名称 | 缩略尺寸 | 渲染尺寸 | 核心用途 |
|------|----------|----------|----------|----------|----------|
| 1 | 实体 | Entity | 48×32 | 160×70 | 表示具有独立存在意义的对象或概念，如「学生」、「课程」。 |
| 2 | 弱实体 | Weak Entity | 48×32 | 160×70 | 表示依赖于其他实体才能存在的实体，不能独立标识。 |
| 3 | 属性 | Attribute | 48×32 | 160×70 | 表示实体的特征或性质，如「姓名」、「年龄」。 |
| 4 | 多值属性 | Multi-valued Attribute | 48×32 | 160×70 | 表示可以取多个值的属性，如「电话号码」、「地址」。 |
| 5 | 派生属性 | Derived Attribute | 48×32 | 160×70 | 表示可以从其他属性计算得出的属性，如「年龄」可由出生日期推导。 |
| 6 | 主键属性 | Key Attribute | 48×36 | 160×80 | 表示能唯一标识实体的属性，如「学号」、「身份证号」。 |
| 7 | 关系 | Relationship | 40×40 | 120×120 | 表示实体之间的关联，如「选修」、「属于」。 |
| 8 | 弱关系 | Identifying Relationship | 40×40 | 120×120 | 表示弱实体与其所依赖实体之间的关系。 |
| 9 | 关联实体 | Associative Entity | 48×44 | 160×100 | 表示具有自身属性的关系，需要同时作为实体和关系处理。 |
| 10 | 注释 | Annotation | 48×32 | 160×70 | 用于添加说明性文字，解释实体、属性或关系的业务含义。 |
