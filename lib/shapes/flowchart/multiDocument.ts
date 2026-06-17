import type { Node } from '@antv/x6'
import { multiDocumentPorts } from '../ports/ports'
import { LABEL_FILL } from '../theme'

export const flowchartMultiDocument: Node.Config = {
  inherit: 'path',
  width: 160,
  height: 100,
  markup: [
    { tagName: 'path', selector: 'back' },
    { tagName: 'path', selector: 'foldBack' },
    { tagName: 'path', selector: 'front' },
    { tagName: 'path', selector: 'foldFront' },
    { tagName: 'text', selector: 'label' },
  ],
  attrs: {
    back: {
      refD: 'M 0.03125 0.05 L 0.65625 0.05 L 0.84375 0.35 L 0.84375 0.75 L 0.03125 0.75 Z',
      fill: '#f8fafc',
      stroke: '#334155',
      strokeWidth: 2,
      strokeLinejoin: 'round',
    },
    foldBack: {
      refD: 'M 0.65625 0.05 L 0.65625 0.35 L 0.84375 0.35',
      fill: 'none',
      stroke: '#334155',
      strokeWidth: 2,
      strokeLinejoin: 'round',
    },
    front: {
      refD: 'M 0.125 0.2 L 0.75 0.2 L 0.9375 0.5 L 0.9375 0.9 L 0.125 0.9 Z',
      fill: '#f8fafc',
      stroke: '#334155',
      strokeWidth: 2,
      strokeLinejoin: 'round',
    },
    foldFront: {
      refD: 'M 0.75 0.2 L 0.75 0.5 L 0.9375 0.5',
      fill: 'none',
      stroke: '#334155',
      strokeWidth: 2,
      strokeLinejoin: 'round',
    },
    label: {
      fill: LABEL_FILL,
      fontSize: 14,
      refX: 0.5,
      refY: 0.6,
      textAnchor: 'middle',
      textVerticalAnchor: 'middle',
    },
  },
  ports: multiDocumentPorts({ stroke: '#334155' }),
}
