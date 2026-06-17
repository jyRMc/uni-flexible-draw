import type { Node } from '@antv/x6'
import { polygonPorts } from '../ports/ports'
import { LABEL_FILL } from '../theme'

const refPoints = '0.1875,0.071429 0.96875,0.071429 0.84375,0.928571 0.0625,0.928571'

export const flowchartInputOutput: Node.Config = {
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
      fill: LABEL_FILL,
      fontSize: 14,
    },
  },
  ports: polygonPorts(4, { stroke: '#334155' }, refPoints),
}
