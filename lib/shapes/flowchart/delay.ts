import type { Node } from '@antv/x6'
import { delayPorts } from '../ports/ports'
import { LABEL_FILL } from '../theme'

export const flowchartDelay: Node.Config = {
  inherit: 'polygon',
  width: 160,
  height: 70,
  attrs: {
    body: {
      refPoints: '0.3125,0.071429 0.96875,0.071429 0.96875,0.928571 0.3125,0.928571 0.21875,0.871157 0.150119,0.714286 0.125,0.5 0.150119,0.285714 0.21875,0.128843',
      fill: '#f8fafc',
      stroke: '#334155',
      strokeWidth: 2,
    },
    label: {
      fill: LABEL_FILL,
      fontSize: 14,
    },
  },
  ports: delayPorts({ stroke: '#334155' }),
}
