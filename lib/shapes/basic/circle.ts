import type { Node } from '@antv/x6'
import { ellipsePorts } from '../ports/ports'
import { PRIMARY_COLOR } from '../theme'

export const basicCircle: Node.Config = {
  inherit: 'ellipse',
  width: 60,
  height: 60,
  attrs: {
    body: {
      fill: '#ffffff',
      stroke: PRIMARY_COLOR,
      strokeWidth: 2,
    },
    label: {
      fill: '#333333',
      fontSize: 14,
    },
  },
  ports: ellipsePorts(8, { stroke: PRIMARY_COLOR }),
}
