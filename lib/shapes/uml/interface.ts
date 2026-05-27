import type { Node } from '@antv/x6'

export const umlInterface: Node.Config = {
  inherit: 'rect',
  width: 160,
  height: 100,
  markup: [
    { tagName: 'rect', selector: 'body' },
    { tagName: 'text', selector: 'stereotype' },
    { tagName: 'rect', selector: 'divider' },
    { tagName: 'text', selector: 'label' },
  ],
  attrs: {
    body: {
      fill: '#ffffff',
      stroke: '#333333',
      strokeWidth: 1.5,
    },
    stereotype: {
      text: '«interface»',
      fill: '#666',
      fontSize: 10,
      refX: 0.5,
      refY: 0.15,
      textAnchor: 'middle',
      textVerticalAnchor: 'middle',
    },
    divider: {
      refX: 0,
      refY: 0.3,
      refWidth: 1,
      refHeight: 0.01,
      fill: '#333333',
      stroke: 'none',
    },
    label: {
      fill: '#333333',
      fontSize: 13,
      refX: 0.5,
      refY: 0.45,
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
