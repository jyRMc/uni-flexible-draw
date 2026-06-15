/**
 * 基础边（X6 内置 'edge'）
 *
 * 视觉效果完全由 router + connector + marker + attrs 四个维度组合决定，
 * 不再为每种变体注册独立 shape。
 */
import { Graph } from '@antv/x6'
import { PRIMARY_COLOR } from '../theme'

// 注册带完整 defaultLabel 的 'edge' shape
export function registerEdgeShape() {
  Graph.registerEdge(
    'edge',
    {
      inherit: 'edge',
      defaultLabel: {
        markup: [
          {
            tagName: 'rect',
            selector: 'body',
          },
          {
            tagName: 'text',
            selector: 'label',
          },
        ],
        attrs: {
          label: {
            fill: '#333',
            fontSize: 12,
            textAnchor: 'middle' as const,
            textVerticalAnchor: 'middle' as const,
            pointerEvents: 'none',
          },
          body: {
            ref: 'label',
            fill: '#fff',
            stroke: '#d9d9d9',
            strokeWidth: 1,
            rx: 3,
            ry: 3,
            refWidth: '140%',
            refHeight: '140%',
            refX: '-20%',
            refY: '-20%',
          },
        },
        position: {
          distance: 0.5,
        },
      },
    },
    true,
  )
}

// X6 内置 'edge' shape 的默认 attrs 配置
export const edgeDefaults = {
  attrs: {
    line: {
      stroke: PRIMARY_COLOR,
      strokeWidth: 2,
      sourceMarker: null,
      targetMarker: null,
      strokeLinecap: 'round' as const,
      strokeLinejoin: 'round' as const,
    },
  },
}
