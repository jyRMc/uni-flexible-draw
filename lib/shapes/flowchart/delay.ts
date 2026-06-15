import type { Node } from '@antv/x6'
import { polygonPorts } from '../ports/ports'

const refPoints
  = '0.3125,0.071429 0.96875,0.071429 0.96875,0.928571 0.3125,0.928571 0.21875,0.871154 0.15012,0.714286 0.125,0.5 0.15012,0.285714 0.21875,0.128846'

export const flowchartDelay: Node.Config = {
  inherit: 'polygon',
  width: 160,
  height: 70,
  attrs: {
    body: {
      refPoints,
      fill: '#f8fafc',
      stroke: '#334155',
      strokeWidth: 2,
    },
    label: {
      fill: '#334155',
      fontSize: 14,
    },
  },
  ports: polygonPorts(9, { stroke: '#334155' }, refPoints),
}
