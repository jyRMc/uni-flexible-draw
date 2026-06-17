import type { Node } from '@antv/x6'
import { PRIMARY_COLOR } from '@uni-draw/shared'
import { polygonPorts } from '../ports/ports'

export const basicCross: Node.Config = {
  inherit: 'polygon',
  width: 70,
  height: 70,
  attrs: {
    body: {
      refPoints: '0.35,0 0.65,0 0.65,0.35 1,0.35 1,0.65 0.65,0.65 0.65,1 0.35,1 0.35,0.65 0,0.65 0,0.35 0.35,0.35',
      fill: '#f0f5ff',
      stroke: PRIMARY_COLOR,
      strokeWidth: 2,
    },
    label: {
      fill: '#333333',
      fontSize: 14,
    },
  },
  ports: polygonPorts(12, { stroke: PRIMARY_COLOR }, '0.35,0 0.65,0 0.65,0.35 1,0.35 1,0.65 0.65,0.65 0.65,1 0.35,1 0.35,0.65 0,0.65 0,0.35 0.35,0.35'),
}
