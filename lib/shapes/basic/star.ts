import type { Node } from '@antv/x6'
import { PRIMARY_COLOR } from '@uni-draw/shared'
import { starPorts } from '../ports/ports'

export const basicStar: Node.Config = {
  inherit: 'polygon',
  width: 80,
  height: 70,
  attrs: {
    body: {
      refPoints: '0.5,0 0.62,0.38 1,0.38 0.69,0.62 0.81,1 0.5,0.75 0.19,1 0.31,0.62 0,0.38 0.38,0.38',
      fill: '#f0f5ff',
      stroke: PRIMARY_COLOR,
      strokeWidth: 2,
    },
    label: {
      fill: '#333333',
      fontSize: 14,
    },
  },
  ports: starPorts(5, { stroke: PRIMARY_COLOR }, '0.5,0 0.62,0.38 1,0.38 0.69,0.62 0.81,1 0.5,0.75 0.19,1 0.31,0.62 0,0.38 0.38,0.38'),
}
