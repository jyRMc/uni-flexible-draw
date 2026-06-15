import type { Node } from '@antv/x6'

export const flowchartDocument: Node.Config = {
  inherit: 'path',
  width: 100,
  height: 70,
  markup: [
    { tagName: 'path', selector: 'body' },
    { tagName: 'text', selector: 'label' },
  ],
  attrs: {
    body: {
      refD: 'M 0 0 L 1 0 L 1 0.786 Q 0.75 1 0.5 0.786 Q 0.25 0.571 0 0.786 Z',
      fill: '#f6ffed',
      stroke: '#52c41a',
      strokeWidth: 2,
    },
    label: {
      fill: '#52c41a',
      fontSize: 14,
      refX: 0.5,
      refY: 0.42,
      textAnchor: 'middle',
      textVerticalAnchor: 'middle',
    },
  },
  ports: {
    groups: {
      top: { position: 'top', attrs: { circle: { r: 4, magnet: true, stroke: '#52c41a', fill: '#fff' } } },
      bottom: { position: 'bottom', attrs: { circle: { r: 4, magnet: true, stroke: '#52c41a', fill: '#fff' } } },
      left: { position: 'left', attrs: { circle: { r: 4, magnet: true, stroke: '#52c41a', fill: '#fff' } } },
      right: { position: 'right', attrs: { circle: { r: 4, magnet: true, stroke: '#52c41a', fill: '#fff' } } },
    },
    items: [
      { id: 'top', group: 'top' },
      { id: 'bottom', group: 'bottom' },
      { id: 'left', group: 'left' },
      { id: 'right', group: 'right' },
    ],
  },
}
