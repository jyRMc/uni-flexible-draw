import type { Node } from '@antv/x6'

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
  ports: {
    groups: {
      top: { position: 'top', attrs: { circle: { r: 4, magnet: true, stroke: '#333', fill: '#fff' } } },
      bottom: { position: 'bottom', attrs: { circle: { r: 4, magnet: true, stroke: '#333', fill: '#fff' } } },
      left: { position: 'left', attrs: { circle: { r: 4, magnet: true, stroke: '#333', fill: '#fff' } } },
      right: { position: 'right', attrs: { circle: { r: 4, magnet: true, stroke: '#333', fill: '#fff' } } },
    },
    items: [
      { id: 'top', group: 'top' },
      { id: 'bottom', group: 'bottom' },
      { id: 'left', group: 'left' },
      { id: 'right', group: 'right' },
    ],
  },
}
