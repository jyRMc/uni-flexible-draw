import type { Node } from '@antv/x6'

/**
 * Group 组合节点形状
 * 默认虚线边框、透明填充，用于包裹多个子节点
 */
export const basicGroup: Node.Config = {
  inherit: 'rect',
  width: 160,
  height: 120,
  droppable: true,
  attrs: {
    body: {
      fill: 'rgba(0,0,0,0.02)',
      stroke: '#d9d9d9',
      strokeWidth: 1,
      strokeDasharray: '4 4',
    },
  },
}
