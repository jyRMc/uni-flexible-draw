import type { Node } from '@antv/x6'
import { storedDataPorts } from '../ports/ports'
import { LABEL_FILL } from '../theme'

export const flowchartStoredData: Node.Config = {
  inherit: 'polygon',
  width: 160,
  height: 70,
  attrs: {
    body: {
      refPoints: '0.03125,0.071429 0.84375,0.071429 0.915503,0.104051 0.976333,0.196954 1.016978,0.335993 1.03125,0.5 1.016978,0.664007 0.976333,0.803046 0.915503,0.895949 0.84375,0.928571 0.03125,0.928571',
      fill: '#f8fafc',
      stroke: '#334155',
      strokeWidth: 2,
    },
    label: {
      fill: LABEL_FILL,
      fontSize: 14,
    },
  },
  ports: storedDataPorts({ stroke: '#334155' }),
}
