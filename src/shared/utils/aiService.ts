import type { GraphData } from '../types'

export interface AIConnectionConfig {
  model: string
  apiUrl: string
  apiKey: string
}

const SERVER_BASE_URL = (import.meta as { env?: Record<string, string | undefined> }).env?.VITE_UNIDRAW_SERVER ?? 'http://127.0.0.1:3077'

function getSystemPrompt(model: string): string {
  return `你是一个专业的图表生成助手，能够根据用户描述生成结构化的图表数据。

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
    "aiModel": "${model}"
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
- 基础图形：basic-rect（矩形）、basic-rounded-rect（圆角矩形）、basic-circle（圆形）、basic-diamond（菱形）、basic-triangle（三角形）、basic-parallelogram（平行四边形）、basic-trapezoid（梯形）、basic-hexagon（六边形）、basic-cylinder（圆柱/数据库）、basic-cloud（云）、basic-document（文档）、basic-table（表格）、basic-text（纯文本）
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
}

function assertConfig(config: AIConnectionConfig): asserts config is AIConnectionConfig {
  if (!config.model.trim())
    throw new Error('请先填写模型名称')
  if (!config.apiUrl.trim())
    throw new Error('请先填写 RestAPI 调用地址')
  if (!config.apiKey.trim())
    throw new Error('请先填写 API Key')
}

function extractJson(text: string): GraphData {
  const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/)
  if (codeBlockMatch) {
    return JSON.parse(codeBlockMatch[1].trim())
  }
  const start = text.indexOf('{')
  const end = text.lastIndexOf('}')
  if (start !== -1 && end !== -1) {
    return JSON.parse(text.slice(start, end + 1))
  }
  throw new Error('No JSON found in response')
}

export async function diagnoseAiConnection(config: AIConnectionConfig): Promise<string> {
  try {
    assertConfig(config)
    const response = await fetch(`${SERVER_BASE_URL}/api/ai/diagnose`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(config),
    })
    const payload = await response.json().catch(() => null) as { message?: string, status?: number } | null
    return `[${payload?.status ?? response.status}] ${payload?.message ?? response.statusText}`
  }
  catch (error) {
    return error instanceof Error ? error.message : String(error)
  }
}

export async function generateGraph(
  prompt: string,
  config: AIConnectionConfig,
  onToken?: (chunk: string, full: string) => void,
): Promise<GraphData> {
  assertConfig(config)

  const response = await fetch(`${SERVER_BASE_URL}/api/ai/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      apiUrl: config.apiUrl,
      apiKey: config.apiKey,
      model: config.model,
      messages: [
        { role: 'system', content: getSystemPrompt(config.model) },
        { role: 'user', content: prompt },
      ],
      temperature: 0.3,
      max_tokens: 4096,
      stream: true,
    }),
  })

  if (!response.ok) {
    const body = await response.text().catch(() => '')
    throw new Error(`[${response.status}] ${response.statusText}${body ? `: ${body}` : ''}`)
  }

  const reader = response.body?.getReader()
  if (!reader)
    throw new Error('No response body')

  const decoder = new TextDecoder()
  let fullContent = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done)
      break

    const chunk = decoder.decode(value, { stream: true })
    for (const line of chunk.split('\n')) {
      const trimmed = line.trim()
      if (!trimmed.startsWith('data:'))
        continue
      const data = trimmed.slice(5).trim()
      if (data === '[DONE]')
        continue
      try {
        const parsed = JSON.parse(data)
        const token: string = parsed.choices?.[0]?.delta?.content ?? ''
        if (token) {
          fullContent += token
          onToken?.(token, fullContent)
        }
      }
      catch {}
    }
  }

  if (!fullContent)
    throw new Error('Empty response from API')
  return extractJson(fullContent)
}
