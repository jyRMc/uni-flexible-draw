import type { Node } from '@antv/x6'
import { diamondPorts } from '../ports/ports'
import { PRIMARY_COLOR } from '../theme'

export const basicDiamond: Node.Config = {
  inherit: 'polygon',
  width: 80,
  height: 60,
  attrs: {
    body: {
      refPoints: '0.5,0 1,0.5 0.5,1 0,0.5',
      fill: '#ffffff',
      stroke: PRIMARY_COLOR,
      strokeWidth: 2,
    },
    label: {
      fill: '#333333',
      fontSize: 14,
    },
  },
  ports: diamondPorts({ stroke: PRIMARY_COLOR }),
}
