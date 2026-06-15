import type { Node } from '@antv/x6'
import { polygonPorts } from '../ports/ports'

const refPoints
  = '0.03125,0.071429 0.84375,0.071429 0.9375,0.128846 0.976333,0.19704 1.00613,0.285714 1.03125,0.5 1.00613,0.714286 0.976333,0.80296 0.9375,0.871154 0.84375,0.928571 0.03125,0.928571'

export const flowchartStoredData: Node.Config = {
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
  ports: polygonPorts(11, { stroke: '#334155' }, refPoints),
}
