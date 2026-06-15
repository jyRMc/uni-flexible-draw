import type { Node } from '@antv/x6'
import { diamondPorts } from '../ports/ports'

export const flowchartDecision: Node.Config = {
  inherit: 'polygon',
  width: 120,
  height: 120,
  attrs: {
    body: {
      refPoints: '0.5,0.083333 0.916667,0.5 0.5,0.916667 0.083333,0.5',
      fill: '#f8fafc',
      stroke: '#334155',
      strokeWidth: 2,
    },
    label: {
      fill: '#334155',
      fontSize: 14,
    },
  },
  ports: diamondPorts({ stroke: '#334155' }),
}
