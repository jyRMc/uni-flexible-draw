import type { Node } from '@antv/x6'
import { ellipsePorts } from '../ports/ports'

export const umlUseCase: Node.Config = {
  inherit: 'ellipse',
  width: 140,
  height: 60,
  attrs: {
    body: {
      fill: '#fffde7',
      stroke: '#333333',
      strokeWidth: 1.5,
    },
    label: {
      fill: '#333333',
      fontSize: 12,
    },
  },
  ports: ellipsePorts(8, { stroke: '#333' }),
}
