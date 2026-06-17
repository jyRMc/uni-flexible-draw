import type { Node } from '@antv/x6'
import { ellipsePorts } from '../ports/ports'

export const umlInitial: Node.Config = {
  inherit: 'circle',
  width: 30,
  height: 30,
  attrs: {
    body: {
      fill: '#333333',
      stroke: '#333333',
      strokeWidth: 1,
    },
  },
  ports: ellipsePorts(8, { stroke: '#333' }, 0.5, 0.5),
}
