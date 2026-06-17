import type { Node } from '@antv/x6'
import { polygonPorts } from '../ports/ports'
import { LABEL_FILL } from '../theme'

const refPoints = '0.03125,0.071429 0.875,0.071429 0.96875,0.5 0.875,0.928571 0.03125,0.928571'

export const flowchartOffPage: Node.Config = {
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
  ports: polygonPorts(5, { stroke: '#334155' }, refPoints),
}
