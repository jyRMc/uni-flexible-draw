import type { Node } from '@antv/x6'
import { polygonPorts } from '../ports/ports'
import { LABEL_FILL } from '../theme'

const refPoints = '0.5,0.1 0.916667,0.9 0.083333,0.9'

export const flowchartSort: Node.Config = {
  inherit: 'polygon',
  width: 120,
  height: 100,
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
  ports: polygonPorts(3, { stroke: '#334155' }, refPoints),
}
