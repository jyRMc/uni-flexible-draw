import type { Node } from '@antv/x6'
import { polygonPorts } from '../ports/ports'
import { PRIMARY_COLOR } from '../theme'

export const basicParallelogram: Node.Config = {
  inherit: 'polygon',
  width: 100,
  height: 60,
  attrs: {
    body: {
      refPoints: '0.2,0 1,0 0.8,1 0,1',
      fill: '#ffffff',
      stroke: PRIMARY_COLOR,
      strokeWidth: 2,
    },
    label: {
      fill: '#333333',
      fontSize: 14,
    },
  },
  ports: polygonPorts(4, { stroke: PRIMARY_COLOR }, '0.2,0 1,0 0.8,1 0,1'),
}
