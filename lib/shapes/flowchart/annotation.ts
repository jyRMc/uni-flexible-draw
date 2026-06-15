import type { Node } from '@antv/x6'
import { rectPorts } from '../ports/ports'

export const flowchartAnnotation: Node.Config = {
  inherit: 'rect',
  width: 160,
  height: 70,
  attrs: {
    body: {
      fill: '#f8fafc',
      stroke: '#334155',
      strokeWidth: 2,
      rx: 8,
      ry: 8,
      strokeDasharray: '6 3',
    },
    label: {
      fill: '#334155',
      fontSize: 14,
    },
  },
  ports: rectPorts({ stroke: '#334155' }),
}
