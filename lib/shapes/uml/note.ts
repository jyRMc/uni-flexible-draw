import type { Node } from '@antv/x6'
import { polygonPorts } from '../ports/ports'

export const umlNote: Node.Config = {
  inherit: 'rect',
  width: 140,
  height: 80,
  markup: [
    { tagName: 'polygon', selector: 'body' },
    { tagName: 'text', selector: 'label' },
  ],
  attrs: {
    body: {
      fill: '#fffde7',
      stroke: '#333333',
      strokeWidth: 1.5,
      refPoints: '0,0 0.785714,0 1,0 1,1 0,1 0,0 0.785714,0 0.785714,0.25 1,0 0.785714,0.25 0.785714,0',
    },
    label: {
      fill: '#333333',
      fontSize: 12,
      refX: 0.5,
      refY: 0.5,
      textAnchor: 'middle',
      textVerticalAnchor: 'middle',
    },
  },
  ports: polygonPorts(6, { stroke: '#333' }, '0,0 0.785714,0 1,0 1,1 0,1 0.785714,0.25'),
}
