import type { Node } from '@antv/x6'
import { basicDocumentPorts } from '../ports/ports'
import { PRIMARY_COLOR } from '../theme'

export const basicDocument: Node.Config = {
  inherit: 'path',
  width: 100,
  height: 140,
  markup: [
    { tagName: 'path', selector: 'body' },
    { tagName: 'text', selector: 'label' },
  ],
  attrs: {
    body: {
      refD: 'M 0.1 0.95 L 0.1 0.15 Q 0.1 0.1 0.15 0.1 L 0.6 0.1 L 0.9 0.288 L 0.9 0.95 Q 0.9 1 0.85 1 L 0.15 1 Q 0.1 1 0.1 0.95 Z M 0.9 0.288 L 0.6 0.288 L 0.6 0.1',
      fill: '#ffffff',
      stroke: PRIMARY_COLOR,
      strokeWidth: 2,
    },
    label: {
      fill: '#333333',
      fontSize: 14,
      refX: 0.5,
      refY: 0.42,
      textAnchor: 'middle',
      textVerticalAnchor: 'middle',
    },
  },
  ports: basicDocumentPorts({ stroke: PRIMARY_COLOR }),
}
