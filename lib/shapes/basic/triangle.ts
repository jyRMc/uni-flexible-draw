import type { Node } from '@antv/x6'
import { trianglePorts } from '../ports/ports'
import { PRIMARY_COLOR } from '../theme'

export const basicTriangle: Node.Config = {
  inherit: 'polygon',
  width: 80,
  height: 70,
  attrs: {
    body: {
      refPoints: '0.5,0 1,1 0,1',
      fill: '#ffffff',
      stroke: PRIMARY_COLOR,
      strokeWidth: 2,
    },
    label: {
      fill: '#333333',
      fontSize: 14,
    },
  },
  ports: trianglePorts({ stroke: PRIMARY_COLOR }),
}
