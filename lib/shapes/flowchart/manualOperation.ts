import type { Node } from '@antv/x6'
import { polygonPorts } from '../ports/ports'

const refPoints = '0.03125,0.071429 0.96875,0.071429 0.84375,0.928571 0.15625,0.928571'

export const flowchartManualOperation: Node.Config = {
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
  ports: polygonPorts(4, { stroke: '#334155' }, refPoints),
}
