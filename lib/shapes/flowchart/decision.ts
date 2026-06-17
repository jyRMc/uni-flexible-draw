import type { Node } from '@antv/x6'
import { polygonPorts } from '../ports/ports'
import { LABEL_FILL } from '../theme'

export const flowchartDecision: Node.Config = {
  inherit: 'polygon',
  width: 120,
  height: 120,
  attrs: {
    body: {
      refPoints: '0.5,0.1 0.9,0.5 0.5,0.9 0.1,0.5',
      fill: '#f8fafc',
      stroke: '#334155',
      strokeWidth: 2,
    },
    label: {
      fill: LABEL_FILL,
      fontSize: 14,
    },
  },
  ports: polygonPorts(4, { stroke: '#334155' }, '0.5,0.1 0.9,0.5 0.5,0.9 0.1,0.5'),
}
