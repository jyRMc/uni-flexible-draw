import type { Node } from '@antv/x6'
import { documentPorts } from '../ports/ports'
import { LABEL_FILL } from '../theme'

export const flowchartDocument: Node.Config = {
  inherit: 'path',
  width: 160,
  height: 90,
  markup: [
    { tagName: 'path', selector: 'body' },
    { tagName: 'path', selector: 'fold' },
    { tagName: 'text', selector: 'label' },
  ],
  attrs: {
    body: {
      refD: 'M 0.0625 0.111111 L 0.6875 0.111111 L 0.9375 0.555556 L 0.9375 0.888889 L 0.0625 0.888889 Z',
      fill: '#f8fafc',
      stroke: '#334155',
      strokeWidth: 2,
      strokeLinejoin: 'round',
    },
    fold: {
      refD: 'M 0.6875 0.111111 L 0.6875 0.555556 L 0.9375 0.555556',
      fill: 'none',
      stroke: '#334155',
      strokeWidth: 2,
      strokeLinejoin: 'round',
    },
    label: {
      fill: LABEL_FILL,
      fontSize: 14,
      refX: 0.5,
      refY: 0.55,
      textAnchor: 'middle',
      textVerticalAnchor: 'middle',
    },
  },
  ports: documentPorts({ stroke: '#334155' }),
}
