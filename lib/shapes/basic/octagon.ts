import type { Node } from '@antv/x6'
import { polygonPorts } from '../ports/ports'
import { PRIMARY_COLOR } from '../theme'

export const basicOctagon: Node.Config = {
  inherit: 'polygon',
  width: 80,
  height: 70,
  attrs: {
    body: {
      refPoints: '0.3,0 0.7,0 1,0.3 1,0.7 0.7,1 0.3,1 0,0.7 0,0.3',
      fill: '#ffffff',
      stroke: PRIMARY_COLOR,
      strokeWidth: 2,
    },
    label: {
      fill: '#333333',
      fontSize: 14,
    },
  },
  ports: polygonPorts(8, { stroke: PRIMARY_COLOR }, '0.3,0 0.7,0 1,0.3 1,0.7 0.7,1 0.3,1 0,0.7 0,0.3'),
}
