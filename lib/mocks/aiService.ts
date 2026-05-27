import type { GraphData, NodeData } from '@uni-draw/draw'

// ==================== SiliconFlow API 配置 ====================

const SILICONFLOW_API_KEY = 'sk-vwasofdajhbkpljsbwpufupkbgophurncbjhvodqvvfdqahs'
// 通过 Vite dev proxy 转发，避免浏览器 CORS/认证问题
const SILICONFLOW_API_URL = '/ai-proxy/v1/chat/completions'
const SILICONFLOW_MODEL = 'deepseek-ai/DeepSeek-V3'

const SYSTEM_PROMPT = `你是一个专业的图表生成助手，能够根据用户描述生成结构化的图表数据。

你必须返回一个合法的 JSON 对象，格式如下：

\`\`\`json
{
  "canvas": {
    "backgroundColor": "#ffffff",
    "grid": { "size": 10, "visible": true, "type": "dot" },
    "zoom": 0.9,
    "offset": { "x": 40, "y": 30 }
  },
  "meta": {
    "title": "图表标题",
    "type": "flowchart",
    "aiGenerated": true,
    "aiModel": "deepseek-ai/DeepSeek-V3"
  },
  "nodes": [
    {
      "id": "唯一ID字符串",
      "shape": "图形类型",
      "position": { "x": 数字, "y": 数字 },
      "size": { "width": 数字, "height": 数字 },
      "label": "节点文字",
      "style": { "fill": "#ffffff", "stroke": "#7166F0", "strokeWidth": 2 }
    }
  ],
  "edges": [
    {
      "id": "边唯一ID",
      "shape": "edge-arrow",
      "source": "源节点ID",
      "target": "目标节点ID",
      "label": "边标签（可选）"
    }
  ]
}
\`\`\`

可用的节点 shape 类型：
- 基础图形：basic-rect（矩形）、basic-rounded-rect（圆角矩形）、basic-circle（圆形）、basic-diamond（菱形）、basic-triangle（三角形）、basic-parallelogram（平行四边形）、basic-trapezoid（梯形）、basic-hexagon（六边形）、basic-cylinder（圆柱/数据库）、basic-cloud（云）、basic-document（文档）、basic-text（纯文本）
- 流程图：flowchart-start-end（开始/结束）、flowchart-process（处理框）、flowchart-decision（判断菱形）、flowchart-input-output（输入/输出）、flowchart-document（文档）、flowchart-database（数据库）
- UML类图：uml-class、uml-interface、uml-abstract、uml-enum、uml-package、uml-note、uml-actor、uml-use-case、uml-component、uml-deployment
- ER图：er-entity、er-weak-entity、er-relationship、er-identifying-relationship、er-attribute、er-key-attribute
- 数据流图：dfd-process、dfd-data-store、dfd-external-entity
- 状态图：state-simple、state-initial、state-final

可用的边 shape 类型：
- edge-line（直线）、edge-dashed（虚线）、edge-arrow（单向箭头）、edge-double-arrow（双向箭头）、edge-curve（曲线）、edge-orthogonal（正交折线）

布局规范：
- 节点之间保持至少 20px 间距
- 层次结构中每层 y 轴间距约 100-140px
- 同层节点横向间距约 140-180px
- 节点默认大小：矩形 120×50、圆形 60×60、菱形 100×70、圆柱 100×70
- 所有 id 必须唯一，edge 的 source/target 必须引用已存在的节点 id

重要：只返回 JSON 代码块，不要有任何解释文字。`

/**
 * 从 AI 响应文本中提取 JSON 数据
 */
function extractJson(text: string): GraphData {
  // 先尝试提取 ```json ... ``` 代码块
  const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/)
  if (codeBlockMatch) {
    return JSON.parse(codeBlockMatch[1].trim())
  }
  // 再尝试找第一个 { 到最后一个 }
  const start = text.indexOf('{')
  const end = text.lastIndexOf('}')
  if (start !== -1 && end !== -1) {
    return JSON.parse(text.slice(start, end + 1))
  }
  throw new Error('No JSON found in response')
}

/**
 * 诊断 SiliconFlow 连通性（开发调试用）
 */
export async function diagnoseSiliconFlow(): Promise<string> {
  try {
    const r = await fetch('/ai-proxy/v1/models', {
      headers: { 'Authorization': `Bearer ${SILICONFLOW_API_KEY}` },
    })
    const body = await r.text()
    return `[${r.status}] ${body.slice(0, 300)}`
  }
  catch (e) {
    return `网络错误: ${e}`
  }
}

/**
 * 调用 SiliconFlow API 生成图表数据（流式）
 * @param prompt 用户提示词
 * @param onToken 每收到新 token 时回调（用于 UI 实时显示）
 */
export async function generateGraph(
  prompt: string,
  onToken?: (chunk: string, full: string) => void,
): Promise<GraphData> {
  const response = await fetch(SILICONFLOW_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SILICONFLOW_API_KEY}`,
    },
    body: JSON.stringify({
      model: SILICONFLOW_MODEL,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: prompt },
      ],
      temperature: 0.3,
      max_tokens: 4096,
      stream: true,
    }),
  })

  if (!response.ok) {
    const body = await response.text().catch(() => '')
    throw new Error(`[${response.status}] ${response.statusText}${body ? ': ' + body : ''}`)
  }

  const reader = response.body?.getReader()
  if (!reader) throw new Error('No response body')

  const decoder = new TextDecoder()
  let fullContent = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    const chunk = decoder.decode(value, { stream: true })
    // SSE 每行格式: "data: {...}" 或 "data: [DONE]"
    for (const line of chunk.split('\n')) {
      const trimmed = line.trim()
      if (!trimmed.startsWith('data:')) continue
      const data = trimmed.slice(5).trim()
      if (data === '[DONE]') continue
      try {
        const parsed = JSON.parse(data)
        const token: string = parsed.choices?.[0]?.delta?.content ?? ''
        if (token) {
          fullContent += token
          onToken?.(token, fullContent)
        }
      }
      catch { /* 忽略非 JSON 行 */ }
    }
  }

  if (!fullContent) throw new Error('Empty response from API')
  return extractJson(fullContent)
}

export function mockSpringBootArchitecture(): GraphData {
  return {
    canvas: {
      backgroundColor: '#ffffff',
      grid: { size: 10, visible: true, type: 'dot' },
      zoom: 0.7,
      offset: { x: 60, y: 30 },
    },
    meta: {
      title: 'Spring Boot 微服务架构图',
      type: 'custom',
      aiGenerated: true,
      aiModel: 'DeepSeek-R1',
      prompt: '绘制一个 Spring Boot 微服务架构图',
    },
    nodes: [
      // Layer 1 - 客户端层
      { id: 'web', shape: 'basic-rect', position: { x: 80, y: 60 }, size: { width: 110, height: 50 }, label: 'Web浏览器', data: { layer: '客户端层' } },
      { id: 'mobile', shape: 'basic-rect', position: { x: 230, y: 60 }, size: { width: 110, height: 50 }, label: '移动App', data: { layer: '客户端层' } },
      { id: 'miniapp', shape: 'basic-rect', position: { x: 380, y: 60 }, size: { width: 110, height: 50 }, label: '小程序', data: { layer: '客户端层' } },
      { id: 'thirdparty', shape: 'basic-rect', position: { x: 530, y: 60 }, size: { width: 110, height: 50 }, label: '第三方系统', data: { layer: '客户端层' } },
      // Layer 2 - API 网关层
      { id: 'gateway', shape: 'flowchart-process', position: { x: 270, y: 160 }, size: { width: 180, height: 60 }, label: 'Spring Cloud Gateway', data: { layer: 'API网关层' } },
      // Layer 3 - 服务治理
      { id: 'nacos', shape: 'flowchart-process', position: { x: 180, y: 280 }, size: { width: 130, height: 55 }, label: 'Nacos 注册中心', data: { layer: '服务治理' } },
      { id: 'config', shape: 'flowchart-process', position: { x: 370, y: 280 }, size: { width: 130, height: 55 }, label: 'Config 配置中心', data: { layer: '服务治理' } },
      // Layer 4 - 微服务层
      { id: 'user-svc', shape: 'flowchart-process', position: { x: 60, y: 410 }, size: { width: 110, height: 55 }, label: '用户服务', data: { layer: '微服务层' } },
      { id: 'order-svc', shape: 'flowchart-process', position: { x: 210, y: 410 }, size: { width: 110, height: 55 }, label: '订单服务', data: { layer: '微服务层' } },
      { id: 'product-svc', shape: 'flowchart-process', position: { x: 360, y: 410 }, size: { width: 110, height: 55 }, label: '产品服务', data: { layer: '微服务层' } },
      { id: 'payment-svc', shape: 'flowchart-process', position: { x: 510, y: 410 }, size: { width: 110, height: 55 }, label: '支付服务', data: { layer: '微服务层' } },
      // Layer 5 - 中间件层
      { id: 'mysql', shape: 'basic-cylinder', position: { x: 100, y: 540 }, size: { width: 110, height: 70 }, label: 'MySQL', data: { layer: '中间件层' } },
      { id: 'redis', shape: 'basic-cylinder', position: { x: 260, y: 540 }, size: { width: 110, height: 70 }, label: 'Redis', data: { layer: '中间件层' } },
      { id: 'rabbitmq', shape: 'basic-cylinder', position: { x: 420, y: 540 }, size: { width: 110, height: 70 }, label: 'RabbitMQ', data: { layer: '中间件层' } },
      // Layer 6 - 监控告警
      { id: 'prometheus', shape: 'basic-rect', position: { x: 30, y: 680 }, size: { width: 110, height: 50 }, label: 'Prometheus', data: { layer: '监控告警' } },
      { id: 'grafana', shape: 'basic-rect', position: { x: 200, y: 680 }, size: { width: 110, height: 50 }, label: 'Grafana', data: { layer: '监控告警' } },
      { id: 'skywalking', shape: 'basic-rect', position: { x: 370, y: 680 }, size: { width: 110, height: 50 }, label: 'SkyWalking', data: { layer: '监控告警' } },
    ],
    edges: [
      // Clients → Gateway
      { id: 'e-web-gw', shape: 'edge-arrow', source: 'web', target: 'gateway' },
      { id: 'e-mobile-gw', shape: 'edge-arrow', source: 'mobile', target: 'gateway' },
      { id: 'e-mp-gw', shape: 'edge-arrow', source: 'miniapp', target: 'gateway' },
      { id: 'e-tp-gw', shape: 'edge-arrow', source: 'thirdparty', target: 'gateway' },
      // Gateway → Nacos/Config
      { id: 'e-gw-nacos', shape: 'edge-arrow', source: 'gateway', target: 'nacos' },
      { id: 'e-gw-config', shape: 'edge-arrow', source: 'gateway', target: 'config' },
      // Nacos/Config → Microservices
      { id: 'e-nacos-user', shape: 'edge-dashed', source: 'nacos', target: 'user-svc' },
      { id: 'e-nacos-order', shape: 'edge-dashed', source: 'nacos', target: 'order-svc' },
      { id: 'e-nacos-product', shape: 'edge-dashed', source: 'nacos', target: 'product-svc' },
      { id: 'e-nacos-payment', shape: 'edge-dashed', source: 'nacos', target: 'payment-svc' },
      // Microservices → Middleware
      { id: 'e-user-mysql', shape: 'edge-arrow', source: 'user-svc', target: 'mysql' },
      { id: 'e-order-redis', shape: 'edge-arrow', source: 'order-svc', target: 'redis' },
      { id: 'e-payment-mq', shape: 'edge-arrow', source: 'payment-svc', target: 'rabbitmq' },
      { id: 'e-product-mysql', shape: 'edge-arrow', source: 'product-svc', target: 'mysql' },
      // Microservices → Monitoring
      { id: 'e-user-prom', shape: 'edge-dashed', source: 'user-svc', target: 'prometheus' },
      { id: 'e-order-graf', shape: 'edge-dashed', source: 'order-svc', target: 'grafana' },
      { id: 'e-payment-sky', shape: 'edge-dashed', source: 'payment-svc', target: 'skywalking' },
    ],
  }
}

export function mockAllShapesDemo(): GraphData {
  const nodes: NodeData[] = []
  const CELL_W = 160
  const CELL_H = 130
  const COLS = 8
  const SECTION_GAP = 50
  const START_X = 40
  let curY = 40
  let idx = 0

  function nid() { return `demo-${idx++}` }

  function addSection(
    title: string,
    shapes: Array<{ shape: string; label: string; w: number; h: number }>,
    cols = COLS,
    cellW = CELL_W,
    cellH = CELL_H,
  ) {
    nodes.push({
      id: nid(),
      shape: 'basic-text',
      position: { x: START_X, y: curY },
      size: { width: cellW * cols, height: 28 },
      label: title,
      style: { fill: '#1677ff', fontSize: 14, fontWeight: 'bold', stroke: 'none' },
    })
    curY += 38
    shapes.forEach((s, i) => {
      const col = i % cols
      const row = Math.floor(i / cols)
      nodes.push({
        id: nid(),
        shape: s.shape,
        position: {
          x: START_X + col * cellW + (cellW - s.w) / 2,
          y: curY + row * cellH + (cellH - s.h) / 2,
        },
        size: { width: s.w, height: s.h },
        label: s.label,
      })
    })
    curY += Math.ceil(shapes.length / cols) * cellH + SECTION_GAP
  }

  addSection('基础图形', [
    { shape: 'basic-rect',         label: '矩形',      w: 100, h: 60 },
    { shape: 'basic-rounded-rect', label: '圆角矩形',  w: 100, h: 60 },
    { shape: 'basic-circle',       label: '圆形',      w: 60,  h: 60 },
    { shape: 'basic-diamond',      label: '菱形',      w: 80,  h: 60 },
    { shape: 'basic-triangle',     label: '三角形',    w: 80,  h: 70 },
    { shape: 'basic-parallelogram',label: '平行四边形', w: 100, h: 60 },
    { shape: 'basic-trapezoid',    label: '梯形',      w: 100, h: 60 },
    { shape: 'basic-hexagon',      label: '六边形',    w: 80,  h: 70 },
    { shape: 'basic-pentagon',     label: '五边形',    w: 80,  h: 70 },
    { shape: 'basic-octagon',      label: '八边形',    w: 80,  h: 70 },
    { shape: 'basic-star',         label: '星形',      w: 80,  h: 70 },
    { shape: 'basic-cross',        label: '十字形',    w: 70,  h: 70 },
    { shape: 'basic-cylinder',     label: '圆柱',      w: 100, h: 70 },
    { shape: 'basic-cloud',        label: '云朵',      w: 120, h: 70 },
    { shape: 'basic-document',     label: '文档',      w: 100, h: 70 },
    { shape: 'basic-text',         label: '文本',      w: 100, h: 36 },
  ])

  addSection('流程图', [
    { shape: 'flowchart-start-end',       label: '开始/结束', w: 100, h: 50 },
    { shape: 'flowchart-process',         label: '处理',      w: 100, h: 60 },
    { shape: 'flowchart-decision',        label: '判断',      w: 80,  h: 60 },
    { shape: 'flowchart-input-output',    label: '输入输出',  w: 100, h: 60 },
    { shape: 'flowchart-document',        label: '文档',      w: 100, h: 70 },
    { shape: 'flowchart-database',        label: '数据库',    w: 100, h: 70 },
    { shape: 'flowchart-predefined',      label: '预定义',    w: 100, h: 60 },
    { shape: 'flowchart-internal-storage',label: '内部存储',  w: 100, h: 60 },
    { shape: 'flowchart-connector',       label: '',          w: 20,  h: 20 },
    { shape: 'flowchart-merge',           label: '',          w: 60,  h: 60 },
  ])

  addSection('类图 (UML)', [
    { shape: 'uml-class',         label: 'ClassName',   w: 140, h: 90  },
    { shape: 'uml-interface',     label: 'Interface',   w: 140, h: 100 },
    { shape: 'uml-abstract',      label: 'Abstract',    w: 140, h: 100 },
    { shape: 'uml-enum',          label: 'Enum',        w: 140, h: 100 },
    { shape: 'uml-object',        label: 'Object',      w: 140, h: 60  },
    { shape: 'uml-package',       label: 'Package',     w: 140, h: 100 },
    { shape: 'uml-note',          label: 'Note',        w: 140, h: 80  },
    { shape: 'uml-actor',         label: 'Actor',       w: 40,  h: 80  },
    { shape: 'uml-use-case',      label: 'UseCase',     w: 140, h: 60  },
    { shape: 'uml-component',     label: 'Component',   w: 140, h: 60  },
    { shape: 'uml-deployment',    label: 'Deployment',  w: 140, h: 80  },
    { shape: 'uml-collaboration', label: 'Collab',      w: 140, h: 70  },
    { shape: 'uml-composite',     label: 'Composite',   w: 140, h: 80  },
    { shape: 'uml-node',          label: 'Node3D',      w: 140, h: 80  },
    { shape: 'uml-artifact',      label: 'Artifact',    w: 120, h: 60  },
  ])

  addSection('实体关系图 (ER)', [
    { shape: 'er-entity',                 label: 'Entity',    w: 120, h: 50 },
    { shape: 'er-weak-entity',            label: 'WeakEntity',w: 120, h: 50 },
    { shape: 'er-relationship',           label: 'Rel',       w: 80,  h: 60 },
    { shape: 'er-identifying-relationship',label: 'IdRel',    w: 80,  h: 60 },
    { shape: 'er-attribute',              label: 'attr',      w: 80,  h: 40 },
    { shape: 'er-key-attribute',          label: 'key',       w: 80,  h: 40 },
    { shape: 'er-multivalued',            label: 'mval',      w: 80,  h: 40 },
    { shape: 'er-derived',               label: 'derived',   w: 80,  h: 40 },
    { shape: 'er-associative',            label: 'Assoc',     w: 100, h: 50 },
    { shape: 'er-total-participation',    label: 'Total',     w: 80,  h: 60 },
  ])

  addSection('数据流图 (DFD)', [
    { shape: 'dfd-process',          label: 'Process',   w: 80,  h: 80 },
    { shape: 'dfd-data-store',       label: 'DataStore', w: 120, h: 40 },
    { shape: 'dfd-external-entity',  label: 'Entity',    w: 120, h: 50 },
    { shape: 'dfd-multiple-process', label: 'MultiP',    w: 80,  h: 80 },
  ])

  addSection('状态图', [
    { shape: 'state-simple',          label: 'State',  w: 120, h: 50 },
    { shape: 'state-initial',         label: '',       w: 24,  h: 24 },
    { shape: 'state-final',           label: '',       w: 28,  h: 28 },
    { shape: 'state-shallow-history', label: '',       w: 32,  h: 32 },
    { shape: 'state-deep-history',    label: '',       w: 32,  h: 32 },
    { shape: 'state-junction',        label: '',       w: 16,  h: 16 },
    { shape: 'state-choice',          label: '',       w: 36,  h: 36 },
    { shape: 'state-fork',            label: '',       w: 80,  h: 8  },
    { shape: 'state-join',            label: '',       w: 80,  h: 8  },
    { shape: 'state-entry-point',     label: '',       w: 18,  h: 18 },
    { shape: 'state-exit-point',      label: '',       w: 18,  h: 18 },
    { shape: 'state-terminate',       label: '',       w: 24,  h: 24 },
    { shape: 'state-signal-send',     label: '',       w: 40,  h: 28 },
    { shape: 'state-signal-receive',  label: '',       w: 40,  h: 28 },
  ])

  addSection('时序图', [
    { shape: 'sequence-actor',             label: 'Actor',  w: 60,  h: 90  },
    { shape: 'sequence-lifeline',          label: 'Object', w: 120, h: 200 },
    { shape: 'sequence-activation',        label: '',       w: 16,  h: 60  },
    { shape: 'sequence-gateway',           label: '',       w: 40,  h: 40  },
    { shape: 'sequence-fragment-alt',      label: '',       w: 200, h: 150 },
    { shape: 'sequence-fragment-opt',      label: '',       w: 200, h: 130 },
    { shape: 'sequence-fragment-loop',     label: '',       w: 200, h: 130 },
    { shape: 'sequence-fragment-par',      label: '',       w: 200, h: 150 },
    { shape: 'sequence-fragment-critical', label: '',       w: 200, h: 130 },
  ], 4, 250, 260)

  addSection('泳道图', [
    { shape: 'swimlane-horizontal', label: 'Lane',  w: 300, h: 80  },
    { shape: 'swimlane-vertical',   label: 'Lane',  w: 120, h: 200 },
    { shape: 'swimlane-pool',       label: 'Pool',  w: 380, h: 200 },
    { shape: 'swimlane-phase',      label: 'Phase', w: 380, h: 40  },
  ], 2, 460, 260)

  return {
    meta: { title: '所有图形展示', type: 'demo' },
    canvas: {
      backgroundColor: '#f7f8fa',
      grid: { size: 10, visible: true, type: 'dot' },
      zoom: 0.7,
      offset: { x: 0, y: 0 },
    },
    nodes,
    edges: [],
  }
}

function mockSimpleFlowchart(): GraphData {
  return {
    canvas: {
      backgroundColor: '#ffffff',
      grid: { size: 10, visible: true, type: 'dot' },
      zoom: 1,
    },
    meta: {
      title: '简单流程图',
      type: 'flowchart',
      version: '0.0.1',
      aiGenerated: true,
    },
    nodes: [
      {
        id: 'start',
        shape: 'flowchart-start-end',
        position: { x: 200, y: 50 },
        size: { width: 100, height: 50 },
        label: '开始',
      },
      {
        id: 'process',
        shape: 'flowchart-process',
        position: { x: 200, y: 150 },
        size: { width: 100, height: 60 },
        label: '处理',
      },
      {
        id: 'decision',
        shape: 'flowchart-decision',
        position: { x: 200, y: 260 },
        size: { width: 100, height: 80 },
        label: '判断',
      },
      {
        id: 'end',
        shape: 'flowchart-start-end',
        position: { x: 200, y: 400 },
        size: { width: 100, height: 50 },
        label: '结束',
      },
    ],
    edges: [
      { id: 'e1', shape: 'edge-arrow', source: 'start', target: 'process' },
      { id: 'e2', shape: 'edge-arrow', source: 'process', target: 'decision' },
      { id: 'e3', shape: 'edge-arrow', source: 'decision', target: 'end', label: '是' },
    ],
  }
}
