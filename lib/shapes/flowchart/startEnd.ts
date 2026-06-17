import type { Node } from '@antv/x6'
import { rectPorts } from '../ports/ports'
import { LABEL_FILL } from '../theme'

export const flowchartStartEnd: Node.Config = {
  inherit: 'rect',
  width: 160,
  height: 70,
  attrs: {
    body: {
      fill: '#f8fafc',
      stroke: '#334155',
      strokeWidth: 2,
      rx: 30,
      ry: 30,
    },
    label: {
      fill: LABEL_FILL,
      fontSize: 14,
    },
  },
  ports: rectPorts({ stroke: '#334155' }),
}
