import type { Node } from '@antv/x6'
import { polygonPorts } from '../ports/ports'
import { PRIMARY_COLOR } from '../theme'

export const basicHexagon: Node.Config = {
  inherit: 'polygon',
  width: 80,
  height: 70,
  attrs: {
    body: {
      refPoints: '0.5,0 1,0.25 1,0.75 0.5,1 0,0.75 0,0.25',
      fill: '#ffffff',
      stroke: PRIMARY_COLOR,
      strokeWidth: 2,
    },
    label: {
      fill: '#333333',
      fontSize: 14,
    },
  },
  ports: polygonPorts(6, { stroke: PRIMARY_COLOR }, '0.5,0 1,0.25 1,0.75 0.5,1 0,0.75 0,0.25'),
}
